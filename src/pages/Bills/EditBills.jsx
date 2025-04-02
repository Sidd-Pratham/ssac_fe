import styles from "./EditBills.module.css";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { TextField } from "@mui/material";
import { Controller } from "react-hook-form";

export default function EditBills(){
     const schema=yup.object().shape({
               consumer_contact:yup.string().required("Please enter consumer details"),
               total_order_value:yup.number().required().positive("Total order value can't be negative"),
               total_received_payment:yup.number().required().positive("Total received payment can't be negative"),
               payment_method:yup.string().required("Please select payment method"),
               total_profit:yup.number().required().positive("Profit can't be negative"),
               payment_status:yup.string().required("Payment status can't be empty")
          })
     const {control,handleSubmit,
                formState: { errors },   
               } = useForm({
                         defaultValues: {
                              consumer_contact:"",
                              total_order_value:0,
                              total_received_payment:0,
                              payment_method:"",
                              total_profit:0,
                              payment_status:""
                         },
                         resolver:yupResolver(schema)
               });
     return <>
     <div className={styles["header"]}>
          <h1>Edit Bill</h1>
     </div>
     <div className={styles["bill-details"]}>
          <form onSubmit={handleSubmit}>
               <div>
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
                         {errors.name }
               </div>
          </form>
     </div>
     </>
}