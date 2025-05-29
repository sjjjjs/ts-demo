import { nextTick, ref, type Ref } from "vue"

import { type Dify } from '@libs/ai-chat/types'

export function useMessages<T extends Dify.BaseMessage>(options: {
    onChange?: () => void
} = {}) {
    const messaegList = ref([]) as Ref<Dify.IdData<T>[]>

    let calling: boolean = false
    function dataChangeHook() {
        if (calling) {
            return
        } else {
            calling = true
        }
        nextTick(() => {
            options.onChange?.()
            calling = false
        })
    }

    function append(message: T, id: string): void {
        messaegList.value.push({
            id,
            value: message
        })
        dataChangeHook()
    }
    function prepend(message: T, id: string): void {
        messaegList.value.unshift({
            id,
            value: message
        })
        dataChangeHook()
    }
    function replace(id: string, newValue: T): void {
        const item = messaegList.value.find(item => item.id === id)
        if (item) {
            item.value = newValue
        }
        dataChangeHook()
    }
    function override(id: string, update: Partial<T>): void {
        const item = messaegList.value.find(item => item.id === id)
        if (item) {
            item.value = {
                ...item.value,
                ...update
            }
        }
        dataChangeHook()
    }

    return {
        list: messaegList,
        append,
        prepend,
        replace,
        override
    }
}