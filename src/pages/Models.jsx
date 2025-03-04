import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  TextField,
  InputAdornment,
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableHead,
  Paper,
  TableBody,
  MenuItem,
  Select,
  Typography,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  FormHelperText,
  Divider
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
// import FilterListIcon from "@mui/icons-material/FilterList";
import { BASE_URL } from "../../constants";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import styles from "./models.module.css";

export default function Models() {
  const [models, setModels] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [filter, setfilter] = useState({
    searchQuery: "",
    vehicle_id: "",
  });
  const [editId, setEditId] = useState(0);
  const [showAlertMessage,setShowAlertMessage] = useState({
    status:false,
    type:"",
    message:""
  })
  useEffect(() => {
    fetchData();
    return () => {
      console.log("Component unmounted");
    };
  }, [filter]);

  useEffect(() => {
    fetchVehicleData();
  }, []);

  function handleSearchChange(event) {
    setfilter((prev) => ({
      ...prev,
      searchQuery: event.target.value,
    }));
  }

  function handleVehicleChange(event) {
    setfilter((prev) => ({
      ...prev,
      vehicle_id: event.target.value,
    }));
  }

  function handleEdit(model) {
    reset({
      name: model.name,
      year: model.year,
      vehicle_id: model.vehicleDetails.id,
    });
    setEditId(model.id);
  }

  async function handleDelete(model) {
    const modelId = model.id;
    if (!window.confirm("Are you sure you want to delete this Model?")) return;
    try {
      const response= await fetch(`${BASE_URL}/vehicle_models/${modelId}`, {
        method: "DELETE",
      });
      const data= await response.json();
      if(!data.status)
      {
          setShowAlertMessage((prev)=>({
            ...prev,
            status:true,
            type:"error",
            message:data.message
      }));
          return;
        }
      console.log("Model deleted successfully");
      if (modelId == editId) {
        reset({
          name: "",
          year: "",
          vehicle_id: "",
        });
      }
      setShowAlertMessage((prev)=>({
        ...prev,
        status:true,
        type:"success",
        message:"Model deleted Successfully"
      }));
      await fetchData(); // Refresh the data after deletion
    } catch (err) {
      console.error("Error deleting Model:", err);
    }
  }

  async function fetchVehicleData() {
    try {
      const response = await fetch(`${BASE_URL}/vehicle`);
      const data = await response.json();
      setVehicles(data.data);
    } catch (error) {
      setShowAlertMessage((prev)=>({
        ...prev,
        status:true,
        type:"error",
        message:error.message
      }));
    }
  }

  async function fetchData() {
    try {
      const params = new URLSearchParams();
      if (filter.searchQuery) params.append("query", filter.searchQuery);
      if (filter.vehicle_id) params.append("vehicle_id", filter.vehicle_id);
      const response = await fetch(
        `${BASE_URL}/vehicle_models?${params.toString()}`
      );
      const data = await response.json();
      setModels(data.data);
    } catch (error) {
      setShowAlertMessage((prev)=>({
        ...prev,
        status:true,
        type:"error",
        message:error.message
      }));
    }
  }

  function handleFormSubmission(data) {
    console.log(data);
    if (editId != 0) {
      updateData(data);
    } else {
      postData(data);
    }
  }
  function handleClose(){
    setShowAlertMessage((prev)=>({
      ...prev,
      status:false
    }));
  }
  async function updateData(updateData) {
    try {
      const response = await fetch(`${BASE_URL}/vehicle_models/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      const data=await response.json();
      if(!data.status)
      {
        setShowAlertMessage((prev)=>({
          ...prev,
          status:true,
          type:"error",
          message:data.message
        }));
        return;
      }
      await fetchData();
      reset({
        name: "",
        year: "",
        vehicle_id: "",
      });
      setEditId(0); // Reset edit mode
      setShowAlertMessage((prev)=>({
        ...prev,
        status:true,
        type:"success",
        message:"Model updated successfully"
      }))
    } catch (error) {
      setShowAlertMessage((prev)=>({
        ...prev,
        status:true,
        type:"success",
        message:error.message
      }))
    }
  }

  async function postData(postdata) {
    try {
      const response = await fetch(`${BASE_URL}/vehicle_models`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postdata),
      });
      const data= await response.json();
      if(!data.status)
        {
          setShowAlertMessage((prev)=>({
            ...prev,
            status:true,
            type:"error",
            message:data.message
          }));
          return;
        }
      reset();
      setShowAlertMessage((prev)=>({
        ...prev,
        status:true,
        type:"success",
        message:"Model created successfully"
      }))
      fetchData();
    } catch (error) {
      setShowAlertMessage((prev)=>({
        ...prev,
        status:true,
        type:"error",
        message:error.message
      }))
    }
  }
  function handleCancel(){
    reset({
      name: "",
      year: "",
      vehicle_id: "",
    });
  }
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: "", // Default value for Model
      vehicle_id: "", // Default value for Vehicle select
      year: "", // Default value for Year
    },
  });

  return (
    <>
    <div className={styles.modelsContainer}>
      <Grid container spacing={3}>
        {/* Models List Section */}
        <Grid item xs={12} md={8}>
          <Card className={styles.card}>
            <CardHeader
              title={
                <div className={styles.headerContent}>
                  <Typography variant="h5" className={styles.title}>
                    Models
                  </Typography>
                  <div className={styles.filterControls}>
                    <FormControl
                      variant="outlined"
                      size="small"
                      className={styles.vehicleFilter}
                    >
                      <InputLabel id="vehicle-filter-label">Vehicle</InputLabel>
                      <Select
                        labelId="vehicle-filter-label"
                        value={filter.vehicle_id}
                        onChange={handleVehicleChange}
                        label="Vehicle"
                      >
                        <MenuItem value="">
                          <em>All Vehicles</em>
                        </MenuItem>
                        {vehicles.map((vehicle) => (
                          <MenuItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      size="small"
                      onChange={handleSearchChange}
                      placeholder="Search models..."
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
                </div>
              }
              className={styles.cardHeader}
            />
            <Divider />
            <CardContent className={styles.tableContainer}>
              <TableContainer component={Paper} elevation={0}>
                <Table aria-label="models table">
                  <TableHead>
                    <TableRow>
                      <TableCell className={styles.tableHeader}>Model</TableCell>
                      <TableCell className={styles.tableHeader} align="left">
                        Vehicle
                      </TableCell>
                      <TableCell className={styles.tableHeader} align="left">
                        Year
                      </TableCell>
                      <TableCell className={styles.tableHeader} align="center">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {models.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No Data Found
                        </TableCell>
                      </TableRow>
                    ) : (
                      models.map((row) => (
                        <TableRow key={row.id} className={styles.tableRow}>
                          <TableCell align="left">{row.name}</TableCell>
                          <TableCell align="left">
                            {row.vehicleDetails.name}
                          </TableCell>
                          <TableCell align="left">{row.year}</TableCell>
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

        {/* Add/Edit Model Form Section */}
        <Grid item xs={12} md={4}>
          <Card className={styles.card}>
            <CardHeader
              title={
                <Typography variant="h5" className={styles.title}>
                  {editId ? "Edit Model" : "Add Model"}
                </Typography>
              }
              className={styles.cardHeader}
            />
            <Divider />
            <CardContent>
              <form
                onSubmit={handleSubmit(handleFormSubmission)}
                className={styles.form}
              >
                <div className={styles.formField}>
                  <Controller
                    name="vehicle_id"
                    control={control}
                    rules={{ required: "Please select a vehicle" }}
                    render={({ field }) => (
                      <FormControl
                        fullWidth
                        variant="outlined"
                        error={!!errors.vehicle_id}
                      >
                       <label htmlFor="vehicle_id">Vehicle:</label>
                        <Select
                          {...field}
                          displayEmpty
                          labelId="vehicle-select-label"
                        >
                          <MenuItem value="">
                            <em>Select Vehicle</em>
                          </MenuItem>
                          {vehicles.map((vehicle) => (
                            <MenuItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.vehicle_id && (
                          <FormHelperText>
                            {errors.vehicle_id.message}
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </div>

                <div className={styles.formField}>
                <label htmlFor="name">Model name:</label>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: "Model name can't be empty" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Enter model name"
                        variant="outlined"
                        error={!!errors.name}
                        helperText={errors.name?.message}
                      />
                    )}
                  />
                </div>

                <div className={styles.formField}>
                  <label htmlFor="year">Year:</label>
                  <Controller
                    name="year"
                    control={control}
                    rules={{
                      required: "Year can't be empty",
                      pattern: {
                        value: /^[0-9]{4}$/,
                        message: "Enter a valid 4-digit year",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Enter year"
                        variant="outlined"
                        type="number"
                        error={!!errors.year}
                        helperText={errors.year?.message}
                      />
                    )}
                  />
                </div>
                <div>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  className={styles.submitButton}
                  startIcon={editId ? <EditIcon /> : <AddIcon />}
                >
                  {editId ? "Update" : "Add"} Model
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={handleCancel}
                  className={styles.submitButton}
                >
                  Cancel
                </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
    <Snackbar open={showAlertMessage.status} autoHideDuration={5000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity={showAlertMessage.type}
          variant="filled"
          sx={{ width: '100%' }}
        >
       { showAlertMessage.message}
        </Alert>
        </Snackbar>
        </>
  );
}