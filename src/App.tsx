import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Dashboard from './pages/Dashboard';
import QuestionBank from './pages/questions';
import EssayGrader from './pages/essay';
import Schedule from './pages/schedule';
import Assistant from './pages/assistant';
import VideoLessons from './pages/videos';
import DashboardHome from './pages/DashboardHome';
import Notebook from './pages/notebook';
import LandingPage from './pages/landing';
import AdminDashboard from './pages/admin';
import Checkout from './pages/checkout';
import ThankYou from './pages/checkout/thank-you';
import RenewPage from './pages/renew';
import PlansPage from './pages/plans';
import { AccessGuard } from './components/AccessGuard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/renew" element={<RenewPage />} />

        {/* Admin Route - Self Protected */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Protected Routes */}
        <Route element={<AccessGuard />}>


          <Route path="/app" element={<Dashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="questions" element={<QuestionBank />} />
            <Route path="essay" element={<EssayGrader />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="videos" element={<VideoLessons />} />
            <Route path="assistant" element={<Assistant />} />
            <Route path="notebook" element={<Notebook />} />
            <Route path="plans" element={<PlansPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
