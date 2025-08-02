import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "~/components/Navbar";

function EditPlugin() {
  return (
    <>
      <Navbar
        title="通用设置"
        enableBack
        navigationFallback={(go) => go({ to: "/chat" })}
      />
      <main className="padding"></main>
    </>
  );
}

export const Route = createFileRoute("/_main/setting/generic")({
  component: EditPlugin,
});
