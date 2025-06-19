import { NextRequest, NextResponse } from 'next/server'
import { 
  MATERIAL_TYPES, 
  BASE_UNITS_OF_MEASURE, 
  INDUSTRY_SECTORS, 
  MATERIAL_GROUPS,
  MATERIAL_KEYWORDS,
  UNIT_KEYWORDS,
  INDUSTRY_KEYWORDS
} from '../../../data/aiLists'

// Add delay to show AI is working (3-5 seconds)
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function POST(request: NextRequest) {
  try {
    const material = await request.json()
    
    // Add AI processing delay (3-5 seconds) so users can see AI is working
    const delayTime = Math.floor(Math.random() * 2000) + 3000 // 3-5 seconds
    await delay(delayTime)
    
    // Get material description (either from materialDescription field or material field)
    const materialDesc = (material.materialDescription || material.material || '').toLowerCase()
    const materialCode = (material.material || '').toLowerCase()
    
    const suggestions: Record<string, string[]> = {}
    
    // Use the suggestions API for each field
    const baseUrl = request.nextUrl.origin
    
    try {
      // Get suggestions for each field using the suggestions API
      const [baseUnitResponse, materialTypeResponse, industrySectorResponse, materialGroupResponse] = await Promise.all([
        fetch(`${baseUrl}/api/ai/suggestions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            field: 'baseUnitOfMeasure',
            context: {
              description: material.materialDescription || material.material || '',
              materialType: material.materialType || '',
              materialCode: material.material || ''
            }
          })
        }),
        fetch(`${baseUrl}/api/ai/suggestions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            field: 'materialType',
            context: {
              description: material.materialDescription || material.material || '',
              materialType: material.materialType || '',
              materialCode: material.material || ''
            }
          })
        }),
        fetch(`${baseUrl}/api/ai/suggestions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            field: 'industrySector',
            context: {
              description: material.materialDescription || material.material || '',
              materialType: material.materialType || '',
              materialCode: material.material || ''
            }
          })
        }),
        fetch(`${baseUrl}/api/ai/suggestions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            field: 'materialGroup',
            context: {
              description: material.materialDescription || material.material || '',
              materialType: material.materialType || '',
              materialCode: material.material || ''
            }
          })
        })
      ])
      
      const [baseUnitData, materialTypeData, industrySectorData, materialGroupData] = await Promise.all([
        baseUnitResponse.json(),
        materialTypeResponse.json(),
        industrySectorResponse.json(),
        materialGroupResponse.json()
      ])
      
      suggestions.baseUnitOfMeasure = baseUnitData.suggestions || []
      suggestions.materialType = materialTypeData.suggestions || []
      suggestions.industrySector = industrySectorData.suggestions || []
      suggestions.materialGroup = materialGroupData.suggestions || []
      
    } catch (error) {
      console.error('Error getting AI suggestions:', error)
      
      // Enhanced fallback logic using the comprehensive lists
      suggestions.baseUnitOfMeasure = suggestBaseUnitFallback(materialDesc, material.materialType)
      suggestions.materialType = suggestMaterialTypeFallback(materialDesc, materialCode)
      suggestions.industrySector = suggestIndustrySectorFallback(materialDesc, material.materialType)
      suggestions.materialGroup = suggestMaterialGroupFallback(materialDesc, material.materialType)
    }

    // Add validations (keeping the existing validation logic)
    const validations = []
    
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
        const materialGroupCode = material.materialGroup.split(' ')[0]
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

    // Calculate risk score
    const errorCount = validations.filter((v: any) => v.status === 'error').length
    const warningCount = validations.filter((v: any) => v.status === 'warning').length
    const riskScore = Math.min(100, (errorCount * 30) + (warningCount * 15))

    return NextResponse.json({
      suggestions,
      validations,
      riskScore,
      duplicates: [] // Empty for now, could implement duplicate detection later
    })

  } catch (error) {
    console.error('Error in AI analysis:', error)
    return NextResponse.json(
      { error: 'Failed to analyze material entry' },
      { status: 500 }
    )
  }
}

// Enhanced fallback functions using the comprehensive lists

function suggestMaterialTypeFallback(materialDesc: string, materialCode: string): string[] {
  const suggestions: { code: string; score: number }[] = []
  
  for (const [typeCode, keywords] of Object.entries(MATERIAL_KEYWORDS)) {
    let score = keywords.reduce((acc, keyword) => {
      return acc + (materialDesc.includes(keyword) ? 1 : 0)
    }, 0)
    
    // Check material code patterns
    if (materialCode.startsWith(typeCode.toLowerCase().substring(1))) score += 2
    
    if (score > 0) {
      suggestions.push({ code: typeCode, score })
    }
  }
  
  suggestions.sort((a, b) => b.score - a.score)
  return suggestions.slice(0, 2).map(s => s.code)
}

function suggestBaseUnitFallback(materialDesc: string, materialType: string): string[] {
  const suggestions: { code: string; score: number }[] = []
  
  for (const [unitCode, keywords] of Object.entries(UNIT_KEYWORDS)) {
    let score = keywords.reduce((acc, keyword) => {
      return acc + (materialDesc.includes(keyword) ? 1 : 0)
    }, 0)
    
    // Boost score based on material type
    if (materialType === 'ZDRL' && ['EA', 'PCS', 'M', 'FT'].includes(unitCode)) score += 2
    if (materialType === 'ZCHM' && ['KG', 'LTR', 'BAG', 'MT'].includes(unitCode)) score += 2
    if (materialType === 'ZELE' && ['EA', 'PCS', 'M'].includes(unitCode)) score += 2
    if (materialType === 'ZPIP' && ['M', 'FT', 'PCS', 'EA'].includes(unitCode)) score += 2
    if (materialType === 'ZSTL' && ['KG', 'MT', 'M', 'PCS'].includes(unitCode)) score += 2
    if (materialType === 'ZCEM' && ['BAG', 'KG', 'MT'].includes(unitCode)) score += 2
    
    if (score > 0) {
      suggestions.push({ code: unitCode, score })
    }
  }
  
  suggestions.sort((a, b) => b.score - a.score)
  return suggestions.slice(0, 2).map(s => s.code)
}

function suggestIndustrySectorFallback(materialDesc: string, materialType: string): string[] {
  const suggestions: { code: string; score: number }[] = []
  
  for (const [sectorCode, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    let score = keywords.reduce((acc, keyword) => {
      return acc + (materialDesc.includes(keyword) ? 1 : 0)
    }, 0)
    
    // Boost score based on material type
    if (materialType === 'ZDRL' && sectorCode === 'O') score += 3
    if (materialType === 'ZCHM' && ['C', 'P'].includes(sectorCode)) score += 3
    if (materialType === 'ZELE' && sectorCode === 'E') score += 3
    if (materialType === 'ZPIP' && ['O', 'M'].includes(sectorCode)) score += 3
    if (materialType === 'ZSTL' && ['M', 'B'].includes(sectorCode)) score += 3
    if (materialType === 'ZCEM' && ['B', 'O'].includes(sectorCode)) score += 3
    
    if (score > 0) {
      suggestions.push({ code: sectorCode, score })
    }
  }
  
  suggestions.sort((a, b) => b.score - a.score)
  return suggestions.slice(0, 2).map(s => s.code)
}

function suggestMaterialGroupFallback(materialDesc: string, materialType: string): string[] {
  const groups = materialType && MATERIAL_GROUPS[materialType as keyof typeof MATERIAL_GROUPS] 
    ? MATERIAL_GROUPS[materialType as keyof typeof MATERIAL_GROUPS]
    : Object.values(MATERIAL_GROUPS).flat()
  
  const suggestions: { code: string; description: string; score: number }[] = []
  
  for (const group of groups) {
    const groupKeywords = group.description.toLowerCase().split(' ')
    let score = groupKeywords.reduce((acc, keyword) => {
      return acc + (materialDesc.includes(keyword.toLowerCase()) ? 1 : 0)
    }, 0)
    
    // Additional keyword matching
    if (materialDesc.includes('bit') && group.description.includes('BITS')) score += 3
    if (materialDesc.includes('drill') && group.description.includes('DRILL')) score += 3
    if (materialDesc.includes('pipe') && group.description.includes('PIPE')) score += 3
    if (materialDesc.includes('chemical') && group.description.includes('CHEMICAL')) score += 3
    if (materialDesc.includes('electrical') && group.description.includes('ELECTRICAL')) score += 3
    if (materialDesc.includes('cement') && group.description.includes('CEMENT')) score += 3
    if (materialDesc.includes('steel') && group.description.includes('STEEL')) score += 3
    
    if (score > 0) {
      suggestions.push({ 
        code: group.code, 
        description: group.description, 
        score 
      })
    }
  }
  
  suggestions.sort((a, b) => b.score - a.score)
  return suggestions.slice(0, 2).map(s => `${s.code} (${s.description})`)
} 