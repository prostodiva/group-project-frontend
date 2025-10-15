import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TripPage from './pages/TripPage';
import DashboardPage from './pages/DashboardPage';
import TestAdminCRUD from './components/TestAdminCRUD';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/home" element={<HomePage />} />
      <Route path="/trip" element={<TripPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/admin-test" element={<TestAdminCRUD />} />
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
