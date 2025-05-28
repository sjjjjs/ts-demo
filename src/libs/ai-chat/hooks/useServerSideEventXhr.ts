import { ref } from "vue"
import { xhrSource, type XhrSourceOptions } from '../utils/xhrSourceUtil'

type ServerSideEventXhrStatus = 'init' | 'message' | 'close' | 'error'
export function useServerSideEventXhr(
    options: XhrSourceOptions
) {
    const status = ref<ServerSideEventXhrStatus>('init')

    const et = xhrSource(options)

    et.target.addEventListener('event', () => { })
    et.target.addEventListener('close', () => { })
    et.target.addEventListener('error', ((error: CloseEvent) => {
        console.log(error.reason)
    }) as any)

    return {
        status,
    }
}