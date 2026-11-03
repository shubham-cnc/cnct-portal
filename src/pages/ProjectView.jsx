import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, FileUp, FolderPlus, Loader2, Plus, Search, SearchX } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sowTemplate } from '../data/mockData';
import { STAGE, needsRole } from '../lib/workflow';
import { cx, formatBytes } from '../lib/format';
import { ApprovalBar } from '../components/FeatureParts';
import { AmendmentTag, Button, Card, EmptyState, Field, Input, Modal, PageHeader, Select, StatusBadge, Tabs, Tag, Textarea } from '../components/ui';

function UploadSowModal({ project, onClose }) {
  const { importSow } = useApp();
  const [file, setFile] = useState(null);
  const [stage, setStage] = useState('pick'); // pick → reading → preview
  const featureCount = sowTemplate.subProjects.reduce((n, sp) => n + sp.features.length, 0);

  const start = (f) => {
    setFile(f);
    setStage('reading');
    setTimeout(() => setStage('preview'), 1200);
  };

  return (
    <Modal
      open
      size="lg"
      onClose={onClose}
      title="Upload SOW"
      description="We'll pull out the sub-projects and features for you to check."
      footer={
        stage === 'preview' && (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                importSow(project.id, file);
                onClose();
              }}
            >
              Create {featureCount} features
            </Button>
          </>
        )
      }
    >
      {stage === 'pick' && (
        <div className="space-y-3">
          <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-line-strong px-4 py-8 text-center hover:border-accent hover:bg-accent-soft">
            <FileUp className="h-6 w-6 text-faint" />
            <span className="mt-2 text-sm font-medium">Choose the signed SOW</span>
            <span className="text-xs text-muted">PDF or DOCX</span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => e.target.files[0] && start({ name: e.target.files[0].name, size: formatBytes(e.target.files[0].size) })}
            />
          </label>
          <Button variant="secondary" className="w-full" onClick={() => start(sowTemplate.file)}>
            Use a sample file
          </Button>
        </div>
      )}
      {stage === 'reading' && (
        <div className="flex flex-col items-center py-10 text-sm text-muted">
          <Loader2 className="mb-3 h-6 w-6 animate-spin text-accent-text" />
          Reading {file.name}…
        </div>
      )}
      {stage === 'preview' && (
        <div className="space-y-4">
          <p className="text-sm text-muted">Found in {file.name}:</p>
          {sowTemplate.subProjects.map((sp) => (
            <div key={sp.name}>
              <p className="mb-1 text-sm font-semibold">{sp.name}</p>
              <ul className="divide-y divide-line rounded-lg border border-line text-sm">
                {sp.features.map((f, i) => (
                  <li key={f.title} className="flex items-center gap-3 px-3.5 py-2">
                    <span className="w-6 text-muted">F{i + 1}</span>
                    <span className="flex-1">{f.title}</span>
                    <span className="text-xs text-muted">{f.hours} h</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

function AddSubProjectModal({ projectId, onClose }) {
  const { addSubProject } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  return (
    <Modal
      open
      onClose={onClose}
      title="Add sub-project"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!name.trim()}
            onClick={() => {
              addSubProject(projectId, { name: name.trim(), description: description.trim() });
              onClose();
            }}
          >
            Add
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Name" required>
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Finance Team App" />
        </Field>
        <Field label="Description">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}

function AddFeatureModal({ project, subProjects, features, onClose }) {
  const { addFeature } = useApp();
  const nextAmd = `SOW-AMD-${String(project.amendments.length + 1).padStart(2, '0')}`;
  const [form, setForm] = useState({
    subProjectId: subProjects[0]?.id ?? '',
    title: '',
    description: '',
    hours: '',
    isAmendment: features.length > 0,
    amendmentRef: nextAmd,
    amendmentNote: '',
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const nextCode = `F${features.filter((f) => f.subProjectId === form.subProjectId).length + 1}`;
  const valid = form.subProjectId && form.title.trim() && Number(form.hours) > 0 && (!form.isAmendment || form.amendmentRef.trim());

  return (
    <Modal
      open
      size="lg"
      onClose={onClose}
      title="Add feature"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              addFeature(project.id, form.subProjectId, form);
              onClose();
            }}
          >
            Add {nextCode}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <Field label="Sub-project" required>
            <Select value={form.subProjectId} onChange={set('subProjectId')}>
              {subProjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Hours" required>
            <Input type="number" min={1} value={form.hours} onChange={set('hours')} />
          </Field>
        </div>
        <Field label="Title" required>
          <Input value={form.title} onChange={set('title')} placeholder="e.g. Vendor payment tracking" />
        </Field>
        <Field label="Description">
          <Textarea value={form.description} onChange={set('description')} />
        </Field>
        <label className="flex items-start gap-2.5 text-sm">
          <input type="checkbox" checked={form.isAmendment} onChange={set('isAmendment')} className="mt-0.5 h-4 w-4 accent-accent" />
          <span>
            <span className="font-medium">Added after the SOW was signed (SOW amendment)</span>
            <span className="block text-xs text-muted">The feature gets an Amendment tag.</span>
          </span>
        </label>
        {form.isAmendment && (
          <Field label="Amendment reference" required>
            <Input value={form.amendmentRef} onChange={set('amendmentRef')} className="max-w-48" />
          </Field>
        )}
      </div>
    </Modal>
  );
}

const FILTERS = {
  all: () => true,
  mine: (f, role) => needsRole(role, f.status),
  internal: (f) => STAGE[f.status] === 'internal',
  client: (f) => STAGE[f.status] === 'client',
  approved: (f) => STAGE[f.status] === 'approved',
};

export default function ProjectView() {
  const { projectId } = useParams();
  const { role, projects, subProjects, features } = useApp();
  const project = projects.find((p) => p.id === projectId);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);

  if (!project) return <EmptyState icon={SearchX} title="Project not found" />;

  const sps = subProjects.filter((s) => s.projectId === projectId);
  const pf = features.filter((f) => f.projectId === projectId);
  const q = query.trim().toLowerCase();
  const visible = pf.filter((f) => FILTERS[filter](f, role) && (!q || `${f.code} ${f.title}`.toLowerCase().includes(q)));
  const isSales = role === 'sales';
  const countOf = (key) => pf.filter((f) => FILTERS[key](f, role)).length;

  const tabs = [
    { key: 'all', label: 'All', count: pf.length },
    ...(isSales ? [] : [{ key: 'mine', label: 'Needs you', count: countOf('mine') }]),
    { key: 'internal', label: 'Internal', count: countOf('internal') },
    { key: 'client', label: 'With client', count: countOf('client') },
    { key: 'approved', label: 'Approved', count: countOf('approved') },
  ];

  return (
    <>
      <PageHeader
        title={project.name}
        description={`${project.client} · ${project.sowRef} · Client approver: ${project.clientApprover.name}`}
        actions={
          isSales &&
          sps.length > 0 && (
            <>
              <Button variant="secondary" icon={FolderPlus} onClick={() => setModal('sub')}>
                Add sub-project
              </Button>
              <Button icon={Plus} onClick={() => setModal('feature')}>
                Add feature
              </Button>
            </>
          )
        }
      />

      {sps.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileUp}
            title="No features yet"
            description={isSales ? 'Upload the signed SOW to create the features, or add them by hand.' : 'Sales has not set up this project yet.'}
            action={
              isSales && (
                <div className="flex gap-2">
                  <Button icon={FileUp} onClick={() => setModal('sow')}>
                    Upload SOW
                  </Button>
                  <Button variant="secondary" onClick={() => setModal('sub')}>
                    Add by hand
                  </Button>
                </div>
              )
            }
          />
        </Card>
      ) : (
        <>
          <Card className="mb-6 p-5">
            <ApprovalBar features={pf} />
          </Card>

          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <Tabs tabs={tabs} value={filter} onChange={setFilter} />
            <div className="relative w-full sm:w-60">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="pl-9" />
            </div>
          </div>

          {visible.length === 0 && (
            <Card>
              <EmptyState icon={SearchX} title="Nothing here" description="No features match this filter." />
            </Card>
          )}

          <div className="space-y-6">
            {sps.map((sp) => {
              const rows = visible.filter((f) => f.subProjectId === sp.id);
              if (!rows.length && (filter !== 'all' || q)) return null;
              return (
                <section key={sp.id}>
                  <h2 className="mb-2 text-sm font-semibold">{sp.name}</h2>
                  <Card>
                    {rows.length ? (
                      <ul className="divide-y divide-line">
                        {rows.map((f) => (
                          <li key={f.id}>
                            <Link to={`/projects/${projectId}/features/${f.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-subtle">
                              <span className="w-7 text-sm font-medium text-muted">{f.code}</span>
                              <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-sm">
                                <span className="font-medium">{f.title}</span>
                                {f.version > 1 && <Tag>v{f.version}</Tag>}
                                {f.isAmendment && <AmendmentTag refId={f.amendmentRef} />}
                              </span>
                              <span className="hidden w-14 text-right text-sm tabular-nums text-muted sm:block">{f.hours} h</span>
                              <span className="flex w-40 justify-end">
                                <StatusBadge status={f.status} />
                              </span>
                              <ChevronRight className={cx('h-4 w-4 text-faint')} />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="px-5 py-5 text-sm text-muted">No features yet.</p>
                    )}
                  </Card>
                </section>
              );
            })}
          </div>
        </>
      )}

      {modal === 'sow' && <UploadSowModal project={project} onClose={() => setModal(null)} />}
      {modal === 'sub' && <AddSubProjectModal projectId={projectId} onClose={() => setModal(null)} />}
      {modal === 'feature' && <AddFeatureModal project={project} subProjects={sps} features={pf} onClose={() => setModal(null)} />}
    </>
  );
}
