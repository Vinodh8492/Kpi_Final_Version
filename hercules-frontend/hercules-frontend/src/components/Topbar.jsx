import React, { useContext } from "react";
import { Box, AppBar, Toolbar, Typography, Avatar } from "@mui/material";
import { styled } from "@mui/material/styles";
import herculesLogo from "../assets/image.png";
import Aghtia from "../assets/image1.png";
import companyLogo from "../assets/Asm_Logo.png";
import { LogoContext } from "../contexts/LogoContext.jsx";

const CustomAppBar = styled(AppBar)(() => ({
  backgroundColor: "#D4D6D9",
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  height: "64px",
  justifyContent: "center",
}));

const Topbar = () => {
  const { logoUrl } = useContext(LogoContext);

  const displayedLogo = logoUrl && logoUrl.trim() !== "" ? logoUrl : Aghtia;

  return (
    <CustomAppBar position="fixed" elevation={0}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            component="img"
            src={herculesLogo}
            alt="Hercules Logo"
            loading="eager"
            sx={{ height: 40, width: "auto" }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="body2" sx={{ color: "#000" }}>
            Hello, <Box component="span" fontWeight="bold">ASM</Box>
          </Typography>
          <Avatar sx={{ width: 32, height: 32, bgcolor: "gray" }}>A</Avatar>
          <Box
            component="img"
            src={companyLogo}
            alt="Company"
            sx={{ height: 40, width: "auto" }}
          />
          <Box
            component="img"
            src={displayedLogo}
            alt="Dynamic Company Logo"
            sx={{ height: 60, width: 100 }}
          />
        </Box>
      </Toolbar>
    </CustomAppBar>
  );
};

export default Topbar;
