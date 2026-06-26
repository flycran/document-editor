export interface DocumentSginContext {
  /** 医生签名 */
  onDoctorSgin?: () => void
  doctorSginImage?: string
  /** 患者签名 */
  onPatientSgin?: () => void
  patientSginImage?: string
  /** 家属签名 */
  onFamilySgin?: () => void
  familySginImage?: string
}

export const DocumentSginContext = createContext<DocumentSginContext>({})

export function useDocumentSgin() {
  return useContext(DocumentSginContext)
}
