import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createAnnouncement = async (req: Request, res: Response) => {
    try {
        const { title, logoUrl, tag, subscriptionType, description, backgroundImageUrl, buttonText, link } = req.body;

        const announcement = await prisma.announcement.create({
            data: {
                title,
                logoUrl,
                tag,
                subscriptionType,
                description,
                backgroundImageUrl,
                buttonText,
                link,
                active: true
            }
        });

        res.status(201).json(announcement);
    } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(500).json({ error: 'Failed to create announcement' });
    }
};

export const getAnnouncements = async (req: Request, res: Response) => {
    try {
        const announcements = await prisma.announcement.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch announcements' });
    }
};

export const getActiveAnnouncement = async (req: Request, res: Response) => {
    try {
        const announcement = await prisma.announcement.findFirst({
            where: { active: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(announcement);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch active announcement' });
    }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.announcement.delete({
            where: { id }
        });
        res.json({ message: 'Announcement deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete announcement' });
    }
};

export const toggleActive = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const announcement = await prisma.announcement.findUnique({ where: { id } });

        if (!announcement) {
            return res.status(404).json({ error: 'Announcement not found' });
        }

        const updated = await prisma.announcement.update({
            where: { id },
            data: { active: !announcement.active }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle active status' });
    }
};
