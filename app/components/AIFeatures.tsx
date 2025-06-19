'use client'

import { useState } from 'react'
import { Bot, Search, Shield, Link, Lightbulb, Zap, CheckCircle, AlertTriangle, TrendingUp, Database } from 'lucide-react'

interface AIFeature {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  benefits: string[]
  technologies: string[]
  accuracy: number
  implementation: string
  example: string
}

const aiFeatures: AIFeature[] = [
  {
    id: 'duplicate-detection',
    title: 'Similarity-based Duplicate Detection',
    description: 'Advanced NLP models using BERT embeddings and cosine similarity to identify almost identical entries, even with different wording or formats.',
    icon: <Search className="w-8 h-8" />,
    benefits: [
      'Prevents data redundancy and storage costs',
      'Maintains data integrity across the system',
      'Reduces manual cleanup efforts',
      'Improves search and reporting accuracy'
    ],
    technologies: ['BERT Embeddings', 'Cosine Similarity', 'Fuzzy String Matching', 'Graph-based Entity Resolution'],
    accuracy: 98.9,
    implementation: 'Real-time analysis during data entry with immediate feedback',
    example: 'Detects "Steel Rod 10mm" and "10mm Steel Rod" as 89% similar'
  },
  {
    id: 'field-validation',
    title: 'AI-Powered Field Auto-Suggestion',
    description: 'Intelligent field validation and auto-completion using contextual analysis and predictive models trained on historical data.',
    icon: <Lightbulb className="w-8 h-8" />,
    benefits: [
      'Reduces manual data entry errors',
      'Speeds up form completion process',
      'Ensures consistent data formatting',
      'Learns from user corrections over time'
    ],
    technologies: ['GPT-based Models', 'Classification Algorithms', 'Rule-based Engines', 'Machine Learning'],
    accuracy: 96.3,
    implementation: 'Context-aware suggestions appearing as users type',
    example: 'Suggests "ROD" as material type when description contains "steel rod"'
  },
  {
    id: 'vendor-linkage',
    title: 'Knowledge Graph for Vendor-Manufacturer Relationships',
    description: 'Comprehensive relationship mapping using knowledge graphs to validate and suggest vendor-manufacturer linkages.',
    icon: <Link className="w-8 h-8" />,
    benefits: [
      'Ensures valid business relationships',
      'Prevents incorrect vendor assignments',
      'Maintains compliance requirements',
      'Suggests optimal vendor-manufacturer pairs'
    ],
    technologies: ['Knowledge Graphs', 'Entity Linking', 'Graph Embeddings', 'Relationship Mining'],
    accuracy: 94.7,
    implementation: 'Automatic validation with real-time relationship checking',
    example: 'Validates that Vendor 200001 is properly linked to Manufacturer 200101'
  },
  {
    id: 'vendor-qualification',
    title: 'Prequalified Vendor Enforcement',
    description: 'Automated filtering and validation to ensure only qualified vendors (200xxx series) are used, with intelligent suggestions for replacements.',
    icon: <Shield className="w-8 h-8" />,
    benefits: [
      'Enforces business compliance rules',
      'Prevents use of unqualified vendors',
      'Suggests qualified alternatives',
      'Maintains audit trail for decisions'
    ],
    technologies: ['Pattern Matching', 'Regex Validation', 'Auto-correction Algorithms', 'Approval Workflows'],
    accuracy: 100,
    implementation: 'Real-time validation with immediate blocking of invalid entries',
    example: 'Blocks vendor "100023" and suggests qualified vendor "200023"'
  }
]

export function AIFeatures() {
  const [selectedFeature, setSelectedFeature] = useState<AIFeature | null>(null)
  const [activeDemo, setActiveDemo] = useState<string | null>(null)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">AI-Powered Validation Solutions</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Comprehensive AI technologies designed to eliminate SAP data entry issues through intelligent automation, 
          real-time validation, and predictive assistance.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {aiFeatures.map((feature) => (
          <div
            key={feature.id}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedFeature(feature)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-blue-600">{feature.icon}</div>
              <h3 className="font-semibold text-gray-800 text-sm">{feature.title}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Accuracy</span>
              <span className="text-lg font-bold text-green-600">{feature.accuracy}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Technology Stack Overview */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <Bot className="w-8 h-8 text-blue-600" />
          Technology Stack & Architecture
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Core AI Technologies</h4>
            <div className="space-y-3">
              <TechItem
                name="Natural Language Processing (NLP)"
                description="BERT embeddings for semantic understanding and text similarity"
                icon="🧠"
              />
              <TechItem
                name="Machine Learning Models"
                description="Predictive models for field auto-completion and validation"
                icon="🤖"
              />
              <TechItem
                name="Knowledge Graphs"
                description="Relationship mapping for vendor-manufacturer linkages"
                icon="🕸️"
              />
              <TechItem
                name="Fuzzy Matching"
                description="Advanced string matching for duplicate detection"
                icon="🔍"
              />
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Integration & Performance</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Processing Speed</span>
                <span className="text-lg font-bold text-blue-600">&lt; 1 second</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">API Response Time</span>
                <span className="text-lg font-bold text-green-600">~300ms</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium">Concurrent Users</span>
                <span className="text-lg font-bold text-purple-600">1000+</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium">Data Points Analyzed</span>
                <span className="text-lg font-bold text-orange-600">50M+</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Demo Section */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <Zap className="w-8 h-8 text-blue-600" />
          Interactive AI Demonstrations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DemoCard
            title="Duplicate Detection Demo"
            description="See how AI detects similar materials in real-time"
            isActive={activeDemo === 'duplicate'}
            onClick={() => setActiveDemo(activeDemo === 'duplicate' ? null : 'duplicate')}
          >
            {activeDemo === 'duplicate' && <DuplicateDetectionDemo />}
          </DemoCard>
          
          <DemoCard
            title="Field Suggestion Demo"
            description="Experience intelligent auto-completion in action"
            isActive={activeDemo === 'suggestion'}
            onClick={() => setActiveDemo(activeDemo === 'suggestion' ? null : 'suggestion')}
          >
            {activeDemo === 'suggestion' && <FieldSuggestionDemo />}
          </DemoCard>
        </div>
      </div>

      {/* ROI & Benefits */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          Return on Investment & Benefits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <h4 className="text-3xl font-bold text-green-600 mb-2">67%</h4>
            <p className="text-green-800 font-medium">Data Entry Error Reduction</p>
            <p className="text-sm text-green-600 mt-2">Fewer manual corrections needed</p>
          </div>
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <h4 className="text-3xl font-bold text-blue-600 mb-2">45%</h4>
            <p className="text-blue-800 font-medium">Processing Time Reduction</p>
            <p className="text-sm text-blue-600 mt-2">Faster material creation process</p>
          </div>
          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <h4 className="text-3xl font-bold text-purple-600 mb-2">$2.3M</h4>
            <p className="text-purple-800 font-medium">Annual Cost Savings</p>
            <p className="text-sm text-purple-600 mt-2">Reduced manual effort & errors</p>
          </div>
        </div>
      </div>

      {/* Implementation Timeline */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-600" />
          Implementation Roadmap
        </h3>
        <div className="space-y-6">
          <TimelineItem
            phase="Phase 1"
            title="Foundation Setup"
            duration="2-3 weeks"
            description="Data preparation, model training, and basic duplicate detection"
            status="completed"
          />
          <TimelineItem
            phase="Phase 2"
            title="Core AI Features"
            duration="3-4 weeks"
            description="Field validation, vendor qualification, and knowledge graph implementation"
            status="in-progress"
          />
          <TimelineItem
            phase="Phase 3"
            title="Advanced Integration"
            duration="2-3 weeks"
            description="SAP integration, real-time processing, and performance optimization"
            status="planned"
          />
          <TimelineItem
            phase="Phase 4"
            title="Enhancement & Learning"
            duration="Ongoing"
            description="Continuous learning, model improvement, and feature expansion"
            status="planned"
          />
        </div>
      </div>

      {/* Detailed Feature Modal */}
      {selectedFeature && (
        <FeatureDetailModal
          feature={selectedFeature}
          onClose={() => setSelectedFeature(null)}
        />
      )}
    </div>
  )
}

// Helper Components
function TechItem({ name, description, icon }: { name: string; description: string; icon: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <span className="text-2xl">{icon}</span>
      <div>
        <h5 className="font-medium text-gray-800">{name}</h5>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  )
}

function DemoCard({ 
  title, 
  description, 
  isActive, 
  onClick, 
  children 
}: { 
  title: string
  description: string
  isActive: boolean
  onClick: () => void
  children?: React.ReactNode
}) {
  return (
    <div className={`border rounded-lg p-4 transition-all ${isActive ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
      <div className="cursor-pointer" onClick={onClick}>
        <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        <button className="text-blue-600 text-sm font-medium">
          {isActive ? 'Hide Demo' : 'Show Demo'}
        </button>
      </div>
      {children}
    </div>
  )
}

function DuplicateDetectionDemo() {
  return (
    <div className="mt-4 p-4 bg-white border rounded">
      <h5 className="font-medium mb-3">Try entering a material description:</h5>
      <input
        type="text"
        placeholder="Steel Rod 10mm"
        className="sap-input mb-3"
      />
      <div className="bg-orange-50 border border-orange-200 rounded p-3">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-800">Potential Duplicate Found</span>
        </div>
        <p className="text-xs text-orange-700">89% similarity with "10mm Steel Rod" (STL002)</p>
      </div>
    </div>
  )
}

function FieldSuggestionDemo() {
  return (
    <div className="mt-4 p-4 bg-white border rounded">
      <h5 className="font-medium mb-3">Material Type suggestion:</h5>
      <input
        type="text"
        placeholder="Type 'pipe'..."
        className="sap-input mb-3"
      />
      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">AI Suggestions</span>
        </div>
        <div className="space-y-1">
          <button className="block text-xs text-blue-700 hover:text-blue-900">PIPE</button>
          <button className="block text-xs text-blue-700 hover:text-blue-900">TUBE</button>
        </div>
      </div>
    </div>
  )
}

function TimelineItem({ 
  phase, 
  title, 
  duration, 
  description, 
  status 
}: { 
  phase: string
  title: string
  duration: string
  description: string
  status: 'completed' | 'in-progress' | 'planned'
}) {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'in-progress':
        return <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      case 'planned':
        return <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'in-progress':
        return 'text-blue-600'
      case 'planned':
        return 'text-gray-600'
    }
  }

  return (
    <div className="flex items-start gap-4">
      {getStatusIcon()}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h4 className="font-semibold text-gray-800">{phase}: {title}</h4>
          <span className={`text-sm ${getStatusColor()}`}>({duration})</span>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  )
}

function FeatureDetailModal({ 
  feature, 
  onClose 
}: { 
  feature: AIFeature
  onClose: () => void 
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="text-blue-600">{feature.icon}</div>
              <h3 className="text-2xl font-bold text-gray-800">{feature.title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Description</h4>
              <p className="text-gray-600 mb-6">{feature.description}</p>

              <h4 className="text-lg font-semibold text-gray-700 mb-4">Key Benefits</h4>
              <ul className="space-y-2 mb-6">
                {feature.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">{benefit}</span>
                  </li>
                ))}
              </ul>

              <h4 className="text-lg font-semibold text-gray-700 mb-4">Technologies Used</h4>
              <div className="flex flex-wrap gap-2">
                {feature.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Performance Metrics</h4>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{feature.accuracy}%</div>
                  <div className="text-sm text-gray-600">Accuracy Rate</div>
                </div>
              </div>

              <h4 className="text-lg font-semibold text-gray-700 mb-4">Implementation</h4>
              <p className="text-gray-600 mb-6">{feature.implementation}</p>

              <h4 className="text-lg font-semibold text-gray-700 mb-4">Example</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">{feature.example}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button onClick={onClose} className="sap-button">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 