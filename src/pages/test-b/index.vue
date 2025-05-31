<template>
    <div class="page-wrap flex h-[100vh]">
        <div class="conversation-list-wrap w-[320px] shrink-0 bg-stone-100">
            <conversationList :current="current" :setCurrent="setCurrent" :refresh="refresh" :loading="loading"
                :list="list" :remove="remove" :rename="rename"></conversationList>
        </div>
        <div class="chat-box-wrap grow shrink bg-white relative">
            <chatBox :key="current" :conversation-id="current"></chatBox>
        </div>
    </div>
</template>

<script setup lang="ts">
import chatBox from './chat-box.vue';
import conversationList from './conversation-list.vue';
import { useRecentConversationList } from '@/libs/ai-chat/hooks/useRecentConversationList';

const {
    setCurrent,
    current,
    refresh,
    loading,
    list,
    remove,
    rename
} = useRecentConversationList({
    baseUrl: '/api',
    apiKey: 'app-huIlz3nTd9FyPHbSgwRAj5JP',
    user: 'abc-123',
    limit: 100
})
</script>