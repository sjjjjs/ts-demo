
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
        }
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

    // // 标准流式数据块（数据对象）
    // interface StreamingChunk<T> {
    //     timestamp: number
    //     done: boolean
    //     error: Error | null
    //     data?: T
    // }
    // // 标准流式数据块生产端（一个源可以被多个接收器监听）
    // interface StreamingTarget<T> {
    //     connect: (listener: StreamingListener<T>) => boolean
    //     disconnect: (listener: StreamingListener<T>) => boolean
    // }

    // // 标准流式数据块接收端（一个接收器只对接一个源）
    // interface StreamingListener<T> {
    //     watch: (chunk: StreamingChunk<T>) => void
    // }


    // interface MessageBase { }
    // interface MessageAssembler {
    //     assemble(): MessageBase
    // }


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
}