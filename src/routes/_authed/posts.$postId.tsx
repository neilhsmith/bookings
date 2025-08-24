import { ErrorComponent, createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { NotFound } from "@app/core/components/not-found.js";
import { Button } from "@app/core/components/ui/button";

import { ConfirmationDialog } from "@app/components/ui/confirmation-dialog";
import { deletePost, fetchPost } from "@app/utils/posts.js";

export const Route = createFileRoute("/_authed/posts/$postId")({
  loader: ({ params: { postId } }) => fetchPost({ data: postId }),
  errorComponent: PostErrorComponent,
  component: PostComponent,
  notFoundComponent: () => {
    return <NotFound>Post not found</NotFound>;
  },
});

export function PostErrorComponent({ error }: ErrorComponentProps) {
  return <ErrorComponent error={error} />;
}

function PostComponent() {
  const post = Route.useLoaderData();
  const navigate = useNavigate();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      await deletePost({ data: post.id });

      // Show success toast
      toast.success("Post deleted successfully!");

      // Invalidate queries to refresh data
      await router.invalidate();

      // Navigate to posts index
      navigate({ to: "/posts" });
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete post. Please try again.",
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{post.title}</h1>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Created: {new Date(post.createdAt).toLocaleString()}
              {post.updatedAt !== post.createdAt && (
                <> • Updated: {new Date(post.updatedAt).toLocaleString()}</>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          {post.content.split("\n").map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Post"
        description={`Are you sure you want to delete "${post.title}"? This action cannot be undone.`}
        confirmLabel="Delete Post"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleDeletePost}
        isLoading={isDeleting}
      />
    </>
  );
}
