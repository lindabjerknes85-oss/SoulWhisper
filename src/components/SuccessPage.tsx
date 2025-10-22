import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home, CreditCard } from 'lucide-react';

export function SuccessPage() {
  useEffect(() => {
    // Clear any checkout-related data from localStorage
    localStorage.removeItem('checkout_session_id');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-slate-400 mb-8 leading-relaxed">
            Thank you for your subscription! Your payment has been processed successfully and your account has been upgraded.
          </p>

          <div className="space-y-4">
            <Link
              to="/dashboard"
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              Go to Dashboard
            </Link>

            <Link
              to="/"
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
          </div>

          <div className="mt-8 p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
            <p className="text-green-300 text-sm">
              <strong>What's next?</strong><br />
              You now have access to all premium features. Start creating amazing content with our AI tools!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}