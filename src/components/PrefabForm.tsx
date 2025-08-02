import { useState } from "react";

import { StringInput } from "~/components/beer-input/StringInput";
import { type Prefab } from "~/utils/db";

const defaultValues = {
  name: "请填写名称",
  description: "请填写描述",
  tags: [],
  plugins: {},
};

export function PrefabForm({
  prefab,
  isNew,
  onSave,
  afterSubmit,
}: {
  prefab?: Prefab;
  isNew: boolean;
  onSave: (prefab: Omit<Prefab, "id">) => Promise<any>;
  afterSubmit?: () => void;
}) {
  const [state, setState] = useState(prefab ?? defaultValues);

  async function handleSubmit() {
    await onSave(state);
    afterSubmit?.();
  }

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
      <nav className="right-align">
        <button onClick={handleSubmit}>{isNew ? "创建" : "保存"}</button>
      </nav>
    </>
  );
}
