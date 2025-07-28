import clsx from "clsx";
import { useState } from "react";

export function FlexStringInput({
  inputClass,
  textareaClass,
  value,
  onChange,
}: {
  inputClass?: string;
  textareaClass?: string;
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}) {
  const [currentType, setCurrentType] = useState<"input" | "textarea">("input");

  return currentType === "input" ? (
    <div className={clsx(inputClass, "field prefix")}>
      <i className="front" onClick={() => setCurrentType("textarea")}>
        fullscreen
      </i>
      <input type="text" value={value} onChange={onChange} />
    </div>
  ) : (
    <div className={clsx(textareaClass, "field prefix textarea extra")}>
      <i className="front" onClick={() => setCurrentType("input")}>
        fullscreen_exit
      </i>
      <textarea value={value} onChange={onChange} />
    </div>
  );
}
