import { useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import clsx from "clsx";
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
  const router = useRouter();
  const go = useNavigate();
  const canGoBack = useCanGoBack();
  const size = useBeerSize();

  const showBackButton = enableBack && (canGoBack || navigationFallback);

  return (
    <nav className={getNavStyle(size)}>
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
      <h5>{title}</h5>
      <div className="max" />
      {children}
    </nav>
  );
}
