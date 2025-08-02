import { useAutoAnimate } from "@formkit/auto-animate/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import toast from "react-hot-toast";
import { Navbar } from "~/components/Navbar";
import { db, type Provider } from "~/utils/db";
import { insertMockProviders } from "~/utils/mock-data";
import { ICON_NAME } from "~/utils/ui-utils";

function deleteProvider(providerId: string) {
  db.ai_providers.delete(providerId).catch((error) => {
    toast.error("删除模型提供者失败");
    console.error("Failed to delete provider:", error);
  });
}

function ProviderCard({ provider }: { provider: Provider }) {
  const navigate = useNavigate({ from: "/setting/provider" });

  return (
    <article
      onClick={() => {
        navigate({ to: "/setting/provider/$id", params: { id: provider.id } });
      }}
    >
      <nav>
        <h6 className="max">{provider.name}</h6>
        <button className="circle transparent">
          <i>{ICON_NAME.edit}</i>
        </button>
        <button
          className="circle transparent"
          onClick={(e) => {
            e.stopPropagation();
            deleteProvider(provider.id);
          }}
        >
          <i>{ICON_NAME.delete}</i>
        </button>
      </nav>
      <p>{provider.description}</p>
    </article>
  );
}

function EmptyCard() {
  return (
    <article>
      <nav>
        <div className="max">
          <h6>空空如也…</h6>
        </div>
      </nav>
      <p>
        点击右上角的 “<i>add</i>” 新建模型提供者。
      </p>
    </article>
  );
}

export function ProviderList() {
  const [parent] = useAutoAnimate<HTMLElement>();
  const providers = useLiveQuery(() => db.ai_providers.toArray());

  return (
    <>
      <Navbar
        title="模型提供者"
        enableBack
        navigationFallback={(go) => go({ to: "/setting" })}
      >
        {import.meta.env.DEV && (
          <button className="circle transparent" onClick={insertMockProviders}>
            <i>{ICON_NAME.debug}</i>
          </button>
        )}
        <button className="circle transparent">
          <Link to="/setting/provider/new">
            <i>{ICON_NAME.add}</i>
          </Link>
        </button>
      </Navbar>
      <main className="padding" ref={parent}>
        {providers &&
          (providers.length ? (
            providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))
          ) : (
            <EmptyCard />
          ))}
      </main>
    </>
  );
}

export const Route = createFileRoute("/_main/setting/provider/")({
  component: ProviderList,
});
