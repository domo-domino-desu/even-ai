import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useLiveQuery } from "dexie-react-hooks";
import toast from "react-hot-toast";

import { Gap } from "~/components/Gap";
import { Navbar } from "~/components/Navbar";
import { db, type Chat } from "~/utils/db";
import { insertMockChats } from "~/utils/mock-data";

function deleteChat(chatId: string) {
  db.chats.delete(chatId).catch((error) => {
    toast.error("删除聊天失败");
    console.error("Failed to delete chat:", error);
  });
}

function ChatCard({ chat }: { chat: Chat }) {
  const navigate = useNavigate({ from: "/chat" });
  const lastMessage = chat.history.messages[chat.history.messages.length - 1];

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate({
        to: "/setting/config-plugin/list/$type/$id",
        params: { type: "chat", id: chat.id },
      });
    },
    [chat.id, navigate],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteChat(chat.id);
    },
    [chat.id],
  );

  return (
    <article
      onClick={() => navigate({ to: "/chat/$id", params: { id: chat.id } })}
    >
      <nav>
        <h6 className="max">{chat.name}</h6>
        <button className="circle transparent" onClick={handleEdit}>
          <i>edit</i>
        </button>
        <button className="circle transparent" onClick={handleDelete}>
          <i>delete</i>
        </button>
      </nav>
      <p>
        {lastMessage
          ? `${lastMessage.role}：${lastMessage.content}`
          : "无消息记录"}
      </p>
      <Gap h={2} />
      <hr />
      <div />
      <nav>
        <div className="vertical left-align">
          <label>{chat.tags.length ? chat.tags.join(", ") : "无标签"}</label>
          <label>{chat.providerId ? chat.providerId : "无提供者"}</label>
        </div>
        <div className="max" />
        <div className="vertical right-align">
          <label>创建于 {new Date(chat.createdAt).toLocaleDateString()}</label>
          <label>更新于 {new Date(chat.updatedAt).toLocaleDateString()}</label>
        </div>
      </nav>
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
        点击右上角的 “<i className="small">chat_bubble</i>” 新建空白对话，
        或点击 “<i className="small">sms</i>” 从模板创建对话。
      </p>
    </article>
  );
}

function ChatList() {
  const [parent] = useAutoAnimate();
  const chats = useLiveQuery(() => db.chats.toArray(), [], null);

  return (
    <>
      <Navbar title="对话列表">
        {import.meta.env.DEV && (
          <button className="circle transparent" onClick={insertMockChats}>
            <i>bug_report</i>
          </button>
        )}
        <button className="circle transparent">
          <i>chat_bubble</i>
        </button>
        <button className="circle transparent">
          <Link
            to="/setting/import-prefab/$type/$id"
            params={{ type: "chat", id: "new" }}
          >
            <i>sms</i>
          </Link>
        </button>
      </Navbar>

      <main ref={parent}>
        {chats !== null &&
          (chats?.length ? (
            chats.map((chat) => <ChatCard key={chat.id} chat={chat} />)
          ) : (
            <EmptyCard />
          ))}
        <Gap h={2} />
      </main>
    </>
  );
}

export const Route = createFileRoute("/_main/chat/")({
  component: ChatList,
});
