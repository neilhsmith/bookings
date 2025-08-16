# Clerk Authentication Documentation

This document provides comprehensive information about Clerk authentication implementation in this TanStack React Start project.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Core Components](#core-components)
3. [Authentication Setup](#authentication-setup)
4. [Route Protection](#route-protection)
5. [Server-Side Authentication](#server-side-authentication)
6. [Client-Side Hooks](#client-side-hooks)
7. [Component Usage Patterns](#component-usage-patterns)
8. [Security Considerations](#security-considerations)
9. [Best Practices](#best-practices)
10. [Code Examples](#code-examples)

## Project Overview

This project uses **Clerk** (`@clerk/tanstack-react-start v0.19.0`) for authentication in a **TanStack React Start** application. Clerk provides:

- Complete user management (sign-up, sign-in, profile management)
- Prebuilt UI components with customizable styling
- Server-side and client-side authentication helpers
- Session management and security features

### Key Dependencies
- `@clerk/tanstack-react-start`: ^0.19.0
- `@tanstack/react-router`: ^1.131.14
- `@tanstack/react-start`: ^1.131.15

## Core Components

### ClerkProvider
The root authentication provider that wraps the entire application.

**Location:** `src/routes/__root.tsx`
```tsx
import { ClerkProvider } from "@clerk/tanstack-react-start";

function RootComponent() {
  return (
    <ClerkProvider>
      <RootDocument>
        <Outlet />
      </RootDocument>
    </ClerkProvider>
  );
}
```

### SignInButton
Provides a sign-in interface with modal support.

**Current Usage:**
```tsx
import { SignInButton } from "@clerk/tanstack-react-start";

<SignedOut>
  <SignInButton mode="modal" />
</SignedOut>
```

### UserButton
Displays user avatar and profile dropdown for authenticated users.

**Current Usage:**
```tsx
import { UserButton } from "@clerk/tanstack-react-start";

<SignedIn>
  <UserButton />
</SignedIn>
```

### SignedIn / SignedOut
Conditional rendering components based on authentication state.

**Current Usage:**
```tsx
import { SignedIn, SignedOut } from "@clerk/tanstack-react-start";

<SignedIn>
  <Link to="/profile/$">Profile</Link>
  <UserButton />
</SignedIn>
<SignedOut>
  <SignInButton mode="modal" />
</SignedOut>
```

### UserProfile
Full-featured user profile management component.

**Location:** `src/routes/_authed/profile.$.tsx`
```tsx
import { UserProfile } from "@clerk/tanstack-react-start";

function ProfileComponent() {
  return (
    <div className="flex justify-center">
      <UserProfile />
    </div>
  );
}
```

### SignIn
Authentication form component for custom sign-in pages.

**Location:** `src/routes/_authed.tsx` (error boundary)
```tsx
import { SignIn } from "@clerk/tanstack-react-start";

<SignIn routing="hash" forceRedirectUrl={window.location.href} />
```

## Authentication Setup

### Environment Variables
```env
VITE_CLERK_PUBLISHABLE_KEY={{pub_key}}
CLERK_SECRET_KEY={{secret}}
```

### Server Handler Configuration
**Location:** `src/server.ts`
```tsx
import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server'
import { createClerkHandler } from '@clerk/tanstack-react-start/server'

export default createClerkHandler(
  createStartHandler({
    createRouter,
  }),
)(defaultStreamHandler)
```

## Route Protection

### Protected Route Layout
**Location:** `src/routes/_authed.tsx`

```tsx
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed")({
  beforeLoad: ({ context, location }) => {
    if (!context.userId) {
      throw redirect({
        to: "/unauthorized",
        search: {
          from: location.href,
        },
      });
    }
  },
});
```

### Unauthorized Route
**Location:** `src/routes/unauthorized.tsx`

```tsx
import { SignIn } from "@clerk/tanstack-react-start";
import { createFileRoute, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/unauthorized")({
  component: UnauthorizedPage,
});

function UnauthorizedPage() {
  const router = useRouter();
  const search = Route.useSearch() as { from?: string };
  const from = search.from || "/";

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Authentication Required
          </h1>
          <p className="text-gray-600">
            You need to sign in to access this page.
          </p>
        </div>
        
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <SignIn 
            routing="hash" 
            forceRedirectUrl={from}
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 p-0",
              }
            }}
          />
        </div>
        
        <div className="text-center">
          <button
            onClick={() => router.history.back()}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Server Function for Authentication
**Location:** `src/routes/__root.tsx`

```tsx
import { getAuth } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";

const fetchClerkAuth = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const webRequest = getWebRequest();
    if (!webRequest) return { userId: null };

    const authResult = await getAuth(webRequest);

    return {
      userId: authResult?.userId ?? null,
    };
  } catch (error) {
    console.error("Error fetching auth:", error);
    return { userId: null };
  }
});
```

## Server-Side Authentication

### getAuth() Helper
Server-side authentication state access:

```tsx
import { getAuth } from '@clerk/tanstack-react-start/server'
import { getWebRequest } from '@tanstack/react-start/server'

// In route beforeLoad or server functions
const authStateFn = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getWebRequest()
  if (!request) throw new Error('No request found')
  const { userId } = await getAuth(request)
  
  return { userId }
})
```

### API Route Protection
```tsx
import { getAuth } from '@clerk/tanstack-react-start/server'
import { json } from '@tanstack/react-start'

export const ServerRoute = createServerFileRoute('/api/example').methods({
  GET: async ({ request }) => {
    const { userId } = await getAuth(request)
    
    if (!userId) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    return json({ message: `Hello user ${userId}` })
  },
})
```

## Client-Side Hooks

### useAuth()
Access authentication state and session token:

```tsx
import { useAuth } from '@clerk/tanstack-react-start'

function Component() {
  const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth()

  const fetchData = async () => {
    const token = await getToken()
    const response = await fetch('/api/data', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.json()
  }

  if (!isLoaded) return <div>Loading...</div>
  if (!isSignedIn) return <div>Please sign in</div>
  
  return <div>Welcome, {userId}!</div>
}
```

### useUser()
Access user profile data:

```tsx
import { useUser } from '@clerk/tanstack-react-start'

function Component() {
  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded) return <div>Loading...</div>
  if (!isSignedIn) return <div>Please sign in</div>
  
  return <div>Hello, {user.firstName}!</div>
}
```

## Component Usage Patterns

### Conditional Navigation
```tsx
<SignedIn>
  <Link to="/profile/$" activeProps={{ className: "font-bold" }}>
    Profile
  </Link>
</SignedIn>
```

### Authentication Status UI
```tsx
<div className="ml-auto">
  <SignedIn>
    <UserButton />
  </SignedIn>
  <SignedOut>
    <SignInButton mode="modal" />
  </SignedOut>
</div>
```

### Protect Component
For fine-grained access control:

```tsx
import { Protect } from '@clerk/tanstack-react-start'

<Protect fallback={<p>Access denied</p>}>
  <p>Protected content</p>
</Protect>
```

### Modal vs Page Routing
- **Modal mode**: `<SignInButton mode="modal" />` - Opens in overlay
- **Page routing**: `<SignIn routing="hash" />` - Full page component

## Security Considerations

### Environment Variables
- Use `VITE_CLERK_PUBLISHABLE_KEY` for client-side (public)
- Use `CLERK_SECRET_KEY` for server-side operations (private)
- Never expose secret keys in client code

### Session Validation
- Always validate `userId` on server-side before accessing protected resources
- Use `getAuth(request)` in server functions and API routes
- Implement proper error boundaries for authentication failures

### Token Management
- Use `getToken()` for authenticated API requests
- Tokens are automatically refreshed by Clerk
- Include tokens in `Authorization: Bearer {token}` headers

## Best Practices

### 1. Component Organization
- Place authentication logic in route-level components
- Use `SignedIn`/`SignedOut` for conditional rendering
- Leverage the `_authed` layout for protected routes
- Use dedicated unauthorized page instead of inline authentication

### 2. Error Handling
- Use redirect pattern for unauthenticated access instead of error boundaries
- Provide dedicated unauthorized page with clear messaging
- Handle loading states appropriately
- Preserve original destination for post-authentication redirects

### 3. Performance
- Use `isLoaded` to prevent premature rendering
- Implement loading states for better UX
- Cache user data appropriately

### 4. User Experience
- Use modal sign-in for seamless UX
- Provide clear feedback for authentication states
- Implement proper redirects after authentication

## Code Examples

### Custom Sign-In Page
```tsx
import { SignIn } from '@clerk/tanstack-react-start'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sign-in/$')({
  component: SignInPage,
})

function SignInPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <SignIn />
    </div>
  )
}
```

### Protected Route with Server-Side Check
```tsx
import { getAuth } from '@clerk/tanstack-react-start/server'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getWebRequest } from '@tanstack/react-start/server'

const authCheck = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getWebRequest()
  const { userId } = await getAuth(request)
  
  if (!userId) {
    throw redirect({ 
      to: '/unauthorized',
      search: { from: '/dashboard' }
    })
  }
  
  return { userId }
})

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => authCheck(),
  component: Dashboard,
})
```

### Unauthorized Page Implementation
```tsx
import { SignIn } from '@clerk/tanstack-react-start'
import { createFileRoute, useRouter } from '@tanstack/react-router'

export const Route = createFileRoute('/unauthorized')({
  component: UnauthorizedPage,
})

function UnauthorizedPage() {
  const router = useRouter()
  const search = Route.useSearch() as { from?: string }
  const from = search.from || '/'

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Authentication Required
          </h1>
          <p className="text-gray-600">
            You need to sign in to access this page.
          </p>
        </div>
        
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <SignIn 
            routing="hash" 
            forceRedirectUrl={from}
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 p-0",
              }
            }}
          />
        </div>
        
        <div className="text-center">
          <button
            onClick={() => router.history.back()}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  )
}
```

### Authenticated API Request
```tsx
import { useAuth } from '@clerk/tanstack-react-start'

function useAuthenticatedFetch() {
  const { getToken } = useAuth()
  
  return async (url: string, options: RequestInit = {}) => {
    const token = await getToken()
    
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
  }
}
```

### User Profile Management
```tsx
import { useUser } from '@clerk/tanstack-react-start'

function UserProfileCard() {
  const { user, isLoaded } = useUser()
  
  if (!isLoaded) return <div>Loading...</div>
  if (!user) return <div>Not signed in</div>
  
  return (
    <div className="profile-card">
      <img src={user.profileImageUrl} alt="Profile" />
      <h2>{user.fullName}</h2>
      <p>{user.primaryEmailAddress?.emailAddress}</p>
    </div>
  )
}
```

---

This documentation serves as a comprehensive reference for implementing and extending Clerk authentication in this TanStack React Start project. It covers the current implementation patterns and provides examples for common authentication scenarios.