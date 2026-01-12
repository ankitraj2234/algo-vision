import { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import {
  HomePage,
  StackPage,
  QueuePage,
  LinkedListPage,
  HashTablePage,
  SortingPage,
  SearchingPage,
  GraphPage,
  AnalysisPage,
  FeedbackPage,
} from './pages';

// Loading fallback for Suspense
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/stack" element={<StackPage />} />
              <Route path="/queue" element={<QueuePage />} />
              <Route path="/linked-list" element={<LinkedListPage />} />
              <Route path="/hash-table" element={<HashTablePage />} />
              <Route path="/sorting" element={<SortingPage />} />
              <Route path="/searching" element={<SearchingPage />} />
              <Route path="/graph" element={<GraphPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
