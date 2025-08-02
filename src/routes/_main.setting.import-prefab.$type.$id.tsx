import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { match, P } from "ts-pattern";
import { v7 as uuid } from "uuid";
import { Navbar } from "~/components/Navbar";
import { db } from "~/utils/db";

function ImportPrefab() {
  const { type, id } = Route.useParams();
  const prefabs = useLiveQuery(() => db.prefabs.toArray());
  const navigate = useNavigate();

  async function handleImport(selectedPrefabId: string) {
    const selectedPrefab = await db.prefabs.get(selectedPrefabId);
    if (!selectedPrefab) return;

    if (type === "chat" && id === "new") {
      const now = new Date().toISOString();
      const newChatId = await db.chats.add({
        id: uuid(),
        name: selectedPrefab.name,
        tags: selectedPrefab.tags,
        history: { messages: [] },
        createdAt: now,
        updatedAt: now,
        plugins: selectedPrefab.plugins,
      });
      navigate({ to: `/chat/${newChatId}` });
    } else {
      await match(type)
        .with("prefab", () =>
          db.prefabs.update(id, { plugins: selectedPrefab.plugins }),
        )
        .with("provider", () =>
          db.ai_providers.update(id, { plugins: selectedPrefab.plugins }),
        )
        .with("chat", () =>
          db.chats.update(id, { plugins: selectedPrefab.plugins }),
        )
        .otherwise(() => Promise.resolve());

      navigate({ to: `/setting/${type}/${id}` });
    }
  }

  return (
    <>
      <Navbar
        title="导入预组"
        enableBack
        navigationFallback={(go) =>
          match([type, id])
            .with(["chat", "new"], () => go({ to: "/chat" }))
            .with(["chat", P.string], () =>
              go({ to: "/chat/$id", params: { id } }),
            )
            .with(["prefab", P.string], () =>
              go({ to: "/setting/prefab/$id", params: { id } }),
            )
            .with(["provider", P.string], () =>
              go({ to: "/setting/provider/$id", params: { id } }),
            )
            .otherwise(() => go({ to: "/setting" }))
        }
      />
      <main className="padding responsive">
        <div className="card-list">
          {prefabs?.map((prefab) => (
            <article key={prefab.id} onClick={() => handleImport(prefab.id)}>
              <h6>{prefab.name}</h6>
              <p>{prefab.description}</p>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}

export const Route = createFileRoute("/_main/setting/import-prefab/$type/$id")({
  component: ImportPrefab,
});
