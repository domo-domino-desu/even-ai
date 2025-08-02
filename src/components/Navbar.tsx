import { useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { clsx } from "clsx";
import { useRef } from "react";
import { useBeerSize } from "~/utils/ui-utils";

function getNavStyle(size: ReturnType<typeof useBeerSize>) {
  return clsx("top padding un-max-w-100vw un-overflow-scroll", {
    surface: size.m || size.l,
  });
}

export function Navbar({
  title,
  children,
  enableBack,
  navigationFallback,
}: {
  title: string;
  children?: React.ReactNode;
  enableBack?: boolean;
  navigationFallback?: (go: ReturnType<typeof useNavigate>) => void;
}) {
  const size = useBeerSize();
  const container = useRef(null);
  const go = useNavigate();
  const router = useRouter();
  const canGoBack = useCanGoBack();

  const showBackButton = enableBack && (canGoBack || navigationFallback);

  return (
    <nav className={getNavStyle(size)} ref={container}>
      {showBackButton && (
        <button
          className="circle transparent"
          onClick={() => {
            if (canGoBack) {
              router.history.back();
            } else if (navigationFallback) {
              navigationFallback(go);
            }
          }}
        >
          <i>arrow_back</i>
        </button>
      )}
      <h5 className="un-flex-grow-1! un-min-w-0! un-overflow-hidden! un-text-ellipsis! un-flex-[unset]! un-whitespace-nowrap! un-text-left">
        {title}
      </h5>
      {children}
    </nav>
  );
}
