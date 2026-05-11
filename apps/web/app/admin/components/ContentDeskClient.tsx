"use client";

import {
  contentStatusLabels,
  contentTypeConfigs,
  seedTechnologyListings,
  type AiSuggestion,
  type AiSuggestionKind,
  type ContentItem,
  type ContentStatus,
  type ContentType,
  type MediaAsset,
} from "@sleb/shared/content";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type ContentListResponse = {
  items: ContentItem[];
  counts: Record<ContentStatus, number>;
};

type ContentDetailResponse = {
  item: ContentItem;
};

type MediaListResponse = {
  assets: MediaAsset[];
};

type AuthMeResponse = {
  user: AuthUser;
};

type AuthUser = {
  email: string;
  name: string;
  role: "content_author" | "content_publisher" | "platform_admin";
};

type ContentFormState = {
  id?: string;
  type: ContentType;
  title: string;
  slug: string;
  summary: string;
  body: string;
  status: ContentStatus;
  heroImage: string;
  metadata: Record<string, string>;
  seoTitle: string;
  seoDescription: string;
};

const blankForm: ContentFormState = {
  type: "news",
  title: "",
  slug: "",
  summary: "",
  body: "",
  status: "draft",
  heroImage: "",
  metadata: {},
  seoTitle: "",
  seoDescription: "",
};

const aiKinds: Array<{ value: AiSuggestionKind; label: string }> = [
  { value: "expand", label: "Expand draft" },
  { value: "summarize", label: "Summarize" },
  { value: "seo", label: "SEO copy" },
  { value: "alt_text", label: "Image alt text" },
  { value: "image_prompt", label: "Image prompt" },
];

const contentPublicPaths: Partial<Record<ContentType, string>> = {
  event: "/events",
  news: "/news",
  grant: "/grants-and-incentives",
  incentive: "/grants-and-incentives",
  publication: "/publications",
};

export function ContentDeskClient() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [counts, setCounts] =
    useState<Record<ContentStatus, number>>(emptyCounts());
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [form, setForm] = useState<ContentFormState>(blankForm);
  const [typeFilter, setTypeFilter] = useState<ContentType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("Checking your admin session.");
  const [isBusy, setIsBusy] = useState(false);
  const [aiKind, setAiKind] = useState<AiSuggestionKind>("expand");
  const [aiInput, setAiInput] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | undefined>();
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<AuthUser | undefined>();
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedConfig = contentTypeConfigs.find(
    (config) => config.type === form.type,
  );
  const canPublishContent = Boolean(user && user.role !== "content_author");

  useEffect(() => {
    void bootstrap();
  }, []);

  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    return items
      .filter((item) => typeFilter === "all" || item.type === typeFilter)
      .filter((item) => statusFilter === "all" || item.status === statusFilter)
      .filter((item) => {
        if (!term) {
          return true;
        }

        return [item.title, item.summary, item.slug, item.type]
          .join(" ")
          .toLowerCase()
          .includes(term);
      });
  }, [items, search, statusFilter, typeFilter]);

  async function bootstrap() {
    setNotice("Checking your admin session.");

    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
        credentials: "include",
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (!response.ok) {
        throw new Error(`Session check failed with ${response.status}`);
      }

      const data = (await response.json()) as AuthMeResponse;
      setUser(data.user);
      setAuthChecked(true);
      setNotice(`Signed in as ${data.user.name}.`);
      await Promise.all([loadItems(), loadMedia()]);
    } catch (error) {
      setAuthChecked(true);
      setNotice(
        error instanceof Error
          ? error.message
          : "Unable to check your admin session.",
      );
    }
  }

  async function loadItems(preferredId = selectedId) {
    try {
      const response = await fetch("/api/content/items", {
        cache: "no-store",
        credentials: "include",
        headers: contentHeaders(),
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (!response.ok) {
        throw new Error(`Content API returned ${response.status}`);
      }

      const data = (await response.json()) as ContentListResponse;
      setItems(data.items);
      setCounts({ ...emptyCounts(), ...data.counts });
      const nextSelected =
        data.items.find((item) => item.id === preferredId) ?? data.items[0];

      if (nextSelected) {
        setSelectedId(nextSelected.id);
        setForm(toForm(nextSelected));
      } else {
        setSelectedId(undefined);
        setForm(blankForm);
      }

      setNotice("Content Desk is connected to the publishing database.");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Content API unavailable.",
      );
      setItems([]);
      setCounts(emptyCounts());
    }
  }

  async function loadMedia() {
    try {
      const response = await fetch("/api/content/media", {
        cache: "no-store",
        credentials: "include",
        headers: contentHeaders(),
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (!response.ok) {
        throw new Error(`Media API returned ${response.status}`);
      }

      const data = (await response.json()) as MediaListResponse;
      setMediaAssets(data.assets);
    } catch {
      setMediaAssets([]);
    }
  }

  function selectItem(item: ContentItem) {
    setSelectedId(item.id);
    setForm(toForm(item));
    setAiInput(item.body || item.summary);
    setAiSuggestion(undefined);
  }

  function startNew(type: ContentType = "news") {
    const config = contentTypeConfigs.find((item) => item.type === type);
    setSelectedId(undefined);
    setForm({
      ...blankForm,
      type,
      metadata: Object.fromEntries(
        (config?.fields ?? []).map((field) => [field.key, ""]),
      ),
    });
    setAiInput("");
    setAiSuggestion(undefined);
  }

  async function saveContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);

    try {
      const item = await saveCurrentContent();

      if (!item) {
        return;
      }

      await loadItems(item.id);
      setNotice(buildSavedNotice(item));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setIsBusy(false);
    }
  }

  async function saveAndPublish() {
    if (!canPublishContent) {
      setNotice("Content Publisher permission is required to publish content.");
      return;
    }

    setIsBusy(true);

    try {
      const saved = await saveCurrentContent();

      if (!saved) {
        return;
      }

      const published =
        saved.status === "published" ? saved : await publishContent(saved.id);

      if (!published) {
        return;
      }

      setSelectedId(published.id);
      setForm(toForm(published));
      await loadItems(published.id);
      setNotice(buildPublishedNotice(published));
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Save and publish failed.",
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function changeWorkflow(action: "submit" | "publish" | "unpublish") {
    if (!form.id) {
      setNotice("Save the draft before changing workflow state.");
      return;
    }

    setIsBusy(true);

    try {
      const response = await fetch(`/api/content/items/${form.id}/${action}`, {
        method: "POST",
        credentials: "include",
        headers: contentHeaders(true),
        body: "{}",
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (!response.ok) {
        throw new Error(`${action} failed with ${response.status}`);
      }

      const data = (await response.json()) as ContentDetailResponse;
      setForm(toForm(data.item));
      await loadItems(data.item.id);
      setNotice(buildWorkflowNotice(action, data.item));
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Workflow action failed.",
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function requestAiSuggestion() {
    const input = aiInput.trim() || form.body || form.summary || form.title;

    if (!input.trim()) {
      setNotice("Add draft text before requesting an AI suggestion.");
      return;
    }

    setIsBusy(true);

    try {
      const response = await fetch("/api/content/ai/suggestions", {
        method: "POST",
        credentials: "include",
        headers: contentHeaders(true),
        body: JSON.stringify({
          itemId: form.id,
          kind: aiKind,
          input,
        }),
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (!response.ok) {
        throw new Error(`AI suggestion failed with ${response.status}`);
      }

      const data = (await response.json()) as { suggestion: AiSuggestion };
      setAiSuggestion(data.suggestion);
      setNotice("AI assist draft generated for editorial review.");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "AI suggestion failed.",
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function uploadHeroImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setNotice("Choose an image file for the media library.");
      return;
    }

    setIsBusy(true);

    try {
      const data = await readFileAsDataUrl(file);
      const response = await fetch("/api/content/media", {
        method: "POST",
        credentials: "include",
        headers: contentHeaders(true),
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          data,
          altText: form.title || file.name,
        }),
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (!response.ok) {
        throw new Error(`Media upload failed with ${response.status}`);
      }

      const payload = (await response.json()) as { asset: MediaAsset };
      setForm((current) => ({ ...current, heroImage: payload.asset.url }));
      setMediaAssets((current) => [payload.asset, ...current]);
      setNotice(
        `Uploaded "${payload.asset.filename}" and set it as hero image.`,
      );
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Media upload failed.",
      );
    } finally {
      setIsBusy(false);
    }
  }

  function useHeroImage(asset: MediaAsset) {
    setForm((current) => ({ ...current, heroImage: asset.url }));
    setNotice(`Selected "${asset.filename}" as hero image.`);
  }

  function clearHeroImage() {
    setForm((current) => ({ ...current, heroImage: "" }));
    setNotice("Hero image cleared.");
  }

  function insertBodyBlock(markup: string, fallback = "Text") {
    const textarea = bodyTextareaRef.current;
    const start = textarea?.selectionStart ?? form.body.length;
    const end = textarea?.selectionEnd ?? start;
    const before = form.body.slice(0, start);
    const selected = form.body.slice(start, end);
    const after = form.body.slice(end);
    const block = markup.includes("$selection")
      ? markup.replace("$selection", selected || fallback)
      : markup;
    const prefix = before && !before.endsWith("\n\n") ? "\n\n" : "";
    const suffix = after && !after.startsWith("\n\n") ? "\n\n" : "";
    const nextBody = `${before}${prefix}${block}${suffix}${after}`;
    const nextCursor = before.length + prefix.length + block.length;

    setForm((current) => ({ ...current, body: nextBody }));
    window.requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function insertBodyImage(asset: MediaAsset) {
    insertBodyBlock(`![${asset.altText || asset.filename}](${asset.url})`);
    setNotice(`Inserted "${asset.filename}" into the body.`);
  }

  function contentHeaders(withJson = false) {
    const headers: Record<string, string> = {};

    if (withJson) {
      headers["content-type"] = "application/json";
    }

    return headers;
  }

  async function saveCurrentContent() {
    const response = await fetch(
      form.id ? `/api/content/items/${form.id}` : "/api/content/items",
      {
        method: form.id ? "PATCH" : "POST",
        credentials: "include",
        headers: contentHeaders(true),
        body: JSON.stringify(buildContentPayload(form)),
      },
    );

    if (response.status === 401) {
      redirectToLogin();
      return undefined;
    }

    if (!response.ok) {
      throw new Error(`Save failed with ${response.status}`);
    }

    const data = (await response.json()) as ContentDetailResponse;
    setSelectedId(data.item.id);
    setForm(toForm(data.item));

    return data.item;
  }

  async function publishContent(id: string) {
    const response = await fetch(`/api/content/items/${id}/publish`, {
      method: "POST",
      credentials: "include",
      headers: contentHeaders(true),
      body: "{}",
    });

    if (response.status === 401) {
      redirectToLogin();
      return undefined;
    }

    if (!response.ok) {
      throw new Error(`Publish failed with ${response.status}`);
    }

    const data = (await response.json()) as ContentDetailResponse;
    return data.item;
  }

  async function logout() {
    setIsBusy(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      window.location.href = "/account/login";
    }
  }

  return (
    <section className="contentDesk">
      <div className="contentDeskTop">
        <div>
          <p className="eyebrow">Content Desk</p>
          <h2>Editorial publishing workspace</h2>
          <p>
            Manage shared editorial records while keeping technology listings in
            the Directory Console.
          </p>
        </div>
        <div className="contentDeskControls">
          {user ? (
            <div className="contentSession">
              <span>{user.name}</span>
              <small>{formatRole(user.role)}</small>
            </div>
          ) : null}
          <button
            disabled={!authChecked || isBusy}
            onClick={logout}
            type="button"
          >
            Sign out
          </button>
          <button
            disabled={!authChecked || !user}
            onClick={() => startNew("news")}
            type="button"
          >
            New Content
          </button>
        </div>
      </div>

      <div className="contentMetrics">
        {Object.entries(contentStatusLabels).map(([status, label]) => (
          <button
            aria-pressed={statusFilter === status}
            key={status}
            onClick={() =>
              setStatusFilter(
                statusFilter === status ? "all" : (status as ContentStatus),
              )
            }
            type="button"
          >
            <span>{label}</span>
            <strong>{counts[status as ContentStatus] ?? 0}</strong>
          </button>
        ))}
      </div>

      <div className="contentDeskGrid">
        <aside className="contentListPanel">
          <div className="contentFilters">
            <input
              aria-label="Search content"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search content"
              value={search}
            />
            <select
              aria-label="Filter content type"
              onChange={(event) =>
                setTypeFilter(event.target.value as ContentType | "all")
              }
              value={typeFilter}
            >
              <option value="all">All types</option>
              {contentTypeConfigs.map((config) => (
                <option key={config.type} value={config.type}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <div className="contentTypeShortcuts">
            {contentTypeConfigs.slice(0, 4).map((config) => (
              <button
                key={config.type}
                onClick={() => startNew(config.type)}
                type="button"
              >
                {config.label}
              </button>
            ))}
          </div>

          <div className="contentList">
            {visibleItems.map((item) => (
              <button
                aria-pressed={selectedId === item.id}
                key={item.id}
                onClick={() => selectItem(item)}
                type="button"
              >
                <span>{contentStatusLabels[item.status]}</span>
                <strong>{item.title}</strong>
                <small>
                  {
                    contentTypeConfigs.find(
                      (config) => config.type === item.type,
                    )?.label
                  }
                </small>
              </button>
            ))}
          </div>
        </aside>

        <form className="contentEditor" onSubmit={saveContent}>
          <div className="contentNotice">{notice}</div>
          <div className="contentEditorHeader">
            <div>
              <span>
                {form.id ? contentStatusLabels[form.status] : "New draft"}
              </span>
              <h3>{form.title || "Untitled content"}</h3>
            </div>
            <div className="contentActions">
              <button disabled={isBusy || !user} type="submit">
                Save
              </button>
              <button
                className="contentActionPublish"
                disabled={isBusy || !canPublishContent}
                onClick={saveAndPublish}
                type="button"
              >
                Save &amp; Publish
              </button>
              <button
                className="contentActionSecondary"
                disabled={isBusy || !form.id || !user}
                onClick={() => changeWorkflow("submit")}
                type="button"
              >
                Submit
              </button>
              <button
                className="contentActionPublish"
                disabled={isBusy || !form.id || !canPublishContent}
                onClick={() => changeWorkflow("publish")}
                type="button"
              >
                Publish
              </button>
              <button
                className="contentActionDanger"
                disabled={isBusy || !form.id || !canPublishContent}
                onClick={() => changeWorkflow("unpublish")}
                type="button"
              >
                Unpublish
              </button>
            </div>
          </div>
          <div
            className={`contentPublishHint ${
              form.status === "published" ? "isPublished" : ""
            }`}
          >
            {form.status === "published" && form.slug ? (
              <>
                Visible on customer pages at{" "}
                <a
                  href={getPublicContentHref(form)}
                  rel="noreferrer"
                  target="_blank"
                >
                  {getPublicContentHref(form)}
                </a>
                .
              </>
            ) : (
              <>
                Saved drafts stay internal. Use Save &amp; Publish to make this
                content visible on customer pages.
              </>
            )}
          </div>

          <div className="contentFormGrid">
            <label>
              Type
              <select
                onChange={(event) => {
                  const nextType = event.target.value as ContentType;
                  const config = contentTypeConfigs.find(
                    (item) => item.type === nextType,
                  );
                  setForm((current) => ({
                    ...current,
                    type: nextType,
                    metadata: {
                      ...Object.fromEntries(
                        (config?.fields ?? []).map((field) => [field.key, ""]),
                      ),
                      ...current.metadata,
                    },
                  }));
                }}
                value={form.type}
              >
                {contentTypeConfigs.map((config) => (
                  <option key={config.type} value={config.type}>
                    {config.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Slug
              <input
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    slug: event.target.value,
                  }))
                }
                value={form.slug}
              />
            </label>
          </div>

          <label>
            Title
            <input
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              required
              value={form.title}
            />
          </label>

          <label>
            Summary
            <textarea
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  summary: event.target.value,
                }))
              }
              rows={3}
              value={form.summary}
            />
          </label>

          <label className="contentBodyField">
            Body
            <div aria-label="Body formatting" className="contentBodyToolbar">
              <button
                onClick={() => insertBodyBlock("## $selection", "Heading")}
                title="Heading"
                type="button"
              >
                H2
              </button>
              <button
                onClick={() => insertBodyBlock("### $selection", "Subheading")}
                title="Subheading"
                type="button"
              >
                H3
              </button>
              <button
                onClick={() => insertBodyBlock("- $selection", "List item")}
                title="List item"
                type="button"
              >
                List
              </button>
              <button
                onClick={() => insertBodyBlock("1. $selection", "List item")}
                title="Numbered list item"
                type="button"
              >
                1.
              </button>
              <button
                onClick={() => insertBodyBlock("> $selection", "Quote text")}
                title="Quote"
                type="button"
              >
                Quote
              </button>
              <button
                onClick={() =>
                  insertBodyBlock(
                    "[$selection](https://example.com)",
                    "Link text",
                  )
                }
                title="Link"
                type="button"
              >
                Link
              </button>
            </div>
            <textarea
              onChange={(event) =>
                setForm((current) => ({ ...current, body: event.target.value }))
              }
              ref={bodyTextareaRef}
              rows={10}
              value={form.body}
            />
          </label>

          <div className="contentFormGrid">
            <div className="contentHeroManager">
              <div>
                <span>Hero image</span>
                <p>
                  {form.heroImage ? "Image selected." : "No image selected."}
                </p>
              </div>
              {form.heroImage ? (
                <img
                  alt=""
                  className="contentHeroPreview"
                  src={form.heroImage}
                />
              ) : (
                <div className="contentHeroPlaceholder">No image</div>
              )}
              <div className="contentHeroActions">
                <label className="contentInlineUpload">
                  Upload
                  <input
                    accept="image/*"
                    disabled={isBusy || !user}
                    onChange={uploadHeroImage}
                    type="file"
                  />
                </label>
                <button
                  disabled={isBusy || !form.heroImage}
                  onClick={clearHeroImage}
                  type="button"
                >
                  Clear
                </button>
              </div>
            </div>
            <label>
              SEO title
              <input
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    seoTitle: event.target.value,
                  }))
                }
                value={form.seoTitle}
              />
            </label>
          </div>

          <label>
            SEO description
            <textarea
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  seoDescription: event.target.value,
                }))
              }
              rows={2}
              value={form.seoDescription}
            />
          </label>

          {selectedConfig ? (
            <div className="contentTemplateFields">
              <h4>{selectedConfig.label} template fields</h4>
              <div className="contentFormGrid">
                {selectedConfig.fields.map((field) => (
                  <label key={field.key}>
                    {field.label}
                    <input
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          metadata: {
                            ...current.metadata,
                            [field.key]: event.target.value,
                          },
                        }))
                      }
                      required={field.required}
                      type={field.kind === "date" ? "date" : "text"}
                      value={form.metadata[field.key] ?? ""}
                    />
                  </label>
                ))}
              </div>
            </div>
          ) : null}
        </form>

        <aside className="contentAssistPanel">
          <section>
            <h3>Media Library</h3>
            <label className="mediaUpload">
              Upload image
              <input
                accept="image/*"
                disabled={isBusy || !user}
                onChange={uploadHeroImage}
                type="file"
              />
            </label>
            <div className="mediaAssetList">
              {mediaAssets.slice(0, 8).map((asset) => (
                <div className="mediaAssetItem" key={asset.id}>
                  <button
                    className="mediaAssetPreview"
                    onClick={() => useHeroImage(asset)}
                    type="button"
                  >
                    {asset.mimeType.startsWith("image/") ? (
                      <img alt="" src={asset.url} />
                    ) : null}
                    <span>{asset.filename}</span>
                    <small>{formatFileSize(asset.sizeBytes)}</small>
                  </button>
                  <div className="mediaAssetActions">
                    <button onClick={() => useHeroImage(asset)} type="button">
                      Hero
                    </button>
                    <button
                      onClick={() => insertBodyImage(asset)}
                      type="button"
                    >
                      Body
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3>Directory-owned content</h3>
            <p>
              Latest Technologies should stay in the directory model, not the
              editorial table.
            </p>
            <div className="directoryMiniList">
              {seedTechnologyListings.map((item) => (
                <a href={item.href} key={item.id}>
                  <strong>{item.title}</strong>
                  <span>{item.summary}</span>
                </a>
              ))}
            </div>
          </section>

          <section>
            <h3>AI Assist</h3>
            <select
              aria-label="AI suggestion type"
              onChange={(event) =>
                setAiKind(event.target.value as AiSuggestionKind)
              }
              value={aiKind}
            >
              {aiKinds.map((kind) => (
                <option key={kind.value} value={kind.value}>
                  {kind.label}
                </option>
              ))}
            </select>
            <textarea
              onChange={(event) => setAiInput(event.target.value)}
              placeholder="Paste draft text or image context"
              rows={5}
              value={aiInput}
            />
            <button
              disabled={isBusy || !user}
              onClick={requestAiSuggestion}
              type="button"
            >
              Generate Draft
            </button>
            {aiSuggestion ? <pre>{aiSuggestion.output}</pre> : null}
          </section>
        </aside>
      </div>
    </section>
  );
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result)));
    reader.addEventListener("error", () =>
      reject(reader.error ?? new Error("File read failed")),
    );
    reader.readAsDataURL(file);
  });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatRole(role: AuthUser["role"]) {
  const labels: Record<AuthUser["role"], string> = {
    content_author: "Content Author",
    content_publisher: "Content Publisher",
    platform_admin: "Platform Admin",
  };

  return labels[role];
}

function buildContentPayload(form: ContentFormState) {
  return {
    type: form.type,
    title: form.title,
    slug: form.slug,
    summary: form.summary,
    body: form.body,
    status: form.status,
    heroImage: form.heroImage || undefined,
    metadata: form.metadata,
    seo: {
      title: form.seoTitle || undefined,
      description: form.seoDescription || undefined,
    },
  };
}

function buildSavedNotice(item: ContentItem) {
  if (item.status === "published") {
    return `Saved "${item.title}" and updated ${getPublicContentHref(item)}.`;
  }

  return `Saved "${item.title}" as ${
    contentStatusLabels[item.status]
  }. Publish it to show on customer pages.`;
}

function buildPublishedNotice(item: ContentItem) {
  return `Published "${item.title}" to ${getPublicContentHref(item)}.`;
}

function buildWorkflowNotice(
  action: "submit" | "publish" | "unpublish",
  item: ContentItem,
) {
  if (action === "publish") {
    return buildPublishedNotice(item);
  }

  if (action === "unpublish") {
    return `Unpublished "${item.title}". It is no longer visible on customer pages.`;
  }

  return `${contentStatusLabels[item.status]}: "${item.title}".`;
}

function getPublicContentHref(item: Pick<ContentFormState, "type" | "slug">) {
  const basePath = contentPublicPaths[item.type] ?? "/news";
  return `${basePath}/${item.slug}`;
}

function redirectToLogin() {
  const returnTo = `${window.location.pathname}${window.location.search}`;
  window.location.href = `/account/login?returnTo=${encodeURIComponent(
    returnTo,
  )}`;
}

function toForm(item: ContentItem | ContentFormState): ContentFormState {
  if ("metadata" in item && "seo" in item) {
    return {
      id: "id" in item ? item.id : undefined,
      type: item.type,
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      body: item.body,
      status: item.status,
      heroImage: item.heroImage ?? "",
      metadata: item.metadata ?? {},
      seoTitle: item.seo.title ?? "",
      seoDescription: item.seo.description ?? "",
    };
  }

  return item;
}

function emptyCounts(): Record<ContentStatus, number> {
  return {
    draft: 0,
    in_review: 0,
    published: 0,
    scheduled: 0,
    archived: 0,
  };
}

function countItems(records: ContentItem[]) {
  return records.reduce((counts, item) => {
    counts[item.status] += 1;
    return counts;
  }, emptyCounts());
}
