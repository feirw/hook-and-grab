import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Market from './pages/Market';
import Forum from './pages/Forum';
import RentABoat from './pages/RentABoat';
import Faq from './pages/Faq';
import Footer from './components/Footer';
import NavBar from './components/NavBar';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';

function AuthModals() {
  const { authModal, closeAuthModal, openLogin, openSignup } = useAuth();

  return (
    <>
      <LoginModal
        show={authModal === 'login'}
        handleClose={closeAuthModal}
        handleShowSignup={openSignup}
      />
      <SignupModal
        show={authModal === 'signup'}
        handleClose={closeAuthModal}
        handleShowLogin={openLogin}
      />
    </>
  );
}

function AppShell() {
  return (
    <div className="app-shell">
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/market" element={<Market />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/rentaboat" element={<RentABoat />} />
        <Route path="/faq" element={<Faq />} />
      </Routes>
      <Footer />
      <AuthModals />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
