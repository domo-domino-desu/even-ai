// oxlint-disable no-children-prop
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { v7 as uuid } from "uuid";
import { db, type Prefab } from "~/utils/db";

export function usePrefabForm(prefab?: Prefab, afterSubmit?: () => void) {
  const navigate = useNavigate();
  return useForm({
    defaultValues: prefab ?? {
      name: "",
      description: "",
      tags: [],
      plugins: {},
    },
    onSubmit: async ({ value }) => {
      if (prefab) {
        await db.prefabs.update(prefab.id, { ...value });
      } else {
        await db.prefabs.add({ id: uuid(), ...value });
      }
      afterSubmit?.();
      navigate({ to: "/setting/prefab" });
    },
  });
}

export function PrefabForm({
  form,
  isNew,
}: {
  form: ReturnType<typeof usePrefabForm>;
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
      {/* <form.Field
        name="tags"
        children={(field) => (
          <div className="field label border">
            <input
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <label>标签</label>
            <span className="helper">逗号分隔</span>
          </div>
        )}
      /> */}
      <nav className="right-align">
        <button type="submit">{isNew ? "创建" : "保存"}</button>
      </nav>
    </form>
  );
}
