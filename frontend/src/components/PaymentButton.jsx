import { useContext, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { v4 as uuidv4 } from "uuid";

const PaymentButton = ({ appointmentId, amount, children }) => {
  const { backendUrl, userData, token } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className="group relative w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-3"
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          Processing...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          {children}
          <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </>
      )}
      
      {/* Ripple Effect */}
      <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </button>
  );
};

export default PaymentButton;
