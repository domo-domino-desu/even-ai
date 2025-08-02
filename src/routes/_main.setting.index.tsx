import { Link, createFileRoute } from "@tanstack/react-router";
import { Navbar } from "~/components/Navbar";

function SettingsPage() {
  return (
    <>
      <Navbar title="设置" />
      <main className="padding responsive">
        <article className="border no-padding">
          <ul className="list border">
            <li>
              <Link
                to="/setting/generic"
                className="row-padding un-flex un-justify-between"
              >
                <div>通用设置</div>
                <div className="max" />
                <i>chevron_right</i>
              </Link>
            </li>
            <li>
              <Link
                to="/setting/plugin"
                className="row-padding un-flex un-justify-between"
              >
                <div>插件设置</div>
                <div className="max" />
                <i>chevron_right</i>
              </Link>
            </li>
            <li>
              <Link
                to="/setting/provider"
                className="row-padding un-flex un-justify-between"
              >
                <div>提供者设置</div>
                <div className="max" />
                <i>chevron_right</i>
              </Link>
            </li>
            <li>
              <Link
                to="/setting/prefab"
                className="row-padding un-flex un-justify-between"
              >
                <div>预组设置</div>
                <div className="max" />
                <i>chevron_right</i>
              </Link>
            </li>
          </ul>
        </article>
      </main>
    </>
  );
}

export const Route = createFileRoute("/_main/setting/")({
  component: SettingsPage,
});
