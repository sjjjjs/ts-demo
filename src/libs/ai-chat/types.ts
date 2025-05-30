
export interface Message<T = {}> {
    id: string
    data: T
}

export interface IdData<T> {
    id: string
    value: T
}

export interface BaseMessage {
    id: string
    query: string
    answer: string
    feedback?: {
        rating: string
        content?: string
    },
    suggested?: string[]
}

export type HistoryMessageProcessHandler<T> = (message: Dify.Message) => T

export interface StreamingEventInfo {
    done: boolean,
    error: Error | null,
    data?: {
        timestamp: number,
        value: Dify.ChunkChatCompletionResponse
    }
}


export interface StreamingEventProcessor<T> {
    handleEvent: (evt: StreamingEventInfo) => void
    getCurrent: () => T
    promise: () => Promise<void>
}
export type StreamingEventProcessorFactory<T> = (params: {
    query: string,
    conversationId: string,
    inputs: any
}) => StreamingEventProcessor<T>

// dify 服务返回的标准数据结构
export namespace Dify {
    export interface Conversation {
        id: string
        name: string
        inputs: {}
        status: string
        introduction: string
        created_at: number
        updated_at: number
    }
    export interface Message {
        id: string
        conversation_id: string
        inputs: {}
        query: string
        answer: string
        message_files: {
            id: string
            type: 'image'
            url: string
            belongs_to: 'user' | 'assistant'
        }[]
        status: string
        introduction: string
        created_at: number

        feedback: {
            rating: string
            content: string
        } | null
    }
    export interface ChunkChatCompletionResponse {
        event: string
        [key: string]: unknown
    }
}