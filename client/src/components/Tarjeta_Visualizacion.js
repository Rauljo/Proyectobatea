import React, { Fragment, useState } from "react";
import { Box, Button, Card, CardContent, Typography, Stack, TextField } from "@mui/material";

const TipoCuerda = ({ cantidad, tipo }) => {
  const [value, setValue] = useState(0);

  const handleChange = (event) => {
    const newValue = parseInt(event.target.value, 10) || 0;
    setValue(newValue);
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
        {tipo}: {cantidad}
      </Typography>
      <Button
        variant="contained"
        size="small"
        onClick={() => setValue((prev) => prev + 1)}
      >
        +
      </Button>
      <Button
        variant="contained"
        color="error"
        size="small"
        onClick={() => setValue((prev) => Math.max(0, prev - 1))}
      >
        -
      </Button>
      <TextField
        type="number"
        size="small"
        value={value}
        onChange={handleChange}
        inputProps={{ min: 0 }}
        sx={{ width: 60 }}
      />
    </Stack>
  );
};

const Tarjeta = ({sector}) => {
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
          <TipoCuerda cantidad={sector.cuerdas_cria} tipo="Cría" />
          <TipoCuerda cantidad={sector.cuerdas_cultivo} tipo="Cultivo" />
        </Stack>
      </CardContent>
    </Card>
  );
};

/*const Tarjeta = () => {
    return (<h1>Tarjeta</h1>)
}*/

export default Tarjeta;