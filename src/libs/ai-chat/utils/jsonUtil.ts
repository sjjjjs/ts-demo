
export function safeJsonParse(val: any): any {
    try {
        return JSON.parse(val)
    } catch {
        return null
    }
}

export function safeJsonStringify(val: any): string {
    try {
        return JSON.stringify(val)
    } catch {
        return ''
    }
}