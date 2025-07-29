import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import toast from "react-hot-toast";

import { StringInput } from "~/components/beer-input/StringInput";
import { Gap } from "~/components/Gap";
import { Navbar } from "~/components/Navbar";
import { PluginForm } from "~/components/PluginForm";
import { usePublishEvent } from "~/state/event-bus";

function DownloadPlugin() {
  const [url, setUrl] = useState("");
  const publish = usePublishEvent();

  async function fetchContent() {
    try {
      if (!url) {
        toast.error("请输入插件 URL");
        return;
      }
      const response = await fetch(url);
      const content = await response.text();
      publish("plugin:download", { content });
    } catch (error) {
      console.error("Failed to fetch content:", error);
    }
  }

  return (
    <>
      <Navbar
        title="从网络导入插件"
        enableBack
        navigationFallback={(go) => go({ to: "/setting/plugin" })}
      />
      <main className="padding">
        <nav>
          <StringInput
            className="max"
            label="插件 URL"
            value={url}
            onChange={setUrl}
          />
          <button onClick={fetchContent}>导入</button>
        </nav>
        <Gap h={4} />
        <hr />
        <div />
        <PluginForm />
      </main>
    </>
  );
}

export const Route = createFileRoute("/_main/setting/plugin/download")({
  component: DownloadPlugin,
});
