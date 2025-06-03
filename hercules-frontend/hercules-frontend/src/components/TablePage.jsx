import React from "react";
import TableView from "./TableView";
import { Typography, Box, Button } from "@mui/material";

const TablePage = () => {
  return (
    <div>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight="bold">
          KPI Data Table
        </Typography>
        <Button
          variant="outlined"
          onClick={() => window.print()}
          sx={{
            textTransform: "none",
            fontWeight: "bold",
            borderRadius: "12px",
            px: 3,
            border: "1px solid #1976d2",
            color: "#1976d2",
            boxShadow: "3px 3px 8px rgba(0, 0, 0, 0.3)",
            transform: "translateY(0px)",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.08)",
              transform: "translateY(1px)",
              boxShadow: "2px 2px 6px rgba(0, 0, 0, 0.2)",
            },
          }}
        >
          Print
        </Button>
      </Box>
      <TableView />
    </div>
  );
};

export default TablePage; 