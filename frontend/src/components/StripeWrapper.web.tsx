import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe as useStripeJS, useElements } from '@stripe/react-stripe-js';
import { Modal, View, Text, Pressable, StyleSheet, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import Header from './Header';
import { styles as globalStyles } from '../styles/styles';

const StripeWebContext = createContext<any>(null);

function WebPaymentModal({ onPaymentComplete, onCancel }: any) {
  const stripe = useStripeJS();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePay = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMsg('');

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href, 
      },
      redirect: 'if_required',
    });

    setLoading(false);

    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setErrorMsg(error.message || 'Payment failed');
      } else {
        setErrorMsg('An unexpected error occurred.');
      }
    } else {
      onPaymentComplete();
    }
  };

  return (
    <Modal visible transparent={false} animationType="slide">
      <SafeAreaView style={globalStyles.screen}>
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <Header title="Complete Payment" onBack={onCancel} />
          
          <View style={[globalStyles.checkoutCard, { marginTop: 24 }]}>
            <View style={styles.elementContainer}>
              <PaymentElement />
            </View>
            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
            
            <Pressable 
              style={[globalStyles.primaryBtn, { marginTop: 24 }, loading && globalStyles.disabledBtn]} 
              onPress={handlePay} 
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={globalStyles.primaryBtnText}>Pay Now</Text>}
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export function StripeProvider({ children, publishableKey }: any) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  
  const clientSecretRef = React.useRef<string | null>(null);
  const [activeClientSecret, setActiveClientSecret] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [paymentResolver, setPaymentResolver] = useState<{ resolve: (val: any) => void } | null>(null);

  useEffect(() => {
    if (publishableKey) {
      setStripePromise(loadStripe(publishableKey));
    }
  }, [publishableKey]);

  const initPaymentSheet = async ({ paymentIntentClientSecret }: any) => {
    clientSecretRef.current = paymentIntentClientSecret;
    return { error: null };
  };

  const presentPaymentSheet = async () => {
    const secret = clientSecretRef.current;
    if (!secret) {
      return { error: { message: 'You must call initPaymentSheet first' } };
    }
    
    setActiveClientSecret(secret);
    setIsModalVisible(true);
    
    return new Promise((resolve) => {
      setPaymentResolver({ resolve });
    });
  };

  const handlePaymentComplete = () => {
    setIsModalVisible(false);
    if (paymentResolver) {
      paymentResolver.resolve({ error: null });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    if (paymentResolver) {
      paymentResolver.resolve({ error: { code: 'Canceled', message: 'The payment was canceled by the user.' } });
    }
  };

  const options = useMemo(() => ({ clientSecret: activeClientSecret || '' }), [activeClientSecret]);

  return (
    <StripeWebContext.Provider value={{ initPaymentSheet, presentPaymentSheet }}>
      {children}
      {isModalVisible && activeClientSecret && stripePromise && (
        <Elements stripe={stripePromise} options={options}>
          <WebPaymentModal 
            onPaymentComplete={handlePaymentComplete} 
            onCancel={handleCancel} 
          />
        </Elements>
      )}
    </StripeWebContext.Provider>
  );
}

export function useStripe() {
  const context = useContext(StripeWebContext);
  if (!context) {
    return {
      initPaymentSheet: async () => ({ error: { message: 'Stripe context not found.' } }),
      presentPaymentSheet: async () => ({ error: { message: 'Stripe context not found.' } }),
    };
  }
  return context;
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  elementContainer: {
    minHeight: 250,
  },
  errorText: {
    color: '#E74C3C',
    marginTop: 10,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F2F2F7',
  },
  cancelBtnText: {
    color: '#8E8E93',
    fontWeight: '600',
    fontSize: 16,
  },
  payBtn: {
    backgroundColor: '#35C989',
  },
  disabledBtn: {
    opacity: 0.7,
  },
  payBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  }
});
