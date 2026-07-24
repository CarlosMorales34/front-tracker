'use client';

import { FormEvent, useState } from 'react';
import { CreateMetricInput, MetricUnit } from '../types/metric.types';

const UNITS: MetricUnit[] = ['kg', 'lb', 'cm', 'min', 'reps', 'count', 'percent', 'custom'];

interface MetricFormProps {
  onSubmit: (input: CreateMetricInput) => Promise<void>;
}

export function MetricForm({ onSubmit }: MetricFormProps) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<MetricUnit>('kg');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ name, unit });
      setName('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Nombre de la métrica (ej. Peso)"
      />
      <select value={unit} onChange={(event) => setUnit(event.target.value as MetricUnit)}>
        {UNITS.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      <button type="submit" disabled={isSubmitting}>
        Agregar
      </button>
    </form>
  );
}
