import { Link } from 'react-router-dom';
import { PartyPopper } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, timeAgo } from '../lib/format';
import { AmendmentDiff } from '../components/FeatureParts';
import { FeatureActions } from '../components/FeatureActions';
import { AmendmentTag, Card, EmptyState, PageHeader, Tag } from '../components/ui';

function QueueItem({ feature }) {
  const { projects, subProjects } = useApp();
  const project = projects.find((p) => p.id === feature.projectId);
  const sp = subProjects.find((s) => s.id === feature.subProjectId);
  const isEvidence = feature.status === 'evidence_pending';
  const ev = feature.pendingEvidence;
  const prev = feature.history[feature.history.length - 1];
  const sentAt = [...feature.timeline].reverse().find((e) => e.kind === (isEvidence ? 'evidence' : 'submit'))?.at;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Tag tone={isEvidence ? 'amber' : 'gray'}>{isEvidence ? 'Client evidence' : 'Documents'}</Tag>
        {feature.isAmendment && <AmendmentTag refId={feature.amendmentRef} />}
        {sentAt && <span className="ml-auto text-xs text-faint">{timeAgo(sentAt)}</span>}
      </div>

      <Link to={`/projects/${feature.projectId}/features/${feature.id}`} className="mt-2 block hover:text-accent-text">
        <h3 className="font-semibold">
          {feature.code} · {feature.title} <span className="text-sm font-normal text-muted">v{feature.version}</span>
        </h3>
      </Link>
      <p className="text-sm text-muted">
        {sp.name} · {feature.hours} hours
      </p>

      {isEvidence && ev && (
        <p className="mt-3 text-sm">
          {ev.source} approval from <b>{ev.approvedBy}</b> on {formatDate(ev.approvedOn)}.{' '}
          {ev.approvedBy === project.clientApprover.name ? (
            <span className="text-emerald-600 dark:text-emerald-400">Matches the SOW approver.</span>
          ) : (
            <span className="text-red-600 dark:text-red-400">Not the SOW approver.</span>
          )}
          {ev.note && <span className="mt-1 block text-muted">“{ev.note}”</span>}
        </p>
      )}

      {!isEvidence && prev && feature.amendmentReason && (
        <div className="mt-3">
          <AmendmentDiff prev={prev} next={feature} reason={feature.amendmentReason} />
        </div>
      )}

      <div className="mt-4">
        <FeatureActions feature={feature} size="sm" />
      </div>
    </Card>
  );
}

export default function ApprovalQueue() {
  const { features } = useApp();
  const items = features.filter((f) => f.status === 'pending_internal' || f.status === 'evidence_pending');

  return (
    <>
      <PageHeader title="To approve" description="Nothing goes to the client or to development until you approve it here." />
      {items.length ? (
        <div className="space-y-4">
          {items.map((f) => (
            <QueueItem key={f.id} feature={f} />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState icon={PartyPopper} title="All caught up" description="Nothing is waiting for internal approval." />
        </Card>
      )}
    </>
  );
}
