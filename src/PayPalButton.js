import { useEffect, useRef } from "react";

function PayPalButton({ amount = "5.00", onSuccess, token }) {
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

        // Send payment details to backend
        try {
          await fetch('https://your-backend-url/api/payments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`, // Pass JWT token
            },
            body: JSON.stringify({
              token,
              orderId: data.orderID,
              payerEmail: details.payer.email_address,
              amount,
            }),
          });
          console.log('Payment recorded on server');
        } catch (error) {
          console.error('Error recording payment:', error);
        }
      },
      onError: (err) => {
        console.error("PayPal error", err);
      },
    }).render(paypalRef.current);
  }, [amount, onSuccess, token]);

  return <div ref={paypalRef}></div>;
}

export default PayPalButton;