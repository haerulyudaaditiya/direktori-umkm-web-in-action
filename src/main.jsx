import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { OrderProvider } from './contexts/OrderContext';
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <OrderProvider>
            <App />
          </OrderProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>{' '}
  </React.StrictMode>
);
