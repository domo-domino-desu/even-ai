import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import toast from "react-hot-toast";
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
        .with("prefab", async () => {
          const prefab = await db.prefabs.get(id);
          db.prefabs.update(id, {
            plugins: { ...prefab?.plugins, ...selectedPrefab.plugins },
          });
        })
        .with("provider", async () => {
          const provider = await db.ai_providers.get(id);
          db.ai_providers.update(id, {
            plugins: { ...provider?.plugins, ...selectedPrefab.plugins },
          });
        })
        .with("chat", async () => {
          const chat = await db.chats.get(id);
          db.chats.update(id, {
            plugins: { ...chat?.plugins, ...selectedPrefab.plugins },
          });
        })
        .otherwise(() => Promise.resolve());

      toast.success("插件集导入成功");
      navigate({
        to: match([type, id])
          .with(["chat", P.string], () => `/chat/${id}`)
          .otherwise(() => `/setting/${type}/${id}`),
      });
    }
  }

  const title = match([type, id])
    .with(["chat", "new"], () => "从插件集新建对话")
    .otherwise(() => "导入插件集");

  return (
    <>
      <Navbar
        title={title}
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
      <main className="padding">
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
