"use client";

import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  File,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  Paperclip,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Upload,
  WifiOff,
  X,
} from "lucide-react";
import Image from "next/image";
import type { ButtonHTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { useEffect, useRef } from "react";
import type { AgentItem, ToastState } from "./types";

export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function handleMenuKeyDown(event: KeyboardEvent<HTMLElement>, onClose: () => void) {
  const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[role='menuitem'], [role='menuitemradio']"));
  if (event.key === "Escape") {
    event.preventDefault();
    onClose();
    return;
  }
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
  event.preventDefault();
  const currentIndex = items.indexOf(document.activeElement as HTMLElement);
  const direction = event.key === "ArrowDown" ? 1 : -1;
  const nextIndex = currentIndex < 0
    ? direction === 1 ? 0 : items.length - 1
    : (currentIndex + direction + items.length) % items.length;
  items[nextIndex]?.focus();
}

export function useMenuFocus<T extends HTMLElement>(open: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      ref.current?.querySelector<HTMLElement>("[role='menuitem'], [role='menuitemradio']")?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);
  return ref;
}

export function AidiLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cx("aidi-logo", compact && "is-compact")} aria-label="AIDI">
      <Image src="/aidi-logo.svg" alt="" width={56} height={56} priority />
      {!compact && <span>AIDI</span>}
    </div>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  icon?: ReactNode;
  loading?: boolean;
};

export function Button({
  tone = "secondary",
  size = "md",
  icon,
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cx("aidi-button", `aidi-button--${tone}`, `aidi-button--${size}`, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoaderCircle className="aidi-spin" aria-hidden="true" /> : icon}
      <span>{children}</span>
    </button>
  );
}

export function IconButton({
  label,
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      className={cx("aidi-icon-button", className)}
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
    </button>
  );
}

export function PageHeader({
  title,
  eyebrow,
  description,
  actions,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="aidi-page-header">
      <div className="aidi-page-header__copy">
        {eyebrow && <span className="aidi-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="aidi-page-header__actions">{actions}</div>}
    </header>
  );
}

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="aidi-section-header">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "success" | "warning" | "error" | "info";
}) {
  return <span className={cx("aidi-status-badge", `is-${tone}`)}>{children}</span>;
}

export function SearchField({
  value,
  onChange,
  placeholder,
  label = "搜索",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
}) {
  return (
    <label className="aidi-search-field">
      <span className="sr-only">{label}</span>
      <Search aria-hidden="true" />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      {value && (
        <button type="button" onClick={() => onChange("")} aria-label="清空搜索">
          <X aria-hidden="true" />
        </button>
      )}
    </label>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon = "search",
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: "search" | "offline" | "sparkles";
}) {
  const Icon = icon === "offline" ? WifiOff : icon === "sparkles" ? Sparkles : Search;
  return (
    <div className="aidi-empty-state">
      <div className="aidi-empty-state__icon">
        <Icon aria-hidden="true" />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="aidi-inline-error" role="alert">
      <AlertCircle aria-hidden="true" />
      <div>
        <strong>当前操作未完成</strong>
        <p>{message}</p>
      </div>
      {onRetry && (
        <Button tone="ghost" size="sm" icon={<RefreshCw aria-hidden="true" />} onClick={onRetry}>
          重新尝试
        </Button>
      )}
    </div>
  );
}

export function ToastViewport({ toasts }: { toasts: ToastState[] }) {
  return (
    <div className="aidi-toast-viewport" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={cx("aidi-toast", `is-${toast.tone ?? "default"}`)}>
          {toast.tone === "success" ? <Check aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="aidi-dialog" onCancel={onClose} onClose={onClose}>
      <div className="aidi-dialog__icon is-danger">
        <AlertCircle aria-hidden="true" />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="aidi-dialog__actions">
        <Button tone="ghost" onClick={onClose}>
          保留内容
        </Button>
        <Button tone="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}

export function RenameDialog({
  open,
  title = "重命名",
  value,
  onChange,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title?: string;
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="aidi-dialog aidi-rename-dialog" onCancel={onClose} onClose={onClose}>
      <h2>{title}</h2>
      <label className="aidi-field">
        <span>名称</span>
        <input
          autoFocus
          maxLength={80}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && value.trim()) {
              event.preventDefault();
              onConfirm();
            }
          }}
        />
      </label>
      <div className="aidi-dialog__actions">
        <Button tone="ghost" onClick={onClose}>取消</Button>
        <Button tone="primary" disabled={!value.trim()} onClick={onConfirm}>保存名称</Button>
      </div>
    </dialog>
  );
}

export function AttachmentCard({
  name,
  meta,
  state = "ready",
  onRemove,
  onRetry,
}: {
  name: string;
  meta: string;
  state?: "uploading" | "parsing" | "ready" | "error";
  onRemove?: () => void;
  onRetry?: () => void;
}) {
  return (
    <div className={cx("aidi-attachment", state === "error" && "is-error")}>
      <div className="aidi-attachment__icon">
        <FileText aria-hidden="true" />
      </div>
      <div className="aidi-attachment__copy">
        <strong title={name}>{name}</strong>
        <span>
          {state === "uploading" && "正在上传"}
          {state === "parsing" && "正在解析"}
          {state === "ready" && meta}
          {state === "error" && "文件解析失败，请重新上传"}
        </span>
      </div>
      {state === "error" && onRetry ? (
        <IconButton label="重新上传" onClick={onRetry}>
          <RefreshCw aria-hidden="true" />
        </IconButton>
      ) : onRemove ? (
        <IconButton label="移除附件" onClick={onRemove}>
          <X aria-hidden="true" />
        </IconButton>
      ) : null}
      {(state === "uploading" || state === "parsing") && <span className="aidi-attachment__progress" />}
    </div>
  );
}

export function AgentCard({
  agent,
  favorite,
  onFavorite,
  onOpen,
}: {
  agent: AgentItem;
  favorite: boolean;
  onFavorite: () => void;
  onOpen: () => void;
}) {
  return (
    <article className={cx("aidi-agent-card", `is-${agent.tone}`)}>
      <div className="aidi-agent-card__top">
        <div className="aidi-agent-card__mark">
          <Sparkles aria-hidden="true" />
        </div>
        <button
          type="button"
          className={cx("aidi-favorite-button", favorite && "is-active")}
          aria-pressed={favorite}
          onClick={onFavorite}
        >
          <span aria-hidden="true">{favorite ? "★" : "☆"}</span>
          <span className="sr-only">{favorite ? "取消收藏" : "收藏"}</span>
        </button>
      </div>
      <div className="aidi-agent-card__copy">
        <h3>{agent.name}</h3>
        <p>{agent.description}</p>
      </div>
      <div className="aidi-tag-row">
        {agent.tags.slice(0, 3).map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <button type="button" className="aidi-card-link" onClick={onOpen}>
        开始使用 <ArrowRight aria-hidden="true" />
      </button>
    </article>
  );
}

export function FileDropButton({ onSelect, disabled = false }: { onSelect: (name: string) => void; disabled?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <IconButton label="上传文件" disabled={disabled} onClick={() => ref.current?.click()}>
        <Paperclip aria-hidden="true" />
      </IconButton>
      <input
        ref={ref}
        className="sr-only"
        type="file"
        disabled={disabled}
        accept=".doc,.docx,.pdf,.xls,.xlsx,.txt,image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onSelect(file.name);
          event.target.value = "";
        }}
      />
    </>
  );
}

export function DemoVisual({
  kind,
  onPlay,
  playing = false,
  title,
}: {
  kind: "image" | "slide" | "video";
  onPlay?: () => void;
  playing?: boolean;
  title?: string;
}) {
  return (
    <div className={cx("aidi-demo-visual", `is-${kind}`)} aria-label="内容预览">
      <div className="aidi-demo-visual__grid" />
      <div className="aidi-demo-visual__vehicle">
        <span />
        <span />
        <span />
      </div>
      {kind === "slide" && (
        <div className="aidi-demo-visual__slide-copy">
          <small>STRATEGY 2025</small>
          <strong className={title ? "aidi-slide-live-title" : undefined}>{title ?? "新品市场进入策略"}</strong>
          <p>从用户洞察到渠道落地的关键路径</p>
        </div>
      )}
      {kind === "video" && (
        <button type="button" aria-label={playing ? "暂停预览" : "播放预览"} className="aidi-play-button" onClick={onPlay}>
          <span />
        </button>
      )}
    </div>
  );
}

export function UploadPrompt({ onUpload }: { onUpload: (name?: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button type="button" className="aidi-upload-prompt" onClick={() => ref.current?.click()}>
        <Upload aria-hidden="true" />
        <span>上传参考文件</span>
        <small>支持 Word、PDF、Excel、图片和文本</small>
      </button>
      <input
        ref={ref}
        className="sr-only"
        type="file"
        accept=".doc,.docx,.pdf,.xls,.xlsx,.txt,image/*"
        onChange={(event) => {
          onUpload(event.target.files?.[0]?.name);
          event.target.value = "";
        }}
      />
    </>
  );
}

export function SelectControl({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="aidi-select-control">
      <span>{label}</span>
      <div>
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <ChevronDown aria-hidden="true" />
      </div>
    </label>
  );
}

export function SendButton({ disabled, loading, onClick }: { disabled?: boolean; loading?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className="aidi-send-button"
      aria-label={loading ? "正在发送" : "发送"}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <LoaderCircle className="aidi-spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
    </button>
  );
}

export function FileTypeIcon({ type }: { type: string }) {
  if (type.includes("图片")) return <ImageIcon aria-hidden="true" />;
  if (type.includes("文件")) return <File aria-hidden="true" />;
  return <FileText aria-hidden="true" />;
}
