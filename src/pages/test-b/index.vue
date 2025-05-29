<template>
    <div class="page max-w-[1200px] mx-auto p-2">
        <div class="py-4">
            <el-row :gutter="24">
                <el-col :span="12">
                    <el-input v-model="query"></el-input>
                </el-col>
                <el-col :span="12">
                    <el-button :loading="queryMessageLoading" :disabled="!query" @click="send">发送</el-button>
                </el-col>
            </el-row>

            <div class="p-4">
                <div v-for="item in messageList">
                    <p>query: </p>
                    <markdown :value="item.value.query"></markdown>
                    <p>answer:</p>
                    <markdown :value="item.value.answer"></markdown>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useConversation } from '@/libs/ai-chat/hooks/useConversation';
import type { Dify } from '@/libs/ai-chat/types';
import markdown from './markdown.vue';
import { ref } from 'vue';

interface UniversalMessage {
    id: string,
    isHistory: boolean,
    query: string
    answer: string
    error: Error | null
    done: boolean
}
const historyMessageProssesor: Dify.HistoryMessageProcessHandler<UniversalMessage> = (msg) => {
    return {
        isHistory: true,
        id: msg.id,
        query: msg.query,
        answer: msg.answer,
        error: null,
        done: true
    }
}

const query = ref('')

const streamingEventProcessorFactory: Dify.StreamingEventProcessorFactory<UniversalMessage> = (params) => {
    let id = ''
    let answer = ''
    let done: boolean = false
    let error: Error | null = null

    let resolve: (() => void) | undefined = undefined
    const p = new Promise<void>((r) => {
        resolve = r as () => void
    })
    return {
        promise: () => {
            return p
        },
        handleEvent: (evt) => {
            if (evt.done) {
                done = true
                error = evt.error

                resolve?.()
            } else if (evt.data) {

                const event = evt.data.value.event
                const value = (evt.data.value.answer || '') as string


                if (event === 'message') {
                    answer += value || ''
                }
            }
        },
        getCurrent: () => {
            return {
                isHistory: false,
                id,
                query: params.query,
                answer,
                error,
                done
            }
        }
    }
}

const { sendMessage, messageList, queryMessageLoading } = useConversation({
    baseUrl: '/api',
    apiKey: 'app-huIlz3nTd9FyPHbSgwRAj5JP',
    user: 'abc-123',

    historyMessageProssesor,
    streamingEventProcessorFactory
})

function send() {
    if (query.value) {
        sendMessage(query.value)
    }
}
</script>