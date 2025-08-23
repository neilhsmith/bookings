import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')
  
  const testUserId = 'user_31KjHA3WTWtgz8paYhgxm4Ov79A'
  
  const posts = [
    {
      title: 'Welcome to My Blog',
      content: 'This is my first blog post. I\'m excited to share my thoughts and experiences here.\n\nStay tuned for more content!',
      userId: testUserId,
    },
    {
      title: 'Building with TanStack Start',
      content: 'TanStack Start is an amazing full-stack React framework. Here are some key features:\n\n- File-based routing\n- Server-side rendering\n- Built-in data fetching\n- TypeScript first',
      userId: testUserId,
    },
    {
      title: 'Database Integration',
      content: 'Adding Prisma and SQLite to a TanStack Start project is straightforward.\n\nThe type safety and developer experience is excellent.',
      userId: testUserId,
    },
  ]
  
  for (const post of posts) {
    const created = await prisma.post.create({ data: post })
    console.log(`Created post: ${created.title}`)
  }
  
  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })