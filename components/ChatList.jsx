import { View, Text, FlatList } from 'react-native'
import React from 'react'
import ChatItem from './ChatItem'

export default function ChatList({sortedConversations}) {
    return (
        <FlatList 
            data={sortedConversations}
            contentContainerStyle={{ gap: 5 }}
            keyExtractor={item => Math.random()}
            showsVerticalScrollIndicator={false}
            renderItem={({item, index}) => <ChatItem noBorder={index + 1 == sortedConversations?.length} item={item} index={index} />}
        />
    )
}