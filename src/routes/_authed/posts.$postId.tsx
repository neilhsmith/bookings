import { ErrorComponent, createFileRoute } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";

import { NotFound } from "@app/core/components/not-found.js";

import { fetchPost } from "@app/utils/posts.js";

export const Route = createFileRoute("/_authed/posts/$postId")({
  loader: ({ params: { postId } }) => fetchPost(postId),
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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{post.title}</h1>
      <div className="text-sm text-gray-500">
        Created: {new Date(post.createdAt).toLocaleString()}
        {post.updatedAt !== post.createdAt && (
          <> • Updated: {new Date(post.updatedAt).toLocaleString()}</>
        )}
      </div>
      <div className="prose max-w-none">
        {post.content.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-4">{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
