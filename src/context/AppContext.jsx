import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as seed from '../data/mockData';
import { ACTIONS } from '../lib/workflow';
import { uid } from '../lib/format';
import { useToast } from './ToastContext';

const AppContext = createContext(null);

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// Bump the version when the seed data shape changes, so old saved data is ignored.
const STORAGE_KEY = 'signoff-demo-v2';

const SEED = {
  role: 'pm',
  projects: seed.projects,
  subProjects: seed.subProjects,
  features: seed.features,
  nextRedmineId: seed.NEXT_REDMINE_ID,
  viewed: {},
};

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...SEED, ...JSON.parse(raw) } : SEED;
  } catch {
    return SEED;
  }
}

function save(data) {
  try {
    // blob: URLs of locally picked files die with the page, so they are not saved.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data, (key, value) => (key === 'url' ? undefined : value)));
  } catch {
    // Storage full or blocked: the demo keeps working in memory.
  }
}

export function AppProvider({ children }) {
  const toast = useToast();
  const [saved] = useState(loadSaved);
  const [role, setRole] = useState(saved.role);
  const [projects, setProjects] = useState(saved.projects);
  const [subProjects, setSubProjects] = useState(saved.subProjects);
  const [features, setFeatures] = useState(saved.features);
  const [nextRedmineId, setNextRedmineId] = useState(saved.nextRedmineId);
  // Document ids each role has opened in the viewer, e.g. { client: ['doc-1'] }.
  const [viewed, setViewed] = useState(saved.viewed);

  useEffect(() => {
    save({ role, projects, subProjects, features, nextRedmineId, viewed });
  }, [role, projects, subProjects, features, nextRedmineId, viewed]);

  const resetDemo = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore: state below is reset either way.
    }
    setRole(SEED.role);
    setProjects(SEED.projects);
    setSubProjects(SEED.subProjects);
    setFeatures(SEED.features);
    setNextRedmineId(SEED.nextRedmineId);
    setViewed(SEED.viewed);
    toast('Demo data reset', { description: 'Everything is back to the starting data.' });
  }, [toast]);

  const user = seed.USERS[role];

  const event = useCallback(
    (action, version, comment = '', kind = 'note') => ({
      id: uid('ev'),
      at: new Date().toISOString(),
      actor: user.name,
      role,
      action,
      version,
      comment,
      kind,
    }),
    [user, role],
  );

  const updateFeature = (id, fn) => setFeatures((list) => list.map((f) => (f.id === id ? fn(f) : f)));

  // Runs one workflow action on a feature: status change + audit entry + toast.
  const runAction = useCallback(
    (featureId, key, payload = {}) => {
      const feature = features.find((f) => f.id === featureId);
      const def = ACTIONS[key];
      if (!feature || !def || !def.roles.includes(role) || !def.from.includes(feature.status)) {
        toast('That action is not available', { type: 'error' });
        return;
      }
      const v = feature.version;
      const now = new Date().toISOString();
      const comment = payload.comment?.trim() ?? '';
      let patch = { status: def.to };
      let entry;
      let extra = null;
      let message;

      switch (key) {
        case 'upload_docs': {
          const docs = payload.files.map((file) => ({
            id: uid('doc'),
            name: file.name,
            size: file.size,
            url: file.url,
            local: file.local,
            uploadedBy: user.name,
            uploadedAt: now,
            version: v,
            kind: 'doc',
          }));
          patch.documents = [...feature.documents, ...docs];
          const names = docs.map((d) => d.name).join(', ');
          entry = event(`Uploaded ${plural(docs.length, 'document')}`, v, comment ? `${names}. ${comment}` : names, 'upload');
          message = `${plural(docs.length, 'document')} attached to ${feature.code}`;
          break;
        }
        case 'submit_internal':
          entry = event('Submitted for internal approval', v, comment, 'submit');
          message = `${feature.code} sent to the internal approval queue`;
          break;
        case 'internal_approve':
          entry = event('Approved internally', v, comment, 'approve');
          extra = event('Sent to client for approval', v, 'Sent automatically after internal approval.', 'send');
          message = `${feature.code} v${v} approved and sent to the client`;
          break;
        case 'internal_reject':
          entry = event('Rejected internally', v, comment, 'reject');
          message = `${feature.code} v${v} rejected and returned to the PM`;
          break;
        case 'send_client':
          entry = event('Sent to client for approval', v, comment, 'send');
          message = `${feature.code} is now in the client portal`;
          break;
        case 'client_approve':
          patch.clientApproval = { method: 'in_app', by: user.name, at: now };
          entry = event('Approved in client portal', v, comment, 'approve');
          message = `You approved ${feature.code} v${v}`;
          break;
        case 'client_reject':
          entry = event('Rejected in client portal', v, comment, 'reject');
          message = `You rejected ${feature.code} v${v}`;
          break;
        case 'upload_evidence': {
          patch.documents = [
            ...feature.documents,
            { id: uid('doc'), name: payload.file.name, size: payload.file.size, url: payload.file.url, local: payload.file.local, uploadedBy: user.name, uploadedAt: now, version: v, kind: 'evidence' },
          ];
          patch.pendingEvidence = {
            file: payload.file.name,
            source: payload.source,
            approvedBy: payload.approvedBy,
            approvedOn: payload.approvedOn,
            note: comment,
          };
          entry = event(
            'Uploaded client evidence',
            v,
            `${payload.source} approval by ${payload.approvedBy} on ${payload.approvedOn} (${payload.file.name}).${comment ? ` ${comment}` : ''}`,
            'evidence',
          );
          message = 'Evidence sent for internal review';
          break;
        }
        case 'accept_evidence':
          patch.clientApproval = {
            method: 'evidence',
            by: feature.pendingEvidence?.approvedBy,
            at: feature.pendingEvidence?.approvedOn,
            evidence: feature.pendingEvidence?.file,
            verifiedBy: user.name,
          };
          patch.pendingEvidence = null;
          entry = event('Accepted evidence · marked client approved', v, comment, 'approve');
          message = `${feature.code} marked client approved on evidence`;
          break;
        case 'reject_evidence':
          patch.pendingEvidence = null;
          entry = event('Rejected evidence', v, comment, 'reject');
          message = `Evidence rejected. ${feature.code} is back with the client`;
          break;
        case 'send_redmine':
          patch.redmineId = nextRedmineId;
          setNextRedmineId((n) => n + 1);
          entry = event('Sent to Redmine', v, `Redmine issue #${nextRedmineId} created.`, 'redmine');
          message = `Redmine issue #${nextRedmineId} created`;
          break;
        case 'amend': {
          const snapshot = {
            version: v,
            title: feature.title,
            description: feature.description,
            hours: feature.hours,
            finalStatus: feature.status,
            redmineId: feature.redmineId,
            clientApproval: feature.clientApproval ?? null,
            documents: feature.documents,
            supersededAt: now,
            supersededBy: user.name,
          };
          const hours = Number(payload.hours);
          const delta = hours - feature.hours;
          patch = {
            status: 'draft',
            version: v + 1,
            title: payload.title.trim(),
            description: payload.description.trim(),
            hours,
            amendmentReason: payload.reason.trim(),
            documents: [],
            redmineId: null,
            clientApproval: null,
            pendingEvidence: null,
            history: [...feature.history, snapshot],
          };
          entry = event(
            `Amended feature · v${v} → v${v + 1}`,
            v + 1,
            `Hours ${feature.hours} → ${hours} (${delta >= 0 ? '+' : ''}${delta} h). ${payload.reason.trim()}`,
            'amend',
          );
          message = `${feature.code} v${v + 1} created. Workflow restarted from Draft`;
          break;
        }
        default:
          return;
      }

      updateFeature(featureId, (f) => ({ ...f, ...patch, timeline: [...f.timeline, entry, ...(extra ? [extra] : [])] }));
      toast(message, { description: `${feature.code} · ${feature.title}`, type: key.includes('reject') ? 'info' : 'success' });
    },
    [features, role, user, event, toast, nextRedmineId],
  );

  const createProject = useCallback(
    (data) => {
      const id = uid('p');
      setProjects((list) => [
        ...list,
        {
          id,
          name: data.name,
          client: data.client,
          clientApprover: { name: data.approverName, title: data.approverTitle, email: data.approverEmail },
          sowRef: data.sowRef,
          sowFile: null,
          signedOn: data.signedOn ? new Date(data.signedOn).toISOString() : new Date().toISOString(),
          createdBy: user.name,
          createdAt: new Date().toISOString(),
          amendments: [],
        },
      ]);
      toast('Project created', { description: data.name });
      return id;
    },
    [user, toast],
  );

  const newFeature = (projectId, subProjectId, code, data, firstEvent) => ({
    id: uid('f'),
    projectId,
    subProjectId,
    code,
    title: data.title,
    description: data.description,
    hours: Number(data.hours),
    version: 1,
    status: 'draft',
    redmineId: null,
    isAmendment: !!data.isAmendment,
    amendmentRef: data.amendmentRef || undefined,
    documents: [],
    history: [],
    timeline: [firstEvent],
  });

  const addSubProject = useCallback(
    (projectId, data) => {
      const id = uid('sp');
      setSubProjects((list) => [...list, { id, projectId, name: data.name, description: data.description }]);
      toast('Sub-project added', { description: data.name });
      return id;
    },
    [toast],
  );

  const addFeature = useCallback(
    (projectId, subProjectId, data) => {
      const project = projects.find((p) => p.id === projectId);
      const count = features.filter((f) => f.subProjectId === subProjectId).length;
      const code = `F${count + 1}`;
      const first = data.isAmendment
        ? event('Added feature via SOW amendment', 1, `${data.amendmentRef}. ${data.amendmentNote || ''}`.trim(), 'create')
        : event('Created feature', 1, `Added to ${project.sowRef}.`, 'create');
      setFeatures((list) => [...list, newFeature(projectId, subProjectId, code, data, first)]);
      if (data.isAmendment) {
        setProjects((list) =>
          list.map((p) =>
            p.id === projectId && !p.amendments.some((a) => a.ref === data.amendmentRef)
              ? {
                  ...p,
                  amendments: [
                    ...p.amendments,
                    { ref: data.amendmentRef, date: new Date().toISOString(), note: `Added ${code} (${data.title}, ${data.hours} h).` },
                  ],
                }
              : p,
          ),
        );
      }
      toast(`${code} added${data.isAmendment ? ' as an SOW amendment' : ''}`, { description: data.title });
    },
    [projects, features, event, toast],
  );

  // Pretends to parse an uploaded SOW and builds the structure from the template.
  const importSow = useCallback(
    (projectId, file) => {
      const project = projects.find((p) => p.id === projectId);
      const sps = [];
      const fs = [];
      seed.sowTemplate.subProjects.forEach((sp) => {
        const spId = uid('sp');
        sps.push({ id: spId, projectId, name: sp.name, description: sp.description });
        sp.features.forEach((f, i) => {
          fs.push(
            newFeature(projectId, spId, `F${i + 1}`, f, event('Created feature from SOW', 1, `Imported from ${project.sowRef} (${file.name}).`, 'create')),
          );
        });
      });
      setSubProjects((list) => [...list, ...sps]);
      setFeatures((list) => [...list, ...fs]);
      setProjects((list) => list.map((p) => (p.id === projectId ? { ...p, sowFile: file } : p)));
      toast('SOW imported', { description: `${plural(sps.length, 'sub-project')}, ${plural(fs.length, 'feature')} created as Draft` });
    },
    [projects, event, toast],
  );

  const hasViewed = useCallback((docId) => (viewed[role] ?? []).includes(docId), [viewed, role]);

  // Records that the current role opened a document. Approvers' first views go into the audit trail.
  const markViewed = useCallback(
    (featureId, doc) => {
      if ((viewed[role] ?? []).includes(doc.id)) return;
      setViewed((v) => ({ ...v, [role]: [...(v[role] ?? []), doc.id] }));
      if (role === 'approver' || role === 'client') {
        const entry = event(`Viewed ${doc.name}`, doc.version, '', 'view');
        updateFeature(featureId, (f) => ({ ...f, timeline: [...f.timeline, entry] }));
      }
    },
    [viewed, role, event],
  );

  const value = useMemo(
    () => ({
      role,
      setRole,
      user,
      projects,
      subProjects,
      features,
      runAction,
      createProject,
      addSubProject,
      addFeature,
      importSow,
      hasViewed,
      markViewed,
      resetDemo,
    }),
    [role, user, projects, subProjects, features, runAction, createProject, addSubProject, addFeature, importSow, hasViewed, markViewed, resetDemo],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
