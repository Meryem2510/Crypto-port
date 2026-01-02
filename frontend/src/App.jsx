import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import CryptoPortfolio from './CryptoPortfolio';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <CryptoPortfolio />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;