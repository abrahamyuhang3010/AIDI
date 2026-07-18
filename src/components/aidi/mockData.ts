import {
  FileImage,
  GitFork,
  MonitorPlay,
  Presentation,
} from "lucide-react";
import type {
  AgentItem,
  CitationItem,
  ConversationItem,
  CreationTool,
  HistoryItem,
  RecentTask,
  UserPermissions,
} from "./types";

export const currentUser = {
  name: "于航",
  department: "产品与创新中心",
  permissions: {
    createAgents: true,
    managePlatform: true,
  } satisfies UserPermissions,
};

export const agents: AgentItem[] = [
  {
    id: "deep-research",
    name: "深度研究助手",
    description: "检索互联网与企业资料，形成结构清晰、带引用的研究报告。",
    category: "研究与分析",
    tags: ["联网搜索", "报告生成", "多步骤任务"],
    tone: "violet",
    featured: true,
  },
  {
    id: "competitor-analysis",
    name: "竞品调研报告",
    description: "围绕产品、品牌与市场维度，快速搭建可汇报的竞品分析。",
    category: "研究与分析",
    tags: ["文件分析", "联网搜索", "新上线"],
    tone: "blue",
    featured: true,
  },
  {
    id: "travel",
    name: "差旅助手",
    description: "结合企业制度与行程要求，整理合规、完整的差旅方案。",
    category: "企业服务",
    tags: ["企业知识", "行程规划"],
    tone: "teal",
    featured: true,
  },
  {
    id: "report",
    name: "工作报告生成",
    description: "根据工作记录或上传资料，生成结构化周报与项目总结。",
    category: "办公与写作",
    tags: ["文件分析", "报告生成"],
    tone: "amber",
  },
  {
    id: "word",
    name: "Word 助手",
    description: "整理、改写和检查办公文档，让长文处理更高效。",
    category: "办公与写作",
    tags: ["文件分析", "文档优化"],
    tone: "blue",
  },
  {
    id: "policy",
    name: "企业制度咨询",
    description: "在已授权的雅迪知识范围内查询制度，并提供来源依据。",
    category: "企业服务",
    tags: ["企业知识", "引用来源"],
    tone: "violet",
  },
  {
    id: "translation",
    name: "翻译助手",
    description: "面向办公与业务场景进行准确、自然的中英文互译。",
    category: "办公与写作",
    tags: ["多语言", "文档优化"],
    tone: "teal",
  },
];

export const recentTasks: RecentTask[] = [
  {
    id: "task-1",
    title: "电动车行业竞品分析",
    meta: "深度研究助手 · 12 分钟前",
    type: "agent",
    route: "/agents/deep-research",
  },
  {
    id: "task-2",
    title: "第二季度市场工作总结",
    meta: "AI 对话 · 昨天 17:42",
    type: "chat",
    route: "/chat/market-summary",
  },
  {
    id: "task-3",
    title: "新品策略汇报",
    meta: "PPT · 7 月 12 日",
    type: "ppt",
    route: "/create/ppt/strategy-review",
  },
];

export const creationTools: CreationTool[] = [
  {
    id: "ppt",
    name: "PPT 生成",
    description: "从主题、文件或 AI 结果生成可编辑演示文稿。",
    helper: "大纲、页面与导出",
    route: "/create/ppt",
    icon: Presentation,
    tone: "violet",
  },
  {
    id: "image",
    name: "AI 绘图",
    description: "通过画面描述和基础参数生成多张创意图片。",
    helper: "多图生成与下载",
    route: "/create/image",
    icon: FileImage,
    tone: "blue",
  },
  {
    id: "mindmap",
    name: "思维导图",
    description: "提取主题结构，生成可编辑的层级关系导图。",
    helper: "结构编辑与导出",
    route: "/create/mindmap",
    icon: GitFork,
    tone: "teal",
  },
  {
    id: "video",
    name: "视频生成",
    description: "将主题或文案转化为脚本、分镜和视频预览。",
    helper: "脚本、分镜与预览",
    route: "/create/video",
    icon: MonitorPlay,
    tone: "amber",
  },
];

export const conversations: ConversationItem[] = [
  {
    id: "market-summary",
    title: "第二季度市场工作总结",
    group: "置顶",
    pinned: true,
  },
  { id: "policy", title: "查询雅迪差旅报销制度", group: "今天" },
  { id: "research", title: "电动车行业趋势研究", group: "今天" },
  { id: "document", title: "整理渠道调研 Word 文档", group: "过去 7 天" },
  { id: "translation", title: "海外业务邮件翻译", group: "过去 7 天" },
  { id: "meeting", title: "整理月度经营会议纪要", group: "过去 30 天" },
  { id: "training", title: "生成门店培训内容大纲", group: "更早" },
];

export const citations: CitationItem[] = [
  { id: "c-1", title: "2025 年电动车行业趋势报告.pdf", source: "文件" },
  { id: "c-2", title: "雅迪产品战略资料（内部）", source: "企业知识" },
  { id: "c-3", title: "中国两轮车市场年度分析", source: "互联网" },
  { id: "c-4", title: "渠道用户访谈纪要.docx", source: "文件" },
  { id: "c-5", title: "新品定义与研究方法指引", source: "企业知识" },
  { id: "c-6", title: "行业品牌公开信息汇总", source: "互联网" },
  { id: "c-7", title: "终端门店调研数据.xlsx", source: "文件" },
];

export const historyItems: HistoryItem[] = [
  {
    id: "h-1",
    title: "电动车行业竞品分析",
    type: "智能体",
    updatedAt: "今天 10:24",
    detail: "深度研究助手 · 已生成 24 页研究报告",
    route: "/agents/deep-research",
    favorite: true,
    status: "已完成",
  },
  {
    id: "h-2",
    title: "第二季度市场工作总结",
    type: "AI 对话",
    updatedAt: "昨天 17:42",
    detail: "18 轮对话 · 使用企业知识",
    route: "/chat/market-summary",
    status: "已完成",
  },
  {
    id: "h-3",
    title: "新品策略汇报",
    type: "PPT",
    updatedAt: "7 月 12 日",
    detail: "16 页 · 雅迪简洁商务模板",
    route: "/create/ppt/strategy-review",
    status: "已完成",
  },
  {
    id: "h-4",
    title: "新车型发布主视觉",
    type: "图片",
    updatedAt: "7 月 11 日",
    detail: "4 张图片 · 16:9",
    route: "/create/image/launch-visual",
    favorite: true,
    status: "已完成",
  },
  {
    id: "h-5",
    title: "渠道培训内容结构",
    type: "导图",
    updatedAt: "7 月 9 日",
    detail: "28 个节点 · 5 个主分支",
    route: "/create/mindmap/training",
    status: "已完成",
  },
  {
    id: "h-6",
    title: "夏季安全骑行短片",
    type: "视频",
    updatedAt: "7 月 8 日",
    detail: "生成失败 · 原始素材不可用",
    route: "/create/video/summer-safety",
    status: "失败",
  },
];

export const archivedHistoryItems: HistoryItem[] = [
  {
    id: "h-7",
    title: "上半年渠道运营复盘",
    type: "PPT",
    updatedAt: "6 月 28 日",
    detail: "22 页 · 项目复盘模板",
    route: "/create/ppt/channel-review",
    status: "已完成",
  },
  {
    id: "h-8",
    title: "海外市场进入路径",
    type: "智能体",
    updatedAt: "6 月 21 日",
    detail: "深度研究助手 · 已生成研究报告",
    route: "/agents/deep-research",
    status: "已完成",
  },
  {
    id: "h-9",
    title: "服务标准培训导图",
    type: "导图",
    updatedAt: "6 月 18 日",
    detail: "34 个节点 · 6 个主分支",
    route: "/create/mindmap/service-training",
    status: "已完成",
  },
];

export const creatorAgents = [
  { name: "深度研究助手", status: "已发布", users: "1,286", feedback: "92%" },
  { name: "差旅助手", status: "已发布", users: "842", feedback: "89%" },
  { name: "渠道政策解读", status: "审核中", users: "—", feedback: "—" },
  { name: "会议纪要助手", status: "草稿", users: "—", feedback: "—" },
];

export const adminKnowledge = [
  { name: "人力资源制度库", scope: "全体员工", documents: 128, updatedAt: "今天 09:42" },
  { name: "差旅与费用制度", scope: "全体员工", documents: 46, updatedAt: "昨天 18:06" },
  { name: "产品策略知识库", scope: "产品与战略中心", documents: 214, updatedAt: "7 月 13 日" },
  { name: "渠道运营资料", scope: "销售与渠道", documents: 367, updatedAt: "7 月 12 日" },
];
