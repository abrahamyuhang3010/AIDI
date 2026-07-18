"use client";

import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  FileText,
  Lightbulb,
  MessageSquareMore,
  Paperclip,
  PlayCircle,
  Send,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../shell";
import { Button, PageHeader, SearchField, StatusBadge, cx } from "../ui";

const faqs = [
  { q: "什么时候应该使用 AI 对话，什么时候使用智能体？", a: "开放问题、企业知识查询和文件分析适合使用 AI 对话；输入要求、执行步骤和输出形式明确的专业任务适合使用智能体。" },
  { q: "AIDI 会使用哪些企业知识？", a: "AIDI 只会检索当前账号已获授权的雅迪知识范围，并在回答中展示引用来源。" },
  { q: "上传的文件支持哪些格式？", a: "当前支持 Word、PDF、Excel、图片和文本文件。文件大小与解析能力以实际接入服务为准。" },
  { q: "如何把研究结果转成 PPT？", a: "在 AI 回答或智能体结果下方选择“转为 PPT”，系统会带入当前内容并自动创建演示文稿大纲。" },
];

export function HelpPage({
  onToast,
}: {
  onToast: (message: string, tone?: "default" | "success" | "error") => void;
}) {
  const [tab, setTab] = useState<"guide" | "faq" | "feedback" | "suggestion">("guide");
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(0);
  const [feedbackType, setFeedbackType] = useState("功能问题");
  const [module, setModule] = useState("AI 对话");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [feedbackAttachment, setFeedbackAttachment] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const filteredFaq = faqs.filter((item) => `${item.q}${item.a}`.toLowerCase().includes(query.toLowerCase()));

  function submitFeedback() {
    if (!description.trim()) {
      onToast("请先描述遇到的问题", "error");
      return;
    }
    setSubmitted(true);
    onToast("反馈已提交，感谢你的帮助", "success");
  }

  return (
    <AppShell>
      <div className="aidi-page aidi-help-page">
        <div className="aidi-wide-content">
          <PageHeader
            eyebrow="支持与改进"
            title="帮助与反馈"
            description="快速了解 AIDI 的使用方式，或告诉我们哪里需要改进。"
          />
          <div className="aidi-help-tabs" role="tablist" aria-label="帮助分类">
            <button type="button" role="tab" aria-selected={tab === "guide"} className={cx(tab === "guide" && "is-active")} onClick={() => setTab("guide")}><BookOpen aria-hidden="true" />快速入门</button>
            <button type="button" role="tab" aria-selected={tab === "faq"} className={cx(tab === "faq" && "is-active")} onClick={() => setTab("faq")}><CircleHelp aria-hidden="true" />常见问题</button>
            <button type="button" role="tab" aria-selected={tab === "feedback"} className={cx(tab === "feedback" && "is-active")} onClick={() => { setTab("feedback"); setFeedbackType("功能问题"); }}><MessageSquareMore aria-hidden="true" />问题反馈</button>
            <button type="button" role="tab" aria-selected={tab === "suggestion"} className={cx(tab === "suggestion" && "is-active")} onClick={() => { setTab("suggestion"); setFeedbackType("功能建议"); }}><Lightbulb aria-hidden="true" />功能建议</button>
          </div>

          {tab === "guide" && (
            <div className="aidi-guide-content">
              <section className="aidi-guide-hero">
                <div>
                  <StatusBadge tone="brand">5 分钟入门</StatusBadge>
                  <h2>从一个真实工作任务开始</h2>
                  <p>不需要先研究模型。描述要完成的工作，AIDI 会帮助你选择合适的能力。</p>
                  <Button tone="primary" icon={<PlayCircle aria-hidden="true" />} onClick={() => onToast("入门指南已开始播放", "success")}>观看入门指南</Button>
                </div>
                <div className="aidi-guide-flow" aria-hidden="true"><span>描述任务</span><ArrowRight /><span>AI 执行</span><ArrowRight /><span>获得成果</span></div>
              </section>
              <div className="aidi-guide-grid">
                {[
                  { icon: Lightbulb, title: "提出清晰任务", text: "说明目标、背景和期望结果，比只输入关键词更有效。" },
                  { icon: FileText, title: "带上工作资料", text: "上传文件或开启企业知识，让回答更贴近实际工作。" },
                  { icon: Check, title: "核实重要信息", text: "查看引用来源，并对制度、数据和结论进行必要复核。" },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return <article key={item.title}><span>0{index + 1}</span><Icon aria-hidden="true" /><h3>{item.title}</h3><p>{item.text}</p></article>;
                })}
              </div>
              <section className="aidi-guide-links">
                <h2>功能指南</h2>
                {[{ label: "AI 对话与企业知识", route: "/chat" }, { label: "使用智能体完成专业任务", route: "/agents" }, { label: "生成并导出 PPT", route: "/create/ppt" }, { label: "管理历史与成果", route: "/history" }].map((item) => <button key={item.label} type="button" onClick={() => router.push(item.route)}>{item.label}<ArrowRight aria-hidden="true" /></button>)}
              </section>
            </div>
          )}

          {tab === "faq" && (
            <div className="aidi-faq-content">
              <SearchField value={query} onChange={setQuery} placeholder="搜索常见问题" />
              <div className="aidi-faq-list">
                {filteredFaq.map((item, index) => (
                  <div key={item.q} className={cx(openFaq === index && "is-open")}>
                    <button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index}>
                      <span>{item.q}</span><ChevronDown aria-hidden="true" />
                    </button>
                    {openFaq === index && <p>{item.a}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(tab === "feedback" || tab === "suggestion") && (
            <div className="aidi-feedback-layout">
              <section className="aidi-feedback-form">
                {submitted ? (
                  <div className="aidi-feedback-success"><span><Check aria-hidden="true" /></span><h2>反馈已提交</h2><p>我们会结合问题影响范围和出现频率进行评估。</p><Button tone="secondary" onClick={() => { setSubmitted(false); setDescription(""); }}>继续提交反馈</Button></div>
                ) : (
                  <>
                    <div><h2>{tab === "suggestion" ? "分享你的功能建议" : "告诉我们发生了什么"}</h2><p>{tab === "suggestion" ? "说明使用场景、当前困难和你期待的解决方式。" : "请提供足够信息，帮助我们定位问题并持续改进。"}</p></div>
                    <div className="aidi-form-grid">
                      <label className="aidi-field"><span>问题类型</span><select value={feedbackType} onChange={(event) => setFeedbackType(event.target.value)}><option>功能问题</option><option>回答质量</option><option>页面与交互</option><option>功能建议</option></select></label>
                      <label className="aidi-field"><span>所属模块</span><select value={module} onChange={(event) => setModule(event.target.value)}><option>AI 对话</option><option>智能体</option><option>内容生成</option><option>历史与成果</option></select></label>
                    </div>
                    <label className="aidi-field"><span>{tab === "suggestion" ? "建议说明" : "问题描述"}</span><textarea maxLength={500} rows={7} value={description} onChange={(event) => setDescription(event.target.value)} placeholder={tab === "suggestion" ? "请描述使用场景、建议方案和预期价值" : "请描述操作步骤、期望结果和实际情况"} /><small>{description.length}/500</small></label>
                    <label className="aidi-feedback-upload"><Paperclip aria-hidden="true" /><span>{feedbackAttachment ?? "添加截图或附件"}</span><small>{feedbackAttachment ? "附件已添加，可重新选择" : "支持 PNG、JPG、PDF，单个文件不超过 10 MB"}</small><input className="sr-only" type="file" accept="image/png,image/jpeg,.pdf" onChange={(event) => setFeedbackAttachment(event.target.files?.[0]?.name ?? null)} /></label>
                    <label className="aidi-field"><span>联系方式（选填）</span><input value={contact} onChange={(event) => setContact(event.target.value)} placeholder="企业邮箱或工号" /></label>
                    <Button tone="primary" icon={<Send aria-hidden="true" />} onClick={submitFeedback}>提交反馈</Button>
                  </>
                )}
              </section>
              <aside className="aidi-feedback-aside"><MessageSquareMore aria-hidden="true" /><h2>轻量反馈</h2><p>如果只是评价某次 AI 回答，请直接使用回答下方的点赞或点踩。</p><span>反馈会用于产品与智能体质量改进</span></aside>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
