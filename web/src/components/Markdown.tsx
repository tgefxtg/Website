import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
export function Markdown({ text }: { text: string }) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: (props) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
          pre: (props) => <pre tabIndex={0} {...props} />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
