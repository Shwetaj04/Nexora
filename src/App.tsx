import { useEffect, useState } from "react";

import {

  Activity,

  ArrowDownRight,

  ArrowRight,

  ArrowUpRight,

  BookOpen,

  BrainCircuit,

  Check,

  ChevronDown,

  Clock3,

  

  FileText,

  FileUp,

  FolderOpen,

  Globe,

  LayoutDashboard,

  Lightbulb,

  MessageSquare,

  MoreHorizontal,

  Plus,

  Search,

  Send,

  Settings,

  ShieldCheck,

  Sparkles,

  Trash2,

  Upload,

  X,

} from "lucide-react";

type Page = "Overview" | "Knowledge Library" | "Ask Nexora" | "Decision Briefs";

type Source = {
   id: number;
  title: string;
  type: string;
  detail: string;
  color: string;
  content?: string | null;
  url?: string | null;

};

type Brief = {

  id: number;

  title: string;

  description: string;

  date: string;

  status: "Draft" | "Ready";

};

/*const initialSources: Source[] = [

  { id: 1, title: "Project research notes", type: "Note", detail: "Updated today", color: "violet" },

  { id: 2, title: "Technology comparison", type: "Document", detail: "Updated today", color: "blue" },

  { id: 3, title: "Engineering roadmap", type: "Website", detail: "Updated today", color: "emerald" },

];*/

const initialBriefs: Brief[] = [

  { id: 1, title: "Choosing a project architecture", description: "Comparing maintainability, complexity, and scalability.", date: "last updated", status: "Draft" },

  { id: 2, title: "Prioritizing next steps", description: "A practical plan based on current project goals.", date: "last updated", status: "Ready" },

];

const navItems: { label: Page; icon: typeof LayoutDashboard }[] = [

  { label: "Overview", icon: LayoutDashboard },

  { label: "Knowledge Library", icon: BookOpen },

  { label: "Ask Nexora", icon: MessageSquare },

  { label: "Decision Briefs", icon: FileText },

];

function App() {

  const [page, setPage] = useState<Page>("Overview");

  //const [sources, setSources] = useState<Source[]>(initialSources);

  const [sources, setSources] = useState<Source[]>([]);

  const [sourcesLoading, setSourcesLoading] = useState(true);

  const [briefs, setBriefs] = useState<Brief[]>(initialBriefs);

  const [query, setQuery] = useState("");

  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);

  const [modal, setModal] = useState<"note" | "url" | "brief" | null>(null);

  const [title, setTitle] = useState("");

  const [content, setContent] = useState("");

  const [notice, setNotice] = useState("");

  const [selectedSource, setSelectedSource] = useState<Source | null>(null);

useEffect(() => {
  async function loadSources() {
    try {
      const response = await fetch("http://localhost:3001/api/sources");

      if (!response.ok) {
        throw new Error("Failed to load sources.");
      }

      const data = await response.json();

      const loadedSources: Source[] = data.sources.map(
        (item: {
          id: number;
          title: string;
          content: string;
          source_type: string;
          url: string | null;
          created_at: string;
        }) => ({
          id: item.id,
          title: item.title,
          type:
            item.source_type === "link"
              ? "Website"
              : item.source_type === "document"
                ? "Document"
                : "Note",
          detail:
            item.source_type === "link"
              ? item.url ?? item.content
              : `Added ${new Date(item.created_at).toLocaleDateString()}`,
          color: item.source_type === "link" ? "emerald" : "violet",
          content: item.content,
          url: item.url,
        })
      );

      setSources(loadedSources);
    } catch (error) {
      console.error("Could not load Nexora sources:", error);
      notify("Could not load sources. Check that the backend is running.");
    } finally {
      setSourcesLoading(false);
    }
  }

  loadSources();
}, []);

  function notify(text: string) {

    setNotice(text);

    window.setTimeout(() => setNotice(""), 2800);

  }

  async function addNote() {

    if (!title.trim() || !content.trim()) {

      notify("Enter a title and some content first.");

      return;

    }

    try {

      const response = await fetch("http://localhost:3001/api/sources", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          title: title.trim(),

          content: content.trim(),

          source_type: "note",

        }),

      });

      const data = await response.json();

      if (!response.ok) {

        throw new Error(data.error || "Could not save note.");

      }

      const saved = data.source;

      setSources((old) => [

        {

          id: saved.id,

          title: saved.title,

          type: "Note",

          detail: "Added just now",

          color: "violet",

        },

        ...old,

      ]);

      setTitle("");

      setContent("");

      setModal(null);

      setPage("Knowledge Library");

      notify("Note saved to the database.");

    } catch (error) {

      console.error(error);

      notify("Could not save note. Check the backend.");

    }

  }

  async function deleteSource(id: number) {

    try {

      const response = await fetch(

        `http://localhost:3001/api/sources/${id}`,

        { method: "DELETE" }

      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(data.error || "Could not delete source.");

      }

      setSources((old) => old.filter((source) => source.id !== id));

      notify("Source deleted.");

    } catch (error) {

      console.error(error);

      notify("Could not delete source.");

    }

  }

  async function addUrl() {

    const link = content.trim();

    if (!title.trim() || !/^https?:\/\/.+/i.test(link)) {

      notify("Enter a title and a valid HTTP or HTTPS URL.");

      return;

    }

    try {

      const response = await fetch("http://localhost:3001/api/sources", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          title: title.trim(),

          content: link,

          source_type: "link",

          url: link,

        }),

      });

      const data = await response.json();

      if (!response.ok) {

        throw new Error(data.error || "Could not save link.");

      }

      const saved = data.source;

      setSources((old) => [

        {

          id: saved.id,

          title: saved.title,

          type: "Website",

          detail: saved.url ?? link,

          color: "emerald",

        },

        ...old,

      ]);

      setTitle("");

      setContent("");

      setModal(null);

      setPage("Knowledge Library");

      notify("Website link saved to the database.");

    } catch (error) {

      console.error(error);

      notify("Could not save URL. Check the backend.");

    }

  }

  function addBrief() {

    if (!title.trim()) {

      notify("Enter a title for your decision brief.");

      return;

    }

    setBriefs((old) => [

      {

        id: Date.now(),

        title: title.trim(),

        description: content.trim() || "A new decision brief ready for your research.",

        date: "Just now",

        status: "Draft",

      },

      ...old,

    ]);

    setTitle("");

    setContent("");

    setModal(null);

    setPage("Decision Briefs");

    notify("Decision brief created.");

  }

async function askQuestion() {
  const q = question.trim();
  if (!q) return;

  setMessages((old) => [...old, { role: "user", text: q }]);
  setQuestion("");

  try {
    const response = await fetch("http://localhost:3001/api/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: q }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.error || "Nexora could not get an AI response."
      );
    }

    const answer =
      data.answer ??
      data.response ??
      data.text ??
      data.result?.answer;

    if (typeof answer !== "string" || !answer.trim()) {
      throw new Error("The backend returned no answer.");
    }

    setMessages((old) => [
      ...old,
      { role: "assistant", text: answer },
    ]);
  } catch (error) {
    console.error("Ask Nexora failed:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    setMessages((old) => [
      ...old,
      {
        role: "assistant",
        text: `I couldn't get an answer right now. ${errorMessage} Please try again later.`,
      },
    ]);
  }
}


  function exportBrief(brief: Brief) {

    const text = `# ${brief.title}\n\n${brief.description}\n\nStatus: ${brief.status}\nCreated/updated: ${brief.date}\n\n## Evidence\n\nAdd verified source evidence here.\n\n## Recommendation\n\nComplete this section after reviewing the relevant sources.\n`;

    const url = URL.createObjectURL(new Blob([text], { type: "text/markdown" }));

    const a = document.createElement("a");

    a.href = url;

    a.download = `${brief.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;

    a.click();

    URL.revokeObjectURL(url);

    notify("Markdown draft exported.");

  }

  const filteredSources = sources.filter((s) =>

    `${s.title} ${s.type} ${s.detail}`.toLowerCase().includes(query.toLowerCase())

  );

  return (

    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-slate-200/80 bg-white px-4 py-6 lg:flex">

        <div className="mb-10 flex items-center gap-3 px-2">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-200">

            <BrainCircuit size={23} />

          </div>

          <div>

            <div className="text-xl font-bold tracking-tight">nexora<span className="text-violet-600">.</span></div>

            <div className="text-[11px] text-slate-400">KNOW MORE. DECIDE BETTER.</div>

          </div>

        </div>

        <div className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</div>

        <nav className="space-y-1">

          {navItems.map(({ label, icon: Icon }) => (

            <button

              key={label}

              onClick={() => setPage(label)}

              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${

                page === label

                  ? "bg-violet-50 text-violet-700"

                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"

              }`}

            >

              <Icon size={18} />

              {label}

              {label === "Knowledge Library" && (

                <span className="ml-auto rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{sources.length}</span>

              )}

            </button>

          ))}

        </nav>

        <div className="mt-9 px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Collections</div>

        <button onClick={() => setPage("Knowledge Library")} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50">

          <FolderOpen size={17} /> All knowledge

        </button>

        <button onClick={() => setPage("Knowledge Library")} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50">

          <span className="h-2 w-2 rounded-full bg-violet-500" /> Research

        </button>

        <button onClick={() => setPage("Knowledge Library")} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50">

          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Projects

        </button>

        <div className="mt-auto rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-4">

          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm"><Sparkles size={18} /></div>

          <div className="text-sm font-semibold">Knowledge into action</div>

          <p className="mt-1 text-xs leading-5 text-slate-500">Turn what you know into your next great decision.</p>

          <button onClick={() => setPage("Decision Briefs")} className="mt-3 flex items-center gap-1 text-xs font-semibold text-violet-700">Create a brief <ArrowRight size={13} /></button>

        </div>

        <button className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-500 hover:bg-slate-50" onClick={() => notify("Settings will be added in the next stage.")}>

          <Settings size={17} /> Settings

        </button>

      </aside>

      <main className="min-h-screen lg:ml-[248px]">

        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-md sm:px-8">

          <div className="flex items-center gap-3">

            <div className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white"><BrainCircuit size={20} /></div>

            <div>

              <div className="text-sm font-semibold">{page}</div>

              <div className="hidden text-xs text-slate-400 sm:block">Your personal knowledge workspace</div>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">

              <Search size={15} className="text-slate-400" />

              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search knowledge..." className="w-36 bg-transparent text-xs outline-none placeholder:text-slate-400" />

              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400">⌘ K</kbd>

            </div>

            <button onClick={() => setModal("note")} className="flex items-center gap-2 rounded-xl bg-violet-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700">

              <Plus size={16} /><span className="hidden sm:inline">Add knowledge</span>

            </button>

            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-violet-700">N</button>

          </div>

        </header>

        <div className="mx-auto max-w-[1440px] p-5 sm:p-8">

          {page === "Overview" && (

            <div className="space-y-8">

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

                <div>

                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-violet-700"><span className="h-2 w-2 rounded-full bg-violet-500" /> YOUR KNOWLEDGE, CONNECTED</div>

                  <h1 className="text-3xl font-bold tracking-tight sm:text-[34px]">Good morning. <span className="text-slate-400">Let's think clearly.</span></h1>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Bring your scattered notes and research together. Find the signal, explore your options, and make your next decision with confidence.</p>

                </div>

                <button onClick={() => setPage("Ask Nexora")} className="flex items-center justify-center gap-2 self-start rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700 sm:self-auto"><Sparkles size={16} /> Ask Nexora <ArrowUpRight size={15} /></button>

              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {[

                  { label: "Knowledge sources", value: sources.length, note: "Saved in this session", icon: BookOpen, tone: "violet" },

                  { label: "Decision briefs", value: briefs.length, note: "Your decision workspace", icon: Lightbulb, tone: "amber" },

                  { label: "Questions asked", value: messages.filter((m) => m.role === "user").length, note: "In this session", icon: MessageSquare, tone: "blue" },

                  { label: "Evidence coverage", value: "—", note: "Available after AI setup", icon: ShieldCheck, tone: "emerald" },

                ].map((stat) => (

                  <div key={stat.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/30">

                    <div className="flex items-center justify-between">

                      <span className="text-sm text-slate-500">{stat.label}</span>

                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600"><stat.icon size={18} /></span>

                    </div>

                    <div className="mt-4 text-3xl font-bold tracking-tight">{stat.value}</div>

                    <div className="mt-1 text-xs text-slate-400">{stat.note}</div>

                  </div>

                ))}

              </div>

              <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">

                <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">

                  <div className="flex items-center justify-between">

                    <div><h2 className="font-semibold">Recent knowledge</h2><p className="mt-1 text-xs text-slate-400">Your latest saved sources</p></div>

                    <button onClick={() => setPage("Knowledge Library")} className="flex items-center gap-1 text-xs font-semibold text-violet-700">View library <ArrowRight size={14} /></button>

                  </div>

                  <div className="mt-5 space-y-2">

                    {sources.slice(0, 4).map((source) => (

                      <button key={source.id} onClick={() => setSelectedSource(source)} className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-slate-50">

                        <SourceIcon type={source.type} />

                        <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{source.title}</div><div className="mt-1 truncate text-xs text-slate-400">{source.detail}</div></div>

                        <MoreHorizontal size={18} className="text-slate-400" />

                      </button>

                    ))}

                    {sources.length === 0 && <EmptyState text="Your library is empty. Add your first note to get started." action="Add a note" onClick={() => setModal("note")} />}

                  </div>

                </section>

                <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">

                  <div className="flex items-center justify-between"><div><h2 className="font-semibold">Decision briefs</h2><p className="mt-1 text-xs text-slate-400">From thinking to action</p></div><button onClick={() => setPage("Decision Briefs")} className="text-xs font-semibold text-violet-700">View all</button></div>

                  <div className="mt-5 space-y-3">

                    {briefs.slice(0, 3).map((brief) => (

                      <button key={brief.id} onClick={() => { setPage("Decision Briefs"); }} className="w-full rounded-xl border border-slate-100 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50/30">

                        <div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold">{brief.title}</span><ArrowUpRight size={15} className="shrink-0 text-slate-400" /></div>

                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{brief.description}</p>

                        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400"><Clock3 size={12} /> {brief.date}<span className="ml-auto rounded-md bg-amber-50 px-2 py-1 text-amber-700">{brief.status}</span></div>

                      </button>

                    ))}

                    {briefs.length === 0 && <EmptyState text="No decision briefs yet." action="Create a brief" onClick={() => setModal("brief")} />}

                  </div>

                  <button onClick={() => setModal("brief")} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 hover:border-violet-300 hover:text-violet-700"><Plus size={16} /> New decision brief</button>

                </section>

              </div>

              <section className="overflow-hidden rounded-2xl bg-[#17162b] text-white">

                <div className="grid gap-8 p-6 sm:p-9 md:grid-cols-[1.3fr_1fr] md:items-center">

                  <div><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-violet-200"><Sparkles size={13} /> THE NEXORA WORKFLOW</div><h2 className="max-w-md text-2xl font-semibold leading-tight sm:text-3xl">Information is everywhere. <span className="text-violet-300">Clarity is a choice.</span></h2><p className="mt-3 max-w-lg text-sm leading-6 text-slate-300">Collect your sources, ask better questions, and turn what you discover into a decision you can explain.</p></div>

                  <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">

                    {[["01", "Collect", "Save knowledge in one place"], ["02", "Understand", "Ask questions across sources"], ["03", "Decide", "Build evidence-backed briefs"]].map(([n, title, desc]) => <div key={n} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"><div className="text-xs font-bold text-violet-300">{n}</div><div><div className="text-sm font-medium">{title}</div><div className="mt-0.5 text-xs text-slate-400">{desc}</div></div></div>)}

                  </div>

                </div>

              </section>

            </div>

          )}

          {page === "Knowledge Library" && (

            <div className="space-y-6">

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="text-3xl font-bold tracking-tight">Knowledge library</h1><p className="mt-2 text-sm text-slate-500">Your notes, research, and reference material in one place.</p></div><div className="flex flex-wrap gap-2"><button onClick={() => setModal("url")} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium hover:bg-slate-50"><Globe size={16} /> Add URL</button><button onClick={() => setModal("note")} className="flex items-center gap-2 rounded-xl bg-violet-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"><Plus size={16} /> New note</button></div></div>

              <div className="flex flex-col gap-3 sm:flex-row"><div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3"><Search size={17} className="text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search titles and details..." className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" /></div><div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-500"><BookOpen size={16} /> {filteredSources.length} sources <ChevronDown size={14} /></div></div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

                <div className="hidden grid-cols-[minmax(0,1fr)_130px_140px_45px] gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 sm:grid"><span>Name</span><span>Type</span><span>Added</span><span /></div>

              
{sourcesLoading ? (
  <div className="p-10 text-center text-sm text-slate-400">
    Loading sources...
  </div>
) : filteredSources.length === 0 ? (
  <div className="p-10">
    <EmptyState
      text="No sources match your search."
      action="Add a note"
      onClick={() => setModal("note")}
    />
  </div>
) : (
  filteredSources.map((source) => (
    <div
      key={source.id}
      className="grid gap-3 border-b border-slate-100 px-4 py-4 last:border-0 hover:bg-slate-50/50 sm:grid-cols-[minmax(0,1fr)_130px_140px_45px] sm:items-center sm:gap-4 sm:px-5"
    >
      <button
        type="button"
        onClick={() => setSelectedSource(source)}
        className="flex min-w-0 items-center gap-3 text-left"
      >
        <SourceIcon type={source.type} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">
            {source.title}
          </span>
          <span className="mt-1 block truncate text-xs text-slate-400">
            {source.detail}
          </span>
        </span>
      </button>
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs text-slate-600">
          {source.type === "Note" ? (
            <FileText size={13} />
          ) : source.type === "Website" ? (
            <Globe size={13} />
          ) : (
            <BookOpen size={13} />
          )}
          {source.type}
        </span>
      </div>
      <div className="text-xs text-slate-400">{source.detail}</div>
      <button
        type="button"
        title="Delete source"
        onClick={() => deleteSource(source.id)}
        className="text-slate-400 transition hover:text-red-600"
      >
        <Trash2 size={16} />
      </button>
    </div>
  ))
)}




            

               
              


              </div>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-7 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><Upload size={21} /></div><h3 className="mt-3 font-semibold">Have a document to add?</h3><p className="mt-1 text-sm text-slate-500">Document upload and text extraction will be connected in the backend stage.</p><button onClick={() => notify("File upload will be enabled when document processing is implemented.")} className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"><FileUp size={15} className="mr-2 inline" />Upload a document</button></div>

            </div>

          )}

          {page === "Ask Nexora" && (

            <div className="mx-auto max-w-4xl">

              <div className="mb-7 text-center"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700"><Sparkles size={26} /></div><h1 className="text-3xl font-bold tracking-tight">Ask Nexora</h1><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Ask questions about your knowledge and turn research into clear, actionable answers.</p></div>

              <div className="mb-5 flex flex-wrap justify-center gap-2">{["Summarize my research", "Compare my options", "What am I missing?"].map((s) => <button key={s} onClick={() => setQuestion(s)} className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 transition hover:border-violet-300 hover:text-violet-700">{s}</button>)}</div>

              <div className="min-h-[360px] rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">

                {messages.length === 0 ? <div className="flex min-h-[310px] flex-col items-center justify-center text-center"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-500"><MessageSquare size={21} /></div><h2 className="mt-4 font-semibold">What would you like to understand?</h2><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Ask a question to start. Nexora's live evidence retrieval and AI answers will be enabled when the backend is connected.</p><div className="mt-4 flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs text-amber-700"><Activity size={13} /> Demo mode · No AI provider connected</div></div> : <div className="space-y-6">{messages.map((m, i) => <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>{m.role === "assistant" && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700"><BrainCircuit size={17} /></div>}<div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${m.role === "user" ? "bg-violet-600 text-white" : "border border-slate-100 bg-slate-50 text-slate-700"}`}><div className="mb-1 text-[10px] font-bold uppercase tracking-wider opacity-60">{m.role === "user" ? "You" : "Nexora · Demo"}</div>{m.text}</div></div>)}</div>}

                <form onSubmit={(e) => { e.preventDefault(); askQuestion(); }} className="mt-5 flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100"><textarea value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); askQuestion(); } }} rows={2} placeholder="Ask a question about your knowledge..." className="max-h-36 min-h-[52px] flex-1 resize-y bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400" /><button type="submit" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-700"><Send size={17} /></button></form>

                <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-400"><ShieldCheck size={13} />Answers are generated through Nexora's AI backend. Evidence citations depend on available sources frontend demo.</div>

              </div>

            </div>

          )}

          {page === "Decision Briefs" && (

            <div className="space-y-6">

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="text-3xl font-bold tracking-tight">Decision briefs</h1><p className="mt-2 text-sm text-slate-500">Turn complex questions into structured, evidence-led decisions.</p></div><button onClick={() => setModal("brief")} className="flex items-center justify-center gap-2 self-start rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700"><Plus size={16} /> Create brief</button></div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{briefs.map((brief) => <article key={brief.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/20 transition hover:border-violet-200"><div className="flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><Lightbulb size={20} /></div><button onClick={() => { setBriefs((old) => old.filter((b) => b.id !== brief.id)); notify("Brief deleted."); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button></div><h2 className="mt-5 font-semibold leading-6">{brief.title}</h2><p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{brief.description}</p><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><span className={`rounded-md px-2 py-1 text-[11px] font-medium ${brief.status === "Ready" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{brief.status}</span><span className="text-xs text-slate-400">{brief.date}</span></div><button onClick={() => exportBrief(brief)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-medium hover:bg-slate-50"><ArrowDownRight size={15} /> Export Markdown</button></article>)}<button onClick={() => setModal("brief")} className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center transition hover:border-violet-300 hover:bg-violet-50/30"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><Plus size={21} /></div><div className="mt-3 text-sm font-semibold">Start a new decision</div><div className="mt-1 text-xs text-slate-400">Define the question you need to answer.</div></button></div>

              <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-5 sm:p-6"><div className="flex gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600"><ShieldCheck size={19} /></div><div><h3 className="font-semibold">Evidence before recommendations</h3><p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">A reliable brief should distinguish source-backed findings from assumptions, expose risks, compare realistic alternatives, and make its recommendation traceable. Live evidence-based generation will be added with the AI backend.</p></div></div></div>

            </div>

          )}

        </div>

      </main>

      {modal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(null); }}>

          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-7">

            <div className="flex items-start justify-between"><div><h2 className="text-xl font-bold">{modal === "note" ? "Add a note" : modal === "url" ? "Save a website" : "Create decision brief"}</h2><p className="mt-1 text-sm text-slate-500">{modal === "note" ? "Capture something worth remembering." : modal === "url" ? "Save a link for your knowledge library." : "Define the decision you want to explore."}</p></div><button onClick={() => setModal(null)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"><X size={18} /></button></div>

            <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); if (modal === "note") addNote(); else if (modal === "url") addUrl(); else addBrief(); }}>

              <div><label className="mb-1.5 block text-xs font-semibold text-slate-600">Title</label><input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder={modal === "url" ? "e.g. Useful research article" : modal === "brief" ? "e.g. Which option should I choose?" : "Give your note a title"} className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" /></div>

              <div><label className="mb-1.5 block text-xs font-semibold text-slate-600">{modal === "url" ? "Website URL" : modal === "brief" ? "Context (optional)" : "Content"}</label><textarea value={content} onChange={(e) => setContent(e.target.value)} rows={modal === "url" ? 2 : 5} placeholder={modal === "url" ? "https://example.com/article" : modal === "brief" ? "What do you know so far? What are the constraints?" : "Write your thoughts, research, or key information..."} className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 text-sm leading-6 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" /></div>

              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setModal(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50">Cancel</button><button type="submit" className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">{modal === "note" ? "Save note" : modal === "url" ? "Save link" : "Create brief"}</button></div>

            </form>

          </div>

        </div>

      )}


      {selectedSource && (
  <div
    className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4"
    onMouseDown={(e) => {
      if (e.target === e.currentTarget) setSelectedSource(null);
    }}
  >
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Source details</h2>
        <button onClick={() => setSelectedSource(null)}>
          <X size={19} />
        </button>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <SourceIcon type={selectedSource.type} />
        <div className="min-w-0">
          <div className="font-semibold">{selectedSource.title}</div>
          <div className="mt-1 text-xs text-slate-400">
            {selectedSource.type} · {selectedSource.detail}
          </div>
        </div>
      </div>

      <div className="mt-5 max-h-64 overflow-y-auto whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
        {selectedSource.content ||
          selectedSource.url ||
          "No content is available for this source yet."}
      </div>

      <button
        onClick={() => setSelectedSource(null)}
        className="mt-5 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white"
      >
        Close
      </button>
    </div>
  </div>
)}




      {notice && <div role="status" className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl"><Check size={16} className="text-emerald-400" />{notice}</div>}

      <div className="fixed bottom-0 left-0 z-10 flex items-center gap-2 border-t border-slate-200 bg-white/95 px-4 py-2 text-[10px] text-slate-400 backdrop-blur lg:left-[248px]"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Frontend prototype · Local session data · AI backend not connected</div>

    </div>

  );

}

function SourceIcon({ type }: { type: Source["type"] }) {

  const cls = "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl";

  if (type === "Website") return <div className={`${cls} bg-emerald-50 text-emerald-700`}><Globe size={18} /></div>;

  if (type === "Document") return <div className={`${cls} bg-blue-50 text-blue-700`}><FileText size={18} /></div>;

  return <div className={`${cls} bg-violet-50 text-violet-700`}><BookOpen size={18} /></div>;

}

function EmptyState({ text, action, onClick }: { text: string; action: string; onClick: () => void }) {

  return <div className="py-6 text-center"><div className="text-sm text-slate-500">{text}</div><button onClick={onClick} className="mt-3 text-xs font-semibold text-violet-700 hover:text-violet-900">{action} <ArrowRight size={13} className="ml-1 inline" /></button></div>;
}

export default App;
