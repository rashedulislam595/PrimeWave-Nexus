import fs from 'fs';
import path from 'path';
import {
  Category,
  Resource,
  User,
  Reservation,
  ActivityLog,
  AnalyticsStats,
  ReservationStatus,
  ResourceStatus,
  Role,
} from '@/types';
import {
  INITIAL_CATEGORIES,
  INITIAL_USERS,
  INITIAL_RESOURCES,
  INITIAL_RESERVATIONS,
  INITIAL_ACTIVITY_LOGS,
} from './mock-data';

interface DatabaseSchema {
  categories: Category[];
  resources: Resource[];
  users: User[];
  reservations: Reservation[];
  activityLogs: ActivityLog[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// In-memory cache for speed, synced to disk
let memoryStore: DatabaseSchema | null = null;

function ensureDataFile(): DatabaseSchema {
  if (memoryStore) {
    return memoryStore;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      memoryStore = JSON.parse(content);
      return memoryStore!;
    }
  } catch (err) {
    console.error('Failed to read database file, initializing with defaults:', err);
  }

  // Initialize fresh database with seed data
  const initialData: DatabaseSchema = {
    categories: INITIAL_CATEGORIES,
    resources: INITIAL_RESOURCES,
    users: INITIAL_USERS,
    reservations: INITIAL_RESERVATIONS,
    activityLogs: INITIAL_ACTIVITY_LOGS,
  };

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write initial database file:', err);
  }

  memoryStore = initialData;
  return memoryStore;
}

function persistData(data: DatabaseSchema) {
  memoryStore = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist database file:', err);
  }
}

/* =========================================================================
   CATEGORY METHODS
   ========================================================================= */

export async function getCategories(): Promise<Category[]> {
  const db = ensureDataFile();
  return db.categories;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const db = ensureDataFile();
  return db.categories.find((c) => c.id === id) || null;
}

/* =========================================================================
   RESOURCE METHODS
   ========================================================================= */

export async function getResources(filter?: {
  categoryId?: string;
  status?: ResourceStatus;
  search?: string;
}): Promise<Resource[]> {
  const db = ensureDataFile();
  let items = db.resources.map((r) => ({
    ...r,
    category: db.categories.find((c) => c.id === r.categoryId),
  }));

  if (filter?.categoryId) {
    items = items.filter((r) => r.categoryId === filter.categoryId);
  }

  if (filter?.status) {
    items = items.filter((r) => r.status === filter.status);
  }

  if (filter?.search) {
    const q = filter.search.toLowerCase();
    items = items.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }

  return items;
}

export async function getResourceById(id: string): Promise<Resource | null> {
  const db = ensureDataFile();
  const res = db.resources.find((r) => r.id === id);
  if (!res) return null;
  return {
    ...res,
    category: db.categories.find((c) => c.id === res.categoryId),
  };
}

export async function createResource(data: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Promise<Resource> {
  const db = ensureDataFile();
  const newResource: Resource = {
    ...data,
    id: `res-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.resources.unshift(newResource);
  persistData(db);

  await addActivityLog({
    action: 'CREATED_RESOURCE',
    entityType: 'Resource',
    entityId: newResource.id,
    details: `Created new resource: ${newResource.name} (${newResource.code})`,
  });

  return newResource;
}

export async function updateResource(id: string, data: Partial<Resource>): Promise<Resource | null> {
  const db = ensureDataFile();
  const index = db.resources.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const updated: Resource = {
    ...db.resources[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  db.resources[index] = updated;
  persistData(db);

  await addActivityLog({
    action: 'UPDATED_RESOURCE',
    entityType: 'Resource',
    entityId: id,
    details: `Updated resource details for: ${updated.name}`,
  });

  return updated;
}

export async function deleteResource(id: string): Promise<boolean> {
  const db = ensureDataFile();
  const index = db.resources.findIndex((r) => r.id === id);
  if (index === -1) return false;

  const [removed] = db.resources.splice(index, 1);
  // Also clean up any associated reservations
  db.reservations = db.reservations.filter((res) => res.resourceId !== id);
  persistData(db);

  await addActivityLog({
    action: 'DELETED_RESOURCE',
    entityType: 'Resource',
    entityId: id,
    details: `Deleted resource: ${removed.name}`,
  });

  return true;
}

/* =========================================================================
   USER METHODS
   ========================================================================= */

export async function getUsers(): Promise<User[]> {
  const db = ensureDataFile();
  return db.users;
}

export async function getUserById(id: string): Promise<User | null> {
  const db = ensureDataFile();
  return db.users.find((u) => u.id === id) || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = ensureDataFile();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

/* =========================================================================
   RESERVATION METHODS
   ========================================================================= */

export async function getReservations(filter?: {
  userId?: string;
  resourceId?: string;
  status?: ReservationStatus;
  startDate?: string;
  endDate?: string;
}): Promise<Reservation[]> {
  const db = ensureDataFile();
  let items = db.reservations.map((res) => ({
    ...res,
    user: db.users.find((u) => u.id === res.userId),
    resource: db.resources.find((r) => r.id === res.resourceId),
  }));

  if (filter?.userId) {
    items = items.filter((r) => r.userId === filter.userId);
  }

  if (filter?.resourceId) {
    items = items.filter((r) => r.resourceId === filter.resourceId);
  }

  if (filter?.status) {
    items = items.filter((r) => r.status === filter.status);
  }

  if (filter?.startDate) {
    const s = new Date(filter.startDate).getTime();
    items = items.filter((r) => new Date(r.endTime).getTime() >= s);
  }

  if (filter?.endDate) {
    const e = new Date(filter.endDate).getTime();
    items = items.filter((r) => new Date(r.startTime).getTime() <= e);
  }

  // Sort by start time descending
  return items.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
}

export async function getReservationById(id: string): Promise<Reservation | null> {
  const db = ensureDataFile();
  const res = db.reservations.find((r) => r.id === id);
  if (!res) return null;
  return {
    ...res,
    user: db.users.find((u) => u.id === res.userId),
    resource: db.resources.find((r) => r.id === res.resourceId),
  };
}

export async function createReservation(data: {
  title: string;
  purpose?: string | null;
  userId: string;
  resourceId: string;
  startTime: string;
  endTime: string;
  attendeesCount?: number;
  userNotes?: string | null;
  status?: ReservationStatus;
}): Promise<Reservation> {
  const db = ensureDataFile();
  const resource = db.resources.find((r) => r.id === data.resourceId);
  const user = db.users.find((u) => u.id === data.userId);

  // Auto-approve if resource doesn't require approval, else set to PENDING
  const initialStatus: ReservationStatus =
    data.status || (resource?.requiresApproval ? 'PENDING' : 'APPROVED');

  const newReservation: Reservation = {
    id: `resv-${Date.now().toString(36)}`,
    title: data.title,
    purpose: data.purpose || null,
    userId: data.userId,
    resourceId: data.resourceId,
    startTime: data.startTime,
    endTime: data.endTime,
    status: initialStatus,
    attendeesCount: data.attendeesCount || 1,
    adminNotes: null,
    userNotes: data.userNotes || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.reservations.unshift(newReservation);
  persistData(db);

  await addActivityLog({
    userId: data.userId,
    action: initialStatus === 'APPROVED' ? 'AUTO_APPROVED_RESERVATION' : 'SUBMITTED_BOOKING',
    entityType: 'Reservation',
    entityId: newReservation.id,
    details: `User ${user?.name || data.userId} booked "${data.title}" for ${resource?.name || data.resourceId} (${initialStatus})`,
  });

  return {
    ...newReservation,
    user,
    resource,
  };
}

export async function updateReservationStatus(params: {
  id: string;
  status: ReservationStatus;
  adminNotes?: string | null;
  adminId?: string;
}): Promise<Reservation | null> {
  const { id, status, adminNotes, adminId } = params;
  const db = ensureDataFile();
  const index = db.reservations.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const current = db.reservations[index];
  const updated: Reservation = {
    ...current,
    status,
    adminNotes: adminNotes !== undefined ? adminNotes : current.adminNotes,
    updatedAt: new Date().toISOString(),
  };

  db.reservations[index] = updated;
  persistData(db);

  await addActivityLog({
    userId: adminId,
    action: `${status}_RESERVATION`,
    entityType: 'Reservation',
    entityId: id,
    details: `Reservation "${updated.title}" status changed to ${status}${adminNotes ? `: "${adminNotes}"` : ''}`,
  });

  const user = db.users.find((u) => u.id === updated.userId);
  const resource = db.resources.find((r) => r.id === updated.resourceId);

  return {
    ...updated,
    user,
    resource,
  };
}

export async function deleteReservation(id: string, userId?: string): Promise<boolean> {
  const db = ensureDataFile();
  const index = db.reservations.findIndex((r) => r.id === id);
  if (index === -1) return false;

  const [removed] = db.reservations.splice(index, 1);
  persistData(db);

  await addActivityLog({
    userId,
    action: 'CANCELLED_RESERVATION',
    entityType: 'Reservation',
    entityId: id,
    details: `Reservation "${removed.title}" was cancelled/deleted`,
  });

  return true;
}

/* =========================================================================
   ACTIVITY LOGS
   ========================================================================= */

export async function getActivityLogs(limit: number = 20): Promise<ActivityLog[]> {
  const db = ensureDataFile();
  return db.activityLogs
    .map((log) => ({
      ...log,
      user: db.users.find((u) => u.id === log.userId) || null,
    }))
    .slice(0, limit);
}

export async function addActivityLog(data: Omit<ActivityLog, 'id' | 'createdAt'>): Promise<ActivityLog> {
  const db = ensureDataFile();
  const newLog: ActivityLog = {
    ...data,
    id: `log-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };

  db.activityLogs.unshift(newLog);
  // Keep last 150 logs
  if (db.activityLogs.length > 150) {
    db.activityLogs.pop();
  }
  persistData(db);

  return newLog;
}

/* =========================================================================
   ANALYTICS & METRICS
   ========================================================================= */

export async function getAnalytics(): Promise<AnalyticsStats> {
  const db = ensureDataFile();

  const totalResources = db.resources.length;
  const activeResources = db.resources.filter((r) => r.status === 'AVAILABLE').length;
  const totalReservations = db.reservations.length;
  const pendingApprovals = db.reservations.filter((r) => r.status === 'PENDING').length;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const approvedToday = db.reservations.filter((r) => {
    if (r.status !== 'APPROVED') return false;
    const st = new Date(r.startTime).getTime();
    return st >= todayStart.getTime() && st <= todayEnd.getTime();
  }).length;

  const activeUsers = new Set(db.reservations.map((r) => r.userId)).size;

  // Approximate utilization rate (resources with approved reservations today / total resources)
  const utilizedResourcesToday = new Set(
    db.reservations
      .filter((r) => r.status === 'APPROVED' && new Date(r.startTime).getTime() <= todayEnd.getTime())
      .map((r) => r.resourceId)
  ).size;

  const utilizationRate = totalResources > 0 ? Math.round((utilizedResourcesToday / totalResources) * 100) : 0;

  // Status breakdown
  const statusCounts: Record<ReservationStatus, number> = {
    APPROVED: 0,
    PENDING: 0,
    REJECTED: 0,
    CANCELLED: 0,
    COMPLETED: 0,
  };

  db.reservations.forEach((r) => {
    if (statusCounts[r.status] !== undefined) {
      statusCounts[r.status]++;
    }
  });

  const reservationsByStatus = [
    { name: 'Approved', value: statusCounts.APPROVED, color: '#10b981' },
    { name: 'Pending', value: statusCounts.PENDING, color: '#f59e0b' },
    { name: 'Completed', value: statusCounts.COMPLETED, color: '#6366f1' },
    { name: 'Rejected', value: statusCounts.REJECTED, color: '#ef4444' },
    { name: 'Cancelled', value: statusCounts.CANCELLED, color: '#6b7280' },
  ];

  // Category distribution
  const reservationsByCategory = db.categories.map((c) => {
    const resourceIds = db.resources.filter((r) => r.categoryId === c.id).map((r) => r.id);
    const count = db.reservations.filter((res) => resourceIds.includes(res.resourceId)).length;
    return {
      category: c.name,
      count,
    };
  });

  // Peak hours calculation (group by starting hour)
  const hourMap: Record<number, number> = {
    8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0,
  };

  db.reservations.forEach((r) => {
    const hour = new Date(r.startTime).getHours();
    if (hourMap[hour] !== undefined) {
      hourMap[hour]++;
    }
  });

  const peakHours = Object.entries(hourMap).map(([h, count]) => ({
    hour: `${parseInt(h, 10) > 12 ? parseInt(h, 10) - 12 : h}:00 ${parseInt(h, 10) >= 12 ? 'PM' : 'AM'}`,
    bookings: count,
  }));

  // Top booked resources
  const resourceBookingCounts: Record<string, number> = {};
  db.reservations.forEach((r) => {
    resourceBookingCounts[r.resourceId] = (resourceBookingCounts[r.resourceId] || 0) + 1;
  });

  const topResources = db.resources
    .map((r) => ({
      id: r.id,
      name: r.name,
      code: r.code,
      bookingsCount: resourceBookingCounts[r.id] || 0,
      category: db.categories.find((c) => c.id === r.categoryId)?.name || 'General',
    }))
    .sort((a, b) => b.bookingsCount - a.bookingsCount)
    .slice(0, 5);

  return {
    totalResources,
    activeResources,
    totalReservations,
    pendingApprovals,
    approvedToday,
    activeUsers,
    utilizationRate,
    reservationsByStatus,
    reservationsByCategory,
    peakHours,
    topResources,
  };
}

export async function resetDatabaseToSeed(): Promise<void> {
  const initialData: DatabaseSchema = {
    categories: INITIAL_CATEGORIES,
    resources: INITIAL_RESOURCES,
    users: INITIAL_USERS,
    reservations: INITIAL_RESERVATIONS,
    activityLogs: INITIAL_ACTIVITY_LOGS,
  };
  persistData(initialData);
}
