/** Shape of every successful response returned by the MediSync API. */
export interface ApiResponse<T> {
  success: true
  message: string
  data: T
}

/** Shape of every error response returned by the MediSync API. */
export interface ApiErrorResponse {
  success: false
  message: string
  errors?: Array<{ field: string; message: string }>
}

export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  limit: number
}
