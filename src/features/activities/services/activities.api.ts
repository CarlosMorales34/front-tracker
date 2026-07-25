import { apiFetch } from '../../../shared/lib/api-client';
import { Category, Activity, ActivityLog, FixedRoutine, RoutineType, RoutineTimeRange } from '../types/activities.types';

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
  todayHours?: number | null;
}

interface RoutineDto {
  id: string;
  name: string;
  icon: string;
  type: RoutineType;
  sortOrder: number;
  times?: RoutineTimeRange[];
}

const withHours = (dto: ActivityDto): Activity => ({
  ...dto,
  todayHours: dto.todayHours ?? null,
  weekHours: [null, null, null, null, null, null, null],
});

const withTimes = (dto: RoutineDto): FixedRoutine => ({ ...dto, times: dto.times ?? [] });

export const activitiesApi = {
  listCategories: (accessToken?: string | null): Promise<Category[]> =>
    apiFetch<CategoryDto[]>('/api/activity-categories', { headers: authHeaders(accessToken) }),

  createCategory: (name: string, color: string, accessToken?: string | null): Promise<Category> =>
    apiFetch<CategoryDto>('/api/activity-categories', {
      method: 'POST',
      body: JSON.stringify({ name, color }),
      headers: authHeaders(accessToken),
    }),

  reorderCategories: (orderedIds: string[], accessToken?: string | null): Promise<void> =>
    apiFetch<void>('/api/activity-categories/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ orderedIds }),
      headers: authHeaders(accessToken),
    }),

  listActivities: async (accessToken?: string | null, dateIso?: string): Promise<Activity[]> => {
    const query = dateIso ? `?date=${dateIso}` : '';
    const dtos = await apiFetch<ActivityDto[]>(`/api/activities${query}`, { headers: authHeaders(accessToken) });
    return dtos.map(withHours);
  },

  createActivity: async (categoryId: string, name: string, accessToken?: string | null): Promise<Activity> => {
    const dto = await apiFetch<ActivityDto>('/api/activities', {
      method: 'POST',
      body: JSON.stringify({ categoryId, name }),
      headers: authHeaders(accessToken),
    });
    return withHours(dto);
  },

  reorderActivities: (categoryId: string, orderedIds: string[], accessToken?: string | null): Promise<void> =>
    apiFetch<void>('/api/activities/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ categoryId, orderedIds }),
      headers: authHeaders(accessToken),
    }),

  listActivityLogs: (from: string, to: string, accessToken?: string | null): Promise<ActivityLog[]> =>
    apiFetch<ActivityLog[]>(`/api/activity-logs?from=${from}&to=${to}`, { headers: authHeaders(accessToken) }),

  putActivityLog: async (
    id: string,
    dateIso: string,
    hours: number | null,
    accessToken?: string | null,
  ): Promise<number | null> => {
    const result = await apiFetch<{ hours: number | null }>(`/api/activities/${id}/log`, {
      method: 'PUT',
      body: JSON.stringify({ date: dateIso, hours }),
      headers: authHeaders(accessToken),
    });
    return result.hours;
  },

  listRoutines: async (accessToken?: string | null, dateIso?: string): Promise<FixedRoutine[]> => {
    const query = dateIso ? `?date=${dateIso}` : '';
    const dtos = await apiFetch<RoutineDto[]>(`/api/fixed-routines${query}`, { headers: authHeaders(accessToken) });
    return dtos.map(withTimes);
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
    return withTimes(dto);
  },

  updateRoutine: async (
    id: string,
    changes: { name?: string; icon?: string; type?: RoutineType },
    accessToken?: string | null,
  ): Promise<FixedRoutine> => {
    const dto = await apiFetch<RoutineDto>(`/api/fixed-routines/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
      headers: authHeaders(accessToken),
    });
    return withTimes(dto);
  },

  deleteRoutine: (id: string, accessToken?: string | null): Promise<void> =>
    apiFetch<void>(`/api/fixed-routines/${id}`, { method: 'DELETE', headers: authHeaders(accessToken) }),

  putRoutineLog: async (
    id: string,
    dateIso: string,
    times: RoutineTimeRange[],
    accessToken?: string | null,
  ): Promise<RoutineTimeRange[]> => {
    const result = await apiFetch<{ times: RoutineTimeRange[] }>(`/api/fixed-routines/${id}/log`, {
      method: 'PUT',
      body: JSON.stringify({ date: dateIso, times }),
      headers: authHeaders(accessToken),
    });
    return result.times;
  },
};
