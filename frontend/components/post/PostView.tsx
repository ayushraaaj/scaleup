import { EditorContent, JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import lowlight from "@/utils/lowlight";

interface PostViewProps {
  content: JSONContent;
}

const PostView = (props: PostViewProps) => {
  const { content } = props;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2] } }),
      Underline,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content,
    editable: false,
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="prose">
      <EditorContent editor={editor} />
    </div>
  );
};

export default PostView;
