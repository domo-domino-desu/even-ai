import { createFileRoute, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Gap } from "~/components/Gap";
import { Navbar } from "~/components/Navbar";
import { PrefabForm } from "~/components/PrefabForm";
import { db } from "~/utils/db";

function EditPrefab() {
  const { id } = Route.useParams();
  const prefab = useLiveQuery(() => db.prefabs.get(id), [id]);

  if (!prefab) {
    return "预组不存在";
  }

  return (
    <>
      <Navbar
        title={`编辑: ${prefab?.name}`}
        enableBack
        navigationFallback={(go) => go({ to: "/setting/prefab" })}
      />
      <main className="padding responsive">
        <div className="row">
          <Link
            to="/setting/config-plugin/list/$type/$id"
            params={{ type: "prefab", id }}
          >
            <button>管理插件</button>
          </Link>
          <Link
            to="/setting/import-prefab/$type/$id"
            params={{ type: "prefab", id }}
          >
            <button>导入预组</button>
          </Link>
        </div>
        <Gap h={3} />
        <PrefabForm
          key={prefab?.id}
          prefab={prefab}
          isNew={false}
          onSave={async (p) => {
            await db.prefabs.update(id, p);
          }}
        />
      </main>
    </>
  );
}

export const Route = createFileRoute("/_main/setting/prefab/$id")({
  component: EditPrefab,
});
