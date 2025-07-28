import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "~/components/Navbar";
import { PrefabForm, usePrefabForm } from "~/components/PrefabForm";

function NewPrefab() {
  const form = usePrefabForm();

  return (
    <>
      <Navbar
        title="新建预组"
        enableBack
        navigationFallback={(go) => go({ to: "/setting/prefab" })}
      />
      <main className="padding">
        <PrefabForm form={form} isNew />
      </main>
    </>
  );
}

export const Route = createFileRoute("/_main/setting/prefab/new")({
  component: NewPrefab,
});
