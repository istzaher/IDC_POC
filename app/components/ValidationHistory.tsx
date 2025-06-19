'use client'

import { useState } from 'react'
import { Search, Filter, Download, Eye, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'

interface ValidationHistoryItem {
  id: string
  materialCode: string
  description: string
  submittedBy: string
  timestamp: Date
  status: 'approved' | 'rejected' | 'pending'
  riskScore: number
  issues: string[]
  duplicatesFound: number
  aiActions: string[]
}

const mockHistory: ValidationHistoryItem[] = [
  {
    id: '1',
    materialCode: 'STL003',
    description: 'Steel Rod 8mm',
    submittedBy: 'John Doe',
    timestamp: new Date('2024-01-15T10:30:00'),
    status: 'approved',
    riskScore: 15,
    issues: [],
    duplicatesFound: 0,
    aiActions: ['Auto-suggested material type: ROD', 'Validated vendor qualification']
  },
  {
    id: '2',
    materialCode: 'CEM002',
    description: 'Portland Cement 25kg',
    submittedBy: 'Jane Smith',
    timestamp: new Date('2024-01-15T09:15:00'),
    status: 'rejected',
    riskScore: 75,
    issues: ['Potential duplicate found', 'Invalid vendor ID (100 series)'],
    duplicatesFound: 1,
    aiActions: ['Blocked duplicate entry', 'Suggested qualified vendor']
  },
  {
    id: '3',
    materialCode: 'PIP001',
    description: 'PVC Pipe 6 inch',
    submittedBy: 'Mike Johnson',
    timestamp: new Date('2024-01-15T08:45:00'),
    status: 'pending',
    riskScore: 35,
    issues: ['Vendor-manufacturer linkage warning'],
    duplicatesFound: 0,
    aiActions: ['Suggested unit of measure: M', 'Flagged linkage issue']
  },
  {
    id: '4',
    materialCode: 'STL004',
    description: '10mm Steel Rod',
    submittedBy: 'Sarah Wilson',
    timestamp: new Date('2024-01-14T16:20:00'),
    status: 'rejected',
    riskScore: 85,
    issues: ['High similarity with existing material', 'Missing required fields'],
    duplicatesFound: 2,
    aiActions: ['Detected 89% similarity', 'Prevented duplicate creation']
  },
  {
    id: '5',
    materialCode: 'ELE001',
    description: 'Electrical Cable 2.5mm',
    submittedBy: 'Tom Brown',
    timestamp: new Date('2024-01-14T14:10:00'),
    status: 'approved',
    riskScore: 22,
    issues: [],
    duplicatesFound: 0,
    aiActions: ['Auto-completed category: ELECTRICAL', 'Validated all fields']
  }
]

export function ValidationHistory() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'timestamp' | 'riskScore'>('timestamp')
  const [selectedItem, setSelectedItem] = useState<ValidationHistoryItem | null>(null)

  const filteredHistory = mockHistory
    .filter(item => {
      const matchesSearch = 
        item.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.submittedBy.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'timestamp') {
        return b.timestamp.getTime() - a.timestamp.getTime()
      } else {
        return b.riskScore - a.riskScore
      }
    })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600'
    if (score < 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Validation History</h2>
        <button className="flex items-center gap-2 sap-button">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sap-input pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="sap-input"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="pending">Pending</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'timestamp' | 'riskScore')}
            className="sap-input"
          >
            <option value="timestamp">Sort by Date</option>
            <option value="riskScore">Sort by Risk Score</option>
          </select>

          {/* Quick Stats */}
          <div className="text-sm text-gray-600">
            <p>Total: {filteredHistory.length} entries</p>
            <p>Showing results for: {statusFilter === 'all' ? 'All status' : statusFilter}</p>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">Material</th>
                <th className="text-left p-4 font-medium text-gray-700">Submitted By</th>
                <th className="text-left p-4 font-medium text-gray-700">Date</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
                <th className="text-left p-4 font-medium text-gray-700">Risk Score</th>
                <th className="text-left p-4 font-medium text-gray-700">Issues</th>
                <th className="text-left p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-gray-800">{item.materialCode}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </td>
                  <td className="p-4 text-gray-700">{item.submittedBy}</td>
                  <td className="p-4 text-gray-700">
                    {item.timestamp.toLocaleDateString()}
                    <br />
                    <span className="text-sm text-gray-500">
                      {item.timestamp.toLocaleTimeString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`font-medium ${getRiskColor(item.riskScore)}`}>
                      {item.riskScore}%
                    </span>
                  </td>
                  <td className="p-4">
                    {item.issues.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-600">{item.issues.length} issue(s)</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">No issues</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Modal */}
      {selectedItem && (
        <ValidationDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  )
}

function ValidationDetailModal({ 
  item, 
  onClose 
}: { 
  item: ValidationHistoryItem
  onClose: () => void 
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Validation Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Material Code</label>
                <p className="text-gray-900">{item.materialCode}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Submitted By</label>
                <p className="text-gray-900">{item.submittedBy}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-900">{item.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
                <p className="text-gray-900">{item.timestamp.toLocaleString()}</p>
              </div>
            </div>

            {/* Status and Risk */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="flex items-center gap-2">
                  {item.status === 'approved' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : item.status === 'rejected' ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className="capitalize font-medium">{item.status}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Score</label>
                <span className={`text-2xl font-bold ${
                  item.riskScore < 30 ? 'text-green-600' :
                  item.riskScore < 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {item.riskScore}%
                </span>
              </div>
            </div>

            {/* Issues */}
            {item.issues.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Issues Found</label>
                <div className="space-y-2">
                  {item.issues.map((issue, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <span className="text-red-800">{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Actions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">AI Actions Taken</label>
              <div className="space-y-2">
                {item.aiActions.map((action, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span className="text-blue-800">{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Duplicates */}
            {item.duplicatesFound > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Duplicates Found ({item.duplicatesFound})
                </label>
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-orange-800">
                    {item.duplicatesFound} potential duplicate(s) detected using AI similarity analysis
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <button onClick={onClose} className="sap-button">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 