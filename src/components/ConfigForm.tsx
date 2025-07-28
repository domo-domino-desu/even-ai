import { useState } from "react";
import { match } from "ts-pattern";

import { Gap } from "~/components/Gap";
import type { ConfigFromSchema, ConfigSchema } from "~/utils/ai/plugin";

export function ConfigForm<TSchema extends ConfigSchema>({
  configSchema,
  initialValues,
  onSave,
  afterSubmit,
}: {
  configSchema: ConfigSchema;
  initialValues: Partial<ConfigFromSchema<TSchema>>;
  onSave: (data: Partial<ConfigFromSchema<TSchema>>) => Promise<any> | void;
  afterSubmit?: () => void;
}) {
  console.log(JSON.stringify({ configSchema, initialValues }, null, 2));

  const [state, setState] = useState(initialValues);

  function handleOverrideChange(key: keyof TSchema, value: boolean) {
    if (value) {
      setState({
        ...state,
        [key]: initialValues[key] ?? configSchema[key].default,
      });
    } else {
      setState({
        ...state,
        [key]: undefined,
      });
    }
  }

  function handleChange<T extends keyof TSchema>(
    key: T,
    value: TSchema[T]["default"] | undefined,
  ) {
    setState({
      ...state,
      [key]: value,
    });
  }

  function isAble<T extends keyof TSchema>(key: T): boolean {
    return state[key] !== undefined;
  }

  return (
    <main>
      {Object.keys(configSchema).length === 0 ? (
        <div className="empty">没有配置项</div>
      ) : (
        <>
          <table className="striped un-border-collapse">
            <thead>
              <tr>
                <th>覆盖</th>
                <th>配置</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(configSchema).map(([key, schema]) => {
                return (
                  <tr key={key}>
                    <td className="un-pb-7">
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          checked={isAble(key)}
                          onChange={(e) =>
                            handleOverrideChange(key, e.target.checked)
                          }
                        />
                        <span />
                      </label>
                    </td>
                    <td className="un-pb-7">
                      {match(schema)
                        .with({ type: "string" }, (s) => (
                          <div className="small field label border">
                            <input
                              type="text"
                              value={(state[key] as string) ?? ""}
                              onChange={(e) =>
                                handleChange(key, e.target.value)
                              }
                              disabled={!isAble(key)}
                            />
                            <label>{key}</label>
                            {s.description && (
                              <span className="helper">{s.description}</span>
                            )}
                          </div>
                        ))
                        .with({ type: "number" }, (s) => (
                          <div className="small field label border">
                            <input
                              type="number"
                              value={(state[key] as number) ?? 0}
                              onChange={(e) =>
                                handleChange(key, e.target.valueAsNumber)
                              }
                              disabled={!isAble(key)}
                            />
                            <label>{key}</label>
                            {s.description && (
                              <span className="helper">{s.description}</span>
                            )}
                          </div>
                        ))
                        .with({ type: "boolean" }, (s) => (
                          <div className="small field label suffix border">
                            <select
                              value={state[key] ? "true" : "false"}
                              onChange={(e) =>
                                handleChange(key, e.target.value === "true")
                              }
                              disabled={!isAble(key)}
                            >
                              <option value={"true"}>是</option>
                              <option value={"false"}>否</option>
                            </select>
                            <label>{key}</label>
                            <i>arrow_drop_down</i>
                            {s.description && (
                              <span className="helper">{s.description}</span>
                            )}
                          </div>
                        ))
                        .exhaustive()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Gap h={2} />
          <nav className="right-align">
            <button
              onClick={() => {
                onSave(state);
                afterSubmit?.();
              }}
            >
              保存配置
            </button>
          </nav>
        </>
      )}
    </main>
  );
}
