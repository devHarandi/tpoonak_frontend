import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

/** پنجره‌ی زمانی تقریبی جمع‌آوری، از لحظه‌ی تأیید توسط حمل‌کننده. */
export const PICKUP_WINDOW_HOURS = 3;

const toDigits = (n: number) => String(n).padStart(2, '0');

/** ثانیه‌های باقی‌مانده تا پایان پنجره؛ اگر گذشته باشد صفر. */
const remainingSeconds = (collectedAt: string): number => {
  const start = new Date(collectedAt).getTime();
  if (Number.isNaN(start)) return 0;
  const deadline = start + PICKUP_WINDOW_HOURS * 60 * 60 * 1000;
  return Math.max(0, Math.floor((deadline - Date.now()) / 1000));
};

interface Props {
  /** مقدار collected_at سفارش (زمان تأیید جمع‌آوری). */
  collectedAt: string | null;
}

/**
 * شمارش معکوس ۳ ساعته که به محض تأیید جمع‌آوری توسط حمل‌کننده شروع می‌شود
 * و زمان تقریبی جمع‌آوری را به مشتری نشان می‌دهد.
 */
export default function PickupCountdown({ collectedAt }: Props) {
  const [secondsLeft, setSecondsLeft] = useState<number>(() =>
    collectedAt ? remainingSeconds(collectedAt) : 0
  );

  useEffect(() => {
    if (!collectedAt) return;

    // مقدار اولیه را دوباره حساب می‌کنیم تا اگر تب مدتی در پس‌زمینه بوده،
    // بعد از برگشتن عدد درست نشان داده شود.
    setSecondsLeft(remainingSeconds(collectedAt));

    const timer = setInterval(() => {
      setSecondsLeft(remainingSeconds(collectedAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [collectedAt]);

  if (!collectedAt) return null;

  const isOver = secondsLeft <= 0;
  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  return (
    <Box
      sx={{
        mt: 1,
        mb: 2,
        px: 2,
        py: 1.5,
        borderRadius: '16px',
        backgroundColor: isOver ? '#FFF4E5' : '#E8F5E9',
        border: `1px solid ${isOver ? '#FFB74D' : '#66BB6A'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        direction: 'rtl',
      }}
    >
      <Typography
        sx={{
          fontSize: '13px',
          fontFamily: 'IranYekan, sans-serif',
          color: isOver ? '#8a5300' : '#1b5e20',
        }}
      >
        زمان تقریبی جمع‌آوری
      </Typography>
      <Typography
        sx={{
          fontSize: '18px',
          fontWeight: 'bold',
          fontFamily: 'monospace',
          direction: 'ltr',
          color: isOver ? '#8a5300' : '#1b5e20',
        }}
      >
        {isOver
          ? 'در حال جمع‌آوری'
          : `${toDigits(hours)}:${toDigits(minutes)}:${toDigits(seconds)}`}
      </Typography>
    </Box>
  );
}
