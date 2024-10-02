import { StateCreator } from "zustand";
import { Message } from "../types/message";
import { Conversation } from "../types/conversation";

type ChatState = {
    conversations: Conversation[];
    messages: Message[];
    selectedConversation: Conversation | null;
}

type ChatActions = {
    newMessage: (message: Message) => void;
    setMessages: (messages: Message[]) => void;
    setConversations: (conversations: Conversation[]) => void;
}

export type ChatSlice = ChatState & ChatActions;

export const createChatSlice: StateCreator<
    ChatSlice, 
    [['zustand/immer', never]], 
    [], 
    ChatSlice
> = (set) => ({
    conversations: [],
    messages: [],
    selectedConversation: null,
    newMessage: (message: Message) => {
        set((state) => {
            state.messages.push(message);
        })
    },
    setMessages: (messages: Message[]) => {
        set((state) => {
            state.messages = messages;
        });
    },
    setConversations: (conversations: Conversation[]) => {
        set((state) => {
            state.conversations = conversations;
        });
    },
});