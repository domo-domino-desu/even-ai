import type { ConfigFromSchema, ConfigSchema, Plugin } from "./plugin";

export async function loadPluginFromString<TSchema extends ConfigSchema>(
  code: string,
): Promise<Plugin<TSchema>> {
  const blob = new Blob([code], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const module = await import(/* @vite-ignore */ url);
  URL.revokeObjectURL(url);
  return module.default;
}

export function getDefaultConfig<TSchema extends ConfigSchema>(
  schema: TSchema,
): ConfigFromSchema<TSchema> {
  return Object.fromEntries(
    Object.entries(schema).map(([key, item]) => [key, item.default]),
  ) as ConfigFromSchema<TSchema>;
}
