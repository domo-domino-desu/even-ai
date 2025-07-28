// oxlint-disable no-children-prop
import { javascript } from "@codemirror/lang-javascript";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import React, { useCallback, useEffect, useState } from "react";
import { v7 as uuid } from "uuid";
import { Gap } from "~/components/Gap";
import type { ConfigSchema } from "~/utils/ai/plugin";
import { db, type PluginInfo } from "~/utils/db";

const CodeMirror = React.lazy(() => import("@uiw/react-codemirror"));

export function usePluginForm<TSchema extends ConfigSchema>(
  plugin?: PluginInfo<TSchema>,
  afterSubmit?: () => void,
) {
  const navigate = useNavigate();
  const [code, setCode] = useState(plugin?.content ?? "");
  const onCodeChange = useCallback((val: string) => {
    setCode(val);
  }, []);

  useEffect(() => {
    if (plugin) {
      setCode(plugin.content);
    }
  }, [plugin]);

  const form = useForm({
    defaultValues: plugin ?? {
      name: "",
      description: "",
      tags: [],
      content: "",
    },
    onSubmit: async ({ value }) => {
      if (plugin) {
        await db.plugins.update(plugin.id, {
          name: value.name,
          description: value.description,
          tags: value.tags,
          content: code,
          contentHash: "temp-hash", // TODO: calculate hash
          configSchema: {}, // TODO: parse from code
        });
      } else {
        await db.plugins.add({
          id: uuid(),
          ...value,
          content: code,
          contentHash: "temp-hash", // TODO: calculate hash
          configSchema: {}, // TODO: parse from code
          globalConfig: {},
        });
      }
      afterSubmit?.();
      navigate({ to: "/setting/plugin" });
    },
  });

  return { form, code, onCodeChange };
}

export function PluginForm({
  form,
  isNew,
  code,
  onCodeChange,
}: {
  form: ReturnType<typeof usePluginForm>["form"];
  isNew: boolean;
  code: string;
  onCodeChange: (val: string) => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="name"
        children={(field) => (
          <div className="field label border">
            <input
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <label>名称</label>
          </div>
        )}
      />
      <form.Field
        name="description"
        children={(field) => (
          <div className="field label border">
            <input
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <label>描述</label>
          </div>
        )}
      />
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
        <button type="submit">{isNew ? "创建" : "保存"}</button>
      </nav>
    </form>
  );
}
