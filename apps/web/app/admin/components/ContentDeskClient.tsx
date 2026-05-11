'use client';

import {
  contentStatusLabels,
  contentTypeConfigs,
  seedContentItems,
  seedTechnologyListings,
  type AiSuggestion,
  type AiSuggestionKind,
  type ContentItem,
  type ContentStatus,
  type ContentType
} from '@sleb/shared/content';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';

type ContentListResponse = {
  items: ContentItem[];
  counts: Record<ContentStatus, number>;
};

type ContentDetailResponse = {
  item: ContentItem;
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
  type: 'news',
  title: '',
  slug: '',
  summary: '',
  body: '',
  status: 'draft',
  heroImage: '',
  metadata: {},
  seoTitle: '',
  seoDescription: ''
};

const aiKinds: Array<{ value: AiSuggestionKind; label: string }> = [
  { value: 'expand', label: 'Expand draft' },
  { value: 'summarize', label: 'Summarize' },
  { value: 'seo', label: 'SEO copy' },
  { value: 'alt_text', label: 'Image alt text' },
  { value: 'image_prompt', label: 'Image prompt' }
];

export function ContentDeskClient() {
  const [items, setItems] = useState<ContentItem[]>(seedContentItems);
  const [counts, setCounts] = useState<Record<ContentStatus, number>>(countItems(seedContentItems));
  const [selectedId, setSelectedId] = useState<string | undefined>(seedContentItems[0]?.id);
  const [form, setForm] = useState<ContentFormState>(toForm(seedContentItems[0] ?? blankForm));
  const [typeFilter, setTypeFilter] = useState<ContentType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('Content seed loaded. Connecting to the publishing database.');
  const [isBusy, setIsBusy] = useState(false);
  const [aiKind, setAiKind] = useState<AiSuggestionKind>('expand');
  const [aiInput, setAiInput] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | undefined>();

  const selectedConfig = contentTypeConfigs.find((config) => config.type === form.type);

  useEffect(() => {
    void loadItems();
  }, []);

  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    return items
      .filter((item) => typeFilter === 'all' || item.type === typeFilter)
      .filter((item) => statusFilter === 'all' || item.status === statusFilter)
      .filter((item) => {
        if (!term) {
          return true;
        }

        return [item.title, item.summary, item.slug, item.type]
          .join(' ')
          .toLowerCase()
          .includes(term);
      });
  }, [items, search, statusFilter, typeFilter]);

  async function loadItems() {
    try {
      const response = await fetch('/api/content/items', { cache: 'no-store' });

      if (!response.ok) {
        throw new Error(`Content API returned ${response.status}`);
      }

      const data = (await response.json()) as ContentListResponse;
      setItems(data.items);
      setCounts(data.counts);
      const nextSelected = data.items.find((item) => item.id === selectedId) ?? data.items[0];

      if (nextSelected) {
        setSelectedId(nextSelected.id);
        setForm(toForm(nextSelected));
      }

      setNotice('Content Desk is connected to the publishing database.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Content API unavailable; showing seed content.');
      setItems(seedContentItems);
      setCounts(countItems(seedContentItems));
    }
  }

  function selectItem(item: ContentItem) {
    setSelectedId(item.id);
    setForm(toForm(item));
    setAiInput(item.body || item.summary);
    setAiSuggestion(undefined);
  }

  function startNew(type: ContentType = 'news') {
    const config = contentTypeConfigs.find((item) => item.type === type);
    setSelectedId(undefined);
    setForm({
      ...blankForm,
      type,
      metadata: Object.fromEntries((config?.fields ?? []).map((field) => [field.key, '']))
    });
    setAiInput('');
    setAiSuggestion(undefined);
  }

  async function saveContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);

    const payload = {
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
        description: form.seoDescription || undefined
      }
    };

    try {
      const response = await fetch(form.id ? `/api/content/items/${form.id}` : '/api/content/items', {
        method: form.id ? 'PATCH' : 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Save failed with ${response.status}`);
      }

      const data = (await response.json()) as ContentDetailResponse;
      setSelectedId(data.item.id);
      setForm(toForm(data.item));
      await loadItems();
      setNotice(`Saved "${data.item.title}".`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Save failed.');
    } finally {
      setIsBusy(false);
    }
  }

  async function changeWorkflow(action: 'submit' | 'publish' | 'unpublish') {
    if (!form.id) {
      setNotice('Save the draft before changing workflow state.');
      return;
    }

    setIsBusy(true);

    try {
      const response = await fetch(`/api/content/items/${form.id}/${action}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`${action} failed with ${response.status}`);
      }

      const data = (await response.json()) as ContentDetailResponse;
      setForm(toForm(data.item));
      await loadItems();
      setNotice(`${contentStatusLabels[data.item.status]}: "${data.item.title}".`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Workflow action failed.');
    } finally {
      setIsBusy(false);
    }
  }

  async function requestAiSuggestion() {
    const input = aiInput.trim() || form.body || form.summary || form.title;

    if (!input.trim()) {
      setNotice('Add draft text before requesting an AI suggestion.');
      return;
    }

    setIsBusy(true);

    try {
      const response = await fetch('/api/content/ai/suggestions', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          itemId: form.id,
          kind: aiKind,
          input
        })
      });

      if (!response.ok) {
        throw new Error(`AI suggestion failed with ${response.status}`);
      }

      const data = (await response.json()) as { suggestion: AiSuggestion };
      setAiSuggestion(data.suggestion);
      setNotice('AI assist draft generated for editorial review.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'AI suggestion failed.');
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <section className="contentDesk">
      <div className="contentDeskTop">
        <div>
          <p className="eyebrow">Content Desk</p>
          <h2>Editorial publishing workspace</h2>
          <p>
            Manage shared editorial records while keeping technology listings in the Directory
            Console.
          </p>
        </div>
        <button onClick={() => startNew('news')} type="button">
          New Content
        </button>
      </div>

      <div className="contentMetrics">
        {Object.entries(contentStatusLabels).map(([status, label]) => (
          <button
            aria-pressed={statusFilter === status}
            key={status}
            onClick={() => setStatusFilter(statusFilter === status ? 'all' : (status as ContentStatus))}
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
              onChange={(event) => setTypeFilter(event.target.value as ContentType | 'all')}
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
              <button key={config.type} onClick={() => startNew(config.type)} type="button">
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
                <small>{contentTypeConfigs.find((config) => config.type === item.type)?.label}</small>
              </button>
            ))}
          </div>
        </aside>

        <form className="contentEditor" onSubmit={saveContent}>
          <div className="contentNotice">{notice}</div>
          <div className="contentEditorHeader">
            <div>
              <span>{form.id ? contentStatusLabels[form.status] : 'New draft'}</span>
              <h3>{form.title || 'Untitled content'}</h3>
            </div>
            <div className="contentActions">
              <button disabled={isBusy} type="submit">
                Save
              </button>
              <button disabled={isBusy || !form.id} onClick={() => changeWorkflow('submit')} type="button">
                Submit
              </button>
              <button disabled={isBusy || !form.id} onClick={() => changeWorkflow('publish')} type="button">
                Publish
              </button>
              <button disabled={isBusy || !form.id} onClick={() => changeWorkflow('unpublish')} type="button">
                Unpublish
              </button>
            </div>
          </div>

          <div className="contentFormGrid">
            <label>
              Type
              <select
                onChange={(event) => {
                  const nextType = event.target.value as ContentType;
                  const config = contentTypeConfigs.find((item) => item.type === nextType);
                  setForm((current) => ({
                    ...current,
                    type: nextType,
                    metadata: {
                      ...Object.fromEntries((config?.fields ?? []).map((field) => [field.key, ''])),
                      ...current.metadata
                    }
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
                onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                value={form.slug}
              />
            </label>
          </div>

          <label>
            Title
            <input
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              required
              value={form.title}
            />
          </label>

          <label>
            Summary
            <textarea
              onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
              rows={3}
              value={form.summary}
            />
          </label>

          <label>
            Body
            <textarea
              onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
              rows={10}
              value={form.body}
            />
          </label>

          <div className="contentFormGrid">
            <label>
              Hero image URL
              <input
                onChange={(event) => setForm((current) => ({ ...current, heroImage: event.target.value }))}
                value={form.heroImage}
              />
            </label>
            <label>
              SEO title
              <input
                onChange={(event) => setForm((current) => ({ ...current, seoTitle: event.target.value }))}
                value={form.seoTitle}
              />
            </label>
          </div>

          <label>
            SEO description
            <textarea
              onChange={(event) =>
                setForm((current) => ({ ...current, seoDescription: event.target.value }))
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
                            [field.key]: event.target.value
                          }
                        }))
                      }
                      required={field.required}
                      type={field.kind === 'date' ? 'date' : 'text'}
                      value={form.metadata[field.key] ?? ''}
                    />
                  </label>
                ))}
              </div>
            </div>
          ) : null}
        </form>

        <aside className="contentAssistPanel">
          <section>
            <h3>Directory-owned content</h3>
            <p>Latest Technologies should stay in the directory model, not the editorial table.</p>
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
              onChange={(event) => setAiKind(event.target.value as AiSuggestionKind)}
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
            <button disabled={isBusy} onClick={requestAiSuggestion} type="button">
              Generate Draft
            </button>
            {aiSuggestion ? <pre>{aiSuggestion.output}</pre> : null}
          </section>
        </aside>
      </div>
    </section>
  );
}

function toForm(item: ContentItem | ContentFormState): ContentFormState {
  if ('metadata' in item && 'seo' in item) {
    return {
      id: 'id' in item ? item.id : undefined,
      type: item.type,
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      body: item.body,
      status: item.status,
      heroImage: item.heroImage ?? '',
      metadata: item.metadata ?? {},
      seoTitle: item.seo.title ?? '',
      seoDescription: item.seo.description ?? ''
    };
  }

  return item;
}

function countItems(records: ContentItem[]) {
  return records.reduce(
    (counts, item) => {
      counts[item.status] += 1;
      return counts;
    },
    {
      draft: 0,
      in_review: 0,
      published: 0,
      scheduled: 0,
      archived: 0
    } satisfies Record<ContentStatus, number>
  );
}
