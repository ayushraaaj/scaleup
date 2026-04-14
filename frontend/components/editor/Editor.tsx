"use client";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { EditorContent, JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import lowlight from "@/utils/lowlight";
import Placeholder from "@tiptap/extension-placeholder";

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
        placeholder: "Write your post... Press Enter for new section",
      }),
    ],
    content: content ?? "",
    onUpdate: ({ editor }) => {
      setContent(editor.getJSON());
    },
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  return (
    <div>
      <div>
        <button onClick={() => editor.chain().focus().setParagraph().run()}>
          P
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          H1
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </button>

        <button onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </button>

        <button onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italics
        </button>

        <button onClick={() => editor.chain().focus().toggleUnderline().run()}>
          Underline
        </button>

        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          {"</>"}
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};

export default Editor;
