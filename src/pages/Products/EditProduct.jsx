import styles from "./EditProduct.module.css";
import Grid from '@mui/material/Grid2';
import { TextField,FormHelperText,Select,MenuItem, Button,TextareaAutosize,Box,Chip,Snackbar,Alert } from "@mui/material";
import { BASE_URL, product_categories } from "../../../constants";
import { useForm,Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useMutation } from '@tanstack/react-query';



export default function EditProduct(){
     const { id } = useParams(); // Get 'id' from the URL
     const schema=yup.object().shape({
          name:yup.string().required("Please enter Product Name"),
          category:yup.string().required("Please select Category"),
          product_code:yup.string().required("Please Enter Product Code").min(3,"Product code should contain minimum 3 Characters").max(8,"Product code should contain Maximum 8 Characters"),
          manufacturer_name:yup.string().required("Please Enter Manufactuer Name"),
          quantity:yup.number().required("Please Enter Quantity").integer("Quantity needs to be integer"),
          avg_cost_price:yup.number().required().positive("Cost Price can't be '0' or negative value"),
          selling_price:yup.number().required("Please Enter Selling Price").positive("Selling Price can't be '0' or negative value"),
          profit:yup.number().required(),
          product_mrp:yup.number().required().positive("MRP can't be '0' or negative value"),
     })
     const [productBarCode,setProductBarCode]=useState("");
     const [showAlertMessage,setShowAlertMessage] = useState({status:false,type:"",message:""})
     // if (isLoading) return <p>Loading...</p>;
     // if (error) return <p>Error loading product</p>;
     // const [vehicles,setVehicles]=useState([]);
     const [selectedVehicles,setSelectedVehicles]=useState([]);
     const [selectedModels,setSelectedModels]=useState([]);
     const barcodeRef=useRef(null);
     const {control,handleSubmit,reset,setValue,watch,getValues,
           formState: { errors },   
          } = useForm({
                    defaultValues: {
                         name: "",
                         product_code: "",
                         quantity:0,
                         category:"",
                         manufacturer_name:"",
                         avg_cost_price:0,
                         selling_price:0,
                         profit:0,
                         product_mrp:0,
                         description:"",
                    },
                    resolver:yupResolver(schema)
          });

          const { data } = useQuery({
               queryKey: ['productData'],
               queryFn: async ({meta}) => {
                    try{
                         const res = await fetch(`${BASE_URL}/products/${id}`);
                         if(!res.ok)
                         {
                          throw new Error(`Error ${res.status}: ${res.statusText}`);
                         }
                         const apiResponse = await res.json();
                         const data= apiResponse.data || {};
                         if (meta?.onSuccess) {
                          meta.onSuccess(data); // Call function when data is successfully fetched
                         }
                         return data
                    }catch(err)
                    {
                         if (meta?.onError) {
                              meta.onError(err);
                          }
                          throw err; // Let React Query handle it
                    }
               },
               retry: false, // 👈 Prevents multiple API calls on failure
               meta: {
                    onSuccess: (productData) => {
                         reset({
                              name: productData.name || "",
                              product_code: productData.product_code || "",
                              quantity: productData.quantity || 0,
                              category: productData.category || "",
                              manufacturer_name: productData.manufacturer_name || "",
                              avg_cost_price: productData.avg_cost_price || 0,
                              selling_price: productData.selling_price || 0,
                              profit: productData.profit || 0,
                              product_mrp: productData.product_mrp || 0,
                              description: productData.description || "",
                          });
                          let uniqueVehicles = new Set();
                          productData.vehicles.map((vehicle)=>{
                           uniqueVehicles.add(vehicle.product_vehicle_associations.vehicle_id)
                          })
                          setSelectedVehicles([...uniqueVehicles])
                          let uniqueModels = new Set();
                          productData.vehicle_models.map((vehicle)=>{
                           uniqueModels.add(vehicle.product_model_associations.vehicle_model_id)
                          })
                          setSelectedModels([...uniqueModels])
                          setShowAlertMessage((prev)=>{
                              return{
                                   ...prev,
                                   status:true,
                                   type:"success",
                                   message:"Product details found Successfully"
                              }
                          })
                    },
                    onError:(error)=>{
                         setShowAlertMessage((prev)=>{
                              return{
                                   ...prev,
                                   status:true,
                                   type:"error",
                                   message:error.message
                              }
                          })
                     }
               },
           });
          const { data:vehicleData } = useQuery({
               queryKey: ['vehicleData'],
               queryFn: async () => {
                   const res = await fetch(`${BASE_URL}/vehicle`);
                   const apiResponse = await res.json();
                   return apiResponse.data;
               },
           });
          const { data:modelData } = useQuery({
               queryKey: ['ModelData'],
               queryFn: async () => {
                   const res = await fetch(`${BASE_URL}/vehicle_models`);
                   const apiResponse = await res.json();
                   return apiResponse.data;
               },
           });
          
          // useEffect(() => {
          //      if (productData) {
                  
          //      }
          // }, [productData]);

          // useEffect(() => {
          //      if (vehicleData) {
          //          reset({
          //              name: productData.name || "",
          //              product_code: productData.product_code || "",
          //              quantity: productData.quantity || 0,
          //              category: productData.category || "",
          //              manufacturer_name: productData.manufacturer_name || "",
          //              avg_cost_price: productData.avg_cost_price || 0,
          //              selling_price: productData.selling_price || 0,
          //              profit: productData.profit || 0,
          //              product_mrp: productData.product_mrp || 0,
          //              description: productData.description || "",
          //          });
          //      }
          // }, [vehicleData]);

          useEffect(() => {
               if (productBarCode) {
                   JsBarcode(barcodeRef.current, productBarCode, {
                       format: "CODE128",
                       lineColor: "#000",
                       width: 2,
                       height:50,
                       displayValue: true
                   });
               }
          }, [productBarCode]);

          function handleBarCodeViewer(){
               setProductBarCode(getValues("product_code"))
          }

          function handleVehicleChange(event){
               const {
                    target: { value },
                  } = event;
                  if(selectedVehicles.length < value.length)
                  {
                    const newlyAddedVehicle=value[value.length-1];
                    const modelsRelatedToVehicles=modelData.filter(model => model.vehicle_id === newlyAddedVehicle).map(model => model.id);
                    const newSelectedModels=[...selectedModels,...modelsRelatedToVehicles];
                    setSelectedVehicles(value);
                    setSelectedModels(newSelectedModels);
                  }
                  else // vehicle removed
                  {
                    const removedVehicle=selectedVehicles.length > value.length 
                                    ? selectedVehicles.filter(item => !value.includes(item)) : value.filter(item => !selectedVehicles.includes(item));
                    console.log(removedVehicle,selectedModels)
                    const modelsRelatedToRemovedVehicles=modelData.filter(model => model.vehicle_id === removedVehicle[0]).map(model => model.id);
                    const newSelectedModels=selectedModels.filter(model => !modelsRelatedToRemovedVehicles.includes(model));

                    setSelectedVehicles(value);
                    setSelectedModels(newSelectedModels);
                  }
          }
          const postProduct = async (productData) => {
               const response = await fetch(`${BASE_URL}/products/${id}`, {
                   method: 'PATCH',
                   headers: {
                       'Content-Type': 'application/json',
                   },
                   body: JSON.stringify(productData),
               });
           
               if (!response.ok) {
                   throw new Error(`Error ${response.status}: ${response.statusText}`);
               }
           
               return response.json(); // Return API response
           };
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
          const { mutate} = useMutation({
               mutationFn: postProduct,
               onSuccess: (data) => {
                    setShowAlertMessage((prev)=>{
                         return{
                              ...prev,
                              status:true,
                              type:"success",
                              message:"Product edited successfully"
                         }
                     })
               },
               onError: (error) => {
                    setShowAlertMessage((prev)=>{
                         return{
                              ...prev,
                              status:true,
                              type:"error",
                              message:error.message
                         }
                     })
               }
           });
          function handleFormSubmission(data){
               const productData = {
                   name: data.name,
                   product_code:data.product_code,
                   price:data.price,
                   quantity:data.quantity,
                   category:data.category,
                   manufacturer_name:data.manufacturer_name,
                   avg_cost_price:data.avg_cost_price,
                   selling_price:data.selling_price,
                   product_mrp:data.product_mrp,
                   description:data.description,
                   profit:data.profit,
                   associated_vehicles:JSON.stringify(selectedVehicles),
                   associated_models:JSON.stringify(selectedModels)
               };
               mutate(productData);
          }

          function handleClose(){
               setShowAlertMessage((prev)=>({
                 ...prev,
                 status:false
               }));
          }
          function handleFormReset(){}

          //setting profit field based on Cost Price and Selling Price
          const sellingPrice = watch("selling_price", 0);
          const costPrice = watch("avg_cost_price", 0);
          useEffect(() => {
               if (costPrice && sellingPrice) {
                   setValue("profit", Number(sellingPrice) - Number(costPrice)); 
               }
           }, [sellingPrice, costPrice, setValue]);

    

     return<>
     <h1 className={styles.header}>Edit Product</h1>
     <form onSubmit={handleSubmit(handleFormSubmission)} onReset={handleFormReset}>
          <Grid container spacing={3}>
               <Grid item size={{ xs: 12, md: 6 }}>
                    <label htmlFor="name">Product Name:</label>         
                    <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                         <TextField
                         {...field}
                         fullWidth
                         placeholder="Enter Product Name"
                         />
                    )}
                    />
                    {errors.name && <FormHelperText >{errors.name.message}</FormHelperText>}
               </Grid>
               <Grid item size={{ xs: 12, md: 6 }}>
                    <label htmlFor="category">Product Category:</label>         
                    <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                         <Select fullWidth displayEmpty
                           {...field}
                           id="category"
                         >
                           <MenuItem value="" disabled>Select Category</MenuItem>
                           {product_categories.map((category) => (
                             <MenuItem key={category} value={category}>
                               {category}
                             </MenuItem>
                           ))}
                         </Select>
                    )}
                    />
                    {errors.category && <FormHelperText>{errors.category.message}</FormHelperText>}
               </Grid>
               <Grid  size={12}>
                    <Grid container spacing={3}>
                         <Grid item size={{ xs: 12, md: 6 }} >
                              <label htmlFor="product_code">Product Code:</label>         
                              <Controller
                              name="product_code"
                              control={control}
                              render={({ field }) => (
                                   <TextField
                                   {...field}
                                   fullWidth
                                   placeholder="Enter Product Code:"
                                   />
                              )}
                              />
                              {errors.product_code && <FormHelperText>{errors.product_code.message}</FormHelperText>}
                              <Button variant="contained" fullWidth style={{marginTop:"14px"}} onClick={handleBarCodeViewer}>View Barcode</Button>
                         </Grid>
                         <Grid item size={{ xs: 12, md: 6 }}>
                              {productBarCode ? (
                                   <div className={styles['barcode-wrapper']}>
                                        <div id="barcode-container" className={styles.barcodeContainer}>
                                             <svg ref={barcodeRef}></svg>
                                        </div>
                                   </div>
                                   ) : (
                                   <div className={styles["bar-code-replacement-wrapper"]}>
                                        <div className={styles["bar-code-text-box"]}><em>Enter a product code and click Generate Barcode to create a barcode</em></div>
                                   </div>
                              )}
                         </Grid>
                    </Grid>
               </Grid>
               <Grid item size={{ xs: 12, md: 6 }}>
                    <label htmlFor="manufacturer_name">Manufacturer Name:</label>         
                    <Controller
                    name="manufacturer_name"
                    control={control}
                    render={({ field }) => (
                         <TextField
                         {...field}
                         fullWidth
                         placeholder="Please Manufacturer Name:"
                         />
                    )}
                    />
                    {errors.manufacturer_name && <FormHelperText>{errors.manufacturer_name.message}</FormHelperText>}
               </Grid>
               <Grid item size={{ xs: 12, md: 6 }}>
                    <label htmlFor="quantity">Quantity:</label>         
                    <Controller
                    name="quantity"
                    control={control}
                    render={({ field }) => (
                         <TextField
                         {...field}
                         fullWidth
                         placeholder="Please Enter Quantity"
                         />
                    )}
                    />
                    {errors.quantity && <FormHelperText>{errors.quantity.message}</FormHelperText>}
               </Grid>
               <Grid item size={12} sx={{ mt: 2 }}>
                    <div style={{display:"flex",justifyContent:"end" }}>
                         <h4>
                         Pricing Information
                         </h4>
                    </div>
               </Grid>
               <Grid item size={{ xs: 12, md: 6 }}>
                    <label htmlFor="avg_cost_price"> Average Cost Price:</label>         
                    <Controller
                    name="avg_cost_price"
                    control={control}
                    render={({ field }) => (
                         <TextField
                         {...field}
                         fullWidth
                         type="number"
                         placeholder="Please Enter Average Cost Price"
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
               <Grid item size={{ xs: 12, md: 6 }}>
                    <label htmlFor="selling_price">Selling Price:</label>         
                    <Controller
                    name="selling_price"
                    control={control}
                    render={({ field }) => (
                         <TextField
                         {...field}
                         fullWidth
                         type="number"
                         placeholder="Please Enter Selling Price"
                         slotProps={{
                              input: {
                                   startAdornment: <span className={styles.currencySymbol}>₹</span>,
                              }
                    }}
                         />
                    )}
                    />
                    {errors.selling_price && <FormHelperText>{errors.selling_price.message}</FormHelperText>}
               </Grid>
               <Grid item size={{ xs: 12, md: 6 }}>
                    <label htmlFor="profit">Profit:</label>         
                    <Controller
                    name="profit"
                    control={control}
                    render={({ field }) => (
                         <TextField
                         {...field}
                         fullWidth
                         type="number"
                         placeholder="Please Enter Cost Price & Selling Price"
                         slotProps={{
                              input: {
                                   startAdornment: <span className={styles.currencySymbol}>₹</span>,
                                   readOnly:true
                              }
                    }}
                         />
                    )}
                    />
                    {errors.profit && <FormHelperText>{errors.profit.message}</FormHelperText>}
               </Grid>
               <Grid item size={{ xs: 12, md: 6 }}>
                    <label htmlFor="product_mrp">MRP:</label>         
                    <Controller
                    name="product_mrp"
                    control={control}
                    render={({ field }) => (
                         <TextField
                         {...field}
                         fullWidth
                         type="number"
                         placeholder="Please Enter MRP"
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
               <Grid item size={12} sx={{ mt: 2 }}>
                    <div style={{display:"flex",justifyContent:"end" }}>
                         <h4>
                        Vehicle & Model Compatibility
                         </h4>
                    </div>
               </Grid>
               <Grid item size={12}>
                    <label htmlFor="description">Description:</label>         
                    <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                         <TextareaAutosize
                         minRows={5}
                         maxRows={5}
                         style={{width:"100%",fontFamily:"poppins",padding:"10px",fontSize:"16px",borderRadius:"5px"}}
                         className={styles.textarea}
                         {...field}
                         placeholder="Please Enter Description (optional)"
                         />
                    )}
                    />
                    {errors.description && <FormHelperText>{errors.description.message}</FormHelperText>}
               </Grid> 
               <Grid item size={{ xs: 12, md: 6 }}>
                    <label htmlFor="associated_vehicles">Vehicles:</label>         
                    <Select
                         multiple
                         fullWidth 
                         value={selectedVehicles}
                         onChange={handleVehicleChange}
                         renderValue={(selected) => (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => {
                              const selectedItem = vehicleData.find((opt) => opt.id === value);
                              return selectedItem ? <Chip key={value} label={selectedItem.name} /> : null;
                              })}
                              </Box>
                         )}
                         // MenuProps={MenuProps}
                         >
                         <MenuItem value="" disabled>Select Vehicle</MenuItem>
                         {vehicleData?.map((vehicle) => (
                              <MenuItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.name}
                              </MenuItem>
                         ))}
                    </Select>
                    {errors.description && <FormHelperText>{errors.description.message}</FormHelperText>}
               </Grid>
               <Grid item size={{ xs: 12, md: 6 }}>
                    <label htmlFor="associated_models">Models:</label>         
                    <Select
                         multiple
                         fullWidth 
                         value={selectedModels}
                         onChange={handleModelChange}
                         renderValue={(selected) => (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => {
                                   const selectedItem = modelData.find((opt) => opt.id === value);
                                   return selectedItem ? <Chip key={value} label={selectedItem.name} /> : null;
                              })}
                              </Box>
                         )}
                         // MenuProps={MenuProps}
                         >
                         <MenuItem value="" disabled>Select Vehicle</MenuItem>
                         {modelData?.map((model) => (
                              <MenuItem key={model.id} value={model.id}>
                                   {model.name}
                              </MenuItem>
                         ))}
                    </Select>
                    {errors.associated_models && <FormHelperText>{errors.associated_models.message}</FormHelperText>}
               </Grid>
          </Grid>
          <Button type="submit" variant="contained">Edit Product</Button>
     </form>
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