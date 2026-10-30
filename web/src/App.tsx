import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { type Preferences, defaults } from "./preferences";
import {
  SettingsDialog,
  AboutDialog,
  ProviderDialog,
} from "./components/WorkspaceDialogs";
import gsap from "gsap";
import {
  Asterisk,
  ArrowUp,
  ArrowUpRight,
  ArrowDown,
  Plus,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ChevronDown,
  MoreHorizontal,
  MessageSquare,
  Copy,
  Check,
  Pencil,
  RotateCcw,
  Square,
  X,
  Trash2,
  Code2,
  Compass,
  PenLine,
  Lightbulb,
  WifiOff,
} from "lucide-react";
import {
  api,
  stream,
  usesBrowserStorage,
  type Conversation,
  type Message,
} from "./api";
import { DotText } from "./components/DotText";
import { DotField } from "./components/DotField";
import { Modal } from "./components/Modal";
const Markdown = lazy(() =>
  import("./components/Markdown").then((module) => ({
    default: module.Markdown,
  })),
);
const prompts = [
  {
    icon: Lightbulb,
    label: "Make something new",
    text: "Brainstorm a product that makes everyday life a little better.",
    category: "EXPLORE AN IDEA",
    color: "yellow",
  },
  {
    icon: Code2,
    label: "Untangle the complex",
    text: "Explain Java streams with a clear example.",
    category: "WRITE SOME CODE",
    color: "blue",
  },
  {
    icon: PenLine,
    label: "Find the right words",
    text: "Help me write a thoughtful introduction for a creative project.",
    category: "SHAPE A STORY",
    color: "pink",
  },
  {
    icon: Compass,
    label: "See a different angle",
    text: "Help me plan a focused week with room for creative work.",
    category: "MAKE A PLAN",
    color: "green",
  },
];
function readPreferences(): Preferences {
  try {
    return {
      ...defaults,
      ...JSON.parse(localStorage.getItem("dotline.preferences") || "{}"),
    };
  } catch {
    return defaults;
  }
}
export default function App() {
  const [provider, setProvider] = useState<"mock" | "gemini">("mock");
  const [prefs, setPrefs] = useState(readPreferences),
    [conversations, setConversations] = useState<Conversation[]>([]),
    [current, setCurrent] = useState<Conversation | null>(null),
    [query, setQuery] = useState(""),
    [collapsed, setCollapsed] = useState(false),
    [drawer, setDrawer] = useState(false),
    [modal, setModal] = useState<"settings" | "about" | "model" | null>(null),
    [manage, setManage] = useState<Conversation | null>(null),
    [rename, setRename] = useState(""),
    [draft, setDraft] = useState(""),
    [editing, setEditing] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [online, setOnline] = useState(navigator.onLine),
    [copied, setCopied] = useState<string | null>(null),
    [atBottom, setAtBottom] = useState(true),
    [installed, setInstalled] = useState(false),
    [installPrompt, setInstallPrompt] = useState<any>(null),
    [simulateError, setSimulateError] = useState(false),
    [loading, setLoading] = useState(true);
  const composer = useRef<HTMLTextAreaElement>(null),
    messages = useRef<HTMLDivElement>(null),
    abort = useRef<AbortController | null>(null),
    generation = useRef(0),
    hero = useRef<HTMLDivElement>(null),
    drawerRef = useRef<HTMLDivElement>(null),
    menuButton = useRef<HTMLButtonElement>(null);
  const [systemReduced, setSystemReduced] = useState(
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const reduced = systemReduced || !prefs.motion;
  const refresh = useCallback(async () => {
    try {
      setConversations(await api.list());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    refresh();
    api
      .health()
      .then((status) =>
        setProvider(status.provider === "gemini" ? "gemini" : "mock"),
      )
      .catch((e) => setError((e as Error).message));
    const id = localStorage.getItem("dotline.active");
    if (id)
      api
        .get(id)
        .then(setCurrent)
        .catch(() => localStorage.removeItem("dotline.active"));
    return () => abort.current?.abort();
  }, [refresh]);
  useEffect(() => {
    localStorage.setItem("dotline.preferences", JSON.stringify(prefs));
    const media = matchMedia("(prefers-color-scheme: light)");
    const apply = () =>
      (document.documentElement.dataset.theme =
        prefs.theme === "system"
          ? media.matches
            ? "light"
            : "dark"
          : prefs.theme);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [prefs]);
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setSystemReduced(m.matches);
    m.addEventListener("change", fn);
    return () => m.removeEventListener("change", fn);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? "reduced" : "full";
  }, [reduced]);
  useEffect(() => {
    const on = () => setOnline(true),
      off = () => setOnline(false),
      install = (e: Event) => {
        e.preventDefault();
        setInstallPrompt(e);
      },
      installed = () => {
        setInstalled(true);
        setInstallPrompt(null);
      };
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    window.addEventListener("beforeinstallprompt", install);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
      window.removeEventListener("beforeinstallprompt", install);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);
  useEffect(() => {
    if (!current && hero.current && !reduced) {
      const ctx = gsap.context(() => {
        gsap.from(".hero-reveal", {
          y: 16,
          opacity: 0,
          stagger: 0.09,
          duration: 0.65,
          ease: "power2.out",
        });
      }, hero);
      return () => ctx.revert();
    }
  }, [!!current, reduced]);
  useEffect(() => {
    const el = messages.current;
    if (el && atBottom)
      el.scrollTo({
        top: el.scrollHeight,
        behavior: reduced ? "instant" : "smooth",
      });
  }, [current?.messages, reduced]);
  const stop = useCallback(async () => {
    generation.current++;
    abort.current?.abort();
    setBusy(false);
    if (current) {
      await api.cancel(current.id).catch(() => {});
      for (let i = 0; i < 20; i++) {
        const chat = await api.get(current.id).catch(() => current);
        setCurrent(chat);
        if (!chat.messages?.some((m) => m.status === "generating")) break;
        await new Promise((r) => setTimeout(r, 50));
      }
      refresh();
    }
  }, [current, refresh]);
  const newChat = useCallback(() => {
    if (busy) return;
    setCurrent(null);
    localStorage.removeItem("dotline.active");
    setDraft("");
    setEditing(null);
    setError("");
    setDrawer(false);
    setTimeout(() => composer.current?.focus(), 20);
  }, [busy]);
  useEffect(() => {
    const shortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (innerWidth < 760) setDrawer(true);
        else setCollapsed(false);
        setTimeout(
          () => document.getElementById("history-search")?.focus(),
          50,
        );
      }
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "o"
      ) {
        e.preventDefault();
        newChat();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        setModal("settings");
      }
      if (e.key === "Escape") {
        if (modal || manage) return;
        if (drawer) setDrawer(false);
        if (editing) {
          setEditing(null);
          setDraft("");
        }
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [newChat, drawer, editing, modal, manage]);
  useEffect(() => {
    if (!drawer) return;
    const el = drawerRef.current!;
    const prev = document.activeElement as HTMLElement;
    el.querySelector<HTMLElement>("button")?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const nodes = Array.from(
        el.querySelectorAll<HTMLElement>("button:not(:disabled),input,a"),
      );
      const first = nodes[0],
        last = nodes.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    el.addEventListener("keydown", trap);
    return () => {
      el.removeEventListener("keydown", trap);
      prev?.focus();
    };
  }, [drawer]);
  async function open(c: Conversation) {
    if (busy) return;
    try {
      setCurrent(await api.get(c.id));
      localStorage.setItem("dotline.active", c.id);
      setDraft("");
      setEditing(null);
      setError("");
      setAtBottom(true);
      setDrawer(false);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function send(text = draft, regenerate = false) {
    if (busy || (!text.trim() && !regenerate) || !online) return;
    const run = ++generation.current;
    setError("");
    setBusy(true);
    setAtBottom(true);
    abort.current = new AbortController();
    let chat = current;
    try {
      if (!chat) {
        chat = await api.create();
        setCurrent(chat);
        localStorage.setItem("dotline.active", chat.id);
      }
      const id = chat.id;
      setDraft("");
      const editId = editing;
      setEditing(null);
      await stream(
        id,
        {
          content: text.trim(),
          regenerate,
          editMessageId: editId,
          simulateError,
          speed: prefs.speed,
        },
        abort.current.signal,
        (event) => {
          if (generation.current !== run) return;
          if (event.event === "message")
            setCurrent((c) =>
              c
                ? {
                    ...c,
                    messages: [
                      ...(c.messages || []).filter(
                        (m) => m.position < event.data.position,
                      ),
                      event.data,
                    ],
                  }
                : c,
            );
          if (event.event === "delta")
            setCurrent((c) => {
              if (!c) return c;
              const list = [...(c.messages || [])];
              const i = list.length - 1;
              if (i >= 0)
                list[i] = {
                  ...list[i],
                  content: list[i].content + event.data.text,
                };
              return { ...c, messages: list };
            });
          if (event.event === "done")
            setCurrent((c) =>
              c
                ? {
                    ...c,
                    messages: (c.messages || []).map((m) =>
                      m.id === event.data.id ? event.data : m,
                    ),
                  }
                : c,
            );
        },
      );
      if (generation.current === run) {
        setCurrent(await api.get(id));
        await refresh();
      }
    } catch (e) {
      if (generation.current === run && (e as Error).name !== "AbortError") {
        setError((e as Error).message);
        if (chat) {
          const saved = await api.get(chat.id).catch(() => chat);
          setCurrent(saved);
          if (
            !saved?.messages?.some(
              (m) => m.role === "user" && m.content === text.trim(),
            ) &&
            !regenerate
          )
            setDraft(text);
        } else if (!regenerate) setDraft(text);
      }
    } finally {
      if (generation.current === run) {
        setBusy(false);
        setSimulateError(false);
        refresh();
      }
    }
  }
  async function copy(m: Message) {
    try {
      await navigator.clipboard.writeText(m.content);
      setCopied(m.id);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      setError(
        "Clipboard access is unavailable in this browser. Select the text to copy it.",
      );
    }
  }
  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()),
  );
  const hasMessages = !!current?.messages?.length;
  return (
    <div className={`app ${collapsed ? "sidebar-collapsed" : ""}`}>
      <a className="skip-link" href="#main">
        Skip to conversation
      </a>
      {drawer && (
        <button
          className="drawer-backdrop"
          onClick={() => setDrawer(false)}
          aria-label="Close navigation"
        />
      )}
      <div
        ref={drawerRef}
        className={`sidebar-container ${drawer ? "mobile-open" : ""}`}
        role={drawer ? "dialog" : undefined}
        aria-modal={drawer || undefined}
        aria-label={drawer ? "Navigation" : undefined}
      >
        <aside className="sidebar" aria-label="Workspace navigation">
          <div className="sidebar-brand">
            <button
              className="brand"
              aria-label="DOTLINE home"
              onClick={newChat}
            >
              <span className="brand-mark">
                {Array.from({ length: 9 }, (_, i) => (
                  <i key={i} />
                ))}
              </span>
              <DotText text="DOTLINE" />
            </button>
            <button
              className="icon-button collapse"
              aria-label="Collapse sidebar"
              onClick={() => {
                setCollapsed(true);
                setDrawer(false);
              }}
            >
              <PanelLeftClose size={18} />
            </button>
            <button
              className="icon-button mobile-close"
              aria-label="Close navigation"
              onClick={() => setDrawer(false)}
            >
              <X size={20} />
            </button>
          </div>
          <button className="new-chat" onClick={newChat} disabled={busy}>
            <Plus size={17} />
            <span>New conversation</span>
            <span className="keyhint">⌘ ⇧ O</span>
          </button>
          <label className="history-search">
            <Search size={16} />
            <input
              id="history-search"
              placeholder="Search conversations"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <kbd>⌘ K</kbd>
          </label>
          <div className="history-caption">
            <span>YOUR SPACE</span>
            <span>{String(conversations.length).padStart(2, "0")}</span>
          </div>
          <nav className="history" aria-label="Conversation history">
            {loading ? (
              <p className="history-empty">Connecting to your workspace…</p>
            ) : filtered.length ? (
              filtered.map((c) => (
                <div
                  key={c.id}
                  className={`history-row ${current?.id === c.id ? "active" : ""}`}
                >
                  <button disabled={busy} onClick={() => open(c)}>
                    <MessageSquare size={14} />
                    <span>{c.title}</span>
                  </button>
                  <button
                    className="icon-button"
                    disabled={busy}
                    onClick={() => {
                      setManage(c);
                      setRename(c.title);
                    }}
                    aria-label={`Manage ${c.title}`}
                  >
                    <MoreHorizontal size={17} />
                  </button>
                </div>
              ))
            ) : (
              <div className="history-empty">
                <MessageSquare size={23} />
                <p>
                  {query
                    ? "No conversations found."
                    : "Good ideas start somewhere."}
                </p>
                <span>
                  {query
                    ? "Try a different search."
                    : "Your conversations will live here."}
                </span>
              </div>
            )}
          </nav>
          <div className="sidebar-bottom">
            <div className="local-card">
              <span className="red-dot" />
              <div>
                <b>A space to experiment.</b>
                <p>
                  {provider === "gemini"
                    ? "A little space to think."
                    : "Mock AI. Real possibilities."}
                </p>
              </div>
              <span className="small-dots">⠿</span>
            </div>
            <button
              className="settings-button"
              onClick={() => setModal("settings")}
            >
              <Settings size={17} /> Settings <span>⌘ ,</span>
            </button>
            <div className="profile">
              <span className="avatar">Y</span>
              <div>
                <b>Your workspace</b>
                <small>
                  {usesBrowserStorage ? "THIS BROWSER" : "LOCAL / PRIVATE"}
                </small>
              </div>
              <button
                className="icon-button"
                aria-label="About this workspace"
                onClick={() => setModal("about")}
              >
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>
        </aside>
      </div>
      <div className="workspace">
        <header className="topbar">
          <div className="topbar-left">
            <button
              ref={menuButton}
              className="icon-button expand"
              aria-label="Open navigation"
              onClick={() => {
                if (innerWidth < 760) setDrawer(true);
                else setCollapsed(false);
              }}
            >
              <PanelLeftOpen size={19} />
            </button>
            <button className="model-select" onClick={() => setModal("model")}>
              <Asterisk className="model-icon" size={23} /> DOTLINE{" "}
              <span className="model-version">01</span>
              <ChevronDown size={13} />
            </button>
            <span className="header-divider" />
            <span className="topbar-caption">
              A little space for a bigger idea.
            </span>
          </div>
          <button className="demo-badge" onClick={() => setModal("model")}>
            <span className="red-dot" />{" "}
            {provider === "gemini" ? "GEMINI" : "MOCK MODE"}{" "}
            <ChevronDown size={11} />
          </button>
        </header>
        <main id="main" className={hasMessages ? "chat-main" : "welcome-main"}>
          {!online && (
            <div className="offline-banner" role="status">
              <WifiOff size={16} /> You’re offline. Your workspace shell is
              available; reconnect to load or send conversations.
            </div>
          )}
          {!hasMessages ? (
            <div className="welcome" ref={hero}>
              <DotField reduced={reduced} />
              <div className="hero-content">
                <div className="eyebrow hero-reveal">
                  <Asterisk className="tiny-star" size={19} /> LESS NOISE. MORE
                  POSSIBILITY.
                </div>
                <h1 className="hero-reveal">
                  Think outside
                  <br />
                  <DotText text="THE PROMPT." />
                </h1>
                <p className="hero-description hero-reveal">
                  A thought partner for your next what if.
                  <br />
                  Make sense of the complex. Make room for the unexpected.
                </p>
                <button
                  className="hero-cta hero-reveal"
                  onClick={() => {
                    composer.current?.focus();
                    composer.current?.scrollIntoView({
                      block: "nearest",
                      behavior: reduced ? "instant" : "smooth",
                    });
                  }}
                >
                  Let’s make something <ArrowUpRight size={17} />
                </button>
                <div className="hero-footnote hero-reveal">
                  <span className="status-light" />{" "}
                  {provider === "gemini"
                    ? "A LITTLE SPACE FOR YOUR NEXT IDEA."
                    : "A MOCK-FIRST WORKSPACE. BUILT FOR EXPLORATION."}
                </div>
              </div>
              <div className="prompt-section">
                <div className="section-line">
                  <span>A SPARK TO GET YOU STARTED</span>
                  <span>01 — 04</span>
                </div>
                <div className="prompt-grid">
                  {prompts.map((p) => (
                    <button
                      className="prompt-card"
                      key={p.label}
                      onClick={() => send(p.text)}
                      disabled={busy || !online}
                    >
                      <div className="prompt-card-top">
                        <p.icon size={19} className={p.color} />
                        <ArrowUpRight size={15} />
                      </div>
                      <h2>{p.label}</h2>
                      <span>{p.category}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="message-scroll"
              ref={messages}
              onScroll={(e) => {
                const el = e.currentTarget;
                setAtBottom(
                  el.scrollHeight - el.scrollTop - el.clientHeight < 100,
                );
              }}
            >
              <div className="conversation-heading">
                <span className="eyebrow">YOUR CONVERSATION</span>
                <h1>{current?.title}</h1>
                <span className="conversation-mode">
                  <span className="red-dot" />{" "}
                  {provider === "gemini"
                    ? "Gemini responses"
                    : "Simulated responses"}{" "}
                  ·{" "}
                  {usesBrowserStorage
                    ? "Saved in this browser"
                    : "Local workspace"}
                </span>
              </div>
              <div className="message-list">
                {current?.messages?.map((m) => (
                  <article key={m.id} className={`message ${m.role}`}>
                    <div
                      className={`message-avatar ${m.role === "assistant" ? "assistant-avatar" : ""}`}
                    >
                      {m.role === "assistant" ? <Asterisk size={24} /> : "Y"}
                    </div>
                    <div className="message-body">
                      <div className="message-meta">
                        <b>{m.role === "assistant" ? "DOTLINE" : "You"}</b>
                        <span>
                          {m.role === "assistant"
                            ? m.provider === "gemini"
                              ? "GEMINI RESPONSE"
                              : "MOCK RESPONSE"
                            : new Date(m.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                        </span>
                      </div>
                      {m.content ? (
                        <Suspense fallback={<p>{m.content}</p>}>
                          <Markdown text={m.content} />
                        </Suspense>
                      ) : m.status === "generating" ? (
                        <div
                          className="thinking"
                          aria-label={
                            provider === "gemini"
                              ? "Generating response"
                              : "Generating mock response"
                          }
                        >
                          {Array.from({ length: 9 }, (_, i) => (
                            <i key={i} />
                          ))}
                          <span>Connecting the dots</span>
                        </div>
                      ) : (
                        <p className="muted">
                          {m.status === "failed"
                            ? "This response couldn’t be completed. Retry below."
                            : "Response stopped."}
                        </p>
                      )}
                      {m.status === "generating" && m.content && (
                        <span
                          className="stream-cursor"
                          aria-label="Generating"
                        />
                      )}
                      <div className="message-actions">
                        {m.content && (
                          <button
                            onClick={() => copy(m)}
                            aria-label="Copy message"
                          >
                            {copied === m.id ? (
                              <Check size={14} />
                            ) : (
                              <Copy size={14} />
                            )}
                            <span>{copied === m.id ? "Copied" : "Copy"}</span>
                          </button>
                        )}
                        {m.role === "user" && (
                          <button
                            disabled={busy}
                            onClick={() => {
                              setEditing(m.id);
                              setDraft(m.content);
                              composer.current?.focus();
                            }}
                            aria-label="Edit message"
                          >
                            <Pencil size={14} />
                            <span>Edit</span>
                          </button>
                        )}
                        {m.role === "assistant" &&
                          m.id === current?.messages?.at(-1)?.id && (
                            <button
                              disabled={busy}
                              onClick={() => send("", true)}
                              aria-label="Regenerate response"
                            >
                              <RotateCcw size={14} />
                              <span>Regenerate</span>
                            </button>
                          )}
                        {m.status === "cancelled" && <span>Stopped</span>}
                        {m.status === "failed" && <span>Not completed</span>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="scroll-anchor" />
            </div>
          )}
          {hasMessages && !atBottom && (
            <button
              className="scroll-bottom icon-button"
              onClick={() => {
                messages.current?.scrollTo({
                  top: messages.current.scrollHeight,
                  behavior: reduced ? "instant" : "smooth",
                });
                setAtBottom(true);
              }}
              aria-label="Scroll to latest message"
            >
              <ArrowDown size={18} />
            </button>
          )}
        </main>
        <div className="composer-area">
          {error && (
            <div className="error-banner" role="alert">
              <span>{error}</span>
              <button
                onClick={() => {
                  if (hasMessages) send("", true);
                  else if (draft.trim()) send();
                  else refresh();
                }}
                disabled={busy}
              >
                Retry
              </button>
              <button
                className="icon-button"
                aria-label="Dismiss error"
                onClick={() => setError("")}
              >
                <X size={15} />
              </button>
            </div>
          )}
          {editing && (
            <div className="edit-banner">
              <Pencil size={14} /> Editing message · Later replies will be
              replaced.
              <button
                onClick={() => {
                  setEditing(null);
                  setDraft("");
                }}
              >
                Cancel
              </button>
            </div>
          )}
          <form
            className={`composer ${busy ? "generating" : ""}`}
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <label className="sr-only" htmlFor="message">
              Message DOTLINE
            </label>
            <textarea
              ref={composer}
              id="message"
              placeholder="Where should we take your mind today?"
              value={draft}
              maxLength={12000}
              rows={1}
              onChange={(e) => {
                setDraft(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 150) + "px";
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  prefs.enter &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <div className="composer-bottom">
              <button
                className="composer-model"
                type="button"
                onClick={() => setModal("model")}
              >
                <span>
                  <Asterisk size={18} />
                </span>{" "}
                DOTLINE 01 <ChevronDown size={12} />
              </button>
              <div className="composer-right">
                <span className="composer-hint">
                  {busy
                    ? "Thinking in dots…"
                    : prefs.enter
                      ? "↵ to send"
                      : "Shift + Enter for a new line"}
                </span>
                {busy ? (
                  <button
                    className="send-button stop"
                    type="button"
                    aria-label="Stop response"
                    onClick={stop}
                  >
                    <Square size={15} fill="currentColor" />
                  </button>
                ) : (
                  <button
                    className="send-button"
                    type="submit"
                    aria-label="Send message"
                    disabled={!draft.trim() || !online}
                  >
                    <ArrowUp size={20} />
                  </button>
                )}
              </div>
            </div>
          </form>
          <div className="composer-disclaimer">
            <span>
              Made for curious minds.{" "}
              <b>
                {provider === "gemini"
                  ? "AI can make mistakes. Check important information."
                  : "Responses are simulated, not live AI."}
              </b>
            </span>
            <button onClick={() => setModal("about")}>
              THE DETAILS <ArrowUpRight size={10} />
            </button>
          </div>
        </div>
        <footer className="statusbar">
          <span>
            <i />{" "}
            {usesBrowserStorage
              ? "HISTORY IN THIS BROWSER"
              : "ALL SYSTEMS LOCAL"}
          </span>
          <span>
            IMAGINATION HAS NO OFF SWITCH.{" "}
            <span className="footer-plus">+</span>
          </span>
          <button onClick={() => setModal("about")}>
            DOTLINE / V.01 <ArrowUpRight size={11} />
          </button>
        </footer>
      </div>
      {modal === "settings" && (
        <SettingsDialog
          prefs={prefs}
          setPrefs={setPrefs}
          systemReduced={systemReduced}
          installed={installed}
          installPrompt={installPrompt}
          setInstallPrompt={setInstallPrompt}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "about" && (
        <AboutDialog
          browserHistory={usesBrowserStorage}
          provider={provider}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "model" && (
        <ProviderDialog
          provider={provider}
          simulateError={simulateError}
          setSimulateError={setSimulateError}
          onClose={() => setModal(null)}
        />
      )}
      {manage && (
        <Modal title="Conversation details" onClose={() => setManage(null)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api.rename(manage.id, rename);
                if (current?.id === manage.id)
                  setCurrent({ ...current, title: rename.trim() });
                await refresh();
                setManage(null);
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            <label className="form-label" htmlFor="rename">
              Conversation name
            </label>
            <input
              id="rename"
              className="text-input"
              value={rename}
              maxLength={80}
              required
              onChange={(e) => setRename(e.target.value)}
            />
            <div className="modal-actions">
              <button
                className="danger-button"
                type="button"
                onClick={async () => {
                  try {
                    await api.remove(manage.id);
                    if (current?.id === manage.id) newChat();
                    await refresh();
                    setManage(null);
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                <Trash2 size={15} /> Delete conversation
              </button>
              <button className="primary-button" disabled={!rename.trim()}>
                Save name
              </button>
            </div>
            <p className="muted">
              Deleting permanently removes this conversation and its messages.
            </p>
          </form>
        </Modal>
      )}
    </div>
  );
}
