import { Link, createFileRoute } from "@tanstack/react-router";
import { Navbar } from "~/components/Navbar";
import { ICON_NAME } from "~/utils/ui-utils";

function SettingsPage() {
  return (
    <>
      <Navbar title="设置" />
      <main className="padding">
        <article className="border no-padding">
          <ul className="list border">
            <li>
              <Link
                to="/setting/generic"
                className="row-padding un-flex un-justify-between"
              >
                <i>{ICON_NAME.setting}</i>
                <div>通用设置</div>
                <div className="max" />
                <i>{ICON_NAME.chevron_right}</i>
              </Link>
            </li>
            <li>
              <Link
                to="/setting/plugin"
                className="row-padding un-flex un-justify-between"
              >
                <i>{ICON_NAME.plugin}</i>
                <div>插件设置</div>
                <div className="max" />
                <i>{ICON_NAME.chevron_right}</i>
              </Link>
            </li>
            <li>
              <Link
                to="/setting/provider"
                className="row-padding un-flex un-justify-between"
              >
                <i>{ICON_NAME.provider}</i>
                <div>提供者设置</div>
                <div className="max" />
                <i>{ICON_NAME.chevron_right}</i>
              </Link>
            </li>
            <li>
              <Link
                to="/setting/prefab"
                className="row-padding un-flex un-justify-between"
              >
                <i>{ICON_NAME.prefab}</i>
                <div>插件集设置</div>
                <div className="max" />
                <i>{ICON_NAME.chevron_right}</i>
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
