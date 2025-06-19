'use client'

import { useState, useEffect } from 'react'
import { Material, AIAnalysis, ValidationResult } from '../types'
import { aiService } from '../services/aiService'
import { AlertTriangle, CheckCircle, XCircle, Lightbulb, Search, Bot } from 'lucide-react'
import toast from 'react-hot-toast'

export function MaterialEntryForm() {
  const [formData, setFormData] = useState<Partial<Material>>({
    materialCode: '',
    description: '',
    materialType: '',
    plantCode: '',
    vendorId: '',
    manufacturerId: '',
    unitOfMeasure: '',
    category: '',
    basePrice: undefined
  })

  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState<Record<string, boolean>>({})

  // Real-time analysis when form data changes
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (formData.description && formData.description.length > 3) {
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

  const handleInputChange = (field: keyof Material, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const applySuggestion = (field: string, suggestion: string) => {
    handleInputChange(field as keyof Material, suggestion)
    setShowSuggestions(prev => ({ ...prev, [field]: false }))
    toast.success(`Applied AI suggestion for ${field}`)
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

  const getInputClassName = (field: string) => {
    const status = getValidationStatus(field)
    const baseClass = 'sap-input w-full'
    
    switch (status) {
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
    if (analysis?.riskScore && analysis.riskScore > 50) {
      toast.error('Cannot submit: High risk score detected. Please resolve validation issues.')
      return
    }
    toast.success('Material submitted successfully! (This is a PoC demo)')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Form */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-6">
            <Bot className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">AI-Powered Material Entry</h2>
            {isAnalyzing && (
              <div className="ml-auto flex items-center gap-2 text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Analyzing...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Material Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material Code *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.materialCode || ''}
                    onChange={(e) => handleInputChange('materialCode', e.target.value)}
                    className={getInputClassName('materialCode')}
                    placeholder="STL001"
                  />
                  {analysis?.suggestions?.materialCode && (
                    <button
                      type="button"
                      onClick={() => setShowSuggestions(prev => ({ ...prev, materialCode: !prev.materialCode }))}
                      className="absolute right-2 top-2 text-blue-600 hover:text-blue-700"
                    >
                      <Lightbulb className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {getValidationMessage('materialCode') && (
                  <ValidationMessage validation={getValidationMessage('materialCode')!} />
                )}
                {showSuggestions.materialCode && analysis?.suggestions?.materialCode && (
                  <SuggestionsList
                    suggestions={analysis.suggestions.materialCode}
                    onApply={(suggestion) => applySuggestion('materialCode', suggestion)}
                  />
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material Description *
                </label>
                <input
                  type="text"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={getInputClassName('description')}
                  placeholder="Steel Rod 10mm"
                />
                {getValidationMessage('description') && (
                  <ValidationMessage validation={getValidationMessage('description')!} />
                )}
              </div>

              {/* Material Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material Type
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.materialType || ''}
                    onChange={(e) => handleInputChange('materialType', e.target.value)}
                    className={getInputClassName('materialType')}
                    placeholder="ROD"
                  />
                  {analysis?.suggestions?.materialType && (
                    <button
                      type="button"
                      onClick={() => setShowSuggestions(prev => ({ ...prev, materialType: !prev.materialType }))}
                      className="absolute right-2 top-2 text-blue-600 hover:text-blue-700"
                    >
                      <Lightbulb className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {showSuggestions.materialType && analysis?.suggestions?.materialType && (
                  <SuggestionsList
                    suggestions={analysis.suggestions.materialType}
                    onApply={(suggestion) => applySuggestion('materialType', suggestion)}
                  />
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={getInputClassName('category')}
                    placeholder="STEEL"
                  />
                  {analysis?.suggestions?.category && (
                    <button
                      type="button"
                      onClick={() => setShowSuggestions(prev => ({ ...prev, category: !prev.category }))}
                      className="absolute right-2 top-2 text-blue-600 hover:text-blue-700"
                    >
                      <Lightbulb className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {showSuggestions.category && analysis?.suggestions?.category && (
                  <SuggestionsList
                    suggestions={analysis.suggestions.category}
                    onApply={(suggestion) => applySuggestion('category', suggestion)}
                  />
                )}
              </div>

              {/* Plant Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plant Code
                </label>
                <select
                  value={formData.plantCode || ''}
                  onChange={(e) => handleInputChange('plantCode', e.target.value)}
                  className={`${getInputClassName('plantCode')} text-gray-900`}
                >
                  <option value="" className="text-gray-500">Select Plant</option>
                  <option value="P001" className="text-gray-900">Plant 001 - Mumbai</option>
                  <option value="P002" className="text-gray-900">Plant 002 - Delhi</option>
                  <option value="P003" className="text-gray-900">Plant 003 - Bangalore</option>
                </select>
              </div>

              {/* Unit of Measure */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit of Measure
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.unitOfMeasure || ''}
                    onChange={(e) => handleInputChange('unitOfMeasure', e.target.value)}
                    className={getInputClassName('unitOfMeasure')}
                    placeholder="MT"
                  />
                  {analysis?.suggestions?.unitOfMeasure && (
                    <button
                      type="button"
                      onClick={() => setShowSuggestions(prev => ({ ...prev, unitOfMeasure: !prev.unitOfMeasure }))}
                      className="absolute right-2 top-2 text-blue-600 hover:text-blue-700"
                    >
                      <Lightbulb className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {showSuggestions.unitOfMeasure && analysis?.suggestions?.unitOfMeasure && (
                  <SuggestionsList
                    suggestions={analysis.suggestions.unitOfMeasure}
                    onApply={(suggestion) => applySuggestion('unitOfMeasure', suggestion)}
                  />
                )}
              </div>

              {/* Vendor ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor ID *
                </label>
                <input
                  type="text"
                  value={formData.vendorId || ''}
                  onChange={(e) => handleInputChange('vendorId', e.target.value)}
                  className={getInputClassName('vendorId')}
                  placeholder="200001 (Qualified vendors start with 200)"
                />
                {getValidationMessage('vendorId') && (
                  <ValidationMessage validation={getValidationMessage('vendorId')!} />
                )}
              </div>

              {/* Manufacturer ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manufacturer ID
                </label>
                <input
                  type="text"
                  value={formData.manufacturerId || ''}
                  onChange={(e) => handleInputChange('manufacturerId', e.target.value)}
                  className={getInputClassName('manufacturerId')}
                  placeholder="200101"
                />
              </div>
            </div>

            {/* Base Price */}
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Price
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.basePrice || ''}
                onChange={(e) => handleInputChange('basePrice', parseFloat(e.target.value))}
                className={getInputClassName('basePrice')}
                placeholder="150.00"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className={`sap-button ${analysis?.riskScore && analysis.riskScore > 50 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={analysis?.riskScore && analysis.riskScore > 50}
              >
                Submit Material
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* AI Analysis Panel */}
      <div className="space-y-6">
        {analysis && <AIAnalysisPanel analysis={analysis} />}
      </div>
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