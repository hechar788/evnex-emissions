export interface NzTranspowerLink {
  rel: string
  href: string
}

export interface NzTranspowerFeedMetadata {
  count?: number
  hasMore?: boolean
  limit?: number
  offset?: number
  links?: NzTranspowerLink[]
}

