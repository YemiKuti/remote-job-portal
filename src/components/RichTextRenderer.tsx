
import React from "react";
import { processMarkdown, sanitizeHtml } from "@/utils/markdownProcessor";

export const RichTextRenderer: React.FC<{ content: string }> = ({ content }) => {
  const processedHtml = processMarkdown(content || "");
  const sanitizedHtml = sanitizeHtml(processedHtml);

  return (
    <div
      className="prose max-w-none text-gray-700"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default RichTextRenderer;
