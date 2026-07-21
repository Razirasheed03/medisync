/** Shape of every successful response returned by the MediSync API. */
export interface ApiResponse<T> {
  success: true
  message: string
  data: T
  meta: Record<string, unknown>
}

export interface ApiValidationIssue {
  path: string
  message: string
}

/** Shape of every error response returned by the MediSync API. */
export interface ApiErrorResponse {
  success: false
  message: string
  data: { issues: ApiValidationIssue[] } | null
  meta: Record<string, unknown>
}

export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  limit: number
}
