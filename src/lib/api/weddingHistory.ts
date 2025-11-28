//wedding analitycs

import apiClient from "@/utils/apiClient";

export interface WeddingHistory {
  _id: string;
  weddingId: string;
  path: string;
  category: string;
  price: number;
  isPaid: boolean;
  status: string;
  totalRsvp: number;
  totalView: number;
  totalRecipient: number;
  totalImageSize: number;
  audioSize: number;
  releaseDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Get recent wedding invitations
export const getRecentInvitations = async (limit: number = 5): Promise<WeddingHistory[]> => {
  try {
    const response = await apiClient.get(`/wedding-history/recent?limit=${limit}`);
    return response.data.data;
  } catch (err) {
    console.error('Error fetching recent invitations:', err);
    throw new Error('Failed to fetch recent invitations.');
  }
};

// Get all wedding histories (untuk admin)
export const getAllWeddingHistories = async (): Promise<WeddingHistory[]> => {
  try {
    const response = await apiClient.get('/wedding-history/histories');
    return response.data.data;
  } catch (err) {
    console.error('Error fetching wedding histories:', err);
    throw new Error('Failed to fetch wedding histories.');
  }
};

// Get wedding history by ID
export const getWeddingHistory = async (weddingId: string): Promise<WeddingHistory> => {
  try {
    const response = await apiClient.get(`/wedding-history/history/${weddingId}`);
    return response.data.data;
  } catch (err) {
    console.error('Error fetching wedding history:', err);
    throw new Error('Failed to fetch wedding history.');
  }
};