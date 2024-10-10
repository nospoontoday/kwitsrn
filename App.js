import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"; // Import bottom tab navigator
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import ChatRoomScreen from "./screens/ChatRoomScreen";
import AddExpenseScreen from "./screens/AddExpenseScreen";
import { useEffect, useState } from "react";
import { loadUser } from "./services/AuthService";
import { getToken } from "./services/TokenService";
import AuthContext from "./contexts/AuthContext";
import SplashScreen from "./screens/SplashScreen";
import { MenuProvider } from "react-native-popup-menu";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import HomeHeader from "./components/HomeHeader";
import ChatRoomHeaderLeft from "./components/ChatRoomHeaderLeft";
import ChatRoomHeaderRight from "./components/ChatRoomHeaderRight";
import { setEchoInstance } from "./utils/echo";
import { Ionicons } from '@expo/vector-icons'; // Import icons
import FriendsScreen from "./screens/FriendsScreen";
import AddGroupScreen from "./screens/AddGroupScreen"; // Import AddGroupScreen

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator(); // Create bottom tab navigator

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Chat') {
            iconName = focused ? "chatbubble" : "chatbubble-outline";
          } else if (route.name === 'New Group') {
            iconName = focused ? "add-circle" : "add-circle-outline";
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
          header: () => <HomeHeader title="Chat" />,  // Pass "Chat" as the title
        }}
      />
      <Tab.Screen
        name="New Group" 
        component={AddGroupScreen} // Add the AddGroupScreen here
        options={{
          header: () => <HomeHeader title="New Group" />,  // Pass "New Group" as the title
        }}
      />
      <Tab.Screen 
        name="Friends" 
        component={FriendsScreen} 
        options={{
          header: () => <HomeHeader title="Friends" />,  // Pass "Friends" as the title
        }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState();
  const [status, setStatus] = useState("loading");
  const [echo, setEcho] = useState(null);

  useEffect(() => {
    async function runEffect() {
      try {
        const token = await getToken();
        if (token == null) {
          setUser(null);
          setStatus("idle");
          return;
        }

        const user = await loadUser();
        setUser(user);
        const echoInstance = setEchoInstance(token);
        setEcho(echoInstance);
      } catch (e) {
        console.log("Failed to load user", e);
      }

      setStatus("idle");
    }

    runEffect();
  }, []);

  if (status === "loading") {
    return <SplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MenuProvider>
        <AuthContext.Provider value={{ user, setUser, echo }}>
          <NavigationContainer>
            <Stack.Navigator>
              {user ? (
                <>
                  <Stack.Screen 
                    name="HomeTabs" 
                    component={HomeTabs} // Use the HomeTabs component here
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen 
                    name="ChatRoom" 
                    component={ChatRoomScreen}
                    options={({ route }) => ({
                      title: '',
                      headerShadowVisible: false,
                      headerLeft: () => <ChatRoomHeaderLeft conversation={route.params.conversation} />,
                      headerRight: () => <ChatRoomHeaderRight conversation={route.params.conversation} />,
                    })}
                  />
                  <Stack.Screen 
                    name="AddExpense" 
                    component={AddExpenseScreen}
                    options={({ route }) => ({
                      title: '',
                      headerShadowVisible: false,
                      headerLeft: () => <ChatRoomHeaderLeft conversation={route.params.conversation} />,
                    })}
                  />
                  <Stack.Screen 
                    name="Friends" 
                    component={FriendsScreen}
                  />
                </>
              ) : (
                <>
                  <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="Create account" component={RegisterScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="Forgot password" component={ForgotPasswordScreen} />
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </AuthContext.Provider>
      </MenuProvider>
    </GestureHandlerRootView>
  );
}
