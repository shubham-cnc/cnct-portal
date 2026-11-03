import { useState } from 'react';
import { Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { availableActions, docsToReview } from '../lib/workflow';
import { AmendmentModal, DecisionModal, EvidenceModal, UploadDocsModal } from './ActionModals';
import { DocButton } from './DocumentViewer';
import { Button } from './ui';

const APPROVE_KEYS = ['internal_approve', 'client_approve', 'accept_evidence'];

/*
 * Renders only the buttons valid for the current role and the feature's status,
 * and opens the matching modal. `only` limits which actions are shown.
 * Approving is locked until every document to review has been opened.
 */
export function FeatureActions({ feature, only, size = 'md' }) {
  const { role, user, projects, runAction, hasViewed } = useApp();
  const [active, setActive] = useState(null);
  const project = projects.find((p) => p.id === feature.projectId);

  const actions = availableActions(role, feature.status).filter((a) => !only || only.includes(a.key));
  if (!actions.length) return null;

  const approveKey = actions.find((a) => APPROVE_KEYS.includes(a.key))?.key;
  const toReview = approveKey ? docsToReview(feature, approveKey) : [];
  const unread = toReview.filter((d) => !hasViewed(d.id));
  const locked = unread.length > 0;

  const close = () => setActive(null);
  const submit = (payload) => {
    runAction(feature.id, active, payload);
    close();
  };

  return (
    <>
      {toReview.length > 0 && (
        <div className="mb-3">
          <p className="mb-2 text-xs font-medium text-muted">
            Read before approving · {toReview.length - unread.length} of {toReview.length} opened
          </p>
          <div className="space-y-1.5">
            {toReview.map((d) => (
              <DocButton key={d.id} doc={d} feature={feature} list={toReview} />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {actions.map((a) => {
          const disabled = locked && APPROVE_KEYS.includes(a.key);
          return (
            <Button
              key={a.key}
              size={size}
              variant={a.variant}
              disabled={disabled}
              title={disabled ? 'Open every document first' : undefined}
              onClick={() => setActive(a.key)}
            >
              {a.label}
            </Button>
          );
        })}
      </div>

      {locked && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
          <Eye className="h-3.5 w-3.5" />
          Open {toReview.length === 1 ? 'the document' : 'every document'} to unlock {actions.find((a) => a.key === approveKey).label}.
        </p>
      )}

      {active === 'upload_docs' && <UploadDocsModal feature={feature} onClose={close} onSubmit={submit} />}
      {active === 'upload_evidence' && <EvidenceModal feature={feature} approver={project?.clientApprover} onClose={close} onSubmit={submit} />}
      {active === 'amend' && <AmendmentModal feature={feature} onClose={close} onSubmit={submit} />}
      {active && !['upload_docs', 'upload_evidence', 'amend'].includes(active) && (
        <DecisionModal actionKey={active} feature={feature} user={user} clientName={project?.client} onClose={close} onSubmit={submit} />
      )}
    </>
  );
}
