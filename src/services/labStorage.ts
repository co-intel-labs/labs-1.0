import { Lab } from '../types';

/**
 * Lab Storage Service
 * Handles persistence of lab data using localStorage for demo purposes
 * In production, this would connect to a real database or API
 */

const LABS_STORAGE_KEY = 'usaii-labs-data';

export class LabStorageService {
  /**
   * Load labs from storage
   */
  static loadLabs(): Lab[] {
    try {
      const stored = localStorage.getItem(LABS_STORAGE_KEY);
      if (stored) {
        const parsedLabs = JSON.parse(stored);
        console.log('📂 Loaded labs from localStorage:', parsedLabs.length);
        return parsedLabs;
      }
    } catch (error) {
      console.error('❌ Error loading labs from storage:', error);
    }
    
    // Return empty array if no stored data or error
    return [];
  }

  /**
   * Save labs to storage
   */
  static saveLabs(labs: Lab[]): void {
    try {
      localStorage.setItem(LABS_STORAGE_KEY, JSON.stringify(labs));
      console.log('💾 Saved labs to JSON storage:', {
        totalLabs: labs.length,
        labsWithUrls: labs.filter(l => l.codespacesUrl).length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error saving labs to storage:', error);
    }
  }

  /**
   * Add a new lab and persist
   */
  static addLab(lab: Lab): void {
    const existingLabs = this.loadLabs();
    const updatedLabs = [...existingLabs, lab];
    this.saveLabs(updatedLabs);
  }

  /**
   * Update an existing lab
   */
  static updateLab(labId: string, updates: Partial<Lab>): Lab | null {
    const existingLabs = this.loadLabs();
    const labIndex = existingLabs.findIndex(lab => lab.id === labId);
    
    if (labIndex === -1) {
      console.warn('⚠️ Lab not found for update:', labId);
      return null;
    }

    const updatedLab = { ...existingLabs[labIndex], ...updates };
    existingLabs[labIndex] = updatedLab;
    this.saveLabs(existingLabs);
    
    console.log('📝 Lab updated in JSON storage:', {
      id: updatedLab.id,
      title: updatedLab.title,
      codespacesUrl: updatedLab.codespacesUrl,
      category: updatedLab.category,
      isActive: updatedLab.isActive
    });
    
    return updatedLab;
  }

  /**
   * Delete a lab
   */
  static deleteLab(labId: string): boolean {
    const existingLabs = this.loadLabs();
    const filteredLabs = existingLabs.filter(lab => lab.id !== labId);
    
    if (filteredLabs.length === existingLabs.length) {
      console.warn('⚠️ Lab not found for deletion:', labId);
      return false;
    }

    this.saveLabs(filteredLabs);
    return true;
  }

  /**
   * Get lab by ID
   */
  static getLabById(labId: string): Lab | null {
    const labs = this.loadLabs();
    return labs.find(lab => lab.id === labId) || null;
  }

  /**
   * Clear all stored labs (for testing/reset purposes)
   */
  static clearAllLabs(): void {
    localStorage.removeItem(LABS_STORAGE_KEY);
    console.log('🗑️ Cleared all labs from storage');
  }

  /**
   * Force refresh labs from default data
   */
  static refreshWithDefaults(defaultLabs: Lab[]): void {
    // Clear existing and load fresh data
    this.clearAllLabs();
    this.saveLabs(defaultLabs);
    console.log('🔄 Refreshed storage with latest labs:', defaultLabs.length);
  }
}