import React, { useEffect, useState, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Container, Typography, Box, Paper, Alert, CircularProgress } from "@mui/material";
import NavigationComponent from "./components/NavigationComponent";
import Topbar from "./components/Topbar";
import { LogoProvider } from "./contexts/LogoContext";

// Lazy-loaded components
const KPIChart = lazy(() => import("./components/KPIChart"));
const TablePage = lazy(() => import("./components/TablePage"));
const BatchForm = lazy(() => import("./components/BatchForm"));
const Services = lazy(() => import("./components/Services"));
const AdminPage = lazy(() => import("./components/AdminPage"));

const App = () => {
  const [backendMessage, setBackendMessage] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(" http://127.0.0.1:5000/")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => setBackendMessage(data.message))
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Failed to connect to backend");
      });
  }, []);

  return (
    <LogoProvider>
      <Router>
        <Topbar />
        <NavigationComponent />
        <Container maxWidth="lg">
          <Box my={4}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Paper
              elevation={3}
              sx={{ padding: 2 }}
              style={{ width: "100%", padding: 20, margin: "0 auto", marginLeft: "6%" }}
            >
              <Suspense fallback={<CircularProgress />}>
                <Routes>
                  <Route path="/" element={<KPIChart />} />
                  <Route path="/table" element={<TablePage />} />
                  <Route path="/batches" element={<BatchForm />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/Admin" element={<AdminPage />} />
                </Routes>
              </Suspense>
            </Paper>
          </Box>
        </Container>
      </Router>
    </LogoProvider>
  );
};

export default App;
