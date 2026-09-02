import { useCallback, useEffect, useRef, useState } from 'react';
import type { TouchEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import styles from '../components/feature/styles/Intro.module.css';

type IntroSlide = {
  image: string;
  imageAlt: string;
  imagePosition: string;
  eyebrow: string;
  title: string;
  description: string;
  tag: string;
  detail: string;
};

const slides: IntroSlide[] = [
  {
    image: '/images/slide3.jpg',
    imageAlt: 'کارمند انبار در حال آماده‌سازی مرسوله',
    imagePosition: 'center center',
    eyebrow: 'ارسال حرفه‌ای، از همین‌جا',
    title: 'هر مرسوله، یک قدم نزدیک‌تر به مقصد',
    description: 'ارسال‌های بین‌شهری را ساده، سریع و قابل‌پیگیری مدیریت کنید.',
    tag: 'ارسال بین‌شهری',
    detail: 'مرسوله‌ی شما آماده‌ی حرکت است',
  },
  {
    image: '/images/slide2.jpg',
    imageAlt: 'چیدمان بسته‌ها در انبار و آماده‌سازی برای ارسال',
    imagePosition: 'center center',
    eyebrow: 'همیشه در جریان باشید',
    title: 'از تحویل تا ردیابی، همه‌چیز روشن است',
    description: 'وضعیت مرسوله‌ها را در هر مرحله ببینید و با خیال راحت تصمیم بگیرید.',
    tag: 'ردیابی لحظه‌ای',
    detail: 'مسیر ارسال، شفاف و قابل‌اعتماد',
  },
  {
    image: '/images/slide1.jpg',
    imageAlt: 'پیک در حال ثبت اطلاعات یک مرسوله',
    imagePosition: 'center center',
    eyebrow: 'همراه شما تا لحظه‌ی تحویل',
    title: 'وقت شما، ارزشمندتر از انتظار است',
    description: 'مرسوله را به ما بسپارید و روی کارهای مهم‌ترتان تمرکز کنید.',
    tag: 'پشتیبانی همراه',
    detail: 'یک تجربه‌ی مطمئن برای فرستنده و گیرنده',
  },
];

const AUTO_ADVANCE_MS = 6500;

export default function Intro() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const slide = slides[currentSlide];

  const goToNextSlide = useCallback(() => {
    setCurrentSlide((previous) => (previous + 1) % slides.length);
  }, []);

  const goToPreviousSlide = useCallback(() => {
    setCurrentSlide((previous) => (previous - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return undefined;

    const timer = window.setInterval(goToNextSlide, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [goToNextSlide, isPaused]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToNextSlide();
      } else if (event.key === 'ArrowRight') {
        goToPreviousSlide();
      } else if (event.key === 'Escape') {
        setIsPaused(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextSlide, goToPreviousSlide]);

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const startX = touchStartX.current;
    touchStartX.current = null;

    if (startX === null) return;

    const endX = event.changedTouches[0]?.clientX;
    if (endX === undefined) return;

    const distance = endX - startX;
    if (Math.abs(distance) < 48) return;

    if (distance < 0) {
      goToNextSlide();
    } else {
      goToPreviousSlide();
    }
  };

  const goToLogin = () => {
    router.push('/login');
  };

  return (
    <main className={styles.page}>
      <div className={styles.pageGlow} aria-hidden="true" />

      <section
        className={styles.shell}
        aria-label="معرفی تیپاکس پونک"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <header className={styles.topbar}>
          <div className={styles.brand}>
            <span className={styles.logoBadge}>
              <Image src="/images/cube-logo-border.svg" alt="" width={30} height={30} priority />
            </span>
            <span>
              تیپاکس <strong>پونک</strong>
            </span>
          </div>

          <button type="button" className={styles.loginLink} onClick={goToLogin}>
            ورود به حساب
            <ArrowBackRoundedIcon aria-hidden="true" />
          </button>
        </header>

        <div className={styles.progressRow}>
          <span className={styles.progressLabel}>یک شروع بهتر برای ارسال</span>
          <span className={styles.counter} aria-label={`اسلاید ${currentSlide + 1} از ${slides.length}`}>
            <strong>{String(currentSlide + 1).padStart(2, '0')}</strong>
            <span>/</span>
            <span>{String(slides.length).padStart(2, '0')}</span>
          </span>
        </div>

        <div className={styles.content}>
          <div key={currentSlide} className={styles.copy} aria-live="polite">
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowDot} aria-hidden="true" />
              {slide.eyebrow}
            </div>

            <h1>{slide.title}</h1>
            <p>{slide.description}</p>

            <div className={styles.actions}>
              <button type="button" className={styles.primaryButton} onClick={goToLogin}>
                <span>شروع کنیم</span>
                <ArrowBackRoundedIcon aria-hidden="true" />
              </button>

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={goToNextSlide}
                aria-label="نمایش اسلاید بعدی"
              >
                <span className={styles.nextLabel}>بعدی</span>
                <ArrowBackRoundedIcon aria-hidden="true" />
              </button>
            </div>

            <div className={styles.trustRow}>
              <span className={styles.trustItem}>
                <VerifiedRoundedIcon aria-hidden="true" />
                ارسال مطمئن
              </span>
              <span className={styles.trustItem}>
                <LocalShippingOutlinedIcon aria-hidden="true" />
                پیگیری ساده
              </span>
            </div>
          </div>

          <div className={styles.visualColumn}>
            <div className={styles.imageFrame}>
              <Image
                key={slide.image}
                src={slide.image}
                alt={slide.imageAlt}
                fill
                priority={currentSlide === 0}
                sizes="(max-width: 820px) 100vw, 52vw"
                className={styles.image}
                style={{ objectPosition: slide.imagePosition }}
              />
              <div className={styles.imageScrim} aria-hidden="true" />

              <div className={styles.visualHeader}>
                <span className={styles.visualBrand}>
                  <LocalShippingOutlinedIcon aria-hidden="true" />
                  تیپاکس پونک
                </span>
                <span className={styles.visualNumber}>{String(currentSlide + 1).padStart(2, '0')}</span>
              </div>

              <div className={styles.floatingCard}>
                <div className={styles.cardTopline}>
                  <span>{slide.tag}</span>
                  <span className={styles.liveStatus}>
                    <i aria-hidden="true" /> فعال
                  </span>
                </div>
                <strong>{slide.detail}</strong>
                <div className={styles.miniTimeline} aria-hidden="true">
                  <span className={styles.activeStep} />
                  <span className={styles.activeStep} />
                  <span />
                </div>
              </div>
            </div>

            <div className={styles.boxesAccent} aria-hidden="true">
              <Image src="/images/boxes.png" alt="" fill sizes="100px" />
            </div>
          </div>
        </div>

        <footer className={styles.footer}>
          <div className={styles.indicators} role="tablist" aria-label="انتخاب اسلاید معرفی">
            {slides.map((item, index) => (
              <button
                key={item.image}
                type="button"
                role="tab"
                aria-selected={index === currentSlide}
                aria-label={`نمایش اسلاید ${index + 1}`}
                className={styles.indicator}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>

          <div className={styles.footerMeta}>
            <span className={styles.touchHint}>برای دیدن اسلاید بعدی لمس کنید</span>
            <button
              type="button"
              className={styles.pauseButton}
              onClick={() => setIsPaused((previous) => !previous)}
              aria-label={isPaused ? 'ادامه‌ی نمایش خودکار' : 'توقف نمایش خودکار'}
            >
              {isPaused ? <PlayArrowRoundedIcon aria-hidden="true" /> : <PauseRoundedIcon aria-hidden="true" />}
              <span>{isPaused ? 'ادامه' : 'مکث'}</span>
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}
