// oxlint-disable no-children-prop
import { useNavigate } from "@tanstack/react-router";
import React, { useCallback, useState } from "react";

import { javascript } from "@codemirror/lang-javascript";
import toast from "react-hot-toast";
import { v7 as uuid } from "uuid";

import { StringInput } from "~/components//beer-input/StringInput";
import { Gap } from "~/components/Gap";
import { useListenToEvent } from "~/state/event-bus";
import type { ConfigSchema } from "~/utils/ai/plugin";
import { loadPluginFromString } from "~/utils/ai/plugin-utils";
import { db, type PluginInfo } from "~/utils/db";

const CodeMirror = React.lazy(() => import("@uiw/react-codemirror"));

const defaultValues: PluginInfo<any> = {
  id: uuid(),
  name: "",
  description: "",
  tags: [],
  content: "",
  configSchema: {},
  globalConfig: {},
};

export function PluginForm<TSchema extends ConfigSchema>({
  initialValues = {} as PluginInfo<TSchema>,
  afterSubmit,
}: {
  initialValues?: PluginInfo<TSchema>;
  afterSubmit?: () => void;
}) {
  const [state, setState] = useState<PluginInfo<TSchema>>(initialValues);
  const navigate = useNavigate();

  const setContent = useCallback(
    ({ content }: { content: string }) => {
      setState((prev) => ({ ...prev, content }));
    },
    [setState],
  );

  useListenToEvent("plugin:download", setContent);

  return (
    <>
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
          onClick={async () => {
            try {
              const plugin = await loadPluginFromString(state.content);
              const configSchema = plugin.configSchema as TSchema;
              await db.plugins.put({
                ...defaultValues,
                ...state,
                id: state.id || uuid(),
                configSchema,
              });
              await afterSubmit?.();
              navigate({ to: "/setting/plugin" });
            } catch (error) {
              toast.error("保存插件失败，请检查代码是否正确");
              console.error("Error saving plugin:", error);
            }
          }}
        >
          保存配置
        </button>
      </nav>
    </>
  );
}
