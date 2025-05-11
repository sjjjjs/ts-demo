
export function delay(ms: number) {
    return new Promise(res => {
        setTimeout(res, ms)
    })
}

type AnyFunction = (...args: any[]) => any
type LoopExecCallback = (err: Error | null) => void
export class LoopExec {
    fn: AnyFunction = () => null
    cb: LoopExecCallback = (_err: any) => null
    static create(
        batch: number,
        time: number,
        fn?: AnyFunction,
        cb?: LoopExecCallback,
    ) {
        const le = new LoopExec(batch, time)
        if (fn) le.fn = fn
        if (cb) le.cb = cb
        return le
    }

    private index = 0
    constructor(
        private batch: number,
        private time: number
    ) { }

    async start() {
        this.fn()

        if (++this.index < this.batch) {
            await delay(this.time)
            this.start()
        } else {
            this.cb(null)
        }
    }
}