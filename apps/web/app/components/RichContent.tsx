import type { ReactNode } from "react";

type RichContentProps = {
  body: string;
};

export function RichContent({ body }: RichContentProps) {
  const blocks = body
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="contentBody">
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}

function renderBlock(block: string, index: number) {
  const heading = block.match(/^(#{2,3})\s+(.+)$/);

  if (heading) {
    const level = heading[1].length;
    const text = heading[2];

    return level === 2 ? (
      <h2 key={index}>{renderInline(text)}</h2>
    ) : (
      <h3 key={index}>{renderInline(text)}</h3>
    );
  }

  const image = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);

  if (image && isSafeImageUrl(image[2])) {
    const altText = image[1].trim();

    return (
      <figure className="contentBodyImage" key={index}>
        <img alt={altText} src={image[2].trim()} />
      </figure>
    );
  }

  const lines = block.split("\n").map((line) => line.trim());

  if (lines.every((line) => /^[-*]\s+/.test(line))) {
    return (
      <ul key={index}>
        {lines.map((line, lineIndex) => (
          <li key={lineIndex}>{renderInline(line.replace(/^[-*]\s+/, ""))}</li>
        ))}
      </ul>
    );
  }

  if (lines.every((line) => /^\d+\.\s+/.test(line))) {
    return (
      <ol key={index}>
        {lines.map((line, lineIndex) => (
          <li key={lineIndex}>{renderInline(line.replace(/^\d+\.\s+/, ""))}</li>
        ))}
      </ol>
    );
  }

  if (lines.every((line) => /^>\s?/.test(line))) {
    return (
      <blockquote key={index}>
        {renderInline(lines.map((line) => line.replace(/^>\s?/, "")).join(" "))}
      </blockquote>
    );
  }

  return <p key={index}>{renderInline(lines.join(" "))}</p>;
}

function renderInline(text: string) {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let cursor = 0;

  for (const match of text.matchAll(pattern)) {
    if (match.index === undefined) {
      continue;
    }

    if (match.index > cursor) {
      nodes.push(text.slice(cursor, match.index));
    }

    const token = match[0];
    const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);

    if (link && isSafeLinkUrl(link[2])) {
      const href = link[2].trim();
      const isExternal = /^https?:\/\//i.test(href);
      nodes.push(
        <a
          href={href}
          key={`${match.index}-${href}`}
          rel={isExternal ? "noreferrer" : undefined}
          target={isExternal ? "_blank" : undefined}
        >
          {link[1]}
        </a>,
      );
    } else if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(<strong key={match.index}>{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(token);
    }

    cursor = match.index + token.length;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
}

function isSafeImageUrl(value: string) {
  const url = value.trim();
  return url.startsWith("/") || /^https?:\/\//i.test(url);
}

function isSafeLinkUrl(value: string) {
  const url = value.trim();
  return (
    url.startsWith("/") ||
    url.startsWith("#") ||
    /^https?:\/\//i.test(url) ||
    /^mailto:/i.test(url)
  );
}
