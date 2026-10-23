'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { APP_CONFIG } from '@/lib/config';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const [isDemo, setIsDemo] = useState(false);
  const [demoUsers, setDemoUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if Supabase keys exist or if running in demo mode
    fetch('/api/auth/demo')
      .then((res) => res.json())
      .then((data) => {
        if (data.users) {
          setDemoUsers(data.users);
          setIsDemo(true);
        }
      })
      .catch(() => {});
  }, []);

  async function handleGoogleLogin() {
    setLoading(true);
    const supabase = createClient();
    if (!supabase) {
      alert('Supabase credentials are not configured in environment. Please use Demo Mode below.');
      setLoading(false);
      return;
    }

    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
  }

  async function handleSelectDemoUser(userId) {
    setLoading(true);
    await fetch('/api/auth/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    window.location.href = '/';
  }

  return (
    <div className="max-w-md mx-auto my-12 bg-white border border-stone-200 rounded-lg p-8 shadow-sm">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded bg-emerald-800 text-white font-bold text-xl flex items-center justify-center mx-auto mb-3">
          CB
        </div>
        <h1 className="text-xl font-bold text-stone-900">Sign in to {APP_CONFIG.name}</h1>
        <p className="text-xs text-stone-500 mt-1">
          Bennett University student access portal
        </p>
      </div>

      {errorParam && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded mb-5">
          {errorParam}
        </div>
      )}

      {/* Production Google Sign In */}
      <div className="space-y-4">
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Sign in with Google (@{APP_CONFIG.allowedEmailDomain || 'bennett.edu.in'})</span>
        </button>

        {/* Demo Mode Direct Login Options */}
        {isDemo && (
          <div className="pt-6 border-t border-stone-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Demo Student Accounts
              </span>
              <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-medium">
                Zero Setup Required
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mb-3">
              No Google credentials needed in demo mode. Choose a student persona to explore the app:
            </p>

            <div className="space-y-2">
              {demoUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSelectDemoUser(u.id)}
                  disabled={loading}
                  className="w-full text-left p-2.5 rounded border border-stone-200 hover:border-emerald-700 hover:bg-emerald-50 text-xs flex items-center justify-between transition"
                >
                  <div>
                    <span className="font-semibold text-stone-900 block">{u.name}</span>
                    <span className="text-stone-500 text-[10px]">{u.branch} • Semester {u.semester}</span>
                  </div>
                  <span className="text-[10px] text-stone-600 font-mono">{u.role}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
