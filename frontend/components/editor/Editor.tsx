"use client";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { EditorContent, JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import lowlight from "@/utils/lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Code,
  Heading1,
  Heading2,
  Type,
} from "lucide-react";

interface EditorProps {
  content: JSONContent | null;
  setContent: React.Dispatch<React.SetStateAction<JSONContent | null>>;
}

const Editor = (props: EditorProps) => {
  const { content, setContent } = props;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2] } }),
      Underline,
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({
        placeholder: "Write your article... Press Enter for new section",
      }),
    ],
    content: content ?? "",
    onUpdate: ({ editor }) => {
      setContent(editor.getJSON());
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-zinc max-w-none min-h-[450px] focus:outline-none p-8 text-lg font-medium",
      },
    },
  });

  if (!editor) return null;

  // Helper for consistent button styling
  const ToolbarBtn = ({ onClick, active, children }: any) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`p-2.5 transition-all border border-transparent ${
        active
          ? "bg-black text-white shadow-[2px_2px_0px_0px_rgba(59,130,246,1)]"
          : "text-gray-400 hover:text-black hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="border-2 border-black bg-white group transition-all">
      {/* Editorial Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b-2 border-black bg-[#fcfcfc] sticky top-0 z-10">
        <ToolbarBtn
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive("paragraph")}
        >
          <Type size={18} />
        </ToolbarBtn>
        <div className="w-[1px] h-6 bg-gray-200 mx-1" />
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
        >
          <Heading1 size={18} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 size={18} />
        </ToolbarBtn>
        <div className="w-[1px] h-6 bg-gray-200 mx-1" />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          <Bold size={18} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          <Italic size={18} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
        >
          <UnderlineIcon size={18} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
        >
          <Code size={18} />
        </ToolbarBtn>
      </div>

      <EditorContent editor={editor} />

      <div className="h-1 w-0 bg-blue-600 group-focus-within:w-full transition-all duration-700" />
    </div>
  );
};

export default Editor;
