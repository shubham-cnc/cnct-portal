# SignOff (CNCT): release-approval demo

A clickable demo that runs entirely in the browser, built with React 18, Tailwind v4 and Vite. There is no backend. Data is saved in the browser's localStorage, and "Reset demo data" in the sidebar restores the starting data.

```bash
npm install
npm run dev
```

Use the role switcher in the header (Sales / Project Manager / Internal Approver / Client) to act as each user.

- `src/data/mockData.js`: all dummy data (the Buildwell project, 3 sub-projects, 12 features, and the SOW template used by "Upload SOW")
- `src/lib/workflow.js`: the statuses, and which actions each role can take in each status
- `src/context/AppContext.jsx`: state and every change to it (each change adds an entry to the audit timeline)
- `src/pages/`: Dashboard, ProjectView, FeatureDetail, ApprovalQueue, ClientPortal, AuditLog
