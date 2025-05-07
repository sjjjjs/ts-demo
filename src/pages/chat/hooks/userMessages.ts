import { ref } from "vue"

interface IMessage<T = Record<string, any>> {
    type: string
    content: T
    user?: {
        avatar: string
    },
    position?: 'left' | 'right'
}
export default function useMessages(defaultMessages: IMessage[]) {
    const messages = ref([] as IMessage[])

    return {
        messages,
    }
}