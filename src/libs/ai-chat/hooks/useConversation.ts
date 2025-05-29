import { ref } from "vue";
import { useDifyApi } from "./useDifyApi";
import { useRequest } from "./useRequest";
import type { Dify } from "../types";
import { useMessages } from "./useMessages";
import { v4 as uuidv4 } from 'uuid';

export function useConversation<T>(options: {
    baseUrl: string,
    apiKey?: string,
    user?: string,

    id?: string,

    historyMessageProssesor: Dify.HistoryMessageProcessHandler<T>,
    streamingEventProcessorFactory: Dify.StreamingEventProcessorFactory<T>,
}) {
    const { baseUrl, apiKey, user, id, historyMessageProssesor } = options
    const difyApi = useDifyApi(baseUrl, apiKey, user)

    const conversationId = ref<string>(id || '')
    const {
        list: messageList,
        append: messageListAppend,
        update: updateMessage
    } = useMessages<T>()

    const {
        loading,
    } = useRequest(async () => {
        if (conversationId.value) {
            const rsp = await difyApi.getMessages({
                conversation_id: conversationId.value
            })

            return rsp.data.map(msg => {
                messageListAppend(historyMessageProssesor(msg), msg.id)
            })
        }
    })

    async function feedback(id: string, rating: string, content?: string) {
        return difyApi.feedback({
            message_id: id,
            rating,
            content
        })
    }
    async function sendMessage(query: string) {
        const target = await difyApi.sendMessageStreaming({
            conversation_id: conversationId.value,
            query,
            inputs: {}
        })
        const processor = options.streamingEventProcessorFactory({
            query,
            conversationId: '',
            inputs: {}
        })

        const id = uuidv4()
        const msg = processor.getCurrent()
        messageListAppend(msg, id)

        target.listen((info) => {
            processor.handleEvent(info)
            const msg = processor.getCurrent()

            updateMessage(id, msg)
        })
    }

    return {
        historyMessageLoading: loading,
        messageList,
        feedback,
        sendMessage
    }
}