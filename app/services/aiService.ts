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
  async analyzeEntry(material: any): Promise<AIAnalysis> {
    const validations: ValidationResult[] = []
    const suggestions: Record<string, string[]> = {}
    
    // Base Unit of Measure suggestions based on material description
    if (material.material) {
      const desc = material.material.toLowerCase()
      if (desc.includes('guide')) {
        suggestions.baseUnitOfMeasure = ['EA', 'PCS']
      } else if (desc.includes('pipe')) {
        suggestions.baseUnitOfMeasure = ['M', 'FT']
      } else if (desc.includes('chemical')) {
        suggestions.baseUnitOfMeasure = ['KG', 'L']
      }
    }

    // Material Type suggestions based on material code and description
    if (material.material) {
      suggestions.materialType = ['ZDRL', 'ZCHM', 'ZELE'].filter(type => {
        const desc = material.material.toLowerCase()
        if (desc.includes('drill') || desc.includes('guide')) return true
        if (type === 'ZCHM' && desc.includes('chemical')) return true
        if (type === 'ZELE' && desc.includes('electrical')) return true
        return false
      })
    }

    // Material Group (PG Code) suggestions based on material type
    if (material.materialType) {
      switch (material.materialType) {
        case 'ZDRL':
          suggestions.materialGroup = ['43JDX', '43KLM', '43MNP']
          break
        case 'ZCHM':
          suggestions.materialGroup = ['44ABC', '44DEF', '44GHI']
          break
        case 'ZELE':
          suggestions.materialGroup = ['45XYZ', '45UVW', '45RST']
          break
      }
    }

    // Add validations
    if (material.material) {
      // Validate material code format
      if (!/^[A-Z0-9]{8}$/i.test(material.material)) {
        validations.push({
          field: 'material',
          status: 'warning',
          message: 'Material code should be 8 characters long',
          suggestion: 'Consider using format: LETTERSNUMBERS (e.g., S1566153)'
        })
      }

      // Validate material type selection
      if (material.materialType && suggestions.materialType?.length && !suggestions.materialType.includes(material.materialType)) {
        validations.push({
          field: 'materialType',
          status: 'warning',
          message: 'Material type might not be optimal for this material',
          suggestion: `Consider using one of the suggested types: ${suggestions.materialType.join(', ')}`
        })
      }

      // Validate material group format
      if (material.materialGroup && !/^\d{2}[A-Z]{3}$/i.test(material.materialGroup)) {
        validations.push({
          field: 'materialGroup',
          status: 'warning',
          message: 'Material group should follow format: 2 numbers + 3 letters',
          suggestion: 'Example format: 43JDX'
        })
      }
    }

    // Calculate risk score based on validations
    const riskScore = this.calculateRiskScore(validations)

    // Find potential duplicates
    const duplicates = await this.detectDuplicates(material)

    return {
      suggestions,
      validations,
      riskScore,
      duplicates
    }
  }

  private calculateRiskScore(validations: ValidationResult[]): number {
    const errorCount = validations.filter(v => v.status === 'error').length
    const warningCount = validations.filter(v => v.status === 'warning').length
    
    return Math.min(100, (errorCount * 30) + (warningCount * 15))
  }
}

export const aiService = new AIValidationService() 