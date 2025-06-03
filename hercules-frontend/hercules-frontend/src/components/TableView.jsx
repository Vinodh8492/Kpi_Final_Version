import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Menu,
  TablePagination,
} from "@mui/material";

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
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import "../App.css";
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

const TableView = () => {


  const [batchData, setBatchData] = useState([]);
  const [selectedCardBgColor, setSelectedCardBgColor] = useState("White");
  const [lineStrokeColor, setLineStrokeColor] = useState("#33691e");
  const [pointFillColor, setPointFillColor] = useState("#a2cb74");
  const [gradientColors, setGradientColors] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [secondAnchorEl, setSecondAnchorEl] = useState(null);
  const [thirdAnchorEl, setThirdAnchorEl] = useState(null);
  const [activeTable, setActiveTable] = useState("productBatchSummary"); // Default to weekly report
  const [viewReport, setViewReport] = useState(true); // Set to true by default
  const [lazyLoadMode, setLazyLoadMode] = useState(false); // Toggle between pagination and lazy loading
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  // New state variables for report-specific views
  const [viewWeeklyReport, setViewWeeklyReport] = useState(false);
  const [viewMonthlyReport, setViewMonthlyReport] = useState(false);
  const [viewDailyReport, setViewDailyReport] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);

  //pagination
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [batchPage, setBatchPage] = React.useState(0);
  const [batchRowsPerPage, setBatchRowsPerPage] = React.useState(5);
  const [batchProdPage, setBatchProdPage] = useState(0);
  const [batchProdRowsPerPage, setBatchProdRowsPerPage] = useState(10);
  const [materialPage, setMaterialPage] = useState(0);
  const [materialRowsPerPage, setMaterialRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0); // Add state for total record count

  // boxes
  const [boxBatchNames, setBoxBatchNames] = useState([]);
  const [boxProductNames, setBoxProductNames] = useState([]);
  const [selectedBoxStartDate, setSelectedBoxStartDate] = useState(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const monday = new Date(today);
    // If today is Sunday (0), go back 6 days to get to Monday
    // Otherwise subtract current day - 1 to get to Monday
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });
  const [selectedBoxEndDate, setSelectedBoxEndDate] = useState(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const sunday = new Date(today);
    // If today is Sunday (0), use today
    // Otherwise add 7 - current day to get to Sunday
    sunday.setDate(today.getDate() + (currentDay === 0 ? 0 : 7 - currentDay));
    sunday.setHours(23, 59, 59, 999);
    return sunday;
  });
  const [selectedBoxProduct, setSelectedBoxProduct] = useState([]);
  const [selectedBoxMaterial, setSelectedBoxMaterial] = useState([]);

  const [selectedBoxBatchName, setSelectedBoxBatchName] = useState([]);
  const [boxMaterialNames, setBoxMaterialNames] = useState([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(true); // Set to true by default
  const [hasMore, setHasMore] = useState(true);

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

  const handleStartBoxDateChange = (newDate) => {
    if (newDate) {
      setSelectedBoxStartDate(newDate);
    }
  };

  const handleEndBoxDateChange = (newDate) => {
    if (newDate) {
      setSelectedBoxEndDate(newDate);
    }
  };
  //pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    // With server-side pagination, we need to fetch data when page changes
    // The fetchBoxData dependency already includes page, so it will trigger automatically
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page when changing rows per page
    // With server-side pagination, we need to fetch data when rowsPerPage changes
    // The fetchBoxData dependency already includes rowsPerPage, so it will trigger automatically
  };

  const paginatedData = useMemo(() => {
    return [...batchData]
      .sort((a, b) => a.orderId - b.orderId)
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [batchData, page, rowsPerPage]);

  const dailySummaryData = useMemo(() => {
    return Object.values(
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
  }, [batchData, startDate]);

  const paginatedDailyData = useMemo(() => {
    return dailySummaryData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [dailySummaryData, page, rowsPerPage]);

  const groupedBatchData = useMemo(() => {
    return Object.entries(
      batchData.reduce((acc, item) => {
        const key = `${item.batchName?.trim()}___${item.productName?.trim()}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {})
    );
  }, [batchData]);

  const paginatedGroupedBatchData = useMemo(() => {
    return groupedBatchData.slice(
      batchPage * batchRowsPerPage,
      batchPage * batchRowsPerPage + batchRowsPerPage
    );
  }, [groupedBatchData, batchPage, batchRowsPerPage]);

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

  const weeklyData = useMemo(() => filterWeekly(), [batchData, weekStartDate]);
  const monthlyData = useMemo(() => filterMonthly(), [batchData, monthStartDate]);

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

  const paginationWM = (data) => {
    return data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
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

  // Fetch data specifically for reports (daily, weekly, monthly)
  const fetchReportData = async (reportType) => {
    try {
      setReportLoading(true);
      
      // Determine the date range based on report type
      let reportStartDate, reportEndDate;
      
      if (reportType === 'daily') {
        reportStartDate = startDate;
        reportEndDate = new Date(startDate);
        reportEndDate.setDate(reportEndDate.getDate() + 1);
      } else if (reportType === 'weekly') {
        reportStartDate = weekStartDate;
        reportEndDate = new Date(weekStartDate);
        reportEndDate.setDate(reportEndDate.getDate() + 7);
      } else if (reportType === 'monthly') {
        reportStartDate = monthStartDate;
        reportEndDate = new Date(monthStartDate);
        reportEndDate.setMonth(reportEndDate.getMonth() + 1);
      } else {
        console.error("Invalid report type");
        setReportLoading(false);
        return;
      }
      
      // Prepare API URL with query parameters
      let apiUrl = "http://127.0.0.1:5000/api/reports";
      const params = new URLSearchParams();
      
      // Add date range parameters - these are required
      params.append('startDate', reportStartDate.toISOString());
      params.append('endDate', reportEndDate.toISOString());
      params.append('reportType', reportType);
      
      // Apply filters if available
      if (selectedBoxBatchName.length > 0) {
        selectedBoxBatchName.forEach(batch => params.append('batch', batch));
      }
      
      if (selectedBoxProduct.length > 0) {
        selectedBoxProduct.forEach(product => params.append('product', product));
      }
      
      if (selectedBoxMaterial.length > 0) {
        selectedBoxMaterial.forEach(material => params.append('material', material));
      }
      
      // Append params to URL
      apiUrl += '?' + params.toString();
      
      console.log(`Fetching ${reportType} report data with URL:`, apiUrl);

      const response = await axios.get(apiUrl);
      let data = response.data;

      console.log(`Received ${reportType} report data:`, data);
      
      // Format the data for display
      if (data && data.data && Array.isArray(data.data)) {
        const formattedData = data.data.map((item) => ({
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

        setReportData(formattedData);
        
        // Set the corresponding view state to true
        if (reportType === 'daily') {
          setViewDailyReport(true);
        } else if (reportType === 'weekly') {
          setViewWeeklyReport(true);
        } else if (reportType === 'monthly') {
          setViewMonthlyReport(true);
        }
      } else {
        console.error("Invalid data format received from API");
        setReportData([]);
      }
    } catch (error) {
      console.error(`Error fetching ${reportType} report data:`, error);
      setReportData([]);
    } finally {
      setReportLoading(false);
    }
  };

  // Debounce function to prevent excessive API calls
  const useDebounce = (callback, delay) => {
    const timeoutRef = useRef(null);
    
    return useCallback((...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }, [callback, delay]);
  };
  
  // Replace the existing fetchBoxData with an optimized version
  const fetchBoxData = useCallback(async () => {
    try {
      // Skip data fetching if dates are missing
      if (!selectedBoxStartDate || !selectedBoxEndDate) {
        console.warn("Please select both start and end dates");
        return;
      }

      // Set loading state to true
      setIsLoading(true);

      // Prepare API URL with query parameters - explicitly excluding any limit parameter
      let apiUrl = "http://127.0.0.1:5000/api/kpi";
      // const params = new URLSearchParams();
      
      // // Add date range parameters - these are required
      // params.append('startDate', selectedBoxStartDate.toISOString());
      // params.append('endDate', selectedBoxEndDate.toISOString());
      
      // // IMPORTANT: Force strict date filtering on the backend
      // params.append('strictDateFilter', 'true');
      
      // // Add server-side pagination parameters
      // // Instead of fetching all data at once, request only the current page
      // params.append('page', page.toString());
      // params.append('limit', rowsPerPage.toString());
      
      // // Add batch, product, and material filters if selected
      // if (selectedBoxBatchName.length > 0) {
      //   selectedBoxBatchName.forEach(batch => params.append('batch', batch));
      // }
      
      // if (selectedBoxProduct.length > 0) {
      //   selectedBoxProduct.forEach(product => params.append('product', product));
      // }
      
      // if (selectedBoxMaterial.length > 0) {
      //   selectedBoxMaterial.forEach(material => params.append('material', material));
      // }
      
      // // Append params to URL
      // apiUrl += '?' + params.toString();
      
      // console.log("Fetching data with URL:", apiUrl);

      const response = await axios.get(apiUrl);

      let data = response.data;
      console.log("reports :", data)

      console.log(`Raw data response length: ${typeof data === 'object' ? 
        (Array.isArray(data) ? data.length : Object.keys(data).length) : 
        'not an object'}`);

      // Process data asynchronously to avoid UI blocking
      setTimeout(() => {
        // If response is a string, try parsing it
        if (typeof data === "string") {
          try {
            data = JSON.parse(data.replace(/NaN/g, "null"));
          } catch (parseError) {
            console.error("Error parsing JSON:", parseError.message);
            setIsLoading(false);
            return;
          }
        }

        // If response is an object with a specific key (like result or data), unwrap it
        let totalCount = 0;
        if (!Array.isArray(data) && typeof data === "object") {
          if (data.totalCount) {
            totalCount = data.totalCount;
          }
          
          if (Array.isArray(data.result)) {
            data = data.result;
          } else if (Array.isArray(data.data)) {
            data = data.data;
          } else {
            console.error("Expected array but got object:", data);
            setIsLoading(false);
            return;
          }
        }

        // Final safety check
        if (!Array.isArray(data)) {
          console.error("Expected array, got:", typeof data, data);
          setIsLoading(false);
          return;
        }

        console.log(`Received ${data.length} records for the selected date range`);

        // For dropdown filters, still fetch all unique values
        const fetchMetadata = async () => {
          try {
            // Fetch only the metadata needed for dropdowns with a separate request
            let metadataUrl = "http://127.0.0.1:5000/api/kpi/metadata";
            const metadataParams = new URLSearchParams();
            metadataParams.append('startDate', selectedBoxStartDate.toISOString());
            metadataParams.append('endDate', selectedBoxEndDate.toISOString());
            metadataUrl += '?' + metadataParams.toString();
            
            const metadataResponse = await axios.get(metadataUrl);
            let metadata = metadataResponse.data;
            
            if (metadata && metadata.batchNames) {
              setBoxBatchNames(metadata.batchNames);
            }
            if (metadata && metadata.productNames) {
              setBoxProductNames(metadata.productNames);
            }
            if (metadata && metadata.materialNames) {
              setBoxMaterialNames(metadata.materialNames);
            }
          } catch (error) {
            console.error("Error fetching metadata:", error);
            // Fallback to extracting from current data if metadata endpoint fails
            setBoxBatchNames(Array.from(new Set(data.map(item => item["Batch Name"]))));
            setBoxProductNames(Array.from(new Set(data.map(item => item["Product Name"]))));
            setBoxMaterialNames(Array.from(new Set(data.map(item => item["Material Name"]))));
          }
        };
        
        // Fetch metadata in the background
        fetchMetadata();

        // Format the data - no need to filter it again since the server already filtered it
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

        // Only append data if page > 0, otherwise replace the data
        // This maintains the lazy loading functionality without directly referencing lazyLoadMode
        if (page > 0) {
          setBatchData(prev => [...prev, ...formattedData]);
        } else {
          setBatchData(formattedData);
        }
        
        // Update the total count for proper pagination
        if (totalCount > 0) {
          setTotalRecords(totalCount);
        }
        
        // Set other relevant flags
        if (!viewReport) {
          setViewReport(true);
        }
        if (!initialLoadComplete) {
          setInitialLoadComplete(true);
        }
        
        // Set loading state to false
        setIsLoading(false);
      }, 0);
    } catch (error) {
      console.error("Error fetching table data:", error);
      setIsLoading(false);
    }
  }, [selectedBoxStartDate, selectedBoxEndDate, selectedBoxBatchName, selectedBoxProduct, selectedBoxMaterial, page, rowsPerPage]);
  
  // Create a debounced version of fetchBoxData
  const debouncedFetchBoxData = useDebounce(fetchBoxData, 300);

  // Update useEffect to use the debounced fetch
  useEffect(() => {
    // Load data when component mounts and when filters change
    debouncedFetchBoxData();
  }, [
    // On first render and when these dependencies change
    selectedBoxStartDate,
    selectedBoxEndDate,
    selectedBoxBatchName,
    selectedBoxProduct,
    selectedBoxMaterial,
    debouncedFetchBoxData
  ]);

  useEffect(() => {
    const selectedHex = getHexByName(selectedCardBgColor);
    const newGradient = getGradientColors(selectedHex);
    setGradientColors(newGradient);
    setLineStrokeColor(newGradient[newGradient.length - 1]);
    setPointFillColor(newGradient[0]);
  }, [selectedCardBgColor]);

  const [handleButton, setHandleButton] = useState(false)

  // Add a new useEffect to automatically fetch weekly report data when component mounts
  useEffect(() => {
    // Automatically load weekly report data on initial mount
    if (activeTable === "nfmWeekly" && !viewWeeklyReport) {
      fetchReportData('weekly');
    }
  }, []); // Empty dependency array means this runs once on mount

  // Function to handle printing the table data
  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Define headers and data based on the active table
    let headers = [];
    let tableData = [];
    let title = "Hercules Report";
    
    if (activeTable === "nfmWeekly") {
      title = "NFM Weekly Report";
      headers = [
        "Batch Name",
        "Product Name",
        "Batch Start",
        "Batch End",
        "Quantity",
        "Material Name",
        "Material Code",
        "SetPoint Float",
        "Actual Value Float"
      ];
      tableData = viewWeeklyReport ? reportData : weeklyData;
    } 
    else if (activeTable === "nfmMonthly") {
      title = "NFM Monthly Report";
      headers = [
        "Product Name",
        "No Of Batches",
        "Sum SP",
        "Sum Act",
        "Err Kg",
        "Err %"
      ];
      // Process data for monthly report
      tableData = viewMonthlyReport 
        ? Object.values(
            reportData.reduce((acc, item) => {
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
        : Object.values(
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
          );
    }
    else if (activeTable === "dailyReport") {
      title = "Daily Report Summary";
      headers = [
        "Product Name",
        "No Of Batches",
        "Sum SP",
        "Sum Act",
        "Err Kg",
        "Err %"
      ];
      // Process data for daily report
      tableData = viewDailyReport 
        ? Object.values(
            reportData.reduce((acc, item) => {
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
        : dailySummaryData;
    }
    else if (activeTable === "productBatchSummary") {
      title = "Product Batch Summary";
      headers = [
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
        "Order ID"
      ];
      tableData = batchData;
    }
    else if (activeTable === "materialConsumptionReport") {
      title = "Material Consumption Report";
      headers = [
        "Material Name",
        "Code",
        "Planned KG",
        "Actual KG",
        "Difference %"
      ];
      // Process data for material consumption
      tableData = Object.entries(
        batchData.reduce((acc, item) => {
          const key = `${item.materialName}___${item.materialCode}`;
          if (!acc[key])
            acc[key] = { ...item, planned: 0, actual: 0 };
          acc[key].planned += parseFloat(item.setPointFloat) || 0;
          acc[key].actual += parseFloat(item.actualValueFloat) || 0;
          return acc;
        }, {})
      ).map(([key, summary]) => {
        const diff = summary.actual - summary.planned;
        const diffPercent = summary.planned !== 0 ? (diff / summary.planned) * 100 : 0;
        return {
          materialName: summary.materialName,
          materialCode: summary.materialCode,
          planned: summary.planned.toFixed(2),
          actual: summary.actual.toFixed(2),
          diffPercent: summary.planned !== 0 ? Math.abs(diffPercent).toFixed(2) + "%" : ""
        };
      });
    }
    
    // Generate table HTML for all data (not just paginated data)
    let tableHtml = `
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            ${headers.map(header => `<th>${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
    `;
    
    // Add all rows based on active table
    if (activeTable === "nfmWeekly") {
      tableData.forEach(item => {
        tableHtml += `<tr>
          <td>${item.batchName || ''}</td>
          <td>${item.productName || ''}</td>
          <td>${item.batchStart || ''}</td>
          <td>${item.batchEnd || ''}</td>
          <td>${item.quantity || ''}</td>
          <td>${item.materialName || ''}</td>
          <td>${item.materialCode || ''}</td>
          <td>${item.setPointFloat ? item.setPointFloat.toFixed(2) : ''}</td>
          <td>${item.actualValueFloat ? item.actualValueFloat.toFixed(2) : ''}</td>
        </tr>`;
      });
    } 
    else if (activeTable === "nfmMonthly" || activeTable === "dailyReport") {
      tableData.forEach(summary => {
        const errKg = summary.sumAct - summary.sumSP;
        const errPercentRaw = summary.sumSP !== 0 ? (errKg / summary.sumSP) * 100 : 0;
        const errPercent = Math.abs(errPercentRaw).toFixed(2);
        const errColor = errPercentRaw < 0 ? "red" : "green";
        
        tableHtml += `<tr>
          <td>${summary.productName || ''}</td>
          <td>${summary.batchCount || ''}</td>
          <td>${summary.sumSP.toFixed(2)}</td>
          <td>${summary.sumAct.toFixed(2)}</td>
          <td>${errKg.toFixed(2)}</td>
          <td style="color: ${errColor}; font-weight: bold;">${errPercent}%</td>
        </tr>`;
      });
    }
    else if (activeTable === "productBatchSummary") {
      tableData.forEach(item => {
        tableHtml += `<tr>
          <td>${item.batchName || ''}</td>
          <td>${item.productName || ''}</td>
          <td>${item.batchStart || ''}</td>
          <td>${item.batchEnd || ''}</td>
          <td>${item.quantity || ''}</td>
          <td>${item.materialName || ''}</td>
          <td>${item.materialCode || ''}</td>
          <td>${item.setPointFloat ? item.setPointFloat.toFixed(2) : ''}</td>
          <td>${item.actualValueFloat ? item.actualValueFloat.toFixed(2) : ''}</td>
          <td>${item.sourceServer || ''}</td>
          <td>${item.orderId || ''}</td>
        </tr>`;
      });
    }
    else if (activeTable === "materialConsumptionReport") {
      tableData.forEach(item => {
        tableHtml += `<tr>
          <td>${item.materialName || ''}</td>
          <td>${item.materialCode || ''}</td>
          <td>${item.planned || ''}</td>
          <td>${item.actual || ''}</td>
          <td style="font-weight: bold;">${item.diffPercent || ''}</td>
        </tr>`;
      });
    }
    
    tableHtml += `
        </tbody>
      </table>
    `;
    
    // Add the header and table content to the print window
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header { text-align: center; margin-bottom: 20px; padding: 10px; }
            .header h1 { margin: 0; }
            .header p { margin: 5px 0; }
            @media print {
              .no-print { display: none; }
              body { margin: 0.5cm; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
            <p>${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
          </div>
          ${tableHtml}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = () => {
      printWindow.close();
    };
  };

  // Function to export table data to CSV
  const exportToCSV = (tableId) => {
    // Define headers and data based on the active table
    let headers = [];
    let tableData = [];
    
    if (activeTable === "nfmWeekly") {
      headers = [
        "Batch Name",
        "Product Name",
        "Batch Start",
        "Batch End",
        "Quantity",
        "Material Name",
        "Material Code",
        "SetPoint Float",
        "Actual Value Float"
      ];
      tableData = viewWeeklyReport ? reportData : weeklyData;
    } 
    else if (activeTable === "nfmMonthly") {
      headers = [
        "Product Name",
        "No Of Batches",
        "Sum SP",
        "Sum Act",
        "Err Kg",
        "Err %"
      ];
      // Process data for monthly report
      tableData = viewMonthlyReport 
        ? Object.values(
            reportData.reduce((acc, item) => {
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
        : Object.values(
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
          );
    }
    else if (activeTable === "dailyReport") {
      headers = [
        "Product Name",
        "No Of Batches",
        "Sum SP",
        "Sum Act",
        "Err Kg",
        "Err %"
      ];
      // Process data for daily report
      tableData = viewDailyReport 
        ? Object.values(
            reportData.reduce((acc, item) => {
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
        : dailySummaryData;
    }
    else if (activeTable === "productBatchSummary") {
      headers = [
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
        "Order ID"
      ];
      tableData = batchData;
    }
    else if (activeTable === "materialConsumptionReport") {
      headers = [
        "Material Name",
        "Code",
        "Planned KG",
        "Actual KG",
        "Difference %"
      ];
      // Process data for material consumption
      tableData = Object.entries(
        batchData.reduce((acc, item) => {
          const key = `${item.materialName}___${item.materialCode}`;
          if (!acc[key])
            acc[key] = { ...item, planned: 0, actual: 0 };
          acc[key].planned += parseFloat(item.setPointFloat) || 0;
          acc[key].actual += parseFloat(item.actualValueFloat) || 0;
          return acc;
        }, {})
      ).map(([key, summary]) => {
        const diff = summary.actual - summary.planned;
        const diffPercent = summary.planned !== 0 ? (diff / summary.planned) * 100 : 0;
        return {
          materialName: summary.materialName,
          materialCode: summary.materialCode,
          planned: summary.planned.toFixed(2),
          actual: summary.actual.toFixed(2),
          diffPercent: summary.planned !== 0 ? Math.abs(diffPercent).toFixed(2) + "%" : ""
        };
      });
    }
    
    // Create CSV rows
    let csv = [];
    
    // Add headers
    csv.push(headers.map(header => `"${header}"`).join(','));
    
    // Add data rows based on active table
    if (activeTable === "nfmWeekly") {
      tableData.forEach(item => {
        const row = [
          `"${item.batchName || ''}"`,
          `"${item.productName || ''}"`,
          `"${item.batchStart || ''}"`,
          `"${item.batchEnd || ''}"`,
          `"${item.quantity || ''}"`,
          `"${item.materialName || ''}"`,
          `"${item.materialCode || ''}"`,
          `"${item.setPointFloat ? item.setPointFloat.toFixed(2) : ''}"`,
          `"${item.actualValueFloat ? item.actualValueFloat.toFixed(2) : ''}"`
        ];
        csv.push(row.join(','));
      });
    } 
    else if (activeTable === "nfmMonthly" || activeTable === "dailyReport") {
      tableData.forEach(summary => {
        const errKg = summary.sumAct - summary.sumSP;
        const errPercentRaw = summary.sumSP !== 0 ? (errKg / summary.sumSP) * 100 : 0;
        const errPercent = Math.abs(errPercentRaw).toFixed(2);
        
        const row = [
          `"${summary.productName || ''}"`,
          `"${summary.batchCount || ''}"`,
          `"${summary.sumSP.toFixed(2)}"`,
          `"${summary.sumAct.toFixed(2)}"`,
          `"${errKg.toFixed(2)}"`,
          `"${errPercent}%"`
        ];
        csv.push(row.join(','));
      });
    }
    else if (activeTable === "productBatchSummary") {
      tableData.forEach(item => {
        const row = [
          `"${item.batchName || ''}"`,
          `"${item.productName || ''}"`,
          `"${item.batchStart || ''}"`,
          `"${item.batchEnd || ''}"`,
          `"${item.quantity || ''}"`,
          `"${item.materialName || ''}"`,
          `"${item.materialCode || ''}"`,
          `"${item.setPointFloat ? item.setPointFloat.toFixed(2) : ''}"`,
          `"${item.actualValueFloat ? item.actualValueFloat.toFixed(2) : ''}"`,
          `"${item.sourceServer || ''}"`,
          `"${item.orderId || ''}"`
        ];
        csv.push(row.join(','));
      });
    }
    else if (activeTable === "materialConsumptionReport") {
      tableData.forEach(item => {
        const row = [
          `"${item.materialName || ''}"`,
          `"${item.materialCode || ''}"`,
          `"${item.planned || ''}"`,
          `"${item.actual || ''}"`,
          `"${item.diffPercent || ''}"`
        ];
        csv.push(row.join(','));
      });
    }
    
    // Create and download the CSV file
    const csvString = csv.join('\n');
    const filename = `${activeTable}_report_${new Date().toISOString().slice(0, 10)}.csv`;
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvString);
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add a reference for the loader element and lazy loading functionality
  const loaderRef = useRef(null);

  // Implement lazy loading with IntersectionObserver
  useEffect(() => {
    if (!lazyLoadMode || !loaderRef.current) return;

    const options = {
      root: null,
      rootMargin: '20px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        // Load more data when the loader element is visible
        const nextPage = page + 1;
        setPage(nextPage);
      }
    }, options);

    observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [page, hasMore, isLoading, lazyLoadMode]);

  // Update hasMore state when data is loaded
  useEffect(() => {
    // Check if we have loaded all data
    setHasMore(batchData.length < totalRecords);
  }, [batchData.length, totalRecords]);

  return (
    <div ref={dashboardRef} className="print-container">
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ p: 3 }}>
          {/* Loading indicator */}
          {isLoading && (
            <Box 
              sx={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                width: '100%', 
                zIndex: 9999,
                backgroundColor: '#1976d2',
                height: '3px',
                animation: 'loading 2s infinite',
                '@keyframes loading': {
                  '0%': { width: '0%' },
                  '50%': { width: '50%' },
                  '100%': { width: '100%' }
                }
              }} 
            />
          )}
          
          <div id="non-printable-area">
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
            </Box>
          </div>

          <>

              <div id="external-component-id">

             

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
                    order: 1
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }} mb={1}>
                    Select Start Date:
                  </Typography>
                  <DateTimePicker
                    value={selectedBoxStartDate}
                    onChange={handleStartBoxDateChange}
                    format="MM/dd/yyyy HH:mm"
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
                    order: 2
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }} mb={1}>
                    Select End Date:
                  </Typography>
                  <DateTimePicker
                    value={selectedBoxEndDate}
                    onChange={handleEndBoxDateChange}
                    format="MM/dd/yyyy HH:mm"
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

                {/* Product Dropdown */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    flex: "1 1 180px",
                    maxWidth: 200,
                    order: 3
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

                {/* Batch Dropdown */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    flex: "1 1 180px",
                    maxWidth: 200,
                    order: 4
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

                {/* Material Dropdown */}
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
                    order: 6
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={() => {
                      // Reset data-related flags to trigger a new fetch
                      // with the currently selected filters
                      setViewReport(true);
                      setInitialLoadComplete(true);
                    }}
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
           

            <div>

          
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
                      <DateTimePicker
                        label="Week Start Date"
                        value={weekStartDate}
                        onChange={(newValue) => setWeekStartDate(newValue)}
                        format="MM/dd/yyyy HH:mm"
                        slotProps={{
                          textField: {
                            placeholder: "MM/DD/YYYY HH:MM",
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

                    {/* Add View Button */}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => fetchReportData('weekly')}
                      disabled={reportLoading}
                      sx={{
                        mt: 2,
                        px: 4,
                        py: 1,
                        borderRadius: 2,
                        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                        background: "linear-gradient(145deg, #1976d2, #2196f3)",
                        "&:hover": {
                          background: "linear-gradient(145deg, #1565c0, #1976d2)",
                        },
                      }}
                    >
                      {reportLoading ? "Loading..." : "View"}
                    </Button>
                  </Box>
                )}

                {activeTable === "nfmWeekly" && (viewReport || viewWeeklyReport) && (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: 1,
                      }}
                    >
                      <Typography
                        variant="h6"
                        style={{ fontWeight: "bold", padding: 8 }}
                      >
                        NFM Weekly Summary
                      </Typography>
                      <Box>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handlePrint}
                          sx={{ mr: 1 }}
                        >
                          Print
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => exportToCSV('weekly-report-table')}
                        >
                          Export to CSV
                        </Button>
                      </Box>
                    </Box>

                    <Table
                      id="weekly-report-table"
                      sx={{
                        borderCollapse: "collapse",
                        width: "100%",
                        tableLayout: "fixed",
                      }}
                    >
                      <TableHead
                        sx={{
                          backgroundColor: getHexByName(selectedCardBgColor),
                          color: getTextColorForBackground(selectedCardBgColor),
                        }}
                      >
                        <TableRow>
                          {[
                            "Batch Name",
                            "Product Name",
                            "Batch Start",
                            "Batch End",
                            "Quantity",
                            "Material Name",
                            "Material Code",
                            "SetPoint Float",
                            "Actual Value Float",
                          ].map((header) => (
                            <TableCell
                              key={header}
                              sx={{
                                border: "1px solid black",
                                fontWeight: "bold",
                                padding: "4px",
                                color: getTextColorForBackground(selectedCardBgColor),
                              }}
                            >
                              {header}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {(viewWeeklyReport ? paginationWM(reportData) : paginationWM(weeklyData)).map((item, index) => (
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
                      count={viewWeeklyReport ? reportData.length : weeklyData.length}
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
                      <DateTimePicker
                        label="Select Start Date"
                        value={monthStartDate}
                        onChange={(newValue) => setMonthStartDate(newValue)}
                        format="MM/dd/yyyy HH:mm"
                        views={["year", "month", "day"]}
                        slotProps={{
                          textField: {
                            placeholder: "MM/DD/YYYY HH:MM",
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

                    {/* Add View Button */}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => fetchReportData('monthly')}
                      disabled={reportLoading}
                      sx={{
                        mt: 2,
                        px: 4,
                        py: 1,
                        borderRadius: 2,
                        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                        background: "linear-gradient(145deg, #1976d2, #2196f3)",
                        "&:hover": {
                          background: "linear-gradient(145deg, #1565c0, #1976d2)",
                        },
                      }}
                    >
                      {reportLoading ? "Loading..." : "View"}
                    </Button>
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
                      <DateTimePicker
                        label="Start Date"
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                        format="MM/dd/yyyy HH:mm"
                        slotProps={{
                          textField: {
                            placeholder: "MM/DD/YYYY HH:MM",
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

                    {/* Add View Button */}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => fetchReportData('daily')}
                      disabled={reportLoading}
                      sx={{
                        mt: 2,
                        px: 4,
                        py: 1,
                        borderRadius: 2,
                        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                        background: "linear-gradient(145deg, #1976d2, #2196f3)",
                        "&:hover": {
                          background: "linear-gradient(145deg, #1565c0, #1976d2)",
                        },
                      }}
                    >
                      {reportLoading ? "Loading..." : "View"}
                    </Button>
                  </Box>
                )}



              </div>
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
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: 1,
                          }}
                        >
                          <Typography
                            variant="h6"
                            style={{ fontWeight: "bold", padding: 8 }}
                          >
                            Product Batch Summary
                          </Typography>
                          <Box>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={handlePrint}
                              sx={{ mr: 1 }}
                            >
                              Print
                            </Button>
                            <Button
                              variant="contained"
                              color="secondary"
                              onClick={() => exportToCSV('product-batch-table')}
                              sx={{ mr: 1 }}
                            >
                              Export to CSV
                            </Button>
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={() => setLazyLoadMode(!lazyLoadMode)}
                              sx={{ mr: 1 }}
                            >
                              {lazyLoadMode ? "Use Pagination" : "Use Infinite Scroll"}
                            </Button>
                          </Box>
                        </Box>

                        <Table
                          id="product-batch-table"
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

                        {/* Show pagination or loader based on mode */}
                        {lazyLoadMode ? (
                          <Box 
                            ref={loaderRef} 
                            sx={{ 
                              textAlign: 'center', 
                              padding: 2,
                              display: hasMore ? 'block' : 'none'
                            }}
                          >
                            {isLoading && (
                              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                <Box
                                  sx={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    border: '3px solid #f3f3f3',
                                    borderTop: '3px solid #1976d2',
                                    animation: 'spin 1s linear infinite',
                                    '@keyframes spin': {
                                      '0%': { transform: 'rotate(0deg)' },
                                      '100%': { transform: 'rotate(360deg)' }
                                    }
                                  }}
                                />
                              </Box>
                            )}
                            {!isLoading && hasMore && <Typography>Scroll for more</Typography>}
                            {!hasMore && <Typography>No more data</Typography>}
                          </Box>
                        ) : (
                          <TablePagination
                            rowsPerPageOptions={[5, 10, 25, 50, 100]}
                            component="div"
                            count={totalRecords}
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
                        )}
                      </>
                    )}

                    {activeTable === "dailyReport" && (
                      <>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: 1,
                          }}
                        >
                          <Typography
                            variant="h6"
                            style={{ fontWeight: "bold", padding: 8 }}
                          >
                            Daily Report Summary
                          </Typography>
                          <Box>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={handlePrint}
                              sx={{ mr: 1 }}
                            >
                              Print
                            </Button>
                            <Button
                              variant="contained"
                              color="secondary"
                              onClick={() => exportToCSV('daily-report-table')}
                            >
                              Export to CSV
                            </Button>
                          </Box>
                        </Box>

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
                          <Table id="daily-report-table">
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
                              {viewDailyReport ? 
                                // Use reportData when the new API data is available
                                paginationWM(
                                  Object.values(
                                    reportData.reduce((acc, item) => {
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
                                })
                                :
                                paginatedDailyData.map((summary, idx) => {
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
                            count={viewDailyReport ? 
                              Object.values(
                                reportData.reduce((acc, item) => {
                                  const key = item.productName;
                                  if (!acc[key]) acc[key] = true;
                                  return acc;
                                }, {})
                              ).length 
                              : 
                              dailySummaryData.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Rows per page:"
                          />
                        </Box>
                      </>
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
                                count={groupedBatchData.length}
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

                    {activeTable === "nfmMonthly" && (
                      <>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: 1,
                          }}
                        >
                          <Typography variant="h6" style={{ fontWeight: "bold", padding: 16 }}>
                            NFM ORDER REPORT Monthly
                          </Typography>
                          <Box>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={handlePrint}
                              sx={{ mr: 1 }}
                            >
                              Print
                            </Button>
                            <Button
                              variant="contained"
                              color="secondary"
                              onClick={() => exportToCSV('monthly-report-table')}
                            >
                              Export to CSV
                            </Button>
                          </Box>
                        </Box>
                        <Typography
                          variant="subtitle2"
                          style={{ paddingLeft: 16, marginBottom: 8 }}
                        >
                          Production Period: {new Date(monthStartDate).toLocaleDateString("en-GB")} 07:00 AM -
                          {new Date(new Date(monthStartDate).setMonth(new Date(monthStartDate).getMonth() + 1)).toLocaleDateString("en-GB")} 07:00 AM
                        </Typography>
                        <TableContainer>
                          <Table id="monthly-report-table" sx={{ borderCollapse: "collapse", width: "100%" }}>
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
                              {viewMonthlyReport ? 
                                // Use reportData when the new API data is available
                                paginationWM(
                                  Object.values(
                                    reportData.reduce((acc, item) => {
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
                                })
                                : 
                                // Otherwise use the old filtered data
                                paginationWM(
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
                          {renderPagination(viewMonthlyReport ? reportData : monthlyData)}
                        </TableContainer>
                      </>
                    )}

                    {activeTable === "materialConsumptionReport" && (
                      <>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: 1,
                          }}
                        >
                          <Typography
                            variant="h6"
                            style={{ fontWeight: "bold", padding: 8 }}
                          >
                            Material Consumption Report Summary
                          </Typography>
                          <Box>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={handlePrint}
                              sx={{ mr: 1 }}
                            >
                              Print
                            </Button>
                            <Button
                              variant="contained"
                              color="secondary"
                              onClick={() => exportToCSV('material-consumption-table')}
                            >
                              Export to CSV
                            </Button>
                          </Box>
                        </Box>

                        <Table
                          id="material-consumption-table"
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
                              {batchData.map((item, idx) => {
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
                                    <TableCell
                                      rowSpan={1}
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
                            </TableBody>
                          </Table>

                          {/* Pagination */}
                          <TablePagination
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            component="div"
                            count={batchData.length}
                            rowsPerPage={batchProdRowsPerPage}
                            page={batchProdPage}
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
          </>

        </Box>
      </LocalizationProvider>
    </div>
  );
};

export default TableView;
