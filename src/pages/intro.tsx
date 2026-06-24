import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import AppFrame from '../components/common/AppFrame';
import SlideButton from '../components/common/SlideButton';
import Indicator from '../components/common/Indicator';
import { useRouter } from 'next/navigation';

const slides = [
  {
    image: '/images/slide1.jpg',
    title: 'تیپاکس پونک',
    description: 'سیستم حمل و نقل بین شهری',
  },
  {
    image: '/images/slide2.jpg',
    title: 'تیپاکس پونک',
    description: 'سیستم حمل و نقل بین شهری',
  },
  {
    image: '/images/slide3.jpg',
    title: 'تیپاکس پونک',
    description: 'سیستم حمل و نقل بین شهری',
  },
];

const SlideContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  transition: 'opacity 0.5s ease-in-out',
}));

export default function Intro() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  // تغییر خودکار اسلاید هر 5 ثانیه
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // رفتن به اسلاید بعدی با کلیک دکمه
  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const goToLogin = () => {
    router.push('/login')
  };

  const Container = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
  });

  return (
        <SlideContainer
          sx={{
            backgroundImage: `url(${slides[currentSlide].image})`,
            opacity: 1,
            direction: 'rtl',
          }}
          onClick={goToLogin}
        >
          {/* تایتل و توضیحات در وسط */}
          <Box
            sx={{
              textAlign: 'right',
              color: '#D1D1D1'
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 'bold',
                mb: 2,
              }}
            >
              {slides[currentSlide].title}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: '1.4rem',
                lineHeight: 1.6,
                color: '#D1D1D1'
              }}
            >
              {slides[currentSlide].description}
            </Typography>
          </Box>

          {/* نشانگرهای اسلاید در بالا */}
          <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: '50px' }}>
            <Container>
              {slides.map((_, index) => (
                <Indicator key={index} active={index === currentSlide} />
              ))}
            </Container>
          </Stack>

          {/* دکمه در پایین */}
          <Box  onClick={handleNextSlide} sx={{ position: 'absolute', bottom: '40px', width: '100%', textAlign: 'center' }}>
            <SlideButton text="شروع با تیپاکس پونک" />
          </Box>
        </SlideContainer>
  );
}