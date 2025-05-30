import { ref } from "vue"
import { v4 as uuidv4 } from 'uuid';

type RequestFn<T> = (...args: any[]) => Promise<T>

interface UseRequestOptions<T> {
    manul?: boolean
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
}
export function useRequest<T>(
    requestFn: RequestFn<T>,
    options: UseRequestOptions<T> = {}
) {
    const { manul = false, onSuccess, onError } = options

    const data = ref<T>()
    const error = ref<Error>()
    const loading = ref(false)

    let lastTid: string = ''
    const run = async (...args: any[]): Promise<T> => {
        const tid = uuidv4()
        lastTid = tid
        loading.value = true
        error.value = undefined

        try {
            const response = await requestFn(...args)

            if (lastTid === tid) {
                data.value = response
            }
            onSuccess?.(response)
            return response
        } catch (err) {
            error.value = err as Error
            onError?.(err as Error)
            throw err
        } finally {
            loading.value = false
        }
    }

    if (!manul) {
        run()
    }

    return {
        data,
        error,
        loading,
        run
    }
}