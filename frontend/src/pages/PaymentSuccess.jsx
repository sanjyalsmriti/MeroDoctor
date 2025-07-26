import React, { useState, useEffect } from "react";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const { backendUrl, token } = useContext(AppContext);
  // getPaymentDetails
  const navigate = useNavigate();

  const [paymentDetails, setPaymentDetails] = useState(null);

  // Helper function to format date
  function formatDate(dateString) {
    if (!dateString || dateString === "N/A") return "N/A";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    const date = new Date(dateString);
    return date.toLocaleString("en-US", options);
  }
  const getPaymentDetails = async () => {
    // get uuid from query params in react router
    const searchParams = new URLSearchParams(window.location.search);
    const transactionUuid = searchParams.get("uuid");
    if (!transactionUuid) {
      toast.error("Transaction ID not found in URL.");
      console.error("Transaction ID not found in URL.");
      return;
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/get-payment-details`,
        {
          transaction_uuid: transactionUuid,
        },
        {
          headers: {
            token,
          },
        }
      );
      if (data.success) {
        toast.success("Payment details fetched successfully!");
        setPaymentDetails(data.payment);
      } else {
        toast.error("Failed to fetch payment details.");
        console.error("Failed to fetch payment details:", data.message);
      }
    } catch (error) {
      toast.error("Error fetching payment details.");
      console.error("Error fetching payment details:", error);
    }
  };
  const [showContent, setShowContent] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getPaymentDetails();
  }, [backendUrl]);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyTransactionId = () => {
    navigator.clipboard.writeText(paymentDetails.transaction_uuid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const goToAppointment = () => {
    // Redirect to appointment page
    navigate("/my-appointments");
  };
  const handleDownloadReceipt = () => {
    // Create receipt data
    const receiptData = {
      transactionId: paymentDetails.transaction_uuid,
      amount: paymentDetails.amount,
      date: formatDate(paymentDetails.updatedAt),
      paymentMethod: "esewa",
      status: paymentDetails.status,
    };

    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Receipt</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 40px 20px;
            color: #333;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #10b981; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
          }
          .header h1 { 
            color: #10b981; 
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          .success-icon {
            width: 60px;
            height: 60px;
            background: #10b981;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 30px;
          }
          .details { 
            background: #f9fafb; 
            padding: 25px; 
            border-radius: 12px; 
            margin: 20px 0;
            border: 1px solid #e5e7eb;
          }
          .detail-row { 
            display: flex; 
            justify-content: space-between; 
            margin: 12px 0; 
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { 
            font-weight: 600; 
            color: #6b7280;
          }
          .detail-value { 
            font-weight: 700; 
            color: #111827;
          }
          .amount { 
            font-size: 24px; 
            color: #10b981; 
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            background: #ecfdf5;
            border-radius: 8px;
          }
          .status { 
            text-align: center; 
            background: #dcfce7; 
            color: #166534; 
            padding: 12px; 
            border-radius: 25px; 
            font-weight: 600;
            margin: 20px 0;
          }
          .footer { 
            text-align: center; 
            color: #6b7280; 
            font-size: 14px; 
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          .transaction-id {
            font-family: monospace;
            background: #f3f4f6;
            padding: 4px 8px;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="success-icon">✓</div>
          <h1>Payment Receipt</h1>
          <p style="margin: 0; color: #6b7280;">Transaction Completed Successfully</p>
        </div>
        
        <div class="amount">
          <strong>Amount Paid: ${receiptData.amount}</strong>
        </div>
        
        <div class="status">
          ✓ ${receiptData.status}
        </div>
        
        <div class="details">
          <div class="detail-row">
            <span class="detail-label">Transaction ID:</span>
            <span class="detail-value transaction-id">${receiptData.transactionId}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date & Time:</span>
            <span class="detail-value">${receiptData.date}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Payment Method:</span>
            <span class="detail-value">${receiptData.paymentMethod}</span>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Thank you for your purchase!</strong></p>
          <p>Receipt generated on: ${new Date().toLocaleString()}</p>
          <p>Keep this receipt for your records.</p>
        </div>
      </body>
      </html>
    `;

    // Create PDF using browser's print functionality
    const printWindow = window.open("", "_blank");
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      printWindow.print();
      // Close the window after printing
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4">
      <div
        className={`max-w-md w-full transition-all duration-700 transform ${showContent ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
      >
        {/* Success Icon with Animation */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse">
              {/* Custom Checkmark SVG */}
              <svg
                className="w-12 h-12 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="absolute inset-0 w-24 h-24 bg-emerald-400 rounded-full mx-auto animate-ping opacity-20"></div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600 text-lg">
              Your transaction has been completed successfully
            </p>
          </div>

          {/* Payment Details */}
          <div className="space-y-6 mb-8">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 font-medium">Amount Paid</span>
                <span className="text-2xl font-bold text-gray-900">
                  Rs. {paymentDetails ? paymentDetails.amount : "0.00"}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="text-gray-900 font-medium">
                    {paymentDetails
                      ? formatDate(paymentDetails.updatedAt)
                      : "N/A"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Method</span>
                  <span className="text-gray-900 font-medium">ESEWA</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Transaction ID</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-900 font-medium text-sm">
                      {paymentDetails ? paymentDetails.transaction_code : "N/A"}
                    </span>
                    <button
                      onClick={handleCopyTransactionId}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="Copy transaction ID"
                    >
                      {copied ? (
                        <svg
                          className="w-4 h-4 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-center">
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Payment Confirmed</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleDownloadReceipt}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
            >
              {/* Download Icon */}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Download Receipt</span>
            </button>
          </div>

          <button
            onClick={goToAppointment}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 group"
          >
            <span>Continue Appointment</span>
            {/* Arrow Right Icon */}
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </div>

        {/* Support Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Need help?{" "}
            <button className="text-emerald-600 hover:text-emerald-700 font-medium underline">
              Contact Support
            </button>
          </p>
        </div>

        {/* Floating Success Elements */}
        <div className="fixed top-10 left-10 opacity-10">
          <div className="w-8 h-8 bg-green-400 rounded-full animate-bounce"></div>
        </div>
        <div className="fixed top-20 right-16 opacity-10">
          <div className="w-6 h-6 bg-emerald-300 rounded-full animate-pulse"></div>
        </div>
        <div className="fixed bottom-16 left-20 opacity-10">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
        </div>
      </div>
    </div>
  );
}
