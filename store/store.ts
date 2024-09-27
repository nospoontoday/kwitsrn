import { create } from "zustand";
import { Store } from "../types/store";
import { createChatSlice } from "./chat-slice";
import { immer } from "zustand/middleware/immer";

export const useStore = create<Store>()(immer((...a) => ({
    ...createChatSlice(...a)
})));