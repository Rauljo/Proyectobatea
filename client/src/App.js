import {Route, Routes} from "react-router-dom";

import './App.css';

import Navigation from "./components/Menu";
import Insercion from "./pages/Insercion";
import Visualizacion from "./pages/Visualizacion";
import VigenciaAlerts from "./pages/VigenciaAlerts";
import Login from "./pages/Login";
import ProtectedRoute from "./pages/ProtectedRoute";

import { SessionProvider } from "./context/SessionContext";
import { SelectedBateaProvider } from "./context/SelectedBateaContext";

function App() {

  return (
    <div>
      <Navigation />
      <div>
        <SessionProvider>
            {/* The SessionProvider will provide the session context to all components */}
            <SelectedBateaProvider>
              <Routes>
                <Route path="/" element={<ProtectedRoute><Insercion /></ProtectedRoute>} />
                <Route path="/login" element={<Login />} />
                <Route path="/insercion" element={<ProtectedRoute><Insercion /></ProtectedRoute>} />
                <Route path="/visualizacion" element={<ProtectedRoute><Visualizacion /></ProtectedRoute>} />
                <Route path="/alerts" element={<ProtectedRoute><VigenciaAlerts /></ProtectedRoute>} />
              </Routes>
            </SelectedBateaProvider>
        </SessionProvider>
      </div>
    </div>
  );
}


export default App;
