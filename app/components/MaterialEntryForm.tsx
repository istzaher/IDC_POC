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
    materialDescription: '',
    baseUnitOfMeasure: '',
    materialType: '',
    industrySector: '',
    materialGroup: '',
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
      // Trigger analysis when we have either material code or material description
      const hasContent = (formData.material && formData.material.length > 2) || 
                        (formData.materialDescription && formData.materialDescription.length > 3)
      
      if (hasContent) {
        setIsAnalyzing(true)
        try {
          const result = await aiService.analyzeEntry(formData)
          setAnalysis(result)
        } catch (error) {
          console.error('Analysis failed:', error)
        } finally {
          setIsAnalyzing(false)
        }
      } else {
        // Clear analysis if no content
        setAnalysis(null)
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
    
    if (!formData.materialDescription?.trim()) {
      errors.materialDescription = 'Material Description is required'
    }
    
    if (!formData.baseUnitOfMeasure) {
      errors.baseUnitOfMeasure = 'Base Unit of Measure is required'
    }
    
    if (!formData.materialType) {
      errors.materialType = 'Material Type is required'
    }
    
    if (!formData.materialGroup) {
      errors.materialGroup = 'Material Group is required'
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

  const clearForm = () => {
    // Check if form has any data before showing confirmation
    const hasData = formData.material || formData.materialDescription || formData.baseUnitOfMeasure || 
                   formData.materialType || formData.industrySector || formData.materialGroup ||
                   formData.oldMaterialNumber || formData.crossReferenceMaterial || 
                   formData.crossPlantMaterialStatus || formData.division
    
    if (hasData && !confirm('Are you sure you want to clear all form data? This action cannot be undone.')) {
      return
    }
    
    setFormData({
      material: '',
      materialDescription: '',
      baseUnitOfMeasure: '',
      materialType: '',
      industrySector: '',
      materialGroup: '',
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
    setAnalysis(null)
    setShowSuggestions({})
    setFormErrors({})
    
    if (hasData) {
      toast.success('Form cleared successfully! 🧹')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    // Handle submission
    console.log('Form submitted:', formData)
    
    // Show success notification
    toast.success('Material master data submitted successfully! 🎉', {
      duration: 4000,
    })
    
    // Clear the form
    clearForm()
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">General Data</h2>
        {isAnalyzing && (
          <div className="flex items-center gap-2 text-blue-600">
            <Bot className="w-5 h-5" />
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">AI analyzing...</span>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Material */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Material:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.material}
                onChange={(e) => handleInputChange('material', e.target.value)}
                className="sap-input flex-1"
                placeholder="S1566153"
              />
              <button type="button" className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">
                <Search className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-medium text-blue-600">DEMO MATERIALS</p>
                <div className="h-px flex-1 bg-blue-100"></div>
              </div>
              <p className="text-xs text-gray-500 mb-1">Click any example below to populate the form:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { code: 'STL001', desc: 'Steel Rod 10mm', type: 'ZDRL', sector: 'O' },
                  { code: 'CEM001', desc: 'Portland Cement 50kg', type: 'ZCHM', sector: 'C' },
                  { code: 'PIP001', desc: 'PVC Pipe 6 inch', type: 'ZELE', sector: 'M' },
                  { code: 'ELE001', desc: 'Electrical Cable 2.5mm', type: 'ZELE', sector: 'E' },
                  { code: 'DRL101', desc: 'Drill Bit 12mm', type: 'ZDRL', sector: 'O' },
                  { code: 'CHM203', desc: 'Chemical Additive X40', type: 'ZCHM', sector: 'C' }
                ].map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      handleInputChange('material', item.code);
                      handleInputChange('materialDescription', item.desc);
                      // Note: All other fields are now independent - users can select them manually
                      // This allows for complete flexibility in field selection
                    }}
                    className={`px-2 py-1 border rounded text-xs flex items-center gap-1 hover:bg-gray-50 
                      ${item.type === 'ZDRL' ? 'bg-blue-50 border-blue-200' : 
                        item.type === 'ZCHM' ? 'bg-green-50 border-green-200' : 
                        'bg-amber-50 border-amber-200'}`}
                    title={`${item.desc} (Type: ${item.type})`}
                  >
                    <span className="font-mono font-medium">{item.code}</span>
                    <span className="text-gray-500 hidden sm:inline">-</span>
                    <span className="text-gray-600 hidden sm:inline truncate max-w-[80px]">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Material Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Material Description:*</label>
            <input
              type="text"
              value={formData.materialDescription}
              onChange={(e) => handleInputChange('materialDescription', e.target.value)}
              className={getInputClassName('materialDescription')}
              placeholder="Enter material description"
            />
            {getFormErrorMessage('materialDescription') && (
              <p className="text-red-500 text-sm">{getFormErrorMessage('materialDescription')}</p>
            )}
          </div>

          {/* Base Unit of Measure */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Base Unit of Measure:*</label>
            <div className="flex gap-2 relative">
              <select
                value={formData.baseUnitOfMeasure}
                onChange={(e) => handleInputChange('baseUnitOfMeasure', e.target.value)}
                className="sap-input w-full"
              >
                <option value="">Select</option>
                <option value="EA">EA (each)</option>
                <option value="PCS">PCS (pieces)</option>
                <option value="KG">KG (kilogram)</option>
                <option value="M">M (meter)</option>
                <option value="LTR">LTR (liter)</option>
                <option value="FT">FT (feet)</option>
                <option value="BAG">BAG (bag)</option>
                <option value="MT">MT (metric ton)</option>
              </select>
              {analysis?.suggestions?.baseUnitOfMeasure && (
                <button
                  type="button"
                  onClick={() => setShowSuggestions(prev => ({ ...prev, baseUnitOfMeasure: !prev.baseUnitOfMeasure }))}
                  className="absolute right-10 top-2 text-amber-500 hover:text-amber-600 drop-shadow-md"
                  title="AI Suggestions Available"
                >
                  <div className="relative">
                    <Lightbulb className="w-5 h-5 animate-pulse" />
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                  </div>
                </button>
              )}
            </div>
            {showSuggestions.baseUnitOfMeasure && analysis?.suggestions?.baseUnitOfMeasure && (
              <div>
                <SuggestionsList
                  suggestions={analysis.suggestions.baseUnitOfMeasure}
                  onApply={(suggestion) => applySuggestion('baseUnitOfMeasure', suggestion)}
                />
              </div>
            )}
          </div>

          {/* Material Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Material Type:*</label>
            <div className="flex gap-2 relative">
              <select
                value={formData.materialType}
                onChange={(e) => handleInputChange('materialType', e.target.value)}
                className="sap-input w-full"
              >
                <option value="">Select</option>
                <option value="ZDRL">ZDRL (Drilling Materials)</option>
                <option value="ZCHM">ZCHM (Chemical Materials)</option>
                <option value="ZELE">ZELE (Electrical Materials)</option>
              </select>
              {analysis?.suggestions?.materialType && (
                <button
                  type="button"
                  onClick={() => setShowSuggestions(prev => ({ ...prev, materialType: !prev.materialType }))}
                  className="absolute right-10 top-2 text-amber-500 hover:text-amber-600 drop-shadow-md"
                  title="AI Suggestions Available"
                >
                  <div className="relative">
                    <Lightbulb className="w-5 h-5 animate-pulse" />
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                  </div>
                </button>
              )}
            </div>
            {showSuggestions.materialType && analysis?.suggestions?.materialType && (
              <div>
                <SuggestionsList
                  suggestions={analysis.suggestions.materialType}
                  onApply={(suggestion) => applySuggestion('materialType', suggestion)}
                />
              </div>
            )}
          </div>

          {/* Industry Sector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Industry Sector:</label>
            <div className="flex gap-2 relative">
              <select
                value={formData.industrySector}
                onChange={(e) => handleInputChange('industrySector', e.target.value)}
                className="sap-input w-full"
              >
                <option value=""> Select</option>
                <option value="O">O (Oil & Gas Industry)</option>
                <option value="C">C (Chemical Industry)</option>
                <option value="M">M (Manufacturing Industry)</option>
                <option value="B">B (Construction Industry)</option>
                <option value="E">E (Electrical Industry)</option>
              </select>
              {analysis?.suggestions?.industrySector && (
                <button
                  type="button"
                  onClick={() => setShowSuggestions(prev => ({ ...prev, industrySector: !prev.industrySector }))}
                  className="absolute right-10 top-2 text-amber-500 hover:text-amber-600 drop-shadow-md"
                  title="AI Suggestions Available"
                >
                  <div className="relative">
                    <Lightbulb className="w-5 h-5 animate-pulse" />
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                  </div>
                </button>
              )}
            </div>
            {showSuggestions.industrySector && analysis?.suggestions?.industrySector && (
              <div>
                <SuggestionsList
                  suggestions={analysis.suggestions.industrySector}
                  onApply={(suggestion) => applySuggestion('industrySector', suggestion)}
                />
              </div>
            )}
          </div>

          {/* Material Group */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Material Group:*</label>
            <div className="flex gap-2 relative">
              <select
                value={formData.materialGroup}
                onChange={(e) => handleInputChange('materialGroup', e.target.value)}
                className="sap-input w-full"
              >
                <option value="">Select</option>
                {/* ZDRL - Drilling Materials */}
                <optgroup label="ZDRL - Drilling Materials">
                  <option value="43JDX (SELF INDEXING GUIDE)">43JDX (SELF INDEXING GUIDE)</option>
                  <option value="43KLM (DRILLING TOOLS)">43KLM (DRILLING TOOLS)</option>
                  <option value="43MNP (DRILL BITS)">43MNP (DRILL BITS)</option>
                  <option value="43ABC (DRILL PIPES)">43ABC (DRILL PIPES)</option>
                  <option value="43DEF (DRILL COLLARS)">43DEF (DRILL COLLARS)</option>
                  <option value="43GHI (DRILLING ACCESSORIES)">43GHI (DRILLING ACCESSORIES)</option>
                </optgroup>
                {/* ZCHM - Chemical Materials */}
                <optgroup label="ZCHM - Chemical Materials">
                  <option value="44ABC (CHEMICAL COMPOUNDS)">44ABC (CHEMICAL COMPOUNDS)</option>
                  <option value="44DEF (DRILLING FLUIDS)">44DEF (DRILLING FLUIDS)</option>
                  <option value="44GHI (CEMENT ADDITIVES)">44GHI (CEMENT ADDITIVES)</option>
                  <option value="44JKL (CORROSION INHIBITORS)">44JKL (CORROSION INHIBITORS)</option>
                  <option value="44MNO (CLEANING CHEMICALS)">44MNO (CLEANING CHEMICALS)</option>
                  <option value="44PQR (PRODUCTION CHEMICALS)">44PQR (PRODUCTION CHEMICALS)</option>
                </optgroup>
                {/* ZELE - Electrical Materials */}
                <optgroup label="ZELE - Electrical Materials">
                  <option value="45XYZ (ELECTRICAL COMPONENTS)">45XYZ (ELECTRICAL COMPONENTS)</option>
                  <option value="45UVW (CONTROL SYSTEMS)">45UVW (CONTROL SYSTEMS)</option>
                  <option value="45RST (POWER SUPPLIES)">45RST (POWER SUPPLIES)</option>
                  <option value="45ABC (CABLES & WIRING)">45ABC (CABLES & WIRING)</option>
                  <option value="45DEF (INSTRUMENTATION)">45DEF (INSTRUMENTATION)</option>
                  <option value="45GHI (ELECTRICAL PANELS)">45GHI (ELECTRICAL PANELS)</option>
                </optgroup>
              </select>
              {analysis?.suggestions?.materialGroup && (
                <button
                  type="button"
                  onClick={() => setShowSuggestions(prev => ({ ...prev, materialGroup: !prev.materialGroup }))}
                  className="absolute right-10 top-2 text-amber-500 hover:text-amber-600 drop-shadow-md"
                  title="AI Suggestions Available"
                >
                  <div className="relative">
                    <Lightbulb className="w-5 h-5 animate-pulse" />
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                  </div>
                </button>
              )}
            </div>
            {showSuggestions.materialGroup && analysis?.suggestions?.materialGroup && (
              <div>
                <SuggestionsList
                  suggestions={analysis.suggestions.materialGroup}
                  onApply={(suggestion) => applySuggestion('materialGroup', suggestion)}
                />
              </div>
            )}
          </div>

          {/* Old Material Number */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Old Material Number:</label>
            <input
              type="text"
              value={formData.oldMaterialNumber}
              onChange={(e) => handleInputChange('oldMaterialNumber', e.target.value)}
              className={getInputClassName('oldMaterialNumber')}
            />
          </div>

          {/* Cross Reference Material */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Cross Reference Material:</label>
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
          </div>

          {/* Cross-Plant Material Status */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Cross-Plant Material Status:</label>
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
          </div>

          {/* Common material flag */}
          <div className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              id="commonMaterialFlag"
              checked={formData.commonMaterialFlag}
              onChange={(e) => handleInputChange('commonMaterialFlag', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700" htmlFor="commonMaterialFlag">
              Common material flag
            </label>
          </div>

          {/* Catalog Enabled */}
          <div className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              id="catalogEnabled"
              checked={formData.catalogEnabled}
              onChange={(e) => handleInputChange('catalogEnabled', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700" htmlFor="catalogEnabled">
              Catalog Enabled
            </label>
          </div>

          {/* Division */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Division:</label>
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
          </div>
          
          {/* Batch Management */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Batch Management:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.batchManagement}
                onChange={(e) => handleInputChange('batchManagement', e.target.value)}
                className={getInputClassName('batchManagement')}
                readOnly
              />
            </div>
          </div>

          {/* Serialization Level */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Serialization Level:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.serializationLevel}
                onChange={(e) => handleInputChange('serializationLevel', e.target.value)}
                className={getInputClassName('serializationLevel')}
                readOnly
              />
            </div>
          </div>

          {/* Approved Batch Record Required Indicator */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Approved Batch Record Required:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.approvedBatchRecordRequired}
                onChange={(e) => handleInputChange('approvedBatchRecordRequired', e.target.value)}
                className={getInputClassName('approvedBatchRecordRequired')}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Submit and Clear Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button 
            type="button"
            onClick={clearForm}
            className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Clear Form
          </button>
          <button 
            type="submit" 
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save Material
          </button>
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
  // Limit to max 2 suggestions for cleaner UI
  const limitedSuggestions = suggestions.slice(0, 2)
  
  return (
    <div className="mt-1 p-2 bg-amber-50 border border-amber-200 rounded-md shadow-sm">
      <div className="flex items-center gap-2 mb-1.5">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        <p className="text-xs font-medium text-amber-700">AI Suggestions</p>
      </div>
      <div className="space-y-1">
        {limitedSuggestions.map((suggestion, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{suggestion}</span>
            <button
              type="button"
              onClick={() => onApply(suggestion)}
              className="text-xs px-2 py-1 bg-white hover:bg-amber-100 text-amber-700 border border-amber-300 rounded-md"
            >
              Apply
            </button>
          </div>
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