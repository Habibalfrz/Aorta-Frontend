import api from './axios'

export interface CreateEmployeePayload {
  userId?: string // Optional, as it might be created simultaneously or linked later
  employeeNumber: string
  fullName: string
  dateOfBirth: string // YYYY-MM-DD
  gender: 'L' | 'P'
}

export interface UpdateEmployeePayload {
  id: string
  userId?: string
  employeeNumber: string
  fullName: string
  dateOfBirth: string
  gender: 'L' | 'P'
}

export interface CreateEmployeeResponse {
  id: string
}

export async function createEmployee(payload: CreateEmployeePayload): Promise<CreateEmployeeResponse> {
  const response = await api.post<CreateEmployeeResponse>('/api/hris/employees', payload)
  return response.data
}

export async function updateEmployee(id: string, payload: UpdateEmployeePayload): Promise<void> {
  await api.put(`/api/hris/employees/${id}`, payload)
}

export async function deleteEmployee(id: string): Promise<void> {
  await api.delete(`/api/hris/employees/${id}`)
}
