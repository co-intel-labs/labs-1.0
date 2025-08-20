export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'creator' | 'student';
  avatar?: string;
  createdAt: string;
  status: 'new' | 'verified' | 'active' | 'disabled';
  emailVerified: boolean;
  lastLogin?: string;
}

export interface Course {
  id: string;
  name: string;
  category: 'AI/ML' | 'Data Science' | 'Python' | 'Web Development' | 'DevOps';
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number; // in hours
  tags: string[];
}

export interface Lab {
  id: string;
  title: string;
  description: string;
  courseId: string;
  creatorId: string;
  category: 'AI/ML' | 'Data Science' | 'Python' | 'Web Development' | 'DevOps';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  type: 'course' | 'certification' | 'project';
  duration: number; // in minutes
  instructions: string;
  resources: string[];
  tags: string[];
  createdAt: string;
  isActive: boolean;
  codespacesUrl?: string;
  expirationHours?: number; // Hours after allocation when lab expires (default: 40)
  prerequisites?: string[]; // Required skills or completed labs
  certificationCriteria?: {
    passingScore: number;
    maxAttempts: number;
    timeLimit?: number; // minutes
  };
  projectDeliverables?: string[]; // Expected outputs for projects
  estimatedEffort?: string; // e.g., "2-3 weeks", "40 hours"
}

export interface LabAllocation {
  id: string;
  labId: string;
  userId: string;
  allocatedBy: string;
  allocatedAt: string;
  dueDate: string;
  status: 'assigned' | 'in-progress' | 'completed' | 'overdue';
  completedAt?: string;
  score?: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}