'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { activitiesApi } from '../services/activities.api';
import { Activity, ActivityLog, Category, FixedRoutine, RoutineTimeRange, RoutineType } from '../types/activities.types';
import {
  addDaysIso,
  formatDateRangeLabel,
  getCurrentWeekDayChips,
  getMonthRange,
  getPreviousMonthRange,
  getTodayIso,
} from '../utils/date-range';
import { sumHours } from '../utils/hours';
import { ActivitiesHeader } from './ActivitiesHeader';
import styles from './activities.module.css';
import { CategoryDistributionCard } from './CategoryDistributionCard';
import { CategorySection } from './CategorySection';
import { DayChipStrip } from './DayChipStrip';
import { ActivitiesTab } from './HoySemanaToggle';
import { NewActivityModal } from './NewActivityModal';
import { NewCategoryModal } from './NewCategoryModal';
import { NewRoutineModal } from './NewRoutineModal';
import { RoutineSection } from './RoutineSection';
import { WeeklyComparisonCards } from './WeeklyComparisonCards';
import { WeeklyTable } from './WeeklyTable';

const DAY_CHIPS = getCurrentWeekDayChips();
const DATE_RANGE_LABEL = formatDateRangeLabel(DAY_CHIPS);
const ZERO_WEEK = [0, 0, 0, 0, 0, 0, 0];
const EMPTY_WEEK: (number | null)[] = [null, null, null, null, null, null, null];
const COLLAPSED_CATEGORIES_STORAGE_KEY = 'vitalis.activities.collapsedCategories';

type RoutineChanges = { name?: string; icon?: string; type?: RoutineType };

interface ComparisonStat {
  label: string;
  hours: number;
  previousLabel: string;
  previousHours: number;
  diffHours: number;
}

function loadCollapsedCategoryIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(COLLAPSED_CATEGORIES_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function sumLogHours(logs: ActivityLog[]): number {
  return Math.round(logs.reduce((total, log) => total + log.hours, 0) * 100) / 100;
}

// Mapa activityId -> horas por día de la semana en vista (índice 0 = sábado,
// mismo orden que DAY_CHIPS), a partir de los logs crudos de ese rango.
function buildWeekActivityHours(logs: ActivityLog[]): Record<string, (number | null)[]> {
  const byActivity: Record<string, (number | null)[]> = {};
  for (const log of logs) {
    const dayIndex = DAY_CHIPS.findIndex((day) => day.dateIso === log.logDate);
    if (dayIndex === -1) continue;
    if (!byActivity[log.activityId]) byActivity[log.activityId] = [...EMPTY_WEEK];
    byActivity[log.activityId]![dayIndex] = log.hours;
  }
  return byActivity;
}

function buildProductiveHoursByDay(logs: ActivityLog[]): number[] {
  const totals = [...ZERO_WEEK];
  for (const log of logs) {
    const dayIndex = DAY_CHIPS.findIndex((day) => day.dateIso === log.logDate);
    if (dayIndex === -1) continue;
    totals[dayIndex] = Math.round(((totals[dayIndex] ?? 0) + log.hours) * 100) / 100;
  }
  return totals;
}

export function ActivitiesView() {
  const { accessToken } = useAuth();
  const [tab, setTab] = useState<ActivitiesTab>('hoy');
  const [selectedDateIso, setSelectedDateIso] = useState(DAY_CHIPS[0]?.dateIso ?? '');

  const [categories, setCategories] = useState<Category[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [routines, setRoutines] = useState<FixedRoutine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [collapsedCategoryIds, setCollapsedCategoryIds] = useState<Set<string>>(loadCollapsedCategoryIds);

  const [isRoutineModalOpen, setRoutineModalOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [activityModalCategoryId, setActivityModalCategoryId] = useState<string | null>(null);

  const [weekActivityHours, setWeekActivityHours] = useState<Record<string, (number | null)[]>>({});
  const [productiveHoursByDay, setProductiveHoursByDay] = useState<number[]>(ZERO_WEEK);
  const [comparisonStats, setComparisonStats] = useState<{ week: ComparisonStat; month: ComparisonStat } | null>(null);

  const loadCategories = useCallback(async () => {
    setCategories(await activitiesApi.listCategories(accessToken));
  }, [accessToken]);

  const loadActivities = useCallback(
    async (dateIso: string) => {
      setActivities(await activitiesApi.listActivities(accessToken, dateIso));
    },
    [accessToken],
  );

  const loadRoutines = useCallback(
    async (dateIso: string) => {
      setRoutines(await activitiesApi.listRoutines(accessToken, dateIso));
    },
    [accessToken],
  );

  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);
    Promise.all([loadCategories(), loadActivities(selectedDateIso), loadRoutines(selectedDateIso)]).finally(() =>
      setIsLoading(false),
    );
    // Solo al montar / cuando cambia el token -- el cambio de selectedDateIso
    // se maneja aparte (solo necesita refrescar actividades/rutinas, no categorías).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken || isLoading) return;
    loadActivities(selectedDateIso);
    loadRoutines(selectedDateIso);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateIso]);

  useEffect(() => {
    window.localStorage.setItem(COLLAPSED_CATEGORIES_STORAGE_KEY, JSON.stringify([...collapsedCategoryIds]));
  }, [collapsedCategoryIds]);

  const loadWeekTab = useCallback(async () => {
    const today = getTodayIso();
    const thisWeekFrom = DAY_CHIPS[0]!.dateIso;
    const thisWeekTo = DAY_CHIPS[6]!.dateIso;
    const lastWeekFrom = addDaysIso(thisWeekFrom, -7);
    const lastWeekTo = addDaysIso(thisWeekTo, -7);
    const thisMonth = getMonthRange(today);
    const lastMonth = getPreviousMonthRange(today);

    const [thisWeekLogs, lastWeekLogs, thisMonthLogs, lastMonthLogs] = await Promise.all([
      activitiesApi.listActivityLogs(thisWeekFrom, thisWeekTo, accessToken),
      activitiesApi.listActivityLogs(lastWeekFrom, lastWeekTo, accessToken),
      activitiesApi.listActivityLogs(thisMonth.from, thisMonth.to, accessToken),
      activitiesApi.listActivityLogs(lastMonth.from, lastMonth.to, accessToken),
    ]);

    setWeekActivityHours(buildWeekActivityHours(thisWeekLogs));
    setProductiveHoursByDay(buildProductiveHoursByDay(thisWeekLogs));

    const thisWeekTotal = sumLogHours(thisWeekLogs);
    const lastWeekTotal = sumLogHours(lastWeekLogs);
    const thisMonthTotal = sumLogHours(thisMonthLogs);
    const lastMonthTotal = sumLogHours(lastMonthLogs);
    setComparisonStats({
      week: {
        label: 'Esta semana vs. anterior',
        hours: thisWeekTotal,
        previousLabel: 'Semana pasada',
        previousHours: lastWeekTotal,
        diffHours: Math.round((thisWeekTotal - lastWeekTotal) * 100) / 100,
      },
      month: {
        label: 'Este mes vs. mes anterior',
        hours: thisMonthTotal,
        previousLabel: 'Mes pasado',
        previousHours: lastMonthTotal,
        diffHours: Math.round((thisMonthTotal - lastMonthTotal) * 100) / 100,
      },
    });
  }, [accessToken]);

  useEffect(() => {
    if (accessToken && tab === 'semana') loadWeekTab();
  }, [accessToken, tab, loadWeekTab]);

  const weeklyActivities = useMemo(
    () => activities.map((activity) => ({ ...activity, weekHours: weekActivityHours[activity.id] ?? EMPTY_WEEK })),
    [activities, weekActivityHours],
  );

  const totalsByCategory = useMemo(() => {
    const totals: Record<string, number | null> = {};
    for (const category of categories) {
      const categoryActivities = weeklyActivities.filter((activity) => activity.categoryId === category.id);
      totals[category.id] = sumHours(categoryActivities.map((activity) => sumHours(activity.weekHours)));
    }
    return totals;
  }, [categories, weeklyActivities]);

  const handleCreateRoutine = async (name: string, type: RoutineType) => {
    const created = await activitiesApi.createRoutine(name, type, accessToken);
    setRoutines((prev) => [...prev, created]);
    setRoutineModalOpen(false);
  };

  const handleDeleteRoutine = async (id: string) => {
    await activitiesApi.deleteRoutine(id, accessToken);
    setRoutines((prev) => prev.filter((routine) => routine.id !== id));
  };

  const handleSaveRoutineTimes = async (id: string, times: RoutineTimeRange[]) => {
    const saved = await activitiesApi.putRoutineLog(id, selectedDateIso, times, accessToken);
    setRoutines((prev) => prev.map((routine) => (routine.id === id ? { ...routine, times: saved } : routine)));
  };

  const handleUpdateRoutine = async (id: string, changes: RoutineChanges) => {
    // La respuesta de PATCH no trae `times` (no es parte de lo que edita este
    // endpoint) -- se conserva el `times` que ya estaba en el estado local.
    const updated = await activitiesApi.updateRoutine(id, changes, accessToken);
    setRoutines((prev) =>
      prev.map((routine) =>
        routine.id === id ? { ...routine, name: updated.name, icon: updated.icon, type: updated.type } : routine,
      ),
    );
  };

  const handleSaveActivityHours = async (id: string, hours: number | null) => {
    const saved = await activitiesApi.putActivityLog(id, selectedDateIso, hours, accessToken);
    setActivities((prev) => prev.map((activity) => (activity.id === id ? { ...activity, todayHours: saved } : activity)));
  };

  const handleCreateCategory = async (name: string, color: string) => {
    const created = await activitiesApi.createCategory(name, color, accessToken);
    setCategories((prev) => [...prev, created]);
    setCategoryModalOpen(false);
  };

  const handleCreateActivity = async (name: string) => {
    if (!activityModalCategoryId) return;
    const created = await activitiesApi.createActivity(activityModalCategoryId, name, accessToken);
    setActivities((prev) => [...prev, created]);
    setActivityModalCategoryId(null);
  };

  const toggleCategoryCollapse = (categoryId: string) => {
    setCollapsedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const handleMoveCategory = async (categoryId: string, direction: 'up' | 'down') => {
    const index = categories.findIndex((category) => category.id === categoryId);
    const swapWith = direction === 'up' ? index - 1 : index + 1;
    if (index === -1 || swapWith < 0 || swapWith >= categories.length) return;

    const reordered = [...categories];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith]!, reordered[index]!];
    setCategories(reordered);
    await activitiesApi.reorderCategories(
      reordered.map((category) => category.id),
      accessToken,
    );
  };

  const handleMoveActivity = async (categoryId: string, activityId: string, direction: 'up' | 'down') => {
    const categoryActivities = activities.filter((activity) => activity.categoryId === categoryId);
    const index = categoryActivities.findIndex((activity) => activity.id === activityId);
    const swapWith = direction === 'up' ? index - 1 : index + 1;
    if (index === -1 || swapWith < 0 || swapWith >= categoryActivities.length) return;

    const reorderedCategoryActivities = [...categoryActivities];
    [reorderedCategoryActivities[index], reorderedCategoryActivities[swapWith]] = [
      reorderedCategoryActivities[swapWith]!,
      reorderedCategoryActivities[index]!,
    ];

    setActivities((prev) => {
      const otherActivities = prev.filter((activity) => activity.categoryId !== categoryId);
      return [...otherActivities, ...reorderedCategoryActivities];
    });

    await activitiesApi.reorderActivities(
      categoryId,
      reorderedCategoryActivities.map((activity) => activity.id),
      accessToken,
    );
  };

  const activityModalCategory = categories.find((category) => category.id === activityModalCategoryId);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <ActivitiesHeader dateRangeLabel={DATE_RANGE_LABEL} tab={tab} onTabChange={setTab} />
        <p className={styles.cardNote}>Cargando…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <ActivitiesHeader dateRangeLabel={DATE_RANGE_LABEL} tab={tab} onTabChange={setTab} />

      {tab === 'hoy' ? (
        <>
          <DayChipStrip days={DAY_CHIPS} selectedDateIso={selectedDateIso} onSelect={setSelectedDateIso} />

          <RoutineSection
            routines={routines}
            selectedDateIso={selectedDateIso}
            onAddClick={() => setRoutineModalOpen(true)}
            onDelete={handleDeleteRoutine}
            onSaveTimes={handleSaveRoutineTimes}
            onUpdateRoutine={handleUpdateRoutine}
          />

          {categories.length === 0 ? (
            <p className={styles.cardNote}>Todavía no tienes categorías. Crea la primera abajo.</p>
          ) : (
            categories.map((category, index) => (
              <CategorySection
                key={category.id}
                category={category}
                activities={activities.filter((activity) => activity.categoryId === category.id)}
                isCollapsed={collapsedCategoryIds.has(category.id)}
                onToggleCollapse={() => toggleCategoryCollapse(category.id)}
                onAddActivityClick={() => setActivityModalCategoryId(category.id)}
                canMoveCategoryUp={index > 0}
                canMoveCategoryDown={index < categories.length - 1}
                onMoveCategory={(direction) => handleMoveCategory(category.id, direction)}
                onMoveActivity={(activityId, direction) => handleMoveActivity(category.id, activityId, direction)}
                onSaveHours={handleSaveActivityHours}
              />
            ))
          )}

          <button type="button" className={styles.outlineButton} onClick={() => setCategoryModalOpen(true)}>
            + Nueva categoría
          </button>
        </>
      ) : (
        <>
          <WeeklyTable
            days={DAY_CHIPS}
            categories={categories}
            activities={weeklyActivities}
            productiveHoursByDay={productiveHoursByDay}
          />

          {comparisonStats && (
            <WeeklyComparisonCards week={comparisonStats.week} month={comparisonStats.month} />
          )}

          <CategoryDistributionCard categories={categories} totalsByCategory={totalsByCategory} />
        </>
      )}

      {isRoutineModalOpen && <NewRoutineModal onClose={() => setRoutineModalOpen(false)} onCreate={handleCreateRoutine} />}
      {isCategoryModalOpen && (
        <NewCategoryModal onClose={() => setCategoryModalOpen(false)} onCreate={handleCreateCategory} />
      )}
      {activityModalCategory && (
        <NewActivityModal
          categoryName={activityModalCategory.name}
          onClose={() => setActivityModalCategoryId(null)}
          onCreate={handleCreateActivity}
        />
      )}
    </div>
  );
}
