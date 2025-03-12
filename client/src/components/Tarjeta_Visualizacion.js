import React, { Fragment, useState } from "react";
import { Box, Button, Card, CardContent, Typography, Stack, TextField } from "@mui/material";
import axios from "axios";

const TipoCuerda = ({ cantidad, tipo, sector}) => {
  const [value, setValue] = useState(0);
  const [cantidad_actual, setCantidad] = useState(cantidad);

  const handleChange = (event) => {
    const newValue = parseInt(event.target.value, 10) || 0;
    setValue(newValue);
  };

  const handleNewMovement = async (event) => {
    //Generate new entrada movement
    event.preventDefault();

   const operacion = value >= 0 ? "entrada" : "salida";
   const cantidad = Math.abs(value);

    const data = {
        x: sector.x,
        y: sector.y,
        batea: sector.batea,
        tipo_cuerda: tipo,
        cantidad: cantidad,
        tipo_operacion: operacion,
    };

    console.log(data);

    try {
      const response = await axios.post("http://localhost:5010/movimientos", data);

      if (response.status == 200 || response.status == 201) {
        console.log("Entrada añadida correctamente");
        //window.location.reload();
        setCantidad(cantidad_actual + value);
        setValue(0);
      }
    } catch (error) {
      console.error(error.message);
    }


  };

  

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{
        p: 1,
        borderRadius: 2,
        boxShadow: 1,
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h6">
        {tipo}: {cantidad_actual}
      </Typography>
      <Button
        variant="contained"
        size="small"
        onClick={handleNewMovement}
      >
        New
      </Button>
      <TextField
        type="number"
        size="small"
        value={value}
        onChange={handleChange}
        sx={{ width: 70 }}
      />
    </Stack>
  );
};

const Tarjeta = ({sector}) => {

    //Functions to add movements

  return (
    <Card
      sx={{
        maxWidth: 400,
        m: 2,
        p: 2,
        borderRadius: 3,
        boxShadow: 3,
        bgcolor: "background.paper",
      }}
    >
      <CardContent>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Sector {sector.x} - {sector.y}
        </Typography>
        <Stack spacing={2}>
          <TipoCuerda cantidad={sector.cuerdas_cria} tipo="cria" sector={{"x": sector.x, "y": sector.y, "batea": sector.batea}}/>
          <TipoCuerda cantidad={sector.cuerdas_cultivo} tipo="cultivo" sector={{"x": sector.x, "y": sector.y, "batea": sector.batea}}/>
        </Stack>
      </CardContent>
    </Card>
  );
};

/*const Tarjeta = () => {
    return (<h1>Tarjeta</h1>)
}*/

export default Tarjeta;