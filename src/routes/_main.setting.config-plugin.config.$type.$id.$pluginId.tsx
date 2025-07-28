import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { match } from "ts-pattern";
import { ConfigForm } from "~/components/ConfigForm";
import { Navbar } from "~/components/Navbar";
import { db, type PluginHolder, type PluginInfo } from "~/utils/db";

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
      // if (!got) return undefined;
      // return { type: "plugin", plugin: await db.plugins.get(id) };
      return got ? { type: "plugin", plugin: got } : undefined;
    }
    const host = await match(type)
      .with("prefab", () => db.prefabs.get(id))
      .with("provider", () => db.ai_providers.get(id))
      .with("chat", () => db.chats.get(id))
      .otherwise(() => undefined);
    return host ? { type: "host", host } : undefined;
  }, [type, id]);
  const navigate = useNavigate();

  if (!plugin || !parent) {
    return <div>Loading...</div>;
  }

  const afterSubmit = () => {
    match(type)
      .with("plugin", () => navigate({ to: "/setting/plugin" }))
      .otherwise(() =>
        navigate({
          to: "/setting/config-plugin/list/$type/$id",
          params: { type, id },
        }),
      );
  };

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
        // title={`配置 ${plugin.name} for ${
        //   parent.type === "plugin" ? parent.plugin.name : parent.host.name
        // }`}
        title="插件配置"
        enableBack
        navigationFallback={(go) =>
          go({
            to: "/setting/config-plugin/list/$type/$id",
            params: { type, id },
          })
        }
      />
      <main className="vertical">
        正在配置 {plugin.name} for{" "}
        {parent.type === "plugin" ? parent.plugin.name : parent.host.name}
        <ConfigForm
          configSchema={plugin.configSchema}
          initialValues={globalConfig as any}
          onSave={onSave}
          afterSubmit={afterSubmit}
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
