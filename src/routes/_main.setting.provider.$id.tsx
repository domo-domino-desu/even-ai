import { createFileRoute, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";

import { Gap } from "~/components/Gap";
import { Navbar } from "~/components/Navbar";
import { ProviderForm } from "~/components/ProviderForm";
import { db } from "~/utils/db";

function EditProvider() {
  const { id } = Route.useParams();
  const provider = useLiveQuery(() => db.ai_providers.get(id), [id]);

  if (!provider) {
    return "提供者不存在";
  }

  return (
    <>
      <Navbar
        title={`编辑: ${provider?.name}`}
        enableBack
        navigationFallback={(go) => go({ to: "/setting/provider" })}
      />
      <main className="padding">
        <div className="row">
          <Link
            to="/setting/config-plugin/list/$type/$id"
            params={{ type: "provider", id }}
          >
            <button>管理插件</button>
          </Link>
          <Link
            to="/setting/import-prefab/$type/$id"
            params={{ type: "provider", id }}
          >
            <button>导入插件集</button>
          </Link>
        </div>
        <Gap h={3} />
        <ProviderForm
          key={provider?.id}
          provider={provider}
          isNew={false}
          onSave={async (provider) => {
            await db.ai_providers.update(id, provider);
          }}
        />
      </main>
    </>
  );
}

export const Route = createFileRoute("/_main/setting/provider/$id")({
  component: EditProvider,
});
