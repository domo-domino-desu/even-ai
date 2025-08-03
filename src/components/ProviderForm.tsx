import { useAtomValue } from "jotai";
import { useState } from "react";
import { match } from "ts-pattern";

import { BooleanInput } from "~/components/beer-input/BooleanInput";
import { StringInput } from "~/components/beer-input/StringInput";
import { cryptoInfoAtom, cryptoManagerAtom } from "~/state/crypto";
import { PROVIDER_INFO, type ProviderType } from "~/utils/ai/provider";
import { type Provider } from "~/utils/db";
import { ICON_NAME } from "~/utils/ui-utils";

const defaultValues = {
  name: "请填写名称",
  description: "请填写描述",
  tags: [],
  providerType: "openai" as ProviderType,
  baseURL: PROVIDER_INFO["openai"].defaultURL,
  encryptedApiKey: "...",
  model: "gpt-3.5-turbo",
  isStreaming: true,
  providerSettings: {},
  plugins: {},
};

export function ProviderForm({
  provider,
  isNew,
  onSave,
  afterSubmit,
}: {
  provider?: Provider;
  isNew: boolean;
  onSave: (provider: Omit<Provider, "id">) => Promise<any>;
  afterSubmit?: () => void;
}) {
  const cryptoInfo = useAtomValue(cryptoInfoAtom);
  const cryptoManager = useAtomValue(cryptoManagerAtom);
  const [keyEdited, setKeyEdited] = useState(false);
  const [state, setState] = useState(provider ?? defaultValues);

  const hiddenKey = match(cryptoInfo!.type)
    .with("raw", () => state.encryptedApiKey)
    .with("encrypted", () => "[密码已保存]")
    .exhaustive();
  const shownKey = keyEdited ? state.encryptedApiKey : hiddenKey;

  async function handleSubmit() {
    let encryptedApiKey = state.encryptedApiKey;
    if (keyEdited && cryptoManager) {
      encryptedApiKey = await cryptoManager.encrypt(state.encryptedApiKey);
      setKeyEdited(false);
      setState((prev) => ({ ...prev, encryptedApiKey }));
    }
    onSave({ ...state, encryptedApiKey });
    afterSubmit?.();
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
        <i>{ICON_NAME.dropdown}</i>
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
        value={shownKey}
        onChange={(value) => {
          setKeyEdited(true);
          setState((prev) => ({ ...prev, encryptedApiKey: value }));
        }}
      />
      <StringInput
        label="Model"
        value={state.model}
        onChange={(value) => setState((prev) => ({ ...prev, model: value }))}
      />
      <BooleanInput
        label="流式输出"
        value={state.isStreaming}
        onChange={(value) =>
          setState((prev) => ({ ...prev, isStreaming: value }))
        }
      />
      <StringInput
        label="描述"
        value={state.description}
        onChange={(value) =>
          setState((prev) => ({ ...prev, description: value }))
        }
      />
      <nav className="right-align">
        {import.meta.env.DEV && (
          <button
            className="border"
            onClick={async () =>
              console.log(await cryptoManager?.decrypt(state.encryptedApiKey))
            }
          >
            <i>{ICON_NAME.debug}</i>
          </button>
        )}
        <button onClick={handleSubmit}>{isNew ? "创建" : "保存"}</button>
      </nav>
    </>
  );
}
