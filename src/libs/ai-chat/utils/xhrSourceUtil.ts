import { safeJsonParse } from "./jsonUtil"

export interface XhrSourceOptions {
    url?: string
    method?: 'GET' | 'POST',
    headers?: Record<string, string>,
    timeout?: number
    body?: Document | XMLHttpRequestBodyInit | null
    withCredentials?: boolean
}
export function xhrSource(options: XhrSourceOptions = {}) {
    const {
        method = 'GET',
        url = '/',
        headers = {},
        timeout = 1000 * 60 * 2,
        body,
        withCredentials = false
    } = options

    const et = new EventTarget()
    const xhr = new XMLHttpRequest()

    if (withCredentials) {
        xhr.withCredentials = true
    }
    xhr.open(method, url)

    for (let key in headers) {
        xhr.setRequestHeader(key, headers[key])
    }

    let ongong = false
    let start = 0
    xhr.onprogress = () => {
        if (!ongong) {
            ongong = true
        }

        let i: number = 0
        let chunk: string = ''

        while ((i = xhr.responseText.indexOf('\n\n', start)) >= 0) {
            chunk = xhr.responseText.slice(start, i)
            start = i + 2
            if (chunk.length) {
                et.dispatchEvent(sseEvent(chunk))
            }
        }
    }
    xhr.onload = () => {
        et.dispatchEvent(new CloseEvent('close'))
    }
    xhr.timeout = timeout
    xhr.ontimeout = () => {
        et.dispatchEvent(new CloseEvent('error', { reason: 'Timeout' }))
    }
    xhr.onerror = () => {
        et.dispatchEvent(new CloseEvent('error', { reason: 'Error' }))
    }
    xhr.onabort = () => {
        et.dispatchEvent(new CloseEvent('error', { reason: 'Abort' }))
    }

    et.addEventListener('close', () => {
        xhr.abort()
    })

    xhr.send(body)

    const abort = () => {
        xhr.abort()
    }

    return {
        target: et,
        abort
    }
}

function sseEvent(message: string) {
    // 默认是 message 事件（不带前缀）
    let type: string = 'message'
    let start: number = 0

    // 可选 event 事件（”event: “为前缀）
    if (message.startsWith('event: ')) {
        start = message.indexOf('\n')
        type = message.slice(7, start)
    }

    start = message.indexOf(': ', start) + 2
    const data = message.slice(start, message.length)

    return new MessageEvent(type, { data: safeJsonParse(data) })
}