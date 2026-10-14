import { FormEvent } from 'react';
import { User } from 'firebase/auth';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { DatePicker } from './ui/date-picker';
import { Plus, Search, ChevronDown, LogOut } from 'lucide-react';
import { Participant } from '../types';
import { cn } from '../lib/utils';

interface AppSidebarProps {
  user: User;
  userTitle: string;
  participantsCollapsed: boolean;
  onToggleParticipantsCollapsed: () => void;
  isAdding: boolean;
  onStartAdding: () => void;
  onCancelAdding: () => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  sortBy: 'name' | 'phase';
  onSortByChange: (value: 'name' | 'phase') => void;
  newParticipant: { name: string; caseNumber: string; phaseUpdate: string };
  onNewParticipantChange: (value: { name: string; caseNumber: string; phaseUpdate: string }) => void;
  onAddParticipant: (e: FormEvent) => void;
  filteredParticipants: Participant[];
  selectedParticipantId: string | null;
  onSelectParticipant: (id: string) => void;
  showDashboard: boolean;
  settingsOpen: boolean;
  onOpenDashboard: () => void;
  onSignOut: () => void;
}

export default function AppSidebar({
  user,
  userTitle,
  participantsCollapsed,
  onToggleParticipantsCollapsed,
  isAdding,
  onStartAdding,
  onCancelAdding,
  searchTerm,
  onSearchTermChange,
  sortBy,
  onSortByChange,
  newParticipant,
  onNewParticipantChange,
  onAddParticipant,
  filteredParticipants,
  selectedParticipantId,
  onSelectParticipant,
  showDashboard,
  settingsOpen,
  onOpenDashboard,
  onSignOut,
}: AppSidebarProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-3 pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={onToggleParticipantsCollapsed}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
          >
            <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", participantsCollapsed && "-rotate-90")} />
            Participants
          </button>
          <Button size="icon" variant="ghost" onClick={onStartAdding} className="h-8 w-8 text-accent-600 dark:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900/20 rounded-full">
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {!participantsCollapsed && (
          <div className="mt-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <Input
                placeholder="Search by name or case..."
                value={searchTerm}
                onChange={e => onSearchTermChange(e.target.value)}
                className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 focus-visible:ring-accent-500 h-10 rounded-xl"
              />
            </div>

            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => onSortByChange('name')}
                className={cn(
                  "flex-1 text-xs font-semibold py-1 rounded-md transition-all",
                  sortBy === 'name'
                    ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                Last Name
              </button>
              <button
                onClick={() => onSortByChange('phase')}
                className={cn(
                  "flex-1 text-xs font-semibold py-1 rounded-md transition-all",
                  sortBy === 'phase'
                    ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                Phase
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0">
        {(!participantsCollapsed || isAdding) && (
        <div className="h-full overflow-y-auto pb-6 custom-scrollbar">
        <div className="space-y-2 px-4 pt-2">
          {isAdding && (
            <Card className="mb-4 border-accent-200 dark:border-accent-900 bg-accent-50/30 dark:bg-accent-900/10 shadow-inner overflow-hidden animate-in slide-in-from-top-2">
              <CardContent className="p-4">
                <form onSubmit={onAddParticipant} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-[11px] uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">Full Name</Label>
                    <Input
                      id="name"
                      value={newParticipant.name}
                      onChange={e => onNewParticipantChange({ ...newParticipant, name: e.target.value })}
                      className="h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                      placeholder="e.g. John Smith"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="case" className="text-[11px] uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">Case Number</Label>
                    <Input
                      id="case"
                      value={newParticipant.caseNumber}
                      onChange={e => onNewParticipantChange({ ...newParticipant, caseNumber: e.target.value })}
                      className="h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-mono"
                      placeholder="2024-CR-0000"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">Expected Phase Date</Label>
                    <DatePicker
                      value={newParticipant.phaseUpdate}
                      onChange={date => onNewParticipantChange({ ...newParticipant, phaseUpdate: date })}
                      placeholder="Set a target date"
                      showQuick={false}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" size="sm" className="flex-1 bg-accent-600 dark:bg-accent-500 text-white font-bold">Create Profile</Button>
                    <Button type="button" size="sm" variant="ghost" onClick={onCancelAdding} className="font-bold text-slate-500 dark:text-slate-400">Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {filteredParticipants.length === 0 && !isAdding && !participantsCollapsed && (
            <div className="text-center py-20 px-6">
              <div className="bg-slate-50 dark:bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-slate-200 dark:text-slate-700" />
              </div>
              <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">No participants found.</p>
            </div>
          )}

          {!isAdding && filteredParticipants.map(p => (
            <button
              key={p.id}
              onClick={() => onSelectParticipant(p.id)}
              className={cn(
                "w-full text-left p-4 rounded-2xl transition-all duration-200 group relative border",
                selectedParticipantId === p.id
                  ? "bg-accent-600 border-accent-600 shadow-lg shadow-accent-100 dark:shadow-accent-900/20"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent hover:border-slate-100 dark:hover:border-slate-700"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={cn(
                  "font-bold text-sm leading-tight",
                  selectedParticipantId === p.id ? "text-white" : "text-slate-800 dark:text-slate-200"
                )}>{p.name}</span>
                <Badge className={cn(
                  "text-[10px] h-4 px-1.5 font-bold uppercase tracking-tight",
                  selectedParticipantId === p.id
                    ? "bg-white/20 text-white border-white/20"
                    : "bg-accent-50 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 border-accent-100 dark:border-accent-900/50"
                )}>
                  P{p.currentPhase}
                </Badge>
              </div>
              <div className={cn(
                "text-[10px] font-mono tracking-tight",
                selectedParticipantId === p.id ? "text-accent-200" : "text-slate-400 dark:text-slate-500"
              )}>{p.caseNumber}</div>
            </button>
          ))}
        </div>
        </div>
        )}
      </div>

      <div className="shrink-0 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onOpenDashboard}
          className={cn(
            "w-full text-left px-4 py-3 text-xs font-bold transition-colors",
            showDashboard && !selectedParticipantId && !settingsOpen
              ? "text-accent-600 dark:text-accent-400"
              : "text-slate-700 dark:text-slate-300 hover:text-accent-600 dark:hover:text-accent-400"
          )}
        >
          My Caseload Dashboard
        </button>
        <div className="mx-4 border-t border-slate-100 dark:border-slate-800" />
      </div>
      <div className="shrink-0 px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{user.displayName}</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold truncate">{userTitle}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onSignOut}
          className="h-8 w-8 shrink-0 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
