/**
 * 签名类型
 * - doctor 医生签名
 * - patient 患者签名
 * - family 家属签名
 */
export type SginType = 'doctor' | 'patient' | 'family'

export const SGIN_ENUMS: Record<SginType, string> = {
  doctor: '医生签名',
  patient: '患者签名',
  family: '家属签名',
}
