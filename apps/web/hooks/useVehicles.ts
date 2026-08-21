import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface ScoreFactor {
  earned: number
  max: number
  status: 'good' | 'warn' | 'bad'
  detail: string
}

export interface Vehicle {
  id: string
  vrn: string
  make: string
  model: string
  year: number
  fuelType: string
  colour: string
  owner: string
  healthScore: number
  scoreFactors: {
    insurance: ScoreFactor
    pucc: ScoreFactor
    fitness: ScoreFactor
    challans: ScoreFactor
    fastag: ScoreFactor
  }
  rcData: {
    insuranceExpiry: string | null
    puccExpiry: string | null
    fitnessExpiry: string | null
    challanCount: number
    fastagActive: boolean
  }
}

export function useVehicles(enabled = true) {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get<Vehicle[]>('/vehicles'),
    enabled,
  })
}

export function useAddVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vrn: string) => api.post<Vehicle>('/vehicles', { vrn }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
  })
}

export function useDeleteVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/vehicles/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
  })
}