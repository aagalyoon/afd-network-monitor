
import React from 'react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  title?: string;
  content: string[];
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ title, content, className }) => {
  return (
    <div className={cn('rounded-md border bg-card overflow-hidden', className)}>
      {title && (
        <div className="bg-muted px-4 py-2 border-b font-mono text-sm font-medium">
          {title}
        </div>
      )}
      <pre className="p-4 text-sm font-mono overflow-auto max-h-80">
        {content.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap">
            {line}
          </div>
        ))}
      </pre>
    </div>
  );
};

export default CodeBlock;
