import { useRef, useState } from 'react';
import { ArrowRight, GitBranch, Paperclip, Upload, X } from 'lucide-react';
import { sampleEvidenceFiles } from '../data/mockData';
import { ACTIONS } from '../lib/workflow';
import { formatBytes, randomSize } from '../lib/format';
import { Button, Field, Input, Modal, Select, Tag, Textarea } from './ui';

const today = () => new Date().toISOString().slice(0, 10);

/* Reads a picked file's name and size only. Nothing is uploaded. */
function FilePicker({ onPick, multiple }) {
  const ref = useRef(null);
  return (
    <>
      <input
        ref={ref}
        type="file"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          // Keep a local object URL so the picked file can be previewed. It never leaves the browser.
          onPick([...e.target.files].map((f) => ({ name: f.name, size: formatBytes(f.size), url: URL.createObjectURL(f), local: true })));
          e.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => ref.current.click()}
        className="flex w-full flex-col items-center rounded-xl border-2 border-dashed border-line px-4 py-5 text-center hover:border-accent hover:bg-accent-soft"
      >
        <Upload className="h-5 w-5 text-faint" />
        <span className="mt-1.5 text-sm font-medium text-fg">Choose {multiple ? 'files' : 'a file'} from your computer</span>
        <span className="text-xs text-muted">Only the name and size are recorded in this demo</span>
      </button>
    </>
  );
}

function FileChips({ files, onRemove }) {
  return (
    <ul className="space-y-1.5">
      {files.map((f, i) => (
        <li key={i} className="flex items-center gap-2 rounded-lg bg-subtle px-3 py-2 text-sm ring-1 ring-inset ring-line">
          <Paperclip className="h-3.5 w-3.5 text-faint" />
          <span className="flex-1 truncate font-medium text-fg">{f.name}</span>
          <span className="text-xs text-muted">{f.size}</span>
          <button onClick={() => onRemove(i)} className="text-faint hover:text-fg" aria-label="Remove file">
            <X className="h-3.5 w-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}

export function UploadDocsModal({ feature, onClose, onSubmit }) {
  const prefix = `${feature.code}_Functional_Spec_v${feature.version}`;
  const [files, setFiles] = useState([]);
  const [comment, setComment] = useState('');
  const suggestions = [`${prefix}.pdf`, `${feature.code}_Wireframes_v${feature.version}.pdf`, `${feature.code}_Data_Fields.xlsx`].filter(
    (n) => !files.some((f) => f.name === n),
  );
  return (
    <Modal
      open
      onClose={onClose}
      title="Upload documents"
      description={`${feature.code} · ${feature.title} · v${feature.version}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!files.length} onClick={() => onSubmit({ files, comment })}>
            Attach {files.length || ''} {files.length === 1 ? 'file' : 'files'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FilePicker multiple onPick={(picked) => setFiles((f) => [...f, ...picked])} />
        {suggestions.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted">Or add a sample file</p>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((name) => (
                <button
                  key={name}
                  onClick={() => setFiles((f) => [...f, { name, size: randomSize() }])}
                  className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-fg ring-1 ring-inset ring-line hover:bg-subtle"
                >
                  + {name}
                </button>
              ))}
            </div>
          </div>
        )}
        {files.length > 0 && <FileChips files={files} onRemove={(i) => setFiles((f) => f.filter((_, j) => j !== i))} />}
        <Field label="Note (optional)">
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="e.g. Revised per Arjun's comments on in-transit stock." />
        </Field>
      </div>
    </Modal>
  );
}

export function EvidenceModal({ feature, approver, onClose, onSubmit }) {
  const [file, setFile] = useState(null);
  const [source, setSource] = useState('Email');
  const [approvedBy, setApprovedBy] = useState(approver?.name ?? '');
  const [approvedOn, setApprovedOn] = useState(today());
  const [comment, setComment] = useState('');
  const valid = file && approvedBy.trim() && approvedOn && comment.trim();
  return (
    <Modal
      open
      onClose={onClose}
      title="Upload client approval evidence"
      description="Use this when the client approved outside the portal. An internal approver must verify it before the feature counts as client approved."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!valid} onClick={() => onSubmit({ file, source, approvedBy, approvedOn, comment })}>
            Submit for verification
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-subtle px-3.5 py-2.5 text-sm ring-1 ring-inset ring-line">
          <span className="font-medium text-fg">
            {feature.code} · {feature.title}
          </span>{' '}
          <Tag>v{feature.version}</Tag> <span className="text-muted">· {feature.hours} h</span>
        </div>
        {file ? (
          <FileChips files={[file]} onRemove={() => setFile(null)} />
        ) : (
          <>
            <FilePicker onPick={([f]) => setFile(f)} />
            <div className="flex flex-wrap gap-1.5">
              {sampleEvidenceFiles.map((name) => (
                <button
                  key={name}
                  onClick={() => setFile({ name, size: randomSize() })}
                  className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-fg ring-1 ring-inset ring-line hover:bg-subtle"
                >
                  + {name}
                </button>
              ))}
            </div>
          </>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Approved via" required>
            <Select value={source} onChange={(e) => setSource(e.target.value)}>
              <option>Email</option>
              <option>WhatsApp</option>
              <option>Meeting minutes</option>
              <option>Phone call (recorded)</option>
            </Select>
          </Field>
          <Field label="Approval date" required>
            <Input type="date" value={approvedOn} onChange={(e) => setApprovedOn(e.target.value)} />
          </Field>
        </div>
        <Field label="Approved by" required hint={approver ? `Authorised approver on the SOW: ${approver.name} (${approver.email})` : undefined}>
          <Input value={approvedBy} onChange={(e) => setApprovedBy(e.target.value)} />
        </Field>
        <Field label="Context" required>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Where and how the client approved, and what exactly they approved." />
        </Field>
      </div>
    </Modal>
  );
}

const DECISION_COPY = {
  submit_internal: { title: 'Submit for internal approval', confirm: 'Submit', comment: 'Note for the approver (optional)' },
  internal_approve: {
    title: 'Approve internally',
    confirm: 'Approve and send to client',
    comment: 'Comment (optional)',
    note: 'The client will see this feature in their portal straight away.',
  },
  internal_reject: { title: 'Reject feature documents', confirm: 'Reject', comment: 'What needs to change?', required: true },
  send_client: { title: 'Send to client for approval', confirm: 'Send to client', comment: 'Message to the client (optional)' },
  client_approve: { title: 'Approve feature', confirm: 'Approve', comment: 'Comment (optional)', attest: true },
  client_reject: { title: 'Reject feature', confirm: 'Reject', comment: 'Reason for rejection', required: true },
  accept_evidence: { title: 'Accept client evidence', confirm: 'Accept and mark client approved', comment: 'Verification note (optional)' },
  reject_evidence: { title: 'Reject client evidence', confirm: 'Reject evidence', comment: 'Why is this evidence not sufficient?', required: true },
  send_redmine: { title: 'Send to Redmine', confirm: 'Create Redmine issue', comment: null },
};

/* Confirmation dialog with an optional or required comment. */
export function DecisionModal({ actionKey, feature, user, clientName, onClose, onSubmit }) {
  const copy = DECISION_COPY[actionKey];
  const def = ACTIONS[actionKey];
  const [comment, setComment] = useState('');
  const [attested, setAttested] = useState(false);
  const blocked = (copy.required && !comment.trim()) || (copy.attest && !attested);
  const danger = actionKey.includes('reject');
  return (
    <Modal
      open
      onClose={onClose}
      title={copy.title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={danger ? 'dangerSolid' : def.variant === 'success' ? 'success' : 'primary'} disabled={blocked} onClick={() => onSubmit({ comment })}>
            {copy.confirm}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-subtle p-3.5 ring-1 ring-inset ring-line">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-fg">{feature.code}</span>
            <span className="text-fg">{feature.title}</span>
            <Tag>v{feature.version}</Tag>
          </div>
          <p className="mt-1 text-xs text-muted">
            {feature.hours} h · {feature.documents.filter((d) => d.version === feature.version).length} documents on this version
          </p>
          {actionKey === 'accept_evidence' && feature.pendingEvidence && (
            <p className="mt-2 text-xs text-muted">
              {feature.pendingEvidence.source} approval by <b>{feature.pendingEvidence.approvedBy}</b> on {feature.pendingEvidence.approvedOn} ·{' '}
              {feature.pendingEvidence.file}
            </p>
          )}
        </div>

        {copy.note && <p className="text-sm text-muted">{copy.note}</p>}

        {actionKey === 'send_redmine' && (
          <div className="flex items-center gap-3 rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-3.5 text-sm">
            <GitBranch className="h-5 w-5 shrink-0 text-indigo-500" />
            <p>
              A Redmine issue will be created with the approved v{feature.version} spec and {feature.hours} estimated hours. The status changes to{' '}
              <b>Sent to Development</b>.
            </p>
          </div>
        )}

        {copy.comment && (
          <Field label={copy.comment} required={copy.required}>
            <Textarea autoFocus value={comment} onChange={(e) => setComment(e.target.value)} />
          </Field>
        )}

        {copy.attest && (
          <label className="flex items-start gap-2.5 rounded-lg border border-line p-3 text-sm text-fg">
            <input type="checkbox" checked={attested} onChange={(e) => setAttested(e.target.checked)} className="mt-0.5 h-4 w-4 accent-accent" />
            <span>
              I, <b>{user.name}</b>, approve {feature.code} v{feature.version} ({feature.hours} h) as documented above, on behalf of{' '}
              {clientName}. This approval is recorded with my name and the time.
            </span>
          </label>
        )}
      </div>
    </Modal>
  );
}

/* Feature amendment: creates the next version and restarts the workflow. */
export function AmendmentModal({ feature, onClose, onSubmit }) {
  const [title, setTitle] = useState(feature.title);
  const [description, setDescription] = useState(feature.description);
  const [hours, setHours] = useState(feature.hours);
  const [reason, setReason] = useState('');
  const delta = Number(hours) - feature.hours;
  const valid = title.trim() && description.trim() && Number(hours) > 0 && reason.trim();
  return (
    <Modal
      open
      size="lg"
      onClose={onClose}
      title={`Amend ${feature.code} · create v${feature.version + 1}`}
      description={`v${feature.version} becomes read-only. v${feature.version + 1} starts again at Draft and needs internal and client approval.`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!valid} onClick={() => onSubmit({ title, description, hours, reason })}>
            Create v{feature.version + 1}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Feature title" required>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Description" required>
          <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-[160px_1fr] sm:items-end">
          <Field label="Estimated hours" required>
            <Input type="number" min={1} value={hours} onChange={(e) => setHours(e.target.value)} />
          </Field>
          <div className="flex h-[38px] items-center gap-2 text-sm text-muted">
            <span className="font-medium">{feature.hours} h</span>
            <ArrowRight className="h-4 w-4 text-faint" />
            <span className="font-medium text-fg">{Number(hours) || 0} h</span>
            {delta !== 0 && (
              <span className={delta > 0 ? 'rounded bg-amber-500/15 px-1.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300' : 'rounded bg-emerald-500/15 px-1.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300'}>
                {delta > 0 ? '+' : ''}
                {delta} h
              </span>
            )}
          </div>
        </div>
        <Field label="Reason for amendment" required hint="Shown to the internal approver and the client.">
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Client needs to raise POs for GST-exempt vendors." />
        </Field>
      </div>
    </Modal>
  );
}
