import { FormEvent } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import CasePlanrLogo from './CasePlanrLogo';
import { Check } from 'lucide-react';

export type AuthMode = 'signin' | 'signup' | 'reset';

interface AuthScreenProps {
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  authEmail: string;
  setAuthEmail: (value: string) => void;
  authDisplayName: string;
  setAuthDisplayName: (value: string) => void;
  authJobTitle: string;
  setAuthJobTitle: (value: string) => void;
  authPassword: string;
  setAuthPassword: (value: string) => void;
  authConfirmPassword: string;
  setAuthConfirmPassword: (value: string) => void;
  loginError: string | null;
  authLoading: boolean;
  resetEmailSent: boolean;
  onEmailAuth: (e: FormEvent) => void;
  onPasswordReset: (e: FormEvent) => void;
  onGoogleLogin: () => void;
}

export default function AuthScreen({
  authMode,
  setAuthMode,
  authEmail,
  setAuthEmail,
  authDisplayName,
  setAuthDisplayName,
  authJobTitle,
  setAuthJobTitle,
  authPassword,
  setAuthPassword,
  authConfirmPassword,
  setAuthConfirmPassword,
  loginError,
  authLoading,
  resetEmailSent,
  onEmailAuth,
  onPasswordReset,
  onGoogleLogin,
}: AuthScreenProps) {
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50">
      <div className="h-safe-top bg-white w-full shrink-0"></div>
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <CasePlanrLogo className="w-12 h-12 drop-shadow-lg" />
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">CasePlanr</h1>
          </div>

          {authMode === 'reset' ? (
            resetEmailSent ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Check your email</h2>
                <p className="text-slate-500 text-sm">
                  We sent a password reset link to <strong>{authEmail}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="text-accent-600 text-sm font-semibold hover:underline"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={onPasswordReset} className="space-y-4">
                <div className="space-y-1 text-center mb-2">
                  <h2 className="text-xl font-bold text-slate-800">Reset Password</h2>
                  <p className="text-slate-500 text-sm">Enter your email and we'll send a reset link.</p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="reset-email" className="text-slate-700 font-semibold text-sm">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl text-center">
                    {loginError}
                  </div>
                )}
                <Button type="submit" disabled={authLoading} className="w-full bg-accent-600 hover:bg-accent-700 text-white h-11 font-bold rounded-xl transition-all active:scale-[0.98]">
                  {authLoading ? 'Sending...' : 'Send Reset Email'}
                </Button>
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="text-sm text-slate-500 hover:text-slate-700 w-full text-center"
                >
                  ← Back to sign in
                </button>
              </form>
            )
          ) : (
            <>
              <div className="text-center mb-5">
                <p className="text-slate-500 text-sm leading-relaxed text-balance">
                  {authMode === 'signin'
                    ? 'Manage cases, track milestones, and document progress — all in one place.'
                    : 'Create an account to get started with CasePlanr.'}
                </p>
              </div>

              <form onSubmit={onEmailAuth} className="space-y-3">
                {authMode === 'signup' && (
                  <>
                    <div className="space-y-1">
                      <Label htmlFor="auth-name" className="text-slate-700 font-semibold text-sm">Full Name</Label>
                      <Input
                        id="auth-name"
                        type="text"
                        placeholder="Jane Smith"
                        value={authDisplayName}
                        onChange={e => setAuthDisplayName(e.target.value)}
                        required
                        className="h-11"
                        autoFocus
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="auth-title" className="text-slate-700 font-semibold text-sm">Job Title</Label>
                      <Input
                        id="auth-title"
                        type="text"
                        placeholder="Court Case Manager"
                        value={authJobTitle}
                        onChange={e => setAuthJobTitle(e.target.value)}
                        className="h-11"
                      />
                      <p className="text-xs text-slate-400 pt-0.5">You can update this anytime in Settings.</p>
                    </div>
                  </>
                )}
                <div className="space-y-1">
                  <Label htmlFor="auth-email" className="text-slate-700 font-semibold text-sm">Email</Label>
                  <Input
                    id="auth-email"
                    type="email"
                    placeholder="you@example.com"
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="auth-password" className="text-slate-700 font-semibold text-sm">Password</Label>
                  <Input
                    id="auth-password"
                    type="password"
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                {authMode === 'signup' && (
                  <div className="space-y-1">
                    <Label htmlFor="auth-confirm" className="text-slate-700 font-semibold text-sm">Confirm Password</Label>
                    <Input
                      id="auth-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={authConfirmPassword}
                      onChange={e => setAuthConfirmPassword(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                )}
                {authMode === 'signin' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setAuthMode('reset')}
                      className="text-xs text-accent-600 hover:underline font-semibold"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl text-center">
                    {loginError}
                  </div>
                )}
                <Button type="submit" disabled={authLoading} className="w-full bg-accent-600 hover:bg-accent-700 text-white h-11 font-bold rounded-xl transition-all active:scale-[0.98]">
                  {authLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : authMode === 'signin' ? 'Sign In' : 'Create Account'}
                </Button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-3">
                {authMode === 'signin' ? (
                  <>Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setAuthMode('signup'); setAuthDisplayName(''); setAuthJobTitle(''); }}
                      className="text-accent-600 font-semibold hover:underline"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setAuthMode('signin'); setAuthDisplayName(''); setAuthJobTitle(''); }}
                      className="text-accent-600 font-semibold hover:underline"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-slate-400 uppercase tracking-wider">or</span>
                </div>
              </div>

              <Button
                onClick={onGoogleLogin}
                variant="outline"
                className="w-full h-11 font-semibold rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 transition-all active:scale-[0.98] flex items-center gap-3"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Button>
            </>
          )}

          <p className="mt-6 text-center text-xs text-slate-400">
            Secure, encrypted access for authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}
