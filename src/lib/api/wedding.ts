import apiClient from "@/utils/apiClient";

export interface Wedding {
  groom: {
    shortName: string;
    fullName: string;
    fullNameWithTitle: string;
    fatherName: string;
    motherName: string;
    orderInFamily?: string;
    instagram?: string;
  };
  bride: {
    shortName: string;
    fullName: string;
    fullNameWithTitle: string;
    fatherName: string;
    motherName: string;
    orderInFamily?: string;
    instagram?: string;
  };
  quotes: {
    quote1: string;
    quote1From: string;
    quote2?: string;
    quote2From?: string;
  };
  akad: {
    isAkad:boolean;
    time?: string;
    timeRange?: {
      start: string;
      end: string;
    };
    date: string;
    place: string;
    address: string;
    liveLink?: string;
  };
  resepsi: {
    eventCategory: string;
    isResepsi: boolean;
    time?: string;
    timeRange?: {
      start: string;
      end: string;
    };
    date: string;
    place: string;
    address: string;
    liveLink?: string;
    mapsLink?: string;
  };
  loveStory: {
    loveStoryActived: boolean;
    firstMeet?: string;
    theProposal?: string;
    marriage?: string;
  };
  gift: {
    isRecieveGift: boolean;
    giftAddress?: string;
    nameNoRek1?: string;
    groomBank?: string;
    groomNoRek?: string;
    nameNoRek2?: string;
    brideBank?: string;
    brideNoRek?: string;
  };
  dressColors?: string[];
  otherInfo?: {
    [key: string]: string;
  };
  imageUrl: {
    groomImg?: string;
    brideImg?: string;
    heroImg?: string;
    headerImg?: string;
    eventImg?: string;
    eventImg2?: string;
    quoteImg?: string;
    loveStoryImg?: string;
    giftImg?: string;
    rsvpImg?: string;
    footerImg1?: string;
    footerImg2?: string;
    img1?: string;
    img2?: string;
    img3?: string;
  };
  media: {
    audio: string;
    youtubeVideoId?: string;
  };
  _id: string;
  path?: string;
  isActive?: boolean;
  category: string;
  createdAt: Date;
  updatedAt: string;
}


export interface WeddingResponse {
  data: Wedding[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}


export interface WeddingFilters {
  path?: string;
  category?: string;
  isActive?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Get all weddings with filters
export const getWeddings = async (filters?: WeddingFilters): Promise<WeddingResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters?.path) params.append('path', filters.path);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.isActive) params.append('isActive', filters.isActive);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await apiClient.get(`/wedding?${params.toString()}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching weddings:', err);
    throw new Error('Failed to fetch weddings.');
  }
};

// Get wedding by ID
export const getWedding = async (id: string): Promise<Wedding> => {
  try {
    const response = await apiClient.get(`/wedding/${id}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching wedding:', err);
    throw new Error('Failed to fetch wedding.');
  }
};

// Create new wedding
export const createWedding = async (weddingData: Partial<Wedding>): Promise<{message: string, data: Wedding}> => {
  try {
    const response = await apiClient.post('/wedding', weddingData);
    return response.data;
  } catch (err) {
    console.error('Error creating wedding:', err);
    throw new Error('Failed to create wedding.');
  }
};

// Update wedding
export const updateWedding = async (id: string, weddingData: Partial<Wedding>): Promise<{message: string, data: Wedding}> => {
  try {
    const response = await apiClient.patch(`/wedding/${id}`, weddingData);
    return response.data;
  } catch (err) {
    console.error('Error updating wedding:', err);
    throw new Error('Failed to update wedding.');
  }
};

// Delete wedding
export const deleteWedding = async (id: string): Promise<{message: string}> => {
  try {
    const response = await apiClient.delete(`/wedding/${id}`);
    return response.data;
  } catch (err) {
    console.error('Error deleting wedding:', err);
    throw new Error('Failed to delete wedding.');
  }
};

export const updateStatusWedding = async (id: string): Promise<{message: string, data: Wedding}> => {
  try {
    const response = await apiClient.patch(`/wedding/status/${id}`);
    return response.data;
  } catch (err) {
    console.error('Error updating wedding status:', err);
    throw new Error('Failed to update wedding status.');
  }
};