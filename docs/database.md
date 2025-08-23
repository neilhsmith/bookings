# Database Documentation

This document provides comprehensive information about the database implementation in this TanStack React Start project using SQLite and Prisma.

## Table of Contents

1. [Overview](#overview)
2. [Database Configuration](#database-configuration)
3. [Schema Design](#schema-design)
4. [Database Client Setup](#database-client-setup)
5. [Server Functions and Data Access](#server-functions-and-data-access)
6. [Authentication Integration](#authentication-integration)
7. [Development Workflow](#development-workflow)
8. [Best Practices](#best-practices)
9. [Code Examples](#code-examples)

## Overview

This project uses **SQLite** as the database with **Prisma** as the ORM. The setup provides:

- Type-safe database operations
- User-isolated data access through Clerk authentication
- Development-friendly SQLite file storage
- Full CRUD operations for application data
- Seamless integration with TanStack Start server functions

### Key Technologies
- **Database**: SQLite (file: `dev.db`)
- **ORM**: Prisma (v6.14.0)
- **Client**: `@prisma/client`
- **Authentication**: Integrated with Clerk user sessions

## Database Configuration

### File Structure
```
/Users/neilsmith/Repos/bookings/
├── dev.db                       # SQLite database file (gitignored)
├── prisma/
│   ├── schema.prisma           # Database schema definition
│   ├── migrations/             # Database migrations
│   └── seed.ts                 # Seed script for development data
├── src/
│   ├── lib/
│   │   └── db.ts              # Prisma client configuration
│   └── utils/
│       └── posts.ts           # Server functions for data access
└── .env                       # Database connection string
```

### Environment Configuration
**Location:** `.env`
```env
DATABASE_URL="file:./dev.db"
```

### Prisma Configuration
**Location:** `prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

## Schema Design

### Current Models

#### Post Model
```prisma
model Post {
  id        String   @id @default(cuid())
  userId    String   // Clerk user ID
  title     String
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("posts")
}
```

**Generated TypeScript Type:**
```typescript
type Post = {
  id: string
  userId: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}
```

### Design Principles
- **User Isolation**: All models include `userId` field for multi-tenant data separation
- **Timestamps**: Automatic `createdAt` and `updatedAt` tracking
- **CUID IDs**: Collision-resistant unique identifiers for all primary keys
- **Table Mapping**: Use `@@map()` for consistent table naming

## Database Client Setup

### Prisma Client Configuration
**Location:** `src/lib/db.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

**Key Features:**
- **Global Instance**: Prevents multiple Prisma clients in development
- **Hot Reload Safe**: Survives Next.js/Vite hot reloads
- **Environment Aware**: Different behavior for development vs production

### Usage in Server Functions
```typescript
import { db } from "../lib/db.js";
import type { Post } from "@prisma/client";
```

## Server Functions and Data Access

### TanStack Start Integration
All database operations use `createServerFn` with Clerk authentication:

```typescript
import { createServerFn } from "@tanstack/react-start";
import { getAuth } from "@clerk/tanstack-react-start/server";
import { getWebRequest } from "@tanstack/react-start/server";
```

### Standard Pattern for Server Functions
```typescript
export const exampleServerFn = createServerFn({ method: "GET" }).handler(async () => {
  // 1. Get request object
  const webRequest = getWebRequest();
  if (!webRequest) throw new Error("No request found");
  
  // 2. Authenticate user
  const { userId } = await getAuth(webRequest);
  if (!userId) throw new Error("Unauthorized");
  
  // 3. Perform database operation with user isolation
  const result = await db.model.findMany({
    where: { userId },
    // ... other query options
  });
  
  return result;
});
```

## Authentication Integration

### User Data Isolation
Every database query automatically filters by the authenticated user's ID:

```typescript
// ✅ Correct: User-isolated query
const userPosts = await db.post.findMany({
  where: { userId }, // userId from Clerk authentication
});

// ❌ Incorrect: Could expose other users' data
const allPosts = await db.post.findMany(); // Never do this
```

### Security Pattern
- **Server-Side Only**: Database operations only in server functions
- **Authentication Required**: Every server function validates user authentication
- **Automatic Filtering**: All queries include user ID filtering
- **Error Handling**: Proper error responses for unauthorized access

## Development Workflow

### Package Scripts
```json
{
  "db:generate": "prisma generate",
  "db:push": "prisma db push",
  "db:migrate": "prisma migrate dev",
  "db:seed": "tsx prisma/seed.ts",
  "db:studio": "prisma studio",
  "db:reset": "prisma migrate reset"
}
```

### Common Commands
```bash
# Generate Prisma client after schema changes
pnpm db:generate

# Push schema changes to database (development)
pnpm db:push

# Create and run migrations (production)
pnpm db:migrate

# Seed database with development data
pnpm db:seed

# Open Prisma Studio for database inspection
pnpm db:studio

# Reset database and run all migrations
pnpm db:reset
```

### Development Workflow
1. **Modify Schema**: Edit `prisma/schema.prisma`
2. **Push Changes**: Run `pnpm db:push`
3. **Generate Client**: Run `pnpm db:generate` (if needed)
4. **Update Server Functions**: Modify functions in `src/utils/`
5. **Test Changes**: Verify functionality works as expected

## Best Practices

### 1. Schema Design
- Always include `userId` for user data isolation
- Use descriptive field names
- Add appropriate indexes for query performance
- Include created/updated timestamps for auditing

### 2. Server Functions
- Validate authentication in every server function
- Use TypeScript types from Prisma client
- Include proper error handling
- Log operations for debugging

### 3. Query Patterns
- Always filter by `userId` for user data
- Use `findMany` with proper `where` clauses
- Implement pagination for large datasets
- Use `select` to limit returned fields when appropriate

### 4. Error Handling
- Throw `notFound()` for missing resources
- Handle database constraint violations
- Provide meaningful error messages
- Use proper HTTP status codes

## Code Examples

### Current Implementation: Posts

#### Fetch All Posts for User
```typescript
export const fetchPosts = createServerFn({ method: "GET" }).handler(async () => {
  const webRequest = getWebRequest();
  if (!webRequest) throw new Error("No request found");
  
  const { userId } = await getAuth(webRequest);
  if (!userId) throw new Error("Unauthorized");

  console.info(`Fetching posts for user ${userId}...`);

  const posts = await db.post.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return posts;
});
```

#### Fetch Single Post
```typescript
export const fetchPost = createServerFn({ method: "GET" })
  .validator((postId: string) => postId)
  .handler(async ({ data }) => {
    const webRequest = getWebRequest();
    if (!webRequest) throw new Error("No request found");
    
    const { userId } = await getAuth(webRequest);
    if (!userId) throw new Error("Unauthorized");

    const post = await db.post.findFirst({
      where: { 
        id: data,
        userId  // Ensures user can only access their own posts
      },
    });

    if (!post) {
      throw notFound();
    }

    return post;
  });
```

#### Create New Post
```typescript
export const createPost = createServerFn({ method: "POST" })
  .validator((data: { title: string; content: string }) => data)
  .handler(async ({ data }) => {
    const webRequest = getWebRequest();
    if (!webRequest) throw new Error("No request found");
    
    const { userId } = await getAuth(webRequest);
    if (!userId) throw new Error("Unauthorized");

    const post = await db.post.create({
      data: {
        ...data,
        userId,  // Automatically associate with authenticated user
      },
    });

    return post;
  });
```

#### Update Existing Post
```typescript
export const updatePost = createServerFn({ method: "POST" })
  .validator((data: { id: string; title: string; content: string }) => data)
  .handler(async ({ data }) => {
    const webRequest = getWebRequest();
    if (!webRequest) throw new Error("No request found");
    
    const { userId } = await getAuth(webRequest);
    if (!userId) throw new Error("Unauthorized");

    const post = await db.post.updateMany({
      where: { 
        id: data.id,
        userId  // Ensures user can only update their own posts
      },
      data: {
        title: data.title,
        content: data.content,
      },
    });

    if (post.count === 0) {
      throw notFound();
    }

    return await db.post.findUnique({ where: { id: data.id } });
  });
```

#### Delete Post
```typescript
export const deletePost = createServerFn({ method: "POST" })
  .validator((postId: string) => postId)
  .handler(async ({ data }) => {
    const webRequest = getWebRequest();
    if (!webRequest) throw new Error("No request found");
    
    const { userId } = await getAuth(webRequest);
    if (!userId) throw new Error("Unauthorized");

    const result = await db.post.deleteMany({
      where: { 
        id: data,
        userId  // Ensures user can only delete their own posts
      },
    });

    if (result.count === 0) {
      throw notFound();
    }

    return { success: true };
  });
```

### Seed Script Example
**Location:** `prisma/seed.ts`

```typescript
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
```

### Route Integration Example
**Location:** `src/routes/_authed/posts.tsx`

```typescript
import { fetchPosts } from "@app/utils/posts.js";

export const Route = createFileRoute("/_authed/posts")({
  loader: () => fetchPosts(),  // Server function handles auth automatically
  component: PostsComponent,
});

function PostsComponent() {
  const posts = Route.useLoaderData();  // Typed as Post[]

  if (!posts || posts.length === 0) {
    return (
      <div className="text-gray-500 italic">
        <p>You haven&apos;t created any posts yet. Start sharing your thoughts!</p>
      </div>
    );
  }

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          <Link to="/posts/$postId" params={{ postId: post.id }}>
            {post.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

---

## Future Considerations

As the project grows, consider these enhancements:

- **Relations**: Add foreign key relationships between models
- **Validation**: Implement schema validation with Zod
- **Caching**: Add query caching for improved performance
- **Indexing**: Create database indexes for frequently queried fields
- **Migrations**: Move from `db:push` to proper migrations for production
- **Connection Pooling**: Consider connection pooling for high-traffic applications

This documentation will be updated as new models and features are added to the project.