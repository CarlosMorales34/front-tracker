import { PersonalAnalyticsSummary } from '../types/analytics.types';
import styles from './analytics.module.css';

interface AnalyticsViewProps {
  summary: PersonalAnalyticsSummary;
  range: '30d' | '90d';
  onRangeChange: (range: '30d' | '90d') => void;
}

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

export function AnalyticsView({ summary, range, onRangeChange }: AnalyticsViewProps) {
  const radar = buildRadar(summary);
  const maxTimelineValue = Math.max(
    1,
    ...summary.timeline.map((day) => Math.max(day.sleepHours, day.workHours, day.activityHours, day.workoutMinutes / 60)),
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Analytics personales</p>
          <h1 className={styles.title}>Tu información convertida en decisiones</h1>
          <p className={styles.subtitle}>
            {summary.range.from} · {summary.range.to}
          </p>
        </div>
        <div className={styles.segmentedControl} aria-label="Rango de analytics">
          <button type="button" data-active={range === '30d'} onClick={() => onRangeChange('30d')}>
            30D
          </button>
          <button type="button" data-active={range === '90d'} onClick={() => onRangeChange('90d')}>
            90D
          </button>
        </div>
      </header>

      <section className={styles.kpiGrid}>
        <Kpi label="Sueño mediano" value={summary.sleep.medianHours !== null ? `${summary.sleep.medianHours}h` : '—'} note={`${summary.sleep.days} dias`} />
        <Kpi label="Trabajo" value={`${summary.work.totalHours.toFixed(1)}h`} note={summary.work.averageBlockHours !== null ? `${summary.work.averageBlockHours}h/bloque` : 'sin datos'} />
        <Kpi label="Tiempo registrado" value={`${summary.activities.totalHours.toFixed(1)}h`} note={`${summary.activities.categories.length} categorias`} />
        <Kpi label="Entreno" value={`${summary.training.sessions}`} note={`${summary.training.sessionsPerWeek}/semana`} />
        <Kpi label="Peso actual" value={summary.body.currentWeightKg !== null ? `${summary.body.currentWeightKg}kg` : '—'} note={summary.body.targetWeightKg !== null ? `meta ${summary.body.targetWeightKg}kg` : 'sin meta'} />
      </section>

      <section className={styles.mainGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <p className={styles.panelTitle}>Spider de balance</p>
            <p className={styles.panelNote}>0-100 segun tus datos del rango</p>
          </div>
          <RadarChart axes={radar} />
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <p className={styles.panelTitle}>Conclusiones</p>
            <p className={styles.panelNote}>{summary.insights.length} señales detectadas</p>
          </div>
          <div className={styles.insightList}>
            {summary.insights.map((insight) => (
              <article key={insight.id} className={styles.insight} data-severity={insight.severity}>
                <span>{areaLabel(insight.area)}</span>
                <strong>{insight.title}</strong>
                <p>{insight.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <p className={styles.panelTitle}>Timelapse diario</p>
          <p className={styles.panelNote}>Sueño, trabajo, actividad y entreno por dia</p>
        </div>
        <div className={styles.timeline}>
          {summary.timeline.map((day) => (
            <div key={day.date} className={styles.timelineDay} title={timelineTitle(day)}>
              <span style={{ height: `${Math.max((day.sleepHours / maxTimelineValue) * 100, day.sleepHours > 0 ? 8 : 0)}%` }} data-kind="sleep" />
              <span style={{ height: `${Math.max((day.workHours / maxTimelineValue) * 100, day.workHours > 0 ? 8 : 0)}%` }} data-kind="work" />
              <span style={{ height: `${Math.max((day.activityHours / maxTimelineValue) * 100, day.activityHours > 0 ? 8 : 0)}%` }} data-kind="activity" />
              <span style={{ height: `${Math.max(((day.workoutMinutes / 60) / maxTimelineValue) * 100, day.workoutMinutes > 0 ? 8 : 0)}%` }} data-kind="training" />
            </div>
          ))}
        </div>
        <div className={styles.legend}>
          <Legend color="sleep" label="Sueño" />
          <Legend color="work" label="Trabajo" />
          <Legend color="activity" label="Actividad" />
          <Legend color="training" label="Entreno" />
        </div>
      </section>

      <section className={styles.detailGrid}>
        <div className={styles.panel}>
          <p className={styles.panelTitle}>Categorias</p>
          <div className={styles.categoryList}>
            {summary.activities.categories.map((category) => (
              <article key={category.categoryId} className={styles.categoryBlock}>
                <div className={styles.categoryRow}>
                  <div>
                    <strong>{category.name}</strong>
                    <span>{category.activeDays} dias · {category.avgHoursPerActiveDay}h/dia activo</span>
                  </div>
                  <div className={styles.categoryBar}>
                    <span style={{ transform: `scaleX(${category.sharePercent / 100})`, background: category.color }} />
                  </div>
                  <em>{category.sharePercent}%</em>
                </div>
                {category.dataMessage ? <p className={styles.dataMessage}>{category.dataMessage}</p> : null}
                <div className={styles.activityList}>
                  {category.activities.length > 0 ? (
                    category.activities.map((activity) => (
                      <div key={activity.activityId} className={styles.activityRow} data-low-signal={!activity.hasEnoughData}>
                        <div>
                          <strong>{activity.name}</strong>
                          <span>
                            {activity.totalHours}h · {activity.activeDays} dias · {activity.sharePercent}% de {category.name}
                          </span>
                        </div>
                        {activity.dataMessage ? <em>{activity.dataMessage}</em> : <em>{activity.avgHoursPerActiveDay}h/dia activo</em>}
                      </div>
                    ))
                  ) : (
                    <p className={styles.dataMessage}>Todavia no hay actividades registradas en esta categoria.</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <p className={styles.panelTitle}>Ritmos por dia</p>
          <div className={styles.weekdayGrid}>
            {summary.sleep.weekdayAverages.map((day) => (
              <div key={`sleep-${day.weekday}`} className={styles.weekdayCell}>
                <span>{WEEKDAYS[day.weekday]}</span>
                <strong>{day.averageHours}h</strong>
                <em>Sueño</em>
              </div>
            ))}
            {summary.training.weekdayCounts.map((day) => (
              <div key={`training-${day.weekday}`} className={styles.weekdayCell}>
                <span>{WEEKDAYS[day.weekday]}</span>
                <strong>{day.sessions}</strong>
                <em>Entrenos</em>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className={styles.kpi}>
      <span>{label}</span>
      <strong>{value}</strong>
      <em>{note}</em>
    </div>
  );
}

function RadarChart({ axes }: { axes: { label: string; value: number }[] }) {
  const center = 130;
  const radius = 92;
  const points = axes.map((axis, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / axes.length;
    const valueRadius = radius * (axis.value / 100);
    return {
      axis,
      x: center + Math.cos(angle) * valueRadius,
      y: center + Math.sin(angle) * valueRadius,
      labelX: center + Math.cos(angle) * (radius + 28),
      labelY: center + Math.sin(angle) * (radius + 28),
      gridX: center + Math.cos(angle) * radius,
      gridY: center + Math.sin(angle) * radius,
    };
  });
  const polygon = points.map((point) => `${point.x},${point.y}`).join(' ');
  const grid = [0.33, 0.66, 1].map((scale) =>
    axes
      .map((_, index) => {
        const angle = -Math.PI / 2 + (index * Math.PI * 2) / axes.length;
        return `${center + Math.cos(angle) * radius * scale},${center + Math.sin(angle) * radius * scale}`;
      })
      .join(' '),
  );

  return (
    <svg className={styles.radar} viewBox="0 0 260 260" role="img" aria-label="Spider chart de balance personal">
      {grid.map((shape) => (
        <polygon key={shape} points={shape} className={styles.radarGrid} />
      ))}
      {points.map((point) => (
        <line key={point.axis.label} x1={center} y1={center} x2={point.gridX} y2={point.gridY} className={styles.radarAxis} />
      ))}
      <polygon points={polygon} className={styles.radarShape} />
      {points.map((point) => (
        <g key={point.axis.label}>
          <circle cx={point.x} cy={point.y} r="4" className={styles.radarPoint} />
          <text x={point.labelX} y={point.labelY} textAnchor="middle" dominantBaseline="middle" className={styles.radarLabel}>
            {point.axis.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className={styles.legendItem}>
      <i data-kind={color} />
      {label}
    </span>
  );
}

function buildRadar(summary: PersonalAnalyticsSummary): { label: string; value: number }[] {
  const sleepScore = score(summary.sleep.medianHours ?? 0, 7, 8.5);
  const consistencyScore = Math.max(0, 100 - (summary.sleep.bedtimeDispersionMinutes ?? 120));
  const workScore = score(summary.work.averageBlockHours ?? 0, 3, 5);
  const trainingScore = Math.min(100, Math.round((summary.training.sessionsPerWeek / 3) * 100));
  const bodyScore = summary.body.trendVsGoal === 'favorable' ? 85 : summary.body.trendVsGoal === 'neutral' ? 60 : 35;
  const activityScore = Math.min(100, Math.round(summary.activities.totalHours / Math.max(summary.range.days, 1) * 12));

  return [
    { label: 'Sueño', value: sleepScore },
    { label: 'Ritmo', value: consistencyScore },
    { label: 'Trabajo', value: workScore },
    { label: 'Actividad', value: activityScore },
    { label: 'Entreno', value: trainingScore },
    { label: 'Peso', value: bodyScore },
  ];
}

function score(value: number, low: number, high: number): number {
  if (value <= 0) return 0;
  if (value >= low && value <= high) return 100;
  const distance = value < low ? low - value : value - high;
  return Math.max(0, Math.round(100 - distance * 35));
}

function areaLabel(area: string): string {
  const labels: Record<string, string> = {
    sleep: 'Sueño',
    work: 'Trabajo',
    activities: 'Actividades',
    training: 'Entreno',
    body: 'Peso',
    'data-quality': 'Datos',
  };
  return labels[area] ?? area;
}

function timelineTitle(day: PersonalAnalyticsSummary['timeline'][number]): string {
  return `${day.date}: sueño ${day.sleepHours}h, trabajo ${day.workHours}h, actividad ${day.activityHours}h, entreno ${day.workoutMinutes}m`;
}
