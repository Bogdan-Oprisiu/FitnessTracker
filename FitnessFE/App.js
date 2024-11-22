import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GlobalBackground from './components/global-gradient';
import Welcome from './components/welcome/welcome';
import Signup from './components/signup/signup';
import Login from './components/login/login';
import Home from './components/home-page/home';
import MainTabs from './components/bottom-navbar';
import Toast from 'react-native-toast-message';
import { HeartRateProvider } from './components/heart-rate-provider';
import { WorkoutProvider } from './components/workout-provider';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import StartWorkout from './components/workouts-page/start-workout/start-workout';
import ExercisePage from './components/workouts-page/exercise/exercise';

const Stack = createNativeStackNavigator();

export default function App() {

  const [fontsLoaded] = useFonts({
    'FunkyFont': require('../FitnessFE/assets/fonts/Anton-Regular.ttf')
  })

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <HeartRateProvider>
      <WorkoutProvider>
        <GlobalBackground>
          <NavigationContainer>
            <Stack.Navigator 
              initialRouteName="Welcome"
              screenOptions={{
                cardStyle: { backgroundColor: 'transparent' },
              }}
            >
              <Stack.Screen
                name="Welcome"
                component={Welcome}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Signup"
                component={Signup}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Login"
                component={Login}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="MainTabs"
                component={MainTabs}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name='StartWorkout'
                component={StartWorkout}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name='ExercisePage'
                component={ExercisePage}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
          <Toast />
        </GlobalBackground>
      </WorkoutProvider>
    </HeartRateProvider>
  );
}