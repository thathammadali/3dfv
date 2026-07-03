import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useCameraPermissions } from 'expo-camera';
import Header from '../components/Header';
import { styles } from '../styles/styles';

export default function ARViewerScreen({
  url,
  onBack,
}: {
  url: string;
  onBack: () => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        const { granted } = await requestPermission();
        setHasPermission(granted);
      } else {
        setHasPermission(true);
      }
    })();
  }, [permission, requestPermission]);

  if (!permission || !hasPermission) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: '#000' }]}>
        <Header title="AR View" onBack={onBack} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#35C989" />
          <Text style={{ color: 'white', marginTop: 10 }}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: '#000' }]}>
      <Header title="AR View" onBack={onBack} />
      <View style={{ flex: 1 }}>
        <WebView
          source={{ uri: url }}
          style={{ flex: 1, backgroundColor: 'transparent' }}
          originWhitelist={['*']}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          mediaCapturePermissionGrantType="grant"
          javaScriptEnabled={true}
          domStorageEnabled={true}
          androidLayerType="hardware"
        />
      </View>
    </SafeAreaView>
  );
}
