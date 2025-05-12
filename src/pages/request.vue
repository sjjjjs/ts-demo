<template>
    <div class=" max-w-6xl mx-auto p-4">
        <h3>http1.1/http2 同页面压力测试</h3>
        <p>
            <co-text>同时通过两种协议发起 N 个 POST 请求（N 大于浏览器最大负载，约 1600），对比两种协议服务端成功接收数量</co-text>
        </p>

        <div class="content mt-4">
            <el-row :gutter="24">
                <el-col :span="3">单次配置</el-col>
                <el-col :span="6">
                    <el-input :readonly="running" v-model="payloadSize" type="number" placeholder="请输入数据大小(kb)">
                        <template #prepend>请求 body 大小</template>
                        <template #append>kb</template>
                    </el-input>
                </el-col>
                <el-col :span="6">
                    <el-input :readonly="running" v-model="maxReuqestCount" type="number" placeholder="请输入请求次数">
                        <template #prepend>每次发起</template>
                        <template #append>个请求</template>
                    </el-input>
                </el-col>
                <el-col :span="6">
                    <el-button :loading="running" type="primary" @click="run">开始</el-button>
                </el-col>
            </el-row>
            <el-row :gutter="24" class="mt-2">
                <el-col :span="3">循环配置</el-col>
                <el-col :span="6">
                    <el-input :readonly="running" v-model="batch" type="number" placeholder="请输入重复轮数">
                        <template #prepend>循环</template>
                        <template #append>轮</template>
                    </el-input>
                </el-col>
                <el-col :span="6">
                    <el-input :readonly="running" v-model="time" type="number" placeholder="请输入时间间隔">
                        <template #prepend>间隔</template>
                        <template #append>毫秒</template>
                    </el-input>
                </el-col>
                <el-col :span="6">
                    <el-button :loading="running" type="primary" @click="runLoop">开始</el-button>
                    <el-button :loading="running" type="warning" @click="reset">清除</el-button>
                </el-col>
            </el-row>
        </div>

    </div>
    <div class="p-4 mx-auto max-w-7xl">
        <div class="content mt-4">
            <el-row :gutter="24">
                <el-col :span="6">
                    <el-statistic title="发起" :value="launchRequestCount" />
                </el-col>
                <el-col :span="6">
                    <el-statistic title="用时" :value="duration / 1000" :precision="2">
                        <template #suffix>秒</template>
                    </el-statistic>
                </el-col>
            </el-row>
        </div>
    </div>
    <div class="p-4 mx-auto max-w-7xl">
        <div class="content mt-4">
            <el-row :gutter="24">
                <el-col :span="6">
                    <el-statistic title="h1 成功" :value="h1SuccessCount" />
                </el-col>
                <el-col :span="6">
                    <el-statistic title="h1 失败" :value="h1FailedCount" />
                </el-col>
                <el-col :span="6">
                    <el-statistic title="h1 未失败" :value="launchRequestCount - h1FailedCount" />
                </el-col>
            </el-row>
        </div>
    </div>
    <div class="p-4 mx-auto max-w-7xl">
        <div class="content mt-4">
            <el-row :gutter="24">
                <el-col :span="6">
                    <el-statistic title="h2 成功" :value="h2SuccessCount" />
                </el-col>
                <el-col :span="6">
                    <el-statistic title="h2 失败" :value="h2FailedCount" />
                </el-col>
                <el-col :span="6">
                    <el-statistic title="h2 未失败" :value="launchRequestCount - h2FailedCount" />
                </el-col>
            </el-row>
        </div>
    </div>
    <div class="p-4 mx-auto max-w-7xl">
        <div class="content mt-4">
            <el-row :gutter="24">
                <el-col :span="6">
                    <el-statistic title="已成功差值" :value="h1SuccessCount - h2SuccessCount" />
                </el-col>
                <el-col :span="6">
                    <el-statistic title="已成功比例" :value="(h1SuccessCount - h2SuccessCount) / h1SuccessCount * 100 || 0"
                        :precision="2">
                        <template #suffix>%</template>
                    </el-statistic>
                </el-col>
                <el-col :span="6">
                    <el-statistic title="未失败差值"
                        :value="(launchRequestCount - h1FailedCount) - (launchRequestCount - h2FailedCount)" />
                </el-col>
                <el-col :span="6">
                    <el-statistic title="未失败比例"
                        :value="((launchRequestCount - h1FailedCount) - (launchRequestCount - h2FailedCount)) / (launchRequestCount - h1FailedCount) * 100 || 0"
                        :precision="2">
                        <template #suffix>%</template>
                    </el-statistic>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { LoopExec } from './request';

const startTime = ref(0)
const lastTime = ref(0)
const duration = ref(0)

const maxReuqestCount = ref(1000)
const payloadSize = ref(3)
const running = ref(false)

const batch = ref(30)
const time = ref(1000)

const h1IdMap = new Map<string, string>()
const h2IdMap = new Map<string, string>()

    ; (window as any).h1IdMap = h1IdMap
    ; (window as any).h2IdMap = h2IdMap


const h1server = 'https://localhost1:444/post-test' // h1
// const h2server = 'https://localhost2:443/post-test' // h2
const h2server = 'https://localhost2:445/post-test' // h1

const launchRequestCount = ref(0)

function requestCallback() {
    const now = Date.now()
    lastTime.value = now
    duration.value = now - startTime.value
}

const logs = ref<string[]>([])

type XhrCb = (success: boolean) => void
function xhrPostSend(url: string, data: string, cb: XhrCb) {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            cb(true)
        } else {
            cb(false)
        }

        requestCallback()
    }
    xhr.onerror = function (_err) {
        cb(false)
        requestCallback()
    }
    xhr.send(data)
}

const h1SucessIds: string[] = []
    ; (window as any).h1SucessIds = h1SucessIds
const h1FailedIds: string[] = []
    ; (window as any).h1FailedIds = h1FailedIds

const h1SuccessCount = ref(0)
const h1FailedCount = ref(0)
function h1Send(id: string, payload: string) {
    const data = JSON.stringify({
        method: 'h1',
        id,
        payload
    })
    xhrPostSend(
        h1server,
        data,
        bool => {
            if (h1IdMap.has(id)) {
                const res = h1IdMap.get(id)
                logs.value.push(`${id}: ${res} -> ${bool ? 'sucess' : 'failed'}`)
            }
            if (bool) {
                h1SuccessCount.value += 1
                h1IdMap.set(id, 'success')
                h1SucessIds.push(id)
            } else {
                h1FailedCount.value += 1
                h1IdMap.set(id, 'failed')
                h1FailedIds.push(id)
            }
        }
    )
}

const h2SuccessCount = ref(0)
const h2FailedCount = ref(0)
function h2Send(id: string, payload: string) {
    const data = JSON.stringify({
        method: 'h2',
        id,
        payload: payload
    })
    xhrPostSend(
        h2server,
        data,
        bool => {
            if (bool) {
                h2SuccessCount.value += 1
                h2IdMap.set(id, 'success')
            } else {
                h2FailedCount.value += 1
                h2IdMap.set(id, 'failed')
            }
        }
    )
}

async function runLoop() {
    running.value = true
    startTime.value = Date.now()
    const le = LoopExec.create(
        batch.value,
        time.value,
        () => {
            run()
        },
        () => {
            running.value = false
        }
    )
    le.start()
}
function run() {
    running.value = true
    const payload = 'a'.repeat(1024 * payloadSize.value)
    for (let i = 0; i < maxReuqestCount.value; i++) {
        const id = uuidv4()

        h1Send(id, payload)
        h2Send(id, payload)

        launchRequestCount.value += 1
    }
    running.value = false
}
function reset() {
    launchRequestCount.value = 0
    h1SuccessCount.value = 0
    h1FailedCount.value = 0
    h2SuccessCount.value = 0
    h2FailedCount.value = 0

    fetch('http://localhost:3000/post-test-clear', { method: 'POST' })

    lastTime.value = 0
    duration.value = 0
    startTime.value = 0
}
</script>