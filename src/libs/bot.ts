
interface RequestBody {
    inputs: Record<string, any>
    response_mode: 'streaming' | 'bloking'
    user: string
    files: {
        type: 'image',
        transfer_method: 'remote_url' | 'local_file'
        url: string
        upload_file_id: string
    }[]
}
interface ChatCompletionResponse {
    message_id: string
    mode: 'chat'
    answer: string
    metadata: {
        usage: unknown
        retriever_resources: unknown[]
    },
    create_at: number
}
interface ChunkChatCompletionResponse {

}
export class CompletionMessages {
    constructor(
        private apiKey: string,
        private responseMode: 'streaming' | 'blocking',
        private user: string,
    ) { }

    private getUrl() {
        return 'http://localhost/v1/completion-messages'
    }
    private getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        }
    }
    async sendMessage(query: string) {
        const data = {
            inputs: {
                default_input: query,
                A: 'MySQL'
            },
            response_mode: this.responseMode,
            user: this.user
        }

        const response = await fetch(this.getUrl(), {
            headers: this.getHeaders(),
            method: 'POST',
            body: JSON.stringify(data)
        }).then(res => res.json())

        console.log('response', response)
    }
}
const p = Promise.resolve()
function safeJsonParse(val: string): unknown {
    try {
        return JSON.parse(val)
    } catch (_err: any) {
        return null
    }
}
function sseevent(message: string) {
    let type = 'message', start = 0;
    if (message.startsWith('event: ')) {
        start = message.indexOf('\n');
        type = message.slice(7, start);
    }
    start = message.indexOf(': ', start) + 2;
    let data = message.slice(start, message.length);

    return new MessageEvent(type, { data: safeJsonParse(data) })
}
export function xhrSource(url: string, opts: {
    method: string
    headers: Record<string, string>
    timeout: number
    body: string
}) {
    const eventTarget = new EventTarget();
    const xhr = new XMLHttpRequest();

    xhr.open(opts.method || 'GET', url, true);
    for (let k in opts.headers) {
        xhr.setRequestHeader(k, opts.headers[k]);
    }

    let ongoing = false, start = 0;
    xhr.onprogress = function () {
        if (!ongoing) {
            // onloadstart is sync with `xhr.send`, listeners don't have a chance
            ongoing = true;
            eventTarget.dispatchEvent(new Event('open'));
        }

        let i, chunk;
        while ((i = xhr.responseText.indexOf('\n\n', start)) >= 0) {
            chunk = xhr.responseText.slice(start, i);
            start = i + 2;
            if (chunk.length) {
                eventTarget.dispatchEvent(sseevent(chunk));
            }
        }
    }

    xhr.onloadend = _ => {
        eventTarget.dispatchEvent(new CloseEvent('close'))
    }

    xhr.timeout = opts.timeout;
    xhr.ontimeout = _ => {
        eventTarget.dispatchEvent(new CloseEvent('error', { reason: 'Network request timed out' }));
    }
    xhr.onerror = _ => {
        eventTarget.dispatchEvent(new CloseEvent('error', { reason: xhr.responseText || 'Network request failed' }));
    }
    xhr.onabort = _ => {
        eventTarget.dispatchEvent(new CloseEvent('error', { reason: 'Network request aborted' }));
    }

    eventTarget.addEventListener('close', (_: any) => {
        xhr.abort();
    })

    xhr.send(opts.body);
    p.then(() => {
        eventTarget.dispatchEvent(new Event('send'));
    })
    return eventTarget;
}
export function sendMessageStream(apiKey: string, params: Record<string, unknown>, user: string) {
    return xhrSource(
        'http://localhost/v1/chat-messages',
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 100000,
            body: JSON.stringify({
                ...params,
                response_mode: 'streaming',
                user
            })
        }
    )
}
