import { createFileRoute, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { Gap } from "~/components/Gap";
import { Navbar } from "~/components/Navbar";
import { PluginForm } from "~/components/PluginForm";
import { db } from "~/utils/db";

function EditPlugin() {
  const { id } = Route.useParams();
  const plugin = useLiveQuery(() => db.plugins.get(id), [id]);

  if (!plugin) {
    return "插件不存在";
  }

  return (
    <>
      <Navbar
        title={`编辑: ${plugin?.name}`}
        enableBack
        navigationFallback={(go) => go({ to: "/setting/plugin" })}
      />
      <main className="padding responsive">
        <nav>
          <Link
            to="/setting/config-plugin/config/$type/$id/$pluginId"
            params={{ type: "plugin", id, pluginId: id }}
          >
            <button>编辑默认配置</button>
          </Link>
        </nav>
        <Gap h={3} />
        <PluginForm
          initialValues={plugin}
          onSave={async (pluginInfo) => {
            await db.plugins.update(id, { ...pluginInfo });
          }}
        />
      </main>
    </>
  );
}

export const Route = createFileRoute("/_main/setting/plugin/$id")({
  component: EditPlugin,
});
