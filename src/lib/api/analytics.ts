import apiClient from "@/utils/apiClient";


export interface DashboardAnalytics {
  totalIncome: number;
  totalInvitations: number;
  totalTemplateViews: number;
  totalStorageUsage: number;
  growthRate: number;
  metrics: {
    incomeGrowth: number;
    invitationGrowth: number;
    viewsGrowth: number;
    storageGrowth: number;
  };
}

export interface AnalyticsResponse {
  status: number;
  data: DashboardAnalytics;
  message: string;
}

// Get dashboard analytics
export const getDashboardAnalytics = async (): Promise<DashboardAnalytics> => {
  try {
    const response = await apiClient.get<AnalyticsResponse>('/analytics/dashboard');
    return response.data.data;
  } catch (err) {
    console.error('Error fetching dashboard analytics:', err);
    throw new Error('Failed to fetch dashboard analytics.');
  }
};