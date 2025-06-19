'use client'

import { useState } from 'react'
import { DataImporter, DataImportResult } from '../utils/dataImporter'
import { DATA_CONFIG, enableRealData, enableMockData } from '../data'
import { Upload, Database, ToggleLeft, ToggleRight, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

export function AdminPanel() {
  const [isDataImportOpen, setIsDataImportOpen] = useState(false)
  const [importResults, setImportResults] = useState<DataImportResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, dataType: string) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    
    try {
      const text = await file.text()
      let data: any[] = []

      // Parse different file types
      if (file.name.endsWith('.json')) {
        data = JSON.parse(text)
      } else if (file.name.endsWith('.csv')) {
        // Simple CSV parsing (for demo)
        const lines = text.split('\n')
        const headers = lines[0].split(',').map(h => h.trim())
        data = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',').map(v => v.trim())
          const obj: any = {}
          headers.forEach((header, index) => {
            obj[header] = values[index] || ''
          })
          return obj
        })
      }

      // Import the data
      let result: DataImportResult
      
      switch (dataType) {
        case 'materials':
          result = await DataImporter.importMaterials(data)
          break
        case 'vendors':
          result = await DataImporter.importVendors(data)
          break
        default:
          result = {
            success: false,
            message: 'Unknown data type',
            recordsImported: 0,
            errors: ['Unknown data type']
          }
      }

      setImportResults(prev => [result, ...prev])
      
      if (result.success) {
        toast.success(`${result.message}: ${result.recordsImported} records`)
      } else {
        toast.error(result.message)
      }

    } catch (error) {
      const errorResult: DataImportResult = {
        success: false,
        message: 'Failed to process file',
        recordsImported: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
      setImportResults(prev => [errorResult, ...prev])
      toast.error('Failed to process file')
    } finally {
      setIsProcessing(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const toggleDataSource = () => {
    if (DATA_CONFIG.useRealData) {
      enableMockData()
      toast.success('Switched to Mock Data')
    } else {
      enableRealData()
      toast.success('Switched to Real Client Data')
    }
    // Force refresh by updating state
    setImportResults([...importResults])
  }

  const enableClientData = () => {
    DataImporter.enableClientData()
    toast.success('Client data enabled!')
    setImportResults([...importResults])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Data Source:</span>
            <button
              onClick={toggleDataSource}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                DATA_CONFIG.useRealData
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {DATA_CONFIG.useRealData ? (
                <>
                  <ToggleRight className="w-4 h-4" />
                  Real Data
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4" />
                  Mock Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Data Import Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Client Data Import
          </h3>
          <button
            onClick={() => setIsDataImportOpen(!isDataImportOpen)}
            className="sap-button text-sm"
          >
            {isDataImportOpen ? 'Hide Import' : 'Show Import'}
          </button>
        </div>

        {isDataImportOpen && (
          <div className="space-y-6">
            {/* Import Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">📋 Import Instructions</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Materials:</strong> Upload CSV/JSON with columns: materialCode, description, category, etc.</li>
                <li>• <strong>Vendors:</strong> Upload CSV/JSON with columns: vendorCode, vendorName, status, categories</li>
                <li>• <strong>Supported formats:</strong> .csv, .json</li>
                <li>• <strong>After import:</strong> Click "Enable Client Data" to switch to real data</li>
              </ul>
            </div>

            {/* Upload Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Materials Upload */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">📦 Materials Data</h4>
                <div className="space-y-3">
                  <label className="block">
                    <span className="text-sm text-gray-600">Upload Materials (CSV/JSON)</span>
                    <input
                      type="file"
                      accept=".csv,.json"
                      onChange={(e) => handleFileUpload(e, 'materials')}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      disabled={isProcessing}
                    />
                  </label>
                  <p className="text-xs text-gray-500">Expected: materialCode, description, category, plantCode, vendorId</p>
                </div>
              </div>

              {/* Vendors Upload */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">🏢 Vendors Data</h4>
                <div className="space-y-3">
                  <label className="block">
                    <span className="text-sm text-gray-600">Upload Vendors (CSV/JSON)</span>
                    <input
                      type="file"
                      accept=".csv,.json"
                      onChange={(e) => handleFileUpload(e, 'vendors')}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      disabled={isProcessing}
                    />
                  </label>
                  <p className="text-xs text-gray-500">Expected: vendorCode, vendorName, status, categories</p>
                </div>
              </div>
            </div>

            {/* Enable Client Data Button */}
            <div className="text-center">
              <button
                onClick={enableClientData}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                disabled={isProcessing}
              >
                🚀 Enable Client Data
              </button>
              <p className="text-sm text-gray-600 mt-2">
                Click after importing to switch the application to use real client data
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Import Results */}
      {importResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Import Results</h3>
          <div className="space-y-3">
            {importResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.message}
                    </p>
                    {result.success && (
                      <p className="text-sm text-green-600 mt-1">
                        {result.recordsImported} records imported successfully
                      </p>
                    )}
                    {result.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-red-700">Errors:</p>
                        <ul className="text-sm text-red-600 mt-1 list-disc list-inside">
                          {result.errors.map((error, i) => (
                            <li key={i}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Data Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Data Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700">Data Source</h4>
            <p className={`text-lg font-bold mt-1 ${
              DATA_CONFIG.useRealData ? 'text-green-600' : 'text-blue-600'
            }`}>
              {DATA_CONFIG.useRealData ? 'Real Client Data' : 'Mock Data'}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700">Import Status</h4>
            <p className={`text-lg font-bold mt-1 ${
              isProcessing ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {isProcessing ? 'Processing...' : 'Ready'}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700">Total Imports</h4>
            <p className="text-lg font-bold text-purple-600 mt-1">
              {importResults.filter(r => r.success).length}
            </p>
          </div>
        </div>
      </div>

      {/* Ready for Client Data Notice */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-800">Ready for Client Data</h4>
            <p className="text-blue-700 mt-1">
              The system is prepared to accept and process real client data. When you receive:
            </p>
            <ul className="text-sm text-blue-600 mt-2 space-y-1">
              <li>• <strong>CR requests information</strong> - Upload as materials data</li>
              <li>• <strong>Commercial directory with qualification data</strong> - Upload as vendors data</li>
              <li>• <strong>Material Groups, categories and Units data</strong> - Contact admin for integration</li>
              <li>• <strong>Spare Data, datasheets and drawings</strong> - Upload as materials data</li>
              <li>• <strong>Process flow diagrams</strong> - Can be added as documentation</li>
            </ul>
            <p className="text-sm text-blue-600 mt-3">
              💡 The AI validation will automatically adapt to the real data structure and provide more accurate suggestions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 