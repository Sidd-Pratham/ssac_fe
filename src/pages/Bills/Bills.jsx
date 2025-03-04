import { useForm,Controller } from "react-hook-form";
import styles from "./Bills.module.css";
import { TextField,Select,MenuItem,Button,TableContainer,Table,TableRow,TableCell,TableHead,Paper,TableBody } from "@mui/material";
import { useRef, useState } from "react";
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { fetchProduct, paymentMethods,paymentStatus,postBill } from "./Bills";
export default function Bills(){
     const[sales,setSaleOrders]=useState([]);
     const [showAlertMessage,setShowAlertMessage] = useState({
          status:false,
          type:"",
          message:""
        })
     const [totalReceived, setTotalReceived] = useState(sales.reduce((sum, product) => sum + product.total_price, 0));
     const {control,handleSubmit,reset,
           formState: { errors },   
          } = useForm({
                    defaultValues: {
                         consumer_contact: "",        
                         total_order_value:0,
                         total_received_payment:0,
                         payment_method:"",
                         total_profit:0,
                         payment_status:"",
                         sale_orders_details:[]
                    },
                  
          });
          
     const productCode = useRef(null);
     async function handleFormSubmission(data){
          if(sales.length==0)
          {
               setShowAlertMessage((prev)=>({
                    ...prev,
                    status:true,
                    type:"error",
                    message:"Atleast one sale order required for bill generation"
                  }))
               return;
          }
         const payload={
          ...data,
          total_order_value:sales.reduce((sum, product) => sum + product.total_price, 0),
          total_received_payment:totalReceived,
          total_profit:sales.reduce((sum,product)=>sum+ product.product_quantity * product.unit_profit,0),
          sale_orders_details:sales
         };
         const bill=await postBill(payload);
         console.log(bill)
         if(!bill.status){
          setShowAlertMessage((prev)=>({
               ...prev,
               status:true,
               type:"error",
               message:bill.message
             }))
             return;
         }else
         {
            setShowAlertMessage((prev)=>({
               ...prev,
               status:true,
               type:"success",
               message:"Bill generated Successfully"
             }))
               reset({
                    consumer_contact: "",        
                    total_order_value:0,
                    total_received_payment:0,
                    payment_method:"",
                    total_profit:0,
                    payment_status:"",
                    sale_orders_details:[]
               });
               setSaleOrders([]);
               setTotalReceived(0)
         }
     }
     async function  handleFetch(){
          if(productCode.current.value.trim()==""){
               alert("Product Can't be Empty or White-Space");
               return;
          }
          const check_existance=sales.find((sale_order)=>sale_order.product_code==productCode.current.value);
          if(check_existance)
          {
               handleQuantityChange(Number(check_existance.product_quantity) + 1 ,check_existance.product_id)
               return;
          }
          const product_details=await fetchProduct(productCode.current.value);
          if(!product_details.status){
               setShowAlertMessage((prev)=>({
                    ...prev,
                    status:true,
                    type:"error",
                    message:product_details.message
                  }))
               return;
          }
          setSaleOrders((prev)=>{
               return [{
                    product_name:product_details.data.name,
                    product_id:product_details.data.id,
                    product_code:product_details.data.product_code,
                    product_quantity:1,
                    unit_price:product_details.data.selling_price,
                    total_price:product_details.data.selling_price,
                    unit_profit:product_details.data.profit
               },...prev]
          })
          const new_sales_state=[...sales,{
                    product_name:product_details.data.name,
                    product_id:product_details.data.id,
                    product_code:product_details.data.product_code,
                    product_quantity:1,
                    unit_price:product_details.data.selling_price,
                    total_price:product_details.data.selling_price,
                    unit_profit:product_details.data.profit
          }]
          setTotalReceived(new_sales_state.reduce((sum, product) => sum + product.total_price, 0))
     }
     function handleQuantityChange(value,id){
          console.log(value,id)
          const updatedSales= sales.map((product) =>
               product.product_id == id ? {
                ...product, 
               product_quantity:Number(value),
               total_price:product.unit_price*(value),
          } : product
          );
          setSaleOrders(updatedSales);
          setTotalReceived(updatedSales.reduce((sum, product) => sum + product.total_price, 0))
     };
     function handleReceivedPaymentChange(event){
          setTotalReceived(event.target.value)
     }
     function handleClose(){
          setShowAlertMessage((prev)=>({
            ...prev,
            status:false
          }));
     }
     return <>
     <div className={styles['generate-bill-component']}>
          <div className={styles.header}>
               <h1>Create Bill</h1>
          </div>
          <form onSubmit={handleSubmit(handleFormSubmission)} className={styles.form}>  
          <div className={styles["form-head"]}>   
          {/* Consumer  Details */}
               <div className={styles["form-field"]}>
                    <label htmlFor="consumer_contact">Consumer Details:</label>
                    <Controller
                         name="consumer_contact"
                         control={control}
                         rules={{ required: "Consumer Details can't be empty" }}
                         render={({ field }) => (
                         <TextField {...field}  fullWidth placeholder="Enter consumer details" />
                         )}
                    />
                    {errors.consumer_contact && <span className={styles["error-mssg"]}>{errors.consumer_contact.message}</span>}
               </div>
          {/* Payment Method*/}
               <div className={styles["form-field"]}>
                    <label htmlFor="payment_method">Payment Method:</label>
                    <Controller
                         name="payment_method"
                         control={control}
                         rules={{ required: "Please select Payment method"}}
                         render={({ field }) => (
                              <Select {...field} displayEmpty fullWidth className={styles['forms-selects']}>
                              <MenuItem value="" >
                                   Select Payment Method
                              </MenuItem>
                              {paymentMethods.map((method) => (
                                   <MenuItem key={method} value={method}>
                                   {method}
                                   </MenuItem>
                              ))}
                              </Select>
                         )}
                    />
                    {errors.payment_method && <span className={styles["error-mssg"]}>{errors.payment_method.message}</span>}
               </div>
          {/* Payment Status*/}
               <div className={styles["form-field"]}>
                    <label htmlFor="payment_status">Payment Status:</label>
                    <Controller
                         name="payment_status"
                         control={control}
                         rules={{ required: "Please select Payment Status"}}
                         render={({ field }) => (
                              <Select {...field} displayEmpty fullWidth className={styles['forms-selects']}>
                              <MenuItem value="" >
                                   Select Payment Status
                              </MenuItem>
                              {paymentStatus.map((status) => (
                                   <MenuItem key={status} value={status}>
                                   {status}
                                   </MenuItem>
                              ))}
                              </Select>
                         )}
                    />
                    {errors.payment_status && <span className={styles["error-mssg"]}>{errors.payment_status.message}</span>}
               </div>
          </div>
          <div className={styles["form-sales-generation"]}>
          {/* Sales-Order Generation*/}
               <div>
                    <label htmlFor="sale_orders">Generate Sale Order:</label>
                    <div className={styles["product-bar"]}>
                         <div id={styles["product-code-text-field"]}>
                         <TextField placeholder="Enter product code" fullWidth inputRef={productCode}/>
                         </div>
                         <Button variant="contained" className={styles.button} onClick={handleFetch}>Fetch</Button>
                    </div>
               </div>                
          </div>
          <div className={styles["form-sales-display"]}>
          {/* Sale-Orders */}
               <div>
              {sales.length>0 && <TableContainer component={Paper} className={styles['product-details']}>
                    <Table aria-label="simple table">
                    <TableHead>
                         <TableRow className={styles.tableRow}>
                              <TableCell align="left"  className={styles.tableCell}>Product</TableCell>
                              <TableCell align="left"  className={styles.tableCell}>Product Code</TableCell>
                              <TableCell align="left"  className={styles.tableCell}>Unit Price</TableCell>
                              <TableCell align="left"  className={styles.tableCell}>Quantity</TableCell>
                              <TableCell align="left"  className={styles.tableCell}>Product Total</TableCell>
                         </TableRow>
                    </TableHead>
                    <TableBody>
                    {                    
                         sales.map((row) => (
                              <TableRow key={row.product_id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }} className={styles.tableRow}>
                              <TableCell align="left"  className={styles.tableCell}>{row.product_name}</TableCell>
                              <TableCell align="left"  className={styles.tableCell}>{row.product_code}</TableCell>
                              <TableCell align="left"  className={styles.tableCell}>{row.unit_price}</TableCell>
                              <TableCell  className={styles.tableCell}> 
                                   <TextField 
                                        className={styles.quantity} 
                                        value={row.product_quantity} 
                                        type="number" 
                                        fullWidth
                                        onChange={(event)=>handleQuantityChange(event.target.value,row.product_id)}
                                        slotProps={{input:{ min: 1,  onInput: (event) => {
                                             if (event.target.value < 1) event.target.value = 1; // Enforce min
                                           } }}}
                                   >
                                   </TextField>
                              </TableCell>
                              <TableCell align="left"  className={styles.tableCell}>{row.total_price}</TableCell>
                              </TableRow>
                         ))}
                    </TableBody>
                    </Table>
               </TableContainer>}
               </div>                
          </div>
          <div className={styles['form-footer']}>
          <div className={styles['footer-fields']}>

          {/* Total Order Values */}
               <div className={styles["form-field"]}>
                    <label htmlFor="total_order_value">Total order value:</label>
                    <Controller
                         name="total_order_value"
                         control={control}
                         render={({ field }) => (
                         <TextField {...field} slotProps={{input: {readOnly: true}}} value={sales.reduce((sum, product) => sum + product.total_price, 0)}/>
                         )}
                    />
                    {errors.total_order_value && <span className={styles["error-mssg"]}>{errors.total_order_value.message}</span>}
               </div>
          {/* Total Received Values */}
               <div className={styles["form-field"]}>
                    <label htmlFor="total_received_payment">Total Payment Received:</label>
                    <Controller
                         name="total_received_payment"
                         control={control}
                         rules={{ required: "Received payment can't be empty" }}
                         render={({ field }) => {
                         return(
                         <TextField {...field} 
                         type="number" 
                         value={totalReceived}
                         onChange={handleReceivedPaymentChange}
                         slotProps={{input:{ min: 1,  onInput: (event) => {
                              if (event.target.value < 1) event.target.value = 1; // Enforce min
                            } }}}/>
                         )}}
                    />
                    {errors.total_received_payment && <span className={styles["error-mssg"]}>{errors.total_received_payment.message}</span>}
               </div>   
               <Button type="submit" className={styles['footer-buttons']} variant="contained">Create </Button>
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