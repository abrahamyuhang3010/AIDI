"use client";

import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  ChevronRight,
  CircleAlert,
  FileCheck2,
  FileText,
  FlaskConical,
  History,
  ImagePlus,
  LayoutDashboard,
  MessageSquareMore,
  MoreHorizontal,
  PanelLeftOpen,
  Pencil,
  Plus,
  Rocket,
  Send,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { creatorAgents, currentUser } from "../mockData";
import { AppShell, WorkspaceSidebar } from "../shell";
import { Button, EmptyState, IconButton, PageHeader, SearchField, SectionHeader, StatusBadge, cx } from "../ui";

const steps = ["基础信息", "能力与提示词", "知识库", "对话设计", "调试测试", "发布设置"];

export function CreatorPage({
  onToast,
}: {
  onToast: (message: string, tone?: "default" | "success" | "error") => void;
}) {
  const router = useRouter();
  const [section, setSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  if (!currentUser.permissions.createAgents) {
    return (
      <AppShell>
        <EmptyState
          icon="offline"
          title="没有智能体创建权限"
          description="当前账号只能使用已发布智能体。请联系平台管理员申请创建或维护权限。"
          action={<Button tone="secondary" onClick={() => router.push("/agents")}>返回智能体</Button>}
        />
      </AppShell>
    );
  }
  const navItems = [
    { id: "overview", label: "概览", icon: <LayoutDashboard aria-hidden="true" /> },
    { id: "agents", label: "我的智能体", icon: <Bot aria-hidden="true" />, meta: "4" },
    { id: "create", label: "创建智能体", icon: <Plus aria-hidden="true" /> },
    { id: "debug", label: "调试测试", icon: <FlaskConical aria-hidden="true" /> },
    { id: "publish", label: "发布管理", icon: <Rocket aria-hidden="true" /> },
    { id: "feedback", label: "使用反馈", icon: <MessageSquareMore aria-hidden="true" /> },
  ];
  return (
    <AppShell
      sidebarOpen={sidebarOpen}
      sidebar={
        <WorkspaceSidebar
          title="智能体工作台"
          items={navItems}
          active={section}
          onChange={setSection}
          onBack={() => router.push("/agents")}
          onClose={() => setSidebarOpen(false)}
        />
      }
    >
      <div className="aidi-creator-page">
        {!sidebarOpen && (
          <IconButton label="打开工作台侧栏" className="aidi-workspace-reopen" onClick={() => setSidebarOpen(true)}>
            <PanelLeftOpen aria-hidden="true" />
          </IconButton>
        )}
        {section === "overview" && <CreatorOverview onChange={setSection} />}
        {section === "agents" && <CreatorAgents onChange={setSection} />}
        {section === "create" && <CreatorForm onToast={onToast} onChange={setSection} />}
        {section === "debug" && <CreatorDebug onToast={onToast} />}
        {section === "publish" && <CreatorPublish onToast={onToast} />}
        {section === "feedback" && <CreatorFeedback />}
      </div>
    </AppShell>
  );
}

function CreatorOverview({ onChange }: { onChange: (section: string) => void }) {
  return (
    <div className="aidi-creator-content">
      <PageHeader
        eyebrow="创建者空间"
        title="智能体工作台"
        description="创建、调试、发布并持续改进面向真实业务场景的智能体。"
        actions={<Button tone="primary" icon={<Plus aria-hidden="true" />} onClick={() => onChange("create")}>创建智能体</Button>}
      />
      <div className="aidi-demo-data-note"><CircleAlert aria-hidden="true" />以下指标为 Demo 演示数据，不代表真实线上运营数据。</div>
      <section className="aidi-creator-metrics">
        {[
          { label: "已发布智能体", value: "2", note: "另有 1 个审核中", icon: Bot },
          { label: "本月使用人数", value: "2,128", note: "较上月 +12.4%", icon: UsersRound },
          { label: "任务完成率", value: "91.6%", note: "目标值 90%", icon: Activity },
          { label: "正向反馈", value: "90.5%", note: "近 30 天", icon: BarChart3 },
        ].map((item) => { const Icon = item.icon; return <article key={item.label}><span><Icon aria-hidden="true" /></span><small>{item.label}</small><strong>{item.value}</strong><p>{item.note}</p></article>; })}
      </section>
      <div className="aidi-creator-dashboard-grid">
        <section className="aidi-creator-panel">
          <SectionHeader title="我的智能体" action={<button type="button" className="aidi-text-action" onClick={() => onChange("agents")}>查看全部 <ArrowRight aria-hidden="true" /></button>} />
          <div className="aidi-creator-agent-list">
            {creatorAgents.slice(0, 3).map((agent) => <button key={agent.name} type="button" onClick={() => onChange("debug")}><span><Sparkles aria-hidden="true" /></span><div><strong>{agent.name}</strong><small>{agent.status} · {agent.users} 位用户</small></div><ChevronRight aria-hidden="true" /></button>)}
          </div>
        </section>
        <section className="aidi-creator-panel">
          <SectionHeader title="待处理事项" />
          <div className="aidi-todo-list">
            <button type="button" onClick={() => onChange("publish")}><StatusBadge tone="warning">审核</StatusBadge><span><strong>渠道政策解读</strong><small>提交审核已 2 天</small></span><ArrowRight /></button>
            <button type="button" onClick={() => onChange("feedback")}><StatusBadge tone="error">质量</StatusBadge><span><strong>深度研究助手</strong><small>3 条失败记录待查看</small></span><ArrowRight /></button>
            <button type="button" onClick={() => onChange("debug")}><StatusBadge tone="info">调试</StatusBadge><span><strong>会议纪要助手</strong><small>草稿尚未完成测试</small></span><ArrowRight /></button>
          </div>
        </section>
      </div>
    </div>
  );
}

function CreatorAgents({ onChange }: { onChange: (section: string) => void }) {
  const [query, setQuery] = useState("");
  const list = creatorAgents.filter((agent) => agent.name.includes(query));
  return (
    <div className="aidi-creator-content">
      <PageHeader title="我的智能体" description="管理你有权创建和维护的智能体。" actions={<Button tone="primary" icon={<Plus aria-hidden="true" />} onClick={() => onChange("create")}>创建智能体</Button>} />
      <SearchField value={query} onChange={setQuery} placeholder="搜索智能体名称" />
      <div className="aidi-creator-table">
        <div className="aidi-creator-table__head"><span>智能体</span><span>状态</span><span>使用人数</span><span>正向反馈</span><span /></div>
        {list.map((agent) => (
          <div key={agent.name} className="aidi-creator-table__row">
            <div><span><Sparkles aria-hidden="true" /></span><strong>{agent.name}</strong></div>
            <StatusBadge tone={agent.status === "已发布" ? "success" : agent.status === "审核中" ? "warning" : "neutral"}>{agent.status}</StatusBadge>
            <span>{agent.users}</span><span>{agent.feedback}</span>
            <div><Button tone="ghost" size="sm" icon={<Pencil aria-hidden="true" />} onClick={() => onChange("create")}>编辑</Button><IconButton label="更多操作" onClick={() => onChange("publish")}><MoreHorizontal aria-hidden="true" /></IconButton></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CreatorForm({ onToast, onChange }: { onToast: (message: string, tone?: "default" | "success" | "error") => void; onChange: (section: string) => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("竞品分析助手");
  const [description, setDescription] = useState("围绕产品、品牌与市场维度，生成结构化竞品分析报告。");
  const [role, setRole] = useState("企业产品研究专家");
  const [goal, setGoal] = useState("完成资料检索、竞品对比、机会判断与结构化报告输出");
  const [prompt, setPrompt] = useState("你是一名企业产品研究专家。请根据用户提供的研究对象、行业范围和资料，完成资料检索、对比分析与报告生成。");
  const [iconName, setIconName] = useState("默认研究图标");
  return (
    <div className="aidi-creator-content aidi-creator-form-page">
      <PageHeader title="创建智能体" description="按照业务场景定义任务目标、能力边界和对话方式。" actions={<Button tone="secondary" onClick={() => onToast("草稿已保存", "success")}>保存草稿</Button>} />
      <div className="aidi-stepper">{steps.map((item, index) => <button key={item} type="button" className={cx(index === step && "is-active", index < step && "is-done")} onClick={() => setStep(index)}><span>{index < step ? <Check aria-hidden="true" /> : index + 1}</span><small>{item}</small></button>)}</div>
      <div className="aidi-config-layout">
        <section className="aidi-config-form">
          <div className="aidi-config-form__title"><span>0{step + 1}</span><div><h2>{steps[step]}</h2><p>{step === 0 ? "定义员工在智能体广场中看到的信息。" : step === 1 ? "说明智能体应该做什么，以及不应该做什么。" : step === 2 ? "只绑定你已获授权的企业知识范围。" : step === 3 ? "设计开场介绍、所需信息和示例任务。" : step === 4 ? "使用真实问题检查执行过程与结果质量。" : "设置审核、可见范围和版本说明。"}</p></div></div>
          {step === 0 && <><label className="aidi-agent-icon-upload"><span>智能体图标</span><span><span className="aidi-preview-agent-icon"><Sparkles aria-hidden="true" /></span><span><strong>{iconName}</strong><small>建议上传 1:1 的 PNG 或 JPG，最大 2 MB</small></span><span className="aidi-button aidi-button--secondary aidi-button--sm"><ImagePlus aria-hidden="true" />更换图标</span></span><input type="file" accept="image/png,image/jpeg" onChange={(event) => { const file = event.target.files?.[0]; if (file) { setIconName(file.name); onToast("智能体图标已更新", "success"); } }} /></label><label className="aidi-field"><span>智能体名称</span><input maxLength={30} value={name} onChange={(event) => setName(event.target.value)} /></label><label className="aidi-field"><span>一句话说明</span><textarea maxLength={120} rows={3} value={description} onChange={(event) => setDescription(event.target.value)} /></label><div className="aidi-form-grid"><label className="aidi-field"><span>分类</span><select defaultValue="研究与分析"><option>研究与分析</option><option>办公与写作</option><option>企业服务</option></select></label><label className="aidi-field"><span>使用场景</span><input defaultValue="产品研究、竞品分析" /></label></div></>}
          {step === 1 && <><div className="aidi-form-grid"><label className="aidi-field"><span>智能体角色</span><input value={role} onChange={(event) => setRole(event.target.value)} /></label><label className="aidi-field"><span>任务目标</span><input value={goal} onChange={(event) => setGoal(event.target.value)} /></label></div><label className="aidi-field"><span>系统提示词</span><textarea rows={9} value={prompt} onChange={(event) => setPrompt(event.target.value)} /></label><label className="aidi-field"><span>输出格式</span><select defaultValue="结构化研究报告"><option>结构化研究报告</option><option>要点清单</option><option>表格对比</option></select></label><div className="aidi-boundary-note"><CircleAlert aria-hidden="true" /><span><strong>任务边界</strong>不得生成未经来源支持的企业数据，不得访问用户未授权的知识范围。</span></div></>}
          {step === 2 && <><div className="aidi-knowledge-options">{["产品策略知识库", "渠道运营资料", "公开互联网资料"].map((item, index) => <label key={item}><input type="checkbox" defaultChecked={index !== 1} /><span><FileText aria-hidden="true" /><span><strong>{item}</strong><small>{index === 2 ? "公开来源" : "已授权知识库"}</small></span></span></label>)}</div><div className="aidi-form-grid"><label className="aidi-field"><span>检索范围</span><select defaultValue="仅检索选中知识库"><option>仅检索选中知识库</option><option>企业知识优先，公开资料补充</option></select></label><label className="aidi-field"><span>引用方式</span><select defaultValue="回答末尾展示引用"><option>回答末尾展示引用</option><option>段落内标注来源</option><option>仅生成引用清单</option></select></label></div></>}
          {step === 3 && <><label className="aidi-field"><span>开场介绍</span><textarea rows={4} defaultValue="我可以根据产品名称和行业范围，生成结构化竞品分析报告。" /></label><label className="aidi-field"><span>用户需要提供的信息</span><input defaultValue="产品名称、所属行业、调研范围" /></label><label className="aidi-field"><span>示例问题</span><input defaultValue="帮我做一份电动车行业竞品分析" /></label><label className="aidi-field"><span>推荐任务</span><textarea rows={3} defaultValue={"竞品功能对比\n市场进入机会研究\n渠道反馈归纳"} /></label></>}
          {step === 4 && <CreatorDebug compact onToast={onToast} />}
          {step === 5 && <><div className="aidi-publish-summary"><Check aria-hidden="true" /><div><h3>配置检查通过</h3><p>基础信息、提示词、知识库和对话设计已完成。</p></div></div><label className="aidi-field"><span>可见范围</span><select defaultValue="产品与创新中心"><option>产品与创新中心</option><option>指定部门</option><option>全体员工</option></select></label><label className="aidi-field"><span>版本说明</span><textarea rows={4} placeholder="说明本次版本的主要能力与变化" /></label></>}
          <div className="aidi-config-actions"><Button tone="ghost" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>上一步</Button>{step < steps.length - 1 ? <Button tone="primary" disabled={step === 0 && (!name.trim() || !description.trim())} onClick={() => setStep((current) => current + 1)}>下一步</Button> : <Button tone="primary" icon={<Rocket aria-hidden="true" />} onClick={() => { onToast("已提交审核", "success"); onChange("publish"); }}>提交审核</Button>}</div>
        </section>
        <aside className="aidi-config-preview"><span className="aidi-eyebrow">员工视图预览</span><div className="aidi-preview-agent"><span><Sparkles aria-hidden="true" /></span><StatusBadge tone="brand">研究与分析</StatusBadge><h2>{name || "未命名智能体"}</h2><p>{description || "填写一句话说明后将在这里预览。"}</p><button type="button">开始使用 <ArrowRight aria-hidden="true" /></button></div></aside>
      </div>
    </div>
  );
}

function CreatorDebug({ onToast, compact = false }: { onToast: (message: string, tone?: "default" | "success" | "error") => void; compact?: boolean }) {
  const [value, setValue] = useState("帮我做一份电动车行业的竞品分析");
  const [ran, setRan] = useState(false);
  return (
    <div className={cx("aidi-debug-page", compact && "is-compact")}>
      {!compact && <PageHeader title="调试测试" description="使用真实问题查看执行过程，并验证输出是否符合任务目标。" />}
      <div className="aidi-debug-layout">
        <section className="aidi-debug-chat">
          <div className="aidi-debug-chat__head"><span><Sparkles aria-hidden="true" /></span><div><strong>竞品分析助手</strong><small>草稿 · 调试环境</small></div></div>
          {ran ? <div className="aidi-debug-result"><div><span><Check aria-hidden="true" />任务完成</span><small>5 个阶段 · 8.4 秒</small></div><h3>电动车行业竞品分析</h3><p>已完成市场格局、主要品牌、产品策略和机会建议四个部分。</p><button type="button" onClick={() => onToast("已打开完整调试结果", "default")}>查看完整结果 <ArrowRight /></button></div> : <div className="aidi-debug-empty"><FlaskConical aria-hidden="true" /><p>输入测试问题，运行一次完整任务。</p></div>}
          <label><span className="sr-only">测试问题</span><textarea rows={3} value={value} onChange={(event) => setValue(event.target.value)} /><button type="button" aria-label="运行测试" onClick={() => setRan(true)}><Send aria-hidden="true" /></button></label>
        </section>
        <aside className="aidi-debug-inspector"><h2>执行检查</h2>{["任务理解", "资料检索", "内容分析", "结果结构", "引用完整性"].map((item, index) => <div key={item}><span className={cx(ran && "is-done")}>{ran ? <Check aria-hidden="true" /> : index + 1}</span><div><strong>{item}</strong><small>{ran ? "检查通过" : "等待测试"}</small></div></div>)}</aside>
      </div>
    </div>
  );
}

function CreatorPublish({ onToast }: { onToast: (message: string, tone?: "default" | "success" | "error") => void }) {
  const [statuses, setStatuses] = useState<Record<string, string>>(() => Object.fromEntries(creatorAgents.map((agent) => [agent.name, agent.status])));
  return <div className="aidi-creator-content"><PageHeader title="发布管理" description="管理智能体草稿、审核状态与已发布版本。" /><div className="aidi-publish-list">{creatorAgents.map((agent) => { const status = statuses[agent.name]; return <article key={agent.name}><span><Sparkles aria-hidden="true" /></span><div><h2>{agent.name}</h2><p>当前版本 v1.2 · 最近更新于 2026 年 7 月 14 日</p></div><StatusBadge tone={status === "已发布" ? "success" : status === "审核中" ? "warning" : "neutral"}>{status}</StatusBadge><div className="aidi-publish-actions"><Button tone="ghost" size="sm" icon={<History aria-hidden="true" />} onClick={() => onToast("版本记录已打开", "default")}>版本记录</Button><Button tone="secondary" size="sm" icon={<FileCheck2 aria-hidden="true" />} onClick={() => { const next = status === "已发布" ? "已下线" : status === "草稿" || status === "已下线" ? "审核中" : status; setStatuses((current) => ({ ...current, [agent.name]: next })); onToast(next === "已下线" ? "智能体已下线" : next === "审核中" ? "已提交审核" : "已查看审核详情", "success"); }}>{status === "已发布" ? "下线" : status === "草稿" || status === "已下线" ? "提交审核" : "查看详情"}</Button></div></article>; })}</div></div>;
}

function CreatorFeedback() {
  return <div className="aidi-creator-content"><PageHeader title="使用反馈" description="查看高频问题、失败记录和员工对智能体结果的评价。" /><div className="aidi-demo-data-note"><CircleAlert aria-hidden="true" />以下内容为 Demo 演示数据。</div><div className="aidi-feedback-stats"><article><small>近 30 天任务</small><strong>3,482</strong><span>任务完成率 91.6%</span></article><article><small>点赞</small><strong>1,924</strong><span>正向反馈 90.5%</span></article><article><small>待分析失败</small><strong>18</strong><span>较上月减少 6 条</span></article></div><section className="aidi-creator-panel"><SectionHeader title="高频失败问题" /><div className="aidi-failure-list">{["研究范围过大，未能在限制时间内完成", "上传的扫描版 PDF 无法提取文字", "用户未提供明确的对比对象"].map((item, index) => <button key={item} type="button"><span>0{index + 1}</span><div><strong>{item}</strong><small>{12 - index * 3} 次 · 深度研究助手</small></div><ArrowRight aria-hidden="true" /></button>)}</div></section></div>;
}
