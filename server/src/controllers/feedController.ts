import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authMiddleware';
import { awardTrophies, checkAndAwardBadges, awardZions } from '../services/gamificationService';

const prisma = new PrismaClient();

const createPostSchema = z.object({
    imageUrl: z.string().url(),
    caption: z.string().optional(),
});

const commentSchema = z.object({
    text: z.string().min(1),
});

export const getFeed = async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const posts = await prisma.post.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        avatarUrl: true,
                        trophies: true,
                    },
                },
                likes: {
                    where: { userId: req.user?.userId },
                    select: { userId: true },
                },
            },
        });

        const formattedPosts = posts.map((post) => ({
            ...post,
            isLiked: post.likes.length > 0,
            likes: undefined, // Remove raw likes array
        }));

        res.json(formattedPosts);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createPost = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { imageUrl, caption } = createPostSchema.parse(req.body);

        const post = await prisma.post.create({
            data: {
                userId,
                imageUrl,
                caption,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        avatarUrl: true,
                    },
                },
            },
        });

        // Award 1 Zion for posting
        await awardZions(userId, 1, 'Created a post');

        res.status(201).json(post);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: (error as any).errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const likePost = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const post = await prisma.post.findUnique({ where: { id } });
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const existingLike = await prisma.like.findUnique({
            where: {
                postId_userId: {
                    postId: id,
                    userId,
                },
            },
        });

        if (existingLike) {
            // Unlike
            await prisma.$transaction([
                prisma.like.delete({
                    where: { id: existingLike.id },
                }),
                prisma.post.update({
                    where: { id },
                    data: { likesCount: { decrement: 1 } },
                }),
            ]);
            return res.json({ message: 'Unliked', isLiked: false });
        } else {
            // Like
            const [like, updatedPost] = await prisma.$transaction([
                prisma.like.create({
                    data: {
                        postId: id,
                        userId,
                    },
                }),
                prisma.post.update({
                    where: { id },
                    data: { likesCount: { increment: 1 } },
                }),
            ]);

            // Create Notification if not self-like
            if (post.userId !== userId) {
                const actor = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { id: true, name: true, avatarUrl: true }
                });

                const notificationContent = JSON.stringify({
                    text: 'curtiu sua postagem.',
                    actor: {
                        id: actor?.id,
                        name: actor?.name || 'Alguém',
                        avatarUrl: actor?.avatarUrl
                    },
                    postId: id
                });

                await prisma.notification.create({
                    data: {
                        userId: post.userId,
                        type: 'LIKE',
                        content: notificationContent,
                    }
                });
            }

            // --- GAMIFICATION (Liker) ---
            // Check if user already received Zions for liking this specific post
            // We use the 'reason' field to store the postId to track uniqueness for this action
            const alreadyAwarded = await prisma.zionHistory.findFirst({
                where: {
                    userId,
                    reason: `Liked post ${id}`
                }
            });

            let zionsEarned = 0;
            if (!alreadyAwarded) {
                // Award 1 Zion for liking
                await awardZions(userId, 1, `Liked post ${id}`);
                zionsEarned = 1;
            }

            // Check Badges (Trophies awarded if badge earned)
            const badgeResult = await checkAndAwardBadges(userId, 'LIKE');

            return res.json({
                message: 'Liked',
                isLiked: true,
                newBadges: badgeResult?.newBadges || [],
                zionsEarned
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const commentPost = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { text } = commentSchema.parse(req.body);

        const post = await prisma.post.findUnique({ where: { id } });
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const [comment] = await prisma.$transaction([
            prisma.comment.create({
                data: {
                    postId: id,
                    userId,
                    text,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            displayName: true,
                            avatarUrl: true,
                            trophies: true,
                        },
                    },
                },
            }),
            prisma.post.update({
                where: { id },
                data: { commentsCount: { increment: 1 } },
            }),
        ]);

        // Create Notification if not self-comment
        if (post.userId !== userId) {
            const actor = await prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, name: true, avatarUrl: true }
            });

            const notificationContent = JSON.stringify({
                text: `comentou: "${text.substring(0, 20)}${text.length > 20 ? '...' : ''}"`,
                actor: {
                    id: actor?.id,
                    name: actor?.name || 'Alguém',
                    avatarUrl: actor?.avatarUrl
                },
                postId: id
            });

            await prisma.notification.create({
                data: {
                    userId: post.userId,
                    type: 'COMMENT',
                    content: notificationContent,
                }
            });
        }

        // --- GAMIFICATION ---
        // Award 2 Zions for commenting (to commenter)
        await awardZions(userId, 2, 'Commented on a post');

        // Award 20 XP to Post Owner (if not self-comment)
        if (post.userId !== userId) {
            await prisma.user.update({
                where: { id: post.userId },
                data: { xp: { increment: 20 } }
            });
        }

        // Check Badges
        const badgeResult = await checkAndAwardBadges(userId, 'COMMENT');

        res.status(201).json({
            ...comment,
            newBadges: badgeResult?.newBadges || [],
            zionsEarned: 2
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: (error as any).errors });
        }
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const likeStory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { storyUserId } = req.params; // The user who owns the story

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        if (userId === storyUserId) return res.status(400).json({ error: 'Cannot like own story' });

        const actor = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, avatarUrl: true }
        });

        const notificationContent = JSON.stringify({
            text: 'curtiu seu story.',
            actor: {
                id: actor?.id,
                name: actor?.name || 'Alguém',
                avatarUrl: actor?.avatarUrl
            },
            isStory: true
        });

        await prisma.notification.create({
            data: {
                userId: storyUserId,
                type: 'LIKE',
                content: notificationContent,
            }
        });

        res.json({ message: 'Story liked' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
