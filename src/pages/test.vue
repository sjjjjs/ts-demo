<template>
    <div class=" m-4 pb-18">
        <bubble>
            <article class="prose m-auto">
                <VueMarkdown :source="answer" :options="options"></VueMarkdown>
            </article>
        </bubble>
    </div>
    <div class=" p-4 fixed left-0 bottom-0 right-0 bg-gray-100 shadow border-t border-gray-200">

        <div class=" max-w-prose m-auto flex items-center space-x-4">

            <el-input size="large" v-model="query" @keydown="handleKeyDown" />

            <el-button :icon="Promotion" size="large" type="primary" plain @click="test"
                :loading="['connecting', 'pending', 'messaging'].includes(status)">
                <template v-if="status === 'connecting'">连接中...</template>
                <template v-else-if="status === 'pending'">等待中...</template>
                <template v-else-if="status === 'messaging'">接收中...</template>
                <template v-else>发送</template>
            </el-button>
        </div>
    </div>

</template>

<script setup lang="ts">
import { Promotion } from '@element-plus/icons-vue'
import bubble from './chat/components/bubble.vue'
import VueMarkdown from 'vue-markdown-render'
import hljs from 'highlight.js' // https://highlightjs.org
import { computed, ref } from 'vue'
import { sendMessageStream } from '../libs/bot'

import 'highlight.js/styles/a11y-dark.min.css'

const query = ref('讲解 python 中的生成器')

const status = ref('init') // init/connecting/pending/messaging/closed/error
const answer = ref('')
const meta = ref<Record<string, unknown>>({})
const error = ref('')
const conversationId = ref('')

const allowSend = computed(() => {
    return status.value === 'init' || status.value === 'closed' || status.value === 'error'
})

const options = {
    highlight: function (str: string, lang: string) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(str, { language: lang }).value;
            } catch (__) { }
        }

        return ''; // use external default escaping
    }
}

function reset() {
    status.value = 'init'
    answer.value = ''
    meta.value = {}
    error.value = ''
}

function test() {
    const et = sendMessageStream('app-thaSjSXLylesmrZFPClRAE9y', {
        query: query.value,
        inputs: {},
        conversation_id: conversationId.value,
        files: []
    }, 'abc-123')
    query.value = ''
    reset()
    et.addEventListener('send', () => {
        status.value = 'connecting'
    })
    et.addEventListener('open', () => {
        status.value = 'pending'
    })
    et.addEventListener('message', (evt) => {
        if (status.value !== 'messaging') {
            status.value = 'messaging'
        }

        const data = (evt as MessageEvent)?.data as { event: 'message', conversation_id: string, answer: string } | { event: 'messageEnd', conversation_id: string, metadata: Record<string, unknown> }

        if (data.event === 'message') {
            answer.value = answer.value + data.answer

            if (!conversationId.value) {
                conversationId.value = data.conversation_id
            }
        } else if (data.event === 'messageEnd') {
            meta.value = data.metadata
        }
    })
    et.addEventListener('close', () => {
        status.value = 'closed'
    })
    et.addEventListener('error', (evt) => {
        status.value = 'error'
        error.value = (evt as CloseEvent)?.reason || 'n/a'
    })
}

function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && allowSend.value) {
        test()
    }
}

</script>