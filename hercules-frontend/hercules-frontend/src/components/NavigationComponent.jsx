import React from "react";
import { styled } from "@mui/material/styles";
import { Link, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import WorkOutlinedIcon from '@mui/icons-material/WorkOutlined';
import herculesLogo from "../assets/image.png";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const drawerWidth = 200;

const CustomLink = styled(Link)(() => ({
  textDecoration: "none",
  width: "100%",
}));

export default function SidebarLayout() {
  const location = useLocation();

  const menuItems = [
    { text: "Dashboard", icon: <WarehouseOutlinedIcon />, path: "/" },
    { text: "Batches", icon: <WorkOutlinedIcon />, path: "/batches" },
    {
      text: "Admin", icon: <AdminPanelSettingsIcon fontSize="large" />
      , path: "/Admin"
    },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#D4D6D9",
            borderRight: "1px solid #ccc",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          },
        }}
      >
        <Box sx={{ py: 1, width: 150, height: 60 }}>
          <img
            src={herculesLogo}
            alt="Hercules Logo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        </Box>


        <List sx={{ width: "100%" }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <CustomLink to={item.path} key={item.text}>
                <ListItem disablePadding>
                  <ListItemButton
                    sx={{
                      color: isActive ? "#fff" : "#000",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      margin: "6px 8px",
                      transition: "all 0.3s ease",
                      backgroundColor: isActive ? "#4B5563" : "transparent",
                      '& .MuiListItemIcon-root': {
                        color: isActive ? "#fff" : "#000",
                      },
                      ...(isActive
                        ? {}
                        : {
                          '&:hover': {
                            backgroundColor: "#4B5563",
                            color: "#fff",
                            '& .MuiListItemIcon-root': {
                              color: "#fff",
                            },
                          },
                        }),
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: "40px" }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: "16px",
                        fontFamily: "sans-serif",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </CustomLink>
            );
          })}
        </List>
      </Drawer>
    </Box>
  );
}
