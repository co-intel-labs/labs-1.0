import { User, Course, Lab, LabAllocation } from '../types';
import labsData from '../data/labs.json';
import { LabStorageService } from './labStorage';

// Mock data
export const users: User[] = [
  {
    id: '1',
    name: 'John Admin',
    email: 'admin@usaii.org',
    role: 'admin',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=150',
    createdAt: '2024-01-01T00:00:00Z',
    status: 'active',
    emailVerified: true,
    lastLogin: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    name: 'Sarah Creator',
    email: 'creator@usaii.org',
    role: 'creator',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?w=150',
    createdAt: '2024-01-02T00:00:00Z',
    status: 'active',
    emailVerified: true,
    lastLogin: '2024-01-19T14:20:00Z'
  },
  {
    id: '3',
    name: 'Mike Student',
    email: 'student@usaii.org',
    role: 'student',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=150',
    createdAt: '2024-01-03T00:00:00Z',
    status: 'active',
    emailVerified: true,
    lastLogin: '2024-01-20T09:15:00Z'
  },
  {
    id: '4',
    name: 'Emma Johnson',
    email: 'emma@usaii.org',
    role: 'student',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=150',
    createdAt: '2024-01-04T00:00:00Z',
    status: 'verified',
    emailVerified: true
  },
  {
    id: '5',
    name: 'Alex Wilson',
    email: 'alex@usaii.org',
    role: 'student',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?w=150',
    createdAt: '2024-01-05T00:00:00Z',
    status: 'new',
    emailVerified: false
  },
  {
    id: '6',
    name: 'Lisa Brown',
    email: 'lisa@usaii.org',
    role: 'creator',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?w=150',
    createdAt: '2024-01-06T00:00:00Z',
    status: 'disabled',
    emailVerified: true
  }
];

export const courses: Course[] = [
  {
    id: '1',
    name: 'Machine Learning Fundamentals',
    category: 'AI/ML',
    description: 'Learn the basics of machine learning algorithms and applications',
    level: 'Beginner',
    duration: 40,
    tags: ['supervised-learning', 'unsupervised-learning', 'neural-networks']
  },
  {
    id: '2',
    name: 'Data Analysis with Python',
    category: 'Data Science',
    description: 'Master data analysis techniques using Python and popular libraries',
    level: 'Intermediate',
    duration: 35,
    tags: ['pandas', 'numpy', 'matplotlib', 'statistics']
  },
  {
    id: '3',
    name: 'Python Web Development',
    category: 'Python',
    description: 'Build web applications using Python frameworks',
    level: 'Intermediate',
    duration: 45,
    tags: ['flask', 'django', 'apis', 'databases']
  }
];

// Load labs from JSON file and maintain in-memory copy for persistence simulation
export let labs: Lab[] = [];

// Initialize labs from storage or default data
const initializeLabs = () => {
  // Always load fresh data from JSON to get new labs
  labs = [...labsData as Lab[]];
  LabStorageService.saveLabs(labs);
  console.log('🚀 Loaded fresh labs from JSON data:', labs.length);
  
  // Also load any user-created labs from storage and merge them
  const storedLabs = LabStorageService.loadLabs();
  const userCreatedLabs = storedLabs.filter(lab => 
    !labsData.find((jsonLab: any) => jsonLab.id === lab.id)
  );
  
  if (userCreatedLabs.length > 0) {
    labs = [...labs, ...userCreatedLabs];
    LabStorageService.saveLabs(labs);
    console.log('📂 Added user-created labs:', userCreatedLabs.length);
  }
};

// Initialize on module load
initializeLabs();

export const labAllocations: LabAllocation[] = [
  {
    id: '1',
    labId: '1',
    userId: '3',
    allocatedBy: '1',
    allocatedAt: new Date(Date.now() - 45 * 60 * 60 * 1000).toISOString(), // 45 hours ago (expired)
    dueDate: '2024-01-25T23:59:59Z',
    status: 'in-progress'
  },
  {
    id: '2',
    labId: '2',
    userId: '4',
    allocatedBy: '1',
    allocatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago (active)
    dueDate: '2024-01-26T23:59:59Z',
    status: 'assigned'
  },
  {
    id: '3',
    labId: '3',
    userId: '3',
    allocatedBy: '1',
    allocatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago (active)
    dueDate: '2024-01-27T23:59:59Z',
    status: 'assigned'
  },
  {
    id: '4',
    labId: '4',
    userId: '3',
    allocatedBy: '1',
    allocatedAt: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(), // 50 hours ago (would be expired but completed)
    dueDate: '2024-01-28T23:59:59Z',
    status: 'completed',
    completedAt: '2024-01-20T15:30:00Z',
    score: 95
  }
];

// Storage keys
const ALLOCATIONS_STORAGE_KEY = 'usaii-labs-allocations';

// Load allocations from localStorage
const loadAllocationsFromStorage = (): LabAllocation[] => {
  try {
    const stored = localStorage.getItem(ALLOCATIONS_STORAGE_KEY);
    if (stored) {
      const parsedAllocations = JSON.parse(stored);
      console.log('📂 Loaded allocations from localStorage:', parsedAllocations.length);
      return parsedAllocations;
    }
  } catch (error) {
    console.error('❌ Error loading allocations from storage:', error);
  }
  return [];
};

// Save allocations to localStorage
const saveAllocationsToStorage = (allocations: LabAllocation[]): void => {
  try {
    localStorage.setItem(ALLOCATIONS_STORAGE_KEY, JSON.stringify(allocations));
    console.log('💾 Saved allocations to localStorage:', allocations.length);
  } catch (error) {
    console.error('❌ Error saving allocations to storage:', error);
  }
};

// Initialize allocations from storage or use default data
const initializeAllocations = () => {
  const storedAllocations = loadAllocationsFromStorage();
  if (storedAllocations.length > 0) {
    labAllocations.length = 0; // Clear existing array
    labAllocations.push(...storedAllocations);
    console.log('📂 Loaded allocations from storage:', labAllocations.length);
  } else {
    // Save default allocations to storage
    saveAllocationsToStorage(labAllocations);
    console.log('🚀 Initialized allocations with default data:', labAllocations.length);
  }
};

// Initialize allocations on module load
initializeAllocations();

// Mock API functions
export const mockApi = {
  // Helper function to check if allocation has expired (uses lab's expirationHours or default 40)
  isAllocationExpired(allocation: LabAllocation): boolean {
    const lab = labs.find(l => l.id === allocation.labId);
    const expirationHours = lab?.expirationHours || 40; // Default to 40 hours if not set
    
    const allocationTime = new Date(allocation.allocatedAt).getTime();
    const currentTime = new Date().getTime();
    const expirationTimeInMs = expirationHours * 60 * 60 * 1000; // Convert hours to milliseconds
    
    return (currentTime - allocationTime) > expirationTimeInMs;
  },

  // Helper function to update expired allocations
  updateExpiredAllocations(): void {
    let hasChanges = false;
    
    labAllocations.forEach(allocation => {
      if (allocation.status !== 'completed' && allocation.status !== 'overdue') {
        if (this.isAllocationExpired(allocation)) {
          const lab = labs.find(l => l.id === allocation.labId);
          const expirationHours = lab?.expirationHours || 40;
          allocation.status = 'overdue';
          hasChanges = true;
          console.log(`🕐 Allocation ${allocation.id} marked as overdue after ${expirationHours} hours`);
        }
      }
    });
    
    if (hasChanges) {
      saveAllocationsToStorage(labAllocations);
      console.log('💾 Updated expired allocations saved to storage');
    }
  },

  // Authentication
  async authenticate(email: string, password: string): Promise<User | null> {
    console.log('🔐 Authentication attempt:', { email, password: '***' });
    
    // Reduced delay for production
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Find user by email
    const user = users.find(u => u.email === email);
    console.log('👤 User lookup result:', { 
      email, 
      foundUser: !!user, 
      userStatus: user?.status,
      totalUsers: users.length,
      allEmails: users.map(u => u.email)
    });
    
    if (!user) {
      console.log('❌ User not found');
      return null;
    }
    
    // Simplified login check - allow any password for demo accounts
    if (user && (user.status === 'verified' || user.status === 'active')) {
      console.log('✅ User authenticated successfully:', user.name, user.role);
      // Update last login for active users
      if (user.status === 'active') {
        user.lastLogin = new Date().toISOString();
      }
      return { ...user }; // Return a copy to avoid reference issues
    }
    
    console.log('❌ User cannot login - status:', user.status);
    return null;
  },

  // Users
  async getUsers(): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...users];
  },

  async getUserById(id: string): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return users.find(u => u.id === id) || null;
  },

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'status' | 'emailVerified'>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'new',
      emailVerified: false
    };
    users.push(newUser);
    
    // Simulate sending verification email
    console.log(`Verification email sent to ${newUser.email}`);
    
    return newUser;
  },

  async updateUserStatus(id: string, status: User['status']): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = users.find(u => u.id === id);
    if (user) {
      user.status = status;
      if (status === 'verified' || status === 'active') {
        user.emailVerified = true;
      }
    }
    return user || null;
  },

  async sendVerificationEmail(userId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const user = users.find(u => u.id === userId);
    if (user) {
      console.log(`Verification email sent to ${user.email}`);
      return true;
    }
    return false;
  },
  // Courses
  async getCourses(): Promise<Course[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...courses];
  },

  async createCourse(course: Omit<Course, 'id'>): Promise<Course> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newCourse = { ...course, id: Date.now().toString() };
    courses.push(newCourse);
    return newCourse;
  },

  // Labs
  async getLabs(): Promise<Lab[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...labs];
  },

  async getLabsByCategory(category: string): Promise<Lab[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return labs.filter(lab => lab.category === category);
  },

  async createLab(lab: Omit<Lab, 'id' | 'createdAt'>): Promise<Lab> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate unique ID
    const newLab = { 
      ...lab, 
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    // Add to in-memory array
    labs.push(newLab);
    
    // Persist to localStorage
    LabStorageService.saveLabs(labs);
    
    console.log('📝 New lab created and persisted to storage:', {
      id: newLab.id,
      title: newLab.title,
      category: newLab.category,
      codespacesUrl: newLab.codespacesUrl,
      totalLabs: labs.length
    });
    
    return newLab;
  },

  async updateLab(labId: string, updates: Partial<Lab>): Promise<Lab | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const labIndex = labs.findIndex(lab => lab.id === labId);
    if (labIndex === -1) {
      console.warn('⚠️ Lab not found for update:', labId);
      return null;
    }

    // Update the lab with new data
    const updatedLab = { ...labs[labIndex], ...updates };
    labs[labIndex] = updatedLab;
    
    // Persist to localStorage
    LabStorageService.saveLabs(labs);
    
    console.log('📝 Lab updated and persisted to JSON storage:', {
      id: updatedLab.id,
      title: updatedLab.title,
      codespacesUrl: updatedLab.codespacesUrl,
      category: updatedLab.category,
      totalLabs: labs.length
    });
    
    return updatedLab;
  },

  // Lab Allocations
  async getLabAllocations(): Promise<LabAllocation[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check and update expired allocations before returning
    this.updateExpiredAllocations();
    
    return [...labAllocations];
  },

  async getAllocationsByUser(userId: string): Promise<LabAllocation[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check and update expired allocations before returning
    this.updateExpiredAllocations();
    
    return labAllocations.filter(allocation => allocation.userId === userId);
  },

  async createLabAllocation(allocation: Omit<LabAllocation, 'id' | 'allocatedAt'>): Promise<LabAllocation> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newAllocation = { 
      ...allocation, 
      id: Date.now().toString(),
      allocatedAt: new Date().toISOString()
    };
    labAllocations.push(newAllocation);
    
    // Persist to localStorage
    saveAllocationsToStorage(labAllocations);
    console.log('📝 New allocation created and persisted:', {
      id: newAllocation.id,
      labId: newAllocation.labId,
      userId: newAllocation.userId,
      totalAllocations: labAllocations.length
    });
    
    return newAllocation;
  },

  async updateAllocationStatus(id: string, status: LabAllocation['status']): Promise<LabAllocation | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const allocation = labAllocations.find(a => a.id === id);
    if (allocation) {
      allocation.status = status;
      if (status === 'completed') {
        allocation.completedAt = new Date().toISOString();
      }
      
      // Persist changes to localStorage
      saveAllocationsToStorage(labAllocations);
      console.log('📝 Allocation status updated and persisted:', {
        id: allocation.id,
        newStatus: status,
        totalAllocations: labAllocations.length
      });
    }
    return allocation || null;
  },

  async updateLabAllocation(id: string, updates: Partial<LabAllocation>): Promise<LabAllocation | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const allocation = labAllocations.find(a => a.id === id);
    if (allocation) {
      // Update allocation properties
      Object.assign(allocation, updates);
      
      // Update completion status if needed
      if (updates.status === 'completed' && !allocation.completedAt) {
        allocation.completedAt = new Date().toISOString();
      } else if (updates.status !== 'completed') {
        delete allocation.completedAt;
      }
      
      // Persist changes to localStorage
      saveAllocationsToStorage(labAllocations);
      console.log('📝 Allocation updated and persisted:', {
        id: allocation.id,
        updates: Object.keys(updates),
        totalAllocations: labAllocations.length
      });
    }
    return allocation || null;
  }
};