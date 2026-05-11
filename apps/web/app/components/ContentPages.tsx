import {
  contentTypeConfigs,
  type ContentItem,
  type ContentType,
} from "@sleb/shared/content";
import { getContentHref } from "../data/content";
import { RichContent } from "./RichContent";

type ContentCollectionPageProps = {
  eyebrow: string;
  title: string;
  summary: string;
  items: ContentItem[];
};

type ContentArticlePageProps = {
  item: ContentItem;
  backHref: string;
  backLabel: string;
};

export function ContentCollectionPage({
  eyebrow,
  title,
  summary,
  items,
}: ContentCollectionPageProps) {
  return (
    <section className="contentPublic">
      <div className="contentPublicHeader">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{summary}</p>
      </div>

      {items.length > 0 ? (
        <div className="contentCardGrid">
          {items.map((item) => (
            <article className="contentPublicCard" key={item.id}>
              <div>
                <span>{getTypeLabel(item.type)}</span>
                <time dateTime={item.publishedAt ?? item.updatedAt}>
                  {formatDate(item.publishedAt ?? item.updatedAt)}
                </time>
              </div>
              <h2>
                <a href={getContentHref(item)}>{item.title}</a>
              </h2>
              <p>{item.summary}</p>
              <a className="contentReadLink" href={getContentHref(item)}>
                Read more
              </a>
            </article>
          ))}
        </div>
      ) : (
        <p className="contentEmpty">No published content yet.</p>
      )}
    </section>
  );
}

export function ContentArticlePage({
  item,
  backHref,
  backLabel,
}: ContentArticlePageProps) {
  return (
    <article className="contentArticle">
      <a className="contentBackLink" href={backHref}>
        {backLabel}
      </a>
      <header>
        <p className="eyebrow">{getTypeLabel(item.type)}</p>
        <h1>{item.title}</h1>
        <p>{item.summary}</p>
        <div className="contentArticleMeta">
          <span>{item.authorName}</span>
          <time dateTime={item.publishedAt ?? item.updatedAt}>
            {formatDate(item.publishedAt ?? item.updatedAt)}
          </time>
        </div>
      </header>
      {item.heroImage ? (
        <img alt="" className="contentHeroImage" src={item.heroImage} />
      ) : null}
      <RichContent body={item.body} />
      {Object.keys(item.metadata).length > 0 ? (
        <dl className="contentMetadata">
          {Object.entries(item.metadata).map(([key, value]) => (
            <div key={key}>
              <dt>{formatMetadataKey(key)}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </article>
  );
}

function getTypeLabel(type: ContentType) {
  return (
    contentTypeConfigs.find((config) => config.type === type)?.label ?? type
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-SG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatMetadataKey(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}
