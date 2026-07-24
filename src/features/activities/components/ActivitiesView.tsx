'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { activitiesApi } from '../services/activities.api';
import { Activity, Category, FixedRoutine, RoutineType } from '../types/activities.types';
import { formatDateRangeLabel, getCurrentWeekDayChips } from '../utils/date-range';
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

export function ActivitiesView() {
  const { accessToken } = useAuth();
  const [tab, setTab] = useState<ActivitiesTab>('hoy');
  const [selectedDateIso, setSelectedDateIso] = useState(DAY_CHIPS[0]?.dateIso ?? '');

  const [categories, setCategories] = useState<Category[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [routines, setRoutines] = useState<FixedRoutine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isRoutineModalOpen, setRoutineModalOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [activityModalCategoryId, setActivityModalCategoryId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [categoriesRes, activitiesRes, routinesRes] = await Promise.all([
        activitiesApi.listCategories(accessToken),
        activitiesApi.listActivities(accessToken),
        activitiesApi.listRoutines(accessToken),
      ]);
      setCategories(categoriesRes);
      setActivities(activitiesRes);
      setRoutines(routinesRes);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      loadAll();
    }
  }, [accessToken, loadAll]);

  const totalsByCategory = useMemo(() => {
    const totals: Record<string, number | null> = {};
    for (const category of categories) {
      const categoryActivities = activities.filter((activity) => activity.categoryId === category.id);
      totals[category.id] = sumHours(categoryActivities.map((activity) => sumHours(activity.weekHours)));
    }
    return totals;
  }, [categories, activities]);

  const handleCreateRoutine = async (name: string, type: RoutineType) => {
    const created = await activitiesApi.createRoutine(name, type, accessToken);
    setRoutines((prev) => [...prev, created]);
    setRoutineModalOpen(false);
  };

  const handleDeleteRoutine = async (id: string) => {
    await activitiesApi.deleteRoutine(id, accessToken);
    setRoutines((prev) => prev.filter((routine) => routine.id !== id));
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

          <RoutineSection routines={routines} onAddClick={() => setRoutineModalOpen(true)} onDelete={handleDeleteRoutine} />

          {categories.length === 0 ? (
            <p className={styles.cardNote}>Todavía no tienes categorías. Crea la primera abajo.</p>
          ) : (
            categories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                activities={activities.filter((activity) => activity.categoryId === category.id)}
                onAddActivityClick={() => setActivityModalCategoryId(category.id)}
              />
            ))
          )}

          <button type="button" className={styles.outlineButton} onClick={() => setCategoryModalOpen(true)}>
            + Nueva categoría
          </button>
        </>
      ) : (
        <>
          <WeeklyTable days={DAY_CHIPS} categories={categories} activities={activities} productiveHoursByDay={ZERO_WEEK} />

          <WeeklyComparisonCards
            week={{ label: 'Esta semana vs. anterior', hours: 0, previousLabel: 'Semana pasada', previousHours: 0, diffHours: 0 }}
            month={{ label: 'Este mes vs. mes anterior', hours: 0, previousLabel: 'Mes pasado', previousHours: 0, diffHours: 0 }}
          />

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

