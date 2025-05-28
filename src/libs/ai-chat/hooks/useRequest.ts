import { ref } from "vue"

type RequestFn<T> = (...args: any[]) => Promise<T>

interface UseRequestOptions<T> {
    manul?: boolean
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
}
export function useRequest<T>(
    requestFn: RequestFn<T>,
    options: UseRequestOptions<T>
) {
    const { manul = false, onSuccess, onError } = options

    const data = ref<T>()
    const error = ref<Error>()
    const loading = ref(false)

    const run = async (...args: any[]): Promise<T> => {
        loading.value = true
        error.value = undefined

        try {
            const response = await requestFn(...args)

            data.value = response
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