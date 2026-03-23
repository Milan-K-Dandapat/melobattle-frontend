import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const params = new URLSearchParams(location.search);

        const payment_id = params.get("payment_id");
        const payment_request_id = params.get("payment_request_id");

        if (!payment_id || !payment_request_id) {
          toast.error("Invalid payment response");
          return navigate("/");
        }

        toast.loading("Verifying payment...", { id: "verify" });

        // 🔥 Call backend verify API
        const res = await axiosInstance.post("/payment/verify", {
          payment_id,
          payment_request_id,
          userId: user._id 
        });

        const data = res?.data;

        if (data.success) {
          await refreshUser();

          toast.success("Payment successful! Wallet updated.", { id: "verify" });

          setTimeout(() => {
            navigate("/wallet");
          }, 1500);
        } else {
          toast.error("Payment verification failed", { id: "verify" });
          navigate("/");
        }

      } catch (error) {
        console.error("Verification error:", error);
        toast.error("Something went wrong");
        navigate("/");
      }
    };

    verifyPayment();
  }, [location, navigate, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
        Processing Payment...
      </p>
    </div>
  );
};

export default PaymentSuccess;