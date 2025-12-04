import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userModel from '../models/userModel';
import { AuthRequest } from '../types/middleware';
import { LoginRequest, RegisterRequest } from '@shared/types/auth';

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
        // 檢查使用者是否存在
        const user = await userModel.findUserByEmail(email);
        if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

        // 檢查密碼是否正確
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

        // 回傳 JWT
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
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
        res.json({ user: { id: user.id, email: user.email, role: user.role } });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error(err.message);
        }
        res.status(500).send('Server Error');
    }
};
