import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TripPage from './pages/TripPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SummaryPage from './pages/SummaryPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/trip" element={<TripPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/summary" element={<SummaryPage  />} />
    </Routes>
  );
}

function App() {
  return (
    <>
      <AppRoutes />
    </>
  );
}

export default App;
