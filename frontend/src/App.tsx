import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { UploadPage } from './pages/UploadPage';
import { CandidatesPage } from './pages/CandidatesPage';
import { CandidateDetailPage } from './pages/CandidateDetailPage';
import { JobsPage } from './pages/JobsPage';
import './index.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/upload" replace />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="candidates" element={<CandidatesPage />} />
            <Route path="candidates/:id" element={<CandidateDetailPage />} />
            <Route path="jobs" element={<JobsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
