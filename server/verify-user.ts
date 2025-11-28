import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@magazine.com';
    const password = 'admin';

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.log('User not found');
        return;
    }

    console.log('User found:', user.email);
    const valid = await bcrypt.compare(password, user.passwordHash);
    console.log('Password valid:', valid);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
