<template>
    <div class="page-wrap flex h-[100vh]">
        <div class="conversation-list-wrap w-[320px] shrink-0 bg-stone-100">
            <conversationList v-model="conversationId"></conversationList>
        </div>
        <div class="chat-box-wrap grow shrink bg-white relative">
            <chatBox :key="conversationId" :conversation-id="conversationId"></chatBox>
        </div>
    </div>
</template>

<script setup lang="ts">

import { ref } from 'vue';
import chatBox from './chat-box.vue';
import conversationList from './conversation-list.vue';

const conversationId = ref('')
</script>