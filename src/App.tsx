import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import { HomePage } from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          {/* More routes will be added as we build visualizers */}
          <Route path="/stack" element={<ComingSoon title="Stack" />} />
          <Route path="/queue" element={<ComingSoon title="Queue" />} />
          <Route path="/linked-list" element={<ComingSoon title="Linked List" />} />
          <Route path="/hash-table" element={<ComingSoon title="Hash Table" />} />
          <Route path="/sorting" element={<ComingSoon title="Sorting" />} />
          <Route path="/searching" element={<ComingSoon title="Searching" />} />
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
