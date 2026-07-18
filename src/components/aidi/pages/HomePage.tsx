"use client";

import {
  ArrowRight,
  Bell,
  Bot,
  FileText,
  GitFork,
  MessageSquareText,
  Presentation,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Composer } from "../Composer";
import { agents, creationTools, recentTasks } from "../mockData";
import { AppShell } from "../shell";
import { AgentCard, IconButton, SectionHeader, StatusBadge, cx } from "../ui";

export function HomePage({
  onToast,
}: {
  onToast: (message: string, tone?: "default" | "success" | "error") => void;
}) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(["deep-research"]);

  function startChat() {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("aidi:prompt", prompt || "请分析我上传的文件，并整理关键结论");
      if (attachment) window.sessionStorage.setItem("aidi:attachment", attachment);
    }
    router.push("/chat/new");
  }

  return (
    <AppShell>
      <div className="aidi-page aidi-home-page">
      <header className="aidi-home-topbar">
        <div>
          <span>2026 年 7 月 15 日</span>
          <strong>企业 AI 工作台</strong>
        </div>
        <IconButton label="查看通知" onClick={() => onToast("当前没有新的平台通知", "default")}>
          <Bell aria-hidden="true" />
          <span className="aidi-notification-dot" />
        </IconButton>
      </header>

      <div className="aidi-home-content">
        <section className="aidi-home-hero" aria-labelledby="home-title">
          <div className="aidi-home-hero__copy">
            <span className="aidi-eyebrow">AIDI · 雅迪企业 AI</span>
            <h1 id="home-title">我是 AIDI，你的实用 AI 助手</h1>
            <p>从企业知识查询到研究分析，把工作任务交给合适的 AI 能力。</p>
          </div>
          <div className="aidi-home-hero__signal" aria-hidden="true">
            <span />
            <span />
            <span />
            <Sparkles />
          </div>
          <Composer
            variant="home"
            value={prompt}
            onChange={setPrompt}
            attachment={attachment}
            onAttachmentChange={setAttachment}
            onSubmit={startChat}
          />
        </section>

        <section className="aidi-home-section">
          <SectionHeader
            title="继续最近任务"
            description="回到上次的位置，继续对话、研究或编辑。"
            action={
              <button type="button" className="aidi-text-action" onClick={() => router.push("/history")}>
                查看全部 <ArrowRight aria-hidden="true" />
              </button>
            }
          />
          <div className="aidi-recent-grid">
            {recentTasks.map((task) => {
              const Icon =
                task.type === "agent"
                  ? Bot
                  : task.type === "chat"
                    ? MessageSquareText
                    : task.type === "mindmap"
                      ? GitFork
                      : Presentation;
              return (
                <button key={task.id} type="button" className="aidi-recent-task" onClick={() => router.push(task.route)}>
                  <span className={cx("aidi-recent-task__icon", `is-${task.type}`)}>
                    <Icon aria-hidden="true" />
                  </span>
                  <span>
                    <strong>{task.title}</strong>
                    <small>{task.meta}</small>
                  </span>
                  <ArrowRight aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </section>

        <div className="aidi-home-split">
          <section className="aidi-home-section">
            <SectionHeader
              title="常用智能体"
              description="用明确的任务流程完成专业工作。"
              action={
                <button type="button" className="aidi-text-action" onClick={() => router.push("/agents")}>
                  智能体广场 <ArrowRight aria-hidden="true" />
                </button>
              }
            />
            <div className="aidi-agent-grid aidi-agent-grid--home">
              {agents
                .filter((agent) => agent.featured)
                .slice(0, 3)
                .map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    favorite={favorites.includes(agent.id)}
                    onFavorite={() => {
                      setFavorites((current) =>
                        current.includes(agent.id) ? current.filter((id) => id !== agent.id) : [...current, agent.id],
                      );
                      onToast(favorites.includes(agent.id) ? "已取消收藏" : "已收藏智能体", "success");
                    }}
                    onOpen={() => router.push(`/agents/${agent.id}`)}
                  />
                ))}
            </div>
          </section>

          <section className="aidi-home-section">
            <SectionHeader
              title="内容生成"
              description="把想法、文件或 AI 结果转为可交付成果。"
              action={
                <button type="button" className="aidi-text-action" onClick={() => router.push("/create")}>
                  进入工作区 <ArrowRight aria-hidden="true" />
                </button>
              }
            />
            <div className="aidi-tool-shortcuts">
              {creationTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button key={tool.id} type="button" className={cx("aidi-tool-shortcut", `is-${tool.tone}`)} onClick={() => router.push(tool.route)}>
                    <span>
                      <Icon aria-hidden="true" />
                    </span>
                    <strong>{tool.name}</strong>
                    <small>{tool.helper}</small>
                    <ArrowRight aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <section className="aidi-platform-update">
          <div className="aidi-platform-update__mark">
            <Sparkles aria-hidden="true" />
          </div>
          <div>
            <StatusBadge tone="success">新能力</StatusBadge>
            <h2>研究结果可以直接转为 PPT</h2>
            <p>在 AI 回答或智能体结果中选择“转为 PPT”，AIDI 会自动建立大纲并进入编辑器。</p>
          </div>
          <button type="button" onClick={() => router.push("/create/ppt/research-result")}>
            查看示例 <ArrowRight aria-hidden="true" />
          </button>
          <FileText className="aidi-platform-update__decor" aria-hidden="true" />
        </section>
      </div>
      </div>
    </AppShell>
  );
}
