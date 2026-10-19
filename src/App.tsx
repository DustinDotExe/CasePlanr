import { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, setDoc, deleteField } from 'firebase/firestore';
import { logAuditEvent } from './services/auditService';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from './components/ui/sheet';
import { Participant, CurrentUser, StoredTemplateCategory, MilestonePhase, DEFAULT_MILESTONE_PHASES, normalizeGoals, Signature, ParticipantPortal } from './types';
import { DEFAULT_STORED_TEMPLATES } from './components/AIGoalRefiner';
import UserSettings from './components/UserSettings';
import CasePlanrLogo from './components/CasePlanrLogo';
import CaseloadDashboard from './components/CaseloadDashboard';
import AuthScreen, { AuthMode } from './components/AuthScreen';
import AppSidebar from './components/AppSidebar';
import ParticipantWorkspace from './components/ParticipantWorkspace';
import HomeWelcome from './components/HomeWelcome';
import ToastHost from './components/ToastHost';
import { Menu, Moon, Sun, Settings, Trash2 } from 'lucide-react';
import { cn } from './lib/utils';
import { notify } from './lib/notify';
import { buildPortalPayload, createShareToken, wrapSecureLinkError } from './lib/portal';
import {
  alignMilestones,
  AlignMilestonesOptions,
  buildEmptyMilestones,
  deriveCurrentPhase,
  detectRemovedPhaseIndex,
  milestoneKeyCount,
  milestonesMatchPhaseCount,
} from './lib/milestones';
import { parsePaletteColor, type PaletteColor } from './lib/palette';

function resolveIsDark(preference: 'light' | 'dark' | 'system'): boolean {
  if (preference === 'dark') return true;
  if (preference === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [participantsCollapsed, setParticipantsCollapsed] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [newParticipant, setNewParticipant] = useState({ name: '', caseNumber: '', phaseUpdate: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authDisplayName, setAuthDisplayName] = useState('');
  const [authJobTitle, setAuthJobTitle] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'phase'>('name');
  const [isEditingParticipant, setIsEditingParticipant] = useState(false);
  const [activeTab, setActiveTab] = useState('plan');
  const [shareAndSignOpen, setShareAndSignOpen] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedCaseNumber, setEditedCaseNumber] = useState('');
  const [userTitle, setUserTitle] = useState('Court Case Manager');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [goalTemplates, setGoalTemplates] = useState<StoredTemplateCategory[]>(DEFAULT_STORED_TEMPLATES);
  const [milestonePhases, setMilestonePhases] = useState<MilestonePhase[]>(DEFAULT_MILESTONE_PHASES);
  /** False until the current user's settings doc snapshot has been observed. */
  const [settingsReady, setSettingsReady] = useState(false);
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>(() => {
    const stored = localStorage.getItem('themePreference') as 'light' | 'dark' | 'system' | null;
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
    // Migrate legacy theme-only preference
    const legacy = localStorage.getItem('theme');
    if (legacy === 'dark' || legacy === 'light') return legacy;
    return 'system';
  });
  const [paletteColor, setPaletteColor] = useState<PaletteColor>(() =>
    parsePaletteColor(localStorage.getItem('paletteColor'))
  );
  const [isDark, setIsDark] = useState(() => resolveIsDark(
    (() => {
      const stored = localStorage.getItem('themePreference') as 'light' | 'dark' | 'system' | null;
      if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
      const legacy = localStorage.getItem('theme');
      if (legacy === 'dark' || legacy === 'light') return legacy;
      return 'system';
    })()
  ));

  useEffect(() => {
    if (themePreference !== 'system') {
      setIsDark(themePreference === 'dark');
      return;
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setIsDark(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [themePreference]);

  useEffect(() => {
    const headerColorLight = '#ffffff';
    const headerColorDark = '#0a0a0a';

    const shouldBeDark = user ? isDark : false;

    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', headerColorDark);
      const appleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (appleMeta) appleMeta.setAttribute('content', 'black-translucent');
      document.body.style.backgroundColor = headerColorDark;
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', headerColorLight);
      const appleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (appleMeta) appleMeta.setAttribute('content', 'default');
      document.body.style.backgroundColor = headerColorLight;
    }
  }, [isDark, user]);

  useEffect(() => {
    document.documentElement.dataset.palette = user ? paletteColor : 'blue';
  }, [paletteColor, user]);

  useEffect(() => {
    setSelectedParticipantId(null);
    setShowDashboard(false);
    setActiveTab('plan');
    setShareAndSignOpen(false);
    setSettingsOpen(false);
    setSidebarOpen(false);
    setSettingsReady(false);
    setMilestonePhases(DEFAULT_MILESTONE_PHASES);
  }, [user?.uid]);

  const handleCloseSettings = () => {
    setSettingsOpen(false);
    setSelectedParticipantId(null);
    setShowDashboard(false);
    setSidebarCollapsed(false);
    setSidebarOpen(false);
  };

  const handleOpenDashboard = () => {
    setShowDashboard(true);
    setSelectedParticipantId(null);
    setSettingsOpen(false);
    setShareAndSignOpen(false);
    setSidebarCollapsed(false);
    setSidebarOpen(false);
  };

  const handleGoHome = () => {
    setSelectedParticipantId(null);
    setShowDashboard(false);
    setSettingsOpen(false);
    setShareAndSignOpen(false);
    setSidebarCollapsed(false);
    setActiveTab('plan');
    setIsAdding(false);
    setIsEditingParticipant(false);
  };

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserTitle(data.title || 'Court Case Manager');
          if (data.goalTemplates?.length) setGoalTemplates(data.goalTemplates);
          if (data.milestonePhases?.length) {
            setMilestonePhases(data.milestonePhases);
          } else {
            setMilestonePhases(DEFAULT_MILESTONE_PHASES);
          }
        } else {
          setMilestonePhases(DEFAULT_MILESTONE_PHASES);
          setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: 'case_manager',
            title: 'Court Case Manager',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }).catch(err => console.error("Error initializing user doc:", err));
        }
        setSettingsReady(true);
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'participants'), where('uid', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(docSnap => {
          const raw = { id: docSnap.id, ...docSnap.data() } as any;
          const { goals, completedGoals } = normalizeGoals(raw.goals, raw.completedGoals);
          return { ...raw, goals, completedGoals } as Participant;
        });
        setParticipants(data);
      }, (err) => {
        console.error("Firestore Error:", err);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const [portalDoc, setPortalDoc] = useState<ParticipantPortal | null>(null);

  useEffect(() => {
    const shareToken = participants.find(p => p.id === selectedParticipantId)?.shareToken;
    if (!shareToken) { setPortalDoc(null); return; }
    const unsubscribe = onSnapshot(doc(db, 'participantPortals', shareToken), (snap) => {
      setPortalDoc(snap.exists() ? (snap.data() as ParticipantPortal) : null);
    });
    return () => unsubscribe();
  }, [selectedParticipantId, participants]);

  const syncParticipantPhases = async (
    phases: MilestonePhase[],
    list: Participant[],
    options?: AlignMilestonesOptions
  ) => {
    const phaseCount = phases.length;
    await Promise.all(list.map(async (participant) => {
      const aligned = alignMilestones(participant.milestones, phaseCount, options);
      const currentPhase = deriveCurrentPhase(aligned, phaseCount);
      const shapeOk =
        !options?.removedPhaseIndex &&
        milestonesMatchPhaseCount(participant.milestones, phaseCount);
      if (shapeOk && participant.currentPhase === currentPhase) return;
      try {
        await updateDoc(doc(db, 'participants', participant.id), {
          milestones: aligned,
          currentPhase,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.error(`Failed to align milestones for ${participant.id}:`, err);
      }
    }));
  };

  // Keep participant milestone maps aligned after settings are confirmed loaded
  // (legacy shorter maps, missing keys, or stale currentPhase). Never auto-shrink
  // here — shrinking without a known removed index corrupts completion history;
  // explicit phase edits sync through handleMilestonePhasesChange instead.
  useEffect(() => {
    if (!user || !settingsReady || participants.length === 0) return;
    const phaseCount = milestonePhases.length;
    const needsSync = participants.some((participant) => {
      const existingCount = milestoneKeyCount(participant.milestones);
      if (existingCount > phaseCount) return false;
      const aligned = alignMilestones(participant.milestones, phaseCount);
      return (
        !milestonesMatchPhaseCount(participant.milestones, phaseCount) ||
        participant.currentPhase !== deriveCurrentPhase(aligned, phaseCount)
      );
    });
    if (!needsSync) return;
    void syncParticipantPhases(milestonePhases, participants);
  }, [user?.uid, settingsReady, milestonePhases, participants]);

  const selectedParticipant = participants.find(p => p.id === selectedParticipantId) || null;
  const currentUser: CurrentUser = user
    ? { uid: user.uid, displayName: user.displayName, email: user.email }
    : { uid: '', displayName: null, email: null };

  const handleLogin = async () => {
    setLoginError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Login Error:", err);
      let message = "Login failed. Please check your connection and try again.";
      if (err.code === 'auth/unauthorized-domain') {
        message = "This domain is not authorized in Firebase. Please add it to the 'Authorized domains' list in the Firebase Console.";
      } else if (err.code === 'auth/popup-blocked') {
        message = "Login popup was blocked by your browser. Please allow popups for this site.";
      }
      setLoginError(message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (authMode === 'signup' && !authDisplayName.trim()) {
      setLoginError('Please enter your full name.');
      return;
    }
    if (authMode === 'signup' && authPassword !== authConfirmPassword) {
      setLoginError('Passwords do not match.');
      return;
    }
    setAuthLoading(true);
    try {
      if (authMode === 'signup') {
        const credential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        await updateProfile(credential.user, { displayName: authDisplayName.trim() });
        await setDoc(doc(db, 'users', credential.user.uid), {
          uid: credential.user.uid,
          email: credential.user.email,
          displayName: authDisplayName.trim(),
          role: 'case_manager',
          title: authJobTitle.trim() || 'Court Case Manager',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      }
    } catch (err: any) {
      let message = 'Authentication failed. Please try again.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password must be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later or reset your password.';
      }
      setLoginError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setAuthLoading(true);
    try {
      await sendPasswordResetEmail(auth, authEmail);
      setResetEmailSent(true);
    } catch (err: any) {
      let message = 'Failed to send reset email. Please try again.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email') {
        message = 'No account found with that email address.';
      }
      setLoginError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newParticipant.name || !newParticipant.caseNumber) return;

    try {
      const docRef = await addDoc(collection(db, 'participants'), {
        ...newParticipant,
        phaseUpdate: newParticipant.phaseUpdate || null,
        currentPhase: 1,
        goals: [],
        notes: '',
        milestones: buildEmptyMilestones(milestonePhases.length),
        irasDomains: [],
        uid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      logAuditEvent({
        participantId: docRef.id,
        caseManagerUid: user.uid,
        category: 'participant_created',
        description: `Created participant profile for ${newParticipant.name}`,
        details: { field: 'caseNumber', newValue: newParticipant.caseNumber },
        currentUser: { uid: user.uid, displayName: user.displayName, email: user.email }
      });
      setNewParticipant({ name: '', caseNumber: '', phaseUpdate: '' });
      setIsAdding(false);
      setSelectedParticipantId(docRef.id);
      setActiveTab('plan');
      setShowDashboard(false);
      setSidebarOpen(false);
    } catch (err) {
      console.error("Add Error:", err);
    }
  };

  const handleDeleteParticipant = async () => {
    if (!selectedParticipantId || !selectedParticipant || !user) return;

    try {
      await logAuditEvent({
        participantId: selectedParticipantId,
        caseManagerUid: user.uid,
        category: 'participant_deleted',
        description: `Deleted participant profile for ${selectedParticipant.name}`,
        details: { field: 'caseNumber', oldValue: selectedParticipant.caseNumber },
        currentUser: { uid: user.uid, displayName: user.displayName, email: user.email }
      });
      // Revoke the public portal before deleting the participant so the share
      // URL cannot outlive the case record.
      if (selectedParticipant.shareToken) {
        await deleteDoc(doc(db, 'participantPortals', selectedParticipant.shareToken)).catch((err) => {
          console.error('Portal revoke during participant delete failed:', err);
        });
      }
      await deleteDoc(doc(db, 'participants', selectedParticipantId));
      setSelectedParticipantId(null);
      setIsDeleting(false);
    } catch (err) {
      console.error("Delete Error:", err);
      notify.error('Failed to delete participant. Please try again.');
    }
  };

  const handleUpdateParticipant = async () => {
    if (!selectedParticipant || !editedName.trim() || !editedCaseNumber.trim() || !user) return;
    const nameChanged = editedName.trim() !== selectedParticipant.name;
    const caseChanged = editedCaseNumber.trim() !== selectedParticipant.caseNumber;
    try {
      await updateDoc(doc(db, 'participants', selectedParticipant.id), {
        name: editedName.trim(),
        caseNumber: editedCaseNumber.trim(),
        updatedAt: serverTimestamp()
      });
      if (nameChanged) {
        logAuditEvent({
          participantId: selectedParticipant.id,
          caseManagerUid: user.uid,
          category: 'participant_info_updated',
          description: 'Participant Name Updated',
          details: { field: 'name', oldValue: selectedParticipant.name, newValue: editedName.trim() },
          currentUser: { uid: user.uid, displayName: user.displayName, email: user.email }
        });
      }
      if (caseChanged) {
        logAuditEvent({
          participantId: selectedParticipant.id,
          caseManagerUid: user.uid,
          category: 'participant_info_updated',
          description: 'Case Number Updated',
          details: { field: 'caseNumber', oldValue: selectedParticipant.caseNumber, newValue: editedCaseNumber.trim() },
          currentUser: { uid: user.uid, displayName: user.displayName, email: user.email }
        });
      }
      setIsEditingParticipant(false);
    } catch (err) {
      console.error("Update Error:", err);
      notify.error('Failed to update participant. Please try again.');
    }
  };

  const handlePhaseUpdateChange = async (date: string) => {
    if (!selectedParticipant || !user) return;
    try {
      await updateDoc(doc(db, 'participants', selectedParticipant.id), {
        phaseUpdate: date || null,
        updatedAt: serverTimestamp()
      });
      logAuditEvent({
        participantId: selectedParticipant.id,
        caseManagerUid: user.uid,
        category: 'participant_info_updated',
        description: date ? 'Phase Up Date Set' : 'Phase Up Date Cleared',
        details: { field: 'phaseUpdate', oldValue: selectedParticipant.phaseUpdate || '', newValue: date },
        currentUser: { uid: user.uid, displayName: user.displayName, email: user.email }
      });
    } catch (err) {
      console.error("Phase Update Error:", err);
    }
  };

  const handleGenerateShareLink = async () => {
    if (!selectedParticipant || !user) return;
    try {
      const token = createShareToken();
      const portalData = {
        ...buildPortalPayload(selectedParticipant, user.uid, user.displayName || '', userTitle, milestonePhases),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      try {
        await setDoc(doc(db, 'participantPortals', token), portalData);
      } catch (err) {
        throw wrapSecureLinkError('creating participant portal', err);
      }
      try {
        await updateDoc(doc(db, 'participants', selectedParticipant.id), {
          shareToken: token,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        await deleteDoc(doc(db, 'participantPortals', token)).catch(() => undefined);
        throw wrapSecureLinkError('saving link token to participant', err);
      }
    } catch (err) {
      console.error('Generate share link error:', err);
      throw err;
    }
  };

  const handleRevokeShareLink = async () => {
    if (!selectedParticipant?.shareToken || !user) return;
    try {
      await deleteDoc(doc(db, 'participantPortals', selectedParticipant.shareToken));
      await updateDoc(doc(db, 'participants', selectedParticipant.id), {
        shareToken: null,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Revoke share link error:', err);
      throw err;
    }
  };

  const handleSyncPortal = async () => {
    if (!selectedParticipant?.shareToken || !user) return;
    try {
      await updateDoc(doc(db, 'participantPortals', selectedParticipant.shareToken), {
        ...buildPortalPayload(selectedParticipant, user.uid, user.displayName || '', userTitle, milestonePhases),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Sync portal error:', err);
      throw err;
    }
  };

  const handleSignAsCaseManager = async (sig: Signature) => {
    if (!selectedParticipant?.shareToken || !user) return;
    try {
      await updateDoc(doc(db, 'participantPortals', selectedParticipant.shareToken), {
        caseManagerSignature: sig,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Case manager sign error:', err);
      throw err;
    }
  };

  const handleRemovePortalSignature = async (signatureField: 'caseManagerSignature' | 'participantSignature') => {
    if (!selectedParticipant?.shareToken || !user) return;
    try {
      await updateDoc(doc(db, 'participantPortals', selectedParticipant.shareToken), {
        [signatureField]: deleteField(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Remove signature error:', err);
      throw err;
    }
  };

  const handlePaletteChange = (color: PaletteColor) => {
    setPaletteColor(color);
    localStorage.setItem('paletteColor', color);
  };

  const handleThemeChange = (pref: 'light' | 'dark' | 'system') => {
    setThemePreference(pref);
    localStorage.setItem('themePreference', pref);
    setIsDark(resolveIsDark(pref));
  };

  const handleMilestonePhasesChange = (
    phases: MilestonePhase[],
    meta?: AlignMilestonesOptions
  ) => {
    const removedPhaseIndex =
      meta?.removedPhaseIndex ?? detectRemovedPhaseIndex(milestonePhases, phases);
    setMilestonePhases(phases);
    void syncParticipantPhases(phases, participants, { removedPhaseIndex });
  };

  const startEditingParticipant = () => {
    if (selectedParticipant) {
      setEditedName(selectedParticipant.name);
      setEditedCaseNumber(selectedParticipant.caseNumber);
      setIsEditingParticipant(true);
    }
  };

  const getLastName = (name: string) => {
    const parts = name.trim().split(/\s+/);
    return parts[parts.length - 1].toLowerCase();
  };

  const filteredParticipants = participants
    .filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.caseNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'phase') {
        if (a.currentPhase !== b.currentPhase) return a.currentPhase - b.currentPhase;
      }
      return getLastName(a.name).localeCompare(getLastName(b.name));
    });

  const startAddingParticipant = () => {
    setIsAdding(true);
    setSidebarOpen(true);
    setSidebarCollapsed(false);
  };

  const handleAuthModeChange = (mode: AuthMode) => {
    setAuthMode(mode);
    setLoginError(null);
    if (mode !== 'reset') setResetEmailSent(false);
  };

  const sidebar = user ? (
    <AppSidebar
      user={user}
      userTitle={userTitle}
      participantsCollapsed={participantsCollapsed}
      onToggleParticipantsCollapsed={() => setParticipantsCollapsed(v => !v)}
      isAdding={isAdding}
      onStartAdding={() => setIsAdding(true)}
      onCancelAdding={() => setIsAdding(false)}
      searchTerm={searchTerm}
      onSearchTermChange={setSearchTerm}
      sortBy={sortBy}
      onSortByChange={setSortBy}
      newParticipant={newParticipant}
      onNewParticipantChange={setNewParticipant}
      onAddParticipant={handleAddParticipant}
      filteredParticipants={filteredParticipants}
      selectedParticipantId={selectedParticipantId}
      onSelectParticipant={(id) => { setSelectedParticipantId(id); setActiveTab('plan'); setSettingsOpen(false); setShowDashboard(false); }}
      showDashboard={showDashboard}
      settingsOpen={settingsOpen}
      onOpenDashboard={handleOpenDashboard}
      onSignOut={() => signOut(auth)}
      paletteColor={paletteColor}
    />
  ) : null;

  if (loading) return (
    <div className="h-screen w-screen flex flex-col bg-slate-50">
      <div className="h-safe-top bg-white w-full shrink-0"></div>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent-200 border-t-accent-600 rounded-full animate-spin"></div>
          <div className="text-slate-400 font-medium animate-pulse">Initializing CasePlanr...</div>
        </div>
      </div>
    </div>
  );

  if (!user) return (
    <>
      <AuthScreen
        authMode={authMode}
        setAuthMode={handleAuthModeChange}
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authDisplayName={authDisplayName}
        setAuthDisplayName={setAuthDisplayName}
        authJobTitle={authJobTitle}
        setAuthJobTitle={setAuthJobTitle}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        authConfirmPassword={authConfirmPassword}
        setAuthConfirmPassword={setAuthConfirmPassword}
        loginError={loginError}
        authLoading={authLoading}
        resetEmailSent={resetEmailSent}
        onEmailAuth={handleEmailAuth}
        onPasswordReset={handlePasswordReset}
        onGoogleLogin={handleLogin}
      />
      <ToastHost />
    </>
  );

  return (
    <div className="h-screen bg-slate-50 dark:bg-neutral-950 flex flex-col overflow-hidden transition-colors duration-300" data-app-root>
      <div className="h-safe-top bg-white dark:bg-neutral-900 w-full shrink-0 no-print"></div>
      <header className="bg-white dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 px-4 md:px-8 py-4 flex items-center justify-between z-20 shadow-sm no-print">
        <div className="flex items-center gap-3">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden text-slate-500" />}>
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80 bg-white dark:bg-neutral-900 border-r border-slate-200 dark:border-neutral-800">
              <SheetHeader className="p-6 border-b border-slate-100 dark:border-neutral-800">
                <SheetTitle className="flex items-center gap-2">
                  <CasePlanrLogo className="w-6 h-6" />
                  <span className="font-black tracking-tight">CasePlanr</span>
                </SheetTitle>
              </SheetHeader>
              {sidebar}
            </SheetContent>
          </Sheet>

          <button
            type="button"
            onClick={handleGoHome}
            className="flex items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            <CasePlanrLogo className="w-9 h-9 drop-shadow-md hidden md:block" />
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">CasePlanr</h1>
            <Badge variant="outline" className="hidden sm:inline-flex ml-2 bg-slate-50 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 border-slate-200 dark:border-neutral-700 font-mono text-[10px]">v1.0.0</Badge>
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          <Button
            variant="ghost"
            size="icon"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={() => handleThemeChange(isDark ? 'light' : 'dark')}
            className="text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <div className="hidden md:block h-8 w-[1px] bg-slate-200 dark:bg-neutral-800"></div>
          <button
            type="button"
            onClick={handleOpenDashboard}
            className="hidden md:flex flex-col items-end rounded-xl px-2 py-1 text-right transition-colors hover:bg-slate-100 dark:hover:bg-neutral-800"
            title="Open dashboard"
          >
            <span className="text-sm font-bold text-slate-800 dark:text-neutral-200">{user.displayName}</span>
            <span className="text-[11px] text-slate-400 dark:text-neutral-500 uppercase tracking-wider font-semibold">{userTitle}</span>
          </button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={settingsOpen ? 'Close settings' : 'Open settings'}
            onClick={() => settingsOpen ? handleCloseSettings() : (() => { setSettingsOpen(true); setShowDashboard(false); setSelectedParticipantId(null); setSidebarCollapsed(true); })()}
            className={cn(
              "text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full",
              settingsOpen && "bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-white"
            )}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative" data-app-layout>
        <aside className={cn(
          "hidden md:flex flex-col bg-white dark:bg-neutral-900 border-r border-slate-200 dark:border-neutral-800 shadow-sm z-10 overflow-hidden transition-[width] duration-300 no-print",
          sidebarCollapsed ? "md:w-0 md:border-r-0" : "md:w-80"
        )}>
          {sidebar}
        </aside>

        <div className="hidden md:block relative shrink-0 w-0 z-20 no-print">
          <button
            type="button"
            aria-expanded={!sidebarCollapsed}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setSidebarCollapsed(v => !v)}
            className="absolute top-0 bottom-0 -left-1 w-2 cursor-col-resize group bg-transparent border-0 p-0"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="absolute left-1/2 -translate-x-1/2 inset-y-0 w-px bg-transparent group-hover:bg-accent-500/50 dark:group-hover:bg-accent-400/50 transition-colors duration-150" />
          </button>
        </div>

        <section className="flex-1 bg-slate-50 dark:bg-neutral-950 overflow-y-auto custom-scrollbar transition-colors duration-300" data-main-scroll>
          {settingsOpen ? (
            <UserSettings
              onClose={handleCloseSettings}
              user={{ uid: user.uid, displayName: user.displayName, email: user.email }}
              userTitle={userTitle}
              isDark={isDark}
              themePreference={themePreference}
              onThemeChange={handleThemeChange}
              paletteColor={paletteColor}
              onPaletteChange={handlePaletteChange}
              goalTemplates={goalTemplates}
              onGoalTemplatesChange={setGoalTemplates}
              milestonePhases={milestonePhases}
              onMilestonePhasesChange={handleMilestonePhasesChange}
            />
          ) : selectedParticipant ? (
            <ParticipantWorkspace
              user={user}
              currentUser={currentUser}
              selectedParticipant={selectedParticipant}
              userTitle={userTitle}
              milestonePhases={milestonePhases}
              goalTemplates={goalTemplates}
              portalDoc={portalDoc}
              activeTab={activeTab}
              onActiveTabChange={setActiveTab}
              isEditingParticipant={isEditingParticipant}
              editedName={editedName}
              editedCaseNumber={editedCaseNumber}
              onEditedNameChange={setEditedName}
              onEditedCaseNumberChange={setEditedCaseNumber}
              onStartEditing={startEditingParticipant}
              onCancelEditing={() => setIsEditingParticipant(false)}
              onSaveParticipant={handleUpdateParticipant}
              onRequestDelete={() => setIsDeleting(true)}
              onPhaseUpdateChange={handlePhaseUpdateChange}
              shareAndSignOpen={shareAndSignOpen}
              onShareAndSignOpenChange={setShareAndSignOpen}
              onGenerateShareLink={handleGenerateShareLink}
              onRevokeShareLink={handleRevokeShareLink}
              onSyncPortal={handleSyncPortal}
              onSignAsCaseManager={handleSignAsCaseManager}
              onRemovePortalSignature={handleRemovePortalSignature}
            />
          ) : showDashboard ? (
            <CaseloadDashboard
              participants={participants}
              milestonePhases={milestonePhases}
              onSelectParticipant={(id) => { setSelectedParticipantId(id); setActiveTab('plan'); setShowDashboard(false); setSidebarOpen(false); }}
              onAddParticipant={startAddingParticipant}
            />
          ) : (
            <HomeWelcome onAddParticipant={startAddingParticipant} />
          )}
        </section>
      </div>

      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader className="items-center text-center sm:text-center">
            <div className="bg-red-50 dark:bg-red-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">Delete Profile?</DialogTitle>
            <DialogDescription className="font-medium">
              Are you sure you want to delete{' '}
              <span className="text-slate-900 dark:text-white font-bold">{selectedParticipant?.name}</span>?
              This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-0 bg-transparent p-0 sm:justify-stretch">
            <Button
              variant="ghost"
              onClick={() => setIsDeleting(false)}
              className="flex-1 font-bold text-slate-500 dark:text-neutral-400"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteParticipant}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-100 dark:shadow-red-900/20"
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ToastHost />
    </div>
  );
}
