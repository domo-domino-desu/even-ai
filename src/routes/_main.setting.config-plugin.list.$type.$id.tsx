import { createFileRoute, Link } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { match, P } from "ts-pattern";
import { Navbar } from "~/components/Navbar";
import { db, type PluginHolder } from "~/utils/db";

function PluginList() {
  const { type, id } = Route.useParams();
  const plugins = useLiveQuery(() => db.plugin_infos.toArray());
  const parent = useLiveQuery<PluginHolder | undefined>(
    () =>
      match(type)
        .with("prefab", () => db.prefabs.get(id))
        .with("provider", () => db.ai_providers.get(id))
        .with("chat", () => db.chats.get(id))
        .otherwise(() => undefined),
    [type, id],
  );

  const onToggle = async (pluginId: string, enabled: boolean) => {
    if (!parent) return;
    const newPlugins = { ...parent.plugins };
    if (enabled) {
      newPlugins[pluginId] = {};
    } else {
      delete newPlugins[pluginId];
    }
    await match(type)
      .with("prefab", () => db.prefabs.update(id, { plugins: newPlugins }))
      .with("provider", () =>
        db.ai_providers.update(id, { plugins: newPlugins }),
      )
      .with("chat", () => db.chats.update(id, { plugins: newPlugins }))
      .otherwise(() => Promise.resolve());
  };

  return (
    <>
      <Navbar
        title={`管理插件: ${parent?.name}`}
        enableBack
        navigationFallback={(go) =>
          match([type, id])
            .with(["chat", P.string], () =>
              go({ to: "/chat/$id", params: { id } }),
            )
            .with(["prefab", P.string], () =>
              go({ to: "/setting/prefab/$id", params: { id } }),
            )
            .with(["provider", P.string], () =>
              go({ to: "/setting/provider/$id", params: { id } }),
            )
            .otherwise(() => go({ to: "/setting" }))
        }
      />
      <main className="padding">
        <table className="striped">
          <thead>
            <tr>
              <th>启用</th>
              <th>名称</th>
              <th>描述</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {plugins?.map((p) => (
              <tr key={p.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={!!parent?.plugins?.[p.id]}
                    onChange={(e) => onToggle(p.id, e.target.checked)}
                  />
                </td>
                <td>{p.name}</td>
                <td>{p.description}</td>
                <td>
                  <Link
                    to="/setting/config-plugin/config/$type/$id/$pluginId"
                    params={{ type, id, pluginId: p.id }}
                  >
                    <button>配置</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
}

export const Route = createFileRoute(
  "/_main/setting/config-plugin/list/$type/$id",
)({
  component: PluginList,
});
