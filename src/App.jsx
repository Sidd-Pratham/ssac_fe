import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Tabs, Tab, Typography, Container } from "@mui/material";
import { DirectionsCar, Category, Inventory, Receipt } from "@mui/icons-material";

// Import CSS
import "./App.css";

// Import your pages
import Vehicles from "./pages/Vehicles.jsx";
import Models from "./pages/Models.jsx";
import Products from "./pages/Products/Products.jsx";
import Bills from "./pages/Bills/Bills.jsx";
import ListBills from "./pages/Bills/listBills.jsx";
import ProductListing from "./pages/Products/ProductListing.jsx";

// Custom NavTabs component
const NavTabs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active tab based on current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("/vehicles")) return 0;
    if (path.includes("/models")) return 1;
    if (path.includes("/products")) return 2;
    if (path.includes("/bills")) return 3;
    return 2; // Default to ProductListing
  };
  
  const [value, setValue] = useState(getActiveTab());
  
  // Update tab value when location changes
  useEffect(() => {
    setValue(getActiveTab());
  }, [location]);
  
  const handleChange = (event, newValue) => {
    setValue(newValue);
    
    // Navigate based on tab index
    switch (newValue) {
      case 0:
        navigate("/vehicles");
        break;
      case 1:
        navigate("/models");
        break;
      case 2:
        navigate("/products");
        break;
      case 3:
        navigate("/bills");
        break;
      default:
        navigate("/products");
    }
  };
  
  return (
    <AppBar position="static" className="app-navbar">
      <Container maxWidth="lg">
        <Toolbar disableGutters className="navbar-toolbar">
          <Typography variant="h5" component="div" className="app-logo">
            Inventory Mangement System
          </Typography>
          <Tabs 
            value={value} 
            onChange={handleChange} 
            className="nav-tabs"
            TabIndicatorProps={{ className: "tab-indicator" }}
          >
            <Tab 
              icon={value === 0 ? <DirectionsCar /> : null}
              label={value !== 0 ? "Vehicles" : null}
              className={value === 0 ? "tab active-tab" : "tab"}
            />
            <Tab 
              icon={value === 1 ? <Category /> : null}
              label={value !== 1 ? "Models" : null}
              className={value === 1 ? "tab active-tab" : "tab"}
            />
            <Tab 
              icon={value === 2 ? <Inventory /> : null}
              label={value !== 2 ? "Products" : null}
              className={value === 2 ? "tab active-tab" : "tab"}
            />
            <Tab 
              icon={value === 3 ? <Receipt /> : null}
              label={value !== 3 ? "Bills" : null}
              className={value === 3 ? "tab active-tab" : "tab"}
            />
          </Tabs>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

function AppContent() {
  return (
    <>
      <NavTabs />
      <Container maxWidth="lg" className="content-container">
        <Routes>
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/models" element={<Models />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/bills" element={<ListBills />} />
          <Route path="/bills/create" element={<Bills />} />
          <Route path="/products/create" element={<Products />} />
          <Route path="/" element={<Navigate replace to="/products" />} />
        </Routes>
      </Container>
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="app-root">
        <AppContent />
      </div>
    </Router>
  );
}

export default App;