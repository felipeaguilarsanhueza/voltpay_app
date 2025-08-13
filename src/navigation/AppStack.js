// src/navigation/AppStack.js
import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ConnectingScreen from '../screens/ConnectingScreen';
import ChargingSessionScreen from '../screens/ChargingSessionScreen';
import SessionSummaryScreen from '../screens/SessionSummaryScreen';
import { AuthContext } from '../context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Mapa" component={MapScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppStack() {
  const { session, loading } = useContext(AuthContext);
  if (loading) return null;  // o splash screen

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={session ? 'ChargingSession' : 'Main'}
    >
      <Stack.Screen name="Main" component={Tabs} />
      <Stack.Screen
        name="ChargingSession"
        component={ChargingSessionScreen}
        initialParams={session}
      />
      <Stack.Screen name="Connecting" component={ConnectingScreen} />
      <Stack.Screen name="SessionSummary" component={SessionSummaryScreen} />
    </Stack.Navigator>
  );
}
