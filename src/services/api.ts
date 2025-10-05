import { supabase } from '@/integrations/supabase/client'

const API_BASE_URL = 'https://xkyhvkuahdvvlwjgnipt.supabase.co/functions/v1'

// Helper function to get auth token
const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

// Helper function to make authenticated API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getAuthToken()
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'API request failed')
  }

  return response.json()
}

export const authAPI = {
  // Sign up a new user
  signUp: async (email: string, password: string, name: string, username: string) => {
    const response = await fetch(`${API_BASE_URL}/auth-api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, username }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Sign up failed')
    }

    return response.json()
  },

  // Sign in user
  signIn: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth-api/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Sign in failed')
    }

    return response.json()
  },

  // Sign out user
  signOut: async () => {
    return apiCall('/auth-api/signout', { method: 'POST' })
  },

  // Get current user
  getCurrentUser: async () => {
    return apiCall('/auth-api/me')
  },
}

// Financial API - Interacts with 'financial_particulars' table
export const financialAPI = {
  // Get all financial particulars from 'financial_particulars' table
  getAll: async () => {
    return apiCall('/financial-api/all')
  },

  // Get financial statistics from 'financial_particulars' table
  getStats: async () => {
    return apiCall('/financial-api/stats')
  },

  // Get single financial particular from 'financial_particulars' table
  getById: async (id: string) => {
    return apiCall(`/financial-api/${id}`)
  },

  // Create new financial particular in 'financial_particulars' table
  create: async (data: { category: string; description?: string; amount: number; cash?: number; investment?: number; month?: string; year?: number }) => {
    return apiCall('/financial-api/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Update financial particular in 'financial_particulars' table
  update: async (id: string, data: { category?: string; description?: string; amount?: number; cash?: number; investment?: number; month?: string }) => {
    return apiCall(`/financial-api/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Delete financial particular from 'financial_particulars' table
  delete: async (id: string) => {
    return apiCall(`/financial-api/${id}`, {
      method: 'DELETE',
    })
  },

  // Clear all financial data from 'financial_particulars' table (keep login credentials)
  clearAll: async () => {
    return apiCall('/financial-api/clear-all', {
      method: 'DELETE',
    })
  },

  // Get unique titles from 'financial_particulars' table for autocomplete
  getTitles: async () => {
    return apiCall('/financial-api/titles')
  },
}

// User API - Interacts with 'profiles' and 'financial_particulars' tables
export const userAPI = {
  // Get user profile from 'profiles' table
  getProfile: async () => {
    return apiCall('/user-api/profile')
  },

  // Update user profile in 'profiles' table
  updateProfile: async (data: { name?: string; username?: string }) => {
    return apiCall('/user-api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Delete user account from 'profiles' and 'financial_particulars' tables
  deleteAccount: async () => {
    return apiCall('/user-api/delete-account', {
      method: 'DELETE',
    })
  },
}