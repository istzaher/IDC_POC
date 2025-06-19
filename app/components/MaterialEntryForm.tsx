'use client'

import { useState, useEffect } from 'react'
import { Material, AIAnalysis, ValidationResult } from '../types'
import { aiService } from '../services/aiService'
import { getPlantCodes } from '../data'
import { AlertTriangle, CheckCircle, XCircle, Lightbulb, Search, Bot } from 'lucide-react'
import toast from 'react-hot-toast'

export function MaterialEntryForm() {
  const [formData, setFormData] = useState({
    material: '',
    baseUnitOfMeasure: 'EA',
    materialType: 'ZDRL',
    industrySector: 'O',
    materialGroup: '43JDX',
    oldMaterialNumber: '',
    crossReferenceMaterial: '',
    crossPlantMaterialStatus: '',
    commonMaterialFlag: false,
    batchManagement: 'No',
    serializationLevel: 'Serialization within the stock material number',
    approvedBatchRecordRequired: 'No',
    division: '',
    catalogEnabled: false
  })

  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState<Record<string, boolean>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Real-time analysis when form data changes
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (formData.material && formData.material.length > 3) {
        setIsAnalyzing(true)
        try {
          const result = await aiService.analyzeEntry(formData)
          setAnalysis(result)
        } catch (error) {
          console.error('Analysis failed:', error)
        } finally {
          setIsAnalyzing(false)
        }
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formData])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const applySuggestion = (field: string, suggestion: string) => {
    handleInputChange(field, suggestion)
    setShowSuggestions(prev => ({ ...prev, [field]: false }))
    toast.success(`Applied AI suggestion for ${field}`)
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!formData.material?.trim()) {
      errors.material = 'Material is required'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const getValidationStatus = (field: string) => {
    if (!analysis?.validations) return 'default'
    const validation = analysis.validations.find(v => v.field === field)
    return validation?.status || 'default'
  }

  const getValidationMessage = (field: string) => {
    if (!analysis?.validations) return null
    return analysis.validations.find(v => v.field === field)
  }

  const getFormErrorMessage = (field: string) => {
    return formErrors[field] || null
  }

  const getInputClassName = (field: string) => {
    const aiStatus = getValidationStatus(field)
    const hasFormError = formErrors[field]
    const baseClass = 'sap-input w-full'
    
    // Form validation errors take precedence
    if (hasFormError) {
      return `${baseClass} validation-error`
    }
    
    // Then AI validation status
    switch (aiStatus) {
      case 'error':
        return `${baseClass} validation-error`
      case 'warning':
        return `${baseClass} validation-warning`
      case 'valid':
        return `${baseClass} validation-success`
      default:
        return baseClass
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    // Handle submission
    console.log('Form submitted:', formData)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">General Data</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-[200px,1fr] gap-4 items-center">
          {/* Material */}
          <label className="text-sm font-medium text-gray-700">Material:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.material}
              onChange={(e) => handleInputChange('material', e.target.value)}
              className={getInputClassName('material')}
              placeholder="S1566153"
            />
            <button type="button" className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Base Unit of Measure */}
          <label className="text-sm font-medium text-gray-700">Base Unit of Measure:*</label>
          <div className="flex gap-2">
            <select
              value={formData.baseUnitOfMeasure}
              onChange={(e) => handleInputChange('baseUnitOfMeasure', e.target.value)}
              className={getInputClassName('baseUnitOfMeasure')}
            >
              <option value="EA">EA</option>
              <option value="PCS">PCS</option>
              <option value="KG">KG</option>
              <option value="M">M</option>
            </select>
            <span className="py-2 text-gray-600">each</span>
          </div>

          {/* Material Type */}
          <label className="text-sm font-medium text-gray-700">Material Type:*</label>
          <div className="flex gap-2">
            <select
              value={formData.materialType}
              onChange={(e) => handleInputChange('materialType', e.target.value)}
              className={getInputClassName('materialType')}
            >
              <option value="ZDRL">ZDRL</option>
            </select>
            <span className="py-2 text-gray-600">Drilling Materials</span>
          </div>

          {/* Industry Sector */}
          <label className="text-sm font-medium text-gray-700">Industry Sector:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.industrySector}
              onChange={(e) => handleInputChange('industrySector', e.target.value)}
              className={getInputClassName('industrySector')}
              readOnly
            />
            <span className="py-2 text-gray-600">Oil Industry</span>
          </div>

          {/* Material Group */}
          <label className="text-sm font-medium text-gray-700">Material Group:*</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.materialGroup}
              onChange={(e) => handleInputChange('materialGroup', e.target.value)}
              className={getInputClassName('materialGroup')}
            />
            <span className="py-2 text-gray-600">SELF INDEXING GUIDE</span>
          </div>

          {/* Old Material Number */}
          <label className="text-sm font-medium text-gray-700">Old Material Number:</label>
          <input
            type="text"
            value={formData.oldMaterialNumber}
            onChange={(e) => handleInputChange('oldMaterialNumber', e.target.value)}
            className={getInputClassName('oldMaterialNumber')}
          />

          {/* Cross Reference Material */}
          <label className="text-sm font-medium text-gray-700">Cross Reference Material:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.crossReferenceMaterial}
              onChange={(e) => handleInputChange('crossReferenceMaterial', e.target.value)}
              className={getInputClassName('crossReferenceMaterial')}
              placeholder="Old Material Number"
            />
            <button type="button" className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Cross-Plant Material Status */}
          <label className="text-sm font-medium text-gray-700">Cross-Plant Material Status:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.crossPlantMaterialStatus}
              onChange={(e) => handleInputChange('crossPlantMaterialStatus', e.target.value)}
              className={getInputClassName('crossPlantMaterialStatus')}
            />
            <button type="button" className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Common material flag */}
          <label className="text-sm font-medium text-gray-700">Common material flag:</label>
          <input
            type="checkbox"
            checked={formData.commonMaterialFlag}
            onChange={(e) => handleInputChange('commonMaterialFlag', e.target.checked)}
            className={getInputClassName('commonMaterialFlag')}
          />

          {/* Batch Management */}
          <label className="text-sm font-medium text-gray-700">Batch Management:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.batchManagement}
              onChange={(e) => handleInputChange('batchManagement', e.target.value)}
              className={getInputClassName('batchManagement')}
              readOnly
            />
          </div>

          {/* Serialization Level */}
          <label className="text-sm font-medium text-gray-700">Serialization Level:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.serializationLevel}
              onChange={(e) => handleInputChange('serializationLevel', e.target.value)}
              className={getInputClassName('serializationLevel')}
              readOnly
            />
          </div>

          {/* Approved Batch Record Required Indicator */}
          <label className="text-sm font-medium text-gray-700">Approved Batch Record Required Indicator:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.approvedBatchRecordRequired}
              onChange={(e) => handleInputChange('approvedBatchRecordRequired', e.target.value)}
              className={getInputClassName('approvedBatchRecordRequired')}
              readOnly
            />
          </div>

          {/* Division */}
          <label className="text-sm font-medium text-gray-700">Division:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.division}
              onChange={(e) => handleInputChange('division', e.target.value)}
              className={getInputClassName('division')}
            />
            <button type="button" className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Catalog Enabled */}
          <label className="text-sm font-medium text-gray-700">Catalog Enabled:</label>
          <input
            type="checkbox"
            checked={formData.catalogEnabled}
            onChange={(e) => handleInputChange('catalogEnabled', e.target.checked)}
            className={getInputClassName('catalogEnabled')}
          />
        </div>

        {/* Error Messages */}
        {Object.keys(formErrors).length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
            <h4 className="text-red-800 font-medium mb-2">Please correct the following errors:</h4>
            <ul className="list-disc list-inside text-red-700">
              {Object.entries(formErrors).map(([field, error]) => (
                <li key={field}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </div>
  )
}

// Helper Components
function ValidationMessage({ validation }: { validation: ValidationResult }) {
  const Icon = validation.status === 'valid' ? CheckCircle : 
               validation.status === 'warning' ? AlertTriangle : XCircle
  
  const colorClass = validation.status === 'valid' ? 'text-green-600' :
                    validation.status === 'warning' ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className={`flex items-start gap-2 mt-1 text-sm ${colorClass}`}>
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <div>
        <p>{validation.message}</p>
        {validation.suggestion && (
          <p className="text-gray-600 mt-1">💡 {validation.suggestion}</p>
        )}
      </div>
    </div>
  )
}

function SuggestionsList({ suggestions, onApply }: { 
  suggestions: string[]
  onApply: (suggestion: string) => void 
}) {
  return (
    <div className="mt-2 bg-blue-50 border border-blue-200 rounded-md p-2">
      <p className="text-sm text-blue-800 font-medium mb-2">AI Suggestions:</p>
      <div className="space-y-1">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onApply(suggestion)}
            className="block w-full text-left text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-100 px-2 py-1 rounded"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}

function AIAnalysisPanel({ analysis }: { analysis: AIAnalysis }) {
  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600'
    if (score < 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRiskBgColor = (score: number) => {
    if (score < 30) return 'bg-green-100'
    if (score < 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="space-y-4">
      {/* Risk Score */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Risk Assessment</h3>
        <div className={`p-3 rounded-lg ${getRiskBgColor(analysis.riskScore)}`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">Risk Score</span>
            <span className={`text-2xl font-bold ${getRiskColor(analysis.riskScore)}`}>
              {analysis.riskScore}%
            </span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                analysis.riskScore < 30 ? 'bg-green-500' :
                analysis.riskScore < 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${analysis.riskScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Duplicate Detection */}
      {analysis.duplicates.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Search className="w-5 h-5" />
            Potential Duplicates
          </h3>
          <div className="space-y-2">
            {analysis.duplicates.map((duplicate, index) => (
              <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{duplicate.material.description}</p>
                    <p className="text-xs text-gray-600">Code: {duplicate.material.materialCode}</p>
                  </div>
                  <span className="text-sm font-medium text-orange-600">
                    {Math.round(duplicate.similarity * 100)}% match
                  </span>
                </div>
                <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                  duplicate.matchType === 'exact' ? 'bg-red-100 text-red-800' :
                  duplicate.matchType === 'similar' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {duplicate.matchType} match
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Summary */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Validation Summary</h3>
        <div className="space-y-2">
          {analysis.validations.map((validation, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              {validation.status === 'valid' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : validation.status === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="capitalize font-medium">{validation.field}:</span>
              <span className={
                validation.status === 'valid' ? 'text-green-600' :
                validation.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
              }>
                {validation.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 