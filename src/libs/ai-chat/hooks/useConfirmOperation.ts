import { ref } from "vue";

type Status = 'init' | 'confirming' | 'canceled' | 'processing' | 'processed'

interface UseConfirmOperationOptions<T, V, N = any> {
    operation: (sub: T, val: V) => void | Promise<void>
    onSuccess?: (data: N) => void
    onError?: (err: Error) => void
}
export function useConfirmOperation<T, V>(
    options: UseConfirmOperationOptions<T, V>
) {
    const { operation } = options

    const p = Promise.resolve()

    const subject = ref<T>()
    const status = ref<Status>('init')
    const error = ref<Error>()

    function reset() {
        subject.value = undefined
        status.value = 'init'
        error.value = undefined
    }
    async function operating(val: V) {
        if (!subject.value) {
            throw new Error('No subject provided.')
        }

        return await operation(subject.value, val)

    }

    function apply(sub: T): boolean {
        if (status.value === 'processed' || status.value === 'canceled') {
            reset()
        }
        if (status.value === 'init') {
            status.value = 'confirming'
            subject.value = sub
            return true
        }
        return false
    }
    function confirmApply(val: V): boolean {
        if (status.value === 'confirming') {
            status.value = 'processing'

            p.then(() => {
                return operating(val)
            }).then((data) => {
                status.value = 'processed'
                options.onSuccess?.(data)
            }).catch((err: any) => {
                options.onError?.(
                    err instanceof Error
                        ? err
                        : new Error(err?.message || 'System Exception.')
                )
            })
            return true
        }
        return false
    }
    function cancelApply(): boolean {
        if (status.value === 'confirming') {
            status.value = 'canceled'
            return true
        }
        return false
    }

    return {
        apply,
        confirmApply,
        cancelApply,

        subject,
        status
    }
}