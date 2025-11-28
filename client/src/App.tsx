import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import SocialPage from './pages/SocialPage';
import AdminDashboard from './pages/AdminDashboard';
import NotificationsPage from './pages/NotificationsPage';
import RequestInvite from './pages/RequestInvite';
import LandingPage from './pages/LandingPage';
import SrtLogPage from './pages/SrtLogPage';
import PostPage from './pages/PostPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AchievementPopup from './components/AchievementPopup';
import LoadingScreen from './components/LoadingScreen';
import WelcomeTour from './components/WelcomeTour';

function AppRoutes() {
  const { user, clearAchievement, achievement, loading } = useAuth();
  const location = useLocation();
  const isSRT = user ? user.membershipType === 'SRT' : (location.state?.membershipType === 'SRT' || localStorage.getItem('lastMembershipType') === 'SRT');

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {isSRT ? (
        <div className="fixed inset-0 bg-black z-[-1]" />
      ) : (
        <>
          <div className="global-bg" />
          <div className="gold-flow" />
          <div className="animated-fog" />
          <div className="bg-pattern" />
        </>
      )}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/request-invite" element={<RequestInvite />} />
        <Route path="/feed" element={<PrivateRoute><FeedPage /></PrivateRoute>} />
        <Route path="/post/:id" element={<PrivateRoute><PostPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
        <Route path="/social" element={<PrivateRoute><SocialPage /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/srt-log" element={<PrivateRoute><SrtLogPage /></PrivateRoute>} />
      </Routes>
      {achievement && (
        <AchievementPopup
          title={achievement.title}
          description={achievement.description}
          onClose={clearAchievement}
        />
      )}
      <WelcomeTour />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
