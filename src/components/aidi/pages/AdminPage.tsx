"use client";

import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Building2,
  Check,
  ChevronDown,
  CircleAlert,
  Database,
  Filter,
  KeyRound,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  Sparkles,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { useMemo, useState } from "react";
import { adminKnowledge, currentUser } from "../mockData";
import { AdminShell } from "../shell";
import { Button, EmptyState, IconButton, PageHeader, SearchField, StatusBadge, cx } from "../ui";

export function AdminPage({
  onToast,
}: {
  onToast: (message: string, tone?: "default" | "success" | "error") => void;
}) {
  const [section, setSection] = useState("overview");
  if (!currentUser.permissions.managePlatform) {
    return (
      <div className="aidi-admin-permission">
        <EmptyState
          icon="offline"
          title="没有平台管理权限"
          description="当前账号不能查看模型、知识、权限和安全配置。请联系平台管理员申请访问。"
        />
      </div>
    );
  }
  return (
    <AdminShell active={section} onChange={setSection}>
      {section === "overview" && <AdminOverview onToast={onToast} />}
      {section === "knowledge" && <KnowledgeManagement onToast={onToast} />}
      {section === "users" && <AdminEntityPage kind="users" onToast={onToast} />}
      {section === "models" && <AdminEntityPage kind="models" onToast={onToast} />}
      {section === "agents" && <AdminEntityPage kind="agents" onToast={onToast} />}
      {section === "security" && <SecurityPage onToast={onToast} />}
      {section === "cost" && <AdminInsightPage kind="cost" onToast={onToast} />}
      {section === "quality" && <AdminInsightPage kind="quality" onToast={onToast} />}
      {section === "analytics" && <AdminInsightPage kind="analytics" onToast={onToast} />}
    </AdminShell>
  );
}

function AdminInsightPage({
  kind,
  onToast,
}: {
  kind: "cost" | "quality" | "analytics";
  onToast: (message: string, tone?: "default" | "success" | "error") => void;
}) {
  const config = {
    cost: {
      title: "使用量与成本",
      description: "查看模型调用、内容生成消耗与部门用量分布。",
      action: "导出用量报表",
      metrics: [["本月任务量", "286,420", "+12.8%"], ["模型调用成本", "¥ 42,680", "预算使用 71%"], ["单任务平均成本", "¥ 0.15", "较上月 -8%"]],
      rows: ["产品与创新中心", "市场中心", "销售与渠道中心", "职能平台"],
      columns: ["组织", "任务量", "调用成本", "预算状态"],
    },
    quality: {
      title: "质量评估",
      description: "跟踪回答质量、任务成功率和高频失败原因。",
      action: "新建评估任务",
      metrics: [["任务成功率", "93.4%", "+1.2%"], ["正向反馈", "90.5%", "+2.4%"], ["待复核样本", "48", "其中高风险 6 条"]],
      rows: ["企业知识问答", "深度研究助手", "PPT 生成", "文件分析"],
      columns: ["能力", "成功率", "正向反馈", "待处理问题"],
    },
    analytics: {
      title: "运营数据",
      description: "观察员工活跃、能力渗透和重点场景使用趋势。",
      action: "下载运营周报",
      metrics: [["月活跃员工", "8,642", "+9.6%"], ["次月留存", "68.2%", "+4.1%"], ["智能体渗透率", "42.8%", "+6.7%"]],
      rows: ["深度研究助手", "差旅助手", "AI PPT", "企业制度咨询"],
      columns: ["场景", "使用人数", "任务次数", "较上月"],
    },
  }[kind];

  return (
    <div className="aidi-admin-content">
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          <Button tone="primary" icon={<WalletCards aria-hidden="true" />} onClick={() => onToast(`${config.action}已准备`, "success")}>
            {config.action}
          </Button>
        }
      />
      <div className="aidi-demo-data-note"><CircleAlert aria-hidden="true" />以下指标为 Demo 演示数据。</div>
      <section className="aidi-admin-metrics aidi-admin-metrics--compact">
        {config.metrics.map(([label, value, note]) => (
          <article key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
            <p>{note}</p>
          </article>
        ))}
      </section>
      <section className="aidi-admin-panel aidi-insight-table">
        <div className="aidi-service-table__head">
          {config.columns.map((column) => <span key={column}>{column}</span>)}
        </div>
        {config.rows.map((row, index) => (
          <div key={row}>
            <span><strong>{row}</strong></span>
            <span>{kind === "cost" ? `${48_260 - index * 6_480}` : kind === "quality" ? `${96 - index * 2}.2%` : `${2_864 - index * 438}`}</span>
            <span>{kind === "cost" ? `¥ ${8_420 - index * 960}` : kind === "quality" ? `${93 - index}.5%` : `${8_460 - index * 1_120}`}</span>
            <StatusBadge tone={index === 2 ? "warning" : "success"}>{index === 2 ? "需要关注" : "+8.4%"}</StatusBadge>
          </div>
        ))}
      </section>
    </div>
  );
}

function AdminOverview({ onToast }: { onToast: (message: string, tone?: "default" | "success" | "error") => void }) {
  const [range, setRange] = useState("近 7 天");
  return (
    <div className="aidi-admin-content">
      <header className="aidi-admin-header"><div><span>平台管理后台</span><h1>运行概览</h1><p>查看 AIDI 的服务状态、使用情况和待处理事项。</p></div><div><span className="aidi-live-indicator"><i />所有核心服务运行正常</span><small>更新于 11:26</small></div></header>
      <div className="aidi-demo-data-note"><CircleAlert aria-hidden="true" />以下指标为 Demo 演示数据，不代表真实线上运营数据。</div>
      <section className="aidi-admin-metrics">
        {[
          { label: "今日活跃用户", value: "3,286", trend: "+8.2%", icon: UsersRound, up: true },
          { label: "今日任务数", value: "12,842", trend: "+11.6%", icon: Activity, up: true },
          { label: "任务成功率", value: "93.4%", trend: "+1.2%", icon: Check, up: true },
          { label: "待处理告警", value: "6", trend: "-3", icon: AlertTriangle, up: false },
        ].map((item) => { const Icon = item.icon; return <article key={item.label}><div><span><Icon aria-hidden="true" /></span><StatusBadge tone={item.up ? "success" : "warning"}>{item.up ? <ArrowUpRight aria-hidden="true" /> : <ArrowDownRight aria-hidden="true" />}{item.trend}</StatusBadge></div><small>{item.label}</small><strong>{item.value}</strong><p>较昨日同一时段</p></article>; })}
      </section>
      <div className="aidi-admin-dashboard-grid">
        <section className="aidi-admin-panel aidi-admin-usage-chart">
          <div className="aidi-admin-panel__head"><div><h2>{range === "近 7 天" ? "近 7 日" : "近 30 日"}任务趋势</h2><p>对话、智能体与内容生成任务</p></div><button type="button" onClick={() => setRange((current) => current === "近 7 天" ? "近 30 天" : "近 7 天")}>{range} <ChevronDown aria-hidden="true" /></button></div>
          <div className="aidi-chart-legend"><span><i className="is-chat" />AI 对话</span><span><i className="is-agent" />智能体</span><span><i className="is-create" />内容生成</span></div>
          <div className="aidi-bar-chart">{[62, 75, 68, 82, 78, 91, 86].map((height, index) => <div key={index}><span className="is-chat" style={{ height: `${height}%` }} /><span className="is-agent" style={{ height: `${height * 0.64}%` }} /><span className="is-create" style={{ height: `${height * 0.38}%` }} /><small>{["周三", "周四", "周五", "周六", "周日", "周一", "周二"][index]}</small></div>)}</div>
        </section>
        <section className="aidi-admin-panel">
          <div className="aidi-admin-panel__head"><div><h2>待处理事项</h2><p>需要管理员关注的配置与审核</p></div></div>
          <div className="aidi-admin-todos">
            <button type="button" onClick={() => onToast("已打开智能体审核队列", "default")}><span className="is-warning"><Bot /></span><div><strong>智能体审核</strong><small>3 个智能体等待审核</small></div><b>3</b></button>
            <button type="button" onClick={() => onToast("已打开内容安全复核队列", "default")}><span className="is-danger"><AlertTriangle /></span><div><strong>内容安全告警</strong><small>2 条需要人工复核</small></div><b>2</b></button>
            <button type="button" onClick={() => onToast("已打开知识库同步详情", "default")}><span className="is-info"><Database /></span><div><strong>知识库同步</strong><small>1 个数据源同步失败</small></div><b>1</b></button>
          </div>
        </section>
      </div>
      <section className="aidi-admin-panel aidi-service-table">
        <div className="aidi-admin-panel__head"><div><h2>能力运行状态</h2><p>平台模型、企业知识和生成服务</p></div></div>
        <div className="aidi-service-table__head"><span>服务</span><span>状态</span><span>成功率</span><span>平均响应</span><span>今日调用</span></div>
        {["智能模式", "企业知识检索", "DeepSeek-R1", "PPT 生成服务"].map((name, index) => <div key={name}><span><Sparkles aria-hidden="true" /><strong>{name}</strong></span><StatusBadge tone={index === 3 ? "warning" : "success"}>{index === 3 ? "轻微延迟" : "运行正常"}</StatusBadge><span>{["94.8%", "96.2%", "92.9%", "89.7%"][index]}</span><span>{["4.8s", "1.2s", "8.6s", "28.4s"][index]}</span><span>{["6,482", "4,208", "3,891", "426"][index]}</span></div>)}
      </section>
    </div>
  );
}

function KnowledgeManagement({ onToast }: { onToast: (message: string, tone?: "default" | "success" | "error") => void }) {
  const [query, setQuery] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const list = useMemo(() => adminKnowledge.filter((item, index) => item.name.includes(query) && (!onlyAvailable || index !== 3)), [onlyAvailable, query]);
  return (
    <div className="aidi-admin-content">
      <PageHeader title="企业知识库管理" description="管理已授权知识范围、数据源和同步状态。" actions={<Button tone="primary" icon={<Plus aria-hidden="true" />} onClick={() => onToast("新建知识库表单已打开", "default")}>新建知识库</Button>} />
      <div className="aidi-admin-toolbar"><SearchField value={query} onChange={setQuery} placeholder="搜索知识库名称" /><Button tone={onlyAvailable ? "primary" : "secondary"} icon={<Filter aria-hidden="true" />} onClick={() => setOnlyAvailable((current) => !current)}>仅看可用</Button></div>
      <div className="aidi-admin-table">
        <div className="aidi-admin-table__head"><span>知识库</span><span>权限范围</span><span>文档数量</span><span>最近更新</span><span>状态</span><span /></div>
        {list.map((item) => <div key={item.name} className="aidi-admin-table__row"><span><i><Building2 aria-hidden="true" /></i><strong>{item.name}</strong></span><span>{item.scope}</span><span>{item.documents}</span><span>{item.updatedAt}</span><StatusBadge tone={item.name === "渠道运营资料" ? "warning" : "success"}>{item.name === "渠道运营资料" ? "同步中" : "可用"}</StatusBadge><IconButton label={`管理 ${item.name}`} onClick={() => onToast(`已打开 ${item.name} 管理面板`, "default")}><MoreHorizontal aria-hidden="true" /></IconButton></div>)}
      </div>
    </div>
  );
}

function AdminEntityPage({ kind, onToast }: { kind: "users" | "models" | "agents"; onToast: (message: string, tone?: "default" | "success" | "error") => void }) {
  const config = {
    users: { title: "用户与组织权限", description: "配置员工角色、组织范围和产品空间访问权限。", action: "添加用户", icon: UsersRound },
    models: { title: "模型与能力配置", description: "管理平台可用模型、能力路由和运行状态。", action: "接入模型", icon: Sparkles },
    agents: { title: "智能体审核", description: "审核智能体能力边界、知识权限和发布范围。", action: "审核设置", icon: Bot },
  }[kind];
  const Icon = config.icon;
  const rows = kind === "users" ? ["产品与创新中心", "市场中心", "销售与渠道中心", "职能平台"] : kind === "models" ? ["智能模式", "DeepSeek-R1", "Kimi", "豆包"] : ["渠道政策解读", "会议纪要助手", "海外市场研究", "售后知识问答"];
  return <div className="aidi-admin-content"><PageHeader title={config.title} description={config.description} actions={<Button tone="primary" icon={<Plus aria-hidden="true" />} onClick={() => onToast(`${config.action}面板已打开`, "default")}>{config.action}</Button>} /><div className="aidi-admin-table aidi-admin-table--entity"><div className="aidi-admin-table__head"><span>名称</span><span>范围 / 类型</span><span>状态</span><span>最近更新</span><span /></div>{rows.map((row, index) => <div key={row} className="aidi-admin-table__row"><span><i><Icon aria-hidden="true" /></i><strong>{row}</strong></span><span>{kind === "users" ? `${842 + index * 286} 位员工` : kind === "models" ? "平台模型" : "研究与分析"}</span><StatusBadge tone={index === 2 ? "warning" : "success"}>{index === 2 ? (kind === "agents" ? "待审核" : "配置中") : "正常"}</StatusBadge><span>{index === 0 ? "今天 10:42" : `${index + 11} 天前`}</span><IconButton label={`管理 ${row}`} onClick={() => onToast(`已打开 ${row} 管理面板`, "default")}><MoreHorizontal aria-hidden="true" /></IconButton></div>)}</div></div>;
}

function SecurityPage({ onToast }: { onToast: (message: string, tone?: "default" | "success" | "error") => void }) {
  const [settings, setSettings] = useState([true, true, false, true]);
  return <div className="aidi-admin-content"><PageHeader title="内容与安全策略" description="设置内容审核、敏感信息和企业数据使用规则。" actions={<Button tone="primary" onClick={() => onToast("安全策略已保存", "success")}>保存策略</Button>} /><div className="aidi-security-grid">{[
    { title: "企业敏感信息识别", text: "检测输入和输出中的敏感业务信息。", icon: ShieldCheck },
    { title: "高风险内容人工复核", text: "命中高风险规则时进入人工审核队列。", icon: AlertTriangle },
    { title: "外部链接访问限制", text: "限制 AI 打开未列入允许范围的外部链接。", icon: KeyRound },
    { title: "回答引用强制展示", text: "企业知识问答必须展示引用来源。", icon: Database },
  ].map((item, index) => { const Icon = item.icon; return <article key={item.title}><span><Icon aria-hidden="true" /></span><div><h2>{item.title}</h2><p>{item.text}</p></div><button type="button" className={cx("aidi-switch", settings[index] && "is-active")} onClick={() => setSettings((current) => current.map((value, itemIndex) => itemIndex === index ? !value : value))} aria-pressed={settings[index]}><span /></button></article>; })}</div></div>;
}
