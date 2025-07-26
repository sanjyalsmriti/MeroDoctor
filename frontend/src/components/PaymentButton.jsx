import { useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { v4 as uuidv4 } from "uuid";

const PaymentButton = ({ appointmentId, amount, children }) => {
  const { backendUrl, userData, token } = useContext(AppContext);

  const handleClick = async () => {
    try {
      const transactionUuid = uuidv4();
      const response = await axios.post(
        `${backendUrl}/api/payment/esewa/initiate-payment`,
        {
          amount: amount,
          tax_amount: 0, // or calculate as needed
          product_service_charge: 0,
          product_delivery_charge: 0,
          transaction_uuid: transactionUuid,
          userData,
          appointmentId,
        },
        {
          headers: { token },
        }
      );
      const { esewaUrl, paymentData } = response.data;
      // Create and submit form
      const form = document.createElement("form");
      form.method = "POST";
      form.action = esewaUrl;
      for (const key in paymentData) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = paymentData[key];
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      alert("Payment initiation failed");
      console.error("Esewa payment error:", error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded bg-green-500 text-white hover:bg-primary hover:text-white transition-all duration-300"
    >
      {children}
    </button>
  );
};

export default PaymentButton;
