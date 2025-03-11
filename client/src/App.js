import React, {Fragment} from 'react';

import './App.css';

import Selector_Menu from './components/Selector_Menu.js';
import Nueva_Batea from './components/Nueva_Batea.js';

function App() {
  return (
    <Fragment>
      <h1>APP BATEAS</h1>
      <Selector_Menu />
      <Nueva_Batea />
    </Fragment>
  );
}

export default App;
