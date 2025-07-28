import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "~/components/Navbar";
import { PluginForm, usePluginForm } from "~/components/PluginForm";

const pluginTemplate = `export default createPlugin({
  name: "Plugin Name",
  descriptions: "Description of the plugin.",
  configSchema: {},
  inboundHooks: [],
  outboundHooks: [],
  anyHooks: [],
});
`;

function NewPlugin() {
  const { form, code, onCodeChange } = usePluginForm({
    content: pluginTemplate,
  } as any);

  return (
    <>
      <Navbar
        title="新建插件"
        enableBack
        navigationFallback={(go) => go({ to: "/setting/plugin" })}
      />
      <main className="padding">
        <PluginForm form={form} isNew code={code} onCodeChange={onCodeChange} />
      </main>
    </>
  );
}

export const Route = createFileRoute("/_main/setting/plugin/new")({
  component: NewPlugin,
});
