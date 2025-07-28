import { javascript } from "@codemirror/lang-javascript";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useCallback, useState } from "react";
import { v7 as uuid } from "uuid";
import { Gap } from "~/components/Gap";
import { Navbar } from "~/components/Navbar";
import { db } from "~/utils/db";

const CodeMirror = React.lazy(() => import("@uiw/react-codemirror"));

function DownloadPlugin() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const onCodeChange = useCallback((val: string) => {
    setCode(val);
  }, []);

  async function fetchContent() {
    try {
      // TODO: add cors proxy
      const response = await fetch(url);
      const text = await response.text();
      setCode(text);
    } catch (error) {
      console.error("Failed to fetch content:", error);
      setCode("Failed to fetch content.");
    }
  }

  async function handleCreate() {
    if (!name || !code) {
      // Basic validation
      alert("名称和内容不能为空");
      return;
    }
    await db.plugins.add({
      id: uuid(),
      name,
      description,
      tags: [],
      content: code,
      contentHash: "temp-hash", // TODO: calculate hash
      configSchema: {}, // TODO: parse from code
      globalConfig: {},
    });
    navigate({ to: "/setting/plugin" });
  }

  return (
    <>
      <Navbar
        title="从网络导入插件"
        enableBack
        navigationFallback={(go) => go({ to: "/setting/plugin" })}
      />
      <main className="padding">
        <div className="row">
          <div className="field label border max">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <label>链接</label>
          </div>
          <button onClick={fetchContent}>获取</button>
        </div>
        <Gap h={3} />
        <div className="field label border">
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <label>名称</label>
        </div>
        <div className="field label border">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <label>描述</label>
        </div>
        <Gap h={3} />
        <CodeMirror
          value={code}
          width="calc(100vw - 2.5rem)"
          className="un-overflow-hidden"
          extensions={[javascript({ jsx: true })]}
          onChange={onCodeChange}
        />
        <Gap h={3} />
        <nav className="right-align">
          <button onClick={handleCreate}>创建</button>
        </nav>
      </main>
    </>
  );
}

export const Route = createFileRoute("/_main/setting/plugin/download")({
  component: DownloadPlugin,
});
