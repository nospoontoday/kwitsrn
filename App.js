import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import { useEffect, useState } from "react";
import { loadUser } from "./services/AuthService";
import AuthContext from "./contexts/AuthContext";
import SplashScreen from "./screens/SplashScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import { getToken } from "./services/TokenService";
import HomeHeader from "./components/HomeHeader";
import { MenuProvider } from "react-native-popup-menu";
import ChatRoomScreen from "./screens/ChatRoomScreen";
import ChatRoomHeaderLeft from "./components/ChatRoomHeaderLeft";
import ChatRoomHeaderRight from "./components/ChatRoomHeaderRight";
import { setEchoInstance } from "./utils/echo";
import AddExpenseScreen from "./screens/AddExpenseScreen";
import { GestureHandlerRootView } from 'react-native-gesture-handler';  // Import this

const Stack = createNativeStackNavigator();

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

  if(status === "loading") {
    return <SplashScreen />
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
                    name="Home" 
                    component={HomeScreen} 
                    options={{
                      header: () => <HomeHeader />
                    }} 
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
                </>
              ) : (
                <>
                  <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
                  <Stack.Screen name="Create account" component={RegisterScreen} options={{headerShown: false}} />
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
