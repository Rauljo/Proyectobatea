import {Route, Routes} from "react-router-dom";

import './App.css';

import Navigation from "./components/Menu";
import Insercion from "./pages/Insercion";
import Visualizacion from "./pages/Visualizacion";
import VigenciaAlerts from "./pages/VigenciaAlerts";
import Login from "./pages/Login";
import ProtectedRoute from "./pages/ProtectedRoute";

function App() {

  return (
    <div>
      <Navigation />
      <div>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Insercion /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/insercion" element={<ProtectedRoute><Insercion /></ProtectedRoute>} />
            <Route path="/visualizacion" element={<ProtectedRoute><Visualizacion /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><VigenciaAlerts /></ProtectedRoute>} />
          </Routes>
      </div>
    </div>
  );
}


export default App;
