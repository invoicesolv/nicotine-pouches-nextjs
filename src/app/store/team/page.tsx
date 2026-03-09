'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import StoreLayout from '@/components/store/StoreLayout';
import { useStoreAuth } from '@/contexts/StoreAuthContext';

interface TeamMember {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  expires_at: string;
}

const ROLE_BADGES: Record<string, { bg: string; text: string }> = {
  viewer: { bg: 'bg-gray-100', text: 'text-gray-700' },
  editor: { bg: 'bg-blue-100', text: 'text-blue-700' },
  admin: { bg: 'bg-purple-100', text: 'text-purple-700' },
  store_owner: { bg: 'bg-green-100', text: 'text-green-700' },
  super_admin: { bg: 'bg-red-100', text: 'text-red-700' },
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  viewer: 'Can view analytics and products',
  editor: 'Can view + export data',
  admin: 'Full access except billing',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function StoreTeamPage() {
  const { user } = useStoreAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [roleChangeId, setRoleChangeId] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<TeamMember | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  const canManageTeam =
    user?.role === 'store_owner' ||
    user?.role === 'admin' ||
    user?.role === 'super_admin';

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch('/api/store/team', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
        setInvites(data.invites || []);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  // Close action menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(e.target as Node)
      ) {
        setActionMenuId(null);
        setRoleChangeId(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteSending(true);
    setInviteError('');
    try {
      const res = await fetch('/api/store/team/invite', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteRole('viewer');
        fetchTeam();
      } else {
        setInviteError(data.error || 'Failed to send invite');
      }
    } catch {
      setInviteError('An error occurred');
    } finally {
      setInviteSending(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/store/team/${memberId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        fetchTeam();
      }
    } catch (error) {
      console.error('Error changing role:', error);
    } finally {
      setActionLoading(false);
      setActionMenuId(null);
      setRoleChangeId(null);
    }
  };

  const handleToggleActive = async (member: TeamMember) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/store/team/${member.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !member.is_active }),
      });
      if (res.ok) {
        fetchTeam();
      }
    } catch (error) {
      console.error('Error toggling member status:', error);
    } finally {
      setActionLoading(false);
      setActionMenuId(null);
    }
  };

  const handleRemove = async (memberId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/store/team/${memberId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        fetchTeam();
      }
    } catch (error) {
      console.error('Error removing member:', error);
    } finally {
      setActionLoading(false);
      setConfirmRemove(null);
      setActionMenuId(null);
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      const res = await fetch(`/api/store/team/invite/${inviteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        fetchTeam();
      }
    } catch (error) {
      console.error('Error cancelling invite:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    const style = ROLE_BADGES[role] || ROLE_BADGES.viewer;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
      >
        {role.replace('_', ' ')}
      </span>
    );
  };

  return (
    <StoreLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Team</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage team members and access
            </p>
          </div>
          {canManageTeam && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Invite Member
            </button>
          )}
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Team Members</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-500 text-sm">Loading team...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No team members found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    {canManageTeam && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                            {member.email[0].toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-900">
                            {member.email}
                          </span>
                          {member.id === user?.id && (
                            <span className="text-xs text-gray-400">(you)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(member.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(member.last_login)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(member.created_at)}
                      </td>
                      {canManageTeam && (
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {member.id !== user?.id && (
                            <div className="relative inline-block" ref={actionMenuId === member.id ? actionMenuRef : undefined}>
                              <button
                                onClick={() => {
                                  setActionMenuId(
                                    actionMenuId === member.id
                                      ? null
                                      : member.id
                                  );
                                  setRoleChangeId(null);
                                }}
                                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-600 hover:border-gray-300 bg-white"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                  />
                                </svg>
                              </button>

                              {actionMenuId === member.id && (
                                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-10">
                                  {/* Change Role */}
                                  <div className="relative">
                                    <button
                                      onClick={() =>
                                        setRoleChangeId(
                                          roleChangeId === member.id
                                            ? null
                                            : member.id
                                        )
                                      }
                                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between rounded-t-lg"
                                    >
                                      Change Role
                                      <svg
                                        className="w-3.5 h-3.5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M9 5l7 7-7 7"
                                        />
                                      </svg>
                                    </button>
                                    {roleChangeId === member.id && (
                                      <div className="absolute right-full top-0 mr-1 w-40 bg-white rounded-lg border border-gray-200 shadow-lg">
                                        {['viewer', 'editor', 'admin'].map(
                                          (role) => (
                                            <button
                                              key={role}
                                              onClick={() =>
                                                handleRoleChange(
                                                  member.id,
                                                  role
                                                )
                                              }
                                              disabled={
                                                actionLoading ||
                                                member.role === role
                                              }
                                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 first:rounded-t-lg last:rounded-b-lg ${
                                                member.role === role
                                                  ? 'text-gray-400'
                                                  : 'text-gray-700'
                                              }`}
                                            >
                                              <span className="capitalize">
                                                {role}
                                              </span>
                                              {member.role === role && (
                                                <span className="ml-1 text-xs text-gray-400">
                                                  (current)
                                                </span>
                                              )}
                                            </button>
                                          )
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* Activate / Deactivate */}
                                  <button
                                    onClick={() => handleToggleActive(member)}
                                    disabled={actionLoading}
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                  >
                                    {member.is_active
                                      ? 'Deactivate'
                                      : 'Activate'}
                                  </button>

                                  {/* Remove */}
                                  <button
                                    onClick={() => {
                                      setConfirmRemove(member);
                                      setActionMenuId(null);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pending Invites */}
        {invites.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-900">Pending Invites</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="px-6 py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {invite.email}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {getRoleBadge(invite.role)}
                        <span className="text-xs text-gray-400">
                          Expires {formatDate(invite.expires_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {canManageTeam && (
                    <button
                      onClick={() => handleCancelInvite(invite.id)}
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:border-gray-300 hover:text-red-600 bg-white transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowInviteModal(false);
              setInviteError('');
            }}
          />
          <div className="relative bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                Invite Team Member
              </h2>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteError('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  placeholder="colleague@example.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <div className="space-y-2">
                  {(['viewer', 'editor', 'admin'] as const).map((role) => (
                    <label
                      key={role}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        inviteRole === role
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={inviteRole === role}
                        onChange={() => setInviteRole(role)}
                        className="mt-0.5 text-gray-900 focus:ring-gray-900"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {role}
                        </span>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {ROLE_DESCRIPTIONS[role]}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {inviteError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {inviteError}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteError('');
                  }}
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteSending || !inviteEmail}
                  className="flex-1 bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {inviteSending ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setConfirmRemove(null)}
          />
          <div className="relative bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-sm mx-4">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Remove Member</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Are you sure you want to remove{' '}
                    <span className="font-medium text-gray-700">
                      {confirmRemove.email}
                    </span>
                    ? They will lose access to the store portal.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmRemove(null)}
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemove(confirmRemove.id)}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </StoreLayout>
  );
}
