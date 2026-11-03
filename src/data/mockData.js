// Dummy data for the CNCT approvals demo. Everything here is fictional.
// This is the starting data. Changes made in the demo are saved to localStorage (see AppContext).

export const ROLES = {
  sales: { key: 'sales', label: 'Sales' },
  pm: { key: 'pm', label: 'Project Manager' },
  approver: { key: 'approver', label: 'Internal Approver' },
  client: { key: 'client', label: 'Client' },
};

// The person behind each role in the demo.
export const USERS = {
  sales: { name: 'Rohan Mehta', title: 'Sales Lead, CNCT', initials: 'RM' },
  pm: { name: 'Priya Nair', title: 'Project Manager, CNCT', initials: 'PN' },
  approver: { name: 'Arjun Kapoor', title: 'Delivery Head, CNCT', initials: 'AK' },
  client: { name: 'Vikram Shah', title: 'Director of Operations, Buildwell Infra', initials: 'VS' },
};

export const projects = [
  {
    id: 'p-buildwell',
    name: 'Buildwell Site Operations Suite',
    client: 'Buildwell Infra Pvt. Ltd.',
    clientApprover: {
      name: 'Vikram Shah',
      title: 'Director of Operations',
      email: 'vikram.shah@buildwell.in',
    },
    sowRef: 'SOW-BW-2026-014',
    sowFile: { name: 'Buildwell_SOW_v1.2_signed.pdf', size: '2.4 MB' },
    signedOn: '2026-09-15T11:00:00+05:30',
    createdBy: 'Rohan Mehta',
    createdAt: '2026-09-16T10:05:00+05:30',
    amendments: [
      {
        ref: 'SOW-AMD-01',
        date: '2026-10-20T16:10:00+05:30',
        note: 'Added Procurement F6 (Vendor payment tracking, 95 h).',
      },
    ],
  },
];

export const subProjects = [
  {
    id: 'sp-site',
    projectId: 'p-buildwell',
    name: 'Site Team App',
    description: 'Android app for site engineers and supervisors.',
  },
  {
    id: 'sp-store',
    projectId: 'p-buildwell',
    name: 'Store Team App',
    description: 'Inventory and goods movement for site stores.',
  },
  {
    id: 'sp-proc',
    projectId: 'p-buildwell',
    name: 'Procurement Team App',
    description: 'Web app for the head-office procurement team.',
  },
];

let seq = 0;
const ev = (at, role, action, version, comment = '', kind = 'note') => ({
  id: `ev-seed-${++seq}`,
  at,
  actor: USERS[role].name,
  role,
  action,
  version,
  comment,
  kind,
});

const doc = (name, size, at, version, kind = 'doc', by = USERS.pm.name) => ({
  id: `doc-seed-${++seq}`,
  name,
  size,
  uploadedBy: by,
  uploadedAt: at,
  version,
  kind,
});

const created = (at = '2026-09-16T10:12:00+05:30') =>
  ev(at, 'sales', 'Created feature from SOW', 1, 'Imported from SOW-BW-2026-014.', 'create');

export const features = [
  // ---------------- Site Team App ----------------
  {
    id: 'f-site-1',
    projectId: 'p-buildwell',
    subProjectId: 'sp-site',
    code: 'F1',
    title: 'Daily progress report',
    description:
      'Supervisors submit an end-of-day report per site: work done against plan, manpower count, weather, blockers and up to 10 photos. Works offline and syncs when the network returns.',
    hours: 80,
    version: 1,
    status: 'sent_to_dev',
    redmineId: 4498,
    isAmendment: false,
    documents: [
      doc('SITE-F1_Functional_Spec_v1.pdf', '1.8 MB', '2026-09-24T12:40:00+05:30', 1),
      doc('SITE-F1_Wireframes.pdf', '3.2 MB', '2026-09-24T12:41:00+05:30', 1),
    ],
    clientApproval: { method: 'in_app', by: 'Vikram Shah', at: '2026-09-29T17:22:00+05:30' },
    history: [],
    timeline: [
      created(),
      ev('2026-09-24T12:41:00+05:30', 'pm', 'Uploaded 2 documents', 1, 'SITE-F1_Functional_Spec_v1.pdf, SITE-F1_Wireframes.pdf', 'upload'),
      ev('2026-09-24T12:45:00+05:30', 'pm', 'Submitted for internal approval', 1, '', 'submit'),
      ev('2026-09-25T10:03:00+05:30', 'approver', 'Approved internally', 1, 'Spec covers offline mode and photo size limits. Good to send.', 'approve'),
      ev('2026-09-25T10:30:00+05:30', 'pm', 'Sent to client for approval', 1, '', 'send'),
      ev('2026-09-29T17:22:00+05:30', 'client', 'Approved in client portal', 1, 'Approved. Please keep the Hindi labels we discussed.', 'approve'),
      ev('2026-09-30T09:15:00+05:30', 'pm', 'Sent to Redmine', 1, 'Redmine issue #4498 created.', 'redmine'),
    ],
  },
  {
    id: 'f-site-2',
    projectId: 'p-buildwell',
    subProjectId: 'sp-site',
    code: 'F2',
    title: 'Labour attendance with geo-tag',
    description:
      'Mark daily attendance for contract labour with a selfie and GPS check inside the site boundary. Shift-wise totals per contractor.',
    hours: 60,
    version: 1,
    status: 'client_approved',
    redmineId: null,
    isAmendment: false,
    documents: [
      doc('SITE-F2_Functional_Spec_v1.pdf', '1.4 MB', '2026-10-01T15:10:00+05:30', 1),
      doc('email_approval_labour_attendance.pdf', '214 KB', '2026-10-08T11:05:00+05:30', 1, 'evidence'),
    ],
    clientApproval: {
      method: 'evidence',
      by: 'Vikram Shah',
      at: '2026-10-07T19:48:00+05:30',
      evidence: 'email_approval_labour_attendance.pdf',
      verifiedBy: 'Arjun Kapoor',
    },
    history: [],
    timeline: [
      created(),
      ev('2026-10-01T15:10:00+05:30', 'pm', 'Uploaded 1 document', 1, 'SITE-F2_Functional_Spec_v1.pdf', 'upload'),
      ev('2026-10-01T15:14:00+05:30', 'pm', 'Submitted for internal approval', 1, '', 'submit'),
      ev('2026-10-03T11:20:00+05:30', 'approver', 'Approved internally', 1, 'Geo-fence radius of 150 m agreed with site leads.', 'approve'),
      ev('2026-10-03T11:42:00+05:30', 'pm', 'Sent to client for approval', 1, '', 'send'),
      ev('2026-10-08T11:05:00+05:30', 'pm', 'Uploaded client evidence', 1, 'Vikram approved over email on 7 Oct while his portal access was being set up. Email attached.', 'evidence'),
      ev('2026-10-09T09:40:00+05:30', 'approver', 'Accepted evidence · marked client approved', 1, 'Sender vikram.shah@buildwell.in matches the authorised approver on the SOW.', 'approve'),
    ],
  },
  {
    id: 'f-site-3',
    projectId: 'p-buildwell',
    subProjectId: 'sp-site',
    code: 'F3',
    title: 'Material request from site',
    description:
      'Site engineers raise material requests against the BOQ with required-by date and priority. Requests route to the store first, then to procurement if stock is short.',
    hours: 70,
    version: 1,
    status: 'pending_client',
    redmineId: null,
    isAmendment: false,
    documents: [
      doc('SITE-F3_Functional_Spec_v1.pdf', '1.6 MB', '2026-10-14T16:25:00+05:30', 1),
      doc('SITE-F3_Request_Flow.png', '480 KB', '2026-10-14T16:26:00+05:30', 1),
    ],
    history: [],
    timeline: [
      created(),
      ev('2026-10-14T16:26:00+05:30', 'pm', 'Uploaded 2 documents', 1, 'SITE-F3_Functional_Spec_v1.pdf, SITE-F3_Request_Flow.png', 'upload'),
      ev('2026-10-14T16:30:00+05:30', 'pm', 'Submitted for internal approval', 1, '', 'submit'),
      ev('2026-10-16T12:05:00+05:30', 'approver', 'Approved internally', 1, '', 'approve'),
      ev('2026-10-16T12:30:00+05:30', 'pm', 'Sent to client for approval', 1, 'Vikram, please review the store-first routing in section 3.', 'send'),
    ],
  },
  {
    id: 'f-site-4',
    projectId: 'p-buildwell',
    subProjectId: 'sp-site',
    code: 'F4',
    title: 'Site photo log with annotations',
    description:
      'Capture progress photos tagged by floor and zone, draw markups on them and share snags with the contractor.',
    hours: 50,
    version: 1,
    status: 'draft',
    redmineId: null,
    isAmendment: false,
    documents: [],
    history: [],
    timeline: [created()],
  },

  // ---------------- Store Team App ----------------
  {
    id: 'f-store-1',
    projectId: 'p-buildwell',
    subProjectId: 'sp-store',
    code: 'F1',
    title: 'Goods receipt note (GRN)',
    description:
      'Record goods received against a PO with quantity checks, short/excess entries, invoice photo and vehicle number. Updates site stock on save.',
    hours: 90,
    version: 1,
    status: 'pending_internal',
    redmineId: null,
    isAmendment: false,
    documents: [
      doc('STORE-F1_Functional_Spec_v1.pdf', '2.1 MB', '2026-10-28T14:02:00+05:30', 1),
      doc('STORE-F1_GRN_Print_Format.xlsx', '96 KB', '2026-10-28T14:03:00+05:30', 1),
    ],
    history: [],
    timeline: [
      created(),
      ev('2026-10-28T14:03:00+05:30', 'pm', 'Uploaded 2 documents', 1, 'STORE-F1_Functional_Spec_v1.pdf, STORE-F1_GRN_Print_Format.xlsx', 'upload'),
      ev('2026-10-28T14:06:00+05:30', 'pm', 'Submitted for internal approval', 1, '', 'submit'),
    ],
  },
  {
    id: 'f-store-2',
    projectId: 'p-buildwell',
    subProjectId: 'sp-store',
    code: 'F2',
    title: 'Stock transfer between sites',
    description:
      'Move surplus material from one site store to another with a transfer note, dispatch and receipt confirmation.',
    hours: 75,
    version: 1,
    status: 'rejected',
    redmineId: null,
    isAmendment: false,
    documents: [doc('STORE-F2_Functional_Spec_v1.pdf', '1.2 MB', '2026-10-22T10:48:00+05:30', 1)],
    history: [],
    timeline: [
      created(),
      ev('2026-10-22T10:48:00+05:30', 'pm', 'Uploaded 1 document', 1, 'STORE-F2_Functional_Spec_v1.pdf', 'upload'),
      ev('2026-10-22T10:52:00+05:30', 'pm', 'Submitted for internal approval', 1, '', 'submit'),
      ev('2026-10-24T15:30:00+05:30', 'approver', 'Rejected internally', 1, 'Spec does not cover in-transit stock or partial receipt at the destination site. Add those flows and the approval step for transfers above ₹5 lakh.', 'reject'),
    ],
  },

  // ---------------- Procurement Team App ----------------
  {
    id: 'f-proc-1',
    projectId: 'p-buildwell',
    subProjectId: 'sp-proc',
    code: 'F1',
    title: 'Vendor master',
    description:
      'Create and maintain vendors with GSTIN, PAN, categories and contact persons. Duplicate check on GSTIN.',
    hours: 60,
    version: 1,
    status: 'client_rejected',
    redmineId: null,
    isAmendment: false,
    documents: [doc('PROC-F1_Functional_Spec_v1.pdf', '1.1 MB', '2026-10-05T13:15:00+05:30', 1)],
    history: [],
    timeline: [
      created(),
      ev('2026-10-05T13:15:00+05:30', 'pm', 'Uploaded 1 document', 1, 'PROC-F1_Functional_Spec_v1.pdf', 'upload'),
      ev('2026-10-05T13:18:00+05:30', 'pm', 'Submitted for internal approval', 1, '', 'submit'),
      ev('2026-10-06T10:10:00+05:30', 'approver', 'Approved internally', 1, '', 'approve'),
      ev('2026-10-06T10:25:00+05:30', 'pm', 'Sent to client for approval', 1, '', 'send'),
      ev('2026-10-10T18:04:00+05:30', 'client', 'Rejected in client portal', 1, 'Vendor master must also capture MSME registration number and bank details (IFSC, account number). The draft only has GSTIN and PAN.', 'reject'),
    ],
  },
  {
    id: 'f-proc-2',
    projectId: 'p-buildwell',
    subProjectId: 'sp-proc',
    code: 'F2',
    title: 'Purchase requisition',
    description:
      'Convert approved material requests into purchase requisitions, group by vendor category and route for budget approval.',
    hours: 85,
    version: 1,
    status: 'evidence_pending',
    redmineId: null,
    isAmendment: false,
    documents: [
      doc('PROC-F2_Functional_Spec_v1.pdf', '1.9 MB', '2026-10-13T11:30:00+05:30', 1),
      doc('email_approval.pdf', '188 KB', '2026-10-30T18:20:00+05:30', 1, 'evidence'),
    ],
    pendingEvidence: {
      file: 'email_approval.pdf',
      source: 'Email',
      approvedBy: 'Vikram Shah',
      approvedOn: '2026-10-29',
      note: 'Client approved the PR flow in the weekly review call on 29 Oct and confirmed by email the same evening.',
    },
    history: [],
    timeline: [
      created(),
      ev('2026-10-13T11:30:00+05:30', 'pm', 'Uploaded 1 document', 1, 'PROC-F2_Functional_Spec_v1.pdf', 'upload'),
      ev('2026-10-13T11:34:00+05:30', 'pm', 'Submitted for internal approval', 1, '', 'submit'),
      ev('2026-10-15T09:50:00+05:30', 'approver', 'Approved internally', 1, '', 'approve'),
      ev('2026-10-15T10:05:00+05:30', 'pm', 'Sent to client for approval', 1, '', 'send'),
      ev('2026-10-30T18:20:00+05:30', 'pm', 'Uploaded client evidence', 1, 'Client approved the PR flow in the weekly review call on 29 Oct and confirmed by email the same evening.', 'evidence'),
    ],
  },
  {
    id: 'f-proc-3',
    projectId: 'p-buildwell',
    subProjectId: 'sp-proc',
    code: 'F3',
    title: 'Quotation comparison',
    description:
      'Collect quotes from up to five vendors per requisition and compare landed cost, delivery time and payment terms side by side.',
    hours: 65,
    version: 1,
    status: 'docs_uploaded',
    redmineId: null,
    isAmendment: false,
    documents: [doc('PROC-F3_Functional_Spec_v1.pdf', '1.3 MB', '2026-10-31T17:45:00+05:30', 1)],
    history: [],
    timeline: [
      created(),
      ev('2026-10-31T17:45:00+05:30', 'pm', 'Uploaded 1 document', 1, 'PROC-F3_Functional_Spec_v1.pdf', 'upload'),
    ],
  },
  {
    id: 'f-proc-4',
    projectId: 'p-buildwell',
    subProjectId: 'sp-proc',
    code: 'F4',
    title: 'Purchase order generation',
    description:
      'Generate POs from the selected quotation with terms, delivery schedule and digital signature. Email the PDF to the vendor.',
    hours: 110,
    version: 1,
    status: 'pending_client',
    redmineId: null,
    isAmendment: false,
    documents: [
      doc('PROC-F4_Functional_Spec_v1.pdf', '2.3 MB', '2026-10-27T12:10:00+05:30', 1),
      doc('PROC-F4_PO_Template.docx', '140 KB', '2026-10-27T12:11:00+05:30', 1),
    ],
    history: [],
    timeline: [
      created(),
      ev('2026-10-27T12:11:00+05:30', 'pm', 'Uploaded 2 documents', 1, 'PROC-F4_Functional_Spec_v1.pdf, PROC-F4_PO_Template.docx', 'upload'),
      ev('2026-10-27T12:15:00+05:30', 'pm', 'Submitted for internal approval', 1, '', 'submit'),
      ev('2026-10-29T16:40:00+05:30', 'approver', 'Approved internally', 1, 'PO numbering format confirmed with the Buildwell finance team.', 'approve'),
      ev('2026-10-29T16:40:00+05:30', 'approver', 'Sent to client for approval', 1, 'Sent automatically after internal approval.', 'send'),
    ],
  },
  {
    id: 'f-proc-5',
    projectId: 'p-buildwell',
    subProjectId: 'sp-proc',
    code: 'F5',
    title: 'Sum calculation with option to include/exclude GST',
    description:
      'PO and requisition totals with a per-document toggle to include or exclude GST, so GST-exempt vendors and imports show correct totals. Line-level tax breakdown on the PDF.',
    hours: 120,
    version: 2,
    status: 'pending_client',
    redmineId: null,
    isAmendment: false,
    amendmentReason:
      'Client needs to raise POs for GST-exempt vendors and imports. Totals must allow GST to be included or excluded per document.',
    documents: [doc('PROC-F5_Functional_Spec_v2.pdf', '1.5 MB', '2026-10-23T15:00:00+05:30', 2)],
    history: [
      {
        version: 1,
        title: 'Sum calculation inclusive of GST',
        description:
          'PO and requisition totals always calculated inclusive of GST at the item rate.',
        hours: 100,
        finalStatus: 'sent_to_dev',
        redmineId: 4510,
        supersededAt: '2026-10-21T14:30:00+05:30',
        supersededBy: 'Priya Nair',
        clientApproval: { method: 'in_app', by: 'Vikram Shah', at: '2026-10-01T12:15:00+05:30' },
        documents: [doc('PROC-F5_Functional_Spec_v1.pdf', '1.2 MB', '2026-09-26T11:00:00+05:30', 1)],
      },
    ],
    timeline: [
      created(),
      ev('2026-09-26T11:00:00+05:30', 'pm', 'Uploaded 1 document', 1, 'PROC-F5_Functional_Spec_v1.pdf', 'upload'),
      ev('2026-09-26T11:04:00+05:30', 'pm', 'Submitted for internal approval', 1, '', 'submit'),
      ev('2026-09-29T10:30:00+05:30', 'approver', 'Approved internally', 1, '', 'approve'),
      ev('2026-09-29T10:45:00+05:30', 'pm', 'Sent to client for approval', 1, '', 'send'),
      ev('2026-10-01T12:15:00+05:30', 'client', 'Approved in client portal', 1, '', 'approve'),
      ev('2026-10-02T09:30:00+05:30', 'pm', 'Sent to Redmine', 1, 'Redmine issue #4510 created.', 'redmine'),
      ev('2026-10-21T14:30:00+05:30', 'pm', 'Amended feature · v1 → v2', 2, 'Hours 100 → 120 (+20 h). Client needs to raise POs for GST-exempt vendors and imports. Totals must allow GST to be included or excluded per document.', 'amend'),
      ev('2026-10-23T15:00:00+05:30', 'pm', 'Uploaded 1 document', 2, 'PROC-F5_Functional_Spec_v2.pdf', 'upload'),
      ev('2026-10-23T15:04:00+05:30', 'pm', 'Submitted for internal approval', 2, '', 'submit'),
      ev('2026-10-24T11:15:00+05:30', 'approver', 'Approved internally', 2, 'Extra 20 h reviewed and agreed.', 'approve'),
      ev('2026-10-24T11:40:00+05:30', 'pm', 'Sent to client for approval', 2, 'v2 replaces v1. Please review the GST toggle in section 2.', 'send'),
    ],
  },
  {
    id: 'f-proc-6',
    projectId: 'p-buildwell',
    subProjectId: 'sp-proc',
    code: 'F6',
    title: 'Vendor payment tracking',
    description:
      'Track invoices against POs, payment due dates, partial payments and TDS deductions. Ageing report for finance.',
    hours: 95,
    version: 1,
    status: 'pending_internal',
    redmineId: null,
    isAmendment: true,
    amendmentRef: 'SOW-AMD-01',
    documents: [doc('PROC-F6_Functional_Spec_v1.pdf', '1.7 MB', '2026-10-30T12:20:00+05:30', 1)],
    history: [],
    timeline: [
      ev('2026-10-20T16:10:00+05:30', 'sales', 'Added feature via SOW amendment', 1, 'SOW-AMD-01 signed by Vikram Shah on 20 Oct. Adds 95 h to the Procurement Team App.', 'create'),
      ev('2026-10-30T12:20:00+05:30', 'pm', 'Uploaded 1 document', 1, 'PROC-F6_Functional_Spec_v1.pdf', 'upload'),
      ev('2026-10-30T12:24:00+05:30', 'pm', 'Submitted for internal approval', 1, '', 'submit'),
    ],
  },
];

// What the fake "Upload SOW" button "extracts" for a new project.
export const sowTemplate = {
  file: { name: 'Signed_SOW.pdf', size: '1.9 MB' },
  subProjects: [
    {
      name: 'Customer Mobile App',
      description: 'iOS and Android app for end customers.',
      features: [
        { title: 'Sign-up and KYC', hours: 60, description: 'Mobile OTP sign-up, Aadhaar/PAN KYC and profile.' },
        { title: 'Order tracking', hours: 80, description: 'Live order status with delivery ETA and history.' },
        { title: 'Push notifications', hours: 40, description: 'Order, offer and payment reminders with user preferences.' },
      ],
    },
    {
      name: 'Admin Console',
      description: 'Web console for operations and support staff.',
      features: [
        { title: 'Role-based access', hours: 50, description: 'Admin, operations and support roles with permission sets.' },
        { title: 'Reports and exports', hours: 70, description: 'Daily orders, revenue and SLA reports with CSV export.' },
      ],
    },
  ],
};

// Sample file names offered in upload dialogs.
export const sampleEvidenceFiles = [
  'email_approval.pdf',
  'whatsapp_approval_screenshot.png',
  'meeting_minutes_signed.pdf',
];

export const NEXT_REDMINE_ID = 4521;
