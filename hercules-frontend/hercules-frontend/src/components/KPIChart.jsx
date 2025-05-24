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
  Menu,
  TablePagination,
} from "@mui/material";
import Grid from "@mui/material/Grid";

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
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Diversity2OutlinedIcon from "@mui/icons-material/Diversity2Outlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import Brightness7OutlinedIcon from "@mui/icons-material/Brightness7Outlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import "../App.css";
import { useRef } from "react";
import ReactDOMServer from "react-dom/server";
import Topbar from "./Topbar";



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

      const text = `${chart.config.data.labels?.length || 0} Materials`;
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
  const [batchData, setBatchData] = useState([]);
  const [productNames, setProductNames] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState([]);
  const [materialNames, setMaterialNames] = useState([]);
  const [selectedCardBgColor, setSelectedCardBgColor] = useState("White");
  const [lineStrokeColor, setLineStrokeColor] = useState("#33691e");
  const [pointFillColor, setPointFillColor] = useState("#a2cb74");
  const [gradientColors, setGradientColors] = useState([]);
  const [historicalBarData, setHistoricalBarData] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [secondAnchorEl, setSecondAnchorEl] = useState(null);
  const [thirdAnchorEl, setThirdAnchorEl] = useState(null);
  const [activeTable, setActiveTable] = useState(null);
  const [viewReport, setViewReport] = useState(false);

  //pagination
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [batchPage, setBatchPage] = React.useState(0);
  const [batchRowsPerPage, setBatchRowsPerPage] = React.useState(5);
  const [batchProdPage, setBatchProdPage] = useState(0);
  const [batchProdRowsPerPage, setBatchProdRowsPerPage] = useState(10);
  const [materialPage, setMaterialPage] = useState(0);
  const [materialRowsPerPage, setMaterialRowsPerPage] = useState(10);

  // boxes
  const [boxBatchNames, setBoxBatchNames] = useState([]);
  const [boxProductNames, setBoxProductNames] = useState([]);
  const [selectedBoxStartDate, setSelectedBoxStartDate] = useState(null);
  const [selectedBoxEndDate, setSelectedBoxEndDate] = useState(null);
  const [selectedBoxProduct, setSelectedBoxProduct] = useState([]);
  const [selectedBoxMaterial, setSelectedBoxMaterial] = useState([]);

  const [selectedBoxBatchName, setSelectedBoxBatchName] = useState([]);
  const [boxMaterialNames, setBoxMaterialNames] = useState([]);

  const [weekStartDate, setWeekStartDate] = useState(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    return sevenDaysAgo;
  });

  const [monthStartDate, setMonthStartDate] = useState(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    return thirtyDaysAgo;
  });

  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const yesterdayAtSevenAM = new Date(today);
    yesterdayAtSevenAM.setDate(today.getDate() - 1);
    yesterdayAtSevenAM.setHours(7, 0, 0, 0);
    return yesterdayAtSevenAM;
  });
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

  const showTables = (tableName) => {
    setActiveTable(tableName);
    handleMenuClose();
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

  const handleStartBoxDateChange = (newDate) => {
    if (newDate) {
      const updatedStartDate = new Date(newDate);
      updatedStartDate.setHours(7, 0, 0, 0);
      setSelectedBoxStartDate(updatedStartDate);
    }
  };

  const handleEndBoxDateChange = (newDate) => {
    if (newDate) {
      const updatedEndDate = new Date(newDate);
      updatedEndDate.setHours(7, 0, 0, 0);
      setSelectedBoxEndDate(updatedEndDate);
    }
  };
  //pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = [...batchData]
    .sort((a, b) => a.orderId - b.orderId)
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const dailySummaryData = Object.values(
    batchData
      .filter((item) => {
        if (!startDate) return true;
        const itemDate = new Date(item.batchStart);
        const start = new Date(startDate);
        start.setHours(7, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 1);
        end.setHours(7, 0, 0, 0);
        return itemDate >= start && itemDate < end;
      })
      .reduce((acc, item) => {
        const key = item.productName;
        if (!acc[key]) {
          acc[key] = {
            productName: item.productName,
            batchCount: 0,
            sumSP: 0,
            sumAct: 0,
          };
        }
        acc[key].batchCount += 1;
        acc[key].sumSP += Number(item.setPointFloat) || 0;
        acc[key].sumAct += Number(item.actualValueFloat) || 0;
        return acc;
      }, {})
  );

  const paginatedDailyData = dailySummaryData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  const handleBatchPageChange = (event, newPage) => {
    setBatchPage(newPage);
    setBatchProdPage(newPage);
  };

  const handleBatchRowsPerPageChange = (event) => {
    setBatchRowsPerPage(parseInt(event.target.value, 10));
    setBatchPage(0);
    setBatchProdRowsPerPage(parseInt(event.target.value, 10));
    setBatchProdPage(0);
  };

  const groupedBatchData = Object.entries(
    batchData.reduce((acc, item) => {
      const key = `${item.batchName?.trim()}___${item.productName?.trim()}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {})
  );

  const paginatedGroupedBatchData = groupedBatchData.slice(
    batchPage * batchRowsPerPage,
    batchPage * batchRowsPerPage + batchRowsPerPage
  );

  const paginationWM = (data) => {
    return data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  };

  const filterWeekly = () => {
    if (!weekStartDate) return batchData;
    const start = new Date(weekStartDate);
    start.setHours(7, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    end.setHours(7, 0, 0, 0);
    return batchData.filter((item) => {
      const date = new Date(item.batchStart);
      return date >= start && date < end;
    });
  };

  const filterMonthly = () => {
    if (!monthStartDate) return batchData;
    const start = new Date(monthStartDate);
    start.setHours(7, 0, 0, 0);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    end.setHours(7, 0, 0, 0);
    return batchData.filter((item) => {
      const date = new Date(item.batchStart);
      return date >= start && date < end;
    });
  };

  const renderPagination = (data) => (
    <TablePagination
      rowsPerPageOptions={[5, 10, 25, 35]}
      component="div"
      count={data.length}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
    />
  );

  const weeklyData = filterWeekly();
  const monthlyData = filterMonthly();


  const handleBoxMaterialChange = (event) => {
    setSelectedBoxMaterial(event.target.value);
  };

  useEffect(() => {
    const fetchBoxData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/kpi?page=1&limit=1000");

        let data = response.data;

        console.log("Raw response data:", data); // 🪵 Check structure

        // If response is a string, try parsing it
        if (typeof data === "string") {
          try {
            data = JSON.parse(data.replace(/NaN/g, "null"));
          } catch (parseError) {
            console.error("Error parsing JSON:", parseError.message);
            return;
          }
        }

        // If response is an object with a specific key (like result or data), unwrap it
        if (!Array.isArray(data) && typeof data === "object") {
          if (Array.isArray(data.result)) {
            data = data.result;
          } else if (Array.isArray(data.data)) {
            data = data.data;
          } else {
            console.error("Expected array but got object:", data);
            return;
          }
        }

        // Final safety check
        if (!Array.isArray(data)) {
          console.error("Expected array, got:", typeof data, data);
          return;
        }

        // Set unique filter values
        setBoxBatchNames(
          Array.from(new Set(data.map((item) => item["Batch Name"])))
        );
        setBoxProductNames(
          Array.from(new Set(data.map((item) => item["Product Name"])))
        );
        setBoxMaterialNames(
          Array.from(new Set(data.map((item) => item["Material Name"])))
        );

        // If report view is active, apply filters
        if (viewReport) {
          if (selectedBoxStartDate && selectedBoxEndDate) {
            data = data.filter((item) => {
              const batchStartDate = new Date(item["Batch Act Start"]);
              const batchEndDate = new Date(item["Batch Act End"]);
              return (
                batchStartDate >= selectedBoxStartDate &&
                batchEndDate <= selectedBoxEndDate
              );
            });
          }

          if (selectedBoxBatchName.length > 0) {
            data = data.filter((item) =>
              selectedBoxBatchName.includes(item["Batch Name"])
            );
          }

          if (selectedBoxProduct.length > 0) {
            data = data.filter((item) =>
              selectedBoxProduct.includes(item["Product Name"])
            );
          }

          if (selectedBoxMaterial.length > 0) {
            data = data.filter((item) =>
              selectedBoxMaterial.includes(item["Material Name"])
            );
          }

          // Format and save filtered data
          const formattedData = data.map((item) => ({
            batchGuid: item["Batch GUID"] || "Unknown",
            batchName: item["Batch Name"] || "Unknown",
            batchStart: item["Batch Act Start"] || "N/A",
            batchEnd: item["Batch Act End"] || "N/A",
            productName: item["Product Name"] || "Unknown",
            materialName: item["Material Name"] || "Unknown",
            materialCode: item["Material Code"] || "Unknown",
            quantity: item["Quantity"] || 0,
            setPointFloat: item["SetPoint Float"] || 0,
            actualValueFloat: item["Actual Value Float"] || 0,
            sourceServer: item["Source Server"] || "Unknown",
            rootGuid: item["ROOTGUID"] || "Unknown",
            orderId: item["OrderId"] || "Unknown",
          }));

          setBatchData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching table data:", error);
      }
    };

    fetchBoxData();


  }, [
    viewReport,
    selectedBoxStartDate,
    selectedBoxEndDate,
    selectedBoxBatchName,
    selectedBoxProduct,
    selectedBoxMaterial,
  ]);

  function calculateKPIsAndCharts(data) {
    if (!Array.isArray(data)) return;

    const totalBatches = data.length;
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
    if (!viewReport) {
      const nonPrintableDiv = document.getElementById("non-printable-area");
      const nonPrintableDiv1 = document.getElementById("non-printable-area-1");
      if (nonPrintableDiv && nonPrintableDiv1) {
        nonPrintableDiv.style.display = "none"; // Hide the div
        nonPrintableDiv1.style.display = "none";
      }
      window.print(); // Simple browser print
      window.location.reload()
      return;
    }
    const nonPrintableDiv2 = document.getElementById("non-printable-area-2");
    const nonPrintableDiv3 = document.getElementById("non-printable-area-3");
    const nonPrintableDiv = document.getElementById("non-printable-area");
    if (nonPrintableDiv2 && nonPrintableDiv3 && nonPrintableDiv) {
      nonPrintableDiv2.style.display = "none";  // Hide the div
      nonPrintableDiv3.style.display = "none";
      nonPrintableDiv.style.display = "none";
    }
    setHandleButton(true);
    window.print();
    window.location.reload()
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
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant={!showTable ? "contained" : "outlined"}
                  onClick={() => setShowTable(false)}
                  sx={{
                    textTransform: "none",
                    fontWeight: "bold",
                    borderRadius: "12px",
                    px: 3,
                    background: !showTable
                      ? "linear-gradient(to right, #1976d2, #2196f3)"
                      : "transparent",
                    color: !showTable ? "#fff" : "#1976d2",
                    border: "1px solid #1976d2",
                    boxShadow: !showTable
                      ? "4px 4px 10px rgba(0, 0, 0, 0.4), inset -1px -1px 2px rgba(255,255,255,0.1)"
                      : "none",
                    transform: !showTable ? "translateY(-1px)" : "none",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: !showTable
                        ? "linear-gradient(to right, #1565c0, #1e88e5)"
                        : "rgba(25, 118, 210, 0.08)",
                      transform: "translateY(1px)",
                      boxShadow: !showTable
                        ? "2px 2px 6px rgba(0, 0, 0, 0.3), inset -1px -1px 1px rgba(255,255,255,0.05)"
                        : "none",
                    },
                  }}
                >
                  Graphs
                </Button>

                <Button
                  variant={showTable ? "contained" : "outlined"}
                  onClick={() => setShowTable(true)}
                  sx={{
                    textTransform: "none",
                    fontWeight: "bold",
                    borderRadius: "12px",
                    px: 3,
                    background: showTable
                      ? "linear-gradient(to right, #1976d2, #2196f3)"
                      : "transparent",
                    color: showTable ? "#fff" : "#1976d2",
                    border: "1px solid #1976d2",
                    boxShadow: showTable
                      ? "4px 4px 10px rgba(0, 0, 0, 0.4), inset -1px -1px 2px rgba(255,255,255,0.1)"
                      : "none",
                    transform: showTable ? "translateY(-1px)" : "none",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: showTable
                        ? "linear-gradient(to right, #1565c0, #1e88e5)"
                        : "rgba(25, 118, 210, 0.08)",
                      transform: "translateY(1px)",
                      boxShadow: showTable
                        ? "2px 2px 6px rgba(0, 0, 0, 0.3), inset -1px -1px 1px rgba(255,255,255,0.05)"
                        : "none",
                    },
                  }}
                >
                  Table
                </Button>

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
          {showTable ? (
            <>
              <div id="non-printable-area-2">

                {/* Filters */}
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    px: 3,
                    py: 2,
                    mb: 2,
                    backgroundColor: "#fff",
                    borderRadius: 2,
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
                    justifyContent: "flex-start",
                    alignItems: "flex-end",
                    width: "100%",
                    marginLeft: "-22px",
                  }}
                >
                  {/* Start Date */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      flex: "1 1 180px",
                      maxWidth: 200,
                    }}
                  >
                    <Typography sx={{ fontWeight: 600 }} mb={1}>
                      Select Start Date:
                    </Typography>
                    <DatePicker
                      value={selectedBoxStartDate}
                      onChange={handleStartBoxDateChange}
                      format="MM/dd/yyyy"
                      slotProps={{
                        textField: {
                          size: "small",
                          sx: {
                            backgroundColor: "#f5f5f5",
                            borderRadius: 1,
                            width: "100%",
                          },
                        },
                      }}
                    />
                  </Box>

                  {/* End Date */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      flex: "1 1 180px",
                      maxWidth: 200,
                    }}
                  >
                    <Typography sx={{ fontWeight: 600 }} mb={1}>
                      Select End Date:
                    </Typography>
                    <DatePicker
                      value={selectedBoxEndDate}
                      onChange={handleEndBoxDateChange}
                      format="MM/dd/yyyy"
                      slotProps={{
                        textField: {
                          size: "small",
                          sx: {
                            backgroundColor: "#f5f5f5",
                            borderRadius: 1,
                            width: "100%",
                          },
                        },
                      }}
                    />
                  </Box>

                  {/* Batch Dropdown */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      flex: "1 1 180px",
                      maxWidth: 200,
                    }}
                  >
                    <Typography sx={{ fontWeight: 600 }} mb={1}>
                      Select Batch:
                    </Typography>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Select Batch</InputLabel>
                      <Select
                        multiple
                        value={selectedBoxBatchName}
                        onChange={(e) => {
                          // Handle normal selection changes
                          if (e.target.value.includes("all")) {
                            if (
                              selectedBoxBatchName.length === boxBatchNames.length
                            ) {
                              setSelectedBoxBatchName([]);
                            } else {
                              setSelectedBoxBatchName([...boxBatchNames]);
                            }
                          } else {
                            setSelectedBoxBatchName(e.target.value);
                          }
                        }}
                        renderValue={(selected) => {
                          if (selected.length === 0) return "";
                          if (selected.length === boxBatchNames.length) return "";
                          return selected.join(", ");
                        }}
                        sx={{
                          backgroundColor: "#f8f9fa",
                          borderRadius: 1,
                        }}
                      >
                        <MenuItem
                          value="all"
                          sx={{ fontWeight: 600 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              selectedBoxBatchName.length === boxBatchNames.length
                            ) {
                              setSelectedBoxBatchName([]);
                            } else {
                              setSelectedBoxBatchName([...boxBatchNames]);
                            }
                          }}
                        >
                          Select All
                        </MenuItem>
                        {boxBatchNames.map((batch) => (
                          <MenuItem
                            key={batch}
                            value={batch}
                            sx={{
                              fontWeight: selectedBoxBatchName.includes(batch)
                                ? 600
                                : 400,
                              color: selectedBoxBatchName.includes(batch)
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

                  {/* Product Dropdown */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      flex: "1 1 180px",
                      maxWidth: 200,
                    }}
                  >
                    <Typography sx={{ fontWeight: 600 }} mb={1}>
                      Select Product:
                    </Typography>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Select Product</InputLabel>
                      <Select
                        multiple
                        value={selectedBoxProduct}
                        onChange={(e) => {
                          if (e.target.value.includes("all")) {
                            if (
                              selectedBoxProduct.length === boxProductNames.length
                            ) {
                              setSelectedBoxProduct([]);
                            } else {
                              setSelectedBoxProduct([...boxProductNames]);
                            }
                          } else {
                            setSelectedBoxProduct(e.target.value);
                          }
                        }}
                        renderValue={(selected) => {
                          if (selected.length === 0) return "";
                          return selected.join(", ");
                        }}
                        displayEmpty
                        sx={{
                          backgroundColor: "#f8f9fa",
                          borderRadius: 1,
                        }}
                      >
                        <MenuItem
                          value="all"
                          sx={{ fontWeight: 600 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              selectedBoxProduct.length === boxProductNames.length
                            ) {
                              setSelectedBoxProduct([]);
                            } else {
                              setSelectedBoxProduct([...boxProductNames]);
                            }
                          }}
                        >
                          Select All
                        </MenuItem>
                        {boxProductNames.map((product) => (
                          <MenuItem
                            key={product}
                            value={product}
                            sx={{
                              fontWeight: selectedBoxProduct.includes(product)
                                ? 600
                                : 400,
                              color: selectedBoxProduct.includes(product)
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

                  {/* Material Dropdown */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      flex: "1 1 180px",
                      maxWidth: 200,
                    }}
                  >
                    <Typography sx={{ fontWeight: 600 }} mb={1}>
                      Select Material:
                    </Typography>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Select Material</InputLabel>
                      <Select
                        multiple
                        value={selectedBoxMaterial}
                        onChange={(e) => {
                          if (e.target.value.includes("all")) {
                            if (
                              selectedBoxMaterial.length ===
                              boxMaterialNames.length
                            ) {
                              setSelectedBoxMaterial([]);
                            } else {
                              setSelectedBoxMaterial([...boxMaterialNames]);
                            }
                          } else {
                            setSelectedBoxMaterial(e.target.value);
                          }
                        }}
                        renderValue={(selected) => selected.join(", ")}
                        displayEmpty
                        sx={{
                          backgroundColor: "#F8F9FA",
                          borderRadius: 1,
                        }}
                      >
                        <MenuItem
                          value="all"
                          sx={{ fontWeight: 600 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              selectedBoxMaterial.length ===
                              boxMaterialNames.length
                            ) {
                              setSelectedBoxMaterial([]);
                            } else {
                              setSelectedBoxMaterial([...boxMaterialNames]);
                            }
                          }}
                        >
                          Select All
                        </MenuItem>
                        {boxMaterialNames.map((material) => (
                          <MenuItem
                            key={material}
                            value={material}
                            sx={{
                              fontWeight: selectedBoxMaterial.includes(material)
                                ? 600
                                : 400,
                              color: selectedBoxMaterial.includes(material)
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

                  {/* View Button */}
                  <Box
                    sx={{
                      flex: "0 0 auto",
                      display: "flex",
                      alignItems: "flex-end",
                      mt: { xs: 2, md: 0 },
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={() => setViewReport(true)}
                      sx={{
                        height: 40,
                        background: "linear-gradient(135deg, #4B5563, #9CA3AF)",
                        color: "#fff",
                        fontWeight: "bold",
                        borderRadius: 2,
                        px: 3,
                        boxShadow:
                          "4px 4px 10px rgba(0, 0, 0, 0.4), inset -1px -1px 2px rgba(255, 255, 255, 0.1)",
                        transition: "all 0.2s ease",
                        transform: "translateY(-1px)",
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

              <div>

                <div id="non-printable-area-3">
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "nowrap",
                      gap: 2,
                      mb: 3,
                      "& .MuiButton-root": {
                        borderRadius: "12px",
                        fontWeight: 600,
                        textTransform: "none",
                        fontSize: "0.875rem",
                        padding: "6px 16px",
                        transition: "0.3s",
                      },
                    }}
                    aria-label="table controls"
                  >
                    {[
                      {
                        key: "productBatchSummary",
                        label: "Product Batch Summary",
                      },
                      {
                        key: "batchMaterialSummary",
                        label: "Batch Material Summary",
                      },
                      {
                        key: "batchProductionSummary",
                        label: "Batch Production Summary",
                      },
                      { key: "nfmWeekly", label: "NFM Weekly" },
                      { key: "nfmMonthly", label: "NFM Monthly" },
                      { key: "dailyReport", label: "Daily Report" },
                      {
                        key: "materialConsumptionReport",
                        label: "Material Consumption",
                      },
                      { key: "detailedReport", label: "Detailed Report" },
                    ].map((btn) => {
                      const isActive = activeTable === btn.key;

                      return (
                        <Button
                          key={btn.key}
                          variant="contained"
                          onClick={() => setActiveTable(btn.key)}
                          sx={{
                            background: isActive
                              ? "linear-gradient(145deg, #1e88e5, #42a5f5)"
                              : "#ffffff",
                            color: isActive ? "#ffffff" : "#1565c0",
                            border: isActive
                              ? "2px solid #1565c0"
                              : "1px solid #ccc",
                            boxShadow: isActive
                              ? "inset 2px 2px 4px rgba(255,255,255,0.2), 4px 4px 8px rgba(0,0,0,0.3)"
                              : "6px 6px 12px rgba(0,0,0,0.1), -3px -3px 6px rgba(255,255,255,0.8)",
                            transform: isActive
                              ? "translateY(2px)"
                              : "translateY(0)",
                            "&:hover": {
                              background: isActive
                                ? "linear-gradient(145deg, #1565c0, #1e88e5)"
                                : "#f5f5f5",
                              color: isActive ? "#ffffff" : "#0d47a1",
                              boxShadow: isActive
                                ? "inset 2px 2px 6px rgba(0,0,0,0.3)"
                                : "3px 3px 6px rgba(0,0,0,0.15), -2px -2px 4px rgba(255,255,255,0.7)",
                              transform: "translateY(1px)",
                            },
                          }}
                        >
                          {btn.label}
                        </Button>
                      );
                    })}
                  </Box>

                  {/* Unique Names Dropdown Menu */}
                  <Menu
                    id="unique-names-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => showTables("uniqueNames")}>
                      Show Unique Product/Batch Names
                    </MenuItem>
                  </Menu>

                  {/* Batch Summaries Dropdown Menu */}
                  <Menu
                    id="batch-summaries-menu"
                    anchorEl={secondAnchorEl}
                    keepMounted
                    open={Boolean(secondAnchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => showTables("batchMaterialSummary")}>
                      Batch Material Summary
                    </MenuItem>
                    <MenuItem
                      onClick={() => showTables("batchProductionSummary")}
                    >
                      Batch Production Summary
                    </MenuItem>
                  </Menu>

                  {/* NFM Reports Dropdown Menu */}
                  <Menu
                    id="nfm-reports-menu"
                    anchorEl={thirdAnchorEl}
                    keepMounted
                    open={Boolean(thirdAnchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => showTables("nfmWeekly")}>
                      NFM Weekly Report
                    </MenuItem>
                    <MenuItem onClick={() => showTables("nfmMonthly")}>
                      NFM Monthly Report
                    </MenuItem>
                  </Menu>

                  {activeTable === "nfmWeekly" && (
                    <Box
                      sx={{
                        my: 2,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        gutterBottom
                      >
                        Select Week Start Date:
                      </Typography>

                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Week Start Date"
                          value={weekStartDate}
                          onChange={(newValue) => setWeekStartDate(newValue)}
                          format="MM/dd/yyyy" // updated from inputFormat
                          slotProps={{
                            textField: {
                              placeholder: "MM/DD/YYYY",
                              size: "small",
                              sx: {
                                width: 220,
                                backgroundColor: "#ffffff",
                                borderRadius: 2,
                                boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                  "& fieldset": {
                                    borderColor: "#cfd8dc",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: "#90caf9",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: "#42a5f5",
                                  },
                                },
                                "& input::placeholder": {
                                  textTransform: "uppercase",
                                  color: "#9e9e9e",
                                  fontWeight: 500,
                                },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </Box>
                  )}

                  {activeTable === "nfmMonthly" && (
                    <Box
                      sx={{
                        my: 2,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        gutterBottom
                      >
                        Select Month Start Date:
                      </Typography>

                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Select Start Date"
                          value={monthStartDate}
                          onChange={(newValue) => setMonthStartDate(newValue)}
                          format="MM/dd/yyyy" // updated from inputFormat
                          views={["year", "month", "day"]} // Ensure all views are enabled
                          slotProps={{
                            textField: {
                              placeholder: "MM/DD/YYYY",
                              size: "small",
                              sx: {
                                width: 220,
                                backgroundColor: "#ffffff",
                                borderRadius: 2,
                                boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                  "& fieldset": {
                                    borderColor: "#cfd8dc",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: "#90caf9",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: "#42a5f5",
                                  },
                                },
                                "& input::placeholder": {
                                  textTransform: "uppercase",
                                  color: "#9e9e9e",
                                  fontWeight: 500,
                                },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </Box>
                  )}

                  {activeTable === "dailyReport" && (
                    <Box
                      sx={{
                        my: 2,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        gutterBottom
                      >
                        Select Date Start:
                      </Typography>

                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Start Date"
                          value={startDate}
                          onChange={(newValue) => setStartDate(newValue)}
                          format="MM/dd/yyyy" // updated from inputFormat
                          slotProps={{
                            textField: {
                              placeholder: "MM/DD/YYYY",
                              size: "small",
                              sx: {
                                width: 220,
                                backgroundColor: "#ffffff",
                                borderRadius: 2,
                                boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                  "& fieldset": {
                                    borderColor: "#cfd8dc",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: "#90caf9",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: "#42a5f5",
                                  },
                                },
                                "& input::placeholder": {
                                  textTransform: "uppercase",
                                  color: "#9e9e9e",
                                  fontWeight: 500,
                                },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </Box>
                  )}
                </div>

                <div id="printable-area">
                  {handleButton && <Topbar />}

                  {viewReport && (
                    <TableContainer
                      component={Paper}
                      sx={{
                        maxWidth: "90%",
                        margin: "auto",
                        mt: 4,
                      }}
                    >
                      {activeTable === "productBatchSummary" && (
                        <>
                          <Typography
                            variant="h6"
                            style={{ fontWeight: "bold", padding: 8 }}
                          >
                            Product Batch Summary
                          </Typography>

                          <Table
                            sx={{
                              borderCollapse: "collapse",
                              width: "100%",
                              tableLayout: "fixed",
                            }}
                          >
                            <TableHead
                              sx={{
                                backgroundColor:
                                  getHexByName(selectedCardBgColor),
                                color:
                                  getTextColorForBackground(selectedCardBgColor),
                              }}
                            >
                              <TableRow>
                                {[
                                  "Batch Name",
                                  "Product Name",
                                  "Batch Start",
                                  "Batch End",
                                  "Batch Quantity",
                                  "Material Name",
                                  "Material Code",
                                  "SetPoint",
                                  "Actual Value",
                                  "Source Server",
                                  "Order ID",
                                ].map((header) => (
                                  <TableCell
                                    key={header}
                                    sx={{
                                      border: "1px solid black",
                                      fontWeight: "bold",
                                      padding: "4px",
                                      color:
                                        getTextColorForBackground(
                                          selectedCardBgColor
                                        ),
                                    }}
                                  >
                                    {header}
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>

                            <TableBody>
                              {paginatedData.map((item, index) => (
                                <TableRow key={index}>
                                  {[
                                    item.batchName,
                                    item.productName,
                                    item.batchStart,
                                    item.batchEnd,
                                    item.quantity,
                                    item.materialName,
                                    item.materialCode,
                                    item.setPointFloat?.toFixed(2),
                                    item.actualValueFloat?.toFixed(2),
                                    item.sourceServer,
                                    item.orderId,
                                  ].map((value, i) => (
                                    <TableCell
                                      key={i}
                                      sx={{
                                        color: "#000",
                                        backgroundColor: "#fff",
                                        border: "1px solid black",
                                        padding: "4px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {value}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>

                          <TablePagination
                            rowsPerPageOptions={[5, 10, 25, 50, 100]}
                            component="div"
                            count={batchData.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            sx={{
                              backgroundColor: "#f5f5f5",
                              borderBottomLeftRadius: 8,
                              borderBottomRightRadius: 8,
                            }}
                          />
                        </>
                      )}

                      {activeTable === "dailyReport" && (
                        <>
                          <Typography
                            variant="h6"
                            style={{ fontWeight: "bold", padding: 8 }}
                          >
                            Daily Report Summary
                          </Typography>

                          {startDate && (
                            <Typography
                              variant="subtitle2"
                              style={{ paddingLeft: 16, marginBottom: 8 }}
                            >
                              Production Period:{" "}
                              {new Date(startDate).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                weekday: "short",
                                month: "short",
                                year: "numeric",
                              })}{" "}
                              07:00 AM -{" "}
                              {new Date(
                                new Date(startDate).setDate(
                                  startDate.getDate() + 1
                                )
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                weekday: "short",
                                month: "short",
                                year: "numeric",
                              })}{" "}
                              07:00 AM
                            </Typography>
                          )}

                          <TableContainer>
                            <Table sx={{ borderCollapse: "collapse" }}>
                              <TableHead
                                sx={{
                                  backgroundColor:
                                    getHexByName(selectedCardBgColor),
                                  color:
                                    getTextColorForBackground(
                                      selectedCardBgColor
                                    ),
                                }}
                              >
                                <TableRow>
                                  {[
                                    "Product Name",
                                    "No Of Batches",
                                    "Sum SP",
                                    "Sum Act",
                                    "Err Kg",
                                    "Err %",
                                  ].map((header) => (
                                    <TableCell
                                      key={header}
                                      sx={{
                                        border: "1px solid black",
                                        fontWeight: "bold",
                                        color:
                                          getTextColorForBackground(
                                            selectedCardBgColor
                                          ),
                                      }}
                                    >
                                      {header}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>

                              <TableBody>
                                {paginatedDailyData.map((summary, idx) => {
                                  const errKg = summary.sumAct - summary.sumSP;
                                  const errPercentRaw =
                                    summary.sumSP !== 0
                                      ? (errKg / summary.sumSP) * 100
                                      : 0;
                                  const errPercent =
                                    Math.abs(errPercentRaw).toFixed(2);
                                  const errColor =
                                    errPercentRaw < 0 ? "red" : "green";
                                  return (
                                    <TableRow key={idx}>
                                      <TableCell
                                        sx={{ border: "1px solid black" }}
                                      >
                                        {summary.productName}
                                      </TableCell>
                                      <TableCell
                                        sx={{ border: "1px solid black" }}
                                      >
                                        {summary.batchCount}
                                      </TableCell>
                                      <TableCell
                                        sx={{ border: "1px solid black" }}
                                      >
                                        {summary.sumSP.toFixed(2)}
                                      </TableCell>
                                      <TableCell
                                        sx={{ border: "1px solid black" }}
                                      >
                                        {summary.sumAct.toFixed(2)}
                                      </TableCell>
                                      <TableCell
                                        sx={{ border: "1px solid black" }}
                                      >
                                        {errKg.toFixed(2)}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          border: "1px solid black",
                                          color: errColor,
                                          fontWeight: "bold",
                                        }}
                                      >
                                        {errPercent}%
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>

                          <Box
                            display="flex"
                            justifyContent="flex-end"
                            alignItems="center"
                            mt={2}
                          >
                            <TablePagination
                              rowsPerPageOptions={[5, 10, 25, 50, 100]}
                              component="div"
                              count={dailySummaryData.length}
                              rowsPerPage={rowsPerPage}
                              page={page}
                              onPageChange={handleChangePage}
                              onRowsPerPageChange={handleChangeRowsPerPage}
                              labelRowsPerPage="Rows per page:"
                            />
                          </Box>
                        </>
                      )}

                      {activeTable === "batchMaterialSummary" && batchData.length > 0 && (
                        <div className="batch-container">
                          <Typography variant="h6" style={{ fontWeight: "bold", padding: 16 }}>
                            Batch Material Summary
                          </Typography>

                          <Table sx={{ borderCollapse: "collapse", width: "100%", mt: 2 }}>
                            <TableHead>
                              <TableRow
                                sx={{
                                  backgroundColor: getHexByName(selectedCardBgColor),
                                  color: getTextColorForBackground(selectedCardBgColor),
                                }}
                              >
                                {[
                                  "Batch",
                                  "Material Name",
                                  "Code",
                                  "Set Point",
                                  "Actual",
                                  "Err Kg",
                                  "Err %",
                                ].map((head, idx) => (
                                  <TableCell
                                    key={idx}
                                    sx={{
                                      border: "1px solid #bdbdbd",
                                      fontWeight: "bold",
                                      textAlign: "center",
                                      fontSize: idx === 0 ? "1rem" : undefined,
                                      color: getTextColorForBackground(selectedCardBgColor),
                                    }}
                                  >
                                    {head}
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>

                            <TableBody>
                              {paginatedGroupedBatchData.map(([key, items], groupIndex) => {
                                const [batchName, productName] = key.split("___");

                                const totalSetPoint = items.reduce(
                                  (sum, i) => sum + (parseFloat(i.setPointFloat) || 0),
                                  0
                                );
                                const totalActual = items.reduce(
                                  (sum, i) => sum + (parseFloat(i.actualValueFloat) || 0),
                                  0
                                );
                                const totalErrKg = totalActual - totalSetPoint;
                                const totalErrPercentage =
                                  items.reduce((sum, i) => {
                                    const set = parseFloat(i.setPointFloat) || 0;
                                    const actual = parseFloat(i.actualValueFloat) || 0;
                                    if (set === 0) return sum;
                                    return sum + ((actual - set) / set) * 100;
                                  }, 0) / items.length || 0;

                                return (
                                  <React.Fragment key={groupIndex}>
                                    {items.map((item, idx) => {
                                      const errKg =
                                        (item.actualValueFloat || 0) - (item.setPointFloat || 0);
                                      const errPercentage =
                                        item.setPointFloat !== 0
                                          ? ((item.actualValueFloat - item.setPointFloat) /
                                            item.setPointFloat) *
                                          100
                                          : 0;

                                      return (
                                        <TableRow key={idx}>
                                          {idx === 0 && (
                                            <TableCell
                                              rowSpan={items.length}
                                              sx={{
                                                border: "1px solid #bdbdbd",
                                                verticalAlign: "top",
                                                minWidth: 220,
                                                backgroundColor: "#fff",
                                                fontSize: "1rem",
                                                padding: "12px 8px",
                                              }}
                                            >
                                              <div>
                                                <span style={{ fontWeight: 600 }}>
                                                  Batch : {item.batchName}
                                                </span>
                                                <br />
                                                <span style={{ fontWeight: 600 }}>
                                                  Product : {item.productName}
                                                </span>
                                                <br />
                                                <span>
                                                  Started: <b>{item.batchStart}</b>
                                                </span>
                                                <br />
                                                <span>
                                                  Ended: <b>{item.batchEnd}</b>
                                                </span>
                                                <br />
                                                <span>
                                                  Quantity: <b>{item.quantity}</b>
                                                </span>
                                              </div>
                                            </TableCell>
                                          )}

                                          <TableCell sx={{ border: "1px solid #bdbdbd" }}>
                                            {item.materialName}
                                          </TableCell>
                                          <TableCell
                                            sx={{ border: "1px solid #bdbdbd", textAlign: "center" }}
                                          >
                                            {item.materialCode}
                                          </TableCell>
                                          <TableCell
                                            sx={{ border: "1px solid #bdbdbd", textAlign: "center" }}
                                          >
                                            {item.setPointFloat?.toFixed(2)}
                                          </TableCell>
                                          <TableCell
                                            sx={{ border: "1px solid #bdbdbd", textAlign: "center" }}
                                          >
                                            {item.actualValueFloat?.toFixed(2)}
                                          </TableCell>
                                          <TableCell
                                            sx={{ border: "1px solid #bdbdbd", textAlign: "center" }}
                                          >
                                            {Math.abs(errKg).toFixed(2)}
                                          </TableCell>
                                          <TableCell
                                            sx={{
                                              border: "1px solid #bdbdbd",
                                              textAlign: "center",
                                              fontWeight: "bold",
                                              color:
                                                errPercentage < 0 ? "#d32f2f" : "#388e3c",
                                            }}
                                          >
                                            {Math.abs(errPercentage).toFixed(2)}%
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}

                                    {/* Total row for each group */}
                                    <TableRow
                                      sx={{
                                        fontWeight: "bold",
                                        backgroundColor: "#e0e0e0",
                                      }}
                                    >
                                      <TableCell sx={{ border: "1px solid #bdbdbd" }}>
                                        <strong>Total</strong>
                                      </TableCell>
                                      <TableCell sx={{ border: "1px solid #bdbdbd" }} />
                                      <TableCell sx={{ border: "1px solid #bdbdbd" }} />
                                      <TableCell sx={{ border: "1px solid #bdbdbd" }}>
                                        {totalSetPoint.toFixed(2)}
                                      </TableCell>
                                      <TableCell sx={{ border: "1px solid #bdbdbd" }}>
                                        {totalActual.toFixed(2)}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          border: "1px solid #bdbdbd",
                                          textAlign: "center",
                                        }}
                                      >
                                        {Math.abs(totalErrKg).toFixed(2)}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          border: "1px solid #bdbdbd",
                                          textAlign: "center",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        {Math.abs(totalErrPercentage).toFixed(2)}%
                                      </TableCell>
                                    </TableRow>
                                  </React.Fragment>
                                );
                              })}
                            </TableBody>
                          </Table>

                          {/* Pagination */}
                          <TablePagination
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            component="div"
                            count={groupedBatchData.length}
                            rowsPerPage={batchRowsPerPage}
                            page={batchPage}
                            onPageChange={handleBatchPageChange}
                            onRowsPerPageChange={handleBatchRowsPerPageChange}
                            sx={{ backgroundColor: "#f5f5f5", borderTop: "1px solid #ccc" }}
                          />
                        </div>
                      )}


                      {activeTable === "batchProductionSummary" && (
                        <>
                          <Typography
                            variant="h6"
                            style={{ fontWeight: "bold", padding: 16 }}
                          >
                            Batch Production Summary
                          </Typography>

                          {/* Prepare grouped data */}
                          {(() => {
                            const groupedData = Object.entries(
                              batchData.reduce((acc, item) => {
                                const key = item.productName;
                                if (!acc[key]) acc[key] = [];
                                acc[key].push(item);
                                return acc;
                              }, {})
                            );

                            const paginatedData = groupedData.slice(
                              batchProdPage * batchProdRowsPerPage,
                              batchProdPage * batchProdRowsPerPage + batchProdRowsPerPage
                            );

                            return (
                              <>
                                <Table sx={{ borderCollapse: "collapse", width: "100%" }}>
                                  <TableHead>
                                    <TableRow
                                      sx={{
                                        backgroundColor: getHexByName(selectedCardBgColor),
                                      }}
                                    >
                                      {[
                                        "Production Name",
                                        "No of Batches",
                                        "Sum SP",
                                        "Sum Act",
                                        "Err Kg",
                                        "Err %",
                                      ].map((header) => (
                                        <TableCell
                                          key={header}
                                          sx={{
                                            border: "1px solid black",
                                            fontWeight: "bold",
                                            color: getTextColorForBackground(selectedCardBgColor),
                                          }}
                                        >
                                          {header}
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {paginatedData.map(([productName, items], groupIndex) => {
                                      const totalSetPoint = items.reduce(
                                        (sum, i) => sum + (parseFloat(i.setPointFloat) || 0),
                                        0
                                      );
                                      const totalActual = items.reduce(
                                        (sum, i) => sum + (parseFloat(i.actualValueFloat) || 0),
                                        0
                                      );
                                      const errKg = totalActual - totalSetPoint;
                                      const errPercentage =
                                        totalSetPoint !== 0
                                          ? (errKg / totalSetPoint) * 100
                                          : 0;

                                      return (
                                        <TableRow key={groupIndex}>
                                          <TableCell sx={{ border: "1px solid black" }}>
                                            {productName}
                                          </TableCell>
                                          <TableCell sx={{ border: "1px solid black" }}>
                                            {items.length}
                                          </TableCell>
                                          <TableCell sx={{ border: "1px solid black" }}>
                                            {totalSetPoint.toFixed(2)}
                                          </TableCell>
                                          <TableCell sx={{ border: "1px solid black" }}>
                                            {totalActual.toFixed(2)}
                                          </TableCell>
                                          <TableCell sx={{ border: "1px solid black" }}>
                                            {items.length > 0 ? errKg.toFixed(2) : "-"}
                                          </TableCell>
                                          <TableCell
                                            sx={{
                                              border: "1px solid black",
                                              fontWeight: "bold",
                                              color: errPercentage >= 0 ? "green" : "red",
                                            }}
                                          >
                                            {items.length > 0
                                              ? Math.abs(errPercentage).toFixed(2) + "%"
                                              : "-"}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>

                                {/* Pagination */}
                                <TablePagination
                                  rowsPerPageOptions={[5, 10, 25, 50]}
                                  component="div"
                                  count={groupedData.length}
                                  rowsPerPage={batchProdRowsPerPage}
                                  page={batchProdPage}
                                  onPageChange={handleBatchPageChange}
                                  onRowsPerPageChange={handleBatchRowsPerPageChange}
                                  sx={{ backgroundColor: "#f5f5f5", borderTop: "1px solid #ccc" }}
                                />
                              </>
                            );
                          })()}
                        </>
                      )}


                      {activeTable === "nfmWeekly" && (
                        <>
                          <Typography variant="h6" style={{ fontWeight: "bold", padding: 16 }}>
                            NFM ORDER REPORT WEEKLY
                          </Typography>
                          {weekStartDate && (
                            <Typography
                              variant="subtitle2"
                              style={{ paddingLeft: 16, marginBottom: 8 }}
                            >
                              Production Period: {new Date(weekStartDate).toLocaleDateString("en-GB")} 07:00 AM -
                              {new Date(new Date(weekStartDate).setDate(new Date(weekStartDate).getDate() + 7)).toLocaleDateString("en-GB")} 07:00 AM
                            </Typography>
                          )}
                          <TableContainer>
                            <Table sx={{ borderCollapse: "collapse", width: "100%" }}>
                              <TableHead>
                                <TableRow sx={{ backgroundColor: getHexByName(selectedCardBgColor) }}>
                                  {["Product Name", "No", "Set Point", "Actual", "Err Kg", "Err %"].map((header) => (
                                    <TableCell
                                      key={header}
                                      sx={{
                                        border: "1px solid black",
                                        fontWeight: "bold",
                                        color: getTextColorForBackground(selectedCardBgColor),
                                      }}
                                    >
                                      {header}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {paginationWM(weeklyData).map((item, index) => {
                                  const setPoint = Number(item.setPointFloat);
                                  const actual = Number(item.actualValueFloat);
                                  const errKg = actual - setPoint;
                                  const errPercentRaw = setPoint !== 0 ? (errKg / setPoint) * 100 : 0;
                                  const errPercent = Math.abs(errPercentRaw).toFixed(2);
                                  const errColor = errPercentRaw < 0 ? "red" : "green";

                                  return (
                                    <TableRow key={index}>
                                      <TableCell sx={{ border: "1px solid black" }}>{item.productName}</TableCell>
                                      <TableCell sx={{ border: "1px solid black" }}>1</TableCell>
                                      <TableCell sx={{ border: "1px solid black" }}>{setPoint.toFixed(2)}</TableCell>
                                      <TableCell sx={{ border: "1px solid black" }}>{actual.toFixed(2)}</TableCell>
                                      <TableCell sx={{ border: "1px solid black" }}>{errKg.toFixed(2)}</TableCell>
                                      <TableCell sx={{ border: "1px solid black", color: errColor, fontWeight: "bold" }}>
                                        {errPercent}%
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                            {renderPagination(weeklyData)}
                          </TableContainer>
                        </>
                      )}

                      {activeTable === "nfmMonthly" && (
                        <>
                          <Typography variant="h6" style={{ fontWeight: "bold", padding: 16 }}>
                            NFM ORDER REPORT Monthly
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            style={{ paddingLeft: 16, marginBottom: 8 }}
                          >
                            Production Period: {new Date(monthStartDate).toLocaleDateString("en-GB")} 07:00 AM -
                            {new Date(new Date(monthStartDate).setMonth(new Date(monthStartDate).getMonth() + 1)).toLocaleDateString("en-GB")} 07:00 AM
                          </Typography>
                          <TableContainer>
                            <Table sx={{ borderCollapse: "collapse", width: "100%" }}>
                              <TableHead>
                                <TableRow sx={{ backgroundColor: getHexByName(selectedCardBgColor) }}>
                                  {["Product Name", "No Of Batches", "Sum SP", "Sum Act", "Err Kg", "Err %"].map((header) => (
                                    <TableCell
                                      key={header}
                                      sx={{
                                        border: "1px solid black",
                                        fontWeight: "bold",
                                        color: getTextColorForBackground(selectedCardBgColor),
                                      }}
                                    >
                                      {header}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {paginationWM(
                                  Object.values(
                                    monthlyData.reduce((acc, item) => {
                                      const key = item.productName;
                                      if (!acc[key]) {
                                        acc[key] = {
                                          productName: item.productName,
                                          batchCount: 0,
                                          sumSP: 0,
                                          sumAct: 0,
                                        };
                                      }
                                      acc[key].batchCount++;
                                      acc[key].sumSP += Number(item.setPointFloat) || 0;
                                      acc[key].sumAct += Number(item.actualValueFloat) || 0;
                                      return acc;
                                    }, {})
                                  )
                                ).map((summary, idx) => {
                                  const errKg = summary.sumAct - summary.sumSP;
                                  const errPercentRaw = summary.sumSP !== 0 ? (errKg / summary.sumSP) * 100 : 0;
                                  const errPercent = Math.abs(errPercentRaw).toFixed(2);
                                  const errColor = errPercentRaw < 0 ? "red" : "green";
                                  return (
                                    <TableRow key={idx}>
                                      <TableCell sx={{ border: "1px solid black" }}>{summary.productName}</TableCell>
                                      <TableCell sx={{ border: "1px solid black" }}>{summary.batchCount}</TableCell>
                                      <TableCell sx={{ border: "1px solid black" }}>{summary.sumSP.toFixed(2)}</TableCell>
                                      <TableCell sx={{ border: "1px solid black" }}>{summary.sumAct.toFixed(2)}</TableCell>
                                      <TableCell sx={{ border: "1px solid black" }}>{errKg.toFixed(2)}</TableCell>
                                      <TableCell sx={{ border: "1px solid black", color: errColor, fontWeight: "bold" }}>
                                        {errPercent}%
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                            {renderPagination(monthlyData)}
                          </TableContainer>
                        </>
                      )}

                      {activeTable === "materialConsumptionReport" && (
                        <>
                          <Typography
                            variant="h6"
                            style={{ fontWeight: "bold", padding: 8 }}
                          >
                            Material Consumption Report Summary
                          </Typography>

                          <Table
                            sx={{
                              borderCollapse: "collapse",
                              width: "100%",
                            }}
                          >
                            <TableHead
                              sx={{
                                backgroundColor: getHexByName(selectedCardBgColor),
                              }}
                            >
                              <TableRow>
                                {[
                                  "Material Name",
                                  "Code",
                                  "Planned KG",
                                  "Actual KG",
                                  "Difference %",
                                ].map((header) => (
                                  <TableCell
                                    key={header}
                                    sx={{
                                      border: "1px solid black",
                                      fontWeight: "bold",
                                      color: getTextColorForBackground(selectedCardBgColor),
                                    }}
                                  >
                                    {header}
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {Object.entries(
                                batchData.reduce((acc, item) => {
                                  const key = `${item.materialName}___${item.materialCode}`;
                                  if (!acc[key])
                                    acc[key] = { ...item, planned: 0, actual: 0 };
                                  acc[key].planned += parseFloat(item.setPointFloat) || 0;
                                  acc[key].actual += parseFloat(item.actualValueFloat) || 0;
                                  return acc;
                                }, {})
                              )
                                .slice(
                                  materialPage * materialRowsPerPage,
                                  materialPage * materialRowsPerPage + materialRowsPerPage
                                )
                                .map(([key, summary], idx) => {
                                  const diff = summary.actual - summary.planned;
                                  const diffPercent =
                                    summary.planned !== 0
                                      ? (diff / summary.planned) * 100
                                      : 0;
                                  return (
                                    <TableRow key={idx}>
                                      <TableCell sx={{ border: "1px solid black" }}>
                                        {summary.materialName}
                                      </TableCell>
                                      <TableCell sx={{ border: "1px solid black" }}>
                                        {summary.materialCode}
                                      </TableCell>
                                      <TableCell sx={{ border: "1px solid black" }}>
                                        {summary.planned.toFixed(2)}
                                      </TableCell>
                                      <TableCell sx={{ border: "1px solid black" }}>
                                        {summary.actual.toFixed(2)}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          border: "1px solid black",
                                          fontWeight: "bold",
                                          color: diffPercent >= 0 ? "green" : "red",
                                        }}
                                      >
                                        {summary.planned !== 0
                                          ? Math.abs(diffPercent).toFixed(2) + "%"
                                          : ""}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                            </TableBody>
                          </Table>

                          <TablePagination
                            component="div"
                            count={Object.keys(
                              batchData.reduce((acc, item) => {
                                const key = `${item.materialName}___${item.materialCode}`;
                                if (!acc[key])
                                  acc[key] = { ...item, planned: 0, actual: 0 };
                                acc[key].planned += parseFloat(item.setPointFloat) || 0;
                                acc[key].actual += parseFloat(item.actualValueFloat) || 0;
                                return acc;
                              }, {})
                            ).length}
                            page={materialPage}
                            onPageChange={(e, newPage) => setMaterialPage(newPage)}
                            rowsPerPage={materialRowsPerPage}
                            onRowsPerPageChange={(e) => {
                              setMaterialRowsPerPage(parseInt(e.target.value, 10));
                              setMaterialPage(0);
                            }}
                            rowsPerPageOptions={[5, 10, 25, 30, 39]}
                          />
                        </>
                      )}


                      {activeTable === "detailedReport" && (
                        <>
                          <div className="batch-container">
                            <Typography
                              variant="h6"
                              style={{ fontWeight: "bold", padding: 16 }}
                            >
                              Detailed Report Summary
                            </Typography>
                            <Table sx={{ borderCollapse: "collapse", width: "100%", mt: 2 }}>
                              <TableHead>
                                <TableRow
                                  sx={{
                                    backgroundColor: getHexByName(selectedCardBgColor),
                                    color: getTextColorForBackground(selectedCardBgColor),
                                  }}
                                >
                                  {[
                                    "Batch",
                                    "Material Name",
                                    "Code",
                                    "Set Point",
                                    "Actual",
                                    "Err Kg",
                                    "Err %",
                                  ].map((head, idx) => (
                                    <TableCell
                                      key={idx}
                                      sx={{
                                        border: "1px solid #bdbdbd",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                        fontSize: idx === 0 ? "1rem" : undefined,
                                        color: getTextColorForBackground(selectedCardBgColor),
                                      }}
                                    >
                                      {head}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableHead>

                              <TableBody>
                                {paginatedGroupedBatchData.map(([key, items], groupIndex) => {
                                  const [batchName, productName] = key.split("___");

                                  const totalSetPoint = items.reduce(
                                    (sum, i) => sum + (parseFloat(i.setPointFloat) || 0),
                                    0
                                  );
                                  const totalActual = items.reduce(
                                    (sum, i) => sum + (parseFloat(i.actualValueFloat) || 0),
                                    0
                                  );
                                  const totalErrKg = totalActual - totalSetPoint;
                                  const totalErrPercentage =
                                    items.reduce((sum, i) => {
                                      const set = parseFloat(i.setPointFloat) || 0;
                                      const actual = parseFloat(i.actualValueFloat) || 0;
                                      if (set === 0) return sum;
                                      return sum + ((actual - set) / set) * 100;
                                    }, 0) / items.length || 0;

                                  return (
                                    <React.Fragment key={groupIndex}>
                                      {items.map((item, idx) => {
                                        const errKg =
                                          (item.actualValueFloat || 0) - (item.setPointFloat || 0);
                                        const errPercentage =
                                          item.setPointFloat !== 0
                                            ? ((item.actualValueFloat - item.setPointFloat) /
                                              item.setPointFloat) *
                                            100
                                            : 0;

                                        return (
                                          <TableRow key={idx}>
                                            {idx === 0 && (
                                              <TableCell
                                                rowSpan={items.length}
                                                sx={{
                                                  border: "1px solid #bdbdbd",
                                                  verticalAlign: "top",
                                                  minWidth: 220,
                                                  backgroundColor: "#fff",
                                                  fontSize: "1rem",
                                                  padding: "12px 8px",
                                                }}
                                              >
                                                <div>
                                                  <span style={{ fontWeight: 600 }}>
                                                    Batch : {item.batchName}
                                                  </span>
                                                  <br />
                                                  <span style={{ fontWeight: 600 }}>
                                                    Product : {item.productName}
                                                  </span>
                                                  <br />
                                                  <span>
                                                    Started: <b>{item.batchStart}</b>
                                                  </span>
                                                  <br />
                                                  <span>
                                                    Ended: <b>{item.batchEnd}</b>
                                                  </span>
                                                  <br />
                                                  <span>
                                                    Quantity: <b>{item.quantity}</b>
                                                  </span>
                                                </div>
                                              </TableCell>
                                            )}

                                            <TableCell sx={{ border: "1px solid #bdbdbd" }}>
                                              {item.materialName}
                                            </TableCell>
                                            <TableCell
                                              sx={{ border: "1px solid #bdbdbd", textAlign: "center" }}
                                            >
                                              {item.materialCode}
                                            </TableCell>
                                            <TableCell
                                              sx={{ border: "1px solid #bdbdbd", textAlign: "center" }}
                                            >
                                              {item.setPointFloat?.toFixed(2)}
                                            </TableCell>
                                            <TableCell
                                              sx={{ border: "1px solid #bdbdbd", textAlign: "center" }}
                                            >
                                              {item.actualValueFloat?.toFixed(2)}
                                            </TableCell>
                                            <TableCell
                                              sx={{ border: "1px solid #bdbdbd", textAlign: "center" }}
                                            >
                                              {Math.abs(errKg).toFixed(2)}
                                            </TableCell>
                                            <TableCell
                                              sx={{
                                                border: "1px solid #bdbdbd",
                                                textAlign: "center",
                                                fontWeight: "bold",
                                                color:
                                                  errPercentage < 0 ? "#d32f2f" : "#388e3c",
                                              }}
                                            >
                                              {Math.abs(errPercentage).toFixed(2)}%
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}

                                      {/* Total row for each group */}
                                      <TableRow
                                        sx={{
                                          fontWeight: "bold",
                                          backgroundColor: "#e0e0e0",
                                        }}
                                      >
                                        <TableCell sx={{ border: "1px solid #bdbdbd" }}>
                                          <strong>Total</strong>
                                        </TableCell>
                                        <TableCell sx={{ border: "1px solid #bdbdbd" }} />
                                        <TableCell sx={{ border: "1px solid #bdbdbd" }} />
                                        <TableCell sx={{ border: "1px solid #bdbdbd" }}>
                                          {totalSetPoint.toFixed(2)}
                                        </TableCell>
                                        <TableCell sx={{ border: "1px solid #bdbdbd" }}>
                                          {totalActual.toFixed(2)}
                                        </TableCell>
                                        <TableCell
                                          sx={{
                                            border: "1px solid #bdbdbd",
                                            textAlign: "center",
                                          }}
                                        >
                                          {Math.abs(totalErrKg).toFixed(2)}
                                        </TableCell>
                                        <TableCell
                                          sx={{
                                            border: "1px solid #bdbdbd",
                                            textAlign: "center",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          {Math.abs(totalErrPercentage).toFixed(2)}%
                                        </TableCell>
                                      </TableRow>
                                    </React.Fragment>
                                  );
                                })}
                              </TableBody>
                            </Table>

                            {/* Pagination */}
                            <TablePagination
                              rowsPerPageOptions={[5, 10, 25, 50]}
                              component="div"
                              count={groupedBatchData.length}
                              rowsPerPage={batchRowsPerPage}
                              page={batchPage}
                              onPageChange={handleBatchPageChange}
                              onRowsPerPageChange={handleBatchRowsPerPageChange}
                              sx={{ backgroundColor: "#f5f5f5", borderTop: "1px solid #ccc" }}
                            />
                          </div>
                        </>
                      )}
                    </TableContainer>
                  )}
                </div>
              </div>
            </>
          ) : (
            // Graph View
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
                    }}
                  >
                    <Typography sx={{ fontWeight: 600 }} mb={1}>
                      Start Date
                    </Typography>
                    <FormControl size="small" fullWidth>
                      <DatePicker
                        value={selectedStartDate}
                        onChange={handleStartDateChange}
                        format="MM/dd/yyyy"
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
                    }}
                  >
                    <Typography sx={{ fontWeight: 600 }} mb={1}>
                      End Date
                    </Typography>
                    <FormControl size="small" fullWidth>
                      <DatePicker
                        value={selectedEndDate}
                        onChange={handleEndDateChange}
                        format="MM/dd/yyyy"
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

                  {/* BATCH */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      minWidth: 160,
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

                  {/* PRODUCT */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      minWidth: 160,
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
                  {/* MATERIAL */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      flex: "1 1 180px",
                      maxWidth: 200,
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
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Grid container spacing={3} sx={{ marginBottom: "10px" }}>
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

                    {/* Bottom Section */}
                    <Grid
                      container
                      spacing={2}
                      sx={{
                        height: "100%",
                        marginLeft: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      <Grid
                        item
                        container
                        spacing={2}
                        xs={12}
                        sx={{ height: "40%" }}
                      >
                        {/* Left side - Doughnut chart (4 columns) */}
                        <Grid item xs={12} md={4} sx={{ height: "100%" }}>
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
                                      cutout: "70%", // wider filling
                                      plugins: {
                                        centerText: {}, // no need for text prop, it's now inside plugin
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

                        {/* Right side - Line chart (8 columns) */}
                        <Grid item xs={12} md={8} sx={{ height: "100%" }}>
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
                                        label: "Amount ($)",
                                        showMark: ({ index }) =>
                                          lineData.datasets[0].data[index] > 0,
                                        highlightScope: {
                                          faded: "global",
                                          highlighted: "item",
                                        },
                                        markType: "circle",
                                        color: lineStrokeColor, // keep the line dark
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
                                          angle: 0, // Rotate labels to avoid overlap
                                          textAnchor: "end", // Align nicely
                                        },
                                      },
                                    ]}
                                    yAxis={[
                                      {
                                        scaleType: "linear",
                                        min: 0,
                                        valueFormatter: (value) =>
                                          `$${value.toLocaleString()}`,
                                      },
                                    ]}
                                    margin={{
                                      left: 30,
                                      right: 30,
                                      top: 30,
                                      bottom: 50, // Add more bottom space
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
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid container spacing={2} sx={{ height: "100%" }}>
                    {/* Row 1 */}
                    <Grid
                      item
                      container
                      spacing={2}
                      xs={12}
                      sx={{ height: "40%" }}
                    >
                      {/* Product Distribution Bar Chart */}
                      <Grid item xs={12} md={6} sx={{ height: "100%" }}>
                        <Card sx={{ height: "100%" }}>
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

                      {/* Product Distribution Pie Chart */}
                      <Grid item xs={12} md={6} sx={{ height: "100%" }}>
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
                    </Grid>

                    {/* Row 2 */}
                    <Grid
                      item
                      container
                      spacing={2}
                      xs={12}
                      sx={{ height: "30%" }}
                    >
                      {/* Product Distribution Status & Bar Chart */}
                      <Grid item xs={12} md={6} sx={{ height: "100%" }}>
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

                      {/* Batch Timeline Line Chart */}
                      <Grid item xs={12} md={6} sx={{ height: "100%" }}>
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
                    </Grid>

                    {/* Row 3 */}
                    <Grid container spacing={2} xs={12} sx={{ height: "60%" }}>
                      {/* First Row */}
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
                      {/* Second Row */}
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
                </Grid>
              </Box>
            </Box>
          )}
        </Box>
      </LocalizationProvider>
    </div>
  );
};

export default Dashboard;
