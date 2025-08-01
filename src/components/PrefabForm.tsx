import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { v7 as uuid } from "uuid";
import { db, type Prefab } from "~/utils/db";
import { StringInput } from "./beer-input/StringInput";

export function PrefabForm({
  prefab,
  isNew,
  afterSubmit,
}: {
  prefab?: Prefab;
  isNew: boolean;
  afterSubmit?: () => void;
}) {
  const navigate = useNavigate();
  const [state, setState] = useState(
    prefab ?? {
      name: "",
      description: "",
      tags: [],
      plugins: {},
    },
  );

  async function handleSubmit() {
    if (prefab) {
      await db.prefabs.update(prefab.id, { ...state });
    } else {
      await db.prefabs.add({ id: uuid(), ...state });
    }
    afterSubmit?.();
    navigate({ to: "/setting/prefab" });
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
