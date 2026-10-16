'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { CatalogExercise } from '../types/workout.types';
import { exerciseCatalogApi } from '../services/exercise-catalog.api';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import styles from './training.module.css';

interface Props {
  catalog: CatalogExercise[];
  exerciseId?: string | null;
  name: string;
  onSelect: (exercise: CatalogExercise) => void;
  onCreated: (exercise: CatalogExercise) => void;
}

export function ExercisePicker({ catalog, exerciseId, name, onSelect, onCreated }: Props) {
  const { accessToken } = useAuth();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const key = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toLowerCase();
  const selected = catalog.find(ex => ex.id === exerciseId) ?? catalog.find(ex => ex.name === name || ex.aliases.some(alias => alias.normalize('NFD').replace(/[\u0300-\u036f]/g, '') === key));
  useEffect(() => {
    if (selected && (selected.id !== exerciseId || selected.name !== name)) onSelect(selected);
  }, [selected, exerciseId, name, onSelect]);
  const create = async () => {
    if (!newName.trim()) return;
    setSaving(true); setError(null);
    try { const exercise = await exerciseCatalogApi.create(newName.trim(), accessToken); onCreated(exercise); onSelect(exercise); setCreating(false); setNewName(''); }
    catch { setError('No se pudo guardar el ejercicio.'); } finally { setSaving(false); }
  };
  return <div className={styles.exercisePicker}>
    <select className={uiStyles.modalInput} aria-label="Ejercicio del catálogo" value={selected?.id ?? (name ? 'legacy' : '')} onChange={event => {
      if (event.target.value === 'new') { setCreating(true); return; }
      const exercise = catalog.find(ex => ex.id === event.target.value); if (exercise) onSelect(exercise);
    }}>
      <option value="" disabled>Seleccionar ejercicio</option>
      {!selected && name && <option value="legacy">{name}</option>}
      {catalog.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
      <option value="new">+ Nuevo ejercicio</option>
    </select>
    {creating && <div className={styles.exerciseCreateRow}><input className={uiStyles.modalInput} aria-label="Nombre del nuevo ejercicio" value={newName} maxLength={255} onChange={e => setNewName(e.target.value)} /><button type="button" className={uiStyles.modalPrimaryButton} disabled={saving || !newName.trim()} onClick={create}>Agregar</button><button type="button" className={uiStyles.modalCancelButton} onClick={() => setCreating(false)}>Cancelar</button></div>}
    {error && <p role="alert">{error}</p>}
  </div>;
}
