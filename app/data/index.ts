// Central Data Management System for SAP AI Validation PoC
// This file manages both mock data and real client data

import { Material, Vendor, Manufacturer } from '../types'

// Configuration to switch between mock and real data
export const DATA_CONFIG = {
  useRealData: false, // Set to true when real data is available
  dataSources: {
    materials: 'mock', // 'mock' | 'client' | 'imported'
    vendors: 'mock',
    manufacturers: 'mock',
    materialGroups: 'mock',
    plantCodes: 'mock'
  }
}

// Material Groups and Categories (to be replaced with client data)
export const MATERIAL_GROUPS = {
  mock: [
    { code: 'STL', name: 'Steel Products', category: 'Raw Materials' },
    { code: 'CEM', name: 'Cement & Concrete', category: 'Construction' },
    { code: 'PIP', name: 'Pipes & Fittings', category: 'Infrastructure' },
    { code: 'ELE', name: 'Electrical Components', category: 'Electrical' },
    { code: 'MEC', name: 'Mechanical Parts', category: 'Mechanical' },
    { code: 'CHM', name: 'Chemicals', category: 'Chemical' }
  ],
  client: [] // Will be populated with real client data
}

// Units of Measure (to be enhanced with client data)
export const UNITS_OF_MEASURE = {
  mock: [
    { code: 'MT', name: 'Metric Ton', category: 'Weight' },
    { code: 'KG', name: 'Kilogram', category: 'Weight' },
    { code: 'M', name: 'Meter', category: 'Length' },
    { code: 'M2', name: 'Square Meter', category: 'Area' },
    { code: 'M3', name: 'Cubic Meter', category: 'Volume' },
    { code: 'L', name: 'Liter', category: 'Volume' },
    { code: 'PCS', name: 'Pieces', category: 'Count' },
    { code: 'BAG', name: 'Bag', category: 'Package' },
    { code: 'FT', name: 'Feet', category: 'Length' },
    { code: 'SET', name: 'Set', category: 'Assembly' }
  ],
  client: []
}

// Plant Codes (to be replaced with client data)
export const PLANT_CODES = {
  mock: [
    { code: 'P001', name: 'Plant 001 - Mumbai', location: 'Mumbai, India', type: 'Manufacturing' },
    { code: 'P002', name: 'Plant 002 - Delhi', location: 'Delhi, India', type: 'Assembly' },
    { code: 'P003', name: 'Plant 003 - Bangalore', location: 'Bangalore, India', type: 'R&D' },
    { code: 'P004', name: 'Plant 004 - Chennai', location: 'Chennai, India', type: 'Manufacturing' },
    { code: 'P005', name: 'Plant 005 - Pune', location: 'Pune, India', type: 'Distribution' }
  ],
  client: []
}

// Vendor Categories (to be enhanced with client data)
export const VENDOR_CATEGORIES = {
  mock: [
    'Steel & Metal Suppliers',
    'Construction Materials',
    'Electrical Equipment',
    'Mechanical Components',
    'Chemical Suppliers',
    'Spare Parts',
    'Tools & Equipment',
    'Safety Equipment',
    'IT & Electronics',
    'Services'
  ],
  client: []
}

// Mock Materials Data (current PoC data)
export const MOCK_MATERIALS: Material[] = [
  {
    id: '1',
    materialCode: 'STL001',
    description: 'Steel Rod 10mm',
    materialType: 'ROD',
    plantCode: 'P001',
    vendorId: '200001',
    manufacturerId: '200101',
    unitOfMeasure: 'MT',
    category: 'STEEL',
    basePrice: 150.00,
    createdAt: new Date('2023-01-15'),
    status: 'approved'
  },
  {
    id: '2',
    materialCode: 'STL002',
    description: '10mm Steel Rod',
    materialType: 'ROD',
    plantCode: 'P002',
    vendorId: '200002',
    manufacturerId: '200101',
    unitOfMeasure: 'MT',
    category: 'STEEL',
    basePrice: 148.00,
    createdAt: new Date('2023-02-20'),
    status: 'approved'
  },
  {
    id: '3',
    materialCode: 'CEM001',
    description: 'Portland Cement 50kg',
    materialType: 'CEMENT',
    plantCode: 'P001',
    vendorId: '200003',
    manufacturerId: '200102',
    unitOfMeasure: 'BAG',
    category: 'CEMENT',
    basePrice: 25.00,
    createdAt: new Date('2023-03-10'),
    status: 'approved'
  },
  {
    id: '4',
    materialCode: 'PIP001',
    description: 'PVC Pipe 6 inch',
    materialType: 'PIPE',
    plantCode: 'P003',
    vendorId: '200004',
    manufacturerId: '200103',
    unitOfMeasure: 'M',
    category: 'PLUMBING',
    basePrice: 45.00,
    createdAt: new Date('2023-04-05'),
    status: 'approved'
  },
  {
    id: '5',
    materialCode: 'ELE001',
    description: 'Electrical Cable 2.5mm',
    materialType: 'CABLE',
    plantCode: 'P002',
    vendorId: '200005',
    manufacturerId: '200104',
    unitOfMeasure: 'M',
    category: 'ELECTRICAL',
    basePrice: 22.00,
    createdAt: new Date('2023-05-12'),
    status: 'approved'
  }
]

// Mock Vendors Data
export const MOCK_VENDORS: Vendor[] = [
  {
    id: '200001',
    name: 'Premium Steel Suppliers',
    code: '200001',
    isQualified: true,
    category: ['STEEL', 'METAL'],
    linkedManufacturers: ['200101']
  },
  {
    id: '200002',
    name: 'Global Steel Trading',
    code: '200002',
    isQualified: true,
    category: ['STEEL', 'CONSTRUCTION'],
    linkedManufacturers: ['200101', '200103']
  },
  {
    id: '200003',
    name: 'Cement Solutions Ltd',
    code: '200003',
    isQualified: true,
    category: ['CEMENT', 'CONSTRUCTION'],
    linkedManufacturers: ['200102']
  },
  {
    id: '200004',
    name: 'PVC Systems India',
    code: '200004',
    isQualified: true,
    category: ['PLUMBING', 'PIPES'],
    linkedManufacturers: ['200103']
  },
  {
    id: '200005',
    name: 'Electrical Components Co',
    code: '200005',
    isQualified: true,
    category: ['ELECTRICAL', 'CABLES'],
    linkedManufacturers: ['200104']
  },
  {
    id: '100001',
    name: 'Old Steel Company',
    code: '100001',
    isQualified: false,
    category: ['STEEL'],
    linkedManufacturers: ['100101']
  }
]

// Mock Manufacturers Data
export const MOCK_MANUFACTURERS: Manufacturer[] = [
  {
    id: '200101',
    name: 'Steel Works International',
    code: '200101',
    linkedVendors: ['200001', '200002'],
    certifications: ['ISO9001', 'ISO14001']
  },
  {
    id: '200102',
    name: 'Cement Solutions Ltd',
    code: '200102',
    linkedVendors: ['200003'],
    certifications: ['ISO9001']
  },
  {
    id: '200103',
    name: 'Pipe Manufacturing Corp',
    code: '200103',
    linkedVendors: ['200002', '200004'],
    certifications: ['ISO9001', 'BIS']
  },
  {
    id: '200104',
    name: 'Electrical Systems Ltd',
    code: '200104',
    linkedVendors: ['200005'],
    certifications: ['ISO9001', 'CE', 'UL']
  }
]

// Client Data Placeholders (to be populated when real data arrives)
export const CLIENT_MATERIALS: Material[] = []
export const CLIENT_VENDORS: Vendor[] = []
export const CLIENT_MANUFACTURERS: Manufacturer[] = []

// Data Access Functions
export const getMaterials = (): Material[] => {
  return DATA_CONFIG.useRealData && CLIENT_MATERIALS.length > 0 
    ? CLIENT_MATERIALS 
    : MOCK_MATERIALS
}

export const getVendors = (): Vendor[] => {
  return DATA_CONFIG.useRealData && CLIENT_VENDORS.length > 0 
    ? CLIENT_VENDORS 
    : MOCK_VENDORS
}

export const getManufacturers = (): Manufacturer[] => {
  return DATA_CONFIG.useRealData && CLIENT_MANUFACTURERS.length > 0 
    ? CLIENT_MANUFACTURERS 
    : MOCK_MANUFACTURERS
}

export const getMaterialGroups = () => {
  return DATA_CONFIG.useRealData && MATERIAL_GROUPS.client.length > 0
    ? MATERIAL_GROUPS.client
    : MATERIAL_GROUPS.mock
}

export const getUnitsOfMeasure = () => {
  return DATA_CONFIG.useRealData && UNITS_OF_MEASURE.client.length > 0
    ? UNITS_OF_MEASURE.client
    : UNITS_OF_MEASURE.mock
}

export const getPlantCodes = () => {
  return DATA_CONFIG.useRealData && PLANT_CODES.client.length > 0
    ? PLANT_CODES.client
    : PLANT_CODES.mock
}

// Data Import Functions (for when client data arrives)
export const importClientData = {
  materials: (data: Material[]) => {
    CLIENT_MATERIALS.splice(0, CLIENT_MATERIALS.length, ...data)
    console.log(`Imported ${data.length} client materials`)
  },
  
  vendors: (data: Vendor[]) => {
    CLIENT_VENDORS.splice(0, CLIENT_VENDORS.length, ...data)
    console.log(`Imported ${data.length} client vendors`)
  },
  
  manufacturers: (data: Manufacturer[]) => {
    CLIENT_MANUFACTURERS.splice(0, CLIENT_MANUFACTURERS.length, ...data)
    console.log(`Imported ${data.length} client manufacturers`)
  },
  
  materialGroups: (data: any[]) => {
    MATERIAL_GROUPS.client.splice(0, MATERIAL_GROUPS.client.length, ...data)
    console.log(`Imported ${data.length} client material groups`)
  },
  
  unitsOfMeasure: (data: any[]) => {
    UNITS_OF_MEASURE.client.splice(0, UNITS_OF_MEASURE.client.length, ...data)
    console.log(`Imported ${data.length} client units of measure`)
  },
  
  plantCodes: (data: any[]) => {
    PLANT_CODES.client.splice(0, PLANT_CODES.client.length, ...data)
    console.log(`Imported ${data.length} client plant codes`)
  }
}

// Switch to real data
export const enableRealData = () => {
  DATA_CONFIG.useRealData = true
  console.log('Switched to real client data')
}

// Switch back to mock data
export const enableMockData = () => {
  DATA_CONFIG.useRealData = false
  console.log('Switched to mock data')
} 