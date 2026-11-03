import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, PartyPopper, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { needsRole, primaryActionLabel } from '../lib/workflow';
import { ApprovalBar } from '../components/FeatureParts';
import { AmendmentTag, Button, Card, EmptyState, Field, Input, Modal, PageHeader, StatusBadge } from '../components/ui';

function NewProjectModal({ onClose }) {
  const { createProject } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: 'Greenleaf Customer Platform',
    client: 'Greenleaf Retail Pvt. Ltd.',
    approverName: 'Ananya Rao',
    approverTitle: 'Head of Digital',
    approverEmail: 'ananya.rao@greenleaf.co.in',
    sowRef: 'SOW-GL-2026-021',
    signedOn: new Date().toISOString().slice(0, 10),
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const valid = form.name && form.client && form.approverName && form.approverEmail && form.sowRef;
  return (
    <Modal
      open
      size="lg"
      onClose={onClose}
      title="New project"
      description="Only the client approver named here can approve features for this project."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              const id = createProject(form);
              navigate(`/projects/${id}`);
            }}
          >
            Create project
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Project name" required>
            <Input value={form.name} onChange={set('name')} />
          </Field>
        </div>
        <Field label="Client company" required>
          <Input value={form.client} onChange={set('client')} />
        </Field>
        <Field label="SOW reference" required>
          <Input value={form.sowRef} onChange={set('sowRef')} />
        </Field>
        <Field label="Client approver" required>
          <Input value={form.approverName} onChange={set('approverName')} />
        </Field>
        <Field label="Approver email" required>
          <Input type="email" value={form.approverEmail} onChange={set('approverEmail')} />
        </Field>
      </div>
    </Modal>
  );
}

export default function Dashboard() {
  const { role, user, projects, subProjects, features } = useApp();
  const [creating, setCreating] = useState(false);

  const todo = features.filter((f) => needsRole(role, f.status));
  const spName = (id) => subProjects.find((s) => s.id === id)?.name;

  return (
    <>
      <PageHeader
        title={`Hi, ${user.name.split(' ')[0]}`}
        description={
          role === 'sales'
            ? 'Create projects and set up their SOW.'
            : todo.length
              ? `${todo.length} ${todo.length === 1 ? 'feature needs' : 'features need'} you.`
              : 'Nothing needs you right now.'
        }
        actions={
          role === 'sales' && (
            <Button icon={Plus} onClick={() => setCreating(true)}>
              New project
            </Button>
          )
        }
      />

      {role !== 'sales' && (
        <section className="mb-10">
          <h2 className="mb-3 text-sm font-semibold">Your to-do</h2>
          <Card>
            {todo.length ? (
              <ul className="divide-y divide-line">
                {todo.map((f) => (
                  <li key={f.id}>
                    <Link to={`/projects/${f.projectId}/features/${f.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-subtle">
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="font-medium">
                            {f.code} · {f.title}
                          </span>
                          {f.isAmendment && <AmendmentTag refId={f.amendmentRef} />}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">{spName(f.subProjectId)}</p>
                      </div>
                      <span className="hidden sm:block">
                        <StatusBadge status={f.status} />
                      </span>
                      <span className="flex w-56 items-center justify-end whitespace-nowrap gap-1 text-sm font-medium text-accent-text">
                        {primaryActionLabel(role, f.status)}
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={PartyPopper} title="You're all caught up" description="New work will show up here." />
            )}
          </Card>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold">Projects</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => {
            const pf = features.filter((f) => f.projectId === p.id);
            const withClient = pf.filter((f) => f.status === 'pending_client').length;
            return (
              <Link key={p.id} to={`/projects/${p.id}`} className="block">
                <Card className="h-full p-5 transition-colors hover:border-line-strong">
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="mt-0.5 text-sm text-muted">{p.client}</p>
                  <div className="mt-5">
                    {pf.length ? <ApprovalBar features={pf} /> : <p className="text-sm text-muted">SOW not set up yet</p>}
                  </div>
                  {withClient > 0 && <p className="mt-3 text-xs text-muted">{withClient} waiting on the client</p>}
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {creating && <NewProjectModal onClose={() => setCreating(false)} />}
    </>
  );
}
