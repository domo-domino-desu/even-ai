import { createFileRoute } from "@tanstack/react-router";
import { v7 as uuid } from "uuid";

import { Navbar } from "~/components/Navbar";
import { PluginForm } from "~/components/PluginForm";
import { db } from "~/utils/db";

function DownloadPlugin() {
  return (
    <>
      <Navbar
        title="新建插件"
        enableBack
        navigationFallback={(go) => go({ to: "/setting/plugin" })}
      />
      <main className="padding">
        <PluginForm
          isNew
          onSave={async (pluginInfo) => {
            await db.plugins.add({ ...pluginInfo, id: uuid() });
          }}
        />
      </main>
    </>
  );
}

export const Route = createFileRoute("/_main/setting/plugin/new")({
  component: DownloadPlugin,
});
