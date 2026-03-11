import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { UploadPage } from './pages/UploadPage';
import { CandidatesPage } from './pages/CandidatesPage';
import { CandidateDetailPage } from './pages/CandidateDetailPage';
import { JobsPage } from './pages/JobsPage';
import './index.css';
import './styles/animations.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/upload" replace />} />
              <Route path="upload" element={<UploadPage />} />
              <Route path="candidates" element={<CandidatesPage />} />
              <Route path="candidates/:id" element={<CandidateDetailPage />} />
              <Route path="jobs" element={<JobsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
