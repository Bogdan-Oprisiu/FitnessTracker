import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Welcome from './components/welcome/welcome';
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <Welcome />
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
