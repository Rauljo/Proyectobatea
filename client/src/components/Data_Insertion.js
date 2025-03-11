import React, {Fragment} from 'react';

import Selector_Menu from './Selector_Menu.js';
import Nueva_Batea from './Nueva_Batea.js';
import Visualizar_Batea from './Visualizar_Batea.js';

const Data_Insertion = () => {
    const [selectedBatea, setSelected] = React.useState(null);

    const handleSelectBatea = (batea) => {
        setSelected(batea);
    };



    return (
        <Fragment>
            <Selector_Menu onSelectBatea = {handleSelectBatea}/>
            <Nueva_Batea />
            {selectedBatea && <Visualizar_Batea batea = {selectedBatea}/>}
        </Fragment>
    );
}

export default Data_Insertion;