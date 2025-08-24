# Server Functions Standards

This document establishes comprehensive standards for server functions in our TanStack Start application, covering validation, authentication, error handling, and security best practices.

## Table of Contents

- [Overview](#overview)
- [Server Function Architecture](#server-function-architecture)
- [Authentication Patterns](#authentication-patterns)
- [Validation Standards](#validation-standards)
- [Error Handling](#error-handling)
- [Security Considerations](#security-considerations)
- [Implementation Examples](#implementation-examples)
- [Best Practices](#best-practices)

## Overview

Server functions in TanStack Start provide a secure, type-safe way to handle server-side operations. All server functions must implement:

1. **Authentication verification** - Ensure only authorized users can access resources
2. **Input validation** - Validate and sanitize all input data
3. **Authorization checks** - Verify users can only access their own resources
4. **Consistent error handling** - Provide meaningful error messages
5. **Security measures** - Prevent common vulnerabilities

## Server Function Architecture

### Standard Structure

All server functions follow this pattern:

```typescript
export const functionName = createServerFn({ method: "GET" | "POST" })
  .validator((data: InputType) => data) // Type checking via TanStack
  .handler(async ({ data }) => {
    // 1. Request validation
    const webRequest = getWebRequest();
    if (!webRequest) throw new Error(SERVER_ERRORS.NO_REQUEST);

    // 2. Authentication
    const { userId } = await getAuth(webRequest);
    if (!userId) throw new Error(SERVER_ERRORS.UNAUTHORIZED);

    // 3. Input validation & sanitization (for mutations)
    const validatedData = validateInput(data);

    // 4. Authorization & business logic
    const result = await performOperation(validatedData, userId);

    // 5. Return result
    return result;
  });
```

### File Organization

- Place server functions in `src/utils/` directory
- Group related functions in the same file (e.g., `posts.ts`, `users.ts`)
- Import validation utilities from `src/utils/validation.ts`

## Authentication Patterns

### Required Authentication Flow

Every server function must verify authentication:

```typescript
import { getAuth } from "@clerk/tanstack-react-start/server";
import { getWebRequest } from "@tanstack/react-start/server";

import { SERVER_ERRORS } from "./validation.js";

// Inside handler
const webRequest = getWebRequest();
if (!webRequest) throw new Error(SERVER_ERRORS.NO_REQUEST);

const { userId } = await getAuth(webRequest);
if (!userId) throw new Error(SERVER_ERRORS.UNAUTHORIZED);
```

### Authorization Patterns

Always scope database operations to the authenticated user:

```typescript
// ✅ Good - User can only access their own resources
const posts = await db.post.findMany({
  where: { userId }, // Always filter by userId
  orderBy: { createdAt: "desc" },
});

// ✅ Good - Update/delete only user's resources
const result = await db.post.updateMany({
  where: {
    id: postId,
    userId, // Ensures user owns the resource
  },
  data: updateData,
});

// ❌ Bad - No user scoping
const posts = await db.post.findMany(); // All users' posts!
```

## Validation Standards

### Validation Utilities

Use the validation utilities from `src/utils/validation.ts`:

```typescript
import {
  ValidationException,
  validateAndSanitizeId,
  validateAndSanitizePostData,
} from "./validation.js";
```

### Required Validation for CRUD Operations

#### Create Operations

- **Must validate all input fields** according to business rules
- **Must sanitize data** (trim strings, normalize values)
- **Must handle validation errors** gracefully

```typescript
export const createPost = createServerFn({ method: "POST" })
  .validator((data: { title: string; content: string }) => data)
  .handler(async ({ data }) => {
    // Authentication...

    // Validate and sanitize
    const validatedData = validateAndSanitizePostData(data);

    // Create with validated data
    const post = await db.post.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        userId,
      },
    });

    return post;
  });
```

#### Update Operations

- **Must validate both ID and update data**
- **Must verify resource ownership**
- **Must handle partial updates appropriately**

```typescript
export const updatePost = createServerFn({ method: "POST" })
  .validator((data: { id: string; title: string; content: string }) => data)
  .handler(async ({ data }) => {
    // Authentication...

    // Validate ID and update data
    const validatedId = validateAndSanitizeId(data.id, "postId");
    const validatedData = validateAndSanitizePostData({
      title: data.title,
      content: data.content,
    });

    // Update with user scoping
    const result = await db.post.updateMany({
      where: { id: validatedId, userId },
      data: validatedData,
    });

    if (result.count === 0) {
      throw notFound();
    }

    return await db.post.findUnique({ where: { id: validatedId } });
  });
```

#### Delete Operations

- **Must validate resource ID**
- **Must verify resource ownership**
- **Must handle missing resources**

```typescript
export const deletePost = createServerFn({ method: "POST" })
  .validator((postId: string) => postId)
  .handler(async ({ data }) => {
    // Authentication...

    // Validate ID
    const validatedId = validateAndSanitizeId(data, "postId");

    // Delete with user scoping
    const result = await db.post.deleteMany({
      where: { id: validatedId, userId },
    });

    if (result.count === 0) {
      throw notFound();
    }

    return { success: true };
  });
```

### Custom Validation Rules

For domain-specific validation, extend the validation utilities:

```typescript
// In validation.ts
export function validateCustomData(data: CustomData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Add custom validation logic
  if (data.customField && data.customField < 0) {
    errors.push({ field: "customField", message: "must be non-negative" });
  }

  return errors;
}
```

## Error Handling

### Standard Error Types

Use consistent error messages from `SERVER_ERRORS`:

```typescript
import { SERVER_ERRORS } from "./validation.js";

// Standard errors
throw new Error(SERVER_ERRORS.NO_REQUEST); // "No request found"
throw new Error(SERVER_ERRORS.UNAUTHORIZED); // "Unauthorized"
throw new Error(SERVER_ERRORS.VALIDATION_FAILED); // "Validation failed"
throw new Error(SERVER_ERRORS.NOT_FOUND); // "Resource not found"
throw new Error(SERVER_ERRORS.FORBIDDEN); // "Access denied"
```

### Validation Errors

Validation errors provide detailed field-level feedback:

```typescript
try {
  const validatedData = validateAndSanitizePostData(data);
} catch (error) {
  if (error instanceof ValidationException) {
    // error.errors contains array of { field, message }
    throw error; // Will be handled by TanStack Start
  }
  throw error;
}
```

### Database Errors

Handle common database scenarios:

```typescript
// Resource not found
if (result.count === 0) {
  throw notFound(); // TanStack Router's notFound()
}

// Unique constraint violations, etc.
try {
  const result = await db.model.create(data);
} catch (error) {
  if (error.code === "P2002") {
    // Prisma unique constraint
    throw new Error("Resource already exists");
  }
  throw error;
}
```

## Security Considerations

### Input Sanitization

Always sanitize user input:

```typescript
// ✅ Good - Sanitized input
const validatedData = validateAndSanitizePostData(data);
const post = await db.post.create({
  data: {
    title: validatedData.title, // Trimmed and validated
    content: validatedData.content, // Trimmed and validated
    userId,
  },
});

// ❌ Bad - Raw input
const post = await db.post.create({
  data: {
    title: data.title, // Could contain malicious content
    content: data.content, // Not sanitized
    userId,
  },
});
```

### SQL Injection Prevention

Using Prisma ORM with parameterized queries prevents SQL injection, but always validate input:

```typescript
// ✅ Good - Validated ID
const validatedId = validateAndSanitizeId(postId);
const post = await db.post.findUnique({ where: { id: validatedId } });

// ❌ Risky - Raw input (though Prisma still protects)
const post = await db.post.findUnique({ where: { id: postId } });
```

### Authorization Bypass Prevention

Always check resource ownership:

```typescript
// ✅ Good - User can only access their resources
const post = await db.post.findFirst({
  where: { id: postId, userId }, // Double check ownership
});

// ❌ Bad - Authorization bypass possible
const post = await db.post.findUnique({ where: { id: postId } });
if (post.userId !== userId) { // Too late!
  throw new Error('Forbidden');
}
```

### Rate Limiting Considerations

For high-traffic operations, consider rate limiting:

```typescript
// TODO: Implement rate limiting for sensitive operations
// Example: createPost, updatePost, deletePost should have rate limits
```

## Implementation Examples

### Complete CRUD Example

See `src/utils/posts.ts` for a complete implementation that follows all standards:

- ✅ Authentication verification
- ✅ Input validation and sanitization
- ✅ Authorization with user scoping
- ✅ Consistent error handling
- ✅ Security best practices

### Creating New Server Functions

When creating new server functions:

1. **Start with the template structure**
2. **Add authentication checks**
3. **Implement input validation**
4. **Add authorization logic**
5. **Handle errors consistently**
6. **Test with invalid inputs**

## Best Practices

### Do's

- ✅ Always authenticate and authorize
- ✅ Validate and sanitize all inputs
- ✅ Use consistent error messages
- ✅ Scope database operations to authenticated users
- ✅ Handle edge cases (empty results, duplicates, etc.)
- ✅ Log operations for debugging
- ✅ Use TypeScript types for compile-time safety

### Don'ts

- ❌ Skip input validation for "trusted" inputs
- ❌ Allow users to access other users' resources
- ❌ Expose internal error details to clients
- ❌ Use raw database queries without validation
- ❌ Forget to handle missing resources
- ❌ Assume client-side validation is sufficient

### Testing

Test server functions with:

- Valid authenticated requests
- Invalid/malicious inputs
- Unauthorized access attempts
- Missing resources
- Edge cases (empty strings, very long inputs, etc.)

### Performance

- Use database indexes for frequently queried fields
- Implement pagination for list operations
- Consider caching for read-heavy operations
- Monitor query performance and optimize as needed

## Migration Guide

When updating existing server functions:

1. **Add validation utilities import**
2. **Replace hardcoded error messages** with `SERVER_ERRORS`
3. **Add input validation** for create/update operations
4. **Add ID validation** for operations with IDs
5. **Test thoroughly** with various inputs

This ensures consistent security and reliability across all server functions.
