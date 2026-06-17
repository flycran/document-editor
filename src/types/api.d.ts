declare global {
  type SingleNumberString = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

  type AllStatus = `${SingleNumberString}${SingleNumberString}${SingleNumberString}`

  type SuccessStatus = '000'

  type ErrorStatus = Exclude<AllStatus, SuccessStatus>

  export type SuccessResponse<T> = {
    status: SuccessStatus
    data: T
    message: string
  }

  export type ErrorResponse = {
    status: ErrorStatus
    message: string
    data: undefined
  }

  export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse
}

export {}
