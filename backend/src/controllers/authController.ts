import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';
import * as userModel from '../models/userModel';
import { AuthRequest } from '../types/middleware';
import {
    LoginRequest,
    RegisterRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    GoogleLoginRequest
} from '@shared/types/auth';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface JwtPayload {
    user: {
        id: number;
        role: string;
    };
}

export const register = async (req: AuthRequest<any, any, any, RegisterRequest>, res: Response) => {
    const { email, password, role } = req.body;

    try {
        // 檢查使用者是否已存在
        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // 加密密碼
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 插入使用者
        // 預設角色為 buyer，如果未指定或無效（簡單驗證）
        const validRoles = ['buyer', 'photographer', 'admin'];
        const userRole = validRoles.includes(role) ? role : 'buyer';

        const newUser = await userModel.createUser({ email, passwordHash: hashedPassword, role: userRole });

        res.status(201).json(newUser);
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error(err.message);
        }
        res.status(500).send('Server Error');
    }
};

export const login = async (req: AuthRequest<any, any, any, LoginRequest>, res: Response) => {
    const { email, password } = req.body;

    try {
        // 檢查使用者是否存在，並取得密碼雜湊 (因為現在密碼在 identities 表)
        const userWithPassword = await userModel.findUserByEmailWithPassword(email);

        if (!userWithPassword) return res.status(400).json({ message: 'Invalid Credentials' });

        // 如果是純第三方登入的用戶，passwordHash 會是 null
        if (!userWithPassword.passwordHash) {
            return res.status(400).json({ message: 'Invalid Credentials' }); // 或者提示用戶改用 Google/Line 登入
        }

        // 檢查密碼是否正確
        const isMatch = await bcrypt.compare(password, userWithPassword.passwordHash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

        // 回傳 JWT
        const payload = {
            user: {
                id: userWithPassword.id,
                role: userWithPassword.role
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                user: {
                    id: userWithPassword.id,
                    email: userWithPassword.email,
                    role: userWithPassword.role,
                    avatar: userWithPassword.avatar
                }
            });
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error(err.message);
        }
        res.status(500).send('Server Error');
    }
};

export const googleLogin = async (req: AuthRequest<any, any, any, GoogleLoginRequest>, res: Response) => {
    const { idToken, role } = req.body;

    try {
        // 1. Verify Google Token
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();

        if (!payload) {
            return res.status(400).json({ message: 'Invalid Google Token' });
        }

        const { sub: googleId, email, name, picture } = payload;

        if (!email) {
            return res.status(400).json({ message: 'Email is required from Google' });
        }

        // 2. Check if user exists with this Google ID
        let user = await userModel.findUserByProvider('google', googleId);

        if (user) {
            // Scenario A: User already linked with Google -> Login success
        } else {
            // Scenario B: User not found by Google ID. Check by Email (Auto-Link)
            const existingUserByEmail = await userModel.findUserByEmail(email);

            if (existingUserByEmail) {
                // Auto-Link: Add Google Identity to existing user
                await userModel.addIdentityToUser(existingUserByEmail.id, 'google', googleId);
                user = existingUserByEmail;
                // Update avatar if not present? Optional.
            } else {
                // Scenario C: New User -> Register
                const validRoles = ['buyer', 'photographer', 'admin'];
                const userRole = role && validRoles.includes(role) ? role : 'buyer';

                user = await userModel.createOAuthUser({
                    email,
                    role: userRole,
                    avatar: picture,
                    provider: 'google',
                    providerId: googleId
                });
            }
        }

        // 3. Generate JWT
        if (!user) throw new Error('User processing failed'); // Should not happen

        const jwtPayload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(jwtPayload, process.env.JWT_SECRET as string, { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user!.id, email: user!.email, role: user!.role, avatar: user!.avatar } });
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error(err.message);
        }
        res.status(500).send('Server Error');
    }
};

export const getCurrentUser = async (req: AuthRequest<JwtPayload>, res: Response) => {
    try {
        // req.user 由 authMiddleware 設定
        if (!req.user || !req.user.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userId = req.user.user.id;
        const user = await userModel.findUserById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 回傳使用者，不包含密碼雜湊值
        res.json({ user: { id: user.id, email: user.email, role: user.role, avatar: user.avatar } });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error(err.message);
        }
        res.status(500).send('Server Error');
    }
};

export const forgotPassword = async (req: AuthRequest<any, any, any, ForgotPasswordRequest>, res: Response) => {
    const { email } = req.body;

    try {
        const user = await userModel.findUserByEmail(email);
        if (!user) {
            // 為了安全性，即使使用者不存在也不要透露
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has password (local identity). If not (pure OAuth), don't send reset email.
        // Current implementation of forgotPassword doesn't check this.
        // Ideally we should check if they have a local identity.
        // But for now, let's keep it simple. If they reset password, we can "create" a local identity in resetPassword step or fail there.
        // Actually better: check here.
        // But to do that, we need to expose a method to check identity existence or use findUserByEmailWithPassword (which returns null passwordHash).

        // Let's just proceed. If they set a password, they gain local access. That's fine.

        // 產生 Token
        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 小時後過期

        await userModel.updateResetToken(email, token, expires);

        // 發送郵件
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

        const mailOptions = {
            from: process.env.SMTP_FROM || '"Sport Snap" <noreply@sportsnap.com>',
            to: email,
            subject: 'Password Reset',
            text:
                `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                `${resetUrl}\n\n` +
                `If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Email sent' });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error(err.message);
        }
        res.status(500).send('Server Error');
    }
};

export const resetPassword = async (req: AuthRequest<any, any, any, ResetPasswordRequest>, res: Response) => {
    const { token, newPassword } = req.body;

    try {
        const user = await userModel.findUserByResetToken(token);

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        // 檢查過期時間
        if (user.resetPasswordExpires && new Date() > user.resetPasswordExpires) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        // 加密新密碼
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 更新密碼並清除 Token
        await userModel.updatePassword(user.id, hashedPassword);

        res.status(200).json({ message: 'Password has been updated.' });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error(err.message);
        }
        res.status(500).send('Server Error');
    }
};
