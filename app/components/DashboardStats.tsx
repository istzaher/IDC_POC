'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Users, FileText } from 'lucide-react'

export function DashboardStats() {
  const [stats, setStats] = useState({
    totalEntries: 1247,
    duplicatesPrevented: 89,
    validationErrors: 156,
    riskReductionPercentage: 67,
    qualifiedVendorUsage: 94.2,
    avgRiskScore: 23.5
  })

  // Mock data for charts
  const duplicateDetectionData = [
    { month: 'Jan', duplicates: 12, prevented: 11 },
    { month: 'Feb', duplicates: 15, prevented: 14 },
    { month: 'Mar', duplicates: 8, prevented: 8 },
    { month: 'Apr', duplicates: 22, prevented: 20 },
    { month: 'May', duplicates: 18, prevented: 17 },
    { month: 'Jun', duplicates: 9, prevented: 9 }
  ]

  const validationTypeData = [
    { name: 'Field Validation', value: 45, color: '#0070f3' },
    { name: 'Duplicate Detection', value: 30, color: '#ff6b6b' },
    { name: 'Vendor Qualification', value: 15, color: '#4ecdc4' },
    { name: 'Linkage Validation', value: 10, color: '#ffe66d' }
  ]

  const riskScoreData = [
    { week: 'W1', avgRisk: 35 },
    { week: 'W2', avgRisk: 28 },
    { week: 'W3', avgRisk: 32 },
    { week: 'W4', avgRisk: 24 },
    { week: 'W5', avgRisk: 19 },
    { week: 'W6', avgRisk: 23 }
  ]

  const vendorQualificationData = [
    { type: 'Qualified (200xxx)', count: 156, percentage: 94.2 },
    { type: 'Unqualified (100xxx)', count: 9, percentage: 5.8 }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">AI Validation Dashboard</h2>
        <div className="text-sm text-gray-600">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Entries"
          value={stats.totalEntries.toLocaleString()}
          icon={<FileText className="w-6 h-6" />}
          trend={{ value: 12, isPositive: true }}
          subtitle="This month"
        />
        <MetricCard
          title="Duplicates Prevented"
          value={stats.duplicatesPrevented}
          icon={<CheckCircle className="w-6 h-6" />}
          trend={{ value: 23, isPositive: true }}
          subtitle="AI detection rate: 98.9%"
        />
        <MetricCard
          title="Validation Errors"
          value={stats.validationErrors}
          icon={<AlertTriangle className="w-6 h-6" />}
          trend={{ value: 8, isPositive: false }}
          subtitle="Caught before submission"
        />
        <MetricCard
          title="Risk Reduction"
          value={`${stats.riskReductionPercentage}%`}
          icon={<TrendingDown className="w-6 h-6" />}
          trend={{ value: 15, isPositive: true }}
          subtitle="Compared to manual process"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Duplicate Detection Trends */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Duplicate Detection Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={duplicateDetectionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="duplicates" fill="#ff6b6b" name="Duplicates Found" />
              <Bar dataKey="prevented" fill="#4ecdc4" name="Prevented" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Validation Types Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Validation Types Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={validationTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {validationTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Score Trends */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Average Risk Score Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={riskScoreData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="avgRisk" 
                stroke="#0070f3" 
                strokeWidth={3}
                dot={{ fill: '#0070f3', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              📈 Risk scores have decreased by 34% since AI implementation
            </p>
          </div>
        </div>

        {/* Vendor Qualification Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Vendor Qualification Status</h3>
          <div className="space-y-4">
            {vendorQualificationData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-800">{item.type}</h4>
                  <p className="text-sm text-gray-600">{item.count} vendors</p>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-bold ${
                    item.percentage > 90 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              🎯 AI validation ensures 94.2% qualified vendor usage
            </p>
          </div>
        </div>
      </div>

      {/* AI Performance Metrics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800">Duplicate Detection Accuracy</h4>
            <p className="text-3xl font-bold text-blue-600 mt-2">98.9%</p>
            <p className="text-sm text-blue-600 mt-1">Using fuzzy matching & NLP</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800">Field Validation Success</h4>
            <p className="text-3xl font-bold text-green-600 mt-2">96.3%</p>
            <p className="text-sm text-green-600 mt-1">Auto-suggestions applied</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-800">Processing Speed</h4>
            <p className="text-3xl font-bold text-purple-600 mt-2">0.8s</p>
            <p className="text-sm text-purple-600 mt-1">Average analysis time</p>
          </div>
        </div>
      </div>

      {/* Recent AI Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent AI Actions</h3>
        <div className="space-y-3">
          <AIActionItem
            action="Prevented duplicate entry"
            details="'Steel Rod 12mm' blocked (89% similarity with existing material)"
            timestamp="2 minutes ago"
            type="duplicate"
          />
          <AIActionItem
            action="Auto-corrected vendor ID"
            details="Changed invalid '100023' to qualified '200023'"
            timestamp="5 minutes ago"
            type="correction"
          />
          <AIActionItem
            action="Suggested material type"
            details="Recommended 'PIPE' based on description 'PVC Pipe 6 inch'"
            timestamp="8 minutes ago"
            type="suggestion"
          />
          <AIActionItem
            action="Flagged vendor-manufacturer mismatch"
            details="Vendor 200001 not linked to manufacturer 200105"
            timestamp="12 minutes ago"
            type="warning"
          />
        </div>
      </div>
    </div>
  )
}

// Helper Components
function MetricCard({ 
  title, 
  value, 
  icon, 
  trend, 
  subtitle 
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  trend: { value: number; isPositive: boolean }
  subtitle: string
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div className="text-blue-600">{icon}</div>
        <div className={`flex items-center gap-1 text-sm ${
          trend.isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {trend.value}%
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        <p className="text-sm font-medium text-gray-600 mt-1">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </div>
    </div>
  )
}

function AIActionItem({
  action,
  details,
  timestamp,
  type
}: {
  action: string
  details: string
  timestamp: string
  type: 'duplicate' | 'correction' | 'suggestion' | 'warning'
}) {
  const getIcon = () => {
    switch (type) {
      case 'duplicate':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'correction':
        return <TrendingUp className="w-5 h-5 text-blue-500" />
      case 'suggestion':
        return <Users className="w-5 h-5 text-purple-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'duplicate':
        return 'bg-green-50 border-green-200'
      case 'correction':
        return 'bg-blue-50 border-blue-200'
      case 'suggestion':
        return 'bg-purple-50 border-purple-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
    }
  }

  return (
    <div className={`p-4 rounded-lg border ${getBgColor()}`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <h4 className="font-medium text-gray-800">{action}</h4>
          <p className="text-sm text-gray-600 mt-1">{details}</p>
          <p className="text-xs text-gray-500 mt-2">{timestamp}</p>
        </div>
      </div>
    </div>
  )
} 