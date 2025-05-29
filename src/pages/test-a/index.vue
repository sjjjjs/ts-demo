<template>
    <div class="page max-w-[1400px] mx-auto p-2">
        <div class=" py-2">
            <el-button @click="loadMore" :disabled="!hasMore">加载更多(limit={{ limit }})</el-button>
            <el-button @click="reload">重新加载</el-button>
        </div>
        <el-table :data="conversationList" style="width: 100%" :loading="loading">
            <el-table-column type="index" width="50px" label="#">
                <template #default="{ $index }">
                    {{ $index + 1 }}
                </template>
            </el-table-column>
            <el-table-column prop="name" label="标题"></el-table-column>

            <el-table-column prop="status" label="状态" width="120px"></el-table-column>
            <el-table-column prop="updated_at" label="更新时间" width="200px">
                <template #default="{ row }">
                    {{ formatTime(row.created_at) }}
                </template>
            </el-table-column>
            <el-table-column width="240px">
                <template #default="{ row }">
                    <el-button @click="() => handleRename(row)">重命名</el-button>
                    <el-button type="danger" @click="() => handleDelete(row.id)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>

    <el-dialog title="重命名对话" v-model="renameDialogVisible">
        <el-input v-model="inputValue"></el-input>

        <template #footer>
            <el-button @click="renameDialogVisible = false">取消</el-button>
            <el-button @click="handleConfirmRename">确定</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { useConversationList } from '@/libs/ai-chat/hooks/useConversationList'
import { useDifyApi } from '@libs/ai-chat/hooks/useDifyApi'
import { ref } from 'vue'

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
    limit: 1
})
// const difyApi = useDifyApi('/api', 'app-huIlz3nTd9FyPHbSgwRAj5JP', 'abc-123')

// difyApi.sendMessageStreaming({
//     query: '地球为什么有水',
//     inputs: {}
// }).then(r => {
//     r.listen((info) => {
//         console.log(info)
//     })
// })

const inputValue = ref('')
const renameId = ref('')
const renameDialogVisible = ref(false)

function handleRename(row: any) {
    inputValue.value = row?.name
    renameId.value = row?.id
    renameDialogVisible.value = true
}
function handleConfirmRename() {
    const newValue = inputValue.value
    renameConversation(renameId.value, inputValue.value).then(() => {
        renameDialogVisible.value = false
    })
}
function handleDelete(id: string) {
    deleteConversation(id)
}

</script>