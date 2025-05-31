<template>
    <div class="h-[100%] overflow-auto pb-[80px] bg-white" ref="containerRef"
        :data-source="JSON.stringify(suggestedQuestions, null, '  ')">
        <div class="max-w-[600px] mx-auto p-2 " v-for="item in messageList" :key="item.id">
            <div class="pb-2 text-xs text-center">{{ formatTime(item.value.createAt) }}</div>
            <div class=" font-bold p-4 border border-blue-200 bg-blue-100 rounded-xl">
                <el-tooltip :content="item.id" placement="top">
                    <a class=" cursor-pointer" :id="item.id" :href="`#${item.id}`"># </a>
                </el-tooltip>
                <span>{{ item.value.query }}</span>
            </div>
            <template v-if="item.value.done">
                <div class="px-2" v-if="item.value.answer">
                    <markdown :value="item.value.answer || '[没有内容]'"></markdown>
                </div>

                <div class=" px-2 mt-2" v-if="item.value.id">
                    反馈：
                    <el-button
                        :type="item.value.feedback && item.value.feedback.rating === 'like' ? 'primary' : 'default'"
                        @click="() => fb({
                            dataId: item.id,
                            id: item.value.id,
                            rating: 'like'
                        })">喜欢</el-button>
                    <el-button
                        :type="item.value.feedback && item.value.feedback.rating === 'dislike' ? 'primary' : 'default'"
                        @click="() => fb({
                            dataId: item.id,
                            id: item.value.id,
                            rating: 'dislike'
                        })">不喜欢</el-button>
                </div>
            </template>
            <template v-else>
                <div class="px-2 rounded" v-if="item.value.answer">
                    <markdown :value="item.value.answer || '[没有内容]'"></markdown>
                </div>
                <div v-else class=" h-[60px]" v-loading="true"></div>
            </template>
        </div>

        <div class="suggested-questions max-w-[600px] mx-auto p-2 space-y-2 space-x-4 "
            v-if="suggestedQuestions.length">
            <div class="question p-2 inline border rounded-2xl border-amber-50 bg-amber-300 cursor-pointer select-none"
                @click="() => sendMessage(q)" v-for="q in suggestedQuestions">{{
                    q }}
            </div>
        </div>
    </div>
    <div class="absolute z-10 bg-gray-200 left-0 bottom-0 right-0 p-2">
        <div class=" absolute top-[-100px] right-[50px]" v-if="!enabledAutoScroll">
            <el-button @click="applyAutoScroll">到底部({{ scrollDistanceToBottom }})</el-button>
        </div>
        <div class=" max-w-[600px] mx-auto p-2">
            <el-input v-model="queryInput" @keydown.enter="send" v-if="!queryMessageLoading"></el-input>
            <el-button v-else type="danger" @click="stopMessage">停止</el-button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useConversation } from '@/libs/ai-chat/hooks/useConversation';
import type { HistoryMessageProcessHandler, StreamingEventProcessorFactory } from '@/libs/ai-chat/types';
import { ref } from 'vue';
import markdown from './markdown.vue';
import { useAutoScrollBottom } from '@/libs/ai-chat/hooks/useAutoScrollBottom';
import dayjs from 'dayjs';
import { useApplicationInfo } from '@/libs/ai-chat/hooks/useApplicationInfo';

function formatTime(d: number) {
    return dayjs(d * 1000).format('YYYY-MM-DD HH:mm:ss')
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
    taskId?: string
    feedback?: {
        rating: string
        content?: string
    }
}
const historyMessageProssesor: HistoryMessageProcessHandler<UniversalMessage> = (msg) => {
    return {
        isHistory: true,
        id: msg.id,
        query: msg.query,
        answer: msg.answer,
        error: null,
        done: true,
        createAt: msg.created_at,
        taskId: undefined,
        feedback: msg.feedback || undefined
    }
}

const streamingEventProcessorFactory: StreamingEventProcessorFactory<UniversalMessage> = (params) => {
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
                const msgId = (evt.data.value.message_id || '') as string

                if (!id) {
                    id = msgId
                }

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

const props = defineProps({
    conversationId: String
})

const conversationId = props.conversationId || ''

const { sendMessage, messageList, queryMessageLoading, stopMessage, feedback: fb, suggestedQuestions } = useConversation({
    baseUrl: '/api',
    apiKey: 'app-huIlz3nTd9FyPHbSgwRAj5JP',
    user: 'abc-123',

    historyMessageProssesor,
    streamingEventProcessorFactory,
    id: conversationId,
    onMessageListChange,
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


const { info } = useApplicationInfo({
    baseUrl: '/api',
    apiKey: 'app-huIlz3nTd9FyPHbSgwRAj5JP',
    user: 'abc-123',
})
</script>