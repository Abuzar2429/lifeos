"use client";

import { useState, useTransition } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Heading1 as Heading1Icon,
  Heading2 as Heading2Icon,
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
  Quote as QuoteIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Save as SaveIcon,
  BookOpen,
  Sparkles,
  Calendar,
} from "lucide-react";

interface JournalEntryData {
  id?: string;
  title: string;
  content: string;
  moodTag: string | null;
  tags: { name: string }[] | string[];
}

interface JournalEditorProps {
  entry: JournalEntryData | null;
  onSave: (data: { title: string; content: string; moodTag: string | null; tags: string[] }) => Promise<void>;
  isNew: boolean;
}

const moodOptions = [
  { emoji: "😄", label: "Happy", tag: "Happy" },
  { emoji: "😌", label: "Calm", tag: "Calm" },
  { emoji: "😴", label: "Tired", tag: "Tired" },
  { emoji: "😰", label: "Anxious", tag: "Anxious" },
  { emoji: "🚀", label: "Motivated", tag: "Motivated" },
];

export function JournalEditor({ entry, onSave, isNew }: JournalEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(entry?.title ?? "");
  const [moodTag, setMoodTag] = useState<string | null>(entry?.moodTag ?? null);

  // Initialize tags input from entry prop on mount
  const initialTagsStr = entry?.tags && Array.isArray(entry.tags)
    ? entry.tags
        .map((t) => (typeof t === "string" ? t : t.name))
        .map((n) => (n.startsWith("#") ? n : `#${n}`))
        .join(" ")
    : "";
  const [tagsInput, setTagsInput] = useState(initialTagsStr);

  const editor = useEditor({
    extensions: [StarterKit],
    content: entry?.content ?? "",
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[300px] max-h-[500px] overflow-y-auto px-4 py-3 text-sm leading-relaxed",
      },
    },
  });

  if (!editor) return null;

  // Calculators
  const charCount = editor.getText().length;
  const wordCount = editor.getText().trim() ? editor.getText().trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleSave = () => {
    if (!title.trim()) return;

    // Parse tags input (split by spaces or commas, clean up # prefix)
    const rawTags = tagsInput.split(/[\s,]+/);
    const parsedTags = rawTags
      .map((t) => t.trim().replace("#", ""))
      .filter((t) => t !== "");

    startTransition(async () => {
      await onSave({
        title: title.trim(),
        content: editor.getHTML(),
        moodTag,
        tags: parsedTags,
      });
    });
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl overflow-hidden shadow-xl shadow-black/40">
      {/* Editor Styles Injection */}
      <style>{`
        .ProseMirror h1 { font-size: 1.5rem; font-weight: 800; margin-top: 1rem; margin-bottom: 0.5rem; color: white; }
        .ProseMirror h2 { font-size: 1.25rem; font-weight: 700; margin-top: 0.8rem; margin-bottom: 0.4rem; color: white; }
        .ProseMirror p { margin-bottom: 0.75rem; font-size: 0.875rem; line-height: 1.6; color: #d4d4d8; }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.25rem; margin-bottom: 0.75rem; color: #d4d4d8; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.25rem; margin-bottom: 0.75rem; color: #d4d4d8; }
        .ProseMirror blockquote { border-left: 3px solid #6366f1; padding-left: 0.75rem; color: #a1a1aa; font-style: italic; margin-bottom: 0.75rem; }
        .ProseMirror code { background-color: #18181b; padding: 0.1rem 0.3rem; rounded: 4px; font-family: monospace; font-size: 0.85em; color: #fda4af; }
        .ProseMirror pre { background-color: #18181b; padding: 0.75rem; rounded: 8px; font-family: monospace; margin-bottom: 0.75rem; overflow-x: auto; }
        .ProseMirror pre code { background: none; padding: 0; color: #e2e8f0; }
      `}</style>

      {/* Editor Title Banner */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/40">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4.5 w-4.5 text-indigo-400" />
          <h2 className="text-sm font-bold text-white">
            {isNew ? "New Journal Entry" : "Edit Reflections"}
          </h2>
        </div>

        {/* Word Counts */}
        <div className="flex items-center gap-3.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-zinc-600" />
            {readTime} min read
          </span>
          <span>•</span>
          <span>{charCount} characters</span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col space-y-4 overflow-y-auto">
        {/* Title Input */}
        <input
          type="text"
          placeholder="Title your entry..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent text-xl font-extrabold text-white border-b border-zinc-800/80 pb-2 focus:outline-none focus:border-indigo-500 placeholder:text-zinc-650"
        />

        {/* Mood Selector Row */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
            How are you feeling?
          </label>
          <div className="flex flex-wrap gap-2">
            {moodOptions.map((opt) => {
              const isSelected = moodTag === opt.tag;
              return (
                <button
                  key={opt.tag}
                  type="button"
                  onClick={() => setMoodTag(isSelected ? null : opt.tag)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? "bg-indigo-600/15 border-indigo-500 text-indigo-300 scale-105"
                      : "bg-zinc-950/30 border-zinc-850/80 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <span>{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rich-Text Toolbar */}
        <div className="flex flex-wrap gap-1 items-center bg-zinc-950/60 border border-zinc-850 p-1.5 rounded-xl">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg border transition-colors ${
              editor.isActive("bold")
                ? "bg-indigo-600/15 border-indigo-500/40 text-indigo-400"
                : "border-transparent text-zinc-450 hover:bg-zinc-900 hover:text-white"
            }`}
            title="Bold"
          >
            <BoldIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg border transition-colors ${
              editor.isActive("italic")
                ? "bg-indigo-600/15 border-indigo-500/40 text-indigo-400"
                : "border-transparent text-zinc-450 hover:bg-zinc-900 hover:text-white"
            }`}
            title="Italic"
          >
            <ItalicIcon className="h-4 w-4" />
          </button>
          <div className="w-px h-5 bg-zinc-800 mx-1" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded-lg border transition-colors ${
              editor.isActive("heading", { level: 1 })
                ? "bg-indigo-600/15 border-indigo-500/40 text-indigo-400"
                : "border-transparent text-zinc-450 hover:bg-zinc-900 hover:text-white"
            }`}
            title="Heading 1"
          >
            <Heading1Icon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-lg border transition-colors ${
              editor.isActive("heading", { level: 2 })
                ? "bg-indigo-600/15 border-indigo-500/40 text-indigo-400"
                : "border-transparent text-zinc-450 hover:bg-zinc-900 hover:text-white"
            }`}
            title="Heading 2"
          >
            <Heading2Icon className="h-4 w-4" />
          </button>
          <div className="w-px h-5 bg-zinc-800 mx-1" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-lg border transition-colors ${
              editor.isActive("bulletList")
                ? "bg-indigo-600/15 border-indigo-500/40 text-indigo-400"
                : "border-transparent text-zinc-450 hover:bg-zinc-900 hover:text-white"
            }`}
            title="Bullet List"
          >
            <ListIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-lg border transition-colors ${
              editor.isActive("orderedList")
                ? "bg-indigo-600/15 border-indigo-500/40 text-indigo-400"
                : "border-transparent text-zinc-450 hover:bg-zinc-900 hover:text-white"
            }`}
            title="Numbered List"
          >
            <ListOrderedIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-lg border transition-colors ${
              editor.isActive("blockquote")
                ? "bg-indigo-600/15 border-indigo-500/40 text-indigo-400"
                : "border-transparent text-zinc-450 hover:bg-zinc-900 hover:text-white"
            }`}
            title="Blockquote"
          >
            <QuoteIcon className="h-4 w-4" />
          </button>
          <div className="w-px h-5 bg-zinc-800 mx-1" />
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            className="p-1.5 rounded-lg border border-transparent text-zinc-450 hover:bg-zinc-900 hover:text-white transition-colors"
            title="Undo"
          >
            <UndoIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            className="p-1.5 rounded-lg border border-transparent text-zinc-450 hover:bg-zinc-900 hover:text-white transition-colors"
            title="Redo"
          >
            <RedoIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Editor Writing Area */}
        <div className="flex-1 rounded-xl bg-zinc-950/60 border border-zinc-850 focus-within:border-indigo-500/50 transition-colors">
          <EditorContent editor={editor} />
        </div>

        {/* Tags Field */}
        <div className="space-y-1.5">
          <label htmlFor="journal-tags" className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
            Add tags (separated by spaces)
          </label>
          <input
            id="journal-tags"
            type="text"
            placeholder="e.g. #gratitude #mindset #learning"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/60 border border-zinc-805 text-xs text-indigo-300 placeholder:text-zinc-650 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>

      {/* Editor Footer Action Row */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-850 bg-zinc-950/20 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span>Estimate analyzer score: </span>
          <span className="font-bold text-indigo-300 font-mono bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-850">
            Auto-scored
          </span>
        </div>

        <button
          onClick={handleSave}
          disabled={isPending || !title.trim()}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:scale-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <SaveIcon className="h-4 w-4" />
          <span>{isPending ? "Saving..." : "Save Entry"}</span>
        </button>
      </div>
    </div>
  );
}
