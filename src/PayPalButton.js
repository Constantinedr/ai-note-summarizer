import { useEffect, useRef } from "react";

function PayPalButton({ amount = "5.00", onSuccess }) {
  const paypalRef = useRef();

  useEffect(() => {
    if (!window.paypal) return;

    window.paypal.Buttons({
      style: {
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "paypal",
      },
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{ amount: { value: amount } }],
        });
      },
      onApprove: async (data, actions) => {
        const details = await actions.order.capture();
        console.log("Transaction completed by", details.payer.name.given_name);
        onSuccess(details);
      },
      onError: (err) => {
        console.error("PayPal error", err);
      },
    }).render(paypalRef.current);
  }, [amount, onSuccess]);

  return <div ref={paypalRef}></div>;
}

export default PayPalButton;
