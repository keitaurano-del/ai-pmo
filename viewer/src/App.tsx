import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './routes/Dashboard';
import WBS from './routes/WBS';
import Schedule from './routes/Schedule';
import Issues from './routes/Issues';
import Risks from './routes/Risks';
import Decisions from './routes/Decisions';
import Meetings from './routes/Meetings';
import Reports from './routes/Reports';
import Charter from './routes/Charter';
import DocumentDetail from './routes/DocumentDetail';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="/wbs" element={<WBS />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/issues" element={<Issues />} />
        <Route path="/risks" element={<Risks />} />
        <Route path="/decisions" element={<Decisions />} />
        <Route path="/meetings" element={<Meetings />} />
        <Route path="/meetings/:slug" element={<DocumentDetail kind="meeting" />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/:slug" element={<DocumentDetail kind="report" />} />
        <Route path="/charter" element={<Charter />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
