import { createWebHistory, createRouter } from 'vue-router'

function resolveRoutes() {
    const matches = import.meta.glob('../pages/**/*.vue')
    return Object.entries(matches).map(([key, value]) => {
        const name = /\.\.\/pages(\/.+)\.vue$/.exec(key)?.[1] || ''
        if (!name) throw new Error('Invalid route name')
        const path = name.replace(/index$/, '')
        return {
            path,
            component: value
        }
    })
}

const router = createRouter({
    history: createWebHistory(),
    routes: resolveRoutes(),
})

export default router
