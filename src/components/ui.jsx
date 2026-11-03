import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { STATUSES, TONES } from '../lib/workflow';
import { cx } from '../lib/format';

const BUTTON_VARIANTS = {
  primary: 'bg-accent text-accent-fg hover:bg-accent-hover',
  secondary: 'bg-surface text-fg ring-1 ring-inset ring-line-strong hover:bg-subtle',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  danger: 'bg-surface text-red-600 ring-1 ring-inset ring-red-500/30 hover:bg-red-500/10 dark:text-red-400',
  dangerSolid: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-muted hover:bg-subtle hover:text-fg',
};

export function Button({ variant = 'primary', size = 'md', icon: Icon, className, children, ...props }) {
  return (
    <button
      type="button"
      className={cx(
        'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'h-8 px-3 text-xs' : 'h-9 px-3.5 text-sm',
        BUTTON_VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {Icon && <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />}
      {children}
    </button>
  );
}

export function StatusBadge({ status }) {
  const s = STATUSES[status] ?? STATUSES.draft;
  return (
    <span className={cx('inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium', TONES[s.tone])}>
      {s.label}
    </span>
  );
}

export function Tag({ tone = 'gray', children, title }) {
  return (
    <span title={title} className={cx('inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold', TONES[tone])}>
      {children}
    </span>
  );
}

export const AmendmentTag = ({ refId }) => (
  <Tag tone="amber" title={refId ? `Added by ${refId}` : 'Added after SOW sign-off'}>
    Amendment
  </Tag>
);

export function Card({ className, children, ...props }) {
  return (
    <div className={cx('rounded-xl border border-line bg-surface', className)} {...props}>
      {children}
    </div>
  );
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-[8vh]">
      <div className="fade-in fixed inset-0 bg-black/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={cx('modal-in relative w-full rounded-2xl border border-line bg-surface shadow-2xl', { md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size])}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-5">
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-faint hover:bg-subtle hover:text-fg" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 rounded-b-2xl border-t border-line bg-subtle/60 px-6 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({ label, hint, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-faint">{hint}</span>}
    </label>
  );
}

const inputClass =
  'block w-full rounded-lg border-0 bg-surface px-3 py-2 text-sm text-fg ring-1 ring-inset ring-line-strong placeholder:text-faint focus:ring-2 focus:ring-inset focus:ring-accent outline-none';

export const Input = ({ className, ...props }) => <input className={cx(inputClass, className)} {...props} />;
export const Textarea = ({ className, ...props }) => <textarea rows={3} className={cx(inputClass, 'resize-none', className)} {...props} />;
export const Select = ({ className, children, ...props }) => (
  <select className={cx(inputClass, 'pr-8', className)} {...props}>
    {children}
  </select>
);

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {Icon && (
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-subtle">
          <Icon className="h-5 w-5 text-faint" />
        </span>
      )}
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, description, actions, back }) {
  return (
    <div className="mb-6">
      {back}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={cx(
            '-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 pb-2.5 text-sm font-medium transition-colors',
            value === t.key ? 'border-accent text-fg' : 'border-transparent text-muted hover:text-fg',
          )}
        >
          {t.label}
          {t.count != null && (
            <span className={cx('rounded-full px-1.5 text-xs', value === t.key ? 'bg-accent-soft text-accent-text' : 'bg-subtle text-muted')}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // Storage can be unavailable (private mode); the toggle still works for this session.
    }
  };
  return [dark, toggle];
}
