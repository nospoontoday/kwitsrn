import { useContext, useEffect, useState } from "react";
import { SafeAreaView, Text, View, RefreshControl  } from "react-native";
import AuthContext from "../contexts/AuthContext";
import { StatusBar } from "expo-status-bar";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import ChatList from "../components/ChatList";
import { loadConversations } from "../services/ConversationService";
import { useStore } from "../store/store";

import Icon from "react-native-vector-icons/Ionicons";

export default function() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="light" />
            <ChatList />
        </SafeAreaView>
    );
}
