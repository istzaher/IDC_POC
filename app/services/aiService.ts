import Fuse from 'fuse.js'
import { Material, Vendor, Manufacturer, ValidationResult, DuplicateMatch, AIAnalysis } from '../types'

// Mock data for demonstration
const mockMaterials: Material[] = [
  {
    id: '1',
    materialCode: 'STL001',
    description: 'Steel Rod 10mm',
    materialType: 'ROD',
    plantCode: 'P001',
    vendorId: '200001',
    manufacturerId: '200101',
    unitOfMeasure: 'MT',
    category: 'STEEL',
    basePrice: 150.00,
    createdAt: new Date('2023-01-15'),
    status: 'approved'
  },
  {
    id: '2',
    materialCode: 'STL002',
    description: '10mm Steel Rod',
    materialType: 'ROD',
    plantCode: 'P002',
    vendorId: '200002',
    manufacturerId: '200101',
    unitOfMeasure: 'MT',
    category: 'STEEL',
    basePrice: 148.00,
    createdAt: new Date('2023-02-20'),
    status: 'approved'
  },
  {
    id: '3',
    materialCode: 'CEM001',
    description: 'Portland Cement 50kg',
    materialType: 'CEMENT',
    plantCode: 'P001',
    vendorId: '200003',
    manufacturerId: '200102',
    unitOfMeasure: 'BAG',
    category: 'CEMENT',
    basePrice: 25.00,
    createdAt: new Date('2023-03-10'),
    status: 'approved'
  }
]

const mockVendors: Vendor[] = [
  {
    id: '200001',
    name: 'Premium Steel Suppliers',
    code: '200001',
    isQualified: true,
    category: ['STEEL', 'METAL'],
    linkedManufacturers: ['200101']
  },
  {
    id: '200002',
    name: 'Global Steel Trading',
    code: '200002',
    isQualified: true,
    category: ['STEEL', 'CONSTRUCTION'],
    linkedManufacturers: ['200101', '200103']
  },
  {
    id: '100001',
    name: 'Old Steel Company',
    code: '100001',
    isQualified: false,
    category: ['STEEL'],
    linkedManufacturers: ['100101']
  }
]

const mockManufacturers: Manufacturer[] = [
  {
    id: '200101',
    name: 'Steel Works International',
    code: '200101',
    linkedVendors: ['200001', '200002'],
    certifications: ['ISO9001', 'ISO14001']
  },
  {
    id: '200102',
    name: 'Cement Solutions Ltd',
    code: '200102',
    linkedVendors: ['200003'],
    certifications: ['ISO9001']
  }
]

// AI Service Functions
export class AIValidationService {
  private fuseOptions = {
    includeScore: true,
    threshold: 0.3,
    keys: ['description', 'materialCode']
  }

  // 1. Duplicate Detection using Fuzzy Matching
  async detectDuplicates(newMaterial: Partial<Material>): Promise<DuplicateMatch[]> {
    const fuse = new Fuse(mockMaterials, this.fuseOptions)
    const results = fuse.search(newMaterial.description || '')
    
    return results.map(result => {
      const score = result.score || 0
      const similarity = Math.round((1 - score) * 100) / 100
      
      let matchType: 'exact' | 'similar' | 'fuzzy'
      if (score < 0.1) {
        matchType = 'exact'
      } else if (score < 0.3) {
        matchType = 'similar'
      } else {
        matchType = 'fuzzy'
      }
      
      return {
        material: result.item,
        similarity,
        matchType
      }
    }).filter(match => match.similarity > 0.7)
  }

  // 2. Field Validation and Auto-Suggestion
  async validateFields(material: Partial<Material>): Promise<ValidationResult[]> {
    const validations: ValidationResult[] = []

    // Material Code validation
    if (!material.materialCode) {
      validations.push({
        field: 'materialCode',
        status: 'error',
        message: 'Material code is required',
        suggestion: this.generateMaterialCode(material)
      })
    } else if (!/^[A-Z]{3}\d{3}$/.test(material.materialCode)) {
      validations.push({
        field: 'materialCode',
        status: 'warning',
        message: 'Material code should follow format: ABC123',
        suggestion: this.generateMaterialCode(material)
      })
    } else {
      validations.push({
        field: 'materialCode',
        status: 'valid',
        message: 'Valid material code format'
      })
    }

    // Description validation
    if (!material.description || material.description.length < 5) {
      validations.push({
        field: 'description',
        status: 'error',
        message: 'Description must be at least 5 characters',
        suggestion: 'Please provide a detailed material description'
      })
    } else {
      validations.push({
        field: 'description',
        status: 'valid',
        message: 'Valid description'
      })
    }

    // Vendor validation
    if (material.vendorId) {
      const vendor = mockVendors.find(v => v.id === material.vendorId)
      if (!vendor) {
        validations.push({
          field: 'vendorId',
          status: 'error',
          message: 'Vendor not found',
          suggestion: 'Select from qualified vendors list'
        })
      } else if (!vendor.isQualified) {
        validations.push({
          field: 'vendorId',
          status: 'error',
          message: 'Only qualified vendors (200xxx series) are allowed',
          suggestion: this.suggestQualifiedVendor(material.category)
        })
      } else {
        validations.push({
          field: 'vendorId',
          status: 'valid',
          message: 'Valid qualified vendor'
        })
      }
    }

    return validations
  }

  // 3. Vendor/Manufacturer Linkage Validation
  async validateVendorManufacturerLink(vendorId: string, manufacturerId: string): Promise<ValidationResult> {
    const vendor = mockVendors.find(v => v.id === vendorId)
    const manufacturer = mockManufacturers.find(m => m.id === manufacturerId)

    if (!vendor || !manufacturer) {
      return {
        field: 'linkage',
        status: 'error',
        message: 'Vendor or manufacturer not found'
      }
    }

    if (!vendor.linkedManufacturers.includes(manufacturerId)) {
      const suggestedManufacturers = mockManufacturers
        .filter(m => vendor.linkedManufacturers.includes(m.id))
        .map(m => m.name)
        .join(', ')

      return {
        field: 'linkage',
        status: 'warning',
        message: 'Vendor and manufacturer are not linked',
        suggestion: `Suggested manufacturers for this vendor: ${suggestedManufacturers}`
      }
    }

    return {
      field: 'linkage',
      status: 'valid',
      message: 'Valid vendor-manufacturer relationship'
    }
  }

  // 4. AI Auto-Suggestion for Fields
  async getSuggestions(field: string, context: Partial<Material>): Promise<string[]> {
    switch (field) {
      case 'materialType':
        return this.suggestMaterialType(context.description || '')
      case 'unitOfMeasure':
        return this.suggestUnitOfMeasure(context.materialType || '')
      case 'category':
        return this.suggestCategory(context.description || '')
      case 'vendorId':
        return this.suggestVendors(context.category || '')
      default:
        return []
    }
  }

  // Helper methods
  private generateMaterialCode(material: Partial<Material>): string {
    const category = material.category || 'GEN'
    const prefix = category.substring(0, 3).toUpperCase()
    const number = Math.floor(Math.random() * 900) + 100
    return `${prefix}${number}`
  }

  private suggestMaterialType(description: string): string[] {
    const desc = description.toLowerCase()
    if (desc.includes('rod') || desc.includes('bar')) return ['ROD', 'BAR']
    if (desc.includes('cement')) return ['CEMENT', 'POWDER']
    if (desc.includes('pipe')) return ['PIPE', 'TUBE']
    return ['MISC', 'PART', 'COMPONENT']
  }

  private suggestUnitOfMeasure(materialType: string): string[] {
    switch (materialType.toLowerCase()) {
      case 'rod':
      case 'bar':
        return ['MT', 'KG', 'M']
      case 'cement':
        return ['BAG', 'MT', 'KG']
      case 'pipe':
        return ['M', 'PCS', 'FT']
      default:
        return ['PCS', 'KG', 'M']
    }
  }

  private suggestCategory(description: string): string[] {
    const desc = description.toLowerCase()
    if (desc.includes('steel') || desc.includes('iron')) return ['STEEL', 'METAL']
    if (desc.includes('cement')) return ['CEMENT', 'CONSTRUCTION']
    if (desc.includes('electrical')) return ['ELECTRICAL', 'COMPONENT']
    return ['GENERAL', 'MISC']
  }

  private suggestVendors(category: string): string[] {
    return mockVendors
      .filter(v => v.isQualified && v.category.includes(category))
      .map(v => v.id)
  }

  private suggestQualifiedVendor(category?: string): string {
    const qualifiedVendors = mockVendors.filter(v => 
      v.isQualified && (!category || v.category.includes(category))
    )
    return qualifiedVendors.length > 0 
      ? `Try vendor: ${qualifiedVendors[0].name} (${qualifiedVendors[0].id})`
      : 'Select a qualified vendor (200xxx series)'
  }

  // Complete AI Analysis
  async analyzeEntry(material: Partial<Material>): Promise<AIAnalysis> {
    const [duplicates, validations] = await Promise.all([
      this.detectDuplicates(material),
      this.validateFields(material)
    ])

    const suggestions: Record<string, string[]> = {}
    const fields = ['materialType', 'unitOfMeasure', 'category', 'vendorId']
    
    for (const field of fields) {
      suggestions[field] = await this.getSuggestions(field, material)
    }

    // Calculate risk score
    const errorCount = validations.filter(v => v.status === 'error').length
    const warningCount = validations.filter(v => v.status === 'warning').length
    const duplicateCount = duplicates.length
    
    const riskScore = Math.min(
      (errorCount * 30 + warningCount * 15 + duplicateCount * 20),
      100
    )

    return {
      duplicates,
      validations,
      suggestions,
      riskScore
    }
  }
}

export const aiService = new AIValidationService() 