import { useAtom } from "jotai";
import React, { useState } from "react";
import { match, P } from "ts-pattern";

import toast from "react-hot-toast";

import { useMount } from "ahooks";
import { Gap } from "~/components/Gap";
import {
  type CryptoInfo,
  cryptoInfoAtom,
  cryptoManagerAtom,
} from "~/state/crypto";
import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  createSalt,
  CryptoManager,
  VERIFICATION_TEXT,
} from "~/utils/crypto-manager";

export function GateKeeper({ children }: { children?: React.ReactNode }) {
  const [input, setInput] = useState("");
  const [cryptoInfo, setCryptoInfo] = useAtom(cryptoInfoAtom);
  const [cryptoManager, setCryptoManager] = useAtom(cryptoManagerAtom);

  useMount(() => {
    // Initialize crypto manager if not already set
    if (cryptoInfo?.type === "raw" && !cryptoManager) {
      CryptoManager.create("raw").then(setCryptoManager);
    }
  });

  async function handleRaw() {
    await setCryptoInfo({ type: "raw" });
    const manager = await CryptoManager.create("raw");
    setCryptoManager(manager);
  }

  async function handleSetup(password: string) {
    if (!password) {
      toast.error("密码不能为空");
      return;
    }
    const salt = await createSalt();
    const manager = await CryptoManager.create("encrypted", password, salt);
    await setCryptoInfo({
      type: "encrypted",
      salt: arrayBufferToBase64(salt),
      encryptedText: await manager.encrypt(VERIFICATION_TEXT),
    });
    setCryptoManager(manager);
  }

  async function handleCheck(cryptoInfo: CryptoInfo, password: string) {
    if (cryptoInfo?.type !== "encrypted") {
      throw new Error("Password check is only applicable for encrypted mode.");
    }
    const salt = new Uint8Array(base64ToArrayBuffer(cryptoInfo.salt));
    try {
      const manager = await CryptoManager.create(
        "encrypted",
        password,
        salt,
        cryptoInfo.encryptedText,
      );
      setCryptoManager(manager);
      setInput("");
    } catch (e) {
      console.error("密码验证失败", e);
      toast.error("密码错误，请重试");
    }
  }

  return (
    match(cryptoInfo)
      // First visit, set password
      .with(P.nullish, () => {
        return (
          <main className="responsive padding">
            <Gap h={2} />
            <h4>请设置密码</h4>
            <Gap h={2} />
            <ul>
              <li>
                密码用于加密 API 密钥，确保财产安全。目前对话记录不会加密。
              </li>
              <li>请牢记密码，忘记后绝无恢复可能。</li>
              <li>
                请避免和其他服务使用相同密码，以防本站密码被攻破后影响其他服务。
              </li>
            </ul>
            <Gap h={2} />
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await handleSetup(input);
              }}
            >
              <div className="field label border">
                <input
                  type="password"
                  onInput={(e) => setInput(e.currentTarget.value)}
                />
                <label>密码</label>
              </div>
              <nav className="right-align">
                <button className="border" onClick={handleRaw} type="button">
                  我要裸奔
                </button>
                <button type="submit">设置密码</button>
              </nav>
            </form>
          </main>
        );
      })
      // Raw mode, no crypto manager
      .with({ type: "raw" }, () => {
        return children;
      })
      // Encrypted mode, check password
      .with({ type: "encrypted" }, (info) =>
        cryptoManager ? (
          children
        ) : (
          <main className="responsive">
            <Gap h={2} />
            <h4>请输入密码</h4>
            <Gap h={2} />
            若忘记密码，可以选择清除网站数据重新开始。数据将无法恢复。
            <Gap h={2} />
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await handleCheck(info, input);
              }}
            >
              <div className="field label border">
                <input
                  type="password"
                  onInput={(e) => setInput(e.currentTarget.value)}
                />
                <label>密码</label>
              </div>
              <nav className="right-align">
                <button type="submit">确认</button>
              </nav>
            </form>
          </main>
        ),
      )
      .exhaustive()
  );
}
