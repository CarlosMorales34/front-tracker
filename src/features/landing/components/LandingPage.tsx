import Link from 'next/link';
import {
  CalendarCheckIcon,
  ChecklistIcon,
  CompassIcon,
  ReceiptIcon,
  ScaleIcon,
  WalletIcon,
} from '../../../shared/components/icons/icons';
import { ThemeToggle } from '../../../shared/theme/ThemeToggle';
import styles from './landing.module.css';

const STATS = [
  { value: '5', label: 'Áreas que mides' },
  { value: '52', label: 'Semanas de contexto real' },
  { value: '0', label: 'Frases motivacionales vacías' },
  { value: '3 min', label: 'Al día para registrar todo' },
];

const FEATURES = [
  {
    icon: ChecklistIcon,
    title: 'Actividades diarias',
    description:
      'Registras por categoría y actividad, no por intención. Lo que no se mide se olvida — el simple hecho de anotarlo cambia cómo lo usas.',
  },
  {
    icon: CalendarCheckIcon,
    title: 'Registro semanal',
    description:
      'Ves 52 semanas, no un solo día. El sesgo de recencia se combate con contexto: un mal día pesa poco frente al patrón del año.',
  },
  {
    icon: WalletIcon,
    title: 'Finanzas semanales/quincenales',
    description:
      'Periodos cortos hacen tangible lo que un balance mensual vuelve abstracto — así decides con datos frescos, no con promedios lejanos.',
  },
  {
    icon: ReceiptIcon,
    title: 'Gastos diarios',
    description:
      'El gasto hormiga se reduce solo con anotarlo: la fricción de registrar interrumpe el impulso antes de que se repita.',
  },
  {
    icon: ScaleIcon,
    title: 'Peso mensual/anual',
    description: 'Una cifra al mes, no obsesión diaria: menos ruido de variación normal, más foco en la tendencia real.',
  },
];

export function LandingPage() {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>
            <CompassIcon width={20} height={20} />
          </span>
          <span className={styles.brandName}>Bienestar Integral</span>
        </div>
        <div className={styles.navActions}>
          <ThemeToggle />
          <Link href="/login" className={styles.ghostButton}>
            Iniciar sesión
          </Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <span className={styles.kicker}>Basado en neurociencia conductual</span>
        <h1 className={styles.heroTitle}>Mide lo que de verdad mueve tu progreso.</h1>
        <p className={styles.heroSubtitle}>
          Sin frases motivacionales. Cinco registros — tiempo, semanas, dinero, gasto y peso — diseñados con los
          mismos principios que usan la psicología y la neurociencia para cambiar comportamiento: fricción, contexto
          y retroalimentación real.
        </p>
        <div className={styles.heroActions}>
          <Link href="/register" className={styles.primaryButton}>
            Crear cuenta gratis
          </Link>
          <a href="#piezas" className={styles.secondaryButton}>
            Ver cómo funciona
          </a>
        </div>
      </section>

      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className={styles.statValue}>{stat.value}</p>
              <p className={styles.statLabel}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="piezas" className={styles.featuresSection}>
        <span className={styles.kicker}>Las cinco piezas</span>
        <div className={styles.featureList}>
          {FEATURES.map((feature) => (
            <div key={feature.title} className={styles.featureRow}>
              <feature.icon width={24} height={24} className={styles.featureIcon} />
              <div className={styles.featureContent}>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.quoteSection}>
        <blockquote className={styles.quote}>
          No se cambia lo que no se ve. Este es el lugar donde tu progreso deja de ser una sensación y se vuelve un
          dato.
        </blockquote>
      </section>

      <div className={styles.divider} />

      <section className={styles.ctaSection}>
        <h3 className={styles.ctaTitle}>Empieza a medirte hoy</h3>
        <p className={styles.ctaSubtitle}>Crea tu cuenta en menos de un minuto. Sin tarjeta, sin compromiso — solo tú y tus datos.</p>
        <div className={styles.ctaActions}>
          <Link href="/register" className={styles.primaryButton}>
            Crear cuenta gratis
          </Link>
          <Link href="/login" className={styles.ghostButtonLarge}>
            Ya tengo cuenta — iniciar sesión
          </Link>
        </div>
      </section>

      <footer className={styles.footer}>Bienestar Integral — tu progreso, medido.</footer>
    </div>
  );
}
