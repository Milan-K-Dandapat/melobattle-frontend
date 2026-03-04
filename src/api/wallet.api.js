import API from "./axios"; // This points to your axiosInstance.js

/* ==============================
    CASHFREE DEPOSIT LOGIC
============================== */

/**
 * @desc Initialize a Cashfree Order
 * @route POST /api/v1/payment/create-order
 */
export const createDepositOrder = async (depositData) => {
  try {
    // 🔥 FIXED: Points to /payment/ to match your app.js mounting
    const response = await API.post("/payment/create-order", depositData);
    return response?.data || response;
  } catch (error) {
    console.error("Deposit Order API Error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * @desc Verify Cashfree Payment with Backend
 * @route POST /api/v1/payment/verify
 */
export const verifyPayment = async (verificationData) => {
  try {
    // 🔥 FIXED: Matches the verifyPayment controller we just wrote
    const response = await API.post("/payment/verify", verificationData);
    return response?.data || response;
  } catch (error) {
    console.error("Payment Verification API Error:", error.response?.data || error.message);
    throw error;
  }
};

/* ==============================
    WITHDRAWAL LOGIC (UPI)
============================== */

/**
 * @desc Submit a new UPI Withdrawal request
 * @route POST /api/v1/withdrawal/request
 */
export const requestWithdrawal = async (amount, upiId) => {
  try {
    // 🔥 DATA SYNC: Explicitly convert amount to Number to ensure DB deduction
    // Matches your WithdrawalPage.jsx payload and controller expectations
    const response = await API.post("/withdrawal/request", { 
      amount: Number(amount), 
      upiId 
    });
    return response?.data || response;
  } catch (error) {
    console.error("Withdrawal Request API Error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * @desc Fetch Payout History
 * @route GET /api/v1/withdrawal/history
 */
export const getWithdrawalHistory = async () => {
  try {
    // 🔥 FIXED: Standardized to the singular /withdrawal/ history route
    const response = await API.get("/withdrawal/history");
    return response?.data || response;
  } catch (error) {
    console.error("Withdrawal History API Error:", error.response?.data || error.message);
    throw error;
  }
};

/* ==============================
    GENERAL TRANSACTION HISTORY
============================== */

/**
 * @desc Fetch all credits/debits (Deposits, Wins, Entry Fees)
 * @route GET /api/v1/wallet/my-transactions
 */
export const getTransactionHistory = async () => {
  try {
    // 🔥 SYNC: Connects to your Transaction model for the Dashboard history
    const response = await API.get("/wallet/my-transactions");
    return response?.data || response;
  } catch (error) {
    console.error("Transaction History API Error:", error.response?.data || error.message);
    throw error;
  }
};