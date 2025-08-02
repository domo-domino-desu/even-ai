import { useState } from "react";
import { match } from "ts-pattern";

import { BooleanInput } from "~/components/beer-input/BooleanInput";
import { NumberInput } from "~/components/beer-input/NumberInput";
import { StringInput } from "~/components/beer-input/StringInput";
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

  async function handleSubmit() {
    onSave(state);
    afterSubmit?.();
  }

  if (!configSchema) {
    return null;
  }

  if (Object.keys(configSchema).length === 0) {
    return <div className="empty">没有配置项</div>;
  }

  return (
    <main>
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
                      <StringInput
                        label={key}
                        description={s.description}
                        value={
                          (state[key] as string) ??
                          initialValues[key] ??
                          configSchema[key].default
                        }
                        onChange={(value) => handleChange(key, value)}
                        disabled={!isAble(key)}
                        small
                      />
                    ))
                    .with({ type: "number" }, (s) => (
                      <NumberInput
                        label={key}
                        description={s.description}
                        value={
                          (state[key] as number) ??
                          initialValues[key] ??
                          configSchema[key].default
                        }
                        onChange={(value) => handleChange(key, value)}
                        disabled={!isAble(key)}
                        small
                      />
                    ))
                    .with({ type: "boolean" }, (s) => (
                      <BooleanInput
                        label={key}
                        description={s.description}
                        value={
                          (state[key] as boolean) ??
                          initialValues[key] ??
                          configSchema[key].default
                        }
                        onChange={(value) => handleChange(key, value)}
                        disabled={!isAble(key)}
                        small
                      />
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
        <button onClick={handleSubmit}>保存配置</button>
      </nav>
    </main>
  );
}
