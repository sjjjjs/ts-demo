import express from 'express'
import logUpdate from 'log-update'

const app = express()
const port = 3000

let h1Count = 0
let h2Count = 0

function update() {
    const total = h1Count + h2Count
    const h1r = h1Count / total || 0
    const h2r = h2Count / total || 0
    const dr = (h1Count - h2Count) / h1Count * 100 || 0
    logUpdate(
        `
total    : ${String(h1Count + h2Count).padStart(10, ' ')}
h1       : ${String(h1Count).padStart(10, ' ')} (${h1r.toFixed(4).padStart(6, ' ')})
h2       : ${String(h2Count).padStart(10, ' ')} (${h2r.toFixed(4).padStart(6, ' ')})
diff_r   : ${dr.toFixed(4).padStart(10, ' ')}%
`
    )
}
function clear() {
    h1Count = 0
    h2Count = 0

    update()
}

function ramdonMS() {
    return Math.round(Math.random() * 100) + 50
}

app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Authorization,X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method')
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, PUT, DELETE')
    res.header('Allow', 'GET, POST, PATCH, OPTIONS, PUT, DELETE')
    next();
})

// app.use(express.text())
app.use(express.json({
    type: () => true
}))

app.get('/', (_req, res) => {
    res.json({
        code: 200,
        msg: 'OK',
        data: {
            h1Count,
            h2Count
        }
    })
})

app.post('/post-test-clear', (_req, res) => {
    res.on('finish', () => {
        clear()
    })
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.json({
        code: 200,
        msg: 'OK'
    })
})

app.post('/post-test', (req, res) => {
    const methodName = req.body.method
    res.on('finish', () => {
        if (methodName === 'h1') {
            h1Count += 1
        } else if (methodName === 'h2') {
            h2Count += 1
        } else {
            console.log('req.body', req.body)
        }
        update()
    })

    setTimeout(() => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.json({
            code: 200,
            msg: 'OK'
        })
    }, ramdonMS())
})

app.listen(port, () => {
    update()
})
