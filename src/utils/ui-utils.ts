import { useResponsive } from "ahooks";
import { useEffect, useState } from "react";

export function useBeerSize() {
  const size = useResponsive();
  if (size.l) {
    return { l: true, s: false, m: false };
  } else if (size.m) {
    return { l: false, s: false, m: true };
  } else {
    return { l: false, s: true, m: false };
  }
}

export function useBeerActive(show: boolean) {
  const [isActive, setIsActive] = useState(false);
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    if (show) {
      setIsShown(true);
      setTimeout(() => setIsActive(true), 10);
    } else {
      setIsActive(false);
      setTimeout(() => setIsShown(false), 300);
    }
  }, [show]);

  return { isActive, isShown };
}

export const PATH_NAME = {
  chat: "对话",
  provider: "模型提供者",
  prefab: "预组",
  plugin: "插件",
} as const;

export const ICON_NAME = {
  back: "arrow_back",
  dropdown: "arrow_drop_down",
  chevron_right: "chevron_right",

  add: "add",
  edit: "edit",
  delete: "delete",

  chat: "chat",
  log: "history",
  setting: "settings",
  provider: "neurology",
  prefab: "skillet",
  plugin: "extension",

  debug: "bug_report",
  download: "cloud_download",
} as const;
