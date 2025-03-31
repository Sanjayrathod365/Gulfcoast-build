export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'doctor' | 'staff'
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData extends LoginCredentials {
  name: string
  role: 'admin' | 'doctor' | 'staff'
} 