import { clsx } from "clsx";
import React from "react";
import { useBeerActive, useBeerSize } from "~/utils/ui-utils";

export function DialogButtons({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <nav className="right-align">
      <button className="border" onClick={onClose}>
        Cancel
      </button>
      <button onClick={onConfirm}>Confirm</button>
    </nav>
  );
}

export function Dialog<T extends Record<string, number | string | boolean>>({
  show,
  title,
  children,
  onClose,
  onConfirm,
}: {
  show: boolean;
  title: string;
  children?: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const size = useBeerSize();
  const { isActive, isShown } = useBeerActive(show);

  return (
    isShown && (
      <dialog
        className={clsx({
          max: size.s,
          right: size.m || size.l,
          active: isActive,
        })}
      >
        <header>
          <nav>
            <button onClick={onClose} className="circle border">
              <i>arrow_back</i>
            </button>
            <h5>{title}</h5>
          </nav>
        </header>
        {children}
        <nav className="right-align">
          <button className="border" onClick={onClose}>
            Cancel
          </button>
          <button onClick={onConfirm}>Confirm</button>
        </nav>
      </dialog>
    )
  );
}
