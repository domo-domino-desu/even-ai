import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "react-hot-toast";

export const Route = createRootRoute({
  component: () => (
    <>
      <Toaster />
      <Outlet />
    </>
  ),
  pendingComponent: () => (
    <>
      <div className="loading">
        <i>hourglass_empty</i>
      </div>
    </>
  ),
});
