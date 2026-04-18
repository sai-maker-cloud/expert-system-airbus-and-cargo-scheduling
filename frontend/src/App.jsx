import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Flights from './pages/Flights';
import Aircraft from './pages/Aircraft';
import Crew from './pages/Crew';
import Cargo from './pages/Cargo';
import AgentPanel from './pages/AgentPanel';
import RuleEditor from './pages/RuleEditor';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f1923',
            color: '#e2e8f0',
            border: '1px solid #1e3a5f',
            borderRadius: '8px',
          },
          success: { iconTheme: { primary: '#00d4ff', secondary: '#0f1923' } },
          error: { iconTheme: { primary: '#ff4757', secondary: '#0f1923' } },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="flights" element={<Flights />} />
          <Route path="aircraft" element={<Aircraft />} />
          <Route path="crew" element={<Crew />} />
          <Route path="cargo" element={<Cargo />} />
          <Route path="agent" element={<AgentPanel />} />
          <Route path="rules" element={<RuleEditor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
