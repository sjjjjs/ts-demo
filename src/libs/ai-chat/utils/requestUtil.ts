
interface RequestOptions {
    url?: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    body?: string
    headers?: Record<string, string>
    signal?: AbortSignal
}
export async function request<T>(options: RequestOptions = {}) {
    const { url = '/', method = 'GET', body, headers = {}, signal } = options

    const params: Record<string, any> = {
        url,
        method,
    }

    if (body) {
        params.body = body
    }
    if (headers) {
        params.headers = headers
    }
    if (signal) {
        params.signal = signal
    }

    try {
        const response = await fetch(url, params)

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, message: ${response.statusText}.`)
        }

        return response.json() as T
    } catch (err: any) {
        throw new Error(`Fetch error! message: ${err?.message || 'n/a'}`)
    }
}

interface SseHandlerEvent {
    done: boolean,
    timestamp: number,
    error: Error | null,
    value?: string
}
export async function sseRequest(
    options: RequestOptions,
    handler: (data: SseHandlerEvent) => void
): Promise<void> {
    const { url = '/', method = 'GET', body, headers = {}, signal } = options

    const params: Record<string, any> = {
        url,
        method,
    }

    if (body) {
        params.body = body
    }
    if (headers) {
        params.headers = headers
    }
    if (signal) {
        params.signal = signal
    }

    try {
        const response = await fetch(url, params)

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, message: ${response.statusText}.`)
        }

        if (!response.body) {
            throw new Error(`HTTP error! response body is invalid.`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')

        let done: boolean = false
        do {
            const { done: currentDone, value } = await reader.read()
            done = currentDone

            if (done) break;

            const text = decoder.decode(value)

            handler({
                timestamp: Date.now(),
                error: null,
                done: false,
                value: text
            })
        } while (!done)

        handler({
            timestamp: Date.now(),
            error: null,
            done: true
        })
    } catch (err: any) {
        const error = new Error(`Fetch error! message: ${err?.message || 'n/a'}`)

        handler({
            timestamp: Date.now(),
            error: error,
            done: true
        })
    }
}