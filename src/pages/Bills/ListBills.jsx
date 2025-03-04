import { TextField,Select,MenuItem,Accordion,AccordionSummary,AccordionDetails ,Table,Button, TableBody, TableCell,TableRow,TableContainer,TableHead, Paper,AccordionActions } from "@mui/material";
import { paymentStatus,fetchBills } from "./Bills";
import styles from "./ListBills.module.css";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useState,useRef, useEffect } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
// import CloseIcon from '@mui/icons-material/Close';

export default function ListBills(){
     const navigate=useNavigate()
     const[bills,setBills] = useState([])
     let searchRef=useRef({
          query:"",
          billing_date:"",
          payment_status:""
     });
     useEffect(()=>{
          fetchData();
     },[]);
     function handleAddProduct(){
      navigate("/bills/create");
    }
     const fetchData = async () => {
          try {
            const billsData = await fetchBills(searchRef.current);
            if (!billsData.status) {
              throw new Error(`Error fetching Bills: ${billsData.message}`);
            }
            setBills(billsData.data);
          } catch (error) {
            setShowAlertMessage((prev)=>({
              ...prev,
              status:true,
              type:"error",
              message:error.message
            }));
     }}
     const [showAlertMessage,setShowAlertMessage] = useState({
      status:false,
      type:"",
      message:""
    })
     async function handleSearchChange(value,field){
          searchRef.current={
               ...searchRef.current,
               [field]:value
          };
          await fetchData()
     }
     function handleClose(){
      setShowAlertMessage((prev)=>({
        ...prev,
        status:false
      }));
    }
     return<>
     <div className={styles.header}>
        <div className={styles['header-left-wrapper']}>
            <h1>Bills</h1>
            <Button onClick={handleAddProduct} variant='contained' className={styles['addButton']}> + Create Bill </Button>
        </div>
        <div className={styles["header-right-wrapper"]}>
                <TextField placeholder="Search..." className={styles['search-bar']}onChange={(event)=>handleSearchChange(event.target.value,"query")} />
                <Select displayEmpty className={styles['forms-selects']} defaultValue="" onChange={(event)=>handleSearchChange(event.target.value,"payment_status")}>
                            <MenuItem value="" >
                                  Select Payment Status
                            </MenuItem>
                            {paymentStatus.map((status) => (
                                  <MenuItem key={status} value={status}>
                                  {status}
                                  </MenuItem>
                            ))}
                </Select>
              <LocalizationProvider dateAdapter={AdapterDayjs}>  
                  <DatePicker label="Billing Date" name="billing_date" format="DD/MM/YYYY" onChange={(event)=>{handleSearchChange(dayjs(event).format("YYYY-MM-DD"),"billing_date")}} />   
                  {/* {searchRef.current.billing_date && <Button onClick={()=>{handleSearchChange(null,"billing_date")}}><CloseIcon/></Button>} */}
              </LocalizationProvider>
        </div>
     </div>

     <div className={styles.bills}>
      <TableContainer component={Paper} className={styles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className={styles.tableHeaderCell}>Order Id</TableCell>
              <TableCell className={styles.tableHeaderCell}>Consumer Details</TableCell>
              <TableCell className={styles.tableHeaderCell}>Total Order Value</TableCell>
              <TableCell className={styles.tableHeaderCell}>Payment Method</TableCell>
              <TableCell className={styles.tableHeaderCell}>Payment Status</TableCell>
              <TableCell className={styles.tableHeaderCell}>Billing Date</TableCell>
            </TableRow>
          </TableHead>
        {
          bills.length==0 && (
            <TableRow>
              <TableCell colSpan={6}><em>No Found matching your criteria</em></TableCell>
            </TableRow>
          )
        }
          <TableBody>
            {bills.map((item) => (
              <TableRow key={item.id}>
                <TableCell colSpan={7} className={styles.accordionTableCell} padding="none">
                  <Accordion className={styles.rowAccordion}>
                    <AccordionSummary className={styles.accordionSummary}>
                      <div className={styles.summaryRowGrid}>
                        <div className={styles.summaryOrderId}>{item.id}</div>
                        <div className={styles.summaryConsumer}>{item.consumer_contact}</div>
                        <div className={styles.summaryValue}>{item.total_order_value}</div>
                        <div className={styles.summaryPayment}>{item.payment_method || "N/A"}</div>
                        <div className={styles.summaryStatus}>
                          <span className={styles[`status-${item.payment_status.toLowerCase()}`]}>
                            {item.payment_status}
                          </span>
                        </div>
                        <div className={styles.summaryDate}>
                          {dayjs(item.billing_date).format("DD/MM/YYYY")}
                        </div>
                      </div>
                    </AccordionSummary>
                    <AccordionDetails className={styles.accordionDetails}>
                      <TableContainer component={Paper} className={styles.detailsTable}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell className={styles.detailsHeaderCell}>Product Id</TableCell>
                              <TableCell className={styles.detailsHeaderCell}>Product Code</TableCell>
                              <TableCell className={styles.detailsHeaderCell}>Product Name</TableCell>
                              <TableCell className={styles.detailsHeaderCell}>Unit Price</TableCell>
                              <TableCell className={styles.detailsHeaderCell}>Quantity</TableCell>
                              <TableCell className={styles.detailsHeaderCell}>Amount</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {item.saleOrders.map((sale_order) => (
                              <TableRow key={sale_order.id}>
                                <TableCell className={styles.detailsCell}>{sale_order.id}</TableCell>
                                <TableCell className={styles.detailsCell}>{sale_order.productDetails.product_code}</TableCell>
                                <TableCell className={styles.detailsCell}>{sale_order.productDetails.name}</TableCell>
                                <TableCell className={styles.detailsCell}>{sale_order.unit_price}</TableCell>
                                <TableCell className={styles.detailsCell}>{sale_order.product_quantity}</TableCell>
                                <TableCell className={styles.detailsCell}>{sale_order.total_price}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                    <AccordionActions className={styles['action-bar']}>
                         <Button variant="contained" className={styles['action-btn']}>View</Button>
                         <Button variant="outlined"  className={styles['action-btn']}>Edit</Button>
                         <Button variant="outlined" className={`${styles['delete-btn']} ${styles['action-btn']}`}>Delete</Button>
                    </AccordionActions>
                  </Accordion>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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