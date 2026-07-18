"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  ChevronDown,
  Download,
  FileText,
  Globe2,
  Play,
  Presentation,
  RefreshCw,
  Save,
  Sparkles,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Composer } from "../Composer";
import { agents, citations } from "../mockData";
import { AgentTaskSidebar, AppShell } from "../shell";
import type { AgentCategory } from "../types";
import {
  AgentCard,
  Button,
  EmptyState,
  IconButton,
  PageHeader,
  SearchField,
  SectionHeader,
  StatusBadge,
  cx,
} from "../ui";

const categories: AgentCategory[] = ["全部", "研究与分析", "办公与写作", "企业服务"];
const suggestions = [
  "帮我做一份电动车行业的竞品分析",
  "研究东南亚两轮车市场的发展机会",
  "根据渠道访谈整理产品改进建议",
];

export function AgentsRoute({
  onToast,
}: {
  onToast: (message: string, tone?: "default" | "success" | "error") => void;
}) {
  const pathname = usePathname();
  return pathname === "/agents" ? <AgentMarketplace onToast={onToast} /> : <AgentTaskPage onToast={onToast} />;
}

function AgentMarketplace({
  onToast,
}: {
  onToast: (message: string, tone?: "default" | "success" | "error") => void;
}) {
  const router = useRouter();
  const [category, setCategory] = useState<AgentCategory>("全部");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>(["deep-research", "travel"]);

  const filtered = useMemo(
    () =>
      agents.filter(
        (agent) =>
          (category === "全部" || agent.category === category) &&
          `${agent.name}${agent.description}${agent.tags.join("")}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [category, query],
  );

  return (
    <AppShell>
      <div className="aidi-page aidi-agent-marketplace">
        <div className="aidi-wide-content">
          <PageHeader
            eyebrow="场景化工作能力"
            title="智能体"
            description="选择一个专业智能体，通过明确的任务流程完成研究、写作与企业服务。"
            actions={
              <Button tone="secondary" icon={<BookOpenCheck aria-hidden="true" />} onClick={() => router.push("/creator")}>
                智能体工作台
              </Button>
            }
          />
          <div className="aidi-agent-search-row">
            <SearchField value={query} onChange={setQuery} placeholder="搜索工作任务或智能体名称" />
            <div className="aidi-quick-filter">
              <button type="button" onClick={() => setQuery("联网搜索")}>联网搜索</button>
              <button type="button" onClick={() => setQuery("企业知识")}>企业知识</button>
              <button type="button" onClick={() => setQuery("文件分析")}>文件分析</button>
            </div>
          </div>

          {!query && category === "全部" && (
            <section className="aidi-agent-featured">
              <div className="aidi-agent-featured__copy">
                <StatusBadge tone="success">本周推荐</StatusBadge>
                <h2>把开放问题变成一份可交付的研究报告</h2>
                <p>深度研究助手会分阶段检索、分析和组织内容，并保留引用来源。</p>
                <Button tone="primary" icon={<Play aria-hidden="true" />} onClick={() => router.push("/agents/deep-research")}>
                  开始研究
                </Button>
              </div>
              <div className="aidi-research-map" aria-hidden="true">
                <span className="is-source"><Globe2 /></span>
                <span className="is-center"><Sparkles /></span>
                <span className="is-result"><FileText /></span>
                <i /><i />
              </div>
            </section>
          )}

          <section className="aidi-agent-list-section">
            <SectionHeader
              title={query ? "搜索结果" : "全部智能体"}
              description={query ? `找到 ${filtered.length} 个相关智能体` : "一期聚焦高频办公与研究场景。"}
            />
            <div className="aidi-tabs" role="tablist" aria-label="智能体分类">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={category === item}
                  className={cx(category === item && "is-active")}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            {filtered.length ? (
              <div className="aidi-agent-grid">
                {filtered.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    favorite={favorites.includes(agent.id)}
                    onFavorite={() => {
                      const already = favorites.includes(agent.id);
                      setFavorites((current) =>
                        already ? current.filter((id) => id !== agent.id) : [...current, agent.id],
                      );
                      onToast(already ? "已取消收藏" : "已收藏智能体", "success");
                    }}
                    onOpen={() => router.push(`/agents/${agent.id}`)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="没有找到相关智能体"
                description="试试搜索任务名称，或切换到其他分类。"
                action={<Button tone="secondary" onClick={() => { setQuery(""); setCategory("全部"); }}>查看全部智能体</Button>}
              />
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function AgentTaskPage({
  onToast,
}: {
  onToast: (message: string, tone?: "default" | "success" | "error") => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const agentId = pathname.split("/").filter(Boolean)[1] ?? "deep-research";
  const agent = agents.find((item) => item.id === agentId) ?? agents[0];
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [value, setValue] = useState("");
  const [taskQuery, setTaskQuery] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [stage, setStage] = useState(-1);
  const [failed, setFailed] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState("current");
  const taskTimers = useRef<number[]>([]);
  const running = stage >= 0 && stage < 5 && !failed;
  const complete = stage >= 5 && !failed;

  const steps = ["理解任务", "搜集资料", "分析信息", "组织结构", "生成结果"];

  useEffect(() => () => taskTimers.current.forEach((timer) => window.clearTimeout(timer)), []);

  function runTask() {
    const currentValue = value || taskQuery || "帮我做一份电动车行业的竞品分析";
    setTaskQuery(currentValue);
    setValue("");
    setFailed(false);
    setStage(0);
    taskTimers.current.forEach((timer) => window.clearTimeout(timer));
    const lastStep = currentValue.includes("失败") ? 3 : 5;
    taskTimers.current = Array.from({ length: lastStep }, (_, offset) => {
      const index = offset + 1;
      return window.setTimeout(() => {
        if (currentValue.includes("失败") && index === lastStep) {
          setStage(index - 1);
          setFailed(true);
          return;
        }
        setStage(index);
      }, index * 720);
    });
  }

  if (agentId === "restricted") {
    return (
      <AppShell>
        <EmptyState
          icon="offline"
          title="暂时无法使用这个智能体"
          description="当前账号没有该知识范围的访问权限，请联系智能体维护人员。"
          action={<Button tone="secondary" onClick={() => router.push("/agents")}>返回智能体</Button>}
        />
      </AppShell>
    );
  }

  if (agentId === "offline") {
    return (
      <AppShell>
        <EmptyState
          icon="offline"
          title="这个智能体已下线"
          description="维护人员正在调整能力和知识范围。你可以返回智能体广场选择其他工具。"
          action={<Button tone="secondary" onClick={() => router.push("/agents")}>返回智能体</Button>}
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      sidebarOpen={sidebarOpen}
      sidebar={<AgentTaskSidebar activeId={activeTaskId} onSelect={(id) => { setActiveTaskId(id); setTaskQuery(id === "channel" ? "渠道策略资料研究" : id === "trend" ? "海外市场趋势报告" : "电动车行业竞品分析"); setStage(5); setFailed(false); }} onClose={() => setSidebarOpen(false)} onNew={() => { setActiveTaskId("current"); setStage(-1); setValue(""); setTaskQuery(""); setAttachment(null); }} />}
    >
      <div className="aidi-agent-task-page">
        <header className="aidi-chat-header">
          <div className="aidi-chat-header__title">
            <IconButton label="返回智能体广场" onClick={() => router.push("/agents")}>
              <ArrowLeft aria-hidden="true" />
            </IconButton>
            <div>
              <h1>{agent.name}</h1>
              <span>{agent.category} · {agent.tags[0]}</span>
            </div>
          </div>
          <div className="aidi-chat-header__actions">
            <IconButton label={sidebarOpen ? "收起任务侧栏" : "展开任务侧栏"} onClick={() => setSidebarOpen((current) => !current)}>
              {sidebarOpen ? <ArrowLeft aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
            </IconButton>
            <Button tone="ghost" size="sm" onClick={() => onToast("已收藏智能体", "success")}>收藏</Button>
          </div>
        </header>

        <div className="aidi-agent-task-scroll">
          <div className="aidi-agent-task-content">
            {stage < 0 && !failed && (
              <div className="aidi-agent-intro">
                <span className={cx("aidi-agent-intro__mark", `is-${agent.tone}`)}><Sparkles aria-hidden="true" /></span>
                <StatusBadge tone="brand">{agent.category}</StatusBadge>
                <h2>{agent.name}</h2>
                <p>{agent.description}</p>
                <div className="aidi-agent-requirements">
                  <h3>开始前，请告诉我</h3>
                  <div>
                    <span><strong>01</strong>研究对象或主题</span>
                    <span><strong>02</strong>希望覆盖的范围</span>
                    <span><strong>03</strong>报告的使用场景</span>
                  </div>
                </div>
                <div className="aidi-suggestions">
                  <h3>试试这样问</h3>
                  {suggestions.map((suggestion) => (
                    <button key={suggestion} type="button" onClick={() => setValue(suggestion)}>
                      <Sparkles aria-hidden="true" />
                      <span>{suggestion}</span>
                      <ArrowRight aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(running || failed || complete) && (
              <div className="aidi-agent-run">
                <div className="aidi-agent-request">
                  <span>你的任务</span>
                  <p>{taskQuery || "帮我做一份电动车行业的竞品分析"}</p>
                  {attachment && <small>{attachment}</small>}
                </div>
                <section className="aidi-execution-panel" aria-live="polite">
                  <div className="aidi-execution-panel__header">
                    <span className="aidi-status-spark"><Sparkles aria-hidden="true" /></span>
                    <div>
                      <h2>{failed ? "任务执行中断" : complete ? "研究任务已完成" : "正在执行研究任务"}</h2>
                      <p>{failed ? "资料分析阶段出现问题，你可以从当前阶段重试。" : "AIDI 会逐步完成资料检索、分析与报告生成。"}</p>
                    </div>
                    {complete && <Check aria-hidden="true" />}
                  </div>
                  <div className="aidi-execution-steps">
                    {steps.map((step, index) => {
                      const state = failed && index === stage ? "error" : index < stage || complete ? "done" : index === stage ? "running" : "pending";
                      return (
                        <div key={step} className={cx("aidi-execution-step", `is-${state}`)}>
                          <span>{state === "done" ? <Check aria-hidden="true" /> : index + 1}</span>
                          <div><strong>{step}</strong><small>{state === "done" ? "已完成" : state === "running" ? "执行中" : state === "error" ? "执行失败" : "等待执行"}</small></div>
                        </div>
                      );
                    })}
                  </div>
                  {failed && <Button tone="secondary" icon={<RefreshCw aria-hidden="true" />} onClick={runTask}>从失败阶段重试</Button>}
                </section>
                {complete && (
                  <AgentResult
                    sourcesOpen={sourcesOpen}
                    onToggleSources={() => setSourcesOpen((current) => !current)}
                    onToast={onToast}
                    onPpt={() => router.push("/create/ppt/competitor-report")}
                    onRegenerate={runTask}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="aidi-composer-dock">
          <Composer
            variant="agent"
            value={value}
            onChange={setValue}
            attachment={attachment}
            onAttachmentChange={setAttachment}
            onSubmit={runTask}
            loading={running}
            placeholder={complete ? "继续追问或补充研究要求" : "描述研究主题、范围和报告用途"}
          />
        </div>
      </div>
    </AppShell>
  );
}

function AgentResult({
  sourcesOpen,
  onToggleSources,
  onToast,
  onPpt,
  onRegenerate,
}: {
  sourcesOpen: boolean;
  onToggleSources: () => void;
  onToast: (message: string, tone?: "default" | "success" | "error") => void;
  onPpt: () => void;
  onRegenerate: () => void;
}) {
  return (
    <article className="aidi-agent-result">
      <div className="aidi-agent-result__header">
        <div>
          <StatusBadge tone="success">研究完成</StatusBadge>
          <h2>电动车行业竞品分析报告</h2>
          <p>覆盖市场格局、品牌策略、产品机会与行动建议，共 8 个章节。</p>
        </div>
        <div>
          <Button tone="ghost" icon={<RefreshCw aria-hidden="true" />} onClick={onRegenerate}>重新生成</Button>
          <Button tone="ghost" icon={<Save aria-hidden="true" />} onClick={() => onToast("结果已保存至历史与成果", "success")}>保存成果</Button>
          <Button tone="secondary" icon={<Download aria-hidden="true" />} onClick={() => onToast("报告下载已开始", "success")}>下载文档</Button>
          <Button tone="primary" icon={<Presentation aria-hidden="true" />} onClick={onPpt}>转为 PPT</Button>
        </div>
      </div>
      <div className="aidi-report-outline">
        {["执行摘要", "市场与用户趋势", "主要品牌对比", "产品机会与建议"].map((item, index) => (
          <button key={item} type="button" onClick={() => onToast(`已打开“${item}”章节`, "default")}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item}</strong>
            <ArrowRight aria-hidden="true" />
          </button>
        ))}
      </div>
      <button type="button" className="aidi-source-toggle" onClick={onToggleSources} aria-expanded={sourcesOpen}>
        <span><FileText aria-hidden="true" />查看引用来源</span>
        <ChevronDown className={cx(sourcesOpen && "is-open")} aria-hidden="true" />
      </button>
      {sourcesOpen && (
        <div className="aidi-citation-grid">
          {citations.slice(0, 6).map((citation) => (
            <button key={citation.id} type="button"><FileText aria-hidden="true" /><span>{citation.title}</span></button>
          ))}
        </div>
      )}
    </article>
  );
}
