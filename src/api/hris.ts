import api from './axios'

export interface CreateEmployeePayload {
  userId?: string
  identityNumber: string
  employeeNumber: string
  fullName: string
  dateOfBirth: string // YYYY-MM-DD
  gender: 'L' | 'P'
  email?: string
  password?: string
  status?: string
  professionCategory?: string
  fingerprintPin?: string
  cardNumber?: string
  initialContractType?: string
  initialStartDate?: string
}

export interface UpdateEmployeePayload {
  id: string
  identityNumber?: string
  employeeNumber?: string
  fullName: string
  dateOfBirth: string
  gender: 'L' | 'P'
  status?: string
  professionCategory?: string
  departmentId?: string
  jobPositionId?: string
  fingerprintPin?: string
  cardNumber?: string
}

export interface CreateEmployeeResponse {
  id: string
}

export async function createEmployee(payload: CreateEmployeePayload): Promise<CreateEmployeeResponse> {
  // Clean empty dates so backend doesn't crash on JSON deserialization
  const cleanedPayload = { ...payload }
  if (cleanedPayload.initialStartDate === '') delete cleanedPayload.initialStartDate
  if (cleanedPayload.dateOfBirth === '') delete (cleanedPayload as any).dateOfBirth

  const response = await api.post<CreateEmployeeResponse>('/api/hris/employees', cleanedPayload)
  return response.data
}

export async function updateEmployee(id: string, payload: UpdateEmployeePayload): Promise<void> {
  await api.put(`/api/hris/employees/${id}`, payload)
}

export async function deleteEmployee(id: string): Promise<void> {
  await api.delete(`/api/hris/employees/${id}`)
}

export async function addClinicalLicense(employeeId: string, payload: {
  licenseType: string
  licenseNumber: string
  issuedDate: string
  expiryDate: string
  issuedBy: string
}): Promise<void> {
  await api.post(`/api/hris/employees/${employeeId}/licenses`, payload)
}

export async function recordEmployment(employeeId: string, payload: {
  departmentId: string
  jobPositionId: string
  gradeId?: string
  basicSalary?: number
  startDate: string
}): Promise<void> {
  await api.post(`/api/hris/employees/${employeeId}/employments`, payload)
}

// --- EMPLOYEE FAMILY API ---
export async function getEmployeeFamilies(employeeId: string) {
  const response = await api.get(`/api/hris/employees/${employeeId}/family`)
  return response.data.data || []
}

export async function addEmployeeFamily(employeeId: string, payload: {
  name: string
  relation: string
  gender?: string
  dateOfBirth?: string
  emergencyContact: boolean
  phone?: string
}) {
  const response = await api.post(`/api/hris/employees/${employeeId}/family`, payload)
  return response.data
}

export async function deleteEmployeeFamily(employeeId: string, familyId: string) {
  const response = await api.delete(`/api/hris/employees/${employeeId}/family/${familyId}`)
  return response.data
}

// --- MASTER DATA API ---
export async function getDepartments() {
  const response = await api.get('/api/hris/departments')
  return response.data.data || []
}

export async function createDepartment(payload: { code: string; name: string; parentId?: string | null }) {
  const response = await api.post('/api/hris/departments', payload)
  return response.data
}

export async function updateDepartment(id: string, payload: { code: string; name: string; parentId?: string | null }) {
  const response = await api.put(`/api/hris/departments/${id}`, payload)
  return response.data
}

export async function deleteDepartment(id: string) {
  const response = await api.delete(`/api/hris/departments/${id}`)
  return response.data
}

export async function getJobPositions() {
  const response = await api.get('/api/hris/job-positions')
  return response.data.data || []
}

export async function createJobPosition(payload: { code: string; name: string; description?: string }) {
  const response = await api.post('/api/hris/job-positions', payload)
  return response.data
}

export async function updateJobPosition(id: string, payload: { code: string; name: string; description?: string }) {
  const response = await api.put(`/api/hris/job-positions/${id}`, payload)
  return response.data
}

export async function deleteJobPosition(id: string) {
  const response = await api.delete(`/api/hris/job-positions/${id}`)
  return response.data
}

export async function getGrades() {
  const response = await api.get('/api/hris/grades')
  return response.data.data || []
}

export async function createGrade(payload: { code: string; name: string; level: number }) {
  const response = await api.post('/api/hris/grades', payload)
  return response.data
}

export async function updateGrade(id: string, payload: { code: string; name: string; level: number }) {
  const response = await api.put(`/api/hris/grades/${id}`, payload)
  return response.data
}

export async function deleteGrade(id: string) {
  const response = await api.delete(`/api/hris/grades/${id}`)
  return response.data
}

// --- SHIFTS API ---
export async function getShifts() {
  const response = await api.get('/api/hris/shifts')
  return response.data.data || []
}

export async function createShift(payload: { code: string; name: string; startTime: string; endTime: string; toleranceMinutes: number }) {
  const response = await api.post('/api/hris/shifts', payload)
  return response.data
}

export async function updateShift(id: string, payload: { code: string; name: string; startTime: string; endTime: string; toleranceMinutes: number }) {
  const response = await api.put(`/api/hris/shifts/${id}`, payload)
  return response.data
}

export async function deleteShift(id: string) {
  const response = await api.delete(`/api/hris/shifts/${id}`)
  return response.data
}

// --- ATTENDANCE & POLICY API ---
export async function getAttendanceLogs() {
  const response = await api.get('/api/hris/attendance/logs')
  return response.data.data || []
}

export async function getEmployeeAttendance(employeeId: string, startDate?: string, endDate?: string) {
  const params: any = {}
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate
  const response = await api.get(`/api/hris/employees/${employeeId}/attendance`, { params })
  return response.data.data || []
}

export async function getAttendancePolicy() {
  const response = await api.get('/api/hris/attendance/policy')
  return response.data.data
}

export async function updateAttendancePolicy(payload: {
  name: string
  toleranceMinutes: number
  lateTier1MaxMinutes: number
  lateTier1Penalty: number
  lateTier2MaxMinutes: number
  lateTier2Penalty: number
  lateTier3Penalty: number
  missingCheckOutPenalty: number
  missingCheckInPenalty: number
  earlyLeavePenaltyPerMinute: number
  absentPenalty: number
  loyaltyOvertimeMinutes: number
  defaultOvertimeRatePerHour: number
}) {
  const response = await api.put('/api/hris/attendance/policy', payload)
  return response.data
}

export async function getMonthlyRecaps(month: number, year: number) {
  const response = await api.get('/api/hris/attendance/recaps', { params: { month, year } })
  return response.data.data || []
}

export async function calculateMonthlyRecap(month: number, year: number) {
  const response = await api.post('/api/hris/attendance/recaps/calculate', { month, year })
  return response.data
}

export async function adjustMonthlyRecap(id: string, payload: { adjustmentAmount: number; notes: string }) {
  const response = await api.put(`/api/hris/attendance/recaps/${id}/adjust`, payload)
  return response.data
}

export async function finalizeMonthlyRecap(month: number, year: number) {
  const response = await api.post('/api/hris/attendance/recaps/finalize', { month, year })
  return response.data
}

export async function unfinalizeMonthlyRecap(month: number, year: number) {
  const response = await api.post('/api/hris/attendance/recaps/unfinalize', { month, year })
  return response.data
}

export async function simulatePunch(payload: { pin: string; timestamp?: string; serialNumber?: string }) {
  const response = await api.post('/api/hris/attendance/simulate-punch', payload)
  return response.data
}

export function getExportMonthlyRecapUrl(month: number, year: number): string {
  return `/api/hris/attendance/recaps/export?month=${month}&year=${year}`
}

export async function getAttendanceAnomalies() {
  const response = await api.get('/api/hris/attendance/anomalies')
  return response.data.data || []
}

export async function resolveAttendanceAnomaly(id: string, payload: { manualCheckInUtc?: string, manualCheckOutUtc?: string, waivePenalty: boolean, notes: string }) {
  const response = await api.put(`/api/hris/attendance/anomalies/${id}/resolve`, payload)
  return response.data
}

export async function uploadRawAttendance(formData: FormData) {
  const response = await api.post('/api/hris/attendance/upload-raw', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

// --- LEAVES API ---
export async function getLeaves() {
  const response = await api.get('/api/hris/leaves')
  return response.data.data || []
}

export async function applyLeave(payload: { employeeId: string; startDate: string; endDate: string; reason: string }) {
  const response = await api.post('/api/hris/leaves', payload)
  return response.data
}

export async function updateLeaveStatus(id: string, payload: { statusAction?: string; action?: string; reason?: string }) {
  const response = await api.put(`/api/hris/leaves/${id}/status`, payload)
  return response.data
}

export async function deleteLeave(id: string) {
  const response = await api.delete(`/api/hris/leaves/${id}`)
  return response.data
}

// --- PAYROLL API ---
export async function getPayrolls() {
  const response = await api.get('/api/hris/payrolls')
  return response.data.data || []
}

export async function getPayrollDetail(id: string) {
  const response = await api.get(`/api/hris/payrolls/${id}`)
  return response.data
}

export async function generatePayroll(payload: { employeeId?: string; periodMonth: number; periodYear: number }) {
  const response = await api.post('/api/hris/payrolls/generate', payload)
  return response.data
}

export async function deletePayroll(id: string) {
  const response = await api.delete(`/api/hris/payrolls/${id}`)
  return response.data
}

// --- Contracts & Documents ---
export async function getEmployeeContracts(employeeId: string) {
  const response = await api.get(`/api/hris/employees/${employeeId}/contracts`)
  return response.data
}

export async function createEmployeeContract(employeeId: string, payload: { contractType: string; startDate: string; endDate?: string }) {
  const response = await api.post(`/api/hris/employees/${employeeId}/contracts`, payload)
  return response.data
}

export async function getEmployeeDocuments(employeeId: string) {
  const response = await api.get(`/api/hris/employees/${employeeId}/documents`)
  return response.data
}

export async function uploadEmployeeDocument(employeeId: string, file: File, documentType: string) {
  const formData = new FormData()
  formData.append('FileBytes', file)
  formData.append('DocumentType', documentType)
  formData.append('FileName', file.name)
  formData.append('ContentType', file.type)
  const response = await api.post(`/api/hris/employees/${employeeId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export async function deleteEmployeeDocument(employeeId: string, documentId: string) {
  const response = await api.delete(`/api/hris/employees/${employeeId}/documents/${documentId}`)
  return response.data
}

// --- ZKTECO API ---
export async function syncZkTecoUsers(ipAddress: string) {
  const response = await api.post('/api/hris/zkteco/sync', { ipAddress })
  return response.data
}

export async function getUnlinkedMachineUsers() {
  const response = await api.get('/api/hris/zkteco/unlinked-users')
  return response.data
}

export async function linkMachineUser(machineUserId: string, employeeId: string) {
  const response = await api.post('/api/hris/zkteco/link', { machineUserId, employeeId })
  return response.data
}

export async function getAllMachineUsers() {
  const response = await api.get('/api/hris/zkteco/users')
  return response.data.data || []
}


