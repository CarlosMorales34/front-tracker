import { apiFetch } from '../../../shared/lib/api-client';
import { Category, Activity, FixedRoutine, RoutineType } from '../types/activities.types';

function authHeaders(accessToken?: string | null): HeadersInit {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

interface CategoryDto {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
}

interface ActivityDto {
  id: string;
  categoryId: string;
  name: string;
  sortOrder: number;
}

interface RoutineDto {
  id: string;
  name: string;
  icon: string;
  type: RoutineType;
  sortOrder: number;
}

const withEmptyHours = (dto: ActivityDto): Activity => ({
  ...dto,
  todayHours: null,
  weekHours: [null, null, null, null, null, null, null],
});

const withEmptyTimes = (dto: RoutineDto): FixedRoutine => ({ ...dto, times: [] });

export const activitiesApi = {
  listCategories: (accessToken?: string | null): Promise<Category[]> =>
    apiFetch<CategoryDto[]>('/api/activity-categories', { headers: authHeaders(accessToken) }),

  createCategory: (name: string, color: string, accessToken?: string | null): Promise<Category> =>
    apiFetch<CategoryDto>('/api/activity-categories', {
      method: 'POST',
      body: JSON.stringify({ name, color }),
      headers: authHeaders(accessToken),
    }),

  listActivities: async (accessToken?: string | null): Promise<Activity[]> => {
    const dtos = await apiFetch<ActivityDto[]>('/api/activities', { headers: authHeaders(accessToken) });
    return dtos.map(withEmptyHours);
  },

  createActivity: async (categoryId: string, name: string, accessToken?: string | null): Promise<Activity> => {
    const dto = await apiFetch<ActivityDto>('/api/activities', {
      method: 'POST',
      body: JSON.stringify({ categoryId, name }),
      headers: authHeaders(accessToken),
    });
    return withEmptyHours(dto);
  },

  listRoutines: async (accessToken?: string | null): Promise<FixedRoutine[]> => {
    const dtos = await apiFetch<RoutineDto[]>('/api/fixed-routines', { headers: authHeaders(accessToken) });
    return dtos.map(withEmptyTimes);
  },

  createRoutine: async (
    name: string,
    type: RoutineType,
    accessToken?: string | null,
    icon = 'moon'
  ): Promise<FixedRoutine> => {
    const dto = await apiFetch<RoutineDto>('/api/fixed-routines', {
      method: 'POST',
      body: JSON.stringify({ name, type, icon }),
      headers: authHeaders(accessToken),
    });
    return withEmptyTimes(dto);
  },

  deleteRoutine: (id: string, accessToken?: string | null): Promise<void> =>
    apiFetch<void>(`/api/fixed-routines/${id}`, { method: 'DELETE', headers: authHeaders(accessToken) }),
};
