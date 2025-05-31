<template>

    <div class="conversation-list h-[100%] overflow-auto space-y-1 p-2 rounded-2xl">
        <div class="conversation-item p-2 hover:bg-amber-50 cursor-pointer" @click="() => setCurrent('')">
            <el-button @click="() => setCurrent('')" type="primary">新对话</el-button>
            <el-button @click="refresh" :loading="loading">刷新</el-button>
        </div>
        <div :class="{
            'conversation-item p-2 hover:bg-amber-50 cursor-pointer relative group': true,
            'bg-amber-100': item.id === current
        }" v-for="item in list" @click="() => setCurrent(item.id)">
            <div class=" overflow-ellipsis overflow-hidden whitespace-nowrap" :key="item.id">
                <span>{{ item.name }}</span>
            </div>
            <div class=" text-sm mt-2">{{ formatTime(item.created_at) }}</div>
            <div class=" absolute top-0 right-0 bottom-0 hidden justify-center items-center group-hover:flex">
                <el-dropdown :teleported="false" @command="(c: string) => handleCommand(c, item)">
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


    <el-dialog title="提示"
        :model-value="deleteOperation.status.value === 'confirming' || deleteOperation.status.value === 'processing'"
        @close="deleteOperation.cancelApply">
        <p>请确认是否删除对话：{{ deleteOperation.subject.value?.name }}({{ deleteOperation.subject.value?.id }})</p>

        <template #footer>
            <el-button :disabled="deleteOperation.status.value === 'processing'"
                @click="deleteOperation.cancelApply">取消</el-button>
            <el-button :loading="deleteOperation.status.value === 'processing'"
                @click="deleteOperation.confirmApply">确定</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { useConfirmOperation } from '@/libs/ai-chat/hooks/useConfirmOperation';
import dayjs from 'dayjs';
import { ref, type Ref } from 'vue';

function formatTime(num: number): string {
    return dayjs(num * 1000).format('YYYY-MM-DD HH:mm:ss')
}

const props = defineProps<{
    list: any;
    current: string;
    loading: boolean;
    setCurrent: (val: string) => void
    remove: (id: string) => Promise<void>
    rename: (id: string, name: string) => Promise<void>
    refresh: () => void
}>()

const {
    current,
    setCurrent,
    rename,
    remove
} = props



const deleteOperation = useConfirmOperation<{ name: string, id: string }, any>({
    operation: async (target) => {
        await remove(target.id)
    }
})

const inputValue = ref('')
const renameId = ref('')
const renameDialogVisible = ref(false)

function handleConfirmRename() {
    rename(renameId.value, inputValue.value).then(() => {
        renameDialogVisible.value = false
    })
}



function handleCommand(c: string, i: { id: string, name: string }) {
    if (c === 'rename') {
        renameDialogVisible.value = true
        renameId.value = i.id
        inputValue.value = i.name
    } else if (c === 'delete') {
        if (current === i.id) {
            setCurrent('')
        }

        // deleteConversation(i.id)
        deleteOperation.apply(i)
    }
}



</script>