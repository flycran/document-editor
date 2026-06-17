import { useQuery } from '@tanstack/react-query'
import { createFetch } from './request'

const doctorFetch = createFetch('/api/basic/doctor')

interface DoctorListResp {
  name: string
  title: string
  hospital: string
  doctor_id: string
  depa_id: string
  job_number: string
  depa_name: string
  online_status: number
  is_consult: number
  is_pres: number
  phone: string
  his_doctor_id: string
}

export const getDoctorListApi = () => {
  return doctorFetch<ApiResponse<DoctorListResp[]>>('/get_doctor_list', {
    method: 'GET',
  })
}

export const useGetDoctorListQuery = () => {
  return useQuery({
    queryKey: ['doctorList'],
    queryFn: getDoctorListApi,
  })
}
