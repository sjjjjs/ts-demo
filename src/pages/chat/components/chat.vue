<template>
    <div class="chat">
        <nav class="chat--head p-2">
            <h2>智能助手</h2>
        </nav>
        <div class="chat--container p-2" ref="containerRef">
            <div class="caht--container--messages space-y-2" ref="contentRef">
                <slot></slot>
            </div>
        </div>
        <div class="chat--foot">
            <div class="chat--foot--quick-reply"></div>
            <div class="chat--foot--input p-2">
                <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 3 }" v-model="query"></el-input>
                <el-button class=" ml-2" type="primary" @click="handleSubmit" :disabled="!query"
                    :loading="loading">发送</el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props: {
    loading: boolean
} = defineProps(['loading'])

const emit = defineEmits(['submit'])

const containerRef = ref()
const contentRef = ref()

const query = ref('')

const handleSubmit = async () => {
    emit('submit', query.value)
    query.value = ''
}
</script>

<style lang="scss" scoped>
.chat {
    height: 100%;
    display: flex;
    align-items: stretch;
    flex-direction: column;
    max-width: 660px;
    margin-inline: auto;

    &--head {
        flex-grow: 0;
        flex-shrink: 0;
    }

    &--container {
        flex-grow: 1;
        flex-shrink: 1;
    }

    &--foot {
        flex-grow: 0;
        flex-shrink: 0;

        &--quick-reply {}

        &--input {
            display: flex;
        }
    }
}
</style>