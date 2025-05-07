import { ref } from "vue";
import { XhrSource } from "../utils";

export function useStreamRequest<T = any>() {
    const data = ref<T | null>(null)
    const error = ref<Error | null>(null)
    // 0 init/ 1 connecting/ 2 streaming/ 3 done/ 4 error
    const status = ref<0 | 1 | 2 | 3 | 4 | null>(0)

    const handleError = (err: any) => {
        error.value = new Error(err?.message || '发生异常')
        status.value = 4
    }
    const handleClose = () => {
        status.value = 3
    }
    const handleMessage = (e: any) => {
        if (Array.isArray(data.value)) {
            data.value.push(e.data)
        } else {
            data.value = [e.data]
            status.value = 2
        }
    }
    const run = async (msg: string) => {
        if (!msg) return

        data.value = null
        error.value = null
        status.value = 1

        try {
            const xs = XhrSource(
                'http://localhost/v1/completion-messages',
                {
                    method: 'post',
                    headers: {
                        'Authorization': 'Bearer app-FITxPBbQibgsADLtzHviHHaK',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        'inputs': {
                            "default_input": msg,
                            "A": "Sqlite3",
                        },
                        "response_mode": "streaming",
                        "user": "abc-123" // 用户标识，用于定义终端用户的身份，方便检索、统计
                    })
                }
            )

            xs.addEventListener('error', handleError);
            xs.addEventListener('close', handleClose);
            xs.addEventListener('message', handleMessage);
        } catch (err: any) {
            handleError(err)
        }

    }

    return {
        data,
        error,
        status,
        run
    }
}
