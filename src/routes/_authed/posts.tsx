import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { FileText, Plus } from "lucide-react";

import { Button } from "@app/core/components/ui/button";

import { fetchPosts } from "@app/utils/posts.js";

export const Route = createFileRoute("/_authed/posts")({
  loader: () => fetchPosts(),
  component: PostsComponent,
});

function PostsComponent() {
  const posts = Route.useLoaderData();
  const isEmpty = !posts || posts.length === 0;

  if (isEmpty) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
            <p className="mt-1 text-muted-foreground">Manage your blog posts and content</p>
          </div>

          {/* Prominent CTA for empty state */}
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/posts/new">
              <Plus className="h-4 w-4" />
              Create Your First Post
            </Link>
          </Button>
        </div>

        {/* Empty state content */}
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>

          <h2 className="mb-2 text-xl font-semibold">No posts yet</h2>
          <p className="mb-8 max-w-sm text-center text-muted-foreground">
            Get started by creating your first post. Share your thoughts, ideas, and stories with
            the world.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/posts/new">
                <Plus className="h-4 w-4" />
                Create Your First Post
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>

        <Outlet />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
          <p className="mt-1 text-muted-foreground">Manage your blog posts and content</p>
        </div>

        {/* Compact CTA for existing posts */}
        <Button asChild className="w-full sm:w-auto">
          <Link to="/posts/new">
            <Plus className="h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Posts sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="space-y-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                to="/posts/$postId"
                params={{
                  postId: post.id,
                }}
                className="block rounded-lg border p-3 transition-colors hover:bg-accent"
                activeProps={{
                  className: "border-primary bg-accent",
                }}
              >
                <h3 className="mb-1 line-clamp-2 text-sm font-medium">{post.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Main content area */}
        <div className="min-h-[400px] flex-1 border-l pl-6">
          <Outlet />
        </div>
      </div>

      {/* Floating Action Button for mobile */}
      <Button
        asChild
        size="icon"
        className="fixed right-6 bottom-6 h-14 w-14 rounded-full shadow-lg sm:hidden"
      >
        <Link to="/posts/new">
          <Plus className="h-6 w-6" />
          <span className="sr-only">Create new post</span>
        </Link>
      </Button>
    </div>
  );
}
