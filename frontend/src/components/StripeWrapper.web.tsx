import React from 'react';

export function StripeProvider({ children }: any) {
  return <>{children}</>;
}

export function useStripe() {
  return {
    initPaymentSheet: async () => ({ error: { message: 'Stripe is not supported on Web in this demo.' } }),
    presentPaymentSheet: async () => ({ error: { message: 'Stripe is not supported on Web in this demo.' } }),
  };
}
