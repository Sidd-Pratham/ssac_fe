import { useForm,Controller} from "react-hook-form";
import { MenuItem,Select,TextField,Button,Box,Chip, } from "@mui/material";
import { TextareaAutosize } from '@mui/base';
import { useState,useEffect , useRef} from "react";
import styles from "./ProductStyles.module.css";
import JsBarcode from "jsbarcode";
import { BASE_URL } from "../../../constants";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import {Typography,FormHelperText,Paper,Grid,} from "@mui/material";
export default function Products(){
     
     const {control,handleSubmit,reset,setValue,watch,
           formState: { errors },
          } = useForm({
                    defaultValues: {
                         name: "",        
                         product_code: "",
                         quantity:"",
                         category:"",
                         manufacturer_name:"",
                         avg_cost_price:"",
                         selling_price:"",
                         product_mrp:"",
                         description:"",
                         associated_vehicles:[],
                         associated_models:[]
                    }
          });
          const barcodeRef = useRef(null);
          const categories=['Engine','Suspension','Braking','Electricals','Exhaust','Body','Accessories','Other']
          const [barcodeValue, setBarcodeValue] = useState("");
          const [vehicles, setVehicles] = useState([]);
          const [selectedVehicles, setSelectedVehicles] = useState([]);

          const [Models,setModels] = useState([]);
          const [selectedModels, setSelectedModels] = useState([]);
          const [showAlertMessage,setShowAlertMessage] = useState({
            status:false,
            type:"",
            message:""
          })
          function handleFormSubmission(data){
               const formattedData = {
                    ...data,
                    selling_price: Number(data.selling_price),
                    avg_cost_price: Number(data.avg_cost_price),
                    quantity: Number(data.quantity),
                    profit: Number(data.profit),
                    product_mrp: Number(data.product_mrp)
                }
                console.log(data)
                let selectedVehiclesId=[];
                selectedVehicles.forEach((vehicle)=>{
                    selectedVehiclesId.push(vehicle.id)
                })
                formattedData.associated_vehicles=JSON.stringify(selectedVehicles)
                let selectedModelsId=[];
                selectedModels.forEach((m)=>{
                    selectedModelsId.push(m.id)
                })
                formattedData.associated_models=JSON.stringify(selectedModels)
                console.log(formattedData)
                postData(formattedData)
          }
          function handleVehicleChange(event){
               const {
                    target: { value },
                  } = event;
                  if(selectedVehicles.length < value.length)
                  {
                    const newlyAddedVehicle=value[value.length-1];
                    const modelsRelatedToVehicles=Models.filter(model => model.vehicle_id === newlyAddedVehicle).map(model => model.id);
                    const newSelectedModels=[...selectedModels,...modelsRelatedToVehicles];
                    setSelectedVehicles(value);
                    setSelectedModels(newSelectedModels);
                  }
                  else // vehicle removed
                  {
                    const removedVehicle=selectedVehicles.length > value.length 
                                    ? selectedVehicles.filter(item => !value.includes(item)) : value.filter(item => !selectedVehicles.includes(item));
                    console.log(removedVehicle,selectedModels)
                    const modelsRelatedToRemovedVehicles=Models.filter(model => model.vehicle_id === removedVehicle[0]).map(model => model.id);
                    const newSelectedModels=selectedModels.filter(model => !modelsRelatedToRemovedVehicles.includes(model));
                    // const modelsNotRelatedToVehicles=selectedModels.filter(model => model != removedVehicle[0]);
                    // console.log(modelsNotRelatedToVehicles)
                    setSelectedVehicles(value);
                    setSelectedModels(newSelectedModels);
                  }
          }
          function handleModelChange(event)
          {
               const {
                    target: { value },
                  } = event;
                  console.log(value)
                  setSelectedModels(
                    typeof value === 'string' ? value.split(',') : value,
                  );
          }
          function handleCancel(){
            reset();
            setValue("profit",0); 
            setSelectedModels([]);
            setSelectedVehicles([]);
            setBarcodeValue("")
          }
          async function postData(postdata)
          {
               try {
                    const response = await fetch(`${BASE_URL}/products`, {
                         method: "POST",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify(postdata),
                    });
                    const data = await response.json();
                    if(!data.status){
                      setShowAlertMessage((prev)=>({
                        ...prev,
                        status:true,
                        type:"error",
                        message:data.message
                      }));
                    }
                    else
                    {
                      setShowAlertMessage((prev)=>({
                        ...prev,
                        status:true,
                        type:"success",
                        message:"Product created Successfully"
                      }));
                        reset();
                        setValue("profit",0); 
                        setSelectedModels([]);
                        setSelectedVehicles([]);
                        setBarcodeValue("")
                       
                     }
                   
               } catch (error) {
                setShowAlertMessage((prev)=>({
                  ...prev,
                  status:true,
                  type:"error",
                  message:error.message
                }));
               }
          }
          const sellingPrice = watch("selling_price", 0);
          const costPrice = watch("avg_cost_price", 0);
          useEffect(() => {
              if (costPrice && sellingPrice) {
                  setValue("profit", Number(sellingPrice) - Number(costPrice)); 
              }
          }, [sellingPrice, costPrice, setValue]);
          const productCode = watch("product_code", "");

          // Function to generate barcode
          const generateBarcode = () => {
              if (!productCode.trim()) {
                  alert("Please enter a Product Code before generating a barcode!");
                  return;
              }
              setBarcodeValue(productCode);
          };
          useEffect(() => {
               if (barcodeValue) {
                   JsBarcode(barcodeRef.current, barcodeValue, {
                       format: "CODE128",
                       lineColor: "#000",
                       width: 2,
                       height: 50,
                       displayValue: true
                   });
               }
           }, [barcodeValue]);
           useEffect(() => {
               fetchData();
           }, []);
           const fetchData = async () => {
               try {               
                 const response = await fetch(`${BASE_URL}/vehicle`);
                 const data = await response.json();
                 const modelResponse = await fetch(`${BASE_URL}/vehicle_models`);
                 const modelData = await modelResponse.json();
                 setVehicles(data.data);
                 setModels(modelData.data)
               } catch (error) {
                setShowAlertMessage((prev)=>({
                  ...prev,
                  status:true,
                  type:"error",
                  message:error.message
                }));
               }
             };
          // const theme = useTheme();
          const ITEM_HEIGHT = 48;
          const ITEM_PADDING_TOP = 8;
          const MenuProps = {
          PaperProps: {
          style: {
               maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
               width: 250,
          },
          },
          };
          function handleClose(){
            setShowAlertMessage((prev)=>({
              ...prev,
              status:false
            }));
          }
          //    const handlePrint = () => {
          //      const printContent = document.getElementById("barcode-container");
          //      const windowPrint = window.open("", "", "width=600,height=400");
          //      windowPrint.document.write(printContent.innerHTML);
          //      windowPrint.document.close();
          //      windowPrint.focus();
          //      windowPrint.print();
          //      windowPrint.close();
          //    };
     return <>
      <div>
        <h1 className={styles.header}>
          Add New Product
        </h1>

        <form onSubmit={handleSubmit(handleFormSubmission)}>
          <Grid container spacing={3}>
            {/* Product Name */}
            <Grid item xs={12} md={6}> 
              <label htmlFor="name">Product Name:</label>         
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Product name is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="name"
                      fullWidth
                      placeholder="Enter Product Name"
                      error={!!errors.name}
                    />
                  )}
                />
                {errors.name && <FormHelperText>{errors.name.message}</FormHelperText>}
            </Grid>

            {/* Category */}
            <Grid item xs={12} md={6}>
            <label htmlFor="category">Product Category:</label>       
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <Select
                    fullWidth displayEmpty
                      {...field}
                      id="category"
                      error={!!errors.category}
                    >
                      <MenuItem value="" disabled>Select Category</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.category && <FormHelperText>{errors.category.message}</FormHelperText>}
            </Grid>

            {/* Product Code and Barcode */}
            <Grid item xs={12} md={6}>
            <label htmlFor="product_code">Product Code:</label>       
                <Controller
                  name="product_code"
                  control={control}
                  rules={{ required: "Product code is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="product_code"
                      fullWidth
                      variant="outlined"
                      error={!!errors.product_code}
                    />
                  )}
                />
                {errors.product_code && <FormHelperText>{errors.product_code.message}</FormHelperText>}
                <Box sx={{ mt: 1 }}>
                  <Button 
                  fullWidth
                    variant="contained" 
                    color="primary" 
                    onClick={generateBarcode}
                    sx={{ mt: 1 }}
                  >
                    Generate Barcode
                  </Button>
                </Box>
            </Grid>

            {/* Barcode Display */}
            <Grid item xs={12} md={6}>
              {barcodeValue ? (
                <div className={styles['barcode-wrapper']}>
                    <div id="barcode-container" className={styles.barcodeContainer}>
                      <svg ref={barcodeRef}></svg>
                    </div>
                </div>
              ) : (
                <Paper variant="outlined" sx={{ height: '60%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, my:3, backgroundColor: '#f9f9f9' }}>
                  <Typography variant="body2" color="textSecondary" align="center">
                    Enter a product code and click Generate Barcode to create a barcode
                  </Typography>
                </Paper>
              )}
            </Grid>

            {/* Manufacturer */}
            <Grid item xs={12} md={6}>
            <label htmlFor="category">Manufacturer Name:</label>       
              <Controller
                  name="manufacturer_name"
                  control={control}
                  rules={{ required: "Manufacturer name is required" }}
                  render={({ field }) => (
                    <TextField
                    placeholder="Enter Manufacturer's Name:"
                      {...field}
                      id="manufacturer_name"
                      fullWidth
                      variant="outlined"
                      error={!!errors.manufacturer_name}
                    />
                  )}
                />
                {errors.manufacturer_name && <FormHelperText>{errors.manufacturer_name.message}</FormHelperText>}
            </Grid>

            {/* Quantity */}
            <Grid item xs={12} md={6}>
            <label htmlFor="quantity">Quantity:</label>       
                <Controller
                  name="quantity"
                  control={control}
                  rules={{ 
                    required: "Quantity is required",
                    min: { value: 0, message: "Quantity can't be negative" }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="quantity"
                      type="number"
                      fullWidth
                      variant="outlined"
                      placeholder="Enter Quantity"
                      error={!!errors.quantity}
                    />
                  )}
                />
                {errors.quantity && <FormHelperText>{errors.quantity.message}</FormHelperText>}
            </Grid>

            {/* Pricing Section */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <div style={{display:"flex",justifyContent:"end" }}>
                  <h4>
                  Pricing Information
                  </h4>
              </div>
            </Grid>

            {/* Cost Price */}
            <Grid item xs={12} md={6}>
            <label htmlFor="avg_cost_price" >Average Cost Price:</label>       
                <Controller
                  name="avg_cost_price"
                  control={control}
                  rules={{ required: "Cost price is required", 
                  min: { value: 0, message: "Cost Price can't be negative" } }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="avg_cost_price"
                      type="number"
                      fullWidth
                      variant="outlined"
                      error={!!errors.avg_cost_price}
                      placeholder="Enter Cost Price"
                      slotProps={{
                        input: {
                          startAdornment: <span className={styles.currencySymbol}>₹</span>,
                        }
                      }}
                    />
                  )}
                />
                {errors.avg_cost_price && <FormHelperText>{errors.avg_cost_price.message}</FormHelperText>}
            </Grid>

            {/* Selling Price */}
            <Grid item xs={12} md={6}>
            <label htmlFor="selling_price">Selling Price:</label>       
                <Controller
                  name="selling_price"
                  control={control}
                  rules={{ required: "Selling price is required" ,
                  min: { value: 0, message: "Selling Price can't be negative" }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="selling_price"
                      type="number"
                      fullWidth
                      variant="outlined"
                      placeholder="Enter Selling Price"
                      slotProps={{
                        input: {
                          startAdornment: <span className={styles.currencySymbol}>₹</span>,
                        }
                      }}
                      error={!!errors.selling_price}
                    />
                  )}
                />
                {errors.selling_price && <FormHelperText>{errors.selling_price.message}</FormHelperText>}
            </Grid>

            {/* Profit (Calculated) */}
            <Grid item xs={12} md={6}>
            <label htmlFor="profit">Profit:</label>       
                <Controller
                  name="profit"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="profit"
                      fullWidth
                      variant="outlined"
                      slotProps={{
                        input: {
                          startAdornment: <span className={styles.currencySymbol}>₹</span>,
                          readOnly: true
                        }
                      }}
                      className={styles.readonlyField}
                    />
                  )}
                />
            </Grid>
            {/* MRP */}
            <Grid item xs={12} md={6}>
            <label htmlFor="product_mrp">MRP:</label>       
                <Controller
                  name="product_mrp"
                  control={control}
                  rules={{ required: "MRP is required",
                  min: { value: 0, message: "Selling Price can't be negative" }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="product_mrp"
                      type="number"
                      fullWidth
                      variant="outlined"
                      placeholder="Enter MRP"
                      slotProps={{
                        input: {
                          startAdornment: <span className={styles.currencySymbol}>₹</span>,
                        }
                      }}
                    />
                  )}
                />
                {errors.product_mrp && <FormHelperText>{errors.product_mrp.message}</FormHelperText>}
            </Grid>



            {/* Description */}
            <Grid item xs={12} md={12}>
            <label htmlFor="description">Description:</label>       
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextareaAutosize
                      {...field}
                      aria-label="description"
                      fullWidth
                      placeholder="Product description (optional)"
                      className={styles.textarea}
                    />
                  )}
                />
            </Grid>

            {/* Associated Items Section */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <div style={{display:"flex",justifyContent:"end" }}>
                  <h4>
                  Vehicle & Model Compatibility
                  </h4>
              </div>
            </Grid>

            {/* Vehicles */}
            <Grid item xs={12} md={6}>
            <label htmlFor="associated_vehicles">Vehicles:</label>   
                <Controller
                  name="associated_vehicles"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="vehicles-label"
                      id="vehicles"
                      multiple
                      fullWidth 
                      value={selectedVehicles}
                      onChange={handleVehicleChange}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const selectedItem = vehicles.find((opt) => opt.id === value);
                            return selectedItem ? <Chip key={value} label={selectedItem.name} /> : null;
                          })}
                        </Box>
                      )}
                      MenuProps={MenuProps}
                    >
                  <MenuItem value="" disabled>Select Vehicle</MenuItem>
                      {vehicles.map((vehicle) => (
                        <MenuItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
            </Grid>

            {/* Models */}
            <Grid item xs={12} md={6}>
            <label htmlFor="associated_models">Models:</label>       
                <Controller
                  name="associated_models"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="models-label"
                      id="models"
                      multiple
                      fullWidth
                      displayEmpty
                      value={selectedModels}
                      onChange={handleModelChange}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const selectedItem = Models.find((opt) => opt.id === value);
                            return selectedItem ? <Chip key={value} label={selectedItem.name} /> : null;
                          })}
                        </Box>
                      )}
                      MenuProps={MenuProps}
                    >
                  <MenuItem value="" disabled>Select Model</MenuItem>
                      {Models.map((model) => (
                        <MenuItem key={model.id} value={model.id}>
                          {model.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
            </Grid>

            {/* Submit Button */}
          
          </Grid>
          <div style={{display:"flex",justifyContent:"end"}}>
          <div className={styles.submitButtonWrapper} >
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  className={styles.submitButton}
                >
                  Create Product
                </Button>
                <Button 
                  onClick={handleCancel}
                  variant="outlined" 
                  color="primary" 
                  className={styles.submitButton}
                >
                  cancel
                </Button>
            </div>
          </div>
          
        </form>
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
}