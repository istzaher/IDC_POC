import Fuse from 'fuse.js'
import { Material, Vendor, Manufacturer, ValidationResult, DuplicateMatch, AIAnalysis } from '../types'
import { getMaterials, getVendors, getManufacturers, getMaterialGroups, getUnitsOfMeasure } from '../data'

// AI Service Functions
export class AIValidationService {
  private fuseOptions = {
    includeScore: true,
    threshold: 0.3,
    keys: ['description', 'materialCode']
  }

  // 1. Duplicate Detection using Fuzzy Matching
  async detectDuplicates(newMaterial: Partial<Material>): Promise<DuplicateMatch[]> {
    const materials = getMaterials()
    const fuse = new Fuse(materials, this.fuseOptions)
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
      const vendors = getVendors()
      const vendor = vendors.find(v => v.id === material.vendorId)
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
    const vendors = getVendors()
    const manufacturers = getManufacturers()
    const vendor = vendors.find(v => v.id === vendorId)
    const manufacturer = manufacturers.find(m => m.id === manufacturerId)

    if (!vendor || !manufacturer) {
      return {
        field: 'linkage',
        status: 'error',
        message: 'Vendor or manufacturer not found'
      }
    }

    if (!vendor.linkedManufacturers.includes(manufacturerId)) {
      const suggestedManufacturers = manufacturers
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

  public suggestMaterialType(description: string): string[] {
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
    const vendors = getVendors()
    return vendors
      .filter(v => v.isQualified && v.category.includes(category))
      .map(v => v.id)
  }

  private suggestQualifiedVendor(category?: string): string {
    const vendors = getVendors()
    const qualifiedVendors = vendors.filter(v => 
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