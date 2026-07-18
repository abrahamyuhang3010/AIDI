"use client";

import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { AgentsRoute } from "./pages/AgentsPages";
import { AdminPage } from "./pages/AdminPage";
import { ChatPage } from "./pages/ChatPage";
import { CreationRoute } from "./pages/CreationPages";
import { CreatorPage } from "./pages/CreatorPage";
import { HelpPage } from "./pages/HelpPage";
import { HistoryPage } from "./pages/HistoryPage";
import { HomePage } from "./pages/HomePage";
import type { ToastState } from "./types";
import { ToastViewport } from "./ui";

export default function AidiDemo() {
  const pathname = usePathname();
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const addToast = useCallback((message: string, tone: ToastState["tone"] = "default") => {
    const id = Date.now();
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 2800);
  }, []);

  let page = <HomePage onToast={addToast} />;
  if (pathname.startsWith("/chat")) page = <ChatPage onToast={addToast} />;
  else if (pathname.startsWith("/agents")) page = <AgentsRoute onToast={addToast} />;
  else if (pathname.startsWith("/create")) page = <CreationRoute onToast={addToast} />;
  else if (pathname.startsWith("/history")) page = <HistoryPage onToast={addToast} />;
  else if (pathname.startsWith("/help") || pathname.startsWith("/feedback")) page = <HelpPage onToast={addToast} />;
  else if (pathname.startsWith("/creator")) page = <CreatorPage onToast={addToast} />;
  else if (pathname.startsWith("/admin")) page = <AdminPage onToast={addToast} />;

  return (
    <>
      {page}
      <ToastViewport toasts={toasts} />
    </>
  );
}
