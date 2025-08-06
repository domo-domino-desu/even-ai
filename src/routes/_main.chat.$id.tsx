import {
  createFileRoute,
  Link,
  useCanGoBack,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useSize } from "ahooks";
import { clsx } from "clsx";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { match } from "ts-pattern";

import { FlexStringInput } from "~/components/beer-input/FlexStringInput";
import { Gap } from "~/components/Gap";
import { Navbar } from "~/components/Navbar";
import {
  chatAtom,
  chatIdAtom,
  deleteMessageAtom,
  initChatSessionAtom,
  interruptMessageAtom,
  isSendingAtom,
  sendMessageAtom,
  userInputAtom,
} from "~/state/chat";
import type { Message } from "~/utils/ai/chat";
import { ICON_NAME, useBeerSize } from "~/utils/ui-utils";

function NotFound() {
  const router = useRouter();
  const navigate = useNavigate({ from: "/chat/$id" });
  const canGoBack = useCanGoBack();

  return (
    <main className="medium middle-align center-align vertical">
      <div className="un-text-9">( ´･･)ﾉ(._.`)</div>
      <Gap h={4} />
      <p>
        未找到对话
        <br />
        可能是不存在或已被删除
      </p>
      <Gap h={4} />
      <button
        className="primary"
        onClick={() =>
          canGoBack ? router.history.back() : navigate({ to: "/chat" })
        }
      >
        返回
      </button>
    </main>
  );
}

function Message({ message }: { message: Message }) {
  const bubbleStyle = "border";
  const deleteMessage = useSetAtom(deleteMessageAtom);

  return match(message)
    .with({ role: "user" }, (msg) => (
      <>
        <nav className={clsx("right-align")}>
          <div className="datetime">{msg.createdAt}</div>
          <button
            className="transparent circle"
            onClick={() => deleteMessage(msg.id)}
          >
            <i>delete</i>
          </button>
          <i className="large">person</i>
        </nav>
        <article className={bubbleStyle}>
          <div className="content">{msg.content}</div>
        </article>
      </>
    ))
    .with({ role: "assistant" }, (msg) => (
      <>
        <nav className={clsx("left-align")}>
          <i className="large">robot</i>
          <div className="datetime">{msg.createdAt}</div>
          <button
            className="transparent circle"
            onClick={() => deleteMessage(msg.id)}
          >
            <i>delete</i>
          </button>
        </nav>
        <article className={bubbleStyle}>
          <div className="content">{msg.content}</div>
        </article>
      </>
    ))
    .with({ role: "system" }, (msg) => (
      <article className={bubbleStyle}>
        <div className="content">{msg.content}</div>
      </article>
    ))
    .exhaustive();
}

function ChatCore() {
  const size = useBeerSize();
  const { id } = Route.useParams();

  const setChatId = useSetAtom(chatIdAtom);
  const initChat = useSetAtom(initChatSessionAtom);

  useEffect(() => {
    setChatId(id);
    initChat();
  }, [id, setChatId, initChat]);

  const chat = useAtomValue(chatAtom);
  const [input, setInput] = useAtom(userInputAtom);
  const isSending = useAtomValue(isSendingAtom);
  const sendMessage = useSetAtom(sendMessageAtom);
  const interruptMessage = useSetAtom(interruptMessageAtom);

  const container = useRef<HTMLElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const containerSize = useSize(container);
  const bottomSize = useSize(bottom);
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const rect = container.current?.getBoundingClientRect();
    if (rect?.left) {
      setLeft(rect.left);
    }
  }, [container, containerSize]);

  if (chat === null) {
    return <NotFound />;
  }

  return (
    <>
      <Navbar
        title={chat.name}
        enableBack
        navigationFallback={(go) => go({ to: "/chat" })}
      >
        <button className="circle transparent">
          <Link to="/chat/select-provider/$id" params={{ id }}>
            <i>{ICON_NAME.provider}</i>
          </Link>
        </button>
        <button className="circle transparent">
          <Link
            to="/setting/config-plugin/list/$type/$id"
            params={{ type: "chat", id }}
          >
            <i>{ICON_NAME.plugin}</i>
          </Link>
        </button>
        <button className="circle transparent">
          <Link
            to="/setting/import-prefab/$type/$id"
            params={{ type: "chat", id }}
          >
            <i>{ICON_NAME.prefab}</i>
          </Link>
        </button>
      </Navbar>
      <main className="no-padding" ref={container}>
        <div className="padding">
          {chat?.history?.messages?.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </div>
        <div
          className={bottomSize && `un-h-[calc(${bottomSize?.height}px+1rem)]`}
        />
        <div
          ref={bottom}
          className={clsx("fixed no-padding", {
            [`un-left-[${left}px]`]: (size.m || size.l) && left,
            [`un-w-[${containerSize?.width}px]`]:
              (size.m || size.l) && containerSize,
            "un-bottom-0": !size.s,
            "un-bottom-18 un-w-full": size.s,
          })}
        >
          <nav
            className={clsx("max bottom-align", {
              "surface-container small-padding": size.s,
              "primary-container small-round padding un-mx-2 un-my-4 un-shadow":
                size.m || size.l,
            })}
          >
            <FlexStringInput
              inputClass="max round border surface"
              textareaClass="max round border surface"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            {isSending ? (
              <button
                className={clsx("large", { circle: size.s })}
                onClick={() => interruptMessage()}
              >
                <i>stop</i>
              </button>
            ) : (
              <button
                className={clsx("large", { circle: size.s })}
                onClick={() => sendMessage()}
                disabled={!input.trim()}
              >
                <i>arrow_upward</i>
              </button>
            )}
          </nav>
        </div>
      </main>
    </>
  );
}

function Chat() {
  return <ChatCore />;
}

export const Route = createFileRoute("/_main/chat/$id")({
  component: Chat,
});
