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
  };
  timeline: {
    date: string;
    sleepHours: number;
    workHours: number;
    activityHours: number;
    workoutMinutes: number;
    weightKg: number | null;
  }[];
  dataQuality: { warnings: AnalyticsInsight[] };
  insights: AnalyticsInsight[];
}
