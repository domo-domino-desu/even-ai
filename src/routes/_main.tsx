import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { clsx } from "clsx";
import { useAtom } from "jotai";
import { match } from "ts-pattern";

import { GateKeeper } from "~/components/GateKeeper";
import { modeAtom } from "~/state/mode";
import { ICON_NAME, useBeerSize } from "~/utils/ui-utils";

export const Route = createFileRoute("/_main")({
  component: MainLayout,
});

function Mode() {
  const [mode, setMode] = useAtom(modeAtom);

  const icon = match(mode)
    .with("light", () => "light_mode")
    .with("dark", () => "dark_mode")
    .otherwise(() => "routine");

  const next = match(mode)
    .with("light", () => "dark" as const)
    .with("dark", () => "auto" as const)
    .otherwise(() => "light" as const);

  const toggleMode = async () => {
    ui("mode", next);
    await setMode(next);
  };

  return (
    <button className="transparent" onClick={toggleMode}>
      <i>{icon}</i>
    </button>
  );
}

export function NavRail() {
  const size = useBeerSize();

  return (
    <>
      <nav
        className={clsx({
          "bottom primary-container": size.s,
          left: size.m,
          "left max": size.l,
        })}
      >
        <Link to="/chat">
          <i>{ICON_NAME.chat}</i>
          <span>对话</span>
        </Link>
        <Link to="/log">
          <i>{ICON_NAME.log}</i>
          <span>日志</span>
        </Link>
        <Link to="/setting">
          <i>{ICON_NAME.setting}</i>
          <span>设置</span>
        </Link>
        {(size.m || size.l) && (
          <>
            <div className="max" />
            <Mode />
          </>
        )}
      </nav>
    </>
  );
}

export default function MainLayout() {
  return (
    <GateKeeper>
      <NavRail />
      <Outlet />
    </GateKeeper>
  );
}
