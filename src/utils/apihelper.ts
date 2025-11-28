import apiClient from "./apiClient";

// Health Check
export type HealthStatus = {
  ok: boolean;
  code?: number;
  message: string;
  latency?: string;
  database?: string;
  uptime?: string;
  timestamp?: string;
  environment?: string;
};

export const getHealthStatus = async (): Promise<HealthStatus> => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/`, { cache: "no-store" });
    const data = await res.json();

    if (!res.ok) {
      return { ok: false, code: res.status, message: `Backend error: ${res.status}` };
    }

    return {
      ok: data.status === 1,
      code: res.status,
      message: data.status === 1 ? "Backend connected" : "Backend error",
      latency: data.latency,
      database: data.database,
      uptime: data.uptime,
      timestamp: data.timestamp,
      environment: data.environment,
    };
  } catch (err: any) {
    return {
      ok: false,
      message: err?.message || "Cannot connect to backend (maybe 504)",
      code: 504,
    };
  }
};

export interface TemplateAnalytics {
  _id: string;
  name: string;
  views: number;
  lastViewed: string;
  createdAt: string;
  updatedAt: string;
}

// Get template analytics
export const getTemplateAnalytics = async (templateName: string): Promise<TemplateAnalytics> => {
  try {
    const response = await apiClient.get(`/template/analytics/${templateName}`);
    return response.data.data;
  } catch (err) {
    console.error('Error fetching template analytics:', err);
    throw new Error('Failed to fetch template analytics.');
  }
};

// Get all templates analytics
export const getAllTemplatesAnalytics = async (): Promise<TemplateAnalytics[]> => {
  try {
    const response = await apiClient.get('/template/analytics');
    return response.data.data;
  } catch (err) {
    console.error('Error fetching all templates analytics:', err);
    throw new Error('Failed to fetch templates analytics.');
  }
};