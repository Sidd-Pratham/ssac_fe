import { Tabs, Tab } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CategoryIcon from "@mui/icons-material/Category";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptIcon from "@mui/icons-material/Receipt";

const tabs = [
  { label: "Vehicles", path: "/vehicles", icon: <DirectionsCarIcon /> },
  { label: "Models", path: "/models", icon: <CategoryIcon /> },
  { label: "Products", path: "/products", icon: <InventoryIcon /> },
  { label: "Bills", path: "/bills", icon: <ReceiptIcon /> },
];

const TabNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Tabs
      value={location.pathname}
      onChange={(e, newValue) => navigate(newValue)}
      variant="fullWidth"
      textColor="primary"
      indicatorColor="primary"
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.path}
          label={location.pathname === tab.path ? "" : tab.label} // Hide text when active
          value={tab.path}
          icon={tab.icon}
        />
      ))}
    </Tabs>
  );
};

export default TabNavigation;
