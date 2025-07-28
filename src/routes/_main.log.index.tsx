import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "~/components/Navbar";

function Log() {
  return (
    <>
      <Navbar title="日志" />

      <main className="round padding margin">
        <div>TODO</div>
      </main>
    </>
  );
}

export const Route = createFileRoute("/_main/log/")({
  component: Log,
});
