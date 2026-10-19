import { Button } from './ui/button';
import CasePlanrLogo from './CasePlanrLogo';
import { Plus, ChevronRight } from 'lucide-react';

export default function HomeWelcome({ onAddParticipant }: { onAddParticipant: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-10">
      <div className="relative mb-6">
        <CasePlanrLogo className="relative w-28 h-28 drop-shadow-xl" />
      </div>
      <div className="text-center max-w-md space-y-4">
        <div>
          <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Welcome to CasePlanr</h3>
        </div>
        <div className="hidden sm:flex flex-wrap justify-center items-center gap-y-1.5 py-1">
          {["Goals", "Case Plans", "Milestones", "Audit Logs"].map((feature, i, arr) => (
            <span key={feature} className="inline-flex items-center gap-1 whitespace-nowrap">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 border border-slate-200 dark:border-neutral-700">
                {feature}
              </span>
              {i < arr.length - 1 && (
                <ChevronRight className="w-3 h-3 text-slate-300 dark:text-neutral-600 flex-shrink-0" />
              )}
            </span>
          ))}
        </div>
        <p className="text-slate-500 dark:text-neutral-400 leading-relaxed">
          Select a participant from the sidebar to begin managing their milestones, goals, and court documentation.
        </p>
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-slate-200 dark:bg-neutral-800"></div>
          <span className="text-xs font-black text-slate-800 dark:text-white tracking-tight">OR:</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-neutral-800"></div>
        </div>
        <Button
          onClick={onAddParticipant}
          className="bg-accent-600 hover:bg-accent-700 dark:bg-accent-500 dark:hover:bg-accent-600 text-white font-bold rounded-xl shadow-lg shadow-accent-100 dark:shadow-black/40 px-6"
        >
          <Plus className="w-4 h-4" />
          Create New Case Plan
        </Button>
      </div>
    </div>
  );
}
