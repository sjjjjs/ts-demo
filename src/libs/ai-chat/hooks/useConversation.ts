import { ref } from "vue";
import { useDifyApi } from "./useDifyApi";
import { useRequest } from "./useRequest";
import type { Dify } from "../types";
import { useMessages } from "./useMessages";
import { v4 as uuidv4 } from 'uuid';

export function useConversation<T extends Dify.BaseMessage>(options: {
    baseUrl: string,
    apiKey?: string,
    user?: string,
    id?: string,
    historyMessageProssesor: Dify.HistoryMessageProcessHandler<T>,
    streamingEventProcessorFactory: Dify.StreamingEventProcessorFactory<T>,
    onMessageListChange?: () => void
}) {
    const { baseUrl, apiKey, user, id, historyMessageProssesor } = options
    const difyApi = useDifyApi(baseUrl, apiKey, user)

    const conversationId = ref<string>(id || '')
    const {
        list: messageList,
        append: messageListAppend,
        replace: updateMessage,
        override: overrideMessage,
    } = useMessages<T>({
        onChange: options.onMessageListChange
    })

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
        }).then(() => {
            overrideMessage(id, {
                feedback: {
                    rating,
                    content
                }
            } as Partial<T>)
        })
    }

    const lock = ref(false)
    const currentTaskId = ref('')
    async function sendMessage(query: string) {
        lock.value = true
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

            const taskId = (info.data?.value.task_id || '') as string
            if (taskId && !currentTaskId.value) {
                currentTaskId.value = taskId
            }
        })

        await processor.promise()
        lock.value = false
    }

    const stopMessagePending = ref(false)
    async function stopMessage(): Promise<void> {
        if (currentTaskId.value) {
            stopMessagePending.value = true
            return difyApi.stopMessage({
                task_id: currentTaskId.value
            }).then(() => { }).finally(() => {
                stopMessagePending.value = false
            })
        }
    }

    return {
        historyMessageLoading: loading,
        queryMessageLoading: lock,
        feedback,
        sendMessage,
        messageList,
        stopMessage,
        stopMessagePending
    }
}