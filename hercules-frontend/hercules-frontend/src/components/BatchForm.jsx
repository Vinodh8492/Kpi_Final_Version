import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const BatchForm = () => {
  const navigate = useNavigate();
  const [batch_guid, setBatchGuid] = useState("");
  const [batch_name, setBatchName] = useState("");
  const [product_name, setProductName] = useState("");
  const [batch_act_start, setBatchActStart] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedDate = batch_act_start.replace("T", " ") + ":00";

    try {
      const response = await axios.post("http://127.0.0.1:5000/api/kpi", {
        batch_guid,
        batch_name,
        product_name,
        batch_act_start: formattedDate,
      }, {
        headers: { "Content-Type": "application/json" }
      });

      console.log("Batch created successfully:", response.data);
      alert("Batch created successfully")
      setBatchGuid("");
      setBatchName("");
      setProductName("");
      setBatchActStart("");

      navigate("/");
    } catch (error) {
      console.error("Error creating batch:", error.response ? error.response.data : error.message);
    }
  };


  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Container maxWidth="sm">
        <Typography variant="h5" gutterBottom sx={{ textAlign: "center" }}>Batch Data Creation</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Batch"
            fullWidth
            margin="normal"
            value={batch_guid}
            onChange={(e) => setBatchGuid(e.target.value)}
            required
          />
          <TextField
            label="Batch Name"
            fullWidth
            margin="normal"
            value={batch_name}
            onChange={(e) => setBatchName(e.target.value)}
            required
          />
          <TextField
            label="Product Name"
            fullWidth
            margin="normal"
            value={product_name}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
          <TextField
            type="datetime-local"
            fullWidth
            margin="normal"
            value={batch_act_start}
            onChange={(e) => setBatchActStart(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ fontSize: 20, borderRadius: "8px" }}>
            Create Batch
          </Button>
        </form>
      </Container>
    </Box>
  );
};

export default BatchForm;
