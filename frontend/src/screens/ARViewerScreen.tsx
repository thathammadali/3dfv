import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, ActivityIndicator, Platform } from 'react-native';
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
  const is3D = url.includes('3d.html');
  const screenTitle = is3D ? '3D View' : 'AR View';

  useEffect(() => {
    if (Platform.OS === 'web') {
      setHasPermission(true);
      return;
    }
    (async () => {
      if (!permission?.granted) {
        const { granted } = await requestPermission();
        setHasPermission(granted);
      } else {
        setHasPermission(true);
      }
    })();
  }, [permission, requestPermission]);

  if (Platform.OS !== 'web' && (!permission || !hasPermission)) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: '#000' }]}>
        <Header title={screenTitle} onBack={onBack} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#35C989" />
          <Text style={{ color: 'white', marginTop: 10 }}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: '#000' }]}>
      <Header title={screenTitle} onBack={onBack} />
      <View style={{ flex: 1 }}>
        {Platform.OS === 'web' ? (
          <iframe
            src={url}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="camera; microphone"
          />
        ) : (
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
        )}
      </View>
    </SafeAreaView>
  );
}
