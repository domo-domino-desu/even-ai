import { useNavigate } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { v7 as uuid } from "uuid";
import { cryptoManagerAtom } from "~/state/crypto";
import { PROVIDER_INFO, type ProviderType } from "~/utils/ai/provider";
import { db, type Provider } from "~/utils/db";
import { StringInput } from "./beer-input/StringInput";

export function ProviderForm({
  provider,
  isNew,
  afterSubmit,
}: {
  provider?: Provider;
  isNew: boolean;
  afterSubmit?: () => void;
}) {
  const cryptoAtom = useAtomValue(cryptoManagerAtom);
  const navigate = useNavigate();
  const [state, setState] = useState(
    provider ?? {
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
  );

  async function handleSubmit() {
    if (provider) {
      await db.ai_providers.update(provider.id, {
        id: provider.id,
        ...state,
        encryptedApiKey: await cryptoAtom!.encrypt(state.encryptedApiKey),
      });
    } else {
      await db.ai_providers.add({ id: uuid(), ...state });
    }
    afterSubmit?.();
    navigate({ to: "/setting/provider" });
  }

  return (
    <>
      <div className="field label suffix border">
        <select
          value={state.providerType}
          onChange={(e) =>
            setState((prev) => ({
              ...prev,
              providerType: e.target.value as ProviderType,
            }))
          }
        >
          <option value="openai">OpenAI</option>
          <option value="gemini">Google</option>
        </select>
        <label>提供者类型</label>
        <i>arrow_drop_down</i>
      </div>
      <StringInput
        label="名称"
        value={state.name}
        onChange={(value) => setState((prev) => ({ ...prev, name: value }))}
      />
      <StringInput
        label="Base URL"
        description={PROVIDER_INFO[state.providerType]?.urlTip}
        value={state.baseURL}
        onChange={(value) => setState((prev) => ({ ...prev, baseURL: value }))}
      />
      <StringInput
        label="API Key"
        value={state.encryptedApiKey}
        onChange={(value) =>
          setState((prev) => ({ ...prev, encryptedApiKey: value }))
        }
      />
      <StringInput
        label="Model"
        value={state.model}
        onChange={(value) => setState((prev) => ({ ...prev, model: value }))}
      />
      <nav className="right-align">
        <button onClick={handleSubmit}>{isNew ? "创建" : "保存"}</button>
      </nav>
    </>
  );
}
