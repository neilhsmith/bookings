import { Button } from "@/components/ui/button";
import { Link, createFileRoute } from "@tanstack/react-router";
import { BookOpen, Plus } from "lucide-react";

export const Route = createFileRoute("/_authed/posts/")({
  component: PostsIndexComponent,
});

function PostsIndexComponent() {
  return (
    <div className="flex h-full flex-col items-center justify-center py-16">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <BookOpen className="h-8 w-8 text-muted-foreground" />
      </div>

      <h2 className="mb-2 text-xl font-semibold">Select a Post</h2>
      <p className="mb-8 max-w-sm text-center text-muted-foreground">
        Choose a post from the sidebar to view and edit it, or create a new one.
      </p>

      <Button asChild>
        <Link to="/posts/new">
          <Plus className="h-4 w-4" />
          Create New Post
        </Link>
      </Button>
    </div>
  );
}
