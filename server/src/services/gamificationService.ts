import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const awardTrophies = async (userId: string, amount: number, reason: string) => {
    try {
        // Update user trophies
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                trophies: { increment: amount }
            }
        });

        console.log(`Awarded ${amount} trophies to user ${userId} for ${reason}`);
        return user;
    } catch (error) {
        console.error('Error awarding trophies:', error);
        throw error;
    }
};

export const awardZions = async (userId: string, amount: number, reason: string) => {
    try {
        // Update user zions
        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: {
                    zions: { increment: amount }
                }
            }),
            prisma.zionHistory.create({
                data: {
                    userId,
                    amount,
                    reason
                }
            })
        ]);

        console.log(`Awarded ${amount} Zions to user ${userId} for ${reason}`);
        return amount;
    } catch (error) {
        console.error('Error awarding zions:', error);
        throw error;
    }
};

export const checkAndAwardBadges = async (userId: string, actionType: 'POST' | 'LIKE' | 'COMMENT' | 'LOGIN') => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                posts: true,
                comments: true,
                likes: true,
                badges: { include: { badge: true } }
            }
        });

        if (!user) return null;

        const newBadges: string[] = [];
        const awardedBadges: any[] = [];

        // Helper to award badge
        const awardBadge = async (badgeName: string) => {
            // Check if user already has this badge
            const hasBadge = user.badges.some(ub => ub.badge.name === badgeName);
            if (hasBadge) return;

            // Find badge in DB
            const badge = await prisma.badge.findFirst({ where: { name: badgeName } });
            if (!badge) {
                console.warn(`Badge ${badgeName} not found in DB`);
                return;
            }

            // Award badge
            await prisma.userBadge.create({
                data: {
                    userId,
                    badgeId: badge.id
                }
            });

            // Award trophies for the badge
            if (badge.trophies > 0) {
                await awardTrophies(userId, badge.trophies, `Badge: ${badgeName}`);
            }

            newBadges.push(badgeName);
            awardedBadges.push(badge);
        };

        // --- BADGE LOGIC ---

        // 1. Primeira Voz (First Post)
        if (actionType === 'POST' && user.posts.length === 1) {
            await awardBadge('Primeira Voz');
        }

        // 2. Criador de Conteúdo (5 Posts)
        if (actionType === 'POST' && user.posts.length === 5) {
            await awardBadge('Criador de Conteúdo');
        }

        // 3. Socialite (10 Comments)
        if (actionType === 'COMMENT' && user.comments.length === 10) {
            await awardBadge('Socialite');
        }

        // 4. Engajado (50 Likes given)
        if (actionType === 'LIKE' && user.likes.length === 50) {
            await awardBadge('Engajado');
        }

        // 5. Influenciador (50 Likes received) - This is harder to check efficiently here without aggregation, 
        // but for now let's check on login or specific triggers if needed. 
        // Or we can query aggregate here.
        if (actionType === 'LOGIN' || actionType === 'POST') {
            const totalLikesReceived = await prisma.post.aggregate({
                where: { userId },
                _sum: { likesCount: true }
            });

            if ((totalLikesReceived._sum.likesCount || 0) >= 50) {
                await awardBadge('Influenciador');
            }
        }

        return { newBadges, awardedBadges };

    } catch (error) {
        console.error('Error checking badges:', error);
        return { newBadges: [], awardedBadges: [] };
    }
};
