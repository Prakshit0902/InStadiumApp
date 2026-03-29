import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';

function getApiBaseUrl() {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL;
  return base ? base.replace(/\/$/, '') : '';
}

function parseScannedCode(payload: string) {
  const value = String(payload || '').trim();
  if (!value) {
    return null;
  }

  if (value.startsWith('stadium-')) {
    return value;
  }

  try {
    const parsed = new URL(value);
    const fromQuery = parsed.searchParams.get('code');
    if (fromQuery) {
      return fromQuery;
    }

    const openSegment = '/api/qr/open/';
    const openIdx = parsed.pathname.indexOf(openSegment);
    if (openIdx >= 0) {
      return decodeURIComponent(parsed.pathname.slice(openIdx + openSegment.length));
    }
  } catch {
    return null;
  }

  return null;
}

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isResolving, setIsResolving] = useState(false);
  const [isScanned, setIsScanned] = useState(false);
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);

  const onScanned = useCallback(
    async ({ data }: { data: string }) => {
      if (isResolving || isScanned) {
        return;
      }

      setIsScanned(true);
      const code = parseScannedCode(data);

      if (!code) {
        if (data?.startsWith('http') || data?.startsWith('instadiumapp://')) {
          await Linking.openURL(data);
          return;
        }

        Alert.alert('Invalid QR', 'This QR code is not recognized for stadium mapping.', [
          { text: 'Scan Again', onPress: () => setIsScanned(false) },
        ]);
        return;
      }

      // Fast path for locally generated mapping format: stadium-<stadiumId>
      // This avoids a network resolve dependency when scanning in-app.
      if (code.startsWith('stadium-')) {
        const stadiumId = code.slice('stadium-'.length).trim();
        if (stadiumId) {
          router.replace({
            pathname: '/stadium/[id]',
            params: { id: stadiumId, welcome: '1' },
          });
          return;
        }
      }

      if (!apiBaseUrl) {
        Alert.alert('API URL Missing', 'Set EXPO_PUBLIC_API_BASE_URL in your app env to resolve stadium QR mappings.', [
          { text: 'Scan Again', onPress: () => setIsScanned(false) },
        ]);
        return;
      }

      try {
        setIsResolving(true);
        const response = await fetch(`${apiBaseUrl}/api/qr/resolve?code=${encodeURIComponent(code)}`);

        if (!response.ok) {
          throw new Error(`Failed with ${response.status}`);
        }

        const mapping = (await response.json()) as { stadiumId?: string; stadium?: { id: string } };
        const stadiumId = mapping?.stadiumId || mapping?.stadium?.id;

        if (!stadiumId) {
          throw new Error('No stadiumId in mapping response');
        }

        router.replace({
          pathname: '/stadium/[id]',
          params: { id: stadiumId, welcome: '1' },
        });
      } catch {
        Alert.alert('Unable to Resolve QR', 'Could not resolve this stadium QR. Try again.', [
          { text: 'Scan Again', onPress: () => setIsScanned(false) },
        ]);
      } finally {
        setIsResolving(false);
      }
    },
    [apiBaseUrl, isResolving, isScanned, router]
  );

  if (!permission) {
    return <View style={styles.center}><Text style={styles.info}>Preparing camera...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Camera Access Needed</Text>
        <Text style={styles.info}>Allow camera permission to scan stadium QR codes.</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Allow Camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={onScanned}
      />
      <View style={styles.overlay}>
        <Text style={styles.overlayTitle}>Scan Stadium QR</Text>
        <Text style={styles.overlayText}>Point your camera at a stadium QR code to open its welcome page.</Text>
        {isScanned && (
          <Pressable style={styles.button} onPress={() => setIsScanned(false)}>
            <Text style={styles.buttonText}>Scan Again</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(13, 13, 13, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    gap: 8,
  },
  overlayTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  overlayText: {
    color: '#f1f1f1',
    fontSize: 14,
    lineHeight: 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
    backgroundColor: '#faf7f2',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2d1e1e',
  },
  info: {
    fontSize: 15,
    color: '#5a4e4e',
    textAlign: 'center',
  },
  button: {
    marginTop: 4,
    backgroundColor: '#810000',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
