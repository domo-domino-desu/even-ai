// oxlint-disable no-children-prop
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { v7 as uuid } from "uuid";
import type { ProviderType } from "~/utils/ai/provider";
import { db, type Provider } from "~/utils/db";
import { StringInput } from "./beer-input/StringInput";

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
            <i>arrow_drop_down</i>
          </div>
        )}
      />
      <form.Field
        name="name"
        children={(field) => (
          <StringInput
            label="名称"
            description="提供者名称"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={field.handleChange}
            disabled={form.state.isSubmitting}
          />
        )}
      />
      <form.Field
        name="baseURL"
        children={(field) => (
          <StringInput
            label="Base URL"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={field.handleChange}
            disabled={form.state.isSubmitting}
          />
        )}
      />
      <form.Field
        name="encryptedApiKey"
        children={(field) => (
          <StringInput
            label="API Key"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={field.handleChange}
            disabled={form.state.isSubmitting}
          />
        )}
      />
      <form.Field
        name="model"
        children={(field) => (
          <StringInput
            label="Model"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={field.handleChange}
            disabled={form.state.isSubmitting}
          />
        )}
      />
      <nav className="right-align">
        <button type="submit">{isNew ? "创建" : "保存"}</button>
      </nav>
    </form>
  );
}
