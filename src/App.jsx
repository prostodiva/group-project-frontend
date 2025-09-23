import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TripPage from './pages/TripPage';
import LoginPage from './pages/LoginPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/trip" element={<TripPage />} />
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
