import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { 
  MATERIAL_TYPES, 
  BASE_UNITS_OF_MEASURE, 
  INDUSTRY_SECTORS, 
  MATERIAL_GROUPS,
  MATERIAL_KEYWORDS,
  UNIT_KEYWORDS,
  INDUSTRY_KEYWORDS
} from '../../../data/aiLists'

// Initialize OpenAI client on server-side only
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
})

const MODEL_NAME = 'gpt-4o'

// Add delay to show AI is working (1-2 seconds for individual field suggestions)
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function POST(request: NextRequest) {
  try {
    const { field, context } = await request.json()

    // Add AI processing delay (1-2 seconds) so users can see AI is working on suggestions
    const delayTime = Math.floor(Math.random() * 1000) + 1000 // 1-2 seconds
    await delay(delayTime)

    // First try intelligent matching based on predefined lists
    const localSuggestions = getLocalSuggestions(field, context)
    
    // If OpenAI is available, enhance with AI suggestions
    if (process.env.OPENAI_API_KEY) {
      try {
        const aiSuggestions = await getAISuggestions(field, context, localSuggestions)
        return NextResponse.json({ suggestions: aiSuggestions })
      } catch (error) {
        console.error('Error calling OpenAI API:', error)
        // Fall back to local suggestions
        return NextResponse.json({ suggestions: localSuggestions })
      }
    }

    return NextResponse.json({ suggestions: localSuggestions })

  } catch (error) {
    console.error('Error in suggestions API:', error)
    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    )
  }
}

// Get suggestions based on predefined lists and keyword matching
function getLocalSuggestions(field: string, context: any): string[] {
  const description = (context.description || '').toLowerCase()
  const materialType = context.materialType || ''
  
  switch (field) {
    case 'materialType':
      return suggestMaterialType(description)
    
    case 'baseUnitOfMeasure':
      return suggestBaseUnit(description, materialType)
    
    case 'industrySector':
      return suggestIndustrySector(description, materialType)
    
    case 'materialGroup':
      return suggestMaterialGroup(description, materialType)
    
    default:
      return []
  }
}

// AI-enhanced suggestions using OpenAI
async function getAISuggestions(field: string, context: any, localSuggestions: string[]): Promise<string[]> {
  const prompt = generateEnhancedPrompt(field, context, localSuggestions)
  
  const response = await openai.chat.completions.create({
    model: MODEL_NAME,
    messages: [
      { 
        role: "system", 
        content: "You are an AI assistant specializing in SAP material master data. Choose the most appropriate options from the provided list based on the material description. Return only the codes/values from the list, maximum 2 suggestions." 
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.1,
    max_tokens: 100,
  })

  const content = response.choices[0].message.content || ''
  const aiSuggestions = parseAIResponse(content, field)
  
  // Combine and validate AI suggestions with local ones
  const validSuggestions = aiSuggestions.filter(suggestion => 
    localSuggestions.some(local => 
      local.toLowerCase().includes(suggestion.toLowerCase()) || 
      suggestion.toLowerCase().includes(local.toLowerCase())
    )
  )
  
  return validSuggestions.length > 0 ? validSuggestions : localSuggestions
}

// Generate enhanced prompts with available options
function generateEnhancedPrompt(field: string, context: any, availableOptions: string[]): string {
  const description = context.description || ''
  const materialType = context.materialType || ''
  
  switch (field) {
    case 'materialType':
      return `Material description: "${description}"
Available material types: ${MATERIAL_TYPES.map(t => `${t.code} (${t.description})`).join(', ')}
Choose the most appropriate material type codes (maximum 2):`

    case 'baseUnitOfMeasure':
      return `Material description: "${description}"
Material type: "${materialType}"
Available units: ${BASE_UNITS_OF_MEASURE.map(u => `${u.code} (${u.description})`).join(', ')}
Choose the most appropriate unit codes (maximum 2):`

    case 'industrySector':
      return `Material description: "${description}"
Material type: "${materialType}"
Available industry sectors: ${INDUSTRY_SECTORS.map(i => `${i.code} (${i.description})`).join(', ')}
Choose the most appropriate industry sector codes (maximum 2):`

    case 'materialGroup':
      const groups = materialType && MATERIAL_GROUPS[materialType as keyof typeof MATERIAL_GROUPS] 
        ? MATERIAL_GROUPS[materialType as keyof typeof MATERIAL_GROUPS]
        : Object.values(MATERIAL_GROUPS).flat()
      
      return `Material description: "${description}"
Material type: "${materialType}"
Available material groups: ${groups.map(g => `${g.code} (${g.description})`).join(', ')}
Choose the most appropriate material group codes with descriptions (maximum 2):`

    default:
      return `Material description: "${description}". Suggest appropriate values for ${field}.`
  }
}

// Suggest material type based on keywords
function suggestMaterialType(description: string): string[] {
  const suggestions: { code: string; score: number }[] = []
  
  for (const [typeCode, keywords] of Object.entries(MATERIAL_KEYWORDS)) {
    const score = keywords.reduce((acc, keyword) => {
      return acc + (description.includes(keyword) ? 1 : 0)
    }, 0)
    
    if (score > 0) {
      suggestions.push({ code: typeCode, score })
    }
  }
  
  // Sort by score and return top 2 - return just the codes for Material Type
  suggestions.sort((a, b) => b.score - a.score)
  return suggestions.slice(0, 2).map(s => s.code)
}

// Suggest base unit based on keywords and material type
function suggestBaseUnit(description: string, materialType: string): string[] {
  const suggestions: { code: string; score: number }[] = []
  
  for (const [unitCode, keywords] of Object.entries(UNIT_KEYWORDS)) {
    let score = keywords.reduce((acc, keyword) => {
      return acc + (description.includes(keyword) ? 1 : 0)
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

// Suggest industry sector based on keywords and material type
function suggestIndustrySector(description: string, materialType: string): string[] {
  const suggestions: { code: string; score: number }[] = []
  
  for (const [sectorCode, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    let score = keywords.reduce((acc, keyword) => {
      return acc + (description.includes(keyword) ? 1 : 0)
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

// Suggest material group based on material type and keywords
function suggestMaterialGroup(description: string, materialType: string): string[] {
  const groups = materialType && MATERIAL_GROUPS[materialType as keyof typeof MATERIAL_GROUPS] 
    ? MATERIAL_GROUPS[materialType as keyof typeof MATERIAL_GROUPS]
    : Object.values(MATERIAL_GROUPS).flat()
  
  const suggestions: { code: string; description: string; score: number }[] = []
  
  for (const group of groups) {
    const groupKeywords = group.description.toLowerCase().split(' ')
    let score = groupKeywords.reduce((acc, keyword) => {
      return acc + (description.includes(keyword.toLowerCase()) ? 1 : 0)
    }, 0)
    
    // Additional keyword matching
    if (description.includes('bit') && group.description.includes('BITS')) score += 3
    if (description.includes('drill') && group.description.includes('DRILL')) score += 3
    if (description.includes('pipe') && group.description.includes('PIPE')) score += 3
    if (description.includes('chemical') && group.description.includes('CHEMICAL')) score += 3
    if (description.includes('electrical') && group.description.includes('ELECTRICAL')) score += 3
    if (description.includes('cement') && group.description.includes('CEMENT')) score += 3
    if (description.includes('steel') && group.description.includes('STEEL')) score += 3
    
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

// Parse the AI response into a list of suggestions
function parseAIResponse(response: string, field: string): string[] {
  const lines = response.split('\n').filter(line => line.trim() !== '')
  
  const suggestions = lines.map(line => {
    if (field === 'materialGroup') {
      const match = line.match(/(\d{2}[A-Z]{3}(\s*\([^)]+\))?)/i)
      return match ? match[0].trim() : line.trim()
    }
    
    const match = line.match(/^([A-Z0-9]+)/i)
    return match ? match[0].trim() : line.trim()
  })
  
  return Array.from(new Set(suggestions)).slice(0, 2)
} 