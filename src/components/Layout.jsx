import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CheckSquare, FolderKanban, History, Home, Moon, RotateCcw, ShieldCheck, Sun } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ROLES, USERS } from '../data/mockData';
import { cx } from '../lib/format';
import { Button, Modal, useTheme } from './ui';

function NavItem({ to, icon: Icon, label, count, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cx(
          'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
          isActive ? 'bg-subtle text-fg' : 'text-muted hover:bg-subtle hover:text-fg',
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {count > 0 && <span className="rounded-full bg-accent px-1.5 text-[11px] font-semibold text-accent-fg">{count}</span>}
    </NavLink>
  );
}

function Sidebar() {
  const { role, projects, features } = useApp();
  const count = (...s) => features.filter((f) => s.includes(f.status)).length;

  return (
    <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-line bg-surface md:flex">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-fg">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <p className="text-sm font-semibold">SignOff</p>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        <div className="space-y-0.5">
          {role !== 'client' && <NavItem to="/" end icon={Home} label="Home" />}
          {role === 'approver' && <NavItem to="/approvals" icon={CheckSquare} label="To approve" count={count('pending_internal', 'evidence_pending')} />}
          {role === 'client' && <NavItem to="/portal" icon={CheckSquare} label="To approve" count={count('pending_client')} />}
          <NavItem to="/audit" icon={History} label="History" />
        </div>
        <div>
          <p className="mb-1.5 px-2.5 text-xs font-medium text-faint">Projects</p>
          <div className="space-y-0.5">
            {projects.map((p) => (
              <NavItem key={p.id} to={`/projects/${p.id}`} icon={FolderKanban} label={p.name} />
            ))}
          </div>
        </div>
      </nav>

      <ResetDemo />
    </aside>
  );
}

function ResetDemo() {
  const { resetDemo } = useApp();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="m-3">
      <p className="mb-1.5 px-2.5 text-[11px] leading-relaxed text-faint">Demo data is saved in this browser.</p>
      <button
        onClick={() => setConfirming(true)}
        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-muted hover:bg-subtle hover:text-fg"
      >
        <RotateCcw className="h-4 w-4" /> Reset demo data
      </button>
      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Reset demo data?"
        description="All projects, approvals, uploads and history you added will be removed, and the starting data comes back."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button
              variant="dangerSolid"
              onClick={() => {
                resetDemo();
                setConfirming(false);
                navigate('/');
              }}
            >
              Reset
            </Button>
          </>
        }
      />
    </div>
  );
}

function RoleSwitcher() {
  const { role, setRole } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const change = (next) => {
    setRole(next);
    // Keep each role on a page it has in its menu.
    if (next === 'client' && (pathname === '/' || pathname === '/approvals')) navigate('/portal');
    if (next !== 'client' && pathname === '/portal') navigate('/');
    if (next !== 'approver' && pathname === '/approvals') navigate('/');
  };

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs text-muted lg:inline">View as</span>
      <div className="flex rounded-lg bg-subtle p-0.5" role="radiogroup" aria-label="Demo role">
        {Object.values(ROLES).map((r) => (
          <button
            key={r.key}
            role="radio"
            aria-checked={role === r.key}
            onClick={() => change(r.key)}
            className={cx(
              'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
              role === r.key ? 'bg-surface text-fg shadow-sm dark:bg-line-strong' : 'text-muted hover:text-fg',
            )}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Header() {
  const { role } = useApp();
  const [dark, toggleTheme] = useTheme();
  const u = USERS[role];
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-surface/90 px-6 backdrop-blur">
      <RoleSwitcher />
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-muted hover:bg-subtle hover:text-fg"
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={dark ? 'Light mode' : 'Dark mode'}
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <div className="hidden text-right leading-tight sm:block">
          <p className="text-sm font-medium">{u.name}</p>
          <p className="text-xs text-muted">{ROLES[role].label}</p>
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-text">{u.initials}</span>
      </div>
    </header>
  );
}

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
