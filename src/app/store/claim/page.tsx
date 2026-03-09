'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Vendor {
  id: string;
  name: string;
  country: string;
  logo_url: string | null;
  website_url: string | null;
  claimed: boolean;
  has_account: boolean;
}

interface TokenInfo {
  vendor: { name: string; country: string; logo_url: string | null } | null;
  email: string | null;
}

export default function ClaimStorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    }>
      <ClaimStoreContent />
    </Suspense>
  );
}

function ClaimStoreContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // Step 1: Pick vendor & request claim
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [email, setEmail] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [error, setError] = useState('');

  // Step 2: Complete claim (from email link)
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState('');
  const [claimEmail, setClaimEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimComplete, setClaimComplete] = useState(false);

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      fetchVendors();
    }
  }, [token]);

  const fetchVendors = async () => {
    try {
      const res = await fetch('/api/store/claim/vendors');
      if (res.ok) {
        const data = await res.json();
        setVendors(data.vendors || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const validateToken = async () => {
    try {
      const res = await fetch(`/api/store/claim?token=${token}`);
      const data = await res.json();
      if (res.ok && data.valid) {
        setTokenValid(true);
        setTokenInfo(data);
        setClaimEmail(data.email || '');
      } else {
        setTokenValid(false);
        setTokenError(data.error || 'Invalid token');
      }
    } catch {
      setTokenValid(false);
      setTokenError('Failed to validate token');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor || !email) return;
    setError('');
    setRequesting(true);

    try {
      const res = await fetch('/api/store/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_id: selectedVendor.id, email }),
      });
      const data = await res.json();
      if (res.ok) {
        setRequestSent(true);
      } else {
        setError(data.error || 'Failed to send claim request');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setRequesting(false);
    }
  };

  const handleCompleteClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setClaiming(true);
    try {
      const res = await fetch('/api/store/claim', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email: claimEmail, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setClaimComplete(true);
      } else {
        setError(data.error || 'Failed to complete claim');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Step 2: Complete claim form (arrived from email)
  if (token) {
    if (claimComplete) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Store Claimed</h1>
              <p className="text-gray-600 text-sm mb-6">
                Your store is ready. All your product data, pricing, and analytics are waiting for you.
              </p>
              <Link
                href="/store/login"
                className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Log In to Your Store
              </Link>
            </div>
          </div>
        </div>
      );
    }

    if (tokenValid === false) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h1>
            <p className="text-gray-600 text-sm mb-6">{tokenError}</p>
            <Link href="/store/claim" className="text-sm text-blue-600 hover:underline">
              Request a new claim link
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            {tokenInfo?.vendor?.logo_url && (
              <img src={tokenInfo.vendor.logo_url} alt={tokenInfo.vendor.name} className="w-16 h-16 object-contain mx-auto mb-4 rounded-xl" />
            )}
            <h1 className="text-2xl font-bold text-gray-900">Claim {tokenInfo?.vendor?.name}</h1>
            <p className="text-gray-500 text-sm mt-2">Set your email and password to access your store portal</p>
          </div>

          <form onSubmit={handleCompleteClaim} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={claimEmail}
                onChange={(e) => setClaimEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="Confirm password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
            )}

            <button
              type="submit"
              disabled={claiming}
              className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {claiming ? 'Setting up...' : 'Claim Store'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Step 1: Vendor selection & claim request
  if (requestSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h1>
          <p className="text-gray-600 text-sm mb-2">
            We sent a verification link to <strong>{email}</strong>
          </p>
          <p className="text-gray-500 text-xs">
            Click the link in the email to complete your store claim. The link expires in 48 hours.
          </p>
          <div className="mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => { setRequestSent(false); setSelectedVendor(null); setEmail(''); }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Claim Your Store</h1>
          <p className="text-gray-500 text-sm mt-2">
            Your store already has products, pricing, and analytics on nicotine-pouches.org.
            <br />Claim it to access your dashboard.
          </p>
        </div>

        {/* Vendor selection */}
        {!selectedVendor ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Select your store:</p>
            {vendors.map((v) => (
              <button
                key={v.id}
                onClick={() => !v.claimed && setSelectedVendor(v)}
                disabled={v.claimed}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-colors ${
                  v.claimed
                    ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                    : 'border-gray-200 bg-white hover:border-gray-900 hover:shadow-sm cursor-pointer'
                }`}
              >
                {v.logo_url ? (
                  <img src={v.logo_url} alt={v.name} className="w-10 h-10 object-contain rounded-lg" />
                ) : (
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-bold text-gray-500">
                    {v.name[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{v.name}</div>
                  <div className="text-xs text-gray-500">{v.country === 'us' ? 'US' : 'UK'} Store</div>
                </div>
                {v.claimed ? (
                  <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">Claimed</span>
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            ))}

            <div className="text-center pt-4">
              <Link href="/store/login" className="text-sm text-gray-500 hover:text-gray-700">
                Already have an account? Log in
              </Link>
            </div>
          </div>
        ) : (
          /* Email form */
          <div className="max-w-md mx-auto">
            <button
              onClick={() => setSelectedVendor(null)}
              className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                {selectedVendor.logo_url ? (
                  <img src={selectedVendor.logo_url} alt={selectedVendor.name} className="w-10 h-10 object-contain rounded-lg" />
                ) : (
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-bold text-gray-500">
                    {selectedVendor.name[0]}
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900">{selectedVendor.name}</div>
                  <div className="text-xs text-gray-500">{selectedVendor.country === 'us' ? 'US' : 'UK'} Store</div>
                </div>
              </div>

              <form onSubmit={handleRequestClaim} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your business email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@yourstore.com"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <p className="text-xs text-gray-400 mt-1">We'll send a verification link to this email</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={requesting}
                  className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {requesting ? 'Sending...' : 'Send Verification Email'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
