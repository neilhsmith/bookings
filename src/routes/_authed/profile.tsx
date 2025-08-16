import { UserProfile } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/profile")({
  component: ProfileComponent,
});

function ProfileComponent() {
  return (
    <div className="flex justify-center">
      <UserProfile />
    </div>
  );
}
