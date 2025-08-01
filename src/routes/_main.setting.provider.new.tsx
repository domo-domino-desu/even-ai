import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "~/components/Navbar";
import { ProviderForm } from "~/components/ProviderForm";

function NewProvider() {
  return (
    <>
      <Navbar
        title="新建提供者"
        enableBack
        navigationFallback={(go) => go({ to: "/setting/provider" })}
      />
      <main className="padding">
        <ProviderForm isNew />
      </main>
    </>
  );
}

export const Route = createFileRoute("/_main/setting/provider/new")({
  component: NewProvider,
});
