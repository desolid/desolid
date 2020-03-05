import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// A `main` function so that we can use async/await
async function main() {
    const user1 = await prisma.user.create({
        data: {
            email: 'alice@prisma.io',
            name: 'Alice',
            posts: {
                create: {
                    title: 'Watch the talks from Prisma Day 2019',
                    content: 'https://www.prisma.io/blog/z11sg6ipb3i1/',
                },
            },
        },
        include: {
            posts: true,
        },
    });
    console.log(user1);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.disconnect();
    });
