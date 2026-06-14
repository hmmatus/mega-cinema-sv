import type { Branch, BranchStatus } from '@cinema/database';

export const LOCATION_REPOSITORY = Symbol('LocationRepository');

export interface LocationFilters {
  status?: BranchStatus;
  city?: string;
  search?: string;
}

export interface LocationPagination {
  page: number;
  pageSize: number;
  sortBy: 'name' | 'city' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedLocations {
  data: Branch[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface LocationWithDetails extends Branch {
  rooms: RoomBasic[];
  totalRooms: number;
  totalSeats: number;
}

export interface RoomBasic {
  id: string;
  name: string;
  capacity: number;
}

export interface NearbyLocation extends Branch {
  distanceKm: number;
}

export interface CreateLocationData {
  name: string;
  address: string;
  city: string;
  phone?: string | null;
  description?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string;
  email?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status?: BranchStatus;
  operatingHours?: object | null;
  imageUrl?: string | null;
  features?: string[];
  metadata?: object | null;
  createdById?: string | null;
}

export interface UpdateLocationData extends Partial<CreateLocationData> {
  updatedById?: string | null;
}

export interface LocationRepository {
  findMany(filters: LocationFilters, pagination: LocationPagination): Promise<PaginatedLocations>;
  findById(id: string): Promise<Branch | null>;
  findByIdWithDetails(id: string): Promise<LocationWithDetails | null>;
  findByCity(city: string): Promise<Branch[]>;
  findAllWithCoords(): Promise<Branch[]>;
  create(data: CreateLocationData): Promise<Branch>;
  update(id: string, data: UpdateLocationData): Promise<Branch>;
}
