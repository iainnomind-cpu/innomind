import LandingPage from './components/landing/LandingPage';
import { ModalProvider } from './context/ModalContext';
import FreeTrialModal from './components/ui/FreeTrialModal';

function App() {
  return (
    <ModalProvider>
      <LandingPage />
      <FreeTrialModal />
    </ModalProvider>
  );
}

export default App;
