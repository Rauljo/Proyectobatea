import {Route, Routes} from "react-router-dom";

import './App.css';

import Navigation from "./components/Menu";
import Insercion from "./pages/Insercion";
import Visualizacion from "./pages/Visualizacion";
import VigenciaAlerts from "./pages/VigenciaAlerts";


function App() {
  return (
    <div>
      <Navigation />
      <div>
          <Routes>
            <Route path="/" element={<Insercion />} />
            <Route path="/insercion" element={<Insercion />} />
            <Route path="/visualizacion" element={<Visualizacion />} />
            <Route path="/alerts" element={<VigenciaAlerts />} />
          </Routes>
      </div>
    </div>
  );
}

export default App;
