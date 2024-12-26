import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Ionicons } from '@expo/vector-icons';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ChatRoomScreen from './screens/ChatRoomScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';
import FriendsScreen from './screens/FriendsScreen';
import AddGroupScreen from './screens/AddGroupScreen';

import { loadUser } from './services/AuthService';
import { getToken } from './services/TokenService';
import { setEchoInstance } from './utils/echo';

import AuthContext from './contexts/AuthContext';
import SplashScreen from './screens/SplashScreen';

import HomeHeader from './components/HomeHeader';
import ChatRoomHeaderLeft from './components/ChatRoomHeaderLeft';
import ChatRoomHeaderRight from './components/ChatRoomHeaderRight';

import { MenuProvider } from 'react-native-popup-menu';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { RootStackParamList } from './navigation'; // The types file

// Pass the RootStackParamList to your stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

// For tab navigation, if you need typed tabs, you can define a TabParamList,
// but it's often optional if you're just using default types:
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Setup icons based on the route name
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help';
          if (route.name === 'Chat') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'New Group') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Friends') {
            iconName = focused ? 'people' : 'people-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="Chat"
        component={HomeScreen}
        options={{
          header: () => <HomeHeader title="Chat" />,
        }}
      />
      <Tab.Screen
        name="New Group"
        component={AddGroupScreen}
        options={{
          header: () => <HomeHeader title="New Group" />,
        }}
      />
      <Tab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{
          header: () => <HomeHeader title="Friends" />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  // If you have a specific type for 'user', define it or use 'any'
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState<'loading' | 'idle'>('loading');
  const [echo, setEcho] = useState<any>(null);

  useEffect(() => {
    async function runEffect() {
      try {
        const token = await getToken();
        if (!token) {
          setUser(null);
          setStatus('idle');
          return;
        }

        const currentUser = await loadUser();
        setUser(currentUser);

        const echoInstance = setEchoInstance(token);
        setEcho(echoInstance);
      } catch (e) {
        console.log('Failed to load user', e);
      }
      setStatus('idle');
    }

    runEffect();
  }, []);

  if (status === 'loading') {
    return <SplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MenuProvider>
        <AuthContext.Provider value={{ user, setUser, echo }}>
          <NavigationContainer>
            <Stack.Navigator>
              {user ? (
                // Authenticated screens
                <>
                  <Stack.Screen
                    name="HomeTabs"
                    component={HomeTabs}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="ChatRoom"
                    component={ChatRoomScreen}
                    options={({ route }) => {
                      // route.params has type { conversation: any }
                      return {
                        title: '',
                        headerShadowVisible: false,
                        headerLeft: () => (
                          <ChatRoomHeaderLeft
                            conversation={route.params?.conversation}
                          />
                        ),
                        headerRight: () => (
                          <ChatRoomHeaderRight
                            conversation={route.params?.conversation}
                          />
                        ),
                      } as NativeStackNavigationOptions;
                    }}
                  />
                  <Stack.Screen
                    name="AddExpense"
                    component={AddExpenseScreen}
                    options={({ route }) => ({
                      title: '',
                      headerShadowVisible: false,
                      headerLeft: () => (
                        <ChatRoomHeaderLeft conversation={route.params?.conversation} />
                      ),
                    })}
                  />
                  <Stack.Screen
                    name="Friends"
                    component={FriendsScreen}
                  />
                </>
              ) : (
                // Unauthenticated screens
                <>
                  <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="CreateAccount"
                    component={RegisterScreen}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="ForgotPassword"
                    component={ForgotPasswordScreen}
                  />
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </AuthContext.Provider>
      </MenuProvider>
    </GestureHandlerRootView>
  );
}
