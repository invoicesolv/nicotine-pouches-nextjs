'use client';

import { useState, useEffect, useCallback } from 'react';
import StoreLayout from '@/components/store/StoreLayout';
import { useStoreAuth } from '@/contexts/StoreAuthContext';

interface Subscription {
  id: string | null;
  vendor_id: string;
  plan: 'free' | 'pro';
  status: 'active' | 'past_due' | 'cancelled' | 'trialing';
  price_cents: number;
  currency: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_payment_method_id: string | null;
  card_last4: string | null;
  card_brand: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  cancelled_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface Payment {
  id: string;
  vendor_id: string;
  amount_cents: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending' | 'refunded';
  description: string | null;
  invoice_url: string | null;
  created_at: string;
}

const FREE_FEATURES = [
  'Basic analytics dashboard',
  'Product listings on comparison pages',
  'Vendor profile page',
  'Stock status tracking',
];

const PRO_FEATURES = [
  'Full analytics with trends and charts',
  'CSV data exports',
  'Price rankings vs competitors',
  'Automated email reports',
  'Team collaboration (coming soon)',
  'Priority support',
];

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  past_due: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  trialing: 'bg-blue-100 text-blue-800',
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  succeeded: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
  refunded: 'bg-gray-100 text-gray-600',
};

export default function StoreBillingPage() {
  const { user } = useStoreAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardLast4, setCardLast4] = useState('');
  const [cardBrand, setCardBrand] = useState('visa');
  const [cardSaving, setCardSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [paymentPage, setPaymentPage] = useState(0);

  const canManageBilling = user?.role === 'store_owner' || user?.role === 'super_admin';
  const isPro = subscription?.plan === 'pro';
  const paymentsPerPage = 10;
  const totalPaymentPages = Math.ceil(payments.length / paymentsPerPage);
  const paginatedPayments = payments.slice(
    paymentPage * paymentsPerPage,
    (paymentPage + 1) * paymentsPerPage
  );

  const fetchBilling = useCallback(async () => {
    try {
      const res = await fetch('/api/store/billing', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSubscription(data.subscription);
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error('Error fetching billing:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBilling();
  }, [fetchBilling]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleSubscribe = async (plan: 'pro' | 'free') => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/store/billing/subscribe', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (res.ok) {
        showMessage('success', plan === 'pro' ? 'Successfully upgraded to Pro!' : 'Your plan has been cancelled.');
        await fetchBilling();
      } else {
        showMessage('error', data.error || 'Failed to update subscription');
      }
    } catch {
      showMessage('error', 'An error occurred. Please try again.');
    } finally {
      setActionLoading(false);
      setShowCancelConfirm(false);
      setShowUpgradeConfirm(false);
    }
  };

  const handleSaveCard = async () => {
    if (cardLast4.length !== 4 || !/^\d{4}$/.test(cardLast4)) {
      showMessage('error', 'Please enter the last 4 digits of your card.');
      return;
    }
    setCardSaving(true);
    try {
      const res = await fetch('/api/store/billing/payment-method', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_last4: cardLast4, card_brand: cardBrand }),
      });
      const data = await res.json();
      if (res.ok) {
        showMessage('success', 'Payment method updated.');
        setShowCardModal(false);
        setCardLast4('');
        await fetchBilling();
      } else {
        showMessage('error', data.error || 'Failed to update payment method.');
      }
    } catch {
      showMessage('error', 'An error occurred. Please try again.');
    } finally {
      setCardSaving(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatAmount = (cents: number, currency: string = 'eur') => {
    const symbol = currency === 'eur' ? '\u20AC' : currency === 'gbp' ? '\u00A3' : '$';
    return `${symbol}${(cents / 100).toFixed(2)}`;
  };

  return (
    <StoreLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">Billing</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your subscription and payment method
          </p>
        </div>

        {/* Action Message */}
        {actionMessage && (
          <div
            className={`rounded-lg px-4 py-3 text-sm font-medium ${
              actionMessage.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {actionMessage.text}
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Current Plan Card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Current Plan</h2>
                {isPro && subscription?.status && (
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      STATUS_STYLES[subscription.status] || 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {subscription.status === 'past_due'
                      ? 'Past Due'
                      : subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </span>
                )}
              </div>
              <div className="p-6">
                {isPro ? (
                  <div className="space-y-4">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-lg font-bold text-gray-900">Pro Plan</h3>
                      <span className="text-gray-500">&mdash;</span>
                      <span className="text-lg font-semibold text-green-700">
                        {'\u20AC'}100/month
                      </span>
                    </div>
                    {(subscription?.current_period_start || subscription?.current_period_end) && (
                      <div className="text-sm text-gray-500">
                        Current period: {formatDate(subscription.current_period_start)} &ndash;{' '}
                        {formatDate(subscription.current_period_end)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Included features:</p>
                      <ul className="space-y-1.5">
                        {PRO_FEATURES.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                            <svg
                              className="w-4 h-4 text-green-600 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {canManageBilling && (
                      <div className="pt-2">
                        <button
                          onClick={() => setShowCancelConfirm(true)}
                          disabled={actionLoading}
                          className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                        >
                          Cancel Plan
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900">Free Plan</h3>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">What&apos;s included:</p>
                      <ul className="space-y-1.5">
                        {FREE_FEATURES.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                            <svg
                              className="w-4 h-4 text-gray-400 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pro features comparison */}
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Upgrade to Pro for:
                      </p>
                      <ul className="space-y-1.5">
                        {PRO_FEATURES.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm text-gray-400">
                            <svg
                              className="w-4 h-4 text-green-400 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {canManageBilling && (
                      <div className="pt-2">
                        <button
                          onClick={() => setShowUpgradeConfirm(true)}
                          disabled={actionLoading}
                          className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                          Upgrade to Pro &mdash; {'\u20AC'}100/month
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Card (pro only) */}
            {isPro && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="font-semibold text-gray-900">Payment Method</h2>
                </div>
                <div className="p-6">
                  {subscription?.card_last4 ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                          <span className="text-xs font-bold text-gray-500 uppercase">
                            {subscription.card_brand || 'Card'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {subscription.card_brand
                              ? subscription.card_brand.charAt(0).toUpperCase() +
                                subscription.card_brand.slice(1)
                              : 'Card'}{' '}
                            ending in {subscription.card_last4}
                          </p>
                          <p className="text-xs text-gray-500">
                            {'\u2022\u2022\u2022\u2022'} {'\u2022\u2022\u2022\u2022'}{' '}
                            {'\u2022\u2022\u2022\u2022'} {subscription.card_last4}
                          </p>
                        </div>
                      </div>
                      {canManageBilling && (
                        <button
                          onClick={() => {
                            setCardLast4(subscription.card_last4 || '');
                            setCardBrand(subscription.card_brand || 'visa');
                            setShowCardModal(true);
                          }}
                          className="text-sm text-gray-600 hover:text-gray-900 font-medium border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-300 transition-colors"
                        >
                          Update Card
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 mb-3">No payment method on file.</p>
                      {canManageBilling && (
                        <button
                          onClick={() => {
                            setCardLast4('');
                            setCardBrand('visa');
                            setShowCardModal(true);
                          }}
                          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                          Add Payment Method
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment History */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-900">Payment History</h2>
              </div>
              <div className="p-6">
                {payments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No payment history yet.
                  </p>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Date
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Description
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                              Amount
                            </th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                              Status
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                              Invoice
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {paginatedPayments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                {formatDate(payment.created_at)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {payment.description || 'Pro subscription'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium whitespace-nowrap">
                                {formatAmount(payment.amount_cents, payment.currency)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                                    PAYMENT_STATUS_STYLES[payment.status] || 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                {payment.invoice_url ? (
                                  <a
                                    href={payment.invoice_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline"
                                  >
                                    View
                                  </a>
                                ) : (
                                  <span className="text-sm text-gray-400">--</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {totalPaymentPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Showing {paymentPage * paymentsPerPage + 1}&ndash;
                          {Math.min((paymentPage + 1) * paymentsPerPage, payments.length)} of{' '}
                          {payments.length}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPaymentPage((p) => Math.max(0, p - 1))}
                            disabled={paymentPage === 0}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() =>
                              setPaymentPage((p) => Math.min(totalPaymentPages - 1, p + 1))
                            }
                            disabled={paymentPage >= totalPaymentPages - 1}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowCancelConfirm(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Pro Plan?</h3>
            <p className="text-sm text-gray-600 mb-1">
              Your plan will remain active until the end of your current billing period
              {subscription?.current_period_end
                ? ` (${formatDate(subscription.current_period_end)})`
                : ''}
              .
            </p>
            <p className="text-sm text-gray-500 mb-6">
              After that, your account will revert to the Free plan. Are you sure?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors disabled:opacity-50"
              >
                Keep Plan
              </button>
              <button
                onClick={() => handleSubscribe('free')}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Cancelling...' : 'Yes, Cancel Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Confirmation Modal */}
      {showUpgradeConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowUpgradeConfirm(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upgrade to Pro</h3>
            <p className="text-sm text-gray-600 mb-4">
              You will be billed {'\u20AC'}100/month for the Pro plan. Your subscription starts
              immediately.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-green-800 mb-2">Pro includes:</p>
              <ul className="space-y-1">
                {PRO_FEATURES.map((feature) => (
                  <li key={feature} className="text-sm text-green-700 flex items-center gap-2">
                    <svg
                      className="w-3.5 h-3.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowUpgradeConfirm(false)}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubscribe('pro')}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Upgrading...' : 'Confirm Upgrade'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Modal */}
      {showCardModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowCardModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {subscription?.card_last4 ? 'Update' : 'Add'} Payment Method
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Brand</label>
                <select
                  value={cardBrand}
                  onChange={(e) => setCardBrand(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="amex">American Express</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last 4 Digits
                </label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="4242"
                  value={cardLast4}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setCardLast4(val);
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Enter the last 4 digits of your card number.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowCardModal(false)}
                disabled={cardSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCard}
                disabled={cardSaving || cardLast4.length !== 4}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {cardSaving ? 'Saving...' : 'Save Card'}
              </button>
            </div>
          </div>
        </div>
      )}
    </StoreLayout>
  );
}
