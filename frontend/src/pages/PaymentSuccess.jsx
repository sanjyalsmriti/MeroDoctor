import React, { useState, useEffect } from "react";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const { backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();

  const [paymentDetails, setPaymentDetails] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    const searchParams = new URLSearchParams(window.location.search);
    const transactionUuid = searchParams.get("uuid");
    if (!transactionUuid) {
      toast.error("Transaction ID not found in URL.");
      console.error("Transaction ID not found in URL.");
      return;
    }

    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getPaymentDetails();
  }, [backendUrl]);

  const handleCopyTransactionId = () => {
    if (paymentDetails?.transaction_uuid) {
      navigator.clipboard.writeText(paymentDetails.transaction_uuid);
      setCopied(true);
      toast.success("Transaction ID copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const goToAppointment = () => {
    navigate("/my-appointments");
  };

  const handleDownloadReceipt = () => {
    if (!paymentDetails) {
      toast.error("Payment details not available");
      return;
    }

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

  const handleContactSupport = () => {
    window.open("mailto:support@mero.com", "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full border-4 border-emerald-200 animate-pulse"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading payment details...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your transaction information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-100 via-green-100 to-teal-100 rounded-full text-emerald-700 text-sm font-semibold mb-6 shadow-lg backdrop-blur-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Payment Success
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Payment <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">Successful!</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Your transaction has been completed successfully. Your appointment is now confirmed!
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8 md:p-12">
            {/* Success Icon with Animation */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl mx-auto mb-6">
                  <svg
                    className="w-16 h-16 text-white"
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
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-6 mb-8">
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-3xl p-6 border border-emerald-100">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-700 font-semibold text-lg">Amount Paid</span>
                  <span className="text-3xl font-bold text-emerald-600">
                    Rs. {paymentDetails ? paymentDetails.amount : "0.00"}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-emerald-100">
                    <span className="text-gray-600 font-medium">Date & Time</span>
                    <span className="text-gray-900 font-semibold">
                      {paymentDetails ? formatDate(paymentDetails.updatedAt) : "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-emerald-100">
                    <span className="text-gray-600 font-medium">Payment Method</span>
                    <span className="text-gray-900 font-semibold">ESEWA</span>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600 font-medium">Transaction ID</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-900 font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg">
                        {paymentDetails ? paymentDetails.transaction_code : "N/A"}
                      </span>
                      <button
                        onClick={handleCopyTransactionId}
                        className="p-2 hover:bg-emerald-100 rounded-xl transition-all duration-300 group"
                        title="Copy transaction ID"
                      >
                        {copied ? (
                          <svg
                            className="w-5 h-5 text-emerald-600"
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
                            className="w-5 h-5 text-gray-500 group-hover:text-emerald-600"
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
                <div className="bg-emerald-100 text-emerald-800 px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-3 shadow-lg">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span>Payment Confirmed</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleDownloadReceipt}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-emerald-700 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
              >
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
                Download Receipt
              </button>

              <button
                onClick={goToAppointment}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                <span>View My Appointments</span>
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
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm">
            Need help? Contact our support team at{" "}
            <button 
              onClick={handleContactSupport}
              className="text-emerald-600 hover:text-emerald-700 font-medium underline"
            >
              support@mero.com
            </button>
          </p>
        </div>

        {/* Floating Success Elements */}
        <div className="fixed top-10 left-10 opacity-10 pointer-events-none">
          <div className="w-8 h-8 bg-emerald-400 rounded-full animate-bounce"></div>
        </div>
        <div className="fixed top-20 right-16 opacity-10 pointer-events-none">
          <div className="w-6 h-6 bg-green-300 rounded-full animate-pulse"></div>
        </div>
        <div className="fixed bottom-16 left-20 opacity-10 pointer-events-none">
          <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping"></div>
        </div>
      </div>
    </div>
  );
}
