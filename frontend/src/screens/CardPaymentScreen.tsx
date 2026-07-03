import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStripe } from '../components/StripeWrapper';

import Header from '../components/Header';
import { formatRs } from '../utils/format';
import { styles } from '../styles/styles';
import { createPaymentIntent } from '../api/payments';

export default function CardPaymentScreen({
  total,
  onBack,
  onPay,
}: {
  total: number;
  onBack: () => void;
  onPay: () => void;
}) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Payment Intent client secret
      const { data } = await createPaymentIntent(total);
      
      if (!data?.client_secret) {
        Alert.alert('Error', 'Unable to initiate payment.');
        setLoading(false);
        return;
      }
      
      // 2. Initialize Payment Sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: '3DFV',
        paymentIntentClientSecret: data.client_secret,
        defaultBillingDetails: {
          name: 'Customer',
        }
      });
      
      if (initError) {
        Alert.alert('Payment Initialization Error', initError.message);
        setLoading(false);
        return;
      }
      
      // 3. Present Payment Sheet
      const { error: presentError } = await presentPaymentSheet();
      
      if (presentError) {
        if (presentError.code === 'Canceled' || presentError.code === 'Failed') {
          // If Canceled, just return quietly or show minor warning.
          console.log('Payment canceled or failed:', presentError.message);
        } else {
          Alert.alert('Payment Error', presentError.message);
        }
      } else {
        // Success
        onPay();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Payment failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.pagePad}>
        <Header title="Card Payment" onBack={onBack} />

        <View style={styles.checkoutCard}>
          <Ionicons name="card-outline" size={42} color="#35C989" />
          <Text style={styles.sectionTitle}>Pay with Stripe</Text>
          <Text style={styles.mutedText}>
            Click the button below to open the secure Stripe checkout.
          </Text>
        </View>

        <View style={styles.checkoutCard}>
          <Text style={styles.sectionTitle}>Amount to Pay</Text>
          <Text style={styles.boldText}>{formatRs(total)}</Text>
        </View>

        <Pressable 
          style={[styles.primaryBtn, loading && styles.disabledBtn]} 
          onPress={handlePay}
          disabled={loading}
        >
          <Text style={styles.primaryBtnText}>{loading ? 'Processing...' : 'Pay with Card'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}