import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { v7 as uuid } from "uuid";
import { Navbar } from "~/components/Navbar";
import { ProviderForm } from "~/components/ProviderForm";
import { db } from "~/utils/db";

function NewProvider() {
  const navigate = useNavigate({ from: "/setting/provider/new" });

  return (
    <>
      <Navbar
        title="新建提供者"
        enableBack
        navigationFallback={(go) => go({ to: "/setting/provider" })}
      />
      <main className="padding responsive">
        <ProviderForm
          isNew
          onSave={async (provider) => {
            await db.ai_providers.add({ ...provider, id: uuid() });
          }}
          afterSubmit={() => navigate({ to: "/setting/provider" })}
        />
      </main>
    </>
  );
}

export const Route = createFileRoute("/_main/setting/provider/new")({
  component: NewProvider,
});
