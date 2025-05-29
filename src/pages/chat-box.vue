<template>
    <div class="w-[100vw] h-[100vh] overflow-auto pb-[300px]" ref="containerRef">
        <div class="w-[600px] mx-auto p-2 " v-for="item in messageList" :data-source="JSON.stringify(item, null, '  ')">
            <div class="pb-2 text-xs text-center">{{ formatTime(item.value.createAt) }}</div>
            <div class=" font-bold pb-4">
                <el-tooltip :content="item.id" placement="top">
                    <a class=" cursor-pointer" :id="item.id" :href="`#${item.id}`"># </a>
                </el-tooltip>
                <span>{{ item.value.query }}</span>
            </div>
            <div class="p-4 bg-gray-100 rounded" v-if="item.value.answer">
                <markdown :value="item.value.answer"></markdown>
            </div>
        </div>
    </div>
    <div class="fixed z-10 bg-white left-0 bottom-0 right-0 p-4">
        <div class=" absolute top-[-100px] right-[50px]" v-if="!enabledAutoScroll">
            <el-button @click="applyAutoScroll">到底部({{ scrollDistanceToBottom }})</el-button>
        </div>
        <div class=" w-[600px] mx-auto p-2">
            <el-input v-model="queryInput" @keydown.enter="send" :disabled="queryMessageLoading"></el-input>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useConversation } from '@/libs/ai-chat/hooks/useConversation';
import type { Dify } from '@/libs/ai-chat/types';
import { ref } from 'vue';
import markdown from './test-b/markdown.vue';
import { useAutoScrollBottom } from '@/libs/ai-chat/hooks/useAutoScrollBottom';
import dayjs from 'dayjs';

function formatTime(d: number) {
    return dayjs(d * 1000).format('YYYY-MM-DD HH-mm-ss')
}

const queryInput = ref('')
const containerRef = ref()

const { enabled: enabledAutoScroll, adjust, scrollDistanceToBottom, enable: applyAutoScroll } = useAutoScrollBottom(containerRef)

interface UniversalMessage {
    id: string,
    isHistory: boolean,
    query: string
    answer: string
    error: Error | null
    done: boolean,
    createAt: number
}
const historyMessageProssesor: Dify.HistoryMessageProcessHandler<UniversalMessage> = (msg) => {
    return {
        isHistory: true,
        id: msg.id,
        query: msg.query,
        answer: msg.answer,
        error: null,
        done: true,
        createAt: msg.created_at
    }
}

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
                done,
                createAt: Math.round(Date.now() / 1000)
            }
        }
    }
}

const searchParams = new URLSearchParams(location.search)
const conversationId = searchParams.get('converstationId') || ''

const { sendMessage, messageList, queryMessageLoading } = useConversation({
    baseUrl: '/api',
    apiKey: 'app-huIlz3nTd9FyPHbSgwRAj5JP',
    user: 'abc-123',

    historyMessageProssesor,
    streamingEventProcessorFactory,
    id: conversationId,
    onMessageListChange
})

function send() {
    if (queryInput.value) {
        sendMessage(queryInput.value)
        queryInput.value = ''
    }
}
function onMessageListChange() {
    adjust()
}
</script>