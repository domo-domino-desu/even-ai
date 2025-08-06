import { useAutoAnimate } from "@formkit/auto-animate/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import toast from "react-hot-toast";
import { Navbar } from "~/components/Navbar";
import type { ConfigSchema } from "~/utils/ai/plugin";
import { db, type PluginInfo } from "~/utils/db";
import { insertMockPlugins } from "~/utils/mock-data";
import { ICON_NAME } from "~/utils/ui-utils";

function deletePlugin(pluginId: string) {
  db.plugin_infos.delete(pluginId).catch((error) => {
    toast.error("删除插件失败");
    console.error("Failed to delete plugin:", error);
  });
}

function PluginCard<TSchema extends ConfigSchema>({
  plugin,
}: {
  plugin: PluginInfo<TSchema>;
}) {
  const navigate = useNavigate({ from: "/setting/plugin" });

  return (
    <article
      onClick={() => {
        navigate({ to: "/setting/plugin/$id", params: { id: plugin.id } });
      }}
    >
      <nav>
        <h6 className="max">{plugin.name}</h6>
        <button className="circle transparent">
          <i>{ICON_NAME.edit}</i>
        </button>
        <button
          className="circle transparent"
          onClick={(e) => {
            e.stopPropagation();
            deletePlugin(plugin.id);
          }}
        >
          <i>{ICON_NAME.delete}</i>
        </button>
      </nav>
      <p>{plugin.description}</p>
    </article>
  );
}

function EmptyCard() {
  return (
    <article>
      <nav>
        <div className="max">
          <h6>空空如也…</h6>
        </div>
      </nav>
      <p>
        点击右上角的 “<i>{ICON_NAME.add}</i>” 新建插件， 或点击 “
        <i>{ICON_NAME.download}</i>” 从链接下载。
      </p>
    </article>
  );
}

export function PluginList() {
  const [parent] = useAutoAnimate<HTMLElement>();
  const plugins = useLiveQuery(() => db.plugin_infos.toArray());

  return (
    <>
      <Navbar
        title="插件"
        enableBack
        navigationFallback={(go) => go({ to: "/setting" })}
      >
        {import.meta.env.DEV && (
          <button className="circle transparent" onClick={insertMockPlugins}>
            <i>{ICON_NAME.debug}</i>
          </button>
        )}
        <button className="circle transparent">
          <Link to="/setting/plugin/new">
            <i>{ICON_NAME.download}</i>
          </Link>
        </button>
        <button className="circle transparent">
          <Link to="/setting/plugin/new">
            <i>{ICON_NAME.add}</i>
          </Link>
        </button>
      </Navbar>
      <main className="padding" ref={parent}>
        {plugins &&
          (plugins.length ? (
            plugins.map((plugin) => (
              <PluginCard key={plugin.id} plugin={plugin} />
            ))
          ) : (
            <EmptyCard />
          ))}
      </main>
    </>
  );
}

export const Route = createFileRoute("/_main/setting/plugin/")({
  component: PluginList,
});
