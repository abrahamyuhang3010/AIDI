"use client";

import {
  ArrowRight,
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Download,
  FileImage,
  FileText,
  GitFork,
  GripVertical,
  Layers3,
  History,
  MonitorPlay,
  Palette,
  PanelLeftOpen,
  Play,
  Pause,
  Plus,
  Presentation,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  WandSparkles,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { creationTools, historyItems } from "../mockData";
import { AppShell, WorkspaceSidebar } from "../shell";
import type { EditorKind } from "../types";
import {
  Button,
  DemoVisual,
  EmptyState,
  IconButton,
  InlineError,
  PageHeader,
  SectionHeader,
  SelectControl,
  UploadPrompt,
  cx,
} from "../ui";

const editorInfo: Record<EditorKind, { name: string; icon: typeof Presentation; subtitle: string }> = {
  ppt: { name: "PPT 生成", icon: Presentation, subtitle: "大纲与页面编辑" },
  image: { name: "AI 绘图", icon: FileImage, subtitle: "提示词与结果画廊" },
  mindmap: { name: "思维导图", icon: GitFork, subtitle: "内容结构与导图画布" },
  video: { name: "视频生成", icon: MonitorPlay, subtitle: "脚本、分镜与视频预览" },
};

export function CreationRoute({
  onToast,
}: {
  onToast: (message: string, tone?: "default" | "success" | "error") => void;
}) {
  const pathname = usePathname();
  if (pathname === "/create") return <CreationHome />;
  const segments = pathname.split("/").filter(Boolean);
  const kind = (segments[1] ?? "ppt") as EditorKind;
  return <CreationEditor kind={kind in editorInfo ? kind : "ppt"} projectId={segments[2]} onToast={onToast} />;
}

function CreationHome() {
  const router = useRouter();
  const recent = historyItems.filter((item) => ["PPT", "图片", "导图", "视频"].includes(item.type)).slice(0, 4);
  return (
    <AppShell>
      <div className="aidi-page aidi-creation-home">
        <div className="aidi-wide-content">
          <PageHeader
            eyebrow="从内容到成果"
            title="内容生成"
            description="将主题、文件或 AI 结果转化为可编辑、可保存、可导出的工作成果。"
          />
          <section className="aidi-creation-tools">
            {creationTools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  type="button"
                  className={cx("aidi-creation-tool-card", `is-${tool.tone}`)}
                  onClick={() => router.push(tool.route)}
                >
                  <span className="aidi-creation-tool-card__index">0{index + 1}</span>
                  <span className="aidi-creation-tool-card__icon"><Icon aria-hidden="true" /></span>
                  <div>
                    <h2>{tool.name}</h2>
                    <p>{tool.description}</p>
                    <small>{tool.helper}</small>
                  </div>
                  <ArrowRight aria-hidden="true" />
                </button>
              );
            })}
          </section>

          <section className="aidi-home-section">
            <SectionHeader title="最近生成" description="继续编辑或下载最近创建的内容。" />
            <div className="aidi-creation-recent-grid">
              {recent.map((item) => (
                <button key={item.id} type="button" onClick={() => router.push(item.route)}>
                  <div className={cx("aidi-creation-thumb", `is-${item.type}`)}>
                    {item.type === "PPT" ? <Presentation /> : item.type === "图片" ? <FileImage /> : item.type === "导图" ? <GitFork /> : <MonitorPlay />}
                    <span>{item.type}</span>
                  </div>
                  <strong>{item.title}</strong>
                  <small>{item.updatedAt} · {item.detail}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="aidi-template-band">
            <div>
              <span className="aidi-eyebrow">推荐模板</span>
              <h2>从企业常用结构开始</h2>
              <p>选择已经整理好的内容结构，减少重复排版和信息组织。</p>
            </div>
            <div className="aidi-template-list">
              {["项目复盘", "竞品分析", "季度汇报"].map((template, index) => (
                <button key={template} type="button" onClick={() => router.push(`/create/ppt/${template}`)}>
                  <span>0{index + 1}</span>
                  <strong>{template}</strong>
                  <ArrowRight aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function CreationEditor({
  kind,
  projectId,
  onToast,
}: {
  kind: EditorKind;
  projectId?: string;
  onToast: (message: string, tone?: "default" | "success" | "error") => void;
}) {
  const router = useRouter();
  const [section, setSection] = useState("content");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [started, setStarted] = useState(kind === "image" || Boolean(projectId));
  const [generationError, setGenerationError] = useState(kind === "video" && projectId === "summer-safety");
  const info = editorInfo[kind];
  const Icon = info.icon;
  const sidebarItems =
    kind === "ppt"
      ? [
          { id: "content", label: "页面列表", icon: <Layers3 aria-hidden="true" />, meta: "6" },
          { id: "outline", label: "内容大纲", icon: <FileText aria-hidden="true" /> },
          { id: "theme", label: "主题模板", icon: <Palette aria-hidden="true" /> },
        ]
      : kind === "image"
        ? [
            { id: "content", label: "生成设置", icon: <WandSparkles aria-hidden="true" /> },
            { id: "history", label: "生成记录", icon: <FileImage aria-hidden="true" />, meta: "12" },
          ]
        : kind === "mindmap"
          ? [
              { id: "content", label: "内容层级", icon: <GitFork aria-hidden="true" /> },
              { id: "theme", label: "导图样式", icon: <Palette aria-hidden="true" /> },
            ]
          : [
              { id: "content", label: "脚本与分镜", icon: <FileText aria-hidden="true" /> },
              { id: "settings", label: "生成设置", icon: <WandSparkles aria-hidden="true" /> },
            ];

  function save() {
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      onToast("项目已保存到历史与成果", "success");
    }, 700);
  }

  function exportResult() {
    setExporting(true);
    window.setTimeout(() => {
      setExporting(false);
      onToast(kind === "ppt" ? "PPT 文件已准备下载" : "导出文件已准备下载", "success");
    }, 900);
  }

  return (
    <AppShell
      className="aidi-editor-shell"
      sidebarOpen={sidebarOpen}
      sidebar={
        <WorkspaceSidebar
          title={info.name}
          items={sidebarItems}
          active={section}
          onChange={setSection}
          onBack={() => router.push("/create")}
          onClose={() => setSidebarOpen(false)}
        />
      }
    >
      <div className="aidi-editor-page">
        <header className="aidi-editor-header">
          <div>
            {!sidebarOpen && (
              <IconButton label="打开工具侧栏" onClick={() => setSidebarOpen(true)}>
                <PanelLeftOpen aria-hidden="true" />
              </IconButton>
            )}
            <span className={cx("aidi-editor-header__icon", `is-${kind}`)}><Icon aria-hidden="true" /></span>
            <div>
              <h1>{started ? kind === "ppt" ? "新品市场进入策略" : kind === "image" ? "新车型发布主视觉" : kind === "mindmap" ? "渠道培训内容结构" : "夏季安全骑行短片" : `新建${info.name}`}</h1>
              <span>{generationError ? <><AlertTriangle aria-hidden="true" /> 生成中断 · 原始素材不可用</> : <><Check aria-hidden="true" /> {started ? "已保存" : "尚未生成"} · {info.subtitle}</>}</span>
            </div>
          </div>
          <div>
            <Button tone="ghost" size="sm" icon={<RefreshCw aria-hidden="true" />} disabled={!started} onClick={() => { setGenerationError(false); onToast("已重新生成当前内容", "success"); }}>重新生成</Button>
            <Button tone="secondary" size="sm" icon={<Save aria-hidden="true" />} loading={saving} onClick={save}>保存</Button>
            <Button tone="primary" size="sm" icon={<Download aria-hidden="true" />} disabled={!started || generationError} loading={exporting} onClick={exportResult}>导出</Button>
            <IconButton label="查看版本与最近记录" onClick={() => router.push("/history")}><History aria-hidden="true" /></IconButton>
          </div>
        </header>
        {generationError ? (
          <div className="aidi-editor-error-state">
            <InlineError message="原始素材无法解析，视频生成已停止。当前脚本和分镜已保留，可以更换素材后重试。" onRetry={() => { setGenerationError(false); setStarted(true); onToast("已恢复脚本和分镜，可以重新生成", "success"); }} />
          </div>
        ) : !started && kind !== "image" ? (
          <CreationStarter kind={kind} onStart={() => { setStarted(true); setSection(kind === "ppt" ? "outline" : "content"); }} onToast={onToast} />
        ) : (
          <>
            {kind === "ppt" && <PptEditor section={section} onToast={onToast} />}
            {kind === "image" && <ImageEditor section={section} onToast={onToast} />}
            {kind === "mindmap" && <MindMapEditor section={section} onToast={onToast} />}
            {kind === "video" && <VideoEditor section={section} onToast={onToast} />}
          </>
        )}
      </div>
    </AppShell>
  );
}

function CreationStarter({
  kind,
  onStart,
  onToast,
}: {
  kind: Exclude<EditorKind, "image">;
  onStart: () => void;
  onToast: (message: string, tone?: "default" | "success" | "error") => void;
}) {
  const [topic, setTopic] = useState(kind === "ppt" ? "新品市场进入策略" : kind === "mindmap" ? "渠道培训内容结构" : "夏季安全骑行短片");
  const [fileName, setFileName] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(false);

  function start() {
    if (!topic.trim()) return;
    setGenerating(true);
    setError(false);
    window.setTimeout(() => {
      setGenerating(false);
      if (topic.includes("失败")) {
        setError(true);
        return;
      }
      onToast(kind === "ppt" ? "大纲已生成" : kind === "mindmap" ? "内容结构已提取" : "脚本与分镜已生成", "success");
      onStart();
    }, 1100);
  }

  return (
    <div className="aidi-creation-starter">
      <span className="aidi-eyebrow">开始生成</span>
      <h2>{kind === "ppt" ? "从主题或资料生成大纲" : kind === "mindmap" ? "提取内容结构并生成导图" : "从主题或文案生成脚本与分镜"}</h2>
      <p>{kind === "ppt" ? "AIDI 会先生成可调整的大纲，确认后再创建页面。" : kind === "mindmap" ? "可以输入主题，也可以上传文件提取层级关系。" : "先确认脚本和分镜，再进入视频预览与生成。"}</p>
      <label className="aidi-field">
        <span>{kind === "video" ? "视频主题或文案" : "主题"}</span>
        <textarea rows={5} maxLength={1000} value={topic} onChange={(event) => setTopic(event.target.value)} />
      </label>
      <label className="aidi-starter-upload">
        <FileText aria-hidden="true" />
        <span><strong>{fileName ?? "上传参考文件"}</strong><small>{fileName ? "文件已附加，将用于生成" : "支持 Word、PDF、Excel、图片和文本"}</small></span>
        <span className="aidi-button aidi-button--secondary aidi-button--sm">选择文件</span>
        <input type="file" accept=".doc,.docx,.pdf,.xls,.xlsx,.txt,image/*" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)} />
      </label>
      {error && <InlineError message="输入内容暂时无法处理，请调整主题或更换参考文件后重试。" onRetry={start} />}
      <Button tone="primary" loading={generating} disabled={!topic.trim()} icon={<Sparkles aria-hidden="true" />} onClick={start}>
        {kind === "ppt" ? "生成大纲" : kind === "mindmap" ? "生成导图" : "生成脚本与分镜"}
      </Button>
    </div>
  );
}

function PptEditor({ section, onToast }: { section: string; onToast: (message: string, tone?: "default" | "success" | "error") => void }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [slides, setSlides] = useState(["封面", "市场背景", "用户洞察", "机会判断", "进入策略", "行动计划"]);
  const [past, setPast] = useState<string[][]>([]);
  const [future, setFuture] = useState<string[][]>([]);
  const [template, setTemplate] = useState("雅迪简洁商务");
  const [zoom, setZoom] = useState(82);

  function commitSlides(next: string[]) {
    setPast((current) => [...current.slice(-19), slides]);
    setFuture([]);
    setSlides(next);
  }

  function updateSlide(index: number, value: string) {
    commitSlides(slides.map((item, itemIndex) => itemIndex === index ? value : item));
  }

  function moveSlide(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;
    const next = [...slides];
    [next[index], next[target]] = [next[target], next[index]];
    commitSlides(next);
    setActiveSlide(target);
  }

  function removeSlide(index: number) {
    if (slides.length === 1) return;
    commitSlides(slides.filter((_, itemIndex) => itemIndex !== index));
    setActiveSlide((current) => Math.min(current, slides.length - 2));
  }

  function undo() {
    const previous = past.at(-1);
    if (!previous) return;
    setPast((current) => current.slice(0, -1));
    setFuture((current) => [slides, ...current].slice(0, 20));
    setSlides(previous);
  }

  function redo() {
    const next = future[0];
    if (!next) return;
    setFuture((current) => current.slice(1));
    setPast((current) => [...current, slides].slice(-20));
    setSlides(next);
  }

  if (section === "theme") {
    return (
      <div className="aidi-editor-workspace aidi-editor-workspace--settings">
        <PageHeader title="主题模板" description="切换模板会保留当前大纲和页面文字。" />
        <div className="aidi-template-picker">
          {["雅迪简洁商务", "新品发布", "研究报告", "培训手册"].map((item) => (
            <button key={item} type="button" className={cx(template === item && "is-active")} onClick={() => setTemplate(item)}>
              <DemoVisual kind="slide" />
              <span>{item}</span>
              {template === item && <Check aria-hidden="true" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (section === "outline") {
    return (
      <div className="aidi-editor-workspace aidi-editor-workspace--settings">
        <PageHeader title="内容大纲" description="调整章节顺序，修改后可重新生成页面。" actions={<Button tone="primary" icon={<Sparkles aria-hidden="true" />} onClick={() => onToast("已根据最新大纲生成页面", "success")}>根据大纲生成页面</Button>} />
        <div className="aidi-outline-editor">
          {slides.map((slide, index) => (
            <div key={slide}>
              <GripVertical aria-hidden="true" />
              <span>{index + 1}</span>
              <input aria-label={`第 ${index + 1} 页标题`} value={slide} onChange={(event) => updateSlide(index, event.target.value)} />
              <IconButton label={`上移 ${slide}`} disabled={index === 0} onClick={() => moveSlide(index, -1)}><ArrowUp aria-hidden="true" /></IconButton>
              <IconButton label={`下移 ${slide}`} disabled={index === slides.length - 1} onClick={() => moveSlide(index, 1)}><ArrowDown aria-hidden="true" /></IconButton>
              <IconButton label={`删除 ${slide}`} disabled={slides.length === 1} onClick={() => removeSlide(index)}><Trash2 aria-hidden="true" /></IconButton>
            </div>
          ))}
          <Button tone="secondary" icon={<Plus aria-hidden="true" />} onClick={() => commitSlides([...slides, "新页面"])}>新增页面</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="aidi-ppt-editor">
      <aside className="aidi-slide-list">
        <div className="aidi-slide-list__header"><strong>页面</strong><span>{slides.length}</span></div>
        <div>
          {slides.map((slide, index) => (
            <button key={`${slide}-${index}`} type="button" className={cx(activeSlide === index && "is-active")} onClick={() => setActiveSlide(index)}>
              <span>{index + 1}</span>
              <div className="aidi-slide-thumb"><span /><span /><span /></div>
              <small>{slide}</small>
            </button>
          ))}
        </div>
        <Button tone="ghost" size="sm" icon={<Plus aria-hidden="true" />} onClick={() => commitSlides([...slides, "新页面"])}>新增页面</Button>
      </aside>
      <section className="aidi-slide-stage">
        <div className="aidi-slide-toolbar">
          <div>
            <IconButton label="撤销" disabled={!past.length} onClick={undo}><ChevronLeft aria-hidden="true" /></IconButton>
            <IconButton label="重做" disabled={!future.length} onClick={redo}><ChevronRight aria-hidden="true" /></IconButton>
          </div>
          <div>
            <IconButton label="缩小" onClick={() => setZoom((current) => Math.max(50, current - 10))}><ZoomOut aria-hidden="true" /></IconButton>
            <span>{zoom}%</span>
            <IconButton label="放大" onClick={() => setZoom((current) => Math.min(120, current + 10))}><ZoomIn aria-hidden="true" /></IconButton>
          </div>
        </div>
        <div className="aidi-slide-canvas" style={{ "--slide-scale": zoom / 100 } as React.CSSProperties}>
          <DemoVisual kind="slide" title={slides[activeSlide]} />
        </div>
      </section>
      <aside className="aidi-property-panel">
        <h2>页面设置</h2>
        <SelectControl label="主题模板" value={template} options={["雅迪简洁商务", "新品发布", "研究报告"]} onChange={setTemplate} />
        <label className="aidi-field"><span>页面标题</span><input value={slides[activeSlide]} onChange={(event) => updateSlide(activeSlide, event.target.value)} /></label>
        <label className="aidi-field"><span>补充说明</span><textarea defaultValue="突出市场机会、用户价值与渠道协同。" rows={5} /></label>
        <Button tone="secondary" icon={<Sparkles aria-hidden="true" />} onClick={() => onToast("当前页面已重新生成", "success")}>重新生成单页</Button>
      </aside>
    </div>
  );
}

function ImageEditor({ section, onToast }: { section: string; onToast: (message: string, tone?: "default" | "success" | "error") => void }) {
  const [prompt, setPrompt] = useState("一辆面向城市通勤的智能电动车，轻盈车身，真实产品摄影质感");
  const [ratio, setRatio] = useState("16:9");
  const [style, setStyle] = useState("产品摄影");
  const [generating, setGenerating] = useState(false);
  const [count, setCount] = useState(section === "history" ? 8 : 4);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [error, setError] = useState(false);

  function generate() {
    setGenerating(true);
    setError(false);
    window.setTimeout(() => {
      setGenerating(false);
      if (prompt.includes("失败")) {
        setCount(0);
        setError(true);
        return;
      }
      setCount(4);
      onToast("已生成 4 张图片", "success");
    }, 1500);
  }

  return (
    <div className="aidi-image-editor">
      <aside className="aidi-generation-settings">
        <label className="aidi-field"><span>画面描述</span><textarea rows={8} value={prompt} onChange={(event) => setPrompt(event.target.value)} /></label>
        <button type="button" className="aidi-prompt-polish" onClick={() => setPrompt((current) => `${current}，柔和棚拍光线，清晰材质细节，简洁背景`)}><Sparkles aria-hidden="true" />优化描述</button>
        <SelectControl label="画面比例" value={ratio} options={["16:9", "1:1", "4:3", "3:4"]} onChange={setRatio} />
        <SelectControl label="视觉风格" value={style} options={["产品摄影", "品牌海报", "概念设计", "写实场景"]} onChange={setStyle} />
        <Button tone="primary" loading={generating} icon={<WandSparkles aria-hidden="true" />} onClick={generate}>生成 4 张图片</Button>
      </aside>
      <section className="aidi-image-results">
        <div className="aidi-editor-section-title">
          <div><h2>{section === "history" ? "生成记录" : "生成结果"}</h2><p>{generating ? "正在构建画面细节，这通常需要约 30 秒。" : `${style} · ${ratio} · ${count} 张`}</p></div>
          <Button tone="ghost" size="sm" icon={<RefreshCw aria-hidden="true" />} onClick={generate}>再次生成</Button>
        </div>
        {error ? (
          <InlineError message="图片生成服务没有返回有效结果。请调整画面描述或参数后重试。" onRetry={generate} />
        ) : generating ? (
          <div className="aidi-image-skeleton-grid" aria-label="正在生成图片">{[1, 2, 3, 4].map((item) => <span key={item} />)}</div>
        ) : count ? (
          <div className="aidi-image-grid">
            {Array.from({ length: count }, (_, index) => (
              <article key={index} className={`variant-${(index % 4) + 1}`}>
                <DemoVisual kind="image" />
                <div>
                  <span>方案 {String(index + 1).padStart(2, "0")}</span>
                  <div><IconButton label="放大查看" onClick={() => setPreviewIndex(index)}><ZoomIn aria-hidden="true" /></IconButton><IconButton label="下载图片" onClick={() => onToast("图片下载已开始", "success")}><Download aria-hidden="true" /></IconButton></div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="还没有生成图片" description="完善左侧画面描述和参数，然后开始生成。" icon="sparkles" />
        )}
      </section>
      {previewIndex !== null && (
        <div className="aidi-image-preview" role="dialog" aria-modal="true" aria-label={`图片方案 ${previewIndex + 1} 预览`} tabIndex={-1} autoFocus onKeyDown={(event) => { if (event.key === "Escape") setPreviewIndex(null); }}>
          <button type="button" className="aidi-image-preview__scrim" aria-label="关闭图片预览" onClick={() => setPreviewIndex(null)} />
          <div>
            <div><strong>方案 {String(previewIndex + 1).padStart(2, "0")}</strong><IconButton label="关闭图片预览" onClick={() => setPreviewIndex(null)}><X aria-hidden="true" /></IconButton></div>
            <DemoVisual kind="image" />
            <Button tone="primary" icon={<Download aria-hidden="true" />} onClick={() => onToast("图片下载已开始", "success")}>下载图片</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function MindMapEditor({ section, onToast }: { section: string; onToast: (message: string, tone?: "default" | "success" | "error") => void }) {
  const [zoom, setZoom] = useState(90);
  const [selected, setSelected] = useState("渠道培训");
  const [nodes, setNodes] = useState(["渠道培训", "产品知识", "销售流程", "服务标准", "合规要求"]);
  const [levels, setLevels] = useState<Record<string, number>>({ 渠道培训: 0, 产品知识: 1, 销售流程: 1, 服务标准: 1, 合规要求: 1 });
  const [theme, setTheme] = useState("清晰蓝紫");

  function renameSelected(value: string) {
    setNodes((current) => current.map((node) => node === selected ? value : node));
    setLevels((current) => {
      const next = { ...current, [value]: current[selected] ?? 1 };
      delete next[selected];
      return next;
    });
    setSelected(value);
  }

  function addNode() {
    const name = `新节点 ${nodes.length}`;
    setNodes((current) => [...current, name]);
    setLevels((current) => ({ ...current, [name]: 1 }));
    setSelected(name);
    onToast("已新增导图节点", "success");
  }

  function moveNode(direction: -1 | 1) {
    const index = nodes.indexOf(selected);
    const target = index + direction;
    if (index <= 0 || target <= 0 || target >= nodes.length) return;
    const next = [...nodes];
    [next[index], next[target]] = [next[target], next[index]];
    setNodes(next);
  }
  return (
    <div className="aidi-mindmap-editor">
      <aside className="aidi-outline-panel">
        <div className="aidi-editor-section-title"><div><h2>{section === "theme" ? "导图样式" : "内容层级"}</h2><p>{section === "theme" ? "调整导图的布局与配色。" : "拖动节点调整信息层级。"}</p></div></div>
        {section === "theme" ? (
          <div className="aidi-theme-options">
            {["清晰蓝紫", "企业蓝", "高对比", "打印友好"].map((item, index) => <button key={item} type="button" className={cx(theme === item && "is-active")} onClick={() => { setTheme(item); onToast(`已应用${item}样式`, "success"); }}><span className={`tone-${index + 1}`} />{item}</button>)}
          </div>
        ) : (
          <div className="aidi-node-list">
            {nodes.map((node) => (
              <button key={node} type="button" className={cx(selected === node && "is-active")} onClick={() => setSelected(node)} style={{ paddingLeft: `${16 + (levels[node] ?? 0) * 22}px` }}>
                <GripVertical aria-hidden="true" /><span>{node}</span><Plus aria-hidden="true" />
              </button>
            ))}
            <Button tone="ghost" size="sm" icon={<CirclePlus aria-hidden="true" />} onClick={addNode}>新增节点</Button>
            <div className="aidi-node-editor">
              <label className="aidi-field"><span>节点名称</span><input value={selected} onChange={(event) => renameSelected(event.target.value)} /></label>
              <div>
                <IconButton label="上移节点" disabled={nodes.indexOf(selected) <= 1} onClick={() => moveNode(-1)}><ArrowUp aria-hidden="true" /></IconButton>
                <IconButton label="下移节点" disabled={nodes.indexOf(selected) <= 0 || nodes.indexOf(selected) === nodes.length - 1} onClick={() => moveNode(1)}><ArrowDown aria-hidden="true" /></IconButton>
                <Button tone="ghost" size="sm" disabled={selected === nodes[0] || (levels[selected] ?? 1) >= 3} onClick={() => setLevels((current) => ({ ...current, [selected]: (current[selected] ?? 1) + 1 }))}>降低层级</Button>
                <Button tone="ghost" size="sm" disabled={selected === nodes[0] || (levels[selected] ?? 1) <= 1} onClick={() => setLevels((current) => ({ ...current, [selected]: (current[selected] ?? 1) - 1 }))}>提升层级</Button>
              </div>
            </div>
          </div>
        )}
        <UploadPrompt onUpload={(name) => onToast(name ? `已从 ${name} 提取内容结构` : "请选择用于提取结构的文件", name ? "success" : "default")} />
      </aside>
      <section className="aidi-mindmap-canvas">
        <div className="aidi-canvas-toolbar">
          <IconButton label="缩小" onClick={() => setZoom((current) => Math.max(50, current - 10))}><ZoomOut aria-hidden="true" /></IconButton>
          <span>{zoom}%</span>
          <IconButton label="放大" onClick={() => setZoom((current) => Math.min(140, current + 10))}><ZoomIn aria-hidden="true" /></IconButton>
        </div>
        <div className={cx("aidi-mindmap", `is-theme-${["清晰蓝紫", "企业蓝", "高对比", "打印友好"].indexOf(theme) + 1}`)} style={{ "--map-scale": zoom / 100 } as React.CSSProperties}>
          <button type="button" className="aidi-map-root" onClick={() => setSelected(nodes[0])}>{nodes[0]}</button>
          <span className="aidi-map-line line-a" /><span className="aidi-map-line line-b" /><span className="aidi-map-line line-c" /><span className="aidi-map-line line-d" />
          {nodes.slice(1).map((node, index) => <button key={node} type="button" className={`aidi-map-node node-${index + 1}`} onClick={() => setSelected(node)}>{node}<small>{index + 2} 个子节点</small></button>)}
        </div>
      </section>
    </div>
  );
}

function VideoEditor({ section, onToast }: { section: string; onToast: (message: string, tone?: "default" | "success" | "error") => void }) {
  const [activeScene, setActiveScene] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [scenes, setScenes] = useState(["城市早高峰", "安全能力展示", "智能功能体验", "品牌结尾"]);
  const [scripts, setScripts] = useState<Record<number, string>>({ 0: "清晨城市道路，一辆智能电动车穿过通勤车流，镜头强调稳定与从容的骑行体验。" });
  const [ratio, setRatio] = useState("16:9");
  const [duration, setDuration] = useState("30 秒");
  const [style, setStyle] = useState("真实产品短片");
  const [playing, setPlaying] = useState(false);
  function generate() {
    setGenerating(true);
    setPlaying(false);
    window.setTimeout(() => { setGenerating(false); onToast("视频预览已生成", "success"); }, 1800);
  }
  return (
    <div className="aidi-video-editor">
      <aside className="aidi-storyboard-panel">
        <div className="aidi-editor-section-title"><div><h2>{section === "settings" ? "生成设置" : "脚本与分镜"}</h2><p>{section === "settings" ? "设置画面比例和基础节奏。" : "当前脚本包含 4 个分镜。"}</p></div></div>
        {section === "settings" ? (
          <div className="aidi-video-settings">
            <SelectControl label="画面比例" value={ratio} options={["16:9", "9:16", "1:1"]} onChange={setRatio} />
            <SelectControl label="视频时长" value={duration} options={["15 秒", "30 秒", "60 秒"]} onChange={setDuration} />
            <SelectControl label="画面风格" value={style} options={["真实产品短片", "品牌概念片", "培训讲解"]} onChange={setStyle} />
          </div>
        ) : (
          <div className="aidi-storyboard-list">
            {scenes.map((scene, index) => (
              <button key={scene} type="button" className={cx(activeScene === index && "is-active")} onClick={() => setActiveScene(index)}>
                <span>{index + 1}</span><div><strong>{scene}</strong><small>{index === 0 ? "6 秒" : "8 秒"}</small></div><GripVertical aria-hidden="true" />
              </button>
            ))}
            <Button tone="ghost" size="sm" icon={<Plus aria-hidden="true" />} onClick={() => { const next = [...scenes, `新分镜 ${scenes.length + 1}`]; setScenes(next); setActiveScene(next.length - 1); onToast("已新增分镜", "success"); }}>新增分镜</Button>
          </div>
        )}
        <Button tone="primary" loading={generating} icon={<Sparkles aria-hidden="true" />} onClick={generate}>生成视频预览</Button>
      </aside>
      <section className="aidi-video-stage">
        <DemoVisual kind="video" playing={playing} onPlay={() => setPlaying((current) => !current)} />
        <div className="aidi-video-controls"><button type="button" aria-label={playing ? "暂停视频" : "播放视频"} onClick={() => setPlaying((current) => !current)}>{playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}</button><span>{playing ? "00:08" : "00:00"}</span><div><span style={{ width: playing ? "28%" : "0%" }} /></div><span>{`00:${duration.replace(" 秒", "").padStart(2, "0")}`}</span></div>
        <div className="aidi-scene-copy"><span>分镜 {activeScene + 1}</span><h2>{scenes[activeScene]}</h2><textarea rows={3} value={scripts[activeScene] ?? "描述当前分镜的画面、动作和镜头重点。"} onChange={(event) => setScripts((current) => ({ ...current, [activeScene]: event.target.value }))} /></div>
      </section>
    </div>
  );
}
