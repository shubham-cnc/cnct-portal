import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, SearchX } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { nextStep } from '../lib/workflow';
import { cx, formatDate, formatDateTime } from '../lib/format';
import { AmendmentDiff, DocumentList, Stepper, Timeline, VersionList } from '../components/FeatureParts';
import { FeatureActions } from '../components/FeatureActions';
import { AmendmentTag, Card, EmptyState, StatusBadge, Tabs, Tag } from '../components/ui';

function ClientApprovalLine({ approval }) {
  const when = approval.method === 'in_app' ? formatDateTime(approval.at) : formatDate(approval.at);
  return (
    <p className="flex items-start gap-2 text-sm">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
      <span>
        Approved by <b>{approval.by}</b> on {when}
        {approval.method === 'in_app' ? ' in the client portal.' : ` by ${approval.evidence}, checked by ${approval.verifiedBy}.`}
      </span>
    </p>
  );
}

// Keyed by feature so the selected tab resets when moving between features.
export default function FeatureDetailPage() {
  const { featureId } = useParams();
  return <FeatureDetail key={featureId} />;
}

function FeatureDetail() {
  const { projectId, featureId } = useParams();
  const { role, projects, subProjects, features } = useApp();
  const [tab, setTab] = useState('overview');
  const feature = features.find((f) => f.id === featureId);
  const project = projects.find((p) => p.id === projectId);

  if (!feature || !project) return <EmptyState icon={SearchX} title="Feature not found" />;

  const sp = subProjects.find((s) => s.id === feature.subProjectId);
  const docs = feature.documents.filter((d) => d.version === feature.version);
  const prev = feature.history[feature.history.length - 1];
  const step = nextStep(role, feature.status);
  const ev = feature.pendingEvidence;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'docs', label: 'Documents', count: docs.length },
    { key: 'history', label: 'History', count: feature.timeline.length },
    ...(feature.history.length ? [{ key: 'versions', label: 'Versions', count: feature.history.length + 1 }] : []),
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <Link to={`/projects/${project.id}`} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> {project.name}
      </Link>

      <div className="mb-6">
        <p className="text-sm text-muted">
          {sp?.name} · {feature.code}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{feature.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
          <StatusBadge status={feature.status} />
          <Tag>v{feature.version}</Tag>
          {feature.isAmendment && <AmendmentTag refId={feature.amendmentRef} />}
          <span>· {feature.hours} hours</span>
          {feature.redmineId && <span>· Redmine #{feature.redmineId}</span>}
        </div>
      </div>

      <Card className="mb-6 p-5">
        <Stepper status={feature.status} />

        <div className={cx('mt-5 rounded-lg p-4', step.mine ? 'bg-accent-soft' : 'bg-subtle')}>
          <p className="flex items-start gap-2 text-sm">
            {!step.mine && <Clock className="mt-0.5 h-4 w-4 shrink-0 text-faint" />}
            <span>
              {step.mine && <b>Next step: </b>}
              {step.text}
            </span>
          </p>

          {ev && (
            <p className="mt-2 text-sm text-muted">
              Evidence: {ev.source} from <b className="text-fg">{ev.approvedBy}</b> on {formatDate(ev.approvedOn)} ({ev.file}).
              {ev.approvedBy !== project.clientApprover.name && (
                <span className="text-red-600 dark:text-red-400"> This is not the approver named in the SOW.</span>
              )}
            </p>
          )}

          <div className="mt-3 empty:hidden">
            <FeatureActions feature={feature} />
          </div>
        </div>
      </Card>

      <Tabs tabs={tabs} value={tab} onChange={setTab} />

      <div className="pt-5">
        {tab === 'overview' && (
          <div className="space-y-5">
            <p className="text-sm leading-relaxed">{feature.description}</p>
            {prev && feature.amendmentReason && <AmendmentDiff prev={prev} next={feature} reason={feature.amendmentReason} />}
            {feature.clientApproval && <ClientApprovalLine approval={feature.clientApproval} />}
          </div>
        )}
        {tab === 'docs' && <DocumentList documents={docs} feature={feature} empty={`No documents on v${feature.version} yet.`} />}
        {tab === 'history' && <Timeline events={feature.timeline} />}
        {tab === 'versions' && <VersionList feature={feature} />}
      </div>
    </div>
  );
}
