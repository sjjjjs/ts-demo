import { ref } from "vue";
import type { Message } from "../types";

export function useMessageList() {
    const list = ref<Message[]>([])
    const append = (msg: Message) => {
        list.value.push(msg)
    }
    const prepend = (msg: Message) => {
        list.value.unshift(msg)
    }
    return {
        list,
        append,
        prepend
    }
}