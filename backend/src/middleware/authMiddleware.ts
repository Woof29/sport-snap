import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types/middleware';

// 驗證 JWT token 的 middleware
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = verified;
        next();
    } catch (err) {
        res.status(403).json({ error: 'Invalid token.' });
    }
};

// 檢查使用者角色是否符合權限的 middleware
export const requireRole = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        // 1. 確保使用者已登入
        if (!req.user || !req.user.user) return res.status(401).json({ error: 'Unauthorized' });

        // 2. 取得使用者角色
        const userRole = req.user.user.role;

        // 3. 檢查使用者角色是否符合權限
        if (allowedRoles.includes(userRole)) return next(); // 符合權限，放行
        else return res.status(403).json({ error: `Access denied. Required role: ${allowedRoles.join(' or ')}` }); // 不符合權限，拒絕存取
    };
};
