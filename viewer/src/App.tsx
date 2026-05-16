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
import Methodology from './routes/Methodology';
import Operations from './routes/Operations';
import Upload from './routes/Upload';
import { DEFAULT_CASE } from './lib/data';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to={`/${DEFAULT_CASE}`} replace />} />
        <Route path="/methodology" element={<Methodology />} />
        <Route path="/operations" element={<Operations />} />
        <Route path=":caseSlug" element={<Dashboard />} />
        <Route path=":caseSlug/wbs" element={<WBS />} />
        <Route path=":caseSlug/schedule" element={<Schedule />} />
        <Route path=":caseSlug/issues" element={<Issues />} />
        <Route path=":caseSlug/risks" element={<Risks />} />
        <Route path=":caseSlug/decisions" element={<Decisions />} />
        <Route path=":caseSlug/meetings" element={<Meetings />} />
        <Route path=":caseSlug/meetings/:slug" element={<DocumentDetail kind="meeting" />} />
        <Route path=":caseSlug/reports" element={<Reports />} />
        <Route path=":caseSlug/reports/:slug" element={<DocumentDetail kind="report" />} />
        <Route path=":caseSlug/charter" element={<Charter />} />
        <Route path=":caseSlug/upload" element={<Upload />} />
        <Route path="*" element={<Navigate to={`/${DEFAULT_CASE}`} replace />} />
      </Route>
    </Routes>
  );
}
