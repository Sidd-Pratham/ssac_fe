import { BASE_URL } from "../../../constants";

export const paymentMethods=['UPI','Cash',"Card"];
export const paymentStatus=['Paid','Pending']
export async function fetchProduct(code){
          try {               
               const response = await fetch(`${BASE_URL}/products/code/${code}`);
               const data = await response.json();
               if(!data.status){
                    return {status:false,message:data.message}
               }
               return data;
          }catch(error) {
               return {status:false,message:error.message}
          }
}
export async function postBill(payload) {
     try {
          const response = await fetch(`${BASE_URL}/bills`, {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify(payload),
          });
          const data = await response.json();
          if(!data.status){
               return {status:false,message:data.message}
               }
          return data;
     } catch (error) {
          return {status:false,message:error.message}
     }
}
export async function fetchBills(searchObject){
     try{
          console.log(searchObject);
          const params = new URLSearchParams();
          if (searchObject.query) params.append("query", searchObject.query);
          if (searchObject.billing_date) params.append("billing_date", searchObject.billing_date);
          if (searchObject.payment_status) params.append("payment_status", searchObject.payment_status);
               const response = await fetch(`${BASE_URL}/bills?${params.toString()}`);
               const data = await response.json();
               if(!data.status){
                    return {status:false,message:data.message}
               }
               return data;
     }catch(error)
     {
          return {status:false,message:error.message}
     }
}