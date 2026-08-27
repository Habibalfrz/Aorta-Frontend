import api from './axios'

export interface CreateEmployeePayload {
  userId?: string // Optional, as it might be created simultaneously or linked later
  employeeNumber: string
  fullName: string
  dateOfBirth: string // YYYY-MM-DD
  gender: 'L' | 'P'
}

export interface CreateEmployeeResponse {
  id: string
}

export async function createEmployee(payload: CreateEmployeePayload): Promise<CreateEmployeeResponse> {
  const response = await api.post<CreateEmployeeResponse>('/api/hris/employees', payload)
  return response.data
}
