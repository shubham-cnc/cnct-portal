// Feature statuses with short, plain labels. `tone` picks the badge colour.
export const STATUSES = {
  draft: { label: 'Draft', tone: 'gray' },
  docs_uploaded: { label: 'Docs uploaded', tone: 'gray' },
  pending_internal: { label: 'Internal review', tone: 'amber' },
  rejected: { label: 'Changes requested', tone: 'red' },
  internally_approved: { label: 'Internally approved', tone: 'teal' },
  pending_client: { label: 'Client review', tone: 'violet' },
  client_rejected: { label: 'Client rejected', tone: 'red' },
  evidence_pending: { label: 'Evidence review', tone: 'amber' },
  client_approved: { label: 'Client approved', tone: 'green' },
  sent_to_dev: { label: 'In development', tone: 'indigo' },
  superseded: { label: 'Superseded', tone: 'gray' },
};

export const TONES = {
  gray: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
  amber: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  red: 'bg-red-500/10 text-red-700 dark:text-red-300',
  teal: 'bg-teal-500/10 text-teal-700 dark:text-teal-300',
  violet: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
  green: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  indigo: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
};

// Which stage of the journey each status belongs to. Used for filters and the tracker.
export const STAGE = {
  draft: 'internal',
  docs_uploaded: 'internal',
  pending_internal: 'internal',
  rejected: 'internal',
  internally_approved: 'internal',
  pending_client: 'client',
  client_rejected: 'client',
  evidence_pending: 'client',
  client_approved: 'approved',
  sent_to_dev: 'approved',
};

export const isApproved = (status) => STAGE[status] === 'approved';

// The 4-step tracker shown on a feature.
export const STEPS = ['Documents', 'Internal approval', 'Client approval', 'Development'];

export function stepState(status) {
  const map = {
    draft: [0, 'current'],
    docs_uploaded: [0, 'current'],
    pending_internal: [1, 'current'],
    rejected: [1, 'error'],
    internally_approved: [2, 'current'],
    pending_client: [2, 'current'],
    client_rejected: [2, 'error'],
    evidence_pending: [2, 'current'],
    client_approved: [3, 'current'],
    sent_to_dev: [4, 'done'],
  };
  const [index, state] = map[status] ?? [0, 'current'];
  return { index, state };
}

// Every action a user can take on a feature: who, from which status, to which status.
export const ACTIONS = {
  upload_docs: {
    label: 'Upload documents',
    roles: ['pm'],
    from: ['draft', 'docs_uploaded', 'rejected', 'client_rejected'],
    to: 'docs_uploaded',
    variant: 'secondary',
  },
  submit_internal: {
    label: 'Submit for internal approval',
    roles: ['pm'],
    from: ['docs_uploaded'],
    to: 'pending_internal',
    variant: 'primary',
  },
  // Internal approval sends the feature straight to the client portal.
  internal_approve: {
    label: 'Approve',
    roles: ['approver'],
    from: ['pending_internal'],
    to: 'pending_client',
    variant: 'success',
  },
  internal_reject: {
    label: 'Reject',
    roles: ['approver'],
    from: ['pending_internal'],
    to: 'rejected',
    variant: 'danger',
  },
  // Only for features saved before approval sent them to the client automatically.
  send_client: {
    label: 'Send to client',
    roles: ['pm'],
    from: ['internally_approved'],
    to: 'pending_client',
    variant: 'primary',
  },
  client_approve: {
    label: 'Approve',
    roles: ['client'],
    from: ['pending_client'],
    to: 'client_approved',
    variant: 'success',
  },
  client_reject: {
    label: 'Reject',
    roles: ['client'],
    from: ['pending_client'],
    to: 'client_rejected',
    variant: 'danger',
  },
  upload_evidence: {
    label: 'Upload client evidence',
    roles: ['pm'],
    from: ['pending_client'],
    to: 'evidence_pending',
    variant: 'secondary',
  },
  accept_evidence: {
    label: 'Accept evidence',
    roles: ['approver'],
    from: ['evidence_pending'],
    to: 'client_approved',
    variant: 'success',
  },
  reject_evidence: {
    label: 'Reject evidence',
    roles: ['approver'],
    from: ['evidence_pending'],
    to: 'pending_client',
    variant: 'danger',
  },
  send_redmine: {
    label: 'Send to Redmine',
    roles: ['pm'],
    from: ['client_approved'],
    to: 'sent_to_dev',
    variant: 'primary',
  },
  amend: {
    label: 'Amend feature',
    roles: ['pm', 'sales'],
    from: ['internally_approved', 'pending_client', 'client_rejected', 'client_approved', 'sent_to_dev'],
    to: 'draft',
    variant: 'ghost',
  },
};

export function availableActions(role, status) {
  return Object.entries(ACTIONS)
    .filter(([, a]) => a.roles.includes(role) && a.from.includes(status))
    .map(([key, a]) => ({ key, ...a }));
}

// True when the role has a real workflow step to take (amending doesn't count).
export const needsRole = (role, status) => availableActions(role, status).some((a) => a.key !== 'amend');

// What the person who can act should do next, in plain words.
const TODO = {
  draft: 'Upload the functional document for this feature.',
  docs_uploaded: 'Documents are attached. Submit them for internal approval.',
  pending_internal: 'Review the documents, then approve or reject. Approving sends the feature to the client.',
  rejected: 'The internal approver asked for changes. Upload revised documents.',
  internally_approved: 'Approved internally. Send it to the client for approval.',
  pending_client: 'Review this feature, then approve or reject it.',
  client_rejected: 'The client asked for changes. Upload revised documents, or amend the feature.',
  evidence_pending: 'Check the client’s offline approval and accept or reject it.',
  client_approved: 'The client approved this. Send it to Redmine to start development.',
};

const WAITING = {
  draft: 'the Project Manager to upload documents',
  docs_uploaded: 'the Project Manager to submit for internal approval',
  pending_internal: 'the Internal Approver to review',
  rejected: 'the Project Manager to revise the documents',
  internally_approved: 'the Project Manager to send it to the client',
  pending_client: 'the client to approve',
  client_rejected: 'the Project Manager to revise or amend',
  evidence_pending: 'the Internal Approver to check the client evidence',
  client_approved: 'the Project Manager to send it to Redmine',
};

export function nextStep(role, status) {
  if (status === 'sent_to_dev') return { mine: false, text: 'Approved and in development. Nothing left to do.' };
  if (needsRole(role, status)) {
    if (role === 'pm' && status === 'pending_client') {
      return { mine: true, text: 'Waiting for the client. If they approved by email, WhatsApp or in a meeting, upload the proof.' };
    }
    return { mine: true, text: TODO[status] };
  }
  return { mine: false, text: `Waiting for ${WAITING[status]}.` };
}

// Short label for the main thing a role should do, used in to-do lists.
export function primaryActionLabel(role, status) {
  const a = availableActions(role, status).filter((x) => x.key !== 'amend');
  if (!a.length) return null;
  if (a.some((x) => x.key === 'internal_approve' || x.key === 'client_approve' || x.key === 'accept_evidence')) return 'Review';
  return a.find((x) => x.variant === 'primary')?.label ?? a[0].label;
}

// Approving requires opening these documents first: the feature docs on the
// current version, or the latest evidence file when accepting evidence.
export function docsToReview(feature, actionKey) {
  const current = feature.documents.filter((d) => d.version === feature.version);
  if (actionKey === 'internal_approve' || actionKey === 'client_approve') return current.filter((d) => d.kind === 'doc');
  if (actionKey === 'accept_evidence') return current.filter((d) => d.kind === 'evidence' && d.name === feature.pendingEvidence?.file).slice(-1);
  return [];
}
