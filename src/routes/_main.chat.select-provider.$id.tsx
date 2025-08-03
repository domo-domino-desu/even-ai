import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import toast from "react-hot-toast";
import { Navbar } from "~/components/Navbar";
import { db } from "~/utils/db";

function SelectProvider() {
  const { id } = Route.useParams();
  const providers = useLiveQuery(() => db.ai_providers.toArray());
  const navigate = useNavigate();

  async function handleSelect(selectedProviderId: string) {
    await db.chats.update(id, {
      providerId: selectedProviderId,
    });

    toast.success("AI 提供商切换成功");
    navigate({ to: `/chat/${id}` });
  }

  return (
    <>
      <Navbar
        title="选择 AI 提供商"
        enableBack
        navigationFallback={(go) => go({ to: `/chat/${id}` })}
      />
      <main className="padding">
        <div className="card-list">
          {providers?.map((provider) => (
            <article
              key={provider.id}
              onClick={() => handleSelect(provider.id)}
            >
              <h6>{provider.name}</h6>
              <p>{provider.description}</p>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}

export const Route = createFileRoute("/_main/chat/select-provider/$id")({
  component: SelectProvider,
});
