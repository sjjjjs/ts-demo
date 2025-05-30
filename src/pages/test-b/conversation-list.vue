<template>

    <div class="conversation-list h-[100%] overflow-auto space-y-1 p-2 rounded-2xl">
        <div class="conversation-item p-2 hover:bg-amber-50 cursor-pointer" @click="() => handleClick('')">
            <span>新对话{{ deleteOperation.status.value }}</span>
        </div>
        <div :class="{
            'conversation-item p-2 hover:bg-amber-50 cursor-pointer relative group': true,
            'bg-amber-100': item.id === conversationId
        }" v-for="item in conversationList" @click="() => handleClick(item.id)">
            <div class=" overflow-ellipsis overflow-hidden whitespace-nowrap" :key="item.id">
                <span>{{ item.name }}</span>
            </div>
            <div class=" text-sm mt-2">{{ formatTime(item.created_at) }}</div>
            <div class=" absolute top-0 right-0 bottom-0 hidden justify-center items-center group-hover:flex">
                <el-dropdown @command="(c: string) => handleCommand(c, item)">
                    <el-button plain>操作</el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="rename">重命名</el-dropdown-item>
                            <el-dropdown-item command="delete">删除</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </div>
    </div>

    <el-dialog title="重命名对话" v-model="renameDialogVisible">
        <el-input v-model="inputValue"></el-input>

        <template #footer>
            <el-button @click="renameDialogVisible = false">取消</el-button>
            <el-button @click="handleConfirmRename">确定</el-button>
        </template>
    </el-dialog>


    <el-dialog title="提示" :model-value="deleteOperation.status.value === 'confirming'">
        <p>请确认是否删除对话：{{ deleteOperation.subject.value?.name }}({{ deleteOperation.subject.value?.id }})</p>

        <template #footer>
            <el-button @click="deleteOperation.cancelApply">取消</el-button>
            <el-button @click="deleteOperation.confirmApply">确定</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { useConfirmOperation } from '@/libs/ai-chat/hooks/useConfirmOperation';
import { useConversationList } from '@/libs/ai-chat/hooks/useConversationList';
import dayjs from 'dayjs';
import { ref } from 'vue';

function formatTime(num: number): string {
    return dayjs(num * 1000).format('YYYY-MM-DD HH:mm:ss')
}



const {
    limit,
    loading,
    hasMore,
    conversationList,
    deleteConversation,
    renameConversation,
    reload,
    loadMore
} = useConversationList({
    baseUrl: '/api',
    apiKey: 'app-huIlz3nTd9FyPHbSgwRAj5JP',
    user: 'abc-123',
    limit: 20
})

const deleteOperation = useConfirmOperation<{ name: string, id: string }, any>({
    operation: async (target) => {
        await deleteConversation(target.id)
    }
})

const inputValue = ref('')
const renameId = ref('')
const renameDialogVisible = ref(false)

function handleConfirmRename() {
    renameConversation(renameId.value, inputValue.value).then(() => {
        renameDialogVisible.value = false
    })
}

function handleClick(id: string) {
    conversationId.value = id
}

function handleCommand(c: string, i: { id: string, name: string }) {
    if (c === 'rename') {
        renameDialogVisible.value = true
        renameId.value = i.id
        inputValue.value = i.name
    } else if (c === 'delete') {
        if (conversationId.value === i.id) {
            conversationId.value = ''
        }

        // deleteConversation(i.id)
        deleteOperation.apply(i)
    }
}

const conversationId = defineModel<string>()

</script>