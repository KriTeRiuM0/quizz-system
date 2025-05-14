import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import AdminScreen from './screens/AdminScreen';
import QuizScreen from './screens/QuizScreen';
import ResultsScreen from './screens/ResultsScreen';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  Profile: undefined;
  Admin: undefined;
  Quiz: { quizId: string };
  Results: { quizId: string; score: number; totalQuestions: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Admin" component={AdminScreen} />
          <Stack.Screen name="Quiz" component={QuizScreen} />
          <Stack.Screen name="Results" component={ResultsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}