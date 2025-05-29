
export interface Message<T = {}> {
    id: string
    data: T
}

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


    export type HistoryMessageProcessHandler<T> = (message: Message) => T

    export interface StreamingEventInfo {
        done: boolean,
        error: Error | null,
        data?: {
            timestamp: number,
            value: ChunkChatCompletionResponse
        }
    }
    export interface StreamingEventProcessor<T> {
        handleEvent: (evt: StreamingEventInfo) => void
        getCurrent: () => T
    }
    export type StreamingEventProcessorFactory<T> = (params: {
        query: string,
        conversationId: string,
        inputs: any
    }) => StreamingEventProcessor<T>
}