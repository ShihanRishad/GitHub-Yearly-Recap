import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@/components/theme-provider';
import App from './App';
import './index.css';

// global screen variables
window.screenWidth = window.innerWidth;
window.screenHeight = window.innerHeight;

window.addEventListener('resize', () => {
  window.screenWidth = window.innerWidth;
  window.screenHeight = window.innerHeight;
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
