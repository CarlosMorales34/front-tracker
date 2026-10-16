export type AnalyticsInsightArea = 'sleep' | 'work' | 'activities' | 'training' | 'body' | 'data-quality';
export type AnalyticsInsightSeverity = 'info' | 'warning' | 'positive';

export interface AnalyticsInsight {
  id: string;
  area: AnalyticsInsightArea;
  severity: AnalyticsInsightSeverity;
  title: string;
  detail: string;
  metric?: string;
}

export interface PersonalAnalyticsSummary {
  range: { from: string; to: string; days: number };
  sleep: {
    hasData: boolean;
    days: number;
    samples: number;
    medianBedtime: string | null;
    medianWakeTime: string | null;
    averageHours: number | null;
    medianHours: number | null;
    bedtimeDispersionMinutes: number | null;
    shortSleepDays: number;
    secondaryHours: number;
    secondarySamples: number;
    weekdayAverages: { weekday: number; averageHours: number; samples: number }[];
  };
  work: {
    hasData: boolean;
    days: number;
    samples: number;
    totalHours: number;
    medianStartTime: string | null;
    medianEndTime: string | null;
    averageBlockHours: number | null;
    mostFrequentStartBucket: string | null;
    averageDayHours: number | null;
    multiBlockDays: number;
    weekendDays: number;
    blocks: { period: 'morning' | 'afternoon' | 'night'; samples: number; startTime: string; endTime: string }[];
    weekdayAverages: { weekday: number; averageHours: number; samples: number }[];
  };
  activities: {
    hasData: boolean;
    totalHours: number;
    categories: {
      categoryId: string;
      name: string;
      color: string;
      totalHours: number;
      activeDays: number;
      sharePercent: number;
      avgHoursPerActiveDay: number;
      hasEnoughData: boolean;
      dataMessage: string | null;
      activities: {
        activityId: string;
        name: string;
        totalHours: number;
        activeDays: number;
        sharePercent: number;
        avgHoursPerActiveDay: number;
        hasEnoughData: boolean;
        dataMessage: string | null;
      }[];
    }[];
    topActivities: {
      activityId: string;
      categoryName: string;
      name: string;
      totalHours: number;
      activeDays: number;
      avgHoursPerActiveDay: number;
    }[];
  };
  training: {
    hasData: boolean;
    sessions: number;
    totalHours: number;
    averageMinutes: number | null;
    sessionsPerWeek: number;
    activeDays: number;
    weeklyDays: { week: string; days: number; complete: boolean }[];
    lastWorkoutDate: string | null;
    weekdayCounts: { weekday: number; sessions: number; averageMinutes: number }[];
    topExercises: {
      name: string;
      appearances: number;
      lastDate: string;
      avgWeight: number | null;
      maxWeight: number | null;
      totalReps: number;
      totalVolume: number;
    }[];
  };
  body: {
    hasData: boolean;
    currentWeightKg: number | null;
    previousWeightKg: number | null;
    deltaVsPreviousKg: number | null;
    goalType: string | null;
    targetWeightKg: number | null;
    distanceToTargetKg: number | null;
    trendVsGoal: 'favorable' | 'unfavorable' | 'neutral' | null;
    latestMeasurementAt: string | null;
    measurementCount: number;
    measurementAgeDays: number | null;
  };
  timeline: {
    date: string;
    sleepHours: number | null;
    workHours: number | null;
    activityHours: number | null;
    workoutMinutes: number | null;
    weightKg: number | null;
  }[];
  dataQuality: { warnings: AnalyticsInsight[] };
  comparison: {
    from: string;
    to: string;
    sleepDays: number;
    sleepAverageHours: number | null;
    sleepChangeHours: number | null;
    bedtimeDispersionChangeMinutes: number | null;
  };
  insights: AnalyticsInsight[];
}
