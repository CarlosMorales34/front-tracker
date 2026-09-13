import uiStyles from '../../../shared/components/ui/ui.module.css';
import styles from './finance.module.css';

interface NetWorthCardProps {
  netWorth: number;
  currencySymbol: string;
}

// Patrimonio neto = liquidez - deuda. A propósito NUNCA suma crédito
// disponible (ver CapitalSection -- el crédito es capacidad de
// endeudarte, no capital propio).
export function NetWorthCard({ netWorth, currencySymbol }: NetWorthCardProps) {
  return (
    <div className={styles.netWorthCard}>
      <p className={uiStyles.cardLabel} style={{ color: 'inherit', opacity: 0.85 }}>
        Patrimonio financiero neto
      </p>
      <p className={styles.netWorthValue}>
        {currencySymbol}
        {netWorth.toLocaleString('es-MX')}
      </p>
    </div>
  );
}
