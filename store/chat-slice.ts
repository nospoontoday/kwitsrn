import { StateCreator } from "zustand";
import { Message } from "../types/message";
import { Conversation } from "../types/conversation";

type ChatState = {
    messages: Message[];
    selectedConversation: Conversation | null;
}

type ChatActions = {
    newMessage: (message: Message) => void;
    setMessages: (messages: Message[]) => void;
}

export type ChatSlice = ChatState & ChatActions;

export const createChatSlice: StateCreator<
    ChatSlice, 
    [['zustand/immer', never]], 
    [], 
    ChatSlice
> = (set) => ({
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
});