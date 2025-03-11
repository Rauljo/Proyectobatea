import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Grid from '@mui/material/Grid2';


import Tarjeta from './Tarjeta_Visualizacion';

const MatrizSectores = ({ batea, bateaData }) => {
  
    return (
        <Grid container spacing={2} direction="column">
      {[...Array(batea.y_sector)].map((_, y) => (
        <Grid container item direction="row" key={`row-${y}`} spacing={2}>
          {[...Array(batea.x_sector)].map((_,x) => {
            const sector = bateaData.find((s) => s.x === x && s.y === y);
            console.log(bateaData);
            if (sector){
                console.log(sector);
                return (
                    <Grid item key={`sector-${x}-${y}`}>
                      <Tarjeta sector={sector} />
                    </Grid>
                  );
            }
            
          })}
        </Grid>
      ))}
    </Grid>
    );
  };
  



const Visualizar_Batea = ({ batea }) => {

    const [bateaData, setBateaData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!batea) return;

        const fetchBateaData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5010/sectores/${batea.id}`);
                setBateaData(response.data);
            } catch (error) {
                console.error(error.message);
                
            }
            setLoading(false);

            
        }

        fetchBateaData();
    }, [batea]);

    return (
        <div>
            {loading && <p>Cargando...</p>}
            <div>
                
                <h2>Visualizar Batea</h2>
                <p> Nombre: {batea.name} </p>
                <p> Poligono: {batea.polygon} </p>
                <p> X: {batea.x_sector} </p>
                <p> Y: {batea.y_sector} </p>
            </div>

            {/*Ahora ponemos la informacion de los sectores*/}

            <div>
                <MatrizSectores batea={batea} bateaData={bateaData} />
            </div>
        </div>
    );
}

export default Visualizar_Batea;