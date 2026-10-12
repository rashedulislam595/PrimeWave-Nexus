export type Role = 'ADMIN' | 'USER';

export type ResourceStatus = 'AVAILABLE' | 'MAINTENANCE' | 'RETIRED';

export type ReservationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  avatar?: string | null;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  name: string;
  code: string;
  description: string;
  categoryId: string;
  category?: Category;
  capacity: number;
  location: string;
  status: ResourceStatus;
  amenities: string[]; // parsed array
  imageUrl?: string | null;
  requiresApproval: boolean;
  minDurationMinutes: number;
  maxDurationMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  title: string;
  purpose?: string | null;
  userId: string;
  user?: User;
  resourceId: string;
  resource?: Resource;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  status: ReservationStatus;
  attendeesCount: number;
  adminNotes?: string | null;
  userNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId?: string | null;
  user?: User | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: string | null;
  createdAt: string;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingReservations: Reservation[];
  reason?: string;
  suggestedSlots?: {
    startTime: string;
    endTime: string;
  }[];
}

export interface AnalyticsStats {
  totalResources: number;
  activeResources: number;
  totalReservations: number;
  pendingApprovals: number;
  approvedToday: number;
  activeUsers: number;
  utilizationRate: number; // percentage (0 - 100)
  reservationsByStatus: {
    name: string;
    value: number;
    color: string;
  }[];
  reservationsByCategory: {
    category: string;
    count: number;
  }[];
  peakHours: {
    hour: string;
    bookings: number;
  }[];
  topResources: {
    id: string;
    name: string;
    code: string;
    bookingsCount: number;
    category: string;
  }[];
}
