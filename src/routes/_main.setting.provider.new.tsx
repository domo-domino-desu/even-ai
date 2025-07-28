import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "~/components/Navbar";
import { ProviderForm, useProviderForm } from "~/components/ProviderForm";

function NewProvider() {
  const form = useProviderForm();

  return (
    <>
      <Navbar
        title="新建提供者"
        enableBack
        navigationFallback={(go) => go({ to: "/setting/provider" })}
      />
      <main className="padding">
        <ProviderForm form={form} isNew />
      </main>
    </>
  );
}

export const Route = createFileRoute("/_main/setting/provider/new")({
  component: NewProvider,
});
