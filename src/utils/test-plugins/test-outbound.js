import dedent from "https://esm.sh/dedent@1";
import { create } from "https://esm.sh/mutative@1";
import { stringify } from "https://esm.sh/yaml@2";

/** @type {import("../ai/plugin.ts").Plugin} */
export default createPlugin({
  name: "修改传出内容插件",
  description: "传出内容修改",
  configSchema: {},
  inboundHooks: [],
  outboundHooks: [
    {
      order: 10,
      handler: async function injectWorldInfo(chat) {
        return create(chat, (draft) => {
          if (!draft._metadata.worldInfo) {
            draft._metadata.worldInfo = {};
          }
          draft._metadata.worldInfo.用户口令 =
            "用户的口令是“天王盖地虎，宝塔镇河妖”";
        });
      },
    },
    {
      order: 80,
      handler: async function useWorldInfo(chat) {
        const { worldInfo } = chat._metadata || {};
        if (!worldInfo) return chat;
        const prompt =
          (chat.messages[0]?.content || "") +
          "\n" +
          dedent`
        在进行回答时，请考虑以下背景信息：
        <背景信息>
        ${stringify(worldInfo, { indent: 2 })}
        </背景信息>
        `;
        return create(chat, (draft) => {
          draft.messages[0].content = prompt;
          draft.messages[0].role = "system";
        });
      },
    },
  ],
  anyHooks: [],
  additionalComponents: {},
});
