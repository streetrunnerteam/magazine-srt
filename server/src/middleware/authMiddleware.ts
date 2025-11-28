import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        (req as AuthRequest).user = user;
        next();
    });
};

export const authenticateTokenOptional = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next();
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        (req as AuthRequest).user = user;
        next();
    });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;
    if (!user || user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};
