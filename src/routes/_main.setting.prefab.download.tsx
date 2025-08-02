import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { v7 as uuid } from "uuid";
import { Gap } from "~/components/Gap";
import { Navbar } from "~/components/Navbar";
import { db } from "~/utils/db";

interface ImportedPlugin {
  name: string;
  description: string;
  content: string;
  config: Record<string, any>;
}

interface ImportedPrefab {
  name: string;
  description: string;
  plugins: ImportedPlugin[];
}

function DownloadPrefab() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [importedData, setImportedData] = useState<ImportedPrefab | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchContent() {
    setImportedData(null);
    setError(null);
    try {
      // TODO: add cors proxy
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ImportedPrefab = await response.json();
      // TODO: Add validation for the data structure
      setImportedData(data);
    } catch (e) {
      console.error("Failed to fetch or parse content:", e);
      setError(e instanceof Error ? e.message : "获取或解析内容失败");
    }
  }

  async function handleCreate() {
    if (!importedData) return;

    const newPrefabId = uuid();
    const plugins: Record<string, Record<string, any>> = {};

    for (const pluginSpec of importedData.plugins) {
      const newPluginId = uuid();
      await db.plugins.add({
        id: newPluginId,
        name: pluginSpec.name,
        description: pluginSpec.description,
        content: pluginSpec.content,
        tags: [],
        configSchema: {}, // TODO: parse from code
        globalConfig: {},
      });
      plugins[newPluginId] = pluginSpec.config;
    }

    await db.prefabs.add({
      id: newPrefabId,
      name: importedData.name,
      description: importedData.description,
      tags: [],
      plugins,
    });

    navigate({ to: "/setting/prefab" });
  }

  return (
    <>
      <Navbar
        title="从网络导入插件集"
        enableBack
        navigationFallback={(go) => go({ to: "/setting/prefab" })}
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

        {error && <p className="error-message">{error}</p>}

        {importedData && (
          <div>
            <h5>{importedData.name}</h5>
            <p>{importedData.description}</p>
            <Gap h={2} />
            <h6>要导入的插件:</h6>
            <ul>
              {importedData.plugins.map((p, i) => (
                <li key={i}>{p.name}</li>
              ))}
            </ul>
            <Gap h={3} />
            <nav className="right-align">
              <button onClick={handleCreate}>创建</button>
            </nav>
          </div>
        )}
      </main>
    </>
  );
}

export const Route = createFileRoute("/_main/setting/prefab/download")({
  component: DownloadPrefab,
});
