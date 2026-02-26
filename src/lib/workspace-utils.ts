import { supabase } from './supabase';

/**
 * Get the active workspace ID for a user
 * Returns the first active workspace the user belongs to, or null if none found
 */
export async function getActiveWorkspaceId(userId: string): Promise<string | null> {
  try {
    const { data: userWorkspace, error } = await supabase()
      .from('user_workspaces')
      .select('workspace_id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !userWorkspace) {
      console.error('Error fetching active workspace:', error);
      return null;
    }

    return userWorkspace.workspace_id;
  } catch (error) {
    console.error('Error in getActiveWorkspaceId:', error);
    return null;
  }
}


