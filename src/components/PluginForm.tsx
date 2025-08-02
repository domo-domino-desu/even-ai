import React, { useCallback, useState } from "react";

import { javascript } from "@codemirror/lang-javascript";
import toast from "react-hot-toast";
import { v7 as uuid } from "uuid";

import { StringInput } from "~/components//beer-input/StringInput";
import { Gap } from "~/components/Gap";
import type { ConfigSchema, Plugin } from "~/utils/ai/plugin";
import { loadPluginFromString } from "~/utils/ai/plugin-utils";
import { type PluginInfo } from "~/utils/db";

const CodeMirror = React.lazy(() => import("@uiw/react-codemirror"));

const pluginTemplate = `export default createPlugin({
  name: "Plugin Name",
  descriptions: "Description of the plugin.",
  configSchema: {},
  inboundHooks: [],
  outboundHooks: [],
  anyHooks: [],
});
`;

const defaultValues: PluginInfo<any> = {
  id: uuid(),
  name: "请填写名称",
  description: "请填写描述",
  tags: [],
  content: pluginTemplate,
  configSchema: {},
  globalConfig: {},
};

export function PluginForm<TSchema extends ConfigSchema>({
  initialValues = {} as PluginInfo<TSchema>,
  isNew,
  onSave,
  afterSubmit,
}: {
  initialValues?: PluginInfo<TSchema>;
  isNew?: boolean;
  onSave: (pluginInfo: Omit<PluginInfo<TSchema>, "id">) => Promise<any>;
  afterSubmit?: () => void;
}) {
  const [state, setState] = useState<PluginInfo<TSchema>>(
    isNew ? defaultValues : initialValues,
  );

  async function handleSubmit(info: Omit<PluginInfo<TSchema>, "id">) {
    onSave(info);
    afterSubmit?.();
  }

  const updateContent = useCallback(
    (plugin: Plugin<TSchema>) => ({
      configSchema: plugin.configSchema,
      description: plugin.description,
      name: plugin.name,
    }),
    [],
  );

  async function loadAndApplyPluginInfo() {
    try {
      const plugin = await loadPluginFromString<TSchema>(state.content);
      const infoFromContent = updateContent(plugin);
      setState((prev) => ({ ...prev, ...infoFromContent }));
      return infoFromContent;
    } catch (error) {
      toast.error("加载插件失败，请检查代码是否正确");
      console.error("Error loading plugin:", error);
      return null;
    }
  }

  async function fetchContent() {
    try {
      if (!state.source) {
        toast.error("请输入插件 URL");
        return;
      }
      const response = await fetch(state.source);
      const content = await response.text();
      setState((prev) => ({ ...prev, content }));
      toast.success("插件内容已加载");
    } catch (error) {
      console.error("Failed to fetch content:", error);
    }
  }

  return (
    <>
      <nav>
        <StringInput
          className="max"
          label="插件 URL"
          value={state.source || ""}
          onChange={(value) => setState((prev) => ({ ...prev, source: value }))}
        />
        <button onClick={fetchContent}>导入</button>
      </nav>
      <Gap h={4} />
      <hr />
      <div />
      <StringInput
        label="名称"
        value={state.name}
        onChange={(value) => setState((prev) => ({ ...prev, name: value }))}
      />
      <StringInput
        label="描述"
        value={state.description}
        onChange={(value) =>
          setState((prev) => ({ ...prev, description: value }))
        }
      />
      <Gap h={3} />
      <CodeMirror
        value={state.content}
        width="calc(100vw - 2.5rem)"
        className="un-overflow-hidden"
        extensions={[javascript({ jsx: false })]}
        onChange={(value) => setState((prev) => ({ ...prev, content: value }))}
      />
      <Gap h={3} />
      <nav className="right-align">
        <button
          type="button"
          className="border"
          onClick={loadAndApplyPluginInfo}
        >
          <i>upload</i>
        </button>
        <button
          type="button"
          onClick={async () => {
            const infoFromContent = await loadAndApplyPluginInfo();
            if (infoFromContent) {
              handleSubmit({ ...state, ...infoFromContent });
            }
          }}
        >
          保存配置
        </button>
      </nav>
    </>
  );
}
