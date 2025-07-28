// oxlint-disable no-children-prop
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { v7 as uuid } from "uuid";
import type { ProviderType } from "~/utils/ai/provider";
import { db, type Provider } from "~/utils/db";

export function useProviderForm(provider?: Provider, afterSubmit?: () => void) {
  const navigate = useNavigate();
  return useForm({
    defaultValues: provider ?? {
      name: "",
      description: "",
      tags: [],
      providerType: "openai" as ProviderType,
      baseURL: "",
      encryptedApiKey: "",
      model: "",
      providerSettings: {},
      plugins: {},
    },
    onSubmit: async ({ value }) => {
      if (provider) {
        await db.ai_providers.update(provider.id, {
          id: provider.id,
          ...value,
        });
      } else {
        await db.ai_providers.add({ id: uuid(), ...value });
      }
      afterSubmit?.();
      navigate({ to: "/setting/provider" });
    },
  });
}

export function ProviderForm({
  form,
  isNew,
}: {
  form: ReturnType<typeof useProviderForm>;
  isNew: boolean;
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
        name="providerType"
        children={(field) => (
          <div className="field label suffix border">
            <select
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) =>
                field.handleChange(e.target.value as ProviderType)
              }
            >
              <option value="openai">OpenAI</option>
              <option value="google">Google</option>
            </select>
            <label>提供者类型</label>
          </div>
        )}
      />
      <form.Field
        name="name"
        children={(field) => (
          <div className="field label border">
            <input
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <label>名称</label>
            <span className="helper">提供者名称</span>
          </div>
        )}
      />
      <form.Field
        name="baseURL"
        children={(field) => (
          <div className="field label border">
            <input
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <label>Base URL</label>
          </div>
        )}
      />
      <form.Field
        name="encryptedApiKey"
        children={(field) => (
          <div className="field label border">
            <input
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <label>API Key</label>
          </div>
        )}
      />
      <form.Field
        name="model"
        children={(field) => (
          <div className="field label border">
            <input
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <label>Model</label>
          </div>
        )}
      />
      <nav className="right-align">
        <button type="submit">{isNew ? "创建" : "保存"}</button>
      </nav>
    </form>
  );
}
