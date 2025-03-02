import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Paper,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { BASE_URL } from "../../constants";
import styles from "./vehicles.module.css";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [editId, setEditId] = useState(0);

  function handleSearchChange(event) {
    fetchData(event.target.value);
  }

  useEffect(() => {
    fetchData();
  }, []);

  function handleEdit(vehicle) {
    reset({
      name: vehicle.name,
      brand_name: vehicle.brand_name,
    });
    setEditId(vehicle.id);
  }

  function handleDelete(vehicle) {
    deleteData(vehicle.id);
  }

  const fetchData = async (alphabet) => {
    try {
      const params = new URLSearchParams();

      if (alphabet) {
        params.append("query", alphabet);
      }
      const response = await fetch(
        `${BASE_URL}/vehicle${params.toString() ? `?${params.toString()}` : ""}`
      );
      const data = await response.json();
      setVehicles(data.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const postData = async (postdata) => {
    try {
      const response = await fetch(`${BASE_URL}/vehicle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postdata),
      });
      const data = await response.json();
      if(!data.status)
        {
          alert(data.message)
        }
        else
        {
          reset();
          console.log("Created Vehicle:", data);
          fetchData();
        }

    } catch (error) {
      console.error("Error creating Vehicle:", error);
    }
  };

  const updateData = async (updateData) => {
    try {
      const response = await fetch(`${BASE_URL}/vehicle/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      const data = await response.json();
      if(!data.status)
      {
        alert(data.message)
      }
      else
      {
        await fetchData();
        reset({
          name: "",
          brand_name: "",
        });
        setEditId(0); // Reset edit mode
      }
    
    } catch (error) {
      console.error("Error updating Vehicle:", error);
    }
  };

  const deleteData = async (vehicleId) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      const response=await fetch(`${BASE_URL}/vehicle/${vehicleId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if(!data.status)
      {
        alert(data.message)
      }
      console.log("Vehicle deleted successfully");
      fetchData(); // Refresh the data after deletion
    } catch (err) {
      alert(err.message);
      console.error("Error deleting vehicle:", err);
    }
  };

  function handleFormSubmission(data) {
    console.log(data);
    if (editId != 0) {
      updateData(data);
    } else {
      postData(data);
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  return (
    <div className={styles.vehiclesContainer}>
      <Grid container spacing={3}>
        {/* Vehicle List Section */}
        <Grid item xs={12} md={8}>
          <Card className={styles.card}>
            <CardHeader 
              title={
                <div className={styles.headerContent}>
                  <Typography variant="h5" className={styles.title}>
                    Vehicles
                  </Typography>
                  <TextField
                    size="small"
                    onChange={handleSearchChange}
                    placeholder="Search..."
                    className={styles.searchField}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
              }
              className={styles.cardHeader}
            />
            <Divider />
            <CardContent className={styles.tableContainer}>
              <TableContainer component={Paper} elevation={0}>
                <Table aria-label="vehicles table">
                  <TableHead>
                    <TableRow>
                      <TableCell className={styles.tableHeader}>Name</TableCell>
                      <TableCell className={styles.tableHeader} align="left">Brand Name</TableCell>
                      <TableCell className={styles.tableHeader} align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vehicles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No Data Found
                        </TableCell>
                      </TableRow>
                    ) : (
                      vehicles.map((row) => (
                        <TableRow
                          key={row.id}
                          className={styles.tableRow}
                        >
                          <TableCell align="left" className={styles['name-col']}>{row.name}</TableCell>
                          <TableCell align="left">{row.brand_name}</TableCell>
                          <TableCell align="center">
                            <IconButton 
                              onClick={() => handleEdit(row)}
                              color="primary"
                              size="small"
                              className={styles.actionButton}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDelete(row)}
                              color="error"
                              size="small"
                              className={styles.actionButton}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Add/Edit Vehicle Form Section */}
        <Grid item xs={12} md={4}>
          <Card className={styles.card}>
            <CardHeader
              title={
                <Typography variant="h5" className={styles.title}>
                  {editId ? "Edit Vehicle" : "Add Vehicle"}
                </Typography>
              }
              className={styles.cardHeader}
            />
            <Divider />
            <CardContent>
              <form onSubmit={handleSubmit(handleFormSubmission)} className={styles.form}>
                <div className={styles.formField}>
                  <label htmlFor="name" >Vehicle Name:</label>
                  <TextField
                    fullWidth
                    variant="outlined"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    {...register("name", {
                      required: {
                        value: true,
                        message: "Vehicle name can't be empty",
                      },
                    })}
                  />
                </div>
                
                <div className={styles.formField}>
                  <label htmlFor="brand_name">Brand Name:</label>
                  <TextField
                    fullWidth
                    variant="outlined"
                    error={!!errors.brand_name}
                    helperText={errors.brand_name?.message}
                    {...register("brand_name", {
                      required: {
                        value: true,
                        message: "Brand Name can't be empty",
                      },
                    })}
                  />
                </div>
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  className={styles.submitButton}
                  startIcon={editId ? <EditIcon /> : <AddIcon />}
                >
                  {editId ? "Update" : "Add"} Vehicle
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}