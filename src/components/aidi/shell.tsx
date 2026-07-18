"use client";

import {
  Activity,
  BadgeDollarSign,
  BarChart3,
  Bot,
  Building2,
  ChevronLeft,
  CircleHelp,
  Clock3,
  Home,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  PanelsTopLeft,
  Pencil,
  Pin,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  UserRound,
  WandSparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { conversations as initialConversations, currentUser } from "./mockData";
import type { AppRoute, ConversationItem } from "./types";
import { AidiLogo, Button, ConfirmDialog, IconButton, RenameDialog, SearchField, cx, handleMenuKeyDown, useMenuFocus } from "./ui";

const primaryNav = [
  { href: "/home" as AppRoute, label: "首页", icon: Home },
  { href: "/chat" as AppRoute, label: "AI 对话", icon: MessageSquareText },
  { href: "/agents" as AppRoute, label: "智能体", icon: Bot },
  { href: "/create" as AppRoute, label: "内容生成", icon: WandSparkles },
  { href: "/history" as AppRoute, label: "历史与成果", icon: Clock3 },
];

function pathIsActive(pathname: string, href: AppRoute) {
  if (href === "/home") return pathname === "/" || pathname.startsWith("/home");
  return pathname.startsWith(href);
}

export function GlobalNavigation() {
  const pathname = usePathname();
  const [userOpen, setUserOpen] = useState(false);
  const userMenuRef = useMenuFocus<HTMLDivElement>(userOpen);

  return (
    <nav className="aidi-global-nav" aria-label="主导航">
      <Link href="/home" className="aidi-global-nav__logo" aria-label="返回 AIDI 首页">
        <AidiLogo compact />
      </Link>
      <div className="aidi-global-nav__primary">
        {primaryNav.map((item) => {
          const Icon = item.icon;
          const active = pathIsActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cx("aidi-nav-item", active && "is-active")}
              aria-current={active ? "page" : undefined}
              title={item.label}
            >
              <span className="aidi-nav-item__icon">
                <Icon aria-hidden="true" />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="aidi-global-nav__secondary">
        {currentUser.permissions.createAgents && (
          <Link
            href="/creator"
            className={cx("aidi-nav-item", pathname.startsWith("/creator") && "is-active")}
            title="智能体工作台"
          >
            <span className="aidi-nav-item__icon">
              <PanelsTopLeft aria-hidden="true" />
            </span>
            <span>智能体工作台</span>
          </Link>
        )}
        <Link
          href="/help"
          className={cx("aidi-nav-item", pathname.startsWith("/help") && "is-active")}
          title="帮助与反馈"
        >
          <span className="aidi-nav-item__icon">
            <CircleHelp aria-hidden="true" />
          </span>
          <span>帮助与反馈</span>
        </Link>
        <div className="aidi-user-menu-wrap">
          <button
            type="button"
            className={cx("aidi-user-trigger", userOpen && "is-active")}
            onClick={() => setUserOpen((current) => !current)}
            aria-expanded={userOpen}
            aria-haspopup="menu"
          >
            <span>{currentUser.name.slice(0, 1)}</span>
            <small>{currentUser.name}</small>
          </button>
          {userOpen && (
            <>
            <button type="button" className="aidi-menu-scrim" aria-label="关闭用户菜单" onClick={() => setUserOpen(false)} />
            <div ref={userMenuRef} className="aidi-user-menu" role="menu" onKeyDown={(event) => handleMenuKeyDown(event, () => setUserOpen(false))}>
              <div className="aidi-user-menu__profile">
                <span>于</span>
                <div>
                  <strong>{currentUser.name}</strong>
                  <small>{currentUser.department}</small>
                </div>
              </div>
              {currentUser.permissions.managePlatform && (
                <Link href="/admin" role="menuitem" onClick={() => setUserOpen(false)}>
                  <Settings2 aria-hidden="true" /> 平台管理后台
                </Link>
              )}
              <button type="button" role="menuitem" onClick={() => setUserOpen(false)}>
                <UserRound aria-hidden="true" /> 个人设置
              </button>
            </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export function AppShell({
  children,
  sidebar,
  sidebarOpen = true,
  className,
}: {
  children: ReactNode;
  sidebar?: ReactNode;
  sidebarOpen?: boolean;
  className?: string;
}) {
  return (
    <div className={cx("aidi-app-shell", Boolean(sidebar) && "has-sidebar", !sidebarOpen && "sidebar-collapsed", className)}>
      <a href="#aidi-main" className="aidi-skip-link">
        跳到主要内容
      </a>
      <GlobalNavigation />
      {sidebar && <aside className="aidi-secondary-slot">{sidebar}</aside>}
      <main id="aidi-main" className="aidi-main-panel">
        {children}
      </main>
    </div>
  );
}

export function MobileSidebarTrigger({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <IconButton label={open ? "收起侧栏" : "展开侧栏"} className="aidi-sidebar-trigger" onClick={onToggle}>
      {open ? <PanelLeftClose aria-hidden="true" /> : <PanelLeftOpen aria-hidden="true" />}
    </IconButton>
  );
}

export function ConversationSidebar({
  activeId,
  onSelect,
  onNew,
  onToast,
  onClose,
}: {
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onToast: (message: string, tone?: "default" | "success" | "error") => void;
  onClose?: () => void;
}) {
  const [items, setItems] = useState<ConversationItem[]>(initialConversations);
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const contextMenuRef = useMenuFocus<HTMLDivElement>(Boolean(menu));

  const filtered = useMemo(
    () => items.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  );
  const groups: ConversationItem["group"][] = ["置顶", "今天", "过去 7 天", "过去 30 天", "更早"];
  const current = items.find((item) => item.id === menu?.id);

  function openMenu(id: string, target: HTMLButtonElement) {
    const rect = target.getBoundingClientRect();
    setMenu({ id, top: Math.min(rect.top, window.innerHeight - 144), left: rect.right + 8 });
  }

  function togglePin(id: string) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? { ...item, pinned: !item.pinned, group: item.pinned ? "今天" : "置顶" }
          : item,
      ),
    );
    setMenu(null);
    onToast(current?.pinned ? "已取消置顶" : "已置顶会话", "success");
  }

  function openRename(id: string) {
    setRenameId(id);
    setRenameValue(items.find((item) => item.id === id)?.title ?? "");
    setMenu(null);
  }

  function confirmRename() {
    if (!renameId || !renameValue.trim()) return;
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === renameId ? { ...item, title: renameValue.trim() } : item)),
    );
    setRenameId(null);
    onToast("会话名称已更新", "success");
  }

  function remove(id: string) {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
    setDeleteId(null);
    setMenu(null);
    onToast("会话已删除", "success");
  }

  return (
    <div className="aidi-conversation-sidebar">
      <div className="aidi-conversation-sidebar__top">
        <div className="aidi-sidebar-actions">
          <Button tone="primary" icon={<Plus aria-hidden="true" />} onClick={onNew}>
            新建对话
          </Button>
          <IconButton label="搜索会话" onClick={() => setSearchOpen((currentOpen) => !currentOpen)}>
            {searchOpen ? <X aria-hidden="true" /> : <Search aria-hidden="true" />}
          </IconButton>
          {onClose && (
            <IconButton label="关闭会话侧栏" className="aidi-sidebar-close" onClick={onClose}>
              <X aria-hidden="true" />
            </IconButton>
          )}
        </div>
        {searchOpen && (
          <SearchField value={query} onChange={setQuery} placeholder="搜索历史会话" label="搜索历史会话" />
        )}
      </div>
      <div className="aidi-conversation-list">
        {groups.map((group) => {
          const groupItems = filtered.filter((item) => item.group === group);
          if (!groupItems.length) return null;
          return (
            <section key={group} className="aidi-conversation-group">
              <h2>{group}</h2>
              <div>
                {groupItems.map((item) => (
                  <div key={item.id} className={cx("aidi-conversation-item", item.id === activeId && "is-active")}>
                    <button type="button" onClick={() => onSelect(item.id)} title={item.title}>
                      {item.title}
                    </button>
                    <IconButton
                      label={`管理 ${item.title}`}
                      onClick={(event) => openMenu(item.id, event.currentTarget)}
                    >
                      <MoreHorizontal aria-hidden="true" />
                    </IconButton>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
        {!filtered.length && <p className="aidi-sidebar-empty">没有找到匹配的会话</p>}
      </div>
      {menu && typeof document !== "undefined"
        ? createPortal(
            <>
              <button className="aidi-menu-scrim" aria-label="关闭会话菜单" onClick={() => setMenu(null)} />
              <div
                ref={contextMenuRef}
                className="aidi-context-menu"
                role="menu"
                style={{ top: menu.top, left: menu.left }}
                onKeyDown={(event) => handleMenuKeyDown(event, () => setMenu(null))}
              >
                <button type="button" role="menuitem" onClick={() => togglePin(menu.id)}>
                  <Pin aria-hidden="true" /> {current?.pinned ? "取消置顶" : "置顶"}
                </button>
                <button type="button" role="menuitem" onClick={() => openRename(menu.id)}>
                  <Pencil aria-hidden="true" /> 重命名
                </button>
                <button type="button" role="menuitem" className="is-danger" onClick={() => setDeleteId(menu.id)}>
                  <Trash2 aria-hidden="true" /> 删除
                </button>
              </div>
            </>,
            document.body,
          )
        : null}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="删除这条会话？"
        description="删除后将无法在历史记录中继续这条对话。"
        confirmLabel="删除会话"
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove(deleteId)}
      />
      <RenameDialog
        open={Boolean(renameId)}
        title="重命名会话"
        value={renameValue}
        onChange={setRenameValue}
        onClose={() => setRenameId(null)}
        onConfirm={confirmRename}
      />
    </div>
  );
}

export function AgentTaskSidebar({
  activeId,
  onNew,
  onSelect,
  onClose,
}: {
  activeId: string;
  onNew: () => void;
  onSelect?: (id: string) => void;
  onClose?: () => void;
}) {
  const tasks = [
    { id: "current", title: "电动车行业竞品分析", meta: "今天 10:24" },
    { id: "channel", title: "渠道策略资料研究", meta: "昨天 16:08" },
    { id: "trend", title: "海外市场趋势报告", meta: "7 月 11 日" },
  ];
  return (
    <div className="aidi-conversation-sidebar">
      <div className="aidi-conversation-sidebar__top">
        <div className="aidi-sidebar-actions">
          <Button tone="primary" icon={<Plus aria-hidden="true" />} onClick={onNew}>
            新建任务
          </Button>
          {onClose && (
            <IconButton label="关闭任务侧栏" className="aidi-sidebar-close" onClick={onClose}>
              <X aria-hidden="true" />
            </IconButton>
          )}
        </div>
      </div>
      <div className="aidi-agent-sidebar-heading">
        <span className="aidi-agent-mini-mark">
          <Sparkles aria-hidden="true" />
        </span>
        <div>
          <strong>深度研究助手</strong>
          <small>研究与分析</small>
        </div>
      </div>
      <div className="aidi-conversation-list">
        <section className="aidi-conversation-group">
          <h2>最近任务</h2>
          <div>
            {tasks.map((task) => (
              <button
                key={task.id}
                type="button"
                className={cx("aidi-task-sidebar-item", task.id === activeId && "is-active")}
                onClick={() => onSelect?.(task.id)}
              >
                <span>{task.title}</span>
                <small>{task.meta}</small>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function WorkspaceSidebar({
  title,
  items,
  active,
  onChange,
  onBack,
  onClose,
}: {
  title: string;
  items: Array<{ id: string; label: string; icon?: ReactNode; meta?: string }>;
  active: string;
  onChange: (id: string) => void;
  onBack?: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="aidi-workspace-sidebar">
      <div className="aidi-workspace-sidebar__header">
        {onBack && (
          <IconButton label="返回" onClick={onBack}>
            <ChevronLeft aria-hidden="true" />
          </IconButton>
        )}
        <div>
          <span className="aidi-eyebrow">AIDI</span>
          <strong>{title}</strong>
        </div>
        {onClose && (
          <IconButton label="关闭工具侧栏" className="aidi-sidebar-close" onClick={onClose}>
            <X aria-hidden="true" />
          </IconButton>
        )}
      </div>
      <nav aria-label={`${title}二级导航`}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cx("aidi-workspace-nav-item", active === item.id && "is-active")}
            onClick={() => onChange(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.meta && <small>{item.meta}</small>}
          </button>
        ))}
      </nav>
    </div>
  );
}

export function AdminShell({ children, active, onChange }: { children: ReactNode; active: string; onChange: (id: string) => void }) {
  const items = [
    { id: "overview", label: "运行概览", icon: <Home aria-hidden="true" /> },
    { id: "users", label: "用户与组织权限", icon: <UserRound aria-hidden="true" /> },
    { id: "models", label: "模型与能力配置", icon: <Sparkles aria-hidden="true" /> },
    { id: "knowledge", label: "企业知识库", icon: <Building2 aria-hidden="true" /> },
    { id: "agents", label: "智能体审核", icon: <Bot aria-hidden="true" /> },
    { id: "security", label: "内容与安全策略", icon: <Settings2 aria-hidden="true" /> },
    { id: "cost", label: "使用量与成本", icon: <BadgeDollarSign aria-hidden="true" /> },
    { id: "quality", label: "质量评估", icon: <Activity aria-hidden="true" /> },
    { id: "analytics", label: "运营数据", icon: <BarChart3 aria-hidden="true" /> },
  ];
  return (
    <div className="aidi-admin-shell">
      <aside className="aidi-admin-nav">
        <Link href="/home" className="aidi-admin-nav__brand">
          <AidiLogo compact />
          <div>
            <strong>AIDI 管理后台</strong>
            <small>企业 AI 平台</small>
          </div>
        </Link>
        <nav aria-label="管理后台导航">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cx("aidi-admin-nav__item", item.id === active && "is-active")}
              onClick={() => onChange(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <Link href="/home" className="aidi-admin-nav__back">
          <ChevronLeft aria-hidden="true" /> 返回员工前台
        </Link>
      </aside>
      <main className="aidi-admin-main">{children}</main>
    </div>
  );
}

export function PanelMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <IconButton label="打开菜单" className="aidi-panel-menu-button" onClick={onClick}>
      <Menu aria-hidden="true" />
    </IconButton>
  );
}
