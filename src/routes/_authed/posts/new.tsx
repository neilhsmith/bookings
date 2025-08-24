import { Link, createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, CheckCircle, Eye, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@app/core/components/ui/button";

import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Textarea } from "@app/components/ui/textarea";
import { createPost } from "@app/utils/posts.js";

export const Route = createFileRoute("/_authed/posts/new")({
  component: NewPostPage,
});

function NewPostPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required");
      document.getElementById("title")?.focus();
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const newPost = await createPost({
        data: {
          title: title.trim(),
          content: content.trim(),
        },
      });

      setSuccessMessage("Post created successfully!");

      // Invalidate posts query to refresh the list
      await router.invalidate();

      // Navigate back to posts list after a brief delay to show success message
      setTimeout(() => {
        navigate({ to: `/posts/${newPost.id}` });
      }, 1000);
    } catch (error) {
      console.error("Failed to create post:", error);
      setError(error instanceof Error ? error.message : "Failed to create post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const canPublish = title.trim().length > 0;
  const canSave = title.trim() || content.trim();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/posts">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to posts</span>
          </Link>
        </Button>

        <div className="flex-1">
          <h1 className="text-2xl font-bold">Create New Post</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Share your thoughts and ideas with your audience
          </p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Main form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-base font-medium">
            Title *
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your post title..."
            className="h-12 text-lg"
            maxLength={100}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">This will be the headline of your post</p>
            <span
              className={`text-xs ${title.length > 80 ? "text-orange-600" : "text-muted-foreground"}`}
            >
              {title.length}/100
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content" className="text-base font-medium">
            Content
          </Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content here..."
            className="min-h-[400px] resize-none text-base leading-relaxed"
            maxLength={5000}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Share your thoughts, ideas, and stories</p>
            <span
              className={`text-xs ${content.length > 4500 ? "text-orange-600" : "text-muted-foreground"}`}
            >
              {content.length}/5000
            </span>
          </div>
        </div>

        {/* Submit buttons */}
        <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row">
          <Button type="submit" disabled={!canPublish || isLoading} size="lg" className="sm:flex-1">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish Post"
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/posts" })}
            disabled={isLoading}
            size="lg"
            className="sm:w-auto"
          >
            Cancel
          </Button>
        </div>

        {/* Help text */}
        <div className="space-y-2 rounded-lg bg-muted/30 p-4">
          <h3 className="text-sm font-medium">Writing Tips:</h3>
          <ul className="list-disc space-y-1 pl-3 text-sm text-muted-foreground">
            <li>Use a clear, descriptive title to grab attention</li>
            <li>Break up long content into paragraphs for better readability</li>
            <li>Posts are published immediately upon creation</li>
          </ul>
        </div>
      </form>
    </div>
  );
}
