import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Database, FileText, Mail } from 'lucide-react';
import { Logo } from '../components/Logo';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <Logo size={36} />
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Soul Whisper
            </span>
          </Link>
          <Link
            to="/"
            className="text-slate-300 hover:text-white font-medium transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-slate-400">
            Last updated: January 2025
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 space-y-8">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Our Commitment</h2>
            </div>
            <p className="text-slate-300 leading-relaxed">
              At Soul Whisper, your privacy is our priority. We believe in transparency and your right to understand exactly how your data is handled. This policy explains what data we collect, why we need it, and how we protect it.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Information We Collect</h2>
            </div>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Account Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Email address</li>
                  <li>Full name</li>
                  <li>Password (encrypted using industry-standard bcrypt)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Content You Create</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>AI-generated content and prompts</li>
                  <li>Sales and income tracking data</li>
                  <li>Wellness logs and reflections</li>
                  <li>Calendar events and planning notes</li>
                  <li>Personal visions and affirmations</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Payment Information</h3>
                <p>
                  Payment card details are NEVER stored on our servers. All payment processing is handled securely by Stripe, a PCI-compliant payment processor trusted by companies like Apple, Amazon, and Google.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">How We Protect Your Data</h2>
            </div>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Row Level Security (RLS)</h3>
                <p>
                  Every piece of your data is protected by Row Level Security policies. This means you can ONLY access your own data. Other users cannot see your content, income, wellness logs, or any other personal information.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Encryption</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>All passwords are encrypted using bcrypt hashing</li>
                  <li>Data in transit is encrypted using HTTPS/TLS</li>
                  <li>Database connections are secured and encrypted</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Secure Authentication</h3>
                <p>
                  We use Supabase Auth, an industry-standard authentication system that implements JWT tokens and secure session management. Your login sessions are protected and automatically expire for your security.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Infrastructure</h3>
                <p>
                  Our database infrastructure is provided by Supabase, built on PostgreSQL, and hosted on secure cloud infrastructure with automatic backups and 99.9% uptime.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">How We Use Your Information</h2>
            </div>
            <div className="space-y-3 text-slate-300 leading-relaxed">
              <p>We use your information to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Provide and maintain the Soul Whisper service</li>
                <li>Process your subscription and payments</li>
                <li>Generate AI content based on your prompts</li>
                <li>Store your personal data like income tracking, wellness logs, and calendar events</li>
                <li>Send you important account updates and service notifications</li>
                <li>Improve our services and develop new features</li>
              </ul>
              <p className="font-semibold text-white mt-4">
                We will NEVER sell your personal data to third parties.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Your Rights</h2>
            </div>
            <div className="space-y-3 text-slate-300 leading-relaxed">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Access all your personal data at any time through your dashboard</li>
                <li>Update or correct your information</li>
                <li>Delete your account and all associated data</li>
                <li>Export your data</li>
                <li>Opt out of marketing communications</li>
                <li>Request a copy of your data</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Data Retention</h2>
            </div>
            <p className="text-slate-300 leading-relaxed">
              We retain your data for as long as your account is active. If you delete your account, we will permanently delete all your personal information within 30 days, except where we are required by law to retain certain information.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Third-Party Services</h2>
            </div>
            <div className="space-y-3 text-slate-300 leading-relaxed">
              <p>We use the following trusted third-party services:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  <span className="font-semibold text-white">Supabase:</span> Database and authentication infrastructure
                </li>
                <li>
                  <span className="font-semibold text-white">Stripe:</span> Payment processing (PCI-DSS compliant)
                </li>
                <li>
                  <span className="font-semibold text-white">Netlify:</span> Website hosting and deployment
                </li>
              </ul>
              <p className="mt-3">
                These services have their own privacy policies and security measures. We carefully select partners who meet our high standards for data protection.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Changes to This Policy</h2>
            </div>
            <p className="text-slate-300 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Contact Us</h2>
            </div>
            <p className="text-slate-300 leading-relaxed">
              If you have any questions about this Privacy Policy or how we handle your data, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
              <p className="text-cyan-400 font-semibold">support@soulwhisper.com</p>
            </div>
          </section>

          <div className="pt-8 border-t border-slate-700">
            <p className="text-sm text-slate-400 text-center">
              Your trust is important to us. We are committed to protecting your privacy and being transparent about our data practices.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>

      <footer className="border-t border-slate-700/50 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400 space-y-2">
          <p>© 2025 Soul Whisper. Generate smarter, not harder.</p>
          <div className="flex justify-center gap-6 text-sm">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
