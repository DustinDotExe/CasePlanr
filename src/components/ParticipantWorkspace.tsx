import { User } from 'firebase/auth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { DatePicker } from './ui/date-picker';
import { Hash, Pencil, Check, X, Trash2, User as UserIcon, CalendarDays, LayoutDashboard, Target, FileText, History, Link2 } from 'lucide-react';
import { CurrentUser, MilestonePhase, Participant, ParticipantPortal, Signature, StoredTemplateCategory } from '../types';
import CasePlanEditor from './CasePlanEditor';
import AIGoalRefiner from './AIGoalRefiner';
import CourtReport from './CourtReport';
import ShareAndSign from './ShareAndSign';
import AuditLog from './AuditLog';

interface ParticipantWorkspaceProps {
  user: User;
  currentUser: CurrentUser;
  selectedParticipant: Participant;
  userTitle: string;
  milestonePhases: MilestonePhase[];
  goalTemplates: StoredTemplateCategory[];
  portalDoc: ParticipantPortal | null;
  activeTab: string;
  onActiveTabChange: (value: string) => void;
  isEditingParticipant: boolean;
  editedName: string;
  editedCaseNumber: string;
  onEditedNameChange: (value: string) => void;
  onEditedCaseNumberChange: (value: string) => void;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSaveParticipant: () => void;
  onRequestDelete: () => void;
  onPhaseUpdateChange: (date: string) => void;
  shareAndSignOpen: boolean;
  onShareAndSignOpenChange: (open: boolean) => void;
  onGenerateShareLink: () => Promise<void>;
  onRevokeShareLink: () => Promise<void>;
  onSyncPortal: () => Promise<void>;
  onSignAsCaseManager: (sig: Signature) => Promise<void>;
  onRemovePortalSignature: (signatureField: 'caseManagerSignature' | 'participantSignature') => Promise<void>;
}

export default function ParticipantWorkspace({
  user,
  currentUser,
  selectedParticipant,
  userTitle,
  milestonePhases,
  goalTemplates,
  portalDoc,
  activeTab,
  onActiveTabChange,
  isEditingParticipant,
  editedName,
  editedCaseNumber,
  onEditedNameChange,
  onEditedCaseNumberChange,
  onStartEditing,
  onCancelEditing,
  onSaveParticipant,
  onRequestDelete,
  onPhaseUpdateChange,
  shareAndSignOpen,
  onShareAndSignOpenChange,
  onGenerateShareLink,
  onRevokeShareLink,
  onSyncPortal,
  onSignAsCaseManager,
  onRemovePortalSignature,
}: ParticipantWorkspaceProps) {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-6 md:space-y-10 animate-in fade-in duration-500" data-participant-content>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 no-print">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {isEditingParticipant ? (
              <div className="flex items-center gap-3 flex-1">
                <Input
                  value={editedName}
                  onChange={(e) => onEditedNameChange(e.target.value)}
                  className="text-2xl font-black h-12 bg-white dark:bg-slate-900 border-accent-200 dark:border-accent-800 focus-visible:ring-accent-500"
                  autoFocus
                  placeholder="Participant Name"
                />
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={onSaveParticipant}
                    className="h-10 w-10 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
                  >
                    <Check className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={onCancelEditing}
                    className="h-10 w-10 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{selectedParticipant.name}</h2>
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onStartEditing}
                    className="text-slate-400 dark:text-slate-500 hover:text-accent-600 dark:hover:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-950/30 rounded-full h-8 w-8"
                    title="Edit Profile"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRequestDelete}
                    className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full h-8 w-8"
                    title="Delete Profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Hash className="w-4 h-4" />
              {isEditingParticipant ? (
                <Input
                  value={editedCaseNumber}
                  onChange={(e) => onEditedCaseNumberChange(e.target.value)}
                  className="h-8 w-40 font-mono text-xs bg-white dark:bg-slate-900 border-accent-200 dark:border-accent-800 focus-visible:ring-accent-500"
                  placeholder="Case Number"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSaveParticipant();
                    if (e.key === 'Escape') onCancelEditing();
                  }}
                />
              ) : (
                <span className="font-mono">{selectedParticipant.caseNumber}</span>
              )}
            </div>
            <div className="hidden md:flex w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
            <div className="hidden md:flex items-center gap-1.5">
              <UserIcon className="w-4 h-4" />
              <span>Assigned to {user.displayName}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 no-print">
          <div className="space-y-1 pr-3 sm:pr-5">
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Phase</p>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black text-accent-600 dark:text-accent-400">{selectedParticipant.currentPhase}</span>
              <span className="text-slate-300 dark:text-slate-700 font-bold text-sm">/ {milestonePhases.length}</span>
            </div>
          </div>
          <div className="space-y-1 px-3 sm:px-5">
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Progress</p>
            <div className="space-y-1">
              <span className="text-xl font-black text-accent-600 dark:text-accent-400">{Math.round((selectedParticipant.currentPhase / milestonePhases.length) * 100)}%</span>
              <Progress value={(selectedParticipant.currentPhase / milestonePhases.length) * 100} className="h-1.5 w-full max-w-[4rem] bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
          <div className="space-y-1 pl-3 sm:pl-5">
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <CalendarDays className="w-3 h-3 shrink-0" /> Date
            </p>
            <DatePicker
              value={selectedParticipant.phaseUpdate || ''}
              onChange={onPhaseUpdateChange}
              placeholder="—"
              showQuick={false}
              variant="inline"
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={onActiveTabChange} className="w-full">
        <TabsList className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-[3.5px] h-14 rounded-2xl shadow-sm inline-flex w-auto no-print">
          <TabsTrigger value="plan" aria-label="Overview" className="dark:data-active:bg-slate-800 dark:data-active:border-transparent dark:data-active:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.08),0_1px_2px_rgba(0,0,0,0.4)] px-4 md:px-8 rounded-xl font-bold transition-all">
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden md:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="ai" aria-label="Goals" className="dark:data-active:bg-slate-800 dark:data-active:border-transparent dark:data-active:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.08),0_1px_2px_rgba(0,0,0,0.4)] px-4 md:px-8 rounded-xl font-bold transition-all">
            <Target className="w-4 h-4" />
            <span className="hidden md:inline">Goals</span>
          </TabsTrigger>
          <TabsTrigger value="report" aria-label="Case Plan" className="dark:data-active:bg-slate-800 dark:data-active:border-transparent dark:data-active:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.08),0_1px_2px_rgba(0,0,0,0.4)] px-4 md:px-8 rounded-xl font-bold transition-all">
            <FileText className="w-4 h-4" />
            <span className="hidden md:inline">Case Plan</span>
          </TabsTrigger>
          <TabsTrigger value="history" aria-label="History" className="dark:data-active:bg-slate-800 dark:data-active:border-transparent dark:data-active:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.08),0_1px_2px_rgba(0,0,0,0.4)] px-4 md:px-8 rounded-xl font-bold transition-all">
            <History className="w-4 h-4" />
            <span className="hidden md:inline">History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plan" className="mt-6 outline-none">
          <CasePlanEditor participant={selectedParticipant} currentUser={currentUser} milestonePhases={milestonePhases} />
        </TabsContent>

        <TabsContent value="ai" className="mt-6 outline-none">
          <AIGoalRefiner participant={selectedParticipant} currentUser={currentUser} goalTemplates={goalTemplates} />
        </TabsContent>

        <TabsContent value="report" className="mt-6 outline-none space-y-6">
          <CourtReport
            participant={selectedParticipant}
            currentUser={currentUser}
            portalDoc={portalDoc}
            actions={(
              <Button
                type="button"
                variant="outline"
                onClick={() => onShareAndSignOpenChange(true)}
                className="w-full sm:w-auto border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold shadow-sm transition-all active:scale-[0.98]"
              >
                <Link2 className="w-4 h-4 text-accent-600 dark:text-accent-400" />
                Share & Sign
              </Button>
            )}
          />
          {shareAndSignOpen && (
            <Dialog open={shareAndSignOpen} onOpenChange={onShareAndSignOpenChange}>
              <DialogContent
                showCloseButton={false}
                className="max-h-[calc(100vh-2rem)] overflow-y-auto p-0 sm:max-w-3xl bg-transparent ring-0 shadow-none no-print"
              >
                <DialogTitle className="sr-only">Share & Sign</DialogTitle>
                <ShareAndSign
                  participant={selectedParticipant}
                  portalDoc={portalDoc}
                  userTitle={userTitle}
                  caseManagerName={user.displayName || ''}
                  milestonePhases={milestonePhases}
                  onGenerateLink={onGenerateShareLink}
                  onRevokeLink={onRevokeShareLink}
                  onSyncPortal={onSyncPortal}
                  onSignAsCaseManager={onSignAsCaseManager}
                  onRemoveSignature={onRemovePortalSignature}
                  onClose={() => onShareAndSignOpenChange(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6 outline-none">
          <AuditLog participant={selectedParticipant} milestonePhases={milestonePhases} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
