import apiClient from "@/utils/apiClient";


export interface RSVP {
  _id: string;
  weddingId: string;
  sender: string;
  message: string;
  attendance: "Tidak hadir" | "Hadir" | "Ragu-ragu";
  createdDate: string;
  wedding?: {
    _id: string;
    path?: string;
  };
}

export interface RSVPResponse {
  data: RSVP[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SearchRSVPOptions {
  search?: string;
  attendance?: string;
  path?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Get RSVP by wedding ID
export const getRSVPByWeddingId = async (weddingId: string): Promise<RSVP[]> => {
  try {
    const response = await apiClient.get(`/rsvp/${weddingId}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching RSVP:', err);
    throw new Error('Failed to fetch RSVP data.');
  }
};

// Get all RSVP (for admin)
export const getAllRSVP = async (page: number = 1, limit: number = 50): Promise<RSVPResponse> => {
  try {
    const response = await apiClient.get(`/rsvp?page=${page}&limit=${limit}`);
    const d = response.data
    console.log({d})
    return response.data;
  } catch (err) {
    console.error('Error fetching all RSVP:', err);
    throw new Error('Failed to fetch RSVP data.');
  }
};

// Search RSVP
export const searchRSVP = async (options: SearchRSVPOptions = {}): Promise<RSVPResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (options.search) params.append('search', options.search);
    if (options.attendance) params.append('attendance', options.attendance);
    if (options.path) params.append('path', options.path);
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);
    
    const response = await apiClient.get(`/rsvp/search?${params.toString()}`);
    return response.data;
  } catch (err) {
    console.error('Error searching RSVP:', err);
    throw new Error('Failed to search RSVP.');
  }
};

// Delete RSVP
export const deleteRSVP = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/rsvp/${id}`);
  } catch (err) {
    console.error('Error deleting RSVP:', err);
    throw new Error('Failed to delete RSVP.');
  }
};