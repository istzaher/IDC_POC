'use client'

import { useState } from 'react'
import { MaterialEntryForm } from './components/MaterialEntryForm'
import { DashboardStats } from './components/DashboardStats'
import { ValidationHistory } from './components/ValidationHistory'
import { AIFeatures } from './components/AIFeatures'

export default function Home() {
  const [activeTab, setActiveTab] = useState('entry')

  const tabs = [
    { id: 'entry', label: 'Material Entry', icon: '📝' },
    { id: 'dashboard', label: 'AI Dashboard', icon: '📊' },
    { id: 'history', label: 'Validation History', icon: '📋' },
    { id: 'features', label: 'AI Features', icon: '🤖' },
  ]

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'entry' && <MaterialEntryForm />}
        {activeTab === 'dashboard' && <DashboardStats />}
        {activeTab === 'history' && <ValidationHistory />}
        {activeTab === 'features' && <AIFeatures />}
      </div>
    </div>
  )
} 