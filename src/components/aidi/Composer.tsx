"use client";

import {
  BrainCircuit,
  Building2,
  ChevronDown,
  FileImage,
  Globe2,
  Paperclip,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AttachmentCard, FileDropButton, IconButton, SendButton, cx, handleMenuKeyDown, useMenuFocus } from "./ui";

const models = ["智能模式", "DeepSeek-R1 最新版", "豆包", "Kimi"];

export interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: "home" | "chat" | "agent";
  attachment?: string | null;
  onAttachmentChange?: (name: string | null) => void;
}

export function Composer({
  value,
  onChange,
  onSubmit,
  placeholder = "描述你的问题、任务或上传文件",
  loading,
  disabled,
  variant = "chat",
  attachment,
  onAttachmentChange,
}: ComposerProps) {
  const [knowledge, setKnowledge] = useState(false);
  const [internet, setInternet] = useState(false);
  const [deepThinking, setDeepThinking] = useState(false);
  const [model, setModel] = useState("智能模式");
  const [modelOpen, setModelOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [attachmentState, setAttachmentState] = useState<"uploading" | "parsing" | "ready" | "error">("ready");
  const [modelPosition, setModelPosition] = useState<{ left: number; top?: number; bottom?: number }>({ left: 0, bottom: 0 });
  const modelTriggerRef = useRef<HTMLButtonElement>(null);
  const modelMenuRef = useMenuFocus<HTMLDivElement>(modelOpen);
  const advancedPanelRef = useMenuFocus<HTMLDivElement>(advancedOpen);
  const uploadTimers = useRef<number[]>([]);

  useEffect(() => () => uploadTimers.current.forEach((timer) => window.clearTimeout(timer)), []);

  function selectAttachment(name: string) {
    uploadTimers.current.forEach((timer) => window.clearTimeout(timer));
    onAttachmentChange?.(name);
    setAttachmentState("uploading");
    uploadTimers.current = [
      window.setTimeout(() => setAttachmentState("parsing"), 450),
      window.setTimeout(() => setAttachmentState(name.includes("失败") ? "error" : "ready"), 1050),
    ];
  }

  function toggleModelMenu() {
    if (!modelOpen) {
      const rect = modelTriggerRef.current?.getBoundingClientRect();
      if (rect) {
        const left = Math.min(Math.max(8, rect.left), window.innerWidth - 184);
        setModelPosition(
          rect.top >= 204
            ? { left, bottom: window.innerHeight - rect.top + 8 }
            : { left, top: rect.bottom + 8 },
        );
      }
    }
    setModelOpen((current) => !current);
  }

  function submit() {
    if (!value.trim() && !attachment) return;
    onSubmit();
  }

  return (
    <div className={cx("aidi-composer", `aidi-composer--${variant}`, disabled && "is-disabled")}>
      {attachment && (
        <div className="aidi-composer__attachments">
          <AttachmentCard
            name={attachment}
            meta="已完成解析"
            state={attachmentState}
            onRetry={attachmentState === "error" ? () => selectAttachment(attachment) : undefined}
            onRemove={onAttachmentChange ? () => { onAttachmentChange(null); setAttachmentState("ready"); } : undefined}
          />
        </div>
      )}
      <label className="aidi-composer__input">
        <span className="sr-only">任务内容</span>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder}
          disabled={disabled || loading}
          maxLength={8000}
          rows={2}
        />
      </label>
      <div className="aidi-composer__toolbar">
        <div className="aidi-composer__left-tools">
          <button
            type="button"
            className={cx("aidi-capability-toggle", knowledge && "is-active")}
            aria-pressed={knowledge}
            disabled={disabled || loading}
            onClick={() => setKnowledge((current) => !current)}
          >
            <Building2 aria-hidden="true" />
            <span>企业知识</span>
          </button>
          <button
            type="button"
            className={cx("aidi-capability-toggle", internet && "is-active")}
            aria-pressed={internet}
            disabled={disabled || loading}
            onClick={() => setInternet((current) => !current)}
          >
            <Globe2 aria-hidden="true" />
            <span>联网搜索</span>
          </button>
          <div className="aidi-model-selector-wrap">
            <button
              type="button"
              ref={modelTriggerRef}
              className="aidi-model-selector"
              aria-expanded={modelOpen}
              aria-haspopup="menu"
              disabled={disabled || loading}
              onClick={toggleModelMenu}
            >
              <Sparkles aria-hidden="true" />
              <span>{model}</span>
              <ChevronDown aria-hidden="true" />
            </button>
            {modelOpen && typeof document !== "undefined" && createPortal(
              <>
                <button type="button" className="aidi-dropdown-scrim" aria-label="关闭模型菜单" onClick={() => setModelOpen(false)} />
                <div
                  ref={modelMenuRef}
                  className="aidi-model-menu"
                  role="menu"
                  style={{ left: modelPosition.left, bottom: modelPosition.bottom }}
                  onKeyDown={(event) => handleMenuKeyDown(event, () => setModelOpen(false))}
                >
                  <span>选择模型</span>
                  {models.map((item) => (
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={item === model}
                      key={item}
                      className={cx(item === model && "is-active")}
                      onClick={() => {
                        setModel(item);
                        setModelOpen(false);
                      }}
                    >
                      <span className="aidi-model-dot" />
                      <span>{item}</span>
                      {item === model && <span aria-hidden="true">✓</span>}
                    </button>
                  ))}
                </div>
              </>,
              document.body,
            )}
          </div>
          <div className="aidi-advanced-wrap">
            <IconButton label="高级设置" aria-expanded={advancedOpen} disabled={disabled || loading} onClick={() => setAdvancedOpen((current) => !current)}>
              <Settings2 aria-hidden="true" />
            </IconButton>
            {advancedOpen && (
              <>
              <button type="button" className="aidi-dropdown-scrim" aria-label="关闭高级设置" onClick={() => setAdvancedOpen(false)} />
              <div
                ref={advancedPanelRef}
                className="aidi-advanced-panel"
                role="dialog"
                aria-label="高级设置"
                onKeyDown={(event) => {
                  if (event.key === "Escape") setAdvancedOpen(false);
                }}
              >
                <div>
                  <strong>高级设置</strong>
                  <IconButton label="关闭高级设置" onClick={() => setAdvancedOpen(false)}>
                    <X aria-hidden="true" />
                  </IconButton>
                </div>
                <button
                  type="button"
                  className="aidi-setting-row"
                  aria-pressed={deepThinking}
                  onClick={() => setDeepThinking((current) => !current)}
                >
                  <span>
                    <BrainCircuit aria-hidden="true" />
                    <span>
                      <strong>深度思考</strong>
                      <small>适合复杂推理和结构化分析</small>
                    </span>
                  </span>
                  <span className={cx("aidi-switch", deepThinking && "is-active")} aria-hidden="true">
                    <span />
                  </span>
                </button>
              </div>
              </>
            )}
          </div>
        </div>
        <div className="aidi-composer__right-tools">
          {onAttachmentChange ? (
            <FileDropButton disabled={disabled || loading} onSelect={selectAttachment} />
          ) : (
            <IconButton label="上传文件" disabled={disabled || loading}>
              <Paperclip aria-hidden="true" />
            </IconButton>
          )}
          <IconButton label="上传图片" disabled={disabled || loading}>
            <FileImage aria-hidden="true" />
          </IconButton>
          <span className="aidi-composer__divider" />
          <SendButton disabled={disabled || (!value.trim() && !attachment)} loading={loading} onClick={submit} />
        </div>
      </div>
    </div>
  );
}
