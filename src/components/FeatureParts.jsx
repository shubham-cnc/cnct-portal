import { useState } from 'react';
import { ArrowRight, Check, ChevronDown, Eye, FileText, Lock, Paperclip, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useDocViewer } from './DocumentViewer';
import { ROLES } from '../data/mockData';
import { STEPS, isApproved, stepState } from '../lib/workflow';
import { cx, formatDate, formatDateTime } from '../lib/format';
import { StatusBadge, Tag } from './ui';

/* One bar: how many features are client approved. */
export function ApprovalBar({ features }) {
  const done = features.filter((f) => isApproved(f.status)).length;
  const pct = features.length ? Math.round((done / features.length) * 100) : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-xs text-muted">
        <span>
          <b className="text-fg">{done}</b> of {features.length} features approved
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-subtle">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* Documents → Internal approval → Client approval → Development */
export function Stepper({ status }) {
  const { index, state } = stepState(status);
  return (
    <ol className="grid grid-cols-4 gap-2">
      {STEPS.map((label, i) => {
        const done = i < index;
        const current = i === index;
        const error = current && state === 'error';
        return (
          <li key={label}>
            <div
              className={cx(
                'h-1.5 rounded-full',
                done && 'bg-accent',
                current && !error && 'bg-accent/40',
                error && 'bg-red-500',
                !done && !current && 'bg-subtle',
              )}
            />
            <p className={cx('mt-2 flex items-center gap-1 text-xs font-medium', done || current ? 'text-fg' : 'text-faint')}>
              {done && <Check className="h-3.5 w-3.5 text-accent-text" />}
              {error && <X className="h-3.5 w-3.5 text-red-500" />}
              {label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

/* Documents with an eye icon to open each one in the viewer. */
export function DocumentList({ documents, feature, empty = 'No documents yet.' }) {
  const openDoc = useDocViewer();
  const { hasViewed } = useApp();
  if (!documents.length) return <p className="py-6 text-center text-sm text-muted">{empty}</p>;
  return (
    <ul className="divide-y divide-line">
      {documents.map((d) => {
        const Icon = d.kind === 'evidence' ? Paperclip : FileText;
        return (
          <li key={d.id} className="flex items-center gap-3 py-3">
            <Icon className={cx('h-4 w-4 shrink-0', d.kind === 'evidence' ? 'text-amber-500' : 'text-faint')} />
            <button onClick={() => openDoc(d, feature, documents)} className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-medium hover:text-accent-text">
                {d.name} {d.kind === 'evidence' && <Tag tone="amber">Client evidence</Tag>}
              </p>
              <p className="text-xs text-muted">
                {d.size} · {d.uploadedBy} · {formatDate(d.uploadedAt)}
                {hasViewed(d.id) && <span className="text-emerald-600 dark:text-emerald-400"> · Viewed</span>}
              </p>
            </button>
            <button
              onClick={() => openDoc(d, feature, documents)}
              className="rounded-lg p-2 text-muted hover:bg-subtle hover:text-accent-text"
              aria-label={`View ${d.name}`}
              title="View document"
            >
              <Eye className="h-4 w-4" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function AmendmentDiff({ prev, next, reason }) {
  const delta = next.hours - prev.hours;
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
      <p className="mb-3 text-xs font-semibold text-amber-700 dark:text-amber-300">Changed from v{prev.version}</p>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div>
          <p className="text-muted line-through">{prev.title}</p>
          <p className="text-xs text-muted">{prev.hours} h</p>
        </div>
        <ArrowRight className="hidden h-4 w-4 text-amber-500 sm:block" />
        <div>
          <p className="font-medium">{next.title}</p>
          <p className="text-xs">
            {next.hours} h{' '}
            <span className="font-semibold text-amber-700 dark:text-amber-300">
              ({delta >= 0 ? '+' : ''}
              {delta} h)
            </span>
          </p>
        </div>
      </div>
      <p className="mt-3 text-muted">
        <span className="font-medium text-fg">Why:</span> {reason}
      </p>
    </div>
  );
}

/* Older versions, read-only, expandable. */
export function VersionList({ feature }) {
  const [open, setOpen] = useState(null);
  return (
    <ul className="divide-y divide-line">
      <li className="flex items-center gap-2 py-3 text-sm">
        <Tag tone="teal">v{feature.version}</Tag>
        <span className="font-medium">{feature.title}</span>
        <span className="text-muted">· {feature.hours} h · current</span>
      </li>
      {[...feature.history].reverse().map((v) => (
        <li key={v.version}>
          <button onClick={() => setOpen(open === v.version ? null : v.version)} className="flex w-full items-center gap-2 py-3 text-left text-sm">
            <Tag>v{v.version}</Tag>
            <span className="truncate text-muted">{v.title}</span>
            <span className="text-faint">· {v.hours} h</span>
            <span className="ml-auto flex items-center gap-1.5 text-xs text-faint">
              <Lock className="h-3 w-3" /> Read-only
              <ChevronDown className={cx('h-4 w-4 transition-transform', open === v.version && 'rotate-180')} />
            </span>
          </button>
          {open === v.version && (
            <div className="mb-3 space-y-2 rounded-lg bg-subtle p-4 text-sm">
              <p>{v.description}</p>
              <p className="text-xs text-muted">
                Was <StatusBadge status={v.finalStatus} />
                {v.clientApproval && <> · client approved by {v.clientApproval.by} on {formatDate(v.clientApproval.at)}</>}
                {v.redmineId && <> · Redmine #{v.redmineId}</>}
              </p>
              <p className="text-xs text-muted">
                Replaced by {v.supersededBy} on {formatDate(v.supersededAt)}
              </p>
              <DocumentList documents={v.documents} feature={{ ...feature, ...v }} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

const DOT = {
  approve: 'bg-emerald-500',
  reject: 'bg-red-500',
  amend: 'bg-amber-500',
  evidence: 'bg-amber-500',
  redmine: 'bg-indigo-500',
  send: 'bg-violet-500',
  view: 'bg-sky-500',
};

/* Audit trail: who did what, on which version, when. Newest first. */
export function Timeline({ events }) {
  // Newest first; entries recorded in the same instant keep their recorded order, reversed.
  const sorted = events
    .map((e, i) => [e, i])
    .sort(([a, ai], [b, bi]) => new Date(b.at) - new Date(a.at) || bi - ai)
    .map(([e]) => e);
  return (
    <ol>
      {sorted.map((e, i) => (
        <li key={e.id} className="relative flex gap-3 pb-5 last:pb-0">
          {i < sorted.length - 1 && <span className="absolute left-[4px] top-4 bottom-0 w-px bg-line" />}
          <span className={cx('relative mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', DOT[e.kind] ?? 'bg-faint')} />
          <div className="min-w-0 flex-1">
            <p className="text-sm">
              <span className="font-medium">{e.action}</span> <span className="text-xs text-faint">v{e.version}</span>
            </p>
            <p className="text-xs text-muted">
              {e.actor} ({ROLES[e.role]?.label}) · {formatDateTime(e.at)}
            </p>
            {e.comment && <p className="mt-1.5 text-sm text-muted">“{e.comment}”</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
