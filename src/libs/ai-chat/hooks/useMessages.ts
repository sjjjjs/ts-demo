import { ref, type Ref } from "vue"

interface IdData<T> {
    id: string
    value: T
}
export function useMessages<T>() {
    const messaegList = ref([]) as Ref<IdData<T>[]>

    function append(message: T, id: string): void {
        messaegList.value.push({
            id,
            value: message
        })
    }
    function prepend(message: T, id: string): void {
        messaegList.value.unshift({
            id,
            value: message
        })
    }
    function find(id: string): T | null {
        return messaegList.value.find(item => id === item.id)?.value || null
    }
    function update(id: string, newValue: T): void {
        const item = messaegList.value.find(item => item.id === id)
        if (item) {
            item.value = newValue
        }
    }
    function clear(): void {
        messaegList.value = []
    }

    return {
        list: messaegList,
        append,
        prepend,
        find,
        clear,
        update
    }
}