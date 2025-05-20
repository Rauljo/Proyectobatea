import React, { Fragment, useState } from "react";
import {Route, Routes} from "react-router-dom";

import './App.css';

import Data_Insertion from './components/Data_Insertion';
import Navigation from "./components/Menu";
import Insercion from "./pages/Insercion";
import Visualizacion from "./pages/Visualizacion";
import Vigencia_Alerts from "./pages/Vigencia_Alerts";


function App() {
  return (
    <div>
      <Navigation />
      <div>
          <Routes>
            <Route path="/" element={<Insercion />} />
            <Route path="/insercion" element={<Insercion />} />
            <Route path="/visualizacion" element={<Visualizacion />} />
            <Route path="/alerts" element={<Vigencia_Alerts />} />
          </Routes>
      </div>
    </div>
  );
}

export default App;
