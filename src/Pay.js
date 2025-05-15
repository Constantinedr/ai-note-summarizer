import axios from "axios";
import { useState, useEffect } from "react";
import StripeCheckout from "react-stripe-checkout";

const Pay = () => {
  const [stripeToken, setStripeToken] = useState(null);

  const onToken = (token) => {
    setStripeToken(token);
  };

  useEffect(() => {
    const makeRequest = async () => {
      try {
        const res = await axios.post("https://ai-note-summarizer.onrender.com/api/checkout/payment", {
          tokenId: stripeToken.id,
          amount: 2000,
        });
        console.log(res.data);
      } catch (error) {
        console.error("Payment Error:", error);
      }
    };

    if (stripeToken) {
      makeRequest();
    }
  }, [stripeToken]);

  const KEY =
    "pk_test_51RJa3IEIeQu1kIobNXxY8o4pPhQ4juRvgfHMP2Lxv49ibFKZhNjQIStKOHxmKdYZGzlvnnZ37wEElwKgfxiam2ok00RPdIFhen";

  return (
    <div className="flex justify-center items-center h-screen">
      <StripeCheckout
        name="Constantine's Shop"
        image="https://cdn.discordapp.com/avatars/582167578781286410/32ed86bdcd72413a95488e72149bf354?size=1024"
        billingAddress
        shippingAddress
        description="Your total is $20"
        amount={2000}
        token={onToken}
        stripeKey={KEY}
      >
        <button className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-blue-700">
          Pay with Stripe
        </button>
      </StripeCheckout>
    </div>
  );
};

export default Pay;
