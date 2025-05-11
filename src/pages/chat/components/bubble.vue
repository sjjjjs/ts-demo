<template>
    <div class="chat-bubble max-w-[688px] flex space-x-4">
        <el-avatar class=" shrink-0 grow-0 mt-2" v-if="direction === 'left'">Bot</el-avatar>
        <el-card shadow="never" class=" shrink grow bubble-card">
            <slot></slot>
        </el-card>
        <el-avatar class=" shrink-0 grow-0 mt-2" v-if="direction === 'right'">You</el-avatar>
    </div>
</template>

<script setup lang="ts">

defineProps({
    direction: {
        type: String,
        default: 'left'
    }
})
</script>

<style lang="css">
.bubble-card .el-card__body {
    padding-top: 0;
    padding-bottom: 0;
}
</style>