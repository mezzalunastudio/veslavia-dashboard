import apiClient from "@/utils/apiClient";

export interface Transaction {
  _id: string;
  transactionDate: string;
  transactionName: string;
  transactionType: "income" | "expense";
  amount: number;
  paymentMethod: string;
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFormValues {
  transactionDate: string;
  transactionName: string;
  transactionType: "income" | "expense";
  amount: number;
  paymentMethod: string;
  description: string;
  category: string;
}

export interface TransactionStats {
  summary: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    transactionCount: number;
  };
  byCategory: Array<{
    _id: string;
    totalAmount: number;
    count: number;
  }>;
  byPaymentMethod: Array<{
    _id: string;
    totalAmount: number;
    count: number;
  }>;
  byType: Array<{
    _id: string;
    totalAmount: number;
    count: number;
    averageAmount: number;
  }>;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface TransactionFilters {
  type?: string;
  category?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Get all transactions with filters
export const getTransactions = async (filters?: TransactionFilters): Promise<TransactionsResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters?.type) params.append('type', filters.type);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get(`/transactions?${params.toString()}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching transactions:', err);
    throw new Error('Failed to fetch transactions.');
  }
};

// Get transaction by ID
export const getTransactionById = async (id: string): Promise<Transaction> => {
  try {
    const response = await apiClient.get(`/transactions/${id}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching transaction:', err);
    throw new Error('Failed to fetch transaction.');
  }
};

// Create new transaction
export const createTransaction = async (transactionData: TransactionFormValues): Promise<Transaction> => {
  try {
    const response = await apiClient.post('/transactions', transactionData);
    return response.data;
  } catch (err) {
    console.error('Error creating transaction:', err);
    throw new Error('Failed to create transaction.');
  }
};

// Update transaction
export const updateTransaction = async (id: string, transactionData: Partial<TransactionFormValues>): Promise<Transaction> => {
  try {
    const response = await apiClient.put(`/transactions/${id}`, transactionData);
    return response.data;
  } catch (err) {
    console.error('Error updating transaction:', err);
    throw new Error('Failed to update transaction.');
  }
};

// Delete transaction
export const deleteTransaction = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/transactions/${id}`);
  } catch (err) {
    console.error('Error deleting transaction:', err);
    throw new Error('Failed to delete transaction.');
  }
};

// Get transaction statistics
export const getTransactionStats = async (startDate?: string, endDate?: string): Promise<TransactionStats> => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiClient.get(`/transactions/stats?${params.toString()}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching transaction stats:', err);
    throw new Error('Failed to fetch transaction statistics.');
  }
};