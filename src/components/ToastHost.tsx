import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { notify, NotifyMessage } from '../lib/notify';
import { cn } from '../lib/utils';

const AUTO_DISMISS_MS = 5000;

export default function ToastHost() {
  const [toasts, setToasts] = useState<NotifyMessage[]>([]);

  useEffect(() => {
    return notify.subscribe((message) => {
      setToasts((prev) => [...prev, message]);
    });
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const latest = toasts[toasts.length - 1];
    const timer = window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== latest.id));
    }, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [toasts]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 z-[100] flex w-full max-w-md -translate-x-1/2 flex-col gap-2 px-4 pointer-events-none"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={cn(
            'pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg',
            toast.level === 'error'
              ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950 dark:text-red-100'
              : 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950 dark:text-emerald-100'
          )}
        >
          <p className="flex-1 text-sm font-medium">{toast.text}</p>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="shrink-0 rounded-md p-0.5 opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
