import { computed, ref } from "vue";
import { useDifyApi } from "./useDifyApi";
import { useRequest } from "./useRequest";
import type { BaseMessage, Dify, HistoryMessageProcessHandler, StreamingEventProcessorFactory } from "../types";
import { useMessages } from "./useMessages";
import { v4 as uuidv4 } from 'uuid';

export function useConversation<T extends BaseMessage>(options: {
    baseUrl: string,
    apiKey?: string,
    user?: string,
    id?: string,
    historyMessageProssesor: HistoryMessageProcessHandler<T>,
    streamingEventProcessorFactory: StreamingEventProcessorFactory<T>,
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
        currentMessageId.value = ''
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

        const msgId = processor.getCurrent().id
        if (msgId && !currentMessageId.value) {
            currentMessageId.value = msgId
            suggestedRequest.run(msgId)
        }
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

    const currentMessageId = ref('')
    const questions = ref<{
        id: string
        questions: string[]
    }>({
        id: '',
        questions: []
    })
    const suggestedQuestions = computed(() => {
        if (currentMessageId.value === questions.value.id && !lock.value) {
            return questions.value.questions
        }
        return []
    })
    const suggestedRequest = useRequest(async (id: string) => {
        const rsp = await difyApi.getSuggested({ message_id: id })
        if (Array.isArray(rsp.data) && rsp.data.length && id === currentMessageId.value) {
            questions.value.questions = [...rsp.data]
        }
        return []
    }, {
        manul: true
    })

    return {
        historyMessageLoading: loading,
        queryMessageLoading: lock,
        feedback,
        sendMessage,
        messageList,
        stopMessage,
        stopMessagePending,
        suggestedQuestions
    }
}