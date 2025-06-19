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
    
    // Get material description (either from materialDescription field or material field)
    const materialDesc = (material.materialDescription || material.material || '').toLowerCase()
    const materialCode = (material.material || '').toLowerCase()
    
    // Base Unit of Measure suggestions - limit to 1-2 most relevant
    if (materialDesc.includes('rod') || materialDesc.includes('pipe')) {
      suggestions.baseUnitOfMeasure = ['M', 'FT']
    } else if (materialDesc.includes('bit') || materialDesc.includes('tool') || materialDesc.includes('guide')) {
      suggestions.baseUnitOfMeasure = ['EA', 'PCS']
    } else if (materialDesc.includes('cement') || materialDesc.includes('chemical') || materialDesc.includes('additive')) {
      suggestions.baseUnitOfMeasure = ['KG', 'L']
    } else if (materialDesc.includes('cable') || materialDesc.includes('electrical')) {
      suggestions.baseUnitOfMeasure = ['M', 'EA']
    } else {
      // Default suggestions
      suggestions.baseUnitOfMeasure = ['EA', 'PCS']
    }
    
    // Material Type suggestions - limit to 1-2 most relevant
    if (materialDesc.includes('drill') || materialDesc.includes('bit') || materialDesc.includes('guide') || 
        materialDesc.includes('tool') || materialCode.startsWith('drl') || materialCode.startsWith('stl')) {
      suggestions.materialType = ['ZDRL']
    } else if (materialDesc.includes('chemical') || materialDesc.includes('cement') || 
               materialDesc.includes('fluid') || materialDesc.includes('additive') || 
               materialCode.startsWith('chm') || materialCode.startsWith('cem')) {
      suggestions.materialType = ['ZCHM']
    } else if (materialDesc.includes('electrical') || materialDesc.includes('cable') || 
               materialDesc.includes('wire') || materialDesc.includes('connector') || 
               materialCode.startsWith('ele') || materialCode.startsWith('pip')) {
      suggestions.materialType = ['ZELE']
    } else {
      // If no specific match, provide 2 most likely options based on common patterns
      suggestions.materialType = ['ZDRL', 'ZCHM']
    }
    
    // Industry Sector suggestions - limit to 1-2 most relevant based on material type and description
    if (material.materialType === 'ZDRL' || materialDesc.includes('drill') || 
        materialDesc.includes('bit') || materialDesc.includes('oil') || materialDesc.includes('gas')) {
      suggestions.industrySector = ['O'] // Oil & Gas
    } else if (material.materialType === 'ZCHM' || materialDesc.includes('chemical') || 
               materialDesc.includes('cement') || materialDesc.includes('additive')) {
      suggestions.industrySector = ['C'] // Chemical
    } else if (material.materialType === 'ZELE' || materialDesc.includes('electrical') || 
               materialDesc.includes('cable') || materialDesc.includes('power')) {
      suggestions.industrySector = ['E'] // Electrical
    } else if (materialDesc.includes('pipe') || materialDesc.includes('manufacturing') || 
               materialDesc.includes('production')) {
      suggestions.industrySector = ['M'] // Manufacturing
    } else if (materialDesc.includes('construction') || materialDesc.includes('building')) {
      suggestions.industrySector = ['B'] // Construction
    } else {
      // Default based on material type or general use
      if (material.materialType === 'ZDRL') {
        suggestions.industrySector = ['O'] // Oil & Gas
      } else if (material.materialType === 'ZCHM') {
        suggestions.industrySector = ['C'] // Chemical
      } else if (material.materialType === 'ZELE') {
        suggestions.industrySector = ['E'] // Electrical
      } else {
        suggestions.industrySector = ['O', 'M'] // Default to Oil & Gas and Manufacturing
      }
    }
    
    // Material Group suggestions - provide 1-2 most relevant based on material type and description
    if (material.materialType === 'ZDRL') {
      if (materialDesc.includes('bit')) {
        suggestions.materialGroup = ['43MNP (DRILL BITS)']
      } else if (materialDesc.includes('guide')) {
        suggestions.materialGroup = ['43JDX (SELF INDEXING GUIDE)']
      } else {
        suggestions.materialGroup = ['43KLM (DRILLING TOOLS)']
      }
    } else if (material.materialType === 'ZCHM') {
      if (materialDesc.includes('cement') || materialDesc.includes('additive')) {
        suggestions.materialGroup = ['44GHI (CEMENT ADDITIVES)']
      } else if (materialDesc.includes('fluid')) {
        suggestions.materialGroup = ['44DEF (DRILLING FLUIDS)']
      } else {
        suggestions.materialGroup = ['44ABC (CHEMICAL COMPOUNDS)']
      }
    } else if (material.materialType === 'ZELE') {
      if (materialDesc.includes('control') || materialDesc.includes('system')) {
        suggestions.materialGroup = ['45UVW (CONTROL SYSTEMS)']
      } else if (materialDesc.includes('power') || materialDesc.includes('supply')) {
        suggestions.materialGroup = ['45RST (POWER SUPPLIES)']
      } else {
        suggestions.materialGroup = ['45XYZ (ELECTRICAL COMPONENTS)']
      }
    } else {
      // Default suggestions based on material description
      if (materialDesc.includes('drill') || materialDesc.includes('bit')) {
        suggestions.materialGroup = ['43MNP (DRILL BITS)', '43KLM (DRILLING TOOLS)']
      } else if (materialDesc.includes('chemical') || materialDesc.includes('additive')) {
        suggestions.materialGroup = ['44ABC (CHEMICAL COMPOUNDS)', '44GHI (CEMENT ADDITIVES)']
      } else if (materialDesc.includes('electrical') || materialDesc.includes('cable')) {
        suggestions.materialGroup = ['45XYZ (ELECTRICAL COMPONENTS)', '45RST (POWER SUPPLIES)']
      } else {
        // Generic fallback
        suggestions.materialGroup = ['43KLM (DRILLING TOOLS)', '44ABC (CHEMICAL COMPOUNDS)']
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
      if (material.materialGroup) {
        const materialGroupCode = material.materialGroup.split(' ')[0];
        if (!/^\d{2}[A-Z]{3}$/i.test(materialGroupCode)) {
          validations.push({
            field: 'materialGroup',
            status: 'warning',
            message: 'Material group code should follow format: 2 numbers + 3 letters',
            suggestion: 'Example format: 43JDX (SELF INDEXING GUIDE)'
          })
        }
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