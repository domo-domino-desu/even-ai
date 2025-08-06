import { create } from "https://esm.sh/mutative@1";

/** @type {import("../ai/plugin.ts").Plugin} */
export default createPlugin({
  name: "添加开场",
  description: "如果没有开场词，添加一个开场词",
  configSchema: {
    content: {
      type: "string",
      default: "Hello，请下达指示。",
      description: "提示词内容",
    },
  },
  inboundHooks: [],
  outboundHooks: [],
  anyHooks: [
    {
      event: "onInit",
      order: 0,
      handler: async (chat, { content }) => {
        if (chat.messages.length === 0) {
          console.log("Adding greeting message to chat");
          return create(chat, (draft) => {
            draft.messages.push({
              role: "assistant",
              content: content,
              createdAt: new Date().toISOString(),
            });
          });
        }
        console.log("Chat already has messages:", chat.messages);
        return chat;
      },
    },
  ],
  additionalComponents: {},
});
