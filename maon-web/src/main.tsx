import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';   // ← add
import Layout from './components/Layout';           // ← already there
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>      {/* ← add opening tag */}
      <Layout>
        <App />
      </Layout>
    </BrowserRouter>     {/* ← add closing tag */}
  </StrictMode>,
);
