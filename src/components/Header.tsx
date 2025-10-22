import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { supabase } from '../lib/supabase';
import { LogOut, User, Crown } from 'lucide-react';

export function Header() {
  const { user } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-slate-800 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-bold text-white">AI Chat</h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-300">Welcome, {user.email}</span>
            {!subscriptionLoading && subscription && (
              <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-full">
                <Crown className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-300 text-sm font-medium">
                  {subscription.subscription_status === 'active' ? 'Premium' : 'Free'}
                </span>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}