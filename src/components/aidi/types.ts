import type { LucideIcon } from "lucide-react";

export type AppRoute =
  | "/home"
  | "/chat"
  | "/agents"
  | "/create"
  | "/history"
  | "/help"
  | "/creator"
  | "/admin";

export type AgentCategory = "全部" | "研究与分析" | "办公与写作" | "企业服务";

export interface AgentItem {
  id: string;
  name: string;
  description: string;
  category: Exclude<AgentCategory, "全部">;
  tags: string[];
  tone: "violet" | "blue" | "teal" | "amber";
  featured?: boolean;
}

export interface RecentTask {
  id: string;
  title: string;
  meta: string;
  type: "chat" | "agent" | "ppt" | "mindmap";
  route: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  type: "AI 对话" | "智能体" | "PPT" | "图片" | "导图" | "视频";
  updatedAt: string;
  detail: string;
  route: string;
  favorite?: boolean;
  status?: "已完成" | "处理中" | "失败";
}

export interface CreationTool {
  id: "ppt" | "image" | "mindmap" | "video";
  name: string;
  description: string;
  helper: string;
  route: string;
  icon: LucideIcon;
  tone: "violet" | "blue" | "teal" | "amber";
}

export interface ConversationItem {
  id: string;
  title: string;
  group: "置顶" | "今天" | "过去 7 天" | "过去 30 天" | "更早";
  pinned?: boolean;
}

export interface CitationItem {
  id: string;
  title: string;
  source: "企业知识" | "互联网" | "文件";
}

export interface ToastState {
  id: number;
  message: string;
  tone?: "default" | "success" | "error";
}

export type EditorKind = "ppt" | "image" | "mindmap" | "video";

export interface UserPermissions {
  createAgents: boolean;
  managePlatform: boolean;
}
