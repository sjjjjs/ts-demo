<template>
    <p>test-a</p>
</template>

<script setup lang="ts">

import { useDifyApi } from '@libs/ai-chat/hooks/useDifyApi'

const difyApi = useDifyApi('/api', 'app-cFYMgUpqBzuPo0tGoqfXAL48', 'abc-123')

difyApi.sendMessageStreaming({
    query: '你好呀',
    inputs: {}
}).then(r => {
    r.listen((info) => {
        console.log(info)
    })
})

</script>