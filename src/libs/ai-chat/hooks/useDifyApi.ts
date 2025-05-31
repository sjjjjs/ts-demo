
import { request, sseRequest } from '@libs/ai-chat/utils/requestUtil'
import { safeJsonParse, safeJsonStringify } from '../utils/jsonUtil'
import type { Dify } from '../types'

const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

export function useDifyApi(
    baseUrl: string,
    apiKey?: string,
    user?: string
) {

    interface Cancellable {
        signal?: AbortSignal
    }
    interface GetMetaInfoResponse {
        tool_icons: {
            dalle2: string
            api_tool: {
                background: string
                content: string
            }
        }
    }
    async function getMetaInfo(params: Cancellable = {}) {
        return request<GetMetaInfoResponse>({
            url: apiOf(baseUrl, '/meta'),
            headers: getBaseHeaders(apiKey),
            signal: params.signal
        })
    }

    interface GetParametersResponse {
        introduction: string
        suggested_questions: string[]
        [key: string]: unknown
    }
    async function getParameters(params: Cancellable = {}) {
        return request<GetParametersResponse>({
            url: apiOf(baseUrl, '/parameters'),
            headers: getBaseHeaders(apiKey),
            signal: params.signal
        })
    }

    interface GetInfoResponse {
        name: string
        description: string
        tags: string[]
    }
    async function getInfo(params: Cancellable = {}) {
        return request<GetInfoResponse>({
            url: apiOf(baseUrl, '/info'),
            headers: getBaseHeaders(apiKey),
            signal: params.signal
        })
    }

    interface RenameConversationResponse {
        id: string
        name: string
        inputs: {}
        status: string
        introduction: string
        created_at: number
        updated_at: number
    }
    async function renameConversation(params: {
        conversation_id: string
        name: string
        auto_generate?: boolean
    } & Cancellable) {
        return request<RenameConversationResponse>({
            method: 'POST',
            url: apiOf(baseUrl, `/conversations/${params.conversation_id}/name`),
            headers: getBaseHeaders(apiKey),
            body: serialize({
                name: params.name,
                auto_generate: params.auto_generate,
                user
            }),
            signal: params.signal
        })
    }

    interface DeleteConversationResponse {
        result: 'success'
    }
    async function deleteConversation(params: {
        conversation_id: string
    } & Cancellable) {
        await delay(3000)
        return request<DeleteConversationResponse>({
            method: 'DELETE',
            url: apiOf(baseUrl, `/conversations/${params.conversation_id}`),
            headers: getBaseHeaders(apiKey),
            body: serialize({
                user
            }),
            signal: params.signal
        })
    }

    interface GetConversationsResponse {
        has_more: boolean
        limit: number
        data: Dify.Conversation[]
    }
    async function getConversations(params: {
        last_id?: string
        limit?: number
        sort_by?: 'created_at' | '-created_at' | 'updated_at' | '-updated_at'
    } & Cancellable) {
        return request<GetConversationsResponse>({
            method: 'GET',
            url: apiOf(baseUrl, `/conversations?${qs({
                user,
                last_id: params.last_id,
                limit: params.limit,
                sort_by: params.sort_by
            })}`),
            headers: getBaseHeaders(apiKey),
            signal: params.signal
        })
    }


    interface GetMessagesResponse {
        has_more: boolean
        limit: number
        data: Dify.Message[]
    }
    async function getMessages(params: {
        conversation_id: string
        first_id?: string
        limit?: number
    } & Cancellable) {
        return request<GetMessagesResponse>({
            method: 'GET',
            url: apiOf(baseUrl, `/messages?${qs({
                user,
                conversation_id: params.conversation_id,
                first_id: params.first_id,
                limit: params.limit
            })}`),
            headers: getBaseHeaders(apiKey),
            signal: params.signal
        })
    }

    interface GetSuggestedResponse {
        result: 'success',
        data: string[]
    }
    async function getSuggested(params: {
        message_id: string
    } & Cancellable) {
        return request<GetSuggestedResponse>({
            method: 'GET',
            url: apiOf(baseUrl, `/messages/${e(params.message_id)}/suggested?${qs({
                user
            })}`),
            headers: getBaseHeaders(apiKey),
            signal: params.signal
        })
    }

    interface FeedbackResponse {
        result: 'success',
        data: string[]
    }
    async function feedback(params: {
        message_id: string
        rating: string
        content?: string
    } & Cancellable) {
        return request<FeedbackResponse>({
            method: 'POST',
            url: apiOf(baseUrl, `/messages/${e(params.message_id)}/feedbacks`),
            headers: getBaseHeaders(apiKey),
            body: serialize({
                user,
                rating: params.rating,
                content: params.content
            }),
            signal: params.signal
        })
    }

    interface StopMessageResponse {
        result: 'success'
    }
    async function stopMessage(params: {
        task_id: string
    } & Cancellable) {
        return request<StopMessageResponse>({
            method: 'POST',
            url: apiOf(baseUrl, `/chat-messages/${e(params.task_id)}/stop`),
            headers: getBaseHeaders(apiKey),
            body: serialize({
                user
            }),
            signal: params.signal
        })
    }

    interface SendMessageBlockResponse {
        message_id: string
        conversation_id: string
        mode: 'chat'
        answer: string
        metadata: {
            usage: Record<string, unknown>
            retriever_resources: unknown[]
        }
        created_at: number
    }
    interface SendMessageRequest {
        query: string
        inputs: Record<string, any>
        conversation_id?: string
        files?: {
            type: string
            transfer_method: string
            url: string
            upload_file_id?: string
        }[]
        auto_generate_name?: boolean
    }
    async function sendMessageBlocking(params: SendMessageRequest & Cancellable) {
        return request<SendMessageBlockResponse>({
            method: 'POST',
            url: apiOf(baseUrl, '/chat-messages'),
            headers: getBaseHeaders(apiKey),
            body: serialize({
                query: params.query,
                inputs: params.inputs,
                user,
                response_mode: 'blocking',
                conversation_id: params.conversation_id || '',
                files: params.files
            }),
            signal: params.signal
        })
    }
    async function sendMessageStreaming(params: SendMessageRequest & Cancellable) {
        const target = new DifyStreamingTarget()
        sseRequest({
            method: 'POST',
            url: apiOf(baseUrl, '/chat-messages'),
            headers: getBaseHeaders(apiKey),
            body: serialize({
                query: params.query,
                inputs: params.inputs,
                user,
                response_mode: 'streaming',
                conversation_id: params.conversation_id || '',
                files: params.files
            }),
            signal: params.signal
        }, (data) => {
            target.$$handleStream(data)
        })

        return target
    }

    return {
        getMetaInfo,
        getParameters,
        getInfo,
        renameConversation,
        deleteConversation,
        getConversations,
        getMessages,
        getSuggested,
        feedback,
        stopMessage,
        sendMessageBlocking,
        sendMessageStreaming
    }
}

function apiOf(baseUrl: string, path: string): string {
    return `${baseUrl}${path}`
}
function getBaseHeaders(apiKey?: string): Record<string, string> {
    const result: Record<string, string> = {
        'Content-Type': 'application/json'
    }
    if (apiKey) {
        result['Authorization'] = `Bearer ${apiKey}`
    }
    return result
}

function e(str: string): string {
    return encodeURIComponent(str)
}
function qs(rec: Record<string, string | number | boolean | undefined>): string {
    const searchParams = new URLSearchParams()

    for (let key in rec) {
        if (rec[key] === undefined) continue;
        searchParams.set(key, String(rec[key]))
    }

    return searchParams.toString()
}
function serialize(data: Record<string, any>): string {
    for (let key in data) {
        if (data[key] === undefined) {
            delete data[key]
        }
    }
    return safeJsonStringify(data)
}

type DifyStreamingTargetListener = (info: {
    error: Error | null
    done: boolean
    data?: {
        timestamp: number
        value: Dify.ChunkChatCompletionResponse
    }
}) => void
class DifyStreamingTarget {
    private listeners: DifyStreamingTargetListener[] = []
    private done: boolean = false
    private error: Error | null = null
    private data: {
        timestamp: number
        value: Dify.ChunkChatCompletionResponse
    }[] = []

    private handleDone(err: Error | null) {
        this.done = true
        this.error = err || null

        this.listeners.forEach(fn => {
            fn({
                error: this.error,
                done: true,
            })
        })
    }
    private handleEvent(value: Dify.ChunkChatCompletionResponse) {
        const data = {
            timestamp: Date.now(),
            value
        }
        this.data.push(data)

        this.listeners.forEach(fn => {
            fn({
                error: null,
                done: false,
                data
            })
        })
    }
    private dumpHistoryToListener(fn: DifyStreamingTargetListener) {
        for (let val of this.data) {
            fn({
                error: null,
                done: false,
                data: val
            })
        }

        if (this.done) {
            fn({
                done: true,
                error: this.error,
            })
        }
    }
    listen(fn: DifyStreamingTargetListener): boolean {
        if (!this.listeners.includes(fn)) {
            this.listeners.push(fn)

            this.dumpHistoryToListener(fn)
            return true
        }
        return false
    }
    $$handleStream = (info: {
        timestamp: number
        error: Error | null
        done: boolean
        value?: string
    }) => {
        if (this.done) {
            return
        }

        if (info.done) {
            this.handleDone(info.error)
        }

        const val = info.value
        if (val) {
            const chunks = val.split('\n\n').filter(i => !!i)
            for (let chunk of chunks) {
                if (chunk.startsWith('data: ')) {
                    const data = chunk.slice(6)
                    const json = safeJsonParse(data)

                    if (json) {
                        this.handleEvent(json)
                    } else {
                        this.handleDone(new Error(`Invalid JSON format: ${data}`))
                    }
                } else if (chunk.startsWith('event: ping')) {
                    // console.info('recived ping event')
                } else {
                    this.handleDone(new Error(`Invalid chunk format: ${chunk}`))
                }
            }
        }
    }
}