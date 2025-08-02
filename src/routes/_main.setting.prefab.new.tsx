import { createFileRoute } from "@tanstack/react-router";
import { v7 as uuid } from "uuid";
import { Navbar } from "~/components/Navbar";
import { PrefabForm } from "~/components/PrefabForm";
import { db } from "~/utils/db";

function NewPrefab() {
  return (
    <>
      <Navbar
        title="新建预组"
        enableBack
        navigationFallback={(go) => go({ to: "/setting/prefab" })}
      />
      <main className="padding responsive">
        <PrefabForm
          isNew
          onSave={async (prefab) => {
            await db.prefabs.add({ ...prefab, id: uuid() });
          }}
        />
      </main>
    </>
  );
}

export const Route = createFileRoute("/_main/setting/prefab/new")({
  component: NewPrefab,
});
