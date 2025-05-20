import React, { Fragment, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";

const Selector_Menu = ({ onSelectBatea, bateas }) => {
    const [selectedBatea, setSelectedBatea] = useState(null);

    return (
        <Fragment>
            <Autocomplete
                id="bateas"
                value={selectedBatea}
                options={bateas}
                getOptionLabel={(option) => option.name}
                style={{ width: 300 }}
                onChange={(event, newValue) => {
                    if (newValue) {
                        setSelectedBatea(newValue);
                        onSelectBatea(newValue); // Basta con pasar newValue directamente
                    }
                }}
                renderInput={(params) => <TextField {...params} label="Bateas" />}
            />
        </Fragment>
    );
};

export default Selector_Menu;
