import { useState } from 'react';
import Link from 'next/link';
import { PersonalAnalyticsSummary } from '../types/analytics.types';
import styles from './analytics.module.css';

interface AnalyticsViewProps {
  summary: PersonalAnalyticsSummary;
  range: '30d' | '90d';
  onRangeChange: (range: '30d' | '90d') => void;
}

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const PERIODS = { morning: 'Mañana', afternoon: 'Tarde', night: 'Noche' };
const displayHours = (value: number | null) => value === null ? 'Sin registro' : `${value.toFixed(2)} h`;

export function AnalyticsView({ summary, range, onRangeChange }: AnalyticsViewProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const selectedDay = summary.timeline.find((day) => day.date === selectedDate) ?? summary.timeline.at(-1);
  const maxHours = Math.max(1, ...summary.timeline.flatMap((day) => [day.sleepHours ?? 0, day.workHours ?? 0, day.activityHours ?? 0, (day.workoutMinutes ?? 0) / 60]));
  const changeMinutes = summary.comparison.sleepChangeHours === null ? null : Math.round(summary.comparison.sleepChangeHours * 60);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>BI personal</p>
          <h1 className={styles.title}>Tus hábitos</h1>
          <p className={styles.subtitle}>{summary.range.from} · {summary.range.to}</p>
        </div>
        <div className={styles.segmentedControl} role="group" aria-label="Periodo">
          {(['30d', '90d'] as const).map((period) => (
            <button key={period} type="button" aria-pressed={range === period} data-active={range === period} onClick={() => onRangeChange(period)}>
              {period === '30d' ? '30 días' : '90 días'}
            </button>
          ))}
        </div>
      </header>

      <section className={styles.kpiGrid} aria-label="Resumen del periodo">
        <Kpi label="Sueño principal" value={displayHours(summary.sleep.averageHours)} note={`${summary.sleep.days}/${summary.range.days} fechas registradas`} />
        <Kpi label="Trabajo registrado" value={summary.work.hasData ? `${summary.work.totalHours.toFixed(1)} h` : 'Sin registro'} note={`${summary.work.days} días · ${summary.work.samples} bloques`} />
        <Kpi label="Horas etiquetadas" value={`${summary.activities.totalHours.toFixed(1)} h`} note="Incluyen trabajo en su categoría" />
        <Kpi label="Días de entrenamiento" value={`${summary.training.activeDays}`} note={`${summary.training.sessions} sesiones · ${summary.training.sessionsPerWeek}/semana`} />
        <Kpi label="Último peso" value={summary.body.currentWeightKg === null ? 'Sin registro' : `${summary.body.currentWeightKg} kg`} note={summary.body.measurementAgeDays === null ? 'Sin mediciones en el periodo' : `Hace ${summary.body.measurementAgeDays} días`} />
      </section>

      <section className={styles.mainGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}><h2 className={styles.panelTitle}>Sueño y regularidad</h2><Link href="/actividades">Registrar</Link></div>
          {summary.sleep.hasData ? (
            <>
              <p className={styles.featureValue}>{displayHours(summary.sleep.averageHours)} <span>por bloque principal</span></p>
              <p className={styles.subtitle}>{changeMinutes === null ? 'Todavía no hay al menos 7 fechas en ambos periodos para comparar.' : `${Math.abs(changeMinutes)} minutos ${changeMinutes < 0 ? 'menos' : 'más'} que en el periodo anterior.`}</p>
              <p className={styles.dataMessage}>Comparación: {summary.comparison.from} · {summary.comparison.to}; {summary.comparison.sleepDays} fechas registradas.</p>
              {summary.comparison.bedtimeDispersionChangeMinutes !== null && <p className={styles.subtitle}>{Math.abs(summary.comparison.bedtimeDispersionChangeMinutes)} minutos {summary.comparison.bedtimeDispersionChangeMinutes < 0 ? 'menos' : 'más'} de variación al comenzar que en el periodo anterior.</p>}
              <dl className={styles.metrics}>
                <div><dt>Inicio mediano</dt><dd>{summary.sleep.medianBedtime ?? 'Sin registro'}</dd></div>
                <div><dt>Fin mediano</dt><dd>{summary.sleep.medianWakeTime ?? 'Sin registro'}</dd></div>
                <div><dt>Variación al comenzar</dt><dd>{summary.sleep.bedtimeDispersionMinutes ?? '—'} min</dd></div>
                <div><dt>Bloques secundarios</dt><dd>{summary.sleep.secondarySamples} · {summary.sleep.secondaryHours} h</dd></div>
              </dl>
              <p className={styles.dataMessage}>Principal: el bloque más largo de cada fecha registrada. Los bloques secundarios se muestran por separado; la duración no mide la calidad del descanso.</p>
            </>
          ) : <p className={styles.dataMessage}>Sin bloques completos de sueño en este periodo.</p>}
        </div>
        <div className={styles.panel}>
          <div className={styles.panelHeader}><h2 className={styles.panelTitle}>Tu jornada de trabajo</h2><Link href="/actividades">Registrar</Link></div>
          {summary.work.hasData ? (
            <>
              <p className={styles.featureValue}>{displayHours(summary.work.averageDayHours)} <span>por día registrado</span></p>
              <p className={styles.subtitle}>{summary.work.multiBlockDays} de {summary.work.days} días tienen varios bloques. {summary.work.weekendDays} fechas de fin de semana con trabajo.</p>
              <dl className={styles.metrics}><div><dt>Primer inicio mediano</dt><dd>{summary.work.medianStartTime}</dd></div><div><dt>Último fin mediano</dt><dd>{summary.work.medianEndTime}</dd></div></dl>
              <div className={styles.blockList}>{summary.work.blocks.map((block) => <div key={block.period}><strong>{PERIODS[block.period]}</strong><span>{block.startTime} · {block.endTime}</span><small>{block.samples} bloques</small></div>)}</div>
              <p className={styles.dataMessage}>Medianas por grupo de inicio, con pausas entre bloques. Programación y Trabajo se cuentan juntos; las horas no miden ingresos ni rendimiento.</p>
            </>
          ) : <p className={styles.dataMessage}>Sin bloques completos de trabajo en este periodo.</p>}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}><h2 className={styles.panelTitle}>Lo que muestran tus registros</h2><span className={styles.panelNote}>{summary.insights.filter((insight) => insight.area !== 'data-quality').length} observaciones</span></div>
        <div className={styles.insightList}>
          {summary.insights.filter((insight) => insight.area !== 'data-quality').map((insight) => <article key={insight.id} className={styles.insight} data-severity={insight.severity}><span>{areaLabel(insight.area)}</span><strong>{insight.title}</strong><p>{insight.detail}</p></article>)}
          {!summary.insights.length && <p className={styles.dataMessage}>Todavía no hay datos para comparar tus hábitos en este periodo.</p>}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}><h2 className={styles.panelTitle}>Registro diario</h2><span className={styles.panelNote}>Horas por fecha</span></div>
        <div className={styles.timeline}>
          {summary.timeline.map((day) => (
            <button key={day.date} type="button" className={styles.timelineDay} aria-label={`${day.date}: sueño ${displayHours(day.sleepHours)}, trabajo ${displayHours(day.workHours)}`} aria-pressed={selectedDay?.date === day.date} data-active={selectedDay?.date === day.date} onClick={() => setSelectedDate(day.date)}>
              {([['sleep', day.sleepHours], ['work', day.workHours], ['activity', day.activityHours], ['training', day.workoutMinutes === null ? null : day.workoutMinutes / 60]] as const).map(([kind, hours]) => <span key={kind} style={{ height: `${((hours ?? 0) / maxHours) * 100}%` }} data-kind={kind} />)}
            </button>
          ))}
        </div>
        <div className={styles.legend}><Legend color="sleep" label="Sueño principal" /><Legend color="work" label="Trabajo" /><Legend color="activity" label="Actividades (tiempo único)" /><Legend color="training" label="Entrenamiento" /></div>
        {selectedDay && <div className={styles.dayDetail} aria-live="polite"><strong>{selectedDay.date}</strong><span>Sueño: {displayHours(selectedDay.sleepHours)}</span><span>Trabajo: {displayHours(selectedDay.workHours)}</span><span>Actividades: {displayHours(selectedDay.activityHours)}</span><span>Entreno: {selectedDay.workoutMinutes === null ? 'Sin duración registrada' : `${selectedDay.workoutMinutes} min`}</span></div>}
        <p className={styles.dataMessage}>Sin registro no significa descanso ni cero actividad. Trabajo forma parte de las actividades; los totales de módulos no se suman.</p>
      </section>

      <section className={styles.detailGrid}>
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Categorías y actividades</h2>
          <div className={styles.categoryList}>
            {summary.activities.categories.map((category) => (
              <article key={category.categoryId} className={styles.categoryBlock}>
                <div className={styles.categoryRow}><div><strong>{category.name}</strong><span>{category.totalHours} h · {category.activeDays} días activos</span></div><div className={styles.categoryBar}><span style={{ transform: `scaleX(${category.sharePercent / 100})`, background: category.color }} /></div><em>{category.sharePercent}%</em></div>
                {category.dataMessage && <p className={styles.dataMessage}>{category.dataMessage}</p>}
                <div className={styles.activityList}>{category.activities.filter((activity) => activity.totalHours > 0).map((activity) => <ActivityRow key={activity.activityId} activity={activity} />)}</div>
                {category.activities.some((activity) => activity.totalHours <= 0) && <details className={styles.missingActivities}><summary>{category.activities.filter((activity) => activity.totalHours <= 0).length} actividades sin registros en el periodo</summary><div className={styles.activityList}>{category.activities.filter((activity) => activity.totalHours <= 0).map((activity) => <ActivityRow key={activity.activityId} activity={activity} />)}</div></details>}
              </article>
            ))}
          </div>
        </div>
        <div className={styles.panel}>
          <div className={styles.panelHeader}><h2 className={styles.panelTitle}>Entrenamiento por semana</h2><Link href="/salud/entrenamientos">Registrar</Link></div>
          <div className={styles.weekList}>{summary.training.weeklyDays.map((week) => <div key={week.week}><span>Desde {week.week}{!week.complete && <small>Periodo parcial</small>}</span><strong>{week.days} días</strong><meter min={0} max={7} value={week.days} aria-label={`Días de entrenamiento desde ${week.week}`} /></div>)}</div>
          <h2 className={styles.panelTitle}>Sueño por día de la semana</h2>
          <div className={styles.weekdayGrid}>{summary.sleep.weekdayAverages.map((day) => <div key={day.weekday} className={styles.weekdayCell}><span>{WEEKDAYS[day.weekday]}</span><strong>{day.averageHours} h</strong><em>{day.samples} fechas</em></div>)}</div>
        </div>
      </section>
      {summary.dataQuality.warnings.length > 0 && <section className={styles.panel}><h2 className={styles.panelTitle}>Datos por revisar</h2><div className={styles.insightList}>{summary.dataQuality.warnings.map((warning) => <article key={warning.id} className={styles.insight}><span>Registros</span><strong>{warning.title}</strong><p>{warning.detail}</p></article>)}</div></section>}
    </div>
  );
}

function Kpi({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className={styles.kpi}><span>{label}</span><strong>{value}</strong><em>{note}</em></div>;
}
function ActivityRow({ activity }: { activity: PersonalAnalyticsSummary['activities']['categories'][number]['activities'][number] }) {
  return <div className={styles.activityRow} data-low-signal={!activity.hasEnoughData}><div><strong>{activity.name}</strong><span>{activity.totalHours} h · {activity.activeDays} días · {activity.sharePercent}% de la categoría</span></div><em>{activity.dataMessage ?? `${activity.avgHoursPerActiveDay} h/día activo`}</em></div>;
}
function Legend({ color, label }: { color: string; label: string }) {
  return <span className={styles.legendItem}><i data-kind={color} />{label}</span>;
}
function areaLabel(area: string): string {
  return ({ sleep: 'Sueño', work: 'Trabajo', activities: 'Actividades', training: 'Entreno', body: 'Peso', 'data-quality': 'Registros' } as Record<string, string>)[area] ?? area;
}
