import {
  createFileRoute,
  Link,
  useCanGoBack,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useSize } from "ahooks";
import { clsx } from "clsx";

import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useRef, useState } from "react";
import { match } from "ts-pattern";

import { Gap } from "~/components/Gap";
import { Navbar } from "~/components/Navbar";
import type { Message } from "~/utils/ai/chat";
import { db } from "~/utils/db";
import { ICON_NAME, useBeerSize } from "~/utils/ui-utils";
import { FlexStringInput } from "../components/beer-input/FlexStringInput";

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

  return match(message)
    .with({ role: "user" }, (msg) => (
      <>
        <nav className={clsx("right-align")}>
          <div className="datetime">{msg.datetime}</div>
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
          <div className="datetime">{msg.datetime}</div>
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

function Chat() {
  const size = useBeerSize();

  const { id } = Route.useParams();
  const chat = useLiveQuery(() => db.chats.get(id), [id], null);

  const [input, setInput] = useState<string>("");

  // JS hacks to make:
  // 1. bottom bar share the same width & left position as the messages
  // 2. messages has a bottom padding equal to the height of the bottom bar
  // 3. bottom bar is fixed at the bottom of the screen
  const container = useRef<HTMLElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const containerSize = useSize(container);
  const bottomSize = useSize(bottom);
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    // get position
    const rect = container.current?.getBoundingClientRect();
    if (rect?.left) {
      setLeft(rect.left);
    }
  }, [container, containerSize]);

  return (
    <>
      <Navbar
        title={chat?.name ?? "未找到对话"}
        enableBack
        navigationFallback={(go) => go({ to: "/chat" })}
      >
        {chat && (
          <>
            <button className="circle transparent">
              <Link
                to="/setting/import-prefab/$type/$id"
                params={{ type: "chat", id }}
              >
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
          </>
        )}
      </Navbar>
      {chat !== null &&
        (chat ? (
          <main className="no-padding" ref={container}>
            <div className="padding">
              {chat?.history?.messages?.map((message) => (
                <Message key={message.id} message={message} />
              ))}
            </div>
            <div
              className={
                bottomSize && `un-h-[calc(${bottomSize?.height}px+1rem)]`
              }
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
                <button className={clsx("large", { circle: size.s })}>
                  <i>arrow_upward</i>
                </button>
              </nav>
            </div>
          </main>
        ) : (
          <NotFound />
        ))}
    </>
  );
}

export const Route = createFileRoute("/_main/chat/$id")({
  component: Chat,
});
