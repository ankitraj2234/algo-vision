import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import { HomePage, StackPage, QueuePage, LinkedListPage, HashTablePage, SortingPage, SearchingPage } from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/stack" element={<StackPage />} />
          <Route path="/queue" element={<QueuePage />} />
          <Route path="/linked-list" element={<LinkedListPage />} />
          <Route path="/hash-table" element={<HashTablePage />} />
          <Route path="/sorting" element={<SortingPage />} />
          <Route path="/searching" element={<SearchingPage />} />
          <Route path="/graph" element={<ComingSoon title="Graph" />} />
          <Route path="/analysis" element={<ComingSoon title="Analysis" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// Temporary placeholder for pages under development
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gradient mb-4">{title}</h1>
        <p className="text-slate-600 dark:text-slate-400">
          This visualizer is coming soon!
        </p>
      </div>
    </div>
  );
}

export default App;
