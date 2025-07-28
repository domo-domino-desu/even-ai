import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { QueryProvider, queryContext } from "~/integrations/query";

import "beercss";
import "material-dynamic-colors";

import "~/app.css";

import { globalInit } from "~/init";

await globalInit();

// Import the generated route tree
import { routeTree } from "~/routeTree.gen";

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { ...queryContext() },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("app")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryProvider>
        <RouterProvider router={router} />
      </QueryProvider>
    </StrictMode>,
  );
}
