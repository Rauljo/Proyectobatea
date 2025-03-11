import React, {Fragment, useState, useEffect} from "react";
import axios from "axios";

//Import Material-UI components
import { Autocomplete, TextField, CircularProgress } from "@mui/material";


const Selector_Menu = ({ onSelectBatea }) => {

    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedBatea, setSelectedBatea] = useState(null);  // Estado para la batea seleccionada


    useEffect(() => {
        const fetchOptions = async () => {
            setLoading(true);
            try {
                const response = await axios.get("http://localhost:5010/bateas");
                setOptions(response.data);
            } catch (error) {
                console.error(error.message);
                
            }
            setLoading(false);
        };

    fetchOptions();


    }, []);

    return (
        <Fragment>
            <h2>Selector Menu</h2>
            <Autocomplete
                id="bateas"
                value = {selectedBatea}
                options={options}
                getOptionLabel={(option) => option.name}
                style={{ width: 300 }}
                onChange={(event, newValue) => {if(newValue) {
                    const selectedBatea = options.find(option => option.name === newValue.name);
                    setSelectedBatea(newValue); // Actualizamos el estado con el valor seleccionado
                    onSelectBatea(selectedBatea);
                 }}} //Pass selected item to parent
                renderInput={(params) => <TextField {...params} label="Bateas" />}
            />
            {loading && <CircularProgress />}
        </Fragment>
    );
};

export default Selector_Menu;