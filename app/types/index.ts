export interface Material {
  id: string
  materialCode: string
  description: string
  materialType: string
  plantCode: string
  vendorId: string
  manufacturerId: string
  unitOfMeasure: string
  category: string
  basePrice?: number
  createdAt: Date
  status: 'pending' | 'approved' | 'rejected'
}

export interface Vendor {
  id: string
  name: string
  code: string
  isQualified: boolean
  category: string[]
  linkedManufacturers: string[]
}

export interface Manufacturer {
  id: string
  name: string
  code: string
  linkedVendors: string[]
  certifications: string[]
}

export interface ValidationResult {
  field: string
  status: 'valid' | 'warning' | 'error'
  message: string
  suggestion?: string
  confidence?: number
}

export interface DuplicateMatch {
  material: Material
  similarity: number
  matchType: 'exact' | 'similar' | 'fuzzy'
}

export interface AIAnalysis {
  duplicates: DuplicateMatch[]
  validations: ValidationResult[]
  suggestions: Record<string, string[]>
  riskScore: number
} 