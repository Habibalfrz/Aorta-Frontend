import api from './axios'

export interface EssSummary {
  userProfile: {
    name: string
    position: string
  }
  todayShift: {
    checkIn: string | null
    checkOut: string | null
    type: string
  }
  leaveBalance: number
  timeBank: number
}

export async function fetchEssSummary(employeeId: string): Promise<EssSummary> {
  const response = await api.get<EssSummary>(`/api/hris/ess/summary`, {
    params: { employeeId }
  })
  return response.data
}
