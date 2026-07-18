"use client";

import {
  ArrowRight,
  Bot,
  Check,
  Clock3,
  Download,
  FileImage,
  GitFork,
  MessageSquareText,
  MonitorPlay,
  MoreHorizontal,
  Pencil,
  Presentation,
  RefreshCw,
  Star,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { archivedHistoryItems, historyItems as initialHistory } from "../mockData";
import { AppShell } from "../shell";
import type { HistoryItem } from "../types";
import { Button, ConfirmDialog, EmptyState, IconButton, PageHeader, RenameDialog, SearchField, StatusBadge, cx, handleMenuKeyDown, useMenuFocus } from "../ui";

const topTabs = ["全部", "历史对话", "智能体任务", "生成成果", "收藏"] as const;
const typeFilters = ["全部", "AI 对话", "智能体", "PPT", "图片", "导图", "视频"] as const;

export function HistoryPage({
  onToast,
}: {
  onToast: (message: string, tone?: "default" | "success" | "error") => void;
}) {
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>(initialHistory);
  const [tab, setTab] = useState<(typeof topTabs)[number]>("全部");
  const [type, setType] = useState<(typeof typeFilters)[number]>("全部");
  const [query, setQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const inlineMenuRef = useMenuFocus<HTMLDivElement>(Boolean(menuId));

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const tabMatch =
          tab === "全部" ||
          (tab === "历史对话" && item.type === "AI 对话") ||
          (tab === "智能体任务" && item.type === "智能体") ||
          (tab === "生成成果" && ["PPT", "图片", "导图", "视频"].includes(item.type)) ||
          (tab === "收藏" && item.favorite);
        const typeMatch = type === "全部" || item.type === type;
        const queryMatch = `${item.title}${item.detail}`.toLowerCase().includes(query.toLowerCase());
        return tabMatch && typeMatch && queryMatch;
      }),
    [items, query, tab, type],
  );

  function toggleFavorite(id: string) {
    const item = items.find((entry) => entry.id === id);
    setItems((current) => current.map((entry) => entry.id === id ? { ...entry, favorite: !entry.favorite } : entry));
    setMenuId(null);
    onToast(item?.favorite ? "已取消收藏" : "已加入收藏", "success");
  }

  function remove() {
    if (!deleteId) return;
    setItems((current) => current.filter((entry) => entry.id !== deleteId));
    setDeleteId(null);
    setMenuId(null);
    onToast("记录已删除", "success");
  }

  function openRename(item: HistoryItem) {
    setMenuId(null);
    setRenameId(item.id);
    setRenameValue(item.title);
  }

  function confirmRename() {
    if (!renameId || !renameValue.trim()) return;
    setItems((current) => current.map((item) => item.id === renameId ? { ...item, title: renameValue.trim() } : item));
    setRenameId(null);
    onToast("名称已更新", "success");
  }

  function loadMore() {
    setLoadingMore(true);
    window.setTimeout(() => {
      setItems((current) => [...current, ...archivedHistoryItems.filter((item) => !current.some((entry) => entry.id === item.id))]);
      setLoadingMore(false);
      setHasMore(false);
      onToast("已加载更早的记录", "success");
    }, 700);
  }

  return (
    <AppShell>
      <div className="aidi-page aidi-history-page">
        <div className="aidi-wide-content">
          <PageHeader
            eyebrow="统一任务记录"
            title="历史与成果"
            description="查找并继续你的对话、智能体任务和生成成果。"
          />
          <div className="aidi-history-toolbar">
            <div className="aidi-tabs" role="tablist" aria-label="历史类型">
              {topTabs.map((item) => (
                <button key={item} type="button" role="tab" aria-selected={tab === item} className={cx(tab === item && "is-active")} onClick={() => setTab(item)}>{item}</button>
              ))}
            </div>
            <SearchField value={query} onChange={setQuery} placeholder="搜索任务或成果名称" />
          </div>
          <div className="aidi-history-filters">
            {typeFilters.map((item) => (
              <button key={item} type="button" className={cx(type === item && "is-active")} onClick={() => setType(item)}>{item}</button>
            ))}
          </div>

          {filtered.length ? (
            <>
            <div className="aidi-history-list">
              <div className="aidi-history-list__head"><span>名称</span><span>类型</span><span>最近更新</span><span>状态</span><span /></div>
              {filtered.map((item) => (
                <article key={item.id} className="aidi-history-row">
                  <button type="button" className="aidi-history-row__main" onClick={() => router.push(item.route)}>
                    <span className={cx("aidi-history-row__icon", `is-${item.type}`)}>{getIcon(item.type)}</span>
                    <span><strong>{item.title}</strong><small>{item.detail}</small></span>
                  </button>
                  <span><StatusBadge tone="neutral">{item.type}</StatusBadge></span>
                  <span>{item.updatedAt}</span>
                  <span>
                    <StatusBadge tone={item.status === "失败" ? "error" : item.status === "处理中" ? "warning" : "success"}>
                      {item.status === "已完成" && <Check aria-hidden="true" />}{item.status}
                    </StatusBadge>
                  </span>
                  <div className="aidi-history-row__actions">
                    {item.status === "失败" ? (
                      <Button tone="ghost" size="sm" icon={<RefreshCw aria-hidden="true" />} onClick={() => router.push(item.route)}>重新打开</Button>
                    ) : (
                      <Button tone="ghost" size="sm" onClick={() => router.push(item.route)}>继续</Button>
                    )}
                    <div className="aidi-inline-menu-wrap">
                      <IconButton label={`管理 ${item.title}`} onClick={() => setMenuId(menuId === item.id ? null : item.id)}><MoreHorizontal aria-hidden="true" /></IconButton>
                      {menuId === item.id && (
                        <>
                        <button type="button" className="aidi-menu-scrim" aria-label="关闭记录菜单" onClick={() => setMenuId(null)} />
                        <div ref={inlineMenuRef} className="aidi-inline-menu" role="menu" onKeyDown={(event) => handleMenuKeyDown(event, () => setMenuId(null))}>
                          <button type="button" role="menuitem" onClick={() => toggleFavorite(item.id)}><Star aria-hidden="true" />{item.favorite ? "取消收藏" : "收藏"}</button>
                          <button type="button" role="menuitem" onClick={() => openRename(item)}><Pencil aria-hidden="true" />重命名</button>
                          {["PPT", "图片", "导图", "视频"].includes(item.type) && <button type="button" role="menuitem" onClick={() => onToast("下载已开始", "success")}><Download aria-hidden="true" />下载</button>}
                          <button type="button" role="menuitem" className="is-danger" onClick={() => setDeleteId(item.id)}><Trash2 aria-hidden="true" />删除</button>
                        </div>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {hasMore && !query && tab === "全部" && type === "全部" && (
              <div className="aidi-history-load-more">
                <Button tone="secondary" loading={loadingMore} onClick={loadMore}>加载更多</Button>
              </div>
            )}
            </>
          ) : (
            <EmptyState
              title={query ? "没有找到匹配的内容" : tab === "收藏" ? "还没有收藏内容" : "这里还没有记录"}
              description={query ? "调整搜索词或筛选条件后再试。" : "完成一次对话、智能体任务或内容生成后，记录会显示在这里。"}
              action={<Button tone="secondary" icon={<ArrowRight aria-hidden="true" />} onClick={() => { setQuery(""); setType("全部"); setTab("全部"); }}>查看全部记录</Button>}
            />
          )}
        </div>
        <ConfirmDialog
          open={Boolean(deleteId)}
          title="删除这条记录？"
          description="该任务将从历史与成果中移除，已生成的上下文无法继续恢复。"
          confirmLabel="删除记录"
          onClose={() => setDeleteId(null)}
          onConfirm={remove}
        />
        <RenameDialog
          open={Boolean(renameId)}
          title="重命名记录"
          value={renameValue}
          onChange={setRenameValue}
          onClose={() => setRenameId(null)}
          onConfirm={confirmRename}
        />
      </div>
    </AppShell>
  );
}

function getIcon(type: HistoryItem["type"]) {
  if (type === "AI 对话") return <MessageSquareText aria-hidden="true" />;
  if (type === "智能体") return <Bot aria-hidden="true" />;
  if (type === "PPT") return <Presentation aria-hidden="true" />;
  if (type === "图片") return <FileImage aria-hidden="true" />;
  if (type === "导图") return <GitFork aria-hidden="true" />;
  if (type === "视频") return <MonitorPlay aria-hidden="true" />;
  return <Clock3 aria-hidden="true" />;
}
