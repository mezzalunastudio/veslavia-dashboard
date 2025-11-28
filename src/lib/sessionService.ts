// services/sessionService.ts
import apiClient from "@/utils/apiClient";

export interface Session {
  id: string;
  userId: string;
  userAgent: string;
  ip: string;
  expiresAt: string;
  createdAt: string;
  current?: boolean;
}

export interface SessionsResponse {
  success: boolean;
  data: {
    sessions: Session[];
  };
}

// Get all sessions for current user
export const getUserSessions = async (): Promise<Session[]> => {
  try {
    // Gunakan fetch langsung dengan credentials untuk session-related calls
    const response = await fetch('/api/sessions', {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch sessions');
    }
    
    const data: SessionsResponse = await response.json();
    return data.data.sessions;
  } catch (err) {
    console.error('Error fetching user sessions:', err);
    throw new Error('Failed to fetch user sessions.');
  }
};

// Delete a session
export const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    const response = await fetch(`/api/sessions?id=${sessionId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete session');
    }
  } catch (err) {
    console.error('Error deleting session:', err);
    throw new Error('Failed to delete session.');
  }
};

// Terminate all other sessions
export const terminateOtherSessions = async (): Promise<void> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sessions/others`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to terminate other sessions');
    }
  } catch (err) {
    console.error('Error terminating other sessions:', err);
    throw new Error('Failed to terminate other sessions.');
  }
};