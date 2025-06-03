import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import TableView from "./TableView";

import { Pie, Line, Bar, Doughnut } from "react-chartjs-2";
import { LineChart } from "@mui/x-charts/LineChart";
import axios from "axios";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Filler,
} from "chart.js";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Diversity2OutlinedIcon from "@mui/icons-material/Diversity2Outlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import Brightness7OutlinedIcon from "@mui/icons-material/Brightness7Outlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import "../App.css";
import { useRef } from "react";


ChartJS.register(
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler
);

const centerTextPlugin = {
  id: "centerText",
  beforeDraw: (chart) => {
    if (chart.config.type === "doughnut") {
      const {
        ctx,
        chartArea: { width, height },
      } = chart;
      ctx.restore();
      const fontSize = (height / 180).toFixed(2);
      ctx.font = `${fontSize}em sans-serif`;
      ctx.textBaseline = "middle";

      const text = `${chart.config.data.labels?.length || 0} Products`;
      const textX = Math.round((width - ctx.measureText(text).width) / 2);
      const textY = height / 2;
      ctx.fillText(text, textX, textY);
      ctx.save();
    }
  },
};

const Dashboard = () => {
  const [kpiData, setKpiData] = useState([]);
  const [pieData, setPieData] = useState(null);
  const [lineData, setLineData] = useState(null);
  const [barData, setBarData] = useState(null);
  const [barDataTolerance, setBarDataTolerance] = useState(null);
  const [barDataLotTracking, setBarDataLotTracking] = useState(null);
  const [barDataProduction, setBarDataProduction] = useState(null);
  const [donutData, setDonutData] = useState(null);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [batchNames, setBatchNames] = useState([]);
  const [selectedBatchName, setSelectedBatchName] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [productNames, setProductNames] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState([]);
  const [materialNames, setMaterialNames] = useState([]);
  const [selectedCardBgColor, setSelectedCardBgColor] = useState("White");
  const [lineStrokeColor, setLineStrokeColor] = useState("#33691e");
  const [pointFillColor, setPointFillColor] = useState("#a2cb74");
  const [gradientColors, setGradientColors] = useState([]);
  const [historicalBarData, setHistoricalBarData] = useState(null);
  
  const [viewReport, setViewReport] = useState(false);


  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    const selected = typeof value === "string" ? value.split(",") : value;
    if (selected.includes("all")) {
      if (selectedMaterial.length === materialNames.length) {
        setSelectedMaterial([]);
      } else {
        setSelectedMaterial(materialNames);
      }
    } else {
      setSelectedMaterial(selected);
    }
  };

  const dashboardRef = useRef();
  const bgColorOptions = [
    { name: "White", hex: "#ffffff" },
    { name: "Mint", hex: "#90ee90" },
    { name: "Steel Gray", hex: "#2F4F4F" },
    { name: "Charcoal", hex: "#36454F" },
    { name: "Slate Blue", hex: "#6A7FDB" },
    { name: "Olive Drab", hex: "#6B8E23" },
    { name: "Rust Red", hex: "#8B0000" },
    { name: "Safety Orange", hex: "#FF6F00" },
    { name: "Industrial Yellow Dark", hex: "#D4A628" },
    { name: "Midnight Blue", hex: "#191970" },
    { name: "Cobalt Blue", hex: "#0047AB" },
  ];

  const colorOptions = [
    { name: "Cool White", hex: "#F9F9F9" },
    { name: "Steel Gray", hex: "#2F4F4F" },
    { name: "Charcoal", hex: "#36454F" },
    { name: "Slate Blue", hex: "#6A7FDB" },
    { name: "Olive Drab", hex: "#6B8E23" },
    { name: "Rust Red", hex: "#8B0000" },
    { name: "Safety Orange", hex: "#FF6F00" },
    { name: "Industrial Yellow", hex: "#F4C542" },
    { name: "Concrete Gray", hex: "#D3D3D3" },
    { name: "Midnight Blue", hex: "#191970" },
    { name: "Cobalt Blue", hex: "#0047AB" },
    { name: "Jet Black", hex: "#000000" },
  ];

  const getHexByName = (name) => {
    const allOptions = [...colorOptions, ...bgColorOptions];
    const found = allOptions.find((c) => c.name === name);
    return found ? found.hex : "#000000";
  };

  const getTextColorForBackground = (colorName) => {
    const hex = getHexByName(colorName);
    const lightBackgrounds = [
      "#ffffff",
      "#ffefef",
      "#f8f9fa",
      "#fce4ec",
      "#ede7f6",
      "#fff3e0",
      "#90ee90",
    ];
    return lightBackgrounds.includes(hex.toLowerCase()) ? "#1a1a1a" : "#ffffff";
  };

  const getGradientColors = (baseColorHex) => {
    const base = baseColorHex.replace("#", "");
    const r = parseInt(base.substring(0, 2), 16);
    const g = parseInt(base.substring(2, 4), 16);
    const b = parseInt(base.substring(4, 6), 16);
    const steps = 12;
    const gradient = [];

    for (let i = 0; i < steps; i++) {
      const factor = i / (steps - 1);
      const limit = 0.4;
      const minR = Math.max(Math.round(r * limit), 30);
      const minG = Math.max(Math.round(g * limit), 30);
      const minB = Math.max(Math.round(b * limit), 30);
      const newR = Math.round(r - (r - minR) * factor);
      const newG = Math.round(g - (g - minG) * factor);
      const newB = Math.round(b - (b - minB) * factor);

      gradient.push(`rgb(${newR}, ${newG}, ${newB})`);
    }

    return gradient;
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSecondAnchorEl(null);
    setThirdAnchorEl(null);
  };


  const handleStartDateChange = (newDate) => {
    if (newDate) {
      const updatedStartDate = new Date(newDate);
      updatedStartDate.setHours(7, 0, 0, 0);
      setSelectedStartDate(updatedStartDate);
    }
  };

  const handleEndDateChange = (newDate) => {
    if (newDate) {
      const updatedEndDate = new Date(newDate);
      updatedEndDate.setHours(7, 0, 0, 0);
      setSelectedEndDate(updatedEndDate);
    }
  };

  const applyFilters = () => {
    console.log("Filters applied:", {
      selectedStartDate,
      selectedEndDate,
      selectedBatchName,
      selectedProduct,
      selectedMaterial,
    });

    setRefreshFlag((prev) => !prev);
  };


  function calculateKPIsAndCharts(data) {
    if (!Array.isArray(data)) return;

    const totalBatches = new Set(data.map(item => item["Batch GUID"])).size;
    console.log(totalBatches)

    const uniqueProductsSet = new Set();
    const productCounts = {};
    const batchTimeline = {};
    const orderStatusCounts = {
      Completed: 0,
      Pending: 0,
      InProgress: 0,
      Cancelled: 0,
    };
    const selectedHex = getHexByName(selectedCardBgColor);
    const gradientColors = getGradientColors(selectedHex);

    let totalCompletionTime = 0;
    let plannedCompletionTime = 0;
    let totalMaterialUsage = 0;
    let totalSetPointUsage = 0;
    let accurateBatches = 0;
    let completedOrders = 0;
    let totalOrders = 0;
    let orderBacklogCount = 0;

    data.forEach((item) => {
      if (item["Product Name"]) {
        uniqueProductsSet.add(item["Product Name"]);
        productCounts[item["Product Name"]] =
          (productCounts[item["Product Name"]] || 0) + 1;
      }

      if (item["Order Status"]) {
        orderStatusCounts[item["Order Status"]] =
          (orderStatusCounts[item["Order Status"]] || 0) + 1;
      }

      if (
        item["Batch Act Start"] !== "N/A" &&
        item["Batch Act End"] !== "N/A"
      ) {
        const batchStart = new Date(item["Batch Act Start"]);
        const batchEnd = new Date(item["Batch Act End"]);
        if (!isNaN(batchStart) && !isNaN(batchEnd)) {
          const batchTime = (batchEnd - batchStart) / (1000 * 60);
          totalCompletionTime += batchTime;
          plannedCompletionTime += item["Planned Batch Completion Time"] || 0;
        }
      }

      totalMaterialUsage += item["Actual Material Usage"] || 0;
      totalSetPointUsage += item["SetPoint Material Usage"] || 0;

      if (
        Math.abs(
          (item["Actual Material Usage"] || 0) - (item["SetPoint"] || 0)
        ) <= (item["Tolerance"] || 0)
      ) {
        accurateBatches++;
      }

      if (item["Order Status"] === "Completed") {
        completedOrders++;
      }
      if (item["Order Status"]) {
        totalOrders++;
      }
      if (item["Order Status"] === "Pending") {
        orderBacklogCount++;
      }

      if (item["Batch Act Start"] !== "N/A") {
        const batchDate = new Date(item["Batch Act Start"]);
        if (!isNaN(batchDate)) {
          const formattedDate = batchDate.toDateString();
          batchTimeline[formattedDate] =
            (batchTimeline[formattedDate] || 0) + 1;
        }
      }
    });

    const uniqueMaterialNames = Array.from(
      new Set(data.map((item) => item["Material Name"]).filter((name) => name))
    );
    setMaterialNames(uniqueMaterialNames);

    const uniqueProducts = uniqueProductsSet.size || 1;
    const batchesPerProduct = (totalBatches / uniqueProducts).toFixed(2);
    const latestBatchDate =
      data.length && data[data.length - 1]["Batch Act Start"] !== "N/A"
        ? new Date(data[data.length - 1]["Batch Act Start"]).toDateString()
        : "N/A";

    setKpiData([
      {
        title: "Total Batches",
        value: totalBatches,
        color: "#3f51b5",
        percentage: 10,
      },
      {
        title: "Unique Products",
        value: uniqueProducts,
        color: "#4caf50",
        percentage: 5,
      },
      {
        title: "Batches per Product",
        value: batchesPerProduct,
        color: "#ffb300",
        percentage: -2,
      },
      {
        title: "Latest Batch Date",
        value: latestBatchDate,
        color: "#0097a7",
        percentage: 0,
      },
    ]);

    setPieData({
      labels: Object.keys(productCounts),
      datasets: [
        {
          data: Object.values(productCounts),
          backgroundColor: gradientColors,
          borderWidth: 1,
        },
      ],
    });

    setBarData({
      labels: Object.keys(productCounts),
      datasets: [
        {
          label: "Batches by Product",
          data: Object.values(productCounts),
          backgroundColor: gradientColors,
        },
      ],
    });

    setLineData({
      labels: Object.keys(batchTimeline),
      datasets: [
        {
          label: "Batches Over Time",
          data: Object.values(batchTimeline),
          borderColor: gradientColors,
          backgroundColor: gradientColors,
          fill: true,
          tension: 0.1,
        },
      ],
    });
    setHistoricalBarData({
      labels: Object.keys(batchTimeline),
      datasets: [
        {
          label: "Historical Batch Count",
          data: Object.values(batchTimeline),
          backgroundColor: gradientColors,
        },
      ],
    });

    let materialTolerance = {};
    data.forEach((item) => {
      if (item["SetPoint Material Usage"] > 0) {
        const tolerancePercentage =
          (Math.abs(
            (item["Actual Material Usage"] || 0) -
            (item["SetPoint Material Usage"] || 0)
          ) /
            (item["SetPoint Material Usage"] || 1)) *
          100;
        materialTolerance[item["Product Name"]] = tolerancePercentage;
      }
    });

    const sortedMaterials = Object.entries(materialTolerance)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    setBarDataTolerance({
      labels: sortedMaterials.map(([name]) => name),
      datasets: [
        {
          label: "Highest Tolerance %",
          data: sortedMaterials.map(([_, tolerance]) => tolerance),
          backgroundColor: gradientColors,
        },
      ],
    });

    const productionByDay = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };

    data.forEach((item) => {
      const batchDate = new Date(item["Batch Act Start"]);
      const dayOfWeek = batchDate.toLocaleDateString("en-US", {
        weekday: "long",
      });

      if (productionByDay.hasOwnProperty(dayOfWeek)) {
        productionByDay[dayOfWeek] += 1;
      }
    });

    setBarDataProduction({
      labels: Object.keys(productionByDay),
      datasets: [
        {
          label: "Tasks Started Per Weekday",
          data: Object.values(productionByDay),
          backgroundColor: gradientColors,
        },
      ],
    });

    const lotTrackingData = {};
    data.forEach((item) => {
      const batchDate = new Date(item["Batch Act Start"]).toDateString();
      const lotNumber = item["Lot Number"] || "Unknown";

      if (!lotTrackingData[batchDate]) {
        lotTrackingData[batchDate] = new Set();
      }
      lotTrackingData[batchDate].add(lotNumber);
    });

    const lotTrackingFormatted = Object.entries(lotTrackingData).map(
      ([date, lots]) => ({
        date,
        count: lots.size,
      })
    );

    setBarDataLotTracking({
      labels: lotTrackingFormatted.map((entry) => entry.date),
      datasets: [
        {
          label: "Unique Lot Numbers Per Day",
          data: lotTrackingFormatted.map((entry) => entry.count),
          backgroundColor: gradientColors,
        },
      ],
    });

    setDonutData({
      labels: Object.keys(productCounts),
      datasets: [
        {
          data: Object.values(productCounts),
          backgroundColor: gradientColors,
          borderWidth: 1,
        },
      ],
    });
  }
  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/kpi");
        let data = response.data;

        console.log("Raw graph data:", data); // 🧪 Debug log

        // Parse if string
        if (typeof data === "string") {
          try {
            data = JSON.parse(data.replace(/NaN/g, "null"));
          } catch (parseError) {
            console.error("Error parsing JSON:", parseError.message);
            return;
          }
        }

        // If data is an object with nested array
        if (!Array.isArray(data)) {
          if (Array.isArray(data.result)) {
            data = data.result;
          } else if (Array.isArray(data.data)) {
            data = data.data;
          } else {
            console.error("Expected an array but got:", data);
            return;
          }
        }

        // Final check
        if (!Array.isArray(data)) {
          console.error("Graph data is not an array after processing:", data);
          return;
        }

        // ✅ Set unique values
        setBatchNames(
          Array.from(new Set(data.map((item) => item["Batch Name"] || "Unknown")))
        );
        setProductNames(
          Array.from(new Set(data.map((item) => item["Product Name"] || "Unknown")))
        );
        setMaterialNames(
          Array.from(new Set(data.map((item) => item["Material Name"] || "Unknown")))
        );

        // ✅ Apply filters
        if (selectedStartDate && selectedEndDate) {
          data = data.filter((item) => {
            const batchStartDate = new Date(item["Batch Act Start"]);
            const batchEndDate = new Date(item["Batch Act End"]);
            return (
              batchStartDate >= selectedStartDate &&
              batchEndDate <= selectedEndDate
            );
          });
        }

        if (selectedBatchName.length > 0) {
          data = data.filter((item) =>
            selectedBatchName.includes(item["Batch Name"])
          );
        }

        if (selectedProduct.length > 0) {
          data = data.filter((item) =>
            selectedProduct.includes(item["Product Name"])
          );
        }

        if (selectedMaterial.length > 0) {
          data = data.filter((item) =>
            selectedMaterial.includes(item["Material Name"])
          );
        }

        // ✅ Pass to KPI calculation
        calculateKPIsAndCharts(data);
      } catch (error) {
        console.error("Error fetching graph data:", error);
      }
    };

    fetchGraphData();
  }, [
    selectedStartDate,
    selectedEndDate,
    selectedBatchName,
    selectedProduct,
    selectedMaterial,
    selectedCardBgColor,
  ]);

  useEffect(() => {
    const selectedHex = getHexByName(selectedCardBgColor);
    const newGradient = getGradientColors(selectedHex);
    setGradientColors(newGradient);
    setLineStrokeColor(newGradient[newGradient.length - 1]);
    setPointFillColor(newGradient[0]);
  }, [selectedCardBgColor]);

  const [handleButton, setHandleButton] = useState(false)
  const handlePrint = () => {
    // Elements in your current component
    const nonPrintableDiv = document.getElementById("non-printable-area");
    const nonPrintableDiv1 = document.getElementById("non-printable-area-1");
  
    // Elements from the external component
    const externalDiv = document.getElementById("external-component-id");
  
    // Hide ALL areas conditionally
    if (!viewReport) {
      if (nonPrintableDiv) nonPrintableDiv.style.display = "none";
      if (nonPrintableDiv1) nonPrintableDiv1.style.display = "none";
      if (externalDiv) externalDiv.style.display = "none";
    } else {
      if (nonPrintableDiv) nonPrintableDiv.style.display = "none";
      if (externalDiv) externalDiv.style.display = "none";
    }
  
    setHandleButton(true); // Still used in both cases
    window.print();
    window.location.reload();
  };

  return (
    <div ref={dashboardRef} className="print-container">
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ p: 3 }}>
          <div id="non-printable-area">
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", gap: 2, justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <Typography variant="h5" fontWeight="bold" sx={{ my: 1 }}>
                  KPI Dashboard
                </Typography>
                
                <Button
                  variant="outlined"
                  onClick={handlePrint}
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

              <FormControl
                size="small"
                sx={{
                  minWidth: 200,
                  borderRadius: "12px",
                  backgroundColor: "#f9f9f9",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                  px: 1,
                  py: 0.5,
                }}
              >
                <InputLabel
                  sx={{
                    fontWeight: "bold",
                    color: "#555",
                    backgroundColor: "#f9f9f9",
                    px: 0.5,
                    borderRadius: 1,
                  }}
                >
                  Card Background
                </InputLabel>
                <Select
                  value={selectedCardBgColor}
                  onChange={(e) => setSelectedCardBgColor(e.target.value)}
                  label="Card Background"
                  sx={{
                    borderRadius: "12px",
                    fontWeight: "medium",
                    backgroundColor: "#fff",
                    "& .MuiSelect-select": {
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: 2,
                        boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
                      },
                    },
                  }}
                >
                  {bgColorOptions.map((option) => (
                    <MenuItem key={option.hex} value={option.name}>
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          backgroundColor: option.hex,
                          display: "inline-block",
                          borderRadius: "50%",
                          marginRight: 1,
                          border: "1px solid #ccc",
                          boxShadow: "inset 0 0 2px rgba(0,0,0,0.2)",
                        }}
                      />
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </div>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <div id="non-printable-area-1">
              {/* Filters Row */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "nowrap",
                  gap: 2,
                  px: 2,
                  py: 2,
                  backgroundColor: "#fff",
                  borderRadius: 2,
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
                  justifyContent: "flex-start",
                  alignItems: "flex-end",
                }}
              >
                {/* START DATE */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 160,
                    order: 1
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }} mb={1}>
                    Start Date
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <DateTimePicker
                      value={selectedStartDate}
                      onChange={handleStartDateChange}
                      format="MM/dd/yyyy HH:mm"
                      slotProps={{
                        textField: {
                          size: "small",
                          variant: "outlined",
                          sx: {
                            backgroundColor: "#f9f9f9",
                            borderRadius: 1,
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 1,
                            },
                          },
                        },
                      }}
                    />
                  </FormControl>
                </Box>

                {/* END DATE */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 160,
                    order: 2
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }} mb={1}>
                    End Date
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <DateTimePicker
                      value={selectedEndDate}
                      onChange={handleEndDateChange}
                      format="MM/dd/yyyy HH:mm"
                      slotProps={{
                        textField: {
                          size: "small",
                          variant: "outlined",
                          sx: {
                            backgroundColor: "#f9f9f9",
                            borderRadius: 1,
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 1,
                            },
                          },
                        },
                      }}
                    />
                  </FormControl>
                </Box>

                {/* PRODUCT */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 160,
                    order: 3
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }} mb={1}>
                    Product
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Select Products</InputLabel>
                    <Select
                      multiple
                      value={selectedProduct}
                      onChange={(e) => {
                        if (e.target.value.includes("all")) {
                          if (selectedProduct.length === productNames.length) {
                            setSelectedProduct([]);
                          } else {
                            setSelectedProduct([...productNames]);
                          }
                        } else {
                          setSelectedProduct(e.target.value);
                        }
                      }}
                      renderValue={(selected) => {
                        if (
                          selected.length === 0 ||
                          selected.length === productNames.length
                        ) {
                          return "";
                        }
                        return selected.join(", ");
                      }}
                      displayEmpty
                      sx={{
                        backgroundColor: "#F8F9FA",
                        borderRadius: 1,
                      }}
                    >
                      <MenuItem
                        value="all"
                        sx={{ fontWeight: 600 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Select All
                      </MenuItem>
                      {productNames.map((product) => (
                        <MenuItem
                          key={product}
                          value={product}
                          sx={{
                            fontWeight: selectedProduct.includes(product)
                              ? 600
                              : 400,
                            color: selectedProduct.includes(product)
                              ? "#000"
                              : "inherit",
                          }}
                        >
                          {product}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* BATCH */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 160,
                    order: 4
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }} mb={1}>
                    Batch
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Select Batch</InputLabel>
                    <Select
                      multiple
                      value={selectedBatchName}
                      onChange={(e) => {
                        if (e.target.value.includes("Select All")) {
                          if (selectedBatchName.length === batchNames.length) {
                            setSelectedBatchName([]);
                          } else {
                            setSelectedBatchName([...batchNames]);
                          }
                        } else {
                          setSelectedBatchName(e.target.value);
                        }
                      }}
                      renderValue={(selected) => {
                        if (selected.length === 0) return "";
                        if (selected.length === batchNames.length) return "";
                        return selected.join(", ");
                      }}
                      displayEmpty
                      sx={{
                        backgroundColor: "#F9F9F9",
                        borderRadius: 1,
                        width: "100%",
                        paddingY: 0.5,
                      }}
                    >
                      <MenuItem
                        value="Select All"
                        sx={{ fontWeight: 600 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedBatchName.length === batchNames.length) {
                            setSelectedBatchName([]);
                          } else {
                            setSelectedBatchName([...batchNames]);
                          }
                        }}
                      >
                        Select All
                      </MenuItem>
                      {batchNames.map((batch) => (
                        <MenuItem
                          key={batch}
                          value={batch}
                          sx={{
                            fontWeight: selectedBatchName.includes(batch)
                              ? 600
                              : 400,
                            color: selectedBatchName.includes(batch)
                              ? "#000"
                              : "inherit",
                          }}
                        >
                          {batch}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* MATERIAL */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    flex: "1 1 180px",
                    maxWidth: 200,
                    order: 5
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }} mb={1}>
                    Select Material:
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <InputLabel id="select-material-label">
                      Select Material
                    </InputLabel>
                    <Select
                      labelId="select-material-label"
                      multiple
                      value={selectedMaterial}
                      onChange={handleChange}
                      sx={{
                        backgroundColor: "#F8F9FA",
                        borderRadius: 1,
                      }}
                    >
                      <MenuItem value="all" sx={{ fontWeight: 600 }}>
                        {selectedMaterial.length === materialNames.length
                          ? "Deselect All"
                          : "Select All"}
                      </MenuItem>
                      {materialNames.map((material) => (
                        <MenuItem
                          key={material}
                          value={material}
                          sx={{
                            fontWeight: selectedMaterial.includes(material)
                              ? 600
                              : 400,
                            color: selectedMaterial.includes(material)
                              ? "#000"
                              : "inherit",
                          }}
                        >
                          {material}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* VIEW BUTTON */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-end",
                    minWidth: 120,
                    order: 6
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={applyFilters}
                    sx={{
                      textTransform: "none",
                      fontWeight: "bold",
                      borderRadius: "12px",
                      px: 3,
                      py: 1.5,
                      background: "linear-gradient(135deg, #4B5563, #9CA3AF)",
                      color: "#fff",
                      boxShadow:
                        "4px 4px 10px rgba(0, 0, 0, 0.4), inset -1px -1px 2px rgba(255, 255, 255, 0.1)",
                      transform: "translateY(-1px)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        background: "linear-gradient(135deg, #374151, #6B7280)",
                        boxShadow:
                          "2px 2px 6px rgba(0, 0, 0, 0.3), inset -1px -1px 1px rgba(255, 255, 255, 0.05)",
                        transform: "translateY(1px)",
                      },
                    }}
                  >
                    View
                  </Button>
                </Box>
              </Box>
            </div>

            <Box sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sx={{ marginBottom: "10px" }}>
                  <Grid container spacing={3}>
                    {kpiData.map((item, index) => (
                      <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card
                          sx={{
                            backgroundColor:
                              getHexByName(selectedCardBgColor),
                            color:
                              getTextColorForBackground(
                                selectedCardBgColor
                              ),
                            textAlign: "center",
                            height: "140px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                            borderRadius: 2,
                            transition: "transform 0.3s ease-in-out",
                            px: 2,
                          }}
                        >
                          <Box sx={{ mb: 1 }}>
                            {index === 0 && (
                              <Diversity2OutlinedIcon
                                sx={{
                                  fontSize: 36,
                                  color:
                                    getTextColorForBackground(
                                      selectedCardBgColor
                                    ),
                                }}
                              />
                            )}
                            {index === 1 && (
                              <Brightness7OutlinedIcon
                                sx={{
                                  fontSize: 36,
                                  color:
                                    getTextColorForBackground(
                                      selectedCardBgColor
                                    ),
                                }}
                              />
                            )}
                            {index === 2 && (
                              <ArticleOutlinedIcon
                                sx={{
                                  fontSize: 36,
                                  color:
                                    getTextColorForBackground(
                                      selectedCardBgColor
                                    ),
                                }}
                              />
                            )}
                            {index === 3 && (
                              <CalendarMonthOutlinedIcon
                                sx={{
                                  fontSize: 36,
                                  color:
                                    getTextColorForBackground(
                                      selectedCardBgColor
                                    ),
                                }}
                              />
                            )}
                          </Box>

                          {/* KPI Text */}
                          <CardContent sx={{ p: 0 }}>
                            <Typography variant="h6" fontWeight="bold">
                              {item.value}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {item.title}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>

                <Grid container spacing={3} sx={{ marginBottom: "10px" }}>
                  <Grid item xs={12} md={4}>
                    <Card
                      sx={{
                        backgroundColor: "#fff",
                        color: "#000",
                        height: "300px",
                      }}
                    >
                      <CardContent
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{ textAlign: "center" }}
                        >
                          Recent Month
                        </Typography>
                        <Box
                          sx={{
                            flex: 1,
                            width: "116%",
                            marginLeft: "-16px",
                          }}
                        >
                          {donutData ? (
                            <Doughnut
                              data={donutData}
                              plugins={[centerTextPlugin]}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: "70%",
                                plugins: {
                                  centerText: {},
                                  legend: {
                                    position: "right",
                                    labels: {
                                      boxWidth: 12,
                                      padding: 15,
                                    },
                                  },
                                  tooltip: {
                                    callbacks: {
                                      label: (context) => {
                                        const total =
                                          context.dataset.data.reduce(
                                            (a, b) => a + b,
                                            0
                                          );
                                        const percentage = Math.round(
                                          (context.parsed / total) * 100
                                        );
                                        return `${context.label}: ${context.parsed} (${percentage}%)`;
                                      },
                                    },
                                  },
                                },
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <CircularProgress />
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card sx={{ height: "300px" }}>
                      <CardContent
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography variant="h6" gutterBottom>
                          Performance Trend
                        </Typography>
                        <Box sx={{ flex: 1, width: "93%" }}>
                          {lineData ? (
                            <LineChart
                              sx={{
                                height: "100%",
                                "& .MuiMarkElement-root circle": {
                                  fill: "currentColor !important",
                                },
                              }}
                              series={[
                                {
                                  data: lineData.datasets[0].data,
                                  label: "Amount ($",
                                  showMark: ({ index }) =>
                                    lineData.datasets[0].data[index] > 0,
                                  highlightScope: {
                                    faded: "global",
                                    highlighted: "item",
                                  },
                                  markType: "circle",
                                  color: lineStrokeColor,
                                  markStyle: ({ index }) => {
                                    const color =
                                      gradientColors[
                                        index % gradientColors.length
                                      ];
                                    return {
                                      stroke: color,
                                      fill: color,
                                      r: 5,
                                    };
                                  },
                                  curve: "linear",
                                },
                              ]}
                              xAxis={[
                                {
                                  data: lineData.labels,
                                  scaleType: "band",
                                  tickLabelStyle: {
                                    angle: 0,
                                    textAnchor: "end",
                                  },
                                },
                              ]}
                              yAxis={[
                                {
                                  scaleType: "linear",
                                  min: 0,
                                  valueFormatter: (value) =>
                                    `$${
                                      value.toLocaleString()
                                    }`,
                                },
                              ]}
                              margin={{
                                left: 30,
                                right: 30,
                                top: 30,
                                bottom: 50,
                              }}
                              slotProps={{
                                legend: { hidden: true },
                              }}
                              grid={{
                                horizontal: true,
                                vertical: false,
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <CircularProgress />
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card sx={{ height: "300px" }}>
                      <CardContent
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography variant="h6" gutterBottom>
                          Product Distribution
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                          {barData ? (
                            <Bar
                              data={barData}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                animation: {
                                  duration: 1000,
                                  easing: "easeOutQuart",
                                },
                                plugins: { legend: { display: false } },
                              }}
                            />
                          ) : (
                            <Typography>Loading product data...</Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ height: "100%" }}>
                  <Grid item xs={12} md={6} sx={{ height: "40%" }}>
                    <Card sx={{ height: "100%" }}>
                      <CardContent
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography variant="h6" gutterBottom>
                          By Product
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                          {pieData ? (
                            <Pie
                              data={pieData}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                animation: {
                                  duration: 1000,
                                  easing: "easeOutBack",
                                },
                                plugins: {
                                  legend: { position: "right" },
                                  tooltip: {
                                    callbacks: {
                                      label: (context) => {
                                        const total =
                                          context.dataset.data.reduce(
                                            (a, b) => a + b,
                                            0
                                          );
                                        const percentage = Math.round(
                                          (context.parsed / total) * 100
                                        );
                                        return `${context.label}: ${context.parsed} batches (${percentage}%)`;
                                      },
                                    },
                                  },
                                },
                              }}
                            />
                          ) : (
                            <Typography>
                              Loading production data...
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6} sx={{ height: "30%" }}>
                    <Card sx={{ height: "100%" }}>
                      <CardContent
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography variant="h6" gutterBottom>
                          Product Distribution Status
                        </Typography>
                        <Box
                          sx={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            {donutData ? (
                              <Doughnut
                                data={donutData}
                                plugins={[centerTextPlugin]}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  cutout: "70%",
                                  plugins: {
                                    centerText: {
                                      text: `${donutData.datasets[0].data.reduce(
                                        (a, b) => a + b,
                                        0
                                      )}%`,
                                    },
                                    legend: { position: "right" },
                                    tooltip: {
                                      callbacks: {
                                        label: (context) => {
                                          const total =
                                            context.dataset.data.reduce(
                                              (a, b) => a + b,
                                              0
                                            );
                                          const percentage = Math.round(
                                            (context.parsed / total) * 100
                                          );
                                          return `${context.label}: ${context.parsed} (${percentage}%)`;
                                        },
                                      },
                                    },
                                  },
                                }}
                              />
                            ) : (
                              <Typography>
                                Loading order status data...
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6} sx={{ height: "30%" }}>
                    <Card sx={{ height: "100%" }}>
                      <CardContent
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography variant="h6" gutterBottom>
                          Batch Timeline
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                          {lineData ? (
                            <Line
                              data={lineData}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                animation: {
                                  duration: 1000,
                                  easing: "easeInOutQuad",
                                },
                                elements: {
                                  line: { tension: 0.4 },
                                  point: { radius: 4, hoverRadius: 6 },
                                },
                              }}
                            />
                          ) : (
                            <Typography>
                              Loading timeline data...
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6} sx={{ height: "50%" }}>
                    <Card sx={{ height: "100%" }}>
                      <CardContent
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography variant="h6" gutterBottom>
                          Materials with Highest Tolerance %
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                          {barDataTolerance ? (
                            <Bar
                              data={barDataTolerance}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                animation: {
                                  duration: 1000,
                                  easing: "easeOutElastic",
                                  delay: (context) =>
                                    context.dataIndex * 100,
                                },
                              }}
                            />
                          ) : (
                            <Typography>
                              Loading tolerance data...
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6} sx={{ height: "50%" }}>
                    <Card sx={{ height: "100%" }}>
                      <CardContent
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography variant="h6" gutterBottom>
                          Tasks Started Per Weekday
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                          {barDataProduction ? (
                            <Bar
                              data={barDataProduction}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                animation: {
                                  duration: 1000,
                                  easing: "easeInOutBack",
                                },
                              }}
                            />
                          ) : (
                            <Typography>
                              Loading production data...
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6} sx={{ height: "50%" }}>
                    <Card sx={{ height: "100%" }}>
                      <CardContent
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography variant="h6" gutterBottom>
                          Lot Tracking Over Time
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                          {barDataLotTracking ? (
                            <Bar
                              data={barDataLotTracking}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                animation: {
                                  duration: 1000,
                                  easing: "easeOutBounce",
                                },
                              }}
                            />
                          ) : (
                            <Typography>
                              Loading lot tracking data...
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6} sx={{ height: "50%" }}>
                    <Card sx={{ height: "100%" }}>
                      <CardContent
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography variant="h6" gutterBottom>
                          Historical Batches by Date
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                          {historicalBarData ? (
                            <Bar
                              data={historicalBarData}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                animation: {
                                  duration: 1000,
                                  easing: "easeInOutSine",
                                },
                                plugins: {
                                  tooltip: {
                                    callbacks: {
                                      label: (context) =>
                                        `${context.parsed.y} batches`,
                                    },
                                  },
                                },
                              }}
                            />
                          ) : (
                            <Typography>
                              Loading historical data...
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
      </LocalizationProvider>
    </div>
  );
};

export default Dashboard;
