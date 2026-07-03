import React from 'react';
import { StripeProvider as NativeStripeProvider } from '@stripe/stripe-react-native';

export function StripeProvider({ children, publishableKey }: any) {
  return <NativeStripeProvider publishableKey={publishableKey}>{children}</NativeStripeProvider>;
}

export { useStripe } from '@stripe/stripe-react-native';
