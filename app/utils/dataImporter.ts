// Data Import Utility for Real Client Data

import { Material, Vendor, Manufacturer } from '../types'
import { importClientData, enableRealData } from '../data'

export interface DataImportResult {
  success: boolean
  message: string
  recordsImported: number
  errors: string[]
}

// Data Processing Functions
export class DataImporter {
  
  // Import materials from client data
  static async importMaterials(data: any[]): Promise<DataImportResult> {
    try {
      const materials: Material[] = data.map((item, index) => ({
        id: `client_${index + 1}`,
        materialCode: item.materialCode || item.code || `MAT${index + 1}`,
        description: item.description || 'Imported Material',
        materialType: item.materialType || 'MATERIAL',
        plantCode: item.plantCode || item.plant || 'P001',
        vendorId: item.vendorId || item.vendor || '200001',
        manufacturerId: item.manufacturerId || item.manufacturer || '200101',
        unitOfMeasure: item.unitOfMeasure || item.unit || 'PCS',
        category: item.category || 'GENERAL',
        basePrice: parseFloat(item.basePrice || item.price || '0'),
        createdAt: new Date(item.createdAt || Date.now()),
        status: (item.status || 'approved') as 'pending' | 'approved' | 'rejected'
      }))

      importClientData.materials(materials)
      
      return {
        success: true,
        message: 'Materials imported successfully',
        recordsImported: materials.length,
        errors: []
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to import materials',
        recordsImported: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  // Import vendors from client data
  static async importVendors(data: any[]): Promise<DataImportResult> {
    try {
      const vendors: Vendor[] = data.map(vendor => ({
        id: vendor.id || vendor.code || vendor.vendorCode,
        name: vendor.name || vendor.vendorName || 'Unknown Vendor',
        code: vendor.code || vendor.vendorCode || vendor.id,
        isQualified: vendor.isQualified !== false && (vendor.status === 'QUALIFIED' || vendor.qualified === true),
        category: Array.isArray(vendor.category) ? vendor.category : [vendor.category || 'GENERAL'],
        linkedManufacturers: Array.isArray(vendor.linkedManufacturers) ? vendor.linkedManufacturers : []
      }))

      importClientData.vendors(vendors)
      
      return {
        success: true,
        message: 'Vendors imported successfully',
        recordsImported: vendors.length,
        errors: []
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to import vendors',
        recordsImported: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  // Switch to using real data after import
  static enableClientData(): void {
    enableRealData()
    console.log('✅ Switched to real client data')
  }
} 