import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ROLES } from '../data/mockData';
import { formatDateTime } from '../lib/format';
import { Card, PageHeader, Tabs } from '../components/ui';

export default function AuditLog() {
  const { subProjects, features } = useApp();
  const [roleFilter, setRoleFilter] = useState('all');

  const all = features.flatMap((f) => f.timeline.map((e) => ({ ...e, feature: f })));
  const events = all.filter((e) => roleFilter === 'all' || e.role === roleFilter).sort((a, b) => new Date(b.at) - new Date(a.at));
  const spName = (id) => subProjects.find((s) => s.id === id)?.name;

  const tabs = [
    { key: 'all', label: 'Everyone' },
    ...Object.values(ROLES).map((r) => ({ key: r.key, label: r.label })),
  ];

  return (
    <>
      <PageHeader title="History" description="Every action on every feature: who did it, on which version, and when. Nothing here can be edited." />
      <div className="mb-5">
        <Tabs tabs={tabs} value={roleFilter} onChange={setRoleFilter} />
      </div>
      <Card>
        <ul className="divide-y divide-line">
          {events.map((e) => (
            <li key={e.id} className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:gap-6">
              <span className="w-36 shrink-0 text-xs tabular-nums text-faint sm:pt-0.5">{formatDateTime(e.at)}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <b>{e.actor}</b> <span className="text-muted">({ROLES[e.role].label})</span> · {e.action}
                </p>
                <Link to={`/projects/${e.feature.projectId}/features/${e.feature.id}`} className="text-xs text-muted hover:text-accent-text">
                  {spName(e.feature.subProjectId)} · {e.feature.code} {e.feature.title} · v{e.version}
                </Link>
                {e.comment && <p className="mt-1 text-sm text-muted">“{e.comment}”</p>}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
