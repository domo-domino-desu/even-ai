import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/")({
  component: Index,
});

function Index() {
  return <Navigate to="/chat" />;
}
