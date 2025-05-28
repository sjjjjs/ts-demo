import { ref } from 'vue'

type BlockingTaskProcessor<T> = (task: T) => Promise<void>
type TaskState = '' | 'pending' | 'done' | 'error' | 'cancel'
export function useBlockingTask<T>(
    process: BlockingTaskProcessor<T>,
    cancelProcess: BlockingTaskProcessor<T>
) {
    const state = ref<TaskState>('')
    const error = ref<Error>()
    const current = ref<T>()

    const run = async (task: T) => {
        if (['', 'done', 'error', 'canceled'].includes(state.value)) {
            error.value = undefined
            current.value = task
            state.value = 'pending'

            try {
                await process(task)
                state.value = 'done'
            } catch (err: any) {
                state.value = 'error'
                error.value = err as Error
            }
        }
    }
    const cancel = async () => {
        if (['pending'].includes(state.value)) {
            if (current.value) {
                await cancelProcess(current.value as T)
            } else {
                error.value = undefined
                state.value = ''
            }
        }
    }

    return {
        run,
        cancel,
        available: ['', 'done', 'error', 'canceled'].includes(state.value)
    }
}