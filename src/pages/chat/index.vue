<template>
    <div class=" h-[100vh] p-4 bg-gray-50">
        <Chat :loading="status === 1" @subtmit="handleSubmit">
            <Bubble>
                <Markdown :value="anwser" />
            </Bubble>
        </Chat>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Chat from './components/chat.vue'
import Bubble from './components/bubble.vue'
import Markdown from './components/markdown.vue'
import { useStreamRequest } from './hooks/useStreamRequest'

const { data, error, status, run } = useStreamRequest()

const handleSubmit = async (val: string) => {
    run(val)
}


const anwser = computed(() => {
    return (data.value || []).map((i: string) => {
        return JSON.parse(i).answer
    }).join('')
})
</script>