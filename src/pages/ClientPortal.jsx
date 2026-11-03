import { Link } from 'react-router-dom';
import { PartyPopper } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../lib/format';
import { AmendmentDiff } from '../components/FeatureParts';
import { FeatureActions } from '../components/FeatureActions';
import { AmendmentTag, Card, EmptyState, PageHeader, StatusBadge, Tag } from '../components/ui';

export default function ClientPortal() {
  const { user, projects, subProjects, features } = useApp();
  const spName = (id) => subProjects.find((s) => s.id === id)?.name;
  const where = (f) => `${projects.find((p) => p.id === f.projectId)?.name} · ${spName(f.subProjectId)}`;

  const pending = features.filter((f) => f.status === 'pending_client');
  const decided = features.filter((f) => f.clientApproval || f.status === 'client_rejected');

  return (
    <>
      <PageHeader
        title={`Hi, ${user.name.split(' ')[0]}`}
        description="Check each feature and approve or reject it. Your decision is saved with your name, the time and the version."
      />

      <h2 className="mb-3 text-sm font-semibold">Waiting for you ({pending.length})</h2>
      {pending.length ? (
        <div className="mb-10 space-y-4">
          {pending.map((f) => {
            const prev = f.history[f.history.length - 1];
            const sent = [...f.timeline].reverse().find((e) => e.kind === 'send');
            return (
              <Card key={f.id} className="p-5">
                <p className="text-sm text-muted">{where(f)}</p>
                <h3 className="mt-1 flex flex-wrap items-center gap-2 text-lg font-semibold">
                  {f.code} · {f.title}
                  <Tag>v{f.version}</Tag>
                  {f.isAmendment && <AmendmentTag refId={f.amendmentRef} />}
                </h3>
                <p className="mt-2 text-sm leading-relaxed">{f.description}</p>
                <p className="mt-2 text-sm text-muted">
                  Estimate: <b className="text-fg">{f.hours} hours</b>
                </p>

                {prev && f.amendmentReason && (
                  <div className="mt-4">
                    <AmendmentDiff prev={prev} next={f} reason={f.amendmentReason} />
                  </div>
                )}
                {sent?.comment && (
                  <p className="mt-4 text-sm text-muted">
                    <b className="text-fg">{sent.actor}:</b> “{sent.comment}”
                  </p>
                )}
                <div className="mt-5">
                  <FeatureActions feature={f} only={['client_approve', 'client_reject']} />
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="mb-10">
          <EmptyState icon={PartyPopper} title="Nothing to approve" description="We'll let you know when a feature is ready." />
        </Card>
      )}

      <h2 className="mb-3 text-sm font-semibold">Your past decisions</h2>
      <Card>
        <ul className="divide-y divide-line">
          {decided.map((f) => (
            <li key={f.id}>
              <Link to={`/projects/${f.projectId}/features/${f.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-subtle">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {f.code} · {f.title} <span className="font-normal text-faint">v{f.version}</span>
                  </p>
                  <p className="text-xs text-muted">
                    {where(f)}
                    {f.clientApproval && ` · ${f.clientApproval.method === 'in_app' ? 'Approved in portal' : 'Approved by email/meeting'} · ${formatDate(f.clientApproval.at)}`}
                  </p>
                </div>
                <StatusBadge status={f.status === 'client_rejected' ? 'client_rejected' : 'client_approved'} />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
