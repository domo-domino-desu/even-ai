import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { match } from "ts-pattern";
import { ConfigForm } from "~/components/ConfigForm";
import { Navbar } from "~/components/Navbar";
import { db, type PluginHolder, type PluginInfo } from "~/utils/db";
import { PATH_NAME } from "~/utils/ui-utils";

function EditPluginConfig() {
  const { type, id, pluginId } = Route.useParams();
  const plugin = useLiveQuery(() => db.plugins.get(pluginId), [pluginId]);
  const parent = useLiveQuery<
    | { type: "host"; host: PluginHolder }
    | { type: "plugin"; plugin: PluginInfo<any> }
    | undefined
  >(async () => {
    if (type === "plugin") {
      const got = await db.plugins.get(id);
      return got ? { type: "plugin", plugin: got } : undefined;
    }
    const host = await match(type)
      .with("prefab", () => db.prefabs.get(id))
      .with("provider", () => db.ai_providers.get(id))
      .with("chat", () => db.chats.get(id))
      .otherwise(() => undefined);
    return host ? { type: "host", host } : undefined;
  }, [type, id]);

  if (!plugin || !parent) {
    return <div>Loading...</div>;
  }

  const globalConfig =
    parent.type === "plugin"
      ? parent.plugin.globalConfig
      : (parent.host.plugins?.[pluginId] ?? plugin.globalConfig);

  const onSave = (data: Record<string, any>) => {
    if (parent.type === "plugin") {
      return db.plugins.update(pluginId, { globalConfig: data });
    }
    const newPlugins = { ...parent.host.plugins, [pluginId]: data };
    return match(type)
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
        title="插件配置"
        enableBack
        navigationFallback={(go) =>
          go({
            to: "/setting/config-plugin/list/$type/$id",
            params: { type, id },
          })
        }
      />
      <main className="vertical padding">
        {match(parent)
          .with({ type: "plugin" }, () => `正在配置${plugin.name}的全局配置`)
          .with(
            { type: "host" },
            ({ host }) =>
              `正在配置${PATH_NAME[type as keyof typeof PATH_NAME]}
            【${host.name}】的插件【${plugin.name}】`,
          )
          .exhaustive()}
        <ConfigForm
          key={pluginId}
          configSchema={plugin.configSchema}
          initialValues={globalConfig}
          onSave={onSave}
        />
      </main>
    </>
  );
}

export const Route = createFileRoute(
  "/_main/setting/config-plugin/config/$type/$id/$pluginId",
)({
  component: EditPluginConfig,
});
