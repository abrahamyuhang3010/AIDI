"use client";

import {
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  ExternalLink,
  FileText,
  GitFork,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Presentation,
  RefreshCw,
  Share2,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Composer } from "../Composer";
import { citations } from "../mockData";
import { AppShell, ConversationSidebar } from "../shell";
import { AttachmentCard, Button, IconButton, InlineError, StatusBadge, cx, handleMenuKeyDown, useMenuFocus } from "../ui";

type ChatTurn = {
  id: number;
  role: "user" | "assistant";
  content: string;
  attachment?: string;
};

type GenerationState = "understanding" | "searching" | "analyzing" | "generating" | "error" | null;

const initialTurns: ChatTurn[] = [
  {
    id: 1,
    role: "user",
    content: "请结合行业趋势和企业资料，整理一份电动车市场的关键机会分析。",
    attachment: "市场调研报告.docx",
  },
  {
    id: 2,
    role: "assistant",
    content: "market-opportunity",
  },
];

const statusLabels: Record<Exclude<GenerationState, null>, string> = {
  understanding: "正在理解需求",
  searching: "正在检索企业知识与互联网资料",
  analyzing: "正在分析和归纳关键信息",
  generating: "正在生成结构化结果",
  error: "回答生成失败",
};

const answerMarkdown = `## 电动车市场的三个关键机会

综合行业趋势、渠道反馈与雅迪内部资料，当前机会不只来自销量增长，更来自用户对安全、智能体验和服务效率的持续升级。

### 1. 从参数竞争转向可靠体验

消费者对续航、制动安全和长期耐用性的关注正在上升。产品表达应把技术指标转译为可感知的日常价值。

### 2. 智能化成为高价值车型的差异点

- 围绕防盗、定位、无感解锁建立完整体验，而不是堆叠孤立功能。
- 通过 App、门店和售后形成一致的用户服务链路。
- 用真实使用场景验证功能价值，减少技术化表达。

### 3. 渠道数字化连接产品与服务

| 机会方向 | 主要依据 | 建议动作 |
| --- | --- | --- |
| 产品可靠性 | 安全与耐用关注持续上升 | 强化场景化表达 |
| 智能体验 | 高价值车型需要明确差异 | 串联 App、门店和售后 |
| 渠道洞察 | 一线反馈更新速度快 | 建立统一洞察流程 |

> 重要结论应结合下方引用来源复核。`;

export function ChatPage({
  onToast,
}: {
  onToast: (message: string, tone?: "default" | "success" | "error") => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isNew = pathname.endsWith("/new") || pathname === "/chat";
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeId, setActiveId] = useState(isNew ? "new" : pathname.split("/").filter(Boolean).at(-1) ?? "market-summary");
  const [turns, setTurns] = useState<ChatTurn[]>(isNew ? [] : initialTurns);
  const [value, setValue] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [generation, setGeneration] = useState<GenerationState>(null);
  const [citationsOpen, setCitationsOpen] = useState(false);
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);
  const [answerCollapsed, setAnswerCollapsed] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const followOutputRef = useRef(true);
  const generationTimers = useRef<number[]>([]);
  const headerMenuRef = useMenuFocus<HTMLDivElement>(headerMenuOpen);

  useEffect(() => {
    if (!isNew || typeof window === "undefined") return;
    const prompt = window.sessionStorage.getItem("aidi:prompt");
    const file = window.sessionStorage.getItem("aidi:attachment");
    const timer = window.setTimeout(() => {
      if (prompt) setValue(prompt);
      if (file) setAttachment(file);
    }, 0);
    if (prompt) window.sessionStorage.removeItem("aidi:prompt");
    if (file) window.sessionStorage.removeItem("aidi:attachment");
    return () => window.clearTimeout(timer);
  }, [isNew]);

  useEffect(() => () => generationTimers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const title = activeId === "new" ? "新对话" : "电动车市场机会分析";
  const lastAssistant = useMemo(() => [...turns].reverse().find((turn) => turn.role === "assistant"), [turns]);

  function scrollToBottom() {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    followOutputRef.current = true;
  }

  function runGeneration(content: string, file?: string) {
    generationTimers.current.forEach((timer) => window.clearTimeout(timer));
    setGeneration("understanding");
    generationTimers.current = [
    window.setTimeout(() => setGeneration("searching"), 650),
    window.setTimeout(() => setGeneration("analyzing"), 1350),
    window.setTimeout(() => setGeneration("generating"), 2050),
    window.setTimeout(() => {
      if (content.includes("失败")) {
        setGeneration("error");
        return;
      }
      setTurns((current) => [
        ...current,
        { id: Date.now(), role: "assistant", content: file ? "file-analysis" : "market-opportunity" },
      ]);
      setGeneration(null);
      if (followOutputRef.current) window.setTimeout(scrollToBottom, 50);
    }, 2850),
    ];
  }

  function submit() {
    const content = value.trim() || "请分析上传的文件并整理关键结论";
    setTurns((current) => [
      ...current,
      { id: Date.now(), role: "user", content, attachment: attachment ?? undefined },
    ]);
    setValue("");
    const currentAttachment = attachment ?? undefined;
    setAttachment(null);
    runGeneration(content, currentAttachment);
    window.setTimeout(scrollToBottom, 50);
  }

  function newConversation() {
    setTurns([]);
    setValue("");
    setAttachment(null);
    setActiveId("new");
    router.push("/chat/new");
  }

  async function copyAnswer() {
    await navigator.clipboard?.writeText("电动车市场机会分析：用户价值升级、智能化体验与渠道协同。 ");
    onToast("回答已复制", "success");
  }

  return (
    <AppShell
      sidebarOpen={sidebarOpen}
      sidebar={
        <ConversationSidebar
          activeId={activeId}
          onNew={newConversation}
          onClose={() => setSidebarOpen(false)}
          onSelect={(id) => {
            setActiveId(id);
            setTurns(initialTurns);
            router.push(`/chat/${id}`);
          }}
          onToast={onToast}
        />
      }
    >
      <div className="aidi-chat-page">
        <header className="aidi-chat-header">
          <div className="aidi-chat-header__title">
            <IconButton
              label={sidebarOpen ? "收起会话侧栏" : "展开会话侧栏"}
              onClick={() => setSidebarOpen((current) => !current)}
            >
              {sidebarOpen ? <PanelLeftClose aria-hidden="true" /> : <PanelLeftOpen aria-hidden="true" />}
            </IconButton>
            <div>
              <h1>{title}</h1>
              <span>智能模式 · 自动选择合适能力</span>
            </div>
          </div>
          <div className="aidi-chat-header__actions">
            <Button tone="ghost" size="sm" icon={<Share2 aria-hidden="true" />} onClick={() => onToast("分享链接已准备", "success")}>
              分享
            </Button>
            <Button tone="ghost" size="sm" icon={<Download aria-hidden="true" />} onClick={() => onToast("已生成 Word 文档", "success")}>
              导出
            </Button>
            <div className="aidi-header-menu-wrap">
              <IconButton label="更多会话操作" onClick={() => setHeaderMenuOpen((current) => !current)}>
                <MoreHorizontal aria-hidden="true" />
              </IconButton>
              {headerMenuOpen && (
                <>
                <button type="button" className="aidi-menu-scrim" aria-label="关闭会话操作菜单" onClick={() => setHeaderMenuOpen(false)} />
                <div ref={headerMenuRef} className="aidi-header-menu" role="menu" onKeyDown={(event) => handleMenuKeyDown(event, () => setHeaderMenuOpen(false))}>
                  <button type="button" role="menuitem" onClick={() => setHeaderMenuOpen(false)}>重命名会话</button>
                  <button type="button" role="menuitem" onClick={() => setHeaderMenuOpen(false)}>清空当前内容</button>
                </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div
          ref={scrollRef}
          className="aidi-chat-scroll"
          aria-live="polite"
          onScroll={(event) => {
            const element = event.currentTarget;
            followOutputRef.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
          }}
        >
          <div className="aidi-chat-content">
            {!turns.length && !generation ? (
              <ChatEmptyState onPrompt={setValue} />
            ) : (
              turns.map((turn) =>
                turn.role === "user" ? (
                  <UserMessage key={turn.id} content={turn.content} attachment={turn.attachment} />
                ) : (
                  <AssistantMessage
                    key={turn.id}
                    collapsed={answerCollapsed}
                    citationsOpen={citationsOpen}
                    feedback={feedback}
                    onToggleCollapsed={() => setAnswerCollapsed((current) => !current)}
                    onToggleCitations={() => setCitationsOpen((current) => !current)}
                    onCopy={copyAnswer}
                    onRegenerate={() => runGeneration("重新生成")}
                    onFeedback={(next) => {
                      setFeedback(next);
                      onToast(next === "like" ? "感谢你的反馈" : "已记录问题，我们会继续改进", "success");
                    }}
                    onPpt={() => router.push("/create/ppt/market-opportunity")}
                    onMindmap={() => router.push("/create/mindmap/market-opportunity")}
                  />
                ),
              )
            )}

            {generation && generation !== "error" && (
              <div className="aidi-assistant-status is-running">
                <span className="aidi-status-spark">
                  <Sparkles aria-hidden="true" />
                </span>
                <div>
                  <strong>{statusLabels[generation]}</strong>
                  <span>正在根据任务自动组合模型、知识与搜索能力</span>
                </div>
                <span className="aidi-status-dots" aria-hidden="true"><i /><i /><i /></span>
              </div>
            )}
            {generation === "error" && (
              <InlineError
                message="资料检索暂时中断。你可以检查网络后重新生成，当前问题和附件不会丢失。"
                onRetry={() => runGeneration("重新尝试")}
              />
            )}
          </div>
        </div>

        {(turns.length > 1 || lastAssistant) && (
          <IconButton label="回到底部" className="aidi-scroll-bottom" onClick={scrollToBottom}>
            <ArrowDown aria-hidden="true" />
          </IconButton>
        )}
        <div className="aidi-composer-dock">
          <Composer
            value={value}
            onChange={setValue}
            onSubmit={submit}
            loading={Boolean(generation && generation !== "error")}
            attachment={attachment}
            onAttachmentChange={setAttachment}
            placeholder={turns.length ? "输入问题或继续追问" : "描述你的问题、任务或上传文件"}
          />
          <p className="aidi-ai-note">AI 生成内容仅供参考，重要信息请结合引用来源核实。</p>
        </div>
      </div>
    </AppShell>
  );
}

function ChatEmptyState({ onPrompt }: { onPrompt: (value: string) => void }) {
  const prompts = [
    "查询雅迪内部差旅制度",
    "根据上传的文件生成工作报告",
    "帮我分析电动车行业的发展趋势",
  ];
  return (
    <div className="aidi-chat-empty">
      <span className="aidi-chat-empty__icon"><Sparkles aria-hidden="true" /></span>
      <h2>今天想完成什么工作？</h2>
      <p>直接描述任务，也可以上传文件或使用企业知识。</p>
      <div>
        {prompts.map((prompt) => (
          <button key={prompt} type="button" onClick={() => onPrompt(prompt)}>
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

function UserMessage({ content, attachment }: { content: string; attachment?: string }) {
  return (
    <div className="aidi-user-message-wrap">
      <div className="aidi-user-message">
        <p>{content}</p>
        {attachment && <AttachmentCard name={attachment} meta="30.5 KB · 已完成解析" />}
      </div>
    </div>
  );
}

function AssistantMessage({
  collapsed,
  citationsOpen,
  feedback,
  onToggleCollapsed,
  onToggleCitations,
  onCopy,
  onRegenerate,
  onFeedback,
  onPpt,
  onMindmap,
}: {
  collapsed: boolean;
  citationsOpen: boolean;
  feedback: "like" | "dislike" | null;
  onToggleCollapsed: () => void;
  onToggleCitations: () => void;
  onCopy: () => void;
  onRegenerate: () => void;
  onFeedback: (type: "like" | "dislike") => void;
  onPpt: () => void;
  onMindmap: () => void;
}) {
  return (
    <article className="aidi-assistant-message">
      <button type="button" className="aidi-assistant-status is-complete" onClick={onToggleCollapsed} aria-expanded={!collapsed}>
        <span className="aidi-status-spark"><Sparkles aria-hidden="true" /></span>
        <div>
          <strong>回答完成</strong>
          <span>已使用企业知识与 4 个公开资料来源</span>
        </div>
        {collapsed ? <ChevronDown aria-hidden="true" /> : <ChevronUp aria-hidden="true" />}
      </button>
      {!collapsed && (
        <>
          <div className="aidi-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{answerMarkdown}</ReactMarkdown>
          </div>
          <section className="aidi-citations">
            <div className="aidi-citations__header">
              <div>
                <FileText aria-hidden="true" />
                <strong>引用来源</strong>
                <StatusBadge tone="brand">7</StatusBadge>
              </div>
              <button type="button" onClick={onToggleCitations} aria-expanded={citationsOpen}>
                {citationsOpen ? "收起" : "展开全部"}
                {citationsOpen ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
              </button>
            </div>
            <div className="aidi-citation-grid">
              {citations.slice(0, citationsOpen ? citations.length : 3).map((citation) => (
                <button key={citation.id} type="button" title={citation.title}>
                  <FileText aria-hidden="true" />
                  <span>{citation.title}</span>
                  <ExternalLink aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>
          <div className="aidi-response-footer">
            <div className="aidi-response-actions">
              <IconButton label="复制回答" onClick={onCopy}><Copy aria-hidden="true" /></IconButton>
              <IconButton label="重新生成" onClick={onRegenerate}><RefreshCw aria-hidden="true" /></IconButton>
              <IconButton label="回答有帮助" className={cx(feedback === "like" && "is-active")} onClick={() => onFeedback("like")}>
                <ThumbsUp aria-hidden="true" />
              </IconButton>
              <IconButton label="回答需要改进" className={cx(feedback === "dislike" && "is-active")} onClick={() => onFeedback("dislike")}>
                <ThumbsDown aria-hidden="true" />
              </IconButton>
            </div>
            <div className="aidi-result-actions">
              <Button tone="ghost" size="sm" icon={<Presentation aria-hidden="true" />} onClick={onPpt}>转为 PPT</Button>
              <Button tone="ghost" size="sm" icon={<GitFork aria-hidden="true" />} onClick={onMindmap}>转为思维导图</Button>
            </div>
          </div>
        </>
      )}
    </article>
  );
}
