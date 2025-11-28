import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@magazine.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash: hashedPassword,
        } as any,
        create: {
            email,
            name: 'Admin User',
            passwordHash: hashedPassword,
            role: Role.ADMIN,
            displayName: 'Admin',
            bio: 'System Administrator',
            points: 1000,
            trophies: 1000,
            level: 10,
        } as any,
    });

    console.log({ user });

    // Seed Badges
    const badges = [
        { name: 'Primeira Voz', description: 'Fez a primeira postagem', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3112/3112946.png', trophies: 100 },
        { name: 'Criador de Conteúdo', description: 'Fez 5 postagens', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3112/3112946.png', trophies: 200 },
        { name: 'Socialite', description: 'Fez 10 comentários', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3112/3112946.png', trophies: 50 },
        { name: 'Engajado', description: 'Deu 50 likes', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3112/3112946.png', trophies: 50 },
        { name: 'Influenciador', description: 'Recebeu 50 likes', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3112/3112946.png', trophies: 500 },
    ];

    for (const badge of badges) {
        // Check if badge exists by name
        const existing = await prisma.badge.findFirst({ where: { name: badge.name } });
        if (!existing) {
            await prisma.badge.create({
                data: {
                    name: badge.name,
                    description: badge.description,
                    iconUrl: badge.iconUrl,
                    trophies: badge.trophies
                }
            });
        }
    }
    console.log('Badges seeded');

    // Seed Rewards
    const rewards = [
        { title: 'Cupom 10% OFF', type: 'COUPON', costZions: 50, stock: 100, code: 'MAGAZINE10' },
        { title: 'Frete Grátis', type: 'COUPON', costZions: 30, stock: 50, code: 'FRETEFREE' },
        { title: 'Wallpaper Exclusivo', type: 'DIGITAL', costZions: 10, stock: 999, url: 'https://example.com/wallpaper.jpg' }
    ];

    for (const reward of rewards) {
        const existing = await prisma.reward.findFirst({ where: { title: reward.title } });
        if (!existing) {
            await prisma.reward.create({
                data: {
                    title: reward.title,
                    type: reward.type as any,
                    costZions: reward.costZions,
                    stock: reward.stock,
                    metadata: reward.code ? { code: reward.code } : { url: reward.url }
                }
            });
        }
    }
    console.log('Rewards seeded');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
