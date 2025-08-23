import { Link, Outlet, createFileRoute } from "@tanstack/react-router";

import { fetchPosts } from "@app/utils/posts.js";

export const Route = createFileRoute("/_authed/posts")({
  loader: () => fetchPosts(),
  component: PostsComponent,
});

function PostsComponent() {
  const posts = Route.useLoaderData();

  if (!posts || posts.length === 0) {
    return (
      <div className="flex gap-2 p-2">
        <div className="text-gray-500 italic space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No posts yet</h3>
            <p className="text-sm">You haven&apos;t created any posts yet. Start sharing your thoughts!</p>
          </div>
          <div>
            <Link 
              to="/" 
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
        <hr />
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex gap-2 p-2">
      <ul className="list-disc pl-4">
        {posts.map((post) => (
          <li key={post.id} className="whitespace-nowrap">
            <Link
              to="/posts/$postId"
              params={{
                postId: post.id,
              }}
              className="block py-1 text-blue-800 hover:text-blue-600"
              activeProps={{ className: "text-black font-bold" }}
            >
              <div>{post.title.substring(0, 20)}</div>
              <div className="text-xs text-gray-500">
                {new Date(post.createdAt).toLocaleDateString()}
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <hr />
      <Outlet />
    </div>
  );
}
