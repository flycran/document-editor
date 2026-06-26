export interface DocumentSginContext {
  /** 医生签名 */
  onDoctorSgin?: () => void
  /** 医生签名图片 */
  doctorSginImage?: string
  /** 患者签名 */
  onPatientSgin?: () => void
  /** 患者签名图片 */
  patientSginImage?: string
  /** 家属签名 */
  onFamilySgin?: () => void
  /** 家属签名图片 */
  familySginImage?: string
}

export const DocumentSginContext = createContext<DocumentSginContext>({})

export function useDocumentSgin() {
  return useContext(DocumentSginContext)
}
