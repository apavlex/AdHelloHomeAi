import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import AeoLandingPage from './AeoLandingPage.tsx';
import './index.css';

const path = window.location.pathname;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {path === '/aeo' ? <AeoLandingPage /> : <App />}
  </StrictMode>,
);
