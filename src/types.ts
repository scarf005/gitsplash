export interface ImageGroup {
  url: string
  paths: Set<string>
}

export interface CachedData {
  timestamp: number
  data: {
    tree: Array<{
      path?: string
      mode?: string
      sha?: string
    }>
  }
  headers: {
    [key: string]: string | undefined
  }
}
