import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import Aghtia from "../assets/image1.png";

const API_BASE = "http://127.0.0.1:5000";

export const LogoContext = createContext();

export const LogoProvider = ({ children }) => {
  const [logoUrl, setLogoUrl] = useState(Aghtia);

  useEffect(() => {
    axios.get(`${API_BASE}/api/logo`)
      .then((res) => {
        const path = res.data.logoUrl;
        if (path && path.trim() !== "") {
          const fullUrl = `${API_BASE}${path}?t=${Date.now()}`;
          setLogoUrl(fullUrl);
        } else {
          setLogoUrl(Aghtia);
        }
      })
      .catch((err) => {
        console.error("Error loading logo:", err);
        setLogoUrl(Aghtia);
      });
  }, []);

  return (
    <LogoContext.Provider value={{ logoUrl, setLogoUrl }}>
      {children}
    </LogoContext.Provider>
  );
};
