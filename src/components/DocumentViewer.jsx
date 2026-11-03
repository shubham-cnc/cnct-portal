import { createContext, useCallback, useContext, useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Eye, FileText, Paperclip } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { USERS } from '../data/mockData';
import { cx, formatDate } from '../lib/format';
import { Button, Modal } from './ui';

const ViewerContext = createContext(null);

/*
 * Holds the open document and renders the viewer modal.
 * openDoc(doc, feature, list) — `feature` supplies the content for generated previews,
 * `list` lets the viewer step through sibling documents.
 */
export function DocumentViewerProvider({ children }) {
  const { markViewed } = useApp();
  const [state, setState] = useState(null);

  const show = useCallback(
    (list, index, feature) => {
      setState({ list, index, feature });
      markViewed(feature.id, list[index]);
    },
    [markViewed],
  );

  const openDoc = useCallback((doc, feature, list = [doc]) => show(list, Math.max(0, list.findIndex((d) => d.id === doc.id)), feature), [show]);

  return (
    <ViewerContext.Provider value={openDoc}>
      {children}
      {state && <ViewerModal {...state} onClose={() => setState(null)} onStep={(i) => show(state.list, i, state.feature)} />}
    </ViewerContext.Provider>
  );
}

export const useDocViewer = () => useContext(ViewerContext);

function ViewerModal({ list, index, feature, onClose, onStep }) {
  const { role } = useApp();
  const doc = list[index];
  const logged = role === 'approver' || role === 'client';
  return (
    <Modal
      open
      size="xl"
      onClose={onClose}
      title={doc.name}
      description={`${doc.size} · v${doc.version} · uploaded by ${doc.uploadedBy} on ${formatDate(doc.uploadedAt)}`}
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            {logged ? 'Marked as viewed and recorded in History' : 'Marked as viewed'}
          </p>
          <div className="flex items-center gap-2">
            {list.length > 1 && (
              <>
                <Button variant="secondary" size="sm" icon={ChevronLeft} disabled={index === 0} onClick={() => onStep(index - 1)} aria-label="Previous document" />
                <span className="text-xs tabular-nums text-muted">
                  {index + 1} of {list.length}
                </span>
                <Button variant="secondary" size="sm" icon={ChevronRight} disabled={index === list.length - 1} onClick={() => onStep(index + 1)} aria-label="Next document" />
              </>
            )}
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      }
    >
      <div className="max-h-[65vh] overflow-y-auto rounded-lg bg-subtle p-4 sm:p-6">
        <Preview doc={doc} feature={feature} />
      </div>
    </Modal>
  );
}

const isImage = (name) => /\.(png|jpe?g|gif|webp)$/i.test(name);
const isSheet = (name) => /\.(xlsx?|csv)$/i.test(name);
const isPdf = (name) => /\.pdf$/i.test(name);

function Preview({ doc, feature }) {
  // A file picked from the user's computer during the demo: show the real thing.
  if (doc.url && isPdf(doc.name)) return <iframe title={doc.name} src={doc.url} className="h-[60vh] w-full rounded bg-white" />;
  if (doc.url && isImage(doc.name)) return <img src={doc.url} alt={doc.name} className="mx-auto max-h-[60vh] rounded" />;
  if (doc.local) {
    return (
      <Paper>
        <p className="text-center text-sm text-slate-500">
          This file was picked from your computer in an earlier session. The demo saves only its name and size, so the preview is no longer available.
        </p>
      </Paper>
    );
  }

  if (doc.kind === 'evidence') return isImage(doc.name) ? <ChatEvidence feature={feature} /> : <EmailEvidence doc={doc} feature={feature} />;
  if (isImage(doc.name)) return <FlowDiagram feature={feature} />;
  if (isSheet(doc.name)) return <SheetPreview feature={feature} />;
  if (doc.url) {
    return (
      <Paper>
        <p className="text-center text-sm text-slate-500">No preview for this file type. In the real product it would open in a new tab.</p>
      </Paper>
    );
  }
  return <SpecPreview doc={doc} feature={feature} />;
}

// Documents keep a white "paper" look in both themes, like a real file.
function Paper({ children }) {
  return <div className="mx-auto max-w-2xl rounded bg-white px-8 py-10 text-slate-800 shadow-sm ring-1 ring-black/5">{children}</div>;
}

function useFeatureContext(feature) {
  const { projects, subProjects } = useApp();
  return {
    project: projects.find((p) => p.id === feature.projectId),
    sp: subProjects.find((s) => s.id === feature.subProjectId),
  };
}

const sentences = (text) => text.split(/(?<=\.)\s+/).filter(Boolean);

function SpecPreview({ doc, feature }) {
  const { project, sp } = useFeatureContext(feature);
  return (
    <Paper>
      <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Functional specification</p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-900">
        {feature.code} · {feature.title}
      </h2>
      <table className="mt-5 w-full text-sm">
        <tbody className="[&_td]:py-1 [&_td:first-child]:w-36 [&_td:first-child]:text-slate-500">
          <tr><td>Project</td><td>{project?.name}</td></tr>
          <tr><td>Module</td><td>{sp?.name}</td></tr>
          <tr><td>Client</td><td>{project?.client}</td></tr>
          <tr><td>Version</td><td>v{doc.version} · {formatDate(doc.uploadedAt)}</td></tr>
          <tr><td>Prepared by</td><td>{doc.uploadedBy}</td></tr>
        </tbody>
      </table>

      <Section n="1" title="Overview">
        <p>{feature.description}</p>
      </Section>
      <Section n="2" title="What will be built">
        <ul className="list-disc space-y-1 pl-5">
          {sentences(feature.description).map((s) => (
            <li key={s}>{s}</li>
          ))}
          <li>Screens, validations and error messages for the flows above.</li>
        </ul>
      </Section>
      <Section n="3" title="Not included">
        <p>Anything not listed in section 2. New requirements need a feature amendment or an SOW amendment.</p>
      </Section>
      <Section n="4" title="Acceptance criteria">
        <ul className="list-disc space-y-1 pl-5">
          <li>Every flow in section 2 works end to end on staging.</li>
          <li>Data entered is saved, visible in reports and included in exports.</li>
          <li>Users without permission cannot see or change this data.</li>
        </ul>
      </Section>
      {feature.amendmentReason && doc.version > 1 && (
        <Section n="5" title={`Changes in v${doc.version}`}>
          <p>{feature.amendmentReason}</p>
        </Section>
      )}
      <Section n={feature.amendmentReason && doc.version > 1 ? '6' : '5'} title="Estimate">
        <p>
          <b>{feature.hours} hours</b> of design, development and testing.
        </p>
      </Section>
      <div className="mt-10 grid grid-cols-2 gap-8 border-t border-slate-200 pt-6 text-xs text-slate-500">
        <p>Approved by CNCT: ____________________</p>
        <p>Approved by client: ____________________</p>
      </div>
    </Paper>
  );
}

function Section({ n, title, children }) {
  return (
    <section className="mt-6 text-sm leading-relaxed">
      <h3 className="mb-1.5 font-semibold text-slate-900">
        {n}. {title}
      </h3>
      {children}
    </section>
  );
}

function EmailEvidence({ doc, feature }) {
  const { project } = useFeatureContext(feature);
  const approver = project?.clientApprover;
  const ev = feature.pendingEvidence ?? (feature.clientApproval?.evidence === doc.name ? { approvedOn: feature.clientApproval.at } : null);
  return (
    <Paper>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <Paperclip className="h-3.5 w-3.5" /> Email (exported as PDF)
      </div>
      <dl className="mt-4 space-y-1 border-b border-slate-200 pb-4 text-sm [&_dt]:inline [&_dt]:text-slate-500 [&_dd]:inline">
        <div><dt>From: </dt><dd>{approver?.name} &lt;{approver?.email}&gt;</dd></div>
        <div><dt>To: </dt><dd>{USERS.pm.name} &lt;priya.nair@cnct.in&gt;</dd></div>
        <div><dt>Date: </dt><dd>{formatDate(ev?.approvedOn ?? doc.uploadedAt)}</dd></div>
        <div><dt>Subject: </dt><dd className="font-medium">Re: Approval needed: {feature.code} {feature.title} (v{feature.version})</dd></div>
      </dl>
      <div className="mt-5 space-y-3 text-sm leading-relaxed">
        <p>Hi Priya,</p>
        <p>
          I've gone through the document for <b>{feature.code} {feature.title}</b> (v{feature.version}, {feature.hours} hours). This is approved from our
          side. Please go ahead.
        </p>
        <p>
          Regards,
          <br />
          {approver?.name}
          <br />
          {approver?.title}, {project?.client}
        </p>
      </div>
    </Paper>
  );
}

function ChatEvidence({ feature }) {
  const { project } = useFeatureContext(feature);
  return (
    <div className="mx-auto max-w-sm rounded-xl bg-[#e5ddd5] p-4 text-sm text-slate-900">
      <p className="mb-3 text-center text-xs text-slate-600">WhatsApp · {project?.clientApprover.name}</p>
      <div className="ml-auto mb-2 w-fit max-w-[85%] rounded-lg bg-[#dcf8c6] px-3 py-2">
        Hi sir, sharing the doc for {feature.code} {feature.title}. Please confirm if approved.
      </div>
      <div className="w-fit max-w-[85%] rounded-lg bg-white px-3 py-2">Checked it. Approved, go ahead 👍</div>
    </div>
  );
}

function FlowDiagram({ feature }) {
  const steps = ['User opens screen', 'Enters details', feature.title, 'Manager reviews', 'Saved and visible in reports'];
  return (
    <Paper>
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">Flow · {feature.code}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span className={cx('rounded-lg border px-3 py-2 text-xs font-medium', i === 2 ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-slate-300')}>{s}</span>
            {i < steps.length - 1 && <ArrowRight className="h-4 w-4 text-slate-400" />}
          </div>
        ))}
      </div>
    </Paper>
  );
}

function SheetPreview({ feature }) {
  const rows = [
    ['Reference no.', 'Auto number', 'Yes'],
    ['Date', 'Date', 'Yes'],
    ['Site / location', 'Dropdown', 'Yes'],
    ['Item', 'Dropdown', 'Yes'],
    ['Quantity', 'Number', 'Yes'],
    ['Remarks', 'Text', 'No'],
    ['Attachment', 'File', 'No'],
  ];
  return (
    <Paper>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {feature.code} · Data fields
      </p>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-100 text-left">
            {['Field', 'Type', 'Required'].map((h) => (
              <th key={h} className="border border-slate-200 px-3 py-1.5 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]}>
              {r.map((c, i) => (
                <td key={i} className="border border-slate-200 px-3 py-1.5">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Paper>
  );
}

/* A document as a clickable row: eye icon, name, and whether the current role has opened it. */
export function DocButton({ doc, feature, list }) {
  const openDoc = useDocViewer();
  const { hasViewed } = useApp();
  const seen = hasViewed(doc.id);
  const Icon = doc.kind === 'evidence' ? Paperclip : FileText;
  return (
    <button
      type="button"
      onClick={() => openDoc(doc, feature, list)}
      className="group flex w-full items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2 text-left text-sm hover:border-accent"
    >
      <Icon className="h-4 w-4 shrink-0 text-faint" />
      <span className="min-w-0 flex-1 truncate font-medium">{doc.name}</span>
      {seen ? (
        <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" /> Viewed
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs font-medium text-accent-text">
          <Eye className="h-3.5 w-3.5" /> View
        </span>
      )}
    </button>
  );
}
