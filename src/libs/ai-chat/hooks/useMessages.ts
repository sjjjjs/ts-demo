import { nextTick, ref, type Ref } from "vue"

interface IdData<T> {
    id: string
    value: T
}
export function useMessages<T>(options: {
    onChange?: () => void
} = {}) {
    const messaegList = ref([]) as Ref<IdData<T>[]>

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
    function update(id: string, newValue: T): void {
        const item = messaegList.value.find(item => item.id === id)
        if (item) {
            item.value = newValue
        }
        dataChangeHook()
    }

    return {
        list: messaegList,
        append,
        prepend,
        update
    }
}