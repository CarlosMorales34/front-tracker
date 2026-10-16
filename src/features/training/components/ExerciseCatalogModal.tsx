'use client';

import { useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { Modal } from '../../../shared/components/ui/Modal';
import { useConfirm } from '../../../shared/components/ui/ConfirmProvider';
import uiStyles from '../../../shared/components/ui/ui.module.css';
import { CatalogExercise } from '../types/workout.types';
import { exerciseCatalogApi } from '../services/exercise-catalog.api';
import { exerciseAliasFamily } from '../utils/exercise-alias-candidates';
import styles from './training.module.css';

interface Props { catalog: CatalogExercise[]; onClose: () => void; onChanged: () => Promise<void>; }

export function ExerciseCatalogModal({ catalog, onClose, onChanged }: Props) {
  const { accessToken } = useAuth();
  const confirm = useConfirm();
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [targetId, setTargetId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selected = catalog.find(ex => ex.id === id);
  const target = catalog.find(ex => ex.id === targetId);
  const family = selected ? exerciseAliasFamily(selected.name) : null;
  const candidates = family ? catalog.filter(ex => ex.id !== id && exerciseAliasFamily(ex.name) === family) : [];
  const run = async (operation: () => Promise<void>) => {
    setSaving(true); setError(null);
    try { await operation(); await onChanged(); }
    catch (error) { setError(error instanceof Error ? error.message : 'No se pudo guardar.'); }
    finally { setSaving(false); }
  };
  const merge = async () => {
    if (!selected || !target) return;
    if (!await confirm({ title: 'Unificar ejercicios', confirmLabel: 'Unificar', message: `Unificar "${selected.name}" con "${target.name}". Se conservan todos los registros y sus cargas, series y repeticiones. ¿Son el mismo ejercicio y variante?` })) return;
    await run(async () => { await exerciseCatalogApi.merge(id, targetId, accessToken); setId(targetId); setName(target.name); setTargetId(''); });
  };
  return <Modal title="Catálogo de ejercicios" onClose={onClose}>
    <div className={uiStyles.modalForm}>
      <label className={uiStyles.modalLabel}>Ejercicio<select aria-label="Ejercicio" className={uiStyles.modalInput} value={id} onChange={event => {
        const exercise = catalog.find(ex => ex.id === event.target.value); setId(event.target.value); setName(exercise?.name ?? ''); setTargetId('');
      }}><option value="">Seleccionar ejercicio</option>{catalog.map(ex => <option key={ex.id} value={ex.id}>{ex.name} · {ex.recordCount} registros</option>)}</select></label>
      {selected && <>
        <label className={uiStyles.modalLabel}>Nombre único<input className={uiStyles.modalInput} maxLength={255} value={name} onChange={e => setName(e.target.value)} /></label>
        <button type="button" className={uiStyles.modalPrimaryButton} disabled={saving || !name.trim() || name === selected.name} onClick={() => run(() => exerciseCatalogApi.rename(id, name, accessToken))}>Guardar nombre</button>
        <p className={uiStyles.cardNote}>Otros nombres reconocidos: {selected.aliases.join(', ') || selected.name}.</p>
        {candidates.length > 0 && <label className={uiStyles.modalLabel}>Nombres posiblemente equivalentes<select className={uiStyles.modalInput} value={targetId} onChange={e => setTargetId(e.target.value)}><option value="">Revisar equivalencia</option>{candidates.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}</select></label>}
        <label className={uiStyles.modalLabel}>Es el mismo ejercicio que<select className={uiStyles.modalInput} value={targetId} onChange={e => setTargetId(e.target.value)}><option value="">Elegir nombre a conservar</option>{catalog.filter(ex => ex.id !== id).map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}</select></label>
        {target && <p className={uiStyles.cardNote}>Quedarán {selected.recordCount + target.recordCount} registros bajo «{target.name}». Los nombres anteriores seguirán reconocidos.</p>}
        <button type="button" className={uiStyles.modalPrimaryButton} disabled={saving || !target} onClick={merge}>Unificar historial</button>
      </>}
      {error && <p role="alert">{error}</p>}
      <div className={`${uiStyles.modalActions} ${styles.trainingModalActions}`}><button type="button" className={uiStyles.modalCancelButton} onClick={onClose}>Cerrar</button></div>
    </div>
  </Modal>;
}
