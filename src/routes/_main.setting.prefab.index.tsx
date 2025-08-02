import { useAutoAnimate } from "@formkit/auto-animate/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import toast from "react-hot-toast";
import { Navbar } from "~/components/Navbar";
import { db, type Prefab } from "~/utils/db";
import { insertMockPrefabs } from "~/utils/mock-data";

function deletePrefab(prefabId: string) {
  db.prefabs.delete(prefabId).catch((error) => {
    toast.error("删除预组失败");
    console.error("Failed to delete prefab:", error);
  });
}

function PrefabCard({ prefab }: { prefab: Prefab }) {
  const navigate = useNavigate({ from: "/setting/prefab" });

  return (
    <article
      onClick={() => {
        navigate({
          to: "/setting/prefab/$id",
          params: { id: prefab.id },
        });
      }}
    >
      <nav>
        <h6 className="max">{prefab.name}</h6>
        <button className="circle transparent">
          <i>edit</i>
        </button>
        <button
          className="circle transparent"
          onClick={(e) => {
            e.stopPropagation();
            deletePrefab(prefab.id);
          }}
        >
          <i>delete</i>
        </button>
      </nav>
      <p>{prefab.description}</p>
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
        点击右上角的 “<i>add</i>” 新建预组， 或点击 “<i>download</i>”
        从连接下载。
      </p>
    </article>
  );
}

export function PrefabList() {
  const [parent] = useAutoAnimate<HTMLElement>();
  const prefabs = useLiveQuery(() => db.prefabs.toArray());

  return (
    <>
      <Navbar
        title="预组"
        enableBack
        navigationFallback={(go) => go({ to: "/setting" })}
      >
        {import.meta.env.DEV && (
          <button className="circle transparent" onClick={insertMockPrefabs}>
            <i>bug_report</i>
          </button>
        )}
        <button className="circle transparent">
          <Link to="/setting/prefab/download">
            <i>download</i>
          </Link>
        </button>
        <button className="circle transparent">
          <Link to="/setting/prefab/new">
            <i>add</i>
          </Link>
        </button>
      </Navbar>
      <main className="padding responsive" ref={parent}>
        {prefabs &&
          (prefabs.length ? (
            prefabs.map((prefab) => (
              <PrefabCard key={prefab.id} prefab={prefab} />
            ))
          ) : (
            <EmptyCard />
          ))}
      </main>
    </>
  );
}

export const Route = createFileRoute("/_main/setting/prefab/")({
  component: PrefabList,
});
