import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
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
          <Route path="/graph" element={<GraphPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
