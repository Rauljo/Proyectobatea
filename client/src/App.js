import React, { Fragment, useState } from "react";

import './App.css';

import Data_Insertion from './components/Data_Insertion';
import Navigation from "./components/Menu";


function App() {
  return (
    <div>
      <Navigation />
      <Data_Insertion />
    </div>
  );
}

export default App;
