import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import HomeScreen from '../(tabs)';

export default function AuthLayout() {
  return (
    <View style={styles.container}>
      <View style={styles.gameContainer} pointerEvents="none">
        <HomeScreen />
      </View>
      <BlurView intensity={100} tint="dark" style={[StyleSheet.absoluteFill, styles.blurContainer]}>
        <View style={styles.overlay} />
        <BlurView intensity={50} tint="light" style={[StyleSheet.absoluteFill, styles.secondaryBlur]} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: 'transparent',
            },
            animation: 'fade',
          }}
        />
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gameContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  blurContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  secondaryBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
}); 