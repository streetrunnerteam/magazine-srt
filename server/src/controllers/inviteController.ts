import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createRequest = async (req: Request, res: Response) => {
    try {
        const { name, email, instagram } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        const existingRequest = await prisma.inviteRequest.findUnique({
            where: { email }
        });

        if (existingRequest) {
            return res.status(400).json({ error: 'Request already exists for this email' });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        const request = await prisma.inviteRequest.create({
            data: { name, email, instagram }
        });

        // Notify all admins
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' }
        });

        if (admins.length > 0) {
            await prisma.notification.createMany({
                data: admins.map(admin => ({
                    userId: admin.id,
                    type: 'SYSTEM',
                    content: `Nova solicitação de convite: ${name} (${email})`,
                    read: false
                }))
            });
        }

        res.status(201).json(request);
    } catch (error) {
        console.error('Error creating invite request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getRequests = async (req: Request, res: Response) => {
    try {
        const requests = await prisma.inviteRequest.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    } catch (error) {
        console.error('Error fetching invite requests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

import bcrypt from 'bcryptjs';

// ... (existing imports)

export const approveRequest = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const request = await prisma.inviteRequest.findUnique({ where: { id } });

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (request.status !== 'PENDING') {
            return res.status(400).json({ error: 'Request is not pending' });
        }

        // Generate random password (8 characters)
        const generatedPassword = Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(generatedPassword, salt);

        const user = await prisma.user.create({
            data: {
                name: request.name,
                email: request.email,
                passwordHash: passwordHash,
                displayName: request.instagram || request.name,
                role: 'MEMBER'
            }
        });

        // Update request status
        await prisma.inviteRequest.update({
            where: { id },
            data: { status: 'APPROVED' }
        });

        res.json({
            message: 'Request approved and user created',
            user,
            generatedPassword // Send back to admin to share with user
        });
    } catch (error) {
        console.error('Error approving request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const rejectRequest = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.inviteRequest.update({
            where: { id },
            data: { status: 'REJECTED' }
        });
        res.json({ message: 'Request rejected' });
    } catch (error) {
        console.error('Error rejecting request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
