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
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Authentication Required</h1>
          <p className="text-gray-600">You need to sign in to access this page.</p>
        </div>

        <div className="p-6">
          <SignIn
            routing="hash"
            forceRedirectUrl={from}
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 p-0",
              },
            }}
          />
        </div>

        <div className="text-center">
          <button
            onClick={() => router.history.back()}
            className="text-sm text-gray-500 underline hover:text-gray-700"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
