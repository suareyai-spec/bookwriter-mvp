'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const roles = [
  { value: 'physician', label: 'Physician / Provider' },
  { value: 'nurse', label: 'Nurse / Care Manager' },
  { value: 'admin', label: 'Practice Administrator' },
  { value: 'analyst', label: 'Data Analyst' },
  { value: 'billing', label: 'Billing / Coding Specialist' },
  { value: 'executive', label: 'Executive (CMO, CEO, COO)' },
  { value: 'payer', label: 'Payer / Insurance Analyst' },
  { value: 'it', label: 'IT / Technical' },
  { value: 'other', label: 'Other' },
];

const joinMethods = ['create', 'join'] as const;

export default function SignupPage() {
  const [step, setStep] = useState(1);

  // Step 1: Personal info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2: Organization
  const [joinMethod, setJoinMethod] = useState<'create' | 'join'>('join');
  const [orgCode, setOrgCode] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('provider');
  const [orgNpi, setOrgNpi] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const inputClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/10 transition-all text-[#1d1d1f] placeholder-[#86868b]";
  const selectClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/10 transition-all text-[#1d1d1f] appearance-none cursor-pointer";

  const validateStep1 = () => {
    if (!firstName.trim()) { setError('First name is required'); return false; }
    if (!lastName.trim()) { setError('Last name is required'); return false; }
    if (!email.trim()) { setError('Email is required'); return false; }
    if (!password) { setError('Password is required'); return false; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return false; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return false; }
    if (!role) { setError('Please select your role'); return false; }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (joinMethod === 'join' && !orgCode.trim()) { setError('Please enter an organization code'); return; }
    if (joinMethod === 'create' && !orgName.trim()) { setError('Organization name is required'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          role,
          phone: phone || undefined,
          joinMethod,
          orgCode: joinMethod === 'join' ? orgCode : undefined,
          orgName: joinMethod === 'create' ? orgName : undefined,
          orgType: joinMethod === 'create' ? orgType : undefined,
          orgNpi: joinMethod === 'create' ? orgNpi : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) router.push('/auth/login?registered=1');
      else setError(data.error || 'Signup failed');
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#f5f5f7]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <Image src="/logo.svg" alt="KOSIQ" width={140} height={32} className="h-8 w-auto" />
          </Link>
          <p className="text-[11px] text-[#86868b] tracking-widest uppercase font-medium mb-4">The Operating System for Value-Based Care</p>
          <h1 className="text-2xl font-bold text-[#1d1d1f]">Create your account</h1>
          <p className="text-sm text-[#86868b] mt-1">Step {step} of 2</p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-6">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-[#0071e3]' : 'bg-gray-200'}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-[#0071e3]' : 'bg-gray-200'}`} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {error && <div className="text-[#ff3b30] text-sm text-center bg-[#ff3b30]/5 rounded-xl p-3 font-medium mb-5">{error}</div>}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#86868b] mb-1.5 uppercase tracking-wider font-medium">First Name *</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="David" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-[#86868b] mb-1.5 uppercase tracking-wider font-medium">Last Name *</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Suarez" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#86868b] mb-1.5 uppercase tracking-wider font-medium">Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@organization.com" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-[#86868b] mb-1.5 uppercase tracking-wider font-medium">Phone (optional)</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 123-4567" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-[#86868b] mb-1.5 uppercase tracking-wider font-medium">Role *</label>
                <select value={role} onChange={e => setRole(e.target.value)} className={selectClass}>
                  <option value="">Select your role...</option>
                  {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#86868b] mb-1.5 uppercase tracking-wider font-medium">Password *</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 6 characters" minLength={6} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-[#86868b] mb-1.5 uppercase tracking-wider font-medium">Confirm Password *</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" className={inputClass} />
              </div>
              <button type="button" onClick={handleNext} className="w-full py-3 bg-[#0071e3] text-white text-sm font-medium rounded-xl hover:bg-[#0077ED] transition-colors">
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs text-[#86868b] mb-3 uppercase tracking-wider font-medium">How would you like to get started?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => { setJoinMethod('join'); setError(''); }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${joinMethod === 'join' ? 'border-[#0071e3] bg-[#0071e3]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <p className="text-sm font-semibold text-[#1d1d1f]">Join Organization</p>
                    <p className="text-[10px] text-[#86868b] mt-1">I have an invite code</p>
                  </button>
                  <button type="button" onClick={() => { setJoinMethod('create'); setError(''); }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${joinMethod === 'create' ? 'border-[#0071e3] bg-[#0071e3]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <p className="text-sm font-semibold text-[#1d1d1f]">Create Organization</p>
                    <p className="text-[10px] text-[#86868b] mt-1">Set up a new account</p>
                  </button>
                </div>
              </div>

              {joinMethod === 'join' && (
                <div>
                  <label className="block text-xs text-[#86868b] mb-1.5 uppercase tracking-wider font-medium">Organization Code *</label>
                  <input type="text" value={orgCode} onChange={e => setOrgCode(e.target.value.toUpperCase())} placeholder="e.g., SFHP-2026" className={inputClass} />
                  <p className="text-[10px] text-[#86868b] mt-1.5">Ask your organization admin for this code</p>
                </div>
              )}

              {joinMethod === 'create' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-[#86868b] mb-1.5 uppercase tracking-wider font-medium">Organization Name *</label>
                    <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="e.g., South Florida Health Partners" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs text-[#86868b] mb-1.5 uppercase tracking-wider font-medium">Organization Type *</label>
                    <select value={orgType} onChange={e => setOrgType(e.target.value)} className={selectClass}>
                      <option value="provider">Healthcare Provider / Practice</option>
                      <option value="payer">Insurance / Managed Care Organization</option>
                      <option value="aco">Accountable Care Organization (ACO)</option>
                      <option value="health_system">Health System / Hospital</option>
                      <option value="mso">Management Services Organization (MSO)</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#86868b] mb-1.5 uppercase tracking-wider font-medium">NPI Number (optional)</label>
                    <input type="text" value={orgNpi} onChange={e => setOrgNpi(e.target.value)} placeholder="10-digit NPI" maxLength={10} className={inputClass} />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => { setStep(1); setError(''); }} className="flex-1 py-3 bg-[#f5f5f7] text-[#1d1d1f] text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors">
                  Back
                </button>
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-[#0071e3] text-white text-sm font-medium rounded-xl hover:bg-[#0077ED] transition-colors disabled:opacity-50">
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-[#86868b] mt-5">
            Already have an account? <Link href="/auth/login" className="text-[#0071e3] hover:underline font-medium">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-[10px] text-[#86868b] mt-6">
          By creating an account you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
