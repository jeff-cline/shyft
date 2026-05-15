import React from "react";

interface ShyftProps {
  children: React.ReactNode;
  className?: string;
}

function transformString(s: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let buffer = "";
  let key = 0;
  for (const char of s) {
    if (char === "y" || char === "Y") {
      if (buffer) {
        parts.push(buffer);
        buffer = "";
      }
      parts.push(
        <span key={key++} className="brand-y">
          Y
        </span>
      );
    } else {
      buffer += char;
    }
  }
  if (buffer) parts.push(buffer);
  return parts;
}

function transform(node: React.ReactNode): React.ReactNode {
  if (typeof node === "string") {
    return <>{transformString(node)}</>;
  }
  if (typeof node === "number" || typeof node === "boolean" || node == null) {
    return node;
  }
  if (Array.isArray(node)) {
    return node.map((child, i) => (
      <React.Fragment key={i}>{transform(child)}</React.Fragment>
    ));
  }
  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: React.ReactNode }>;
    return React.cloneElement(
      element,
      element.props,
      transform(element.props.children)
    );
  }
  return node;
}

export function Shyft({ children, className }: ShyftProps) {
  return <span className={className}>{transform(children)}</span>;
}
