import { computed, nextTick, onMounted, onUnmounted, ref, type Ref } from "vue";

export function useAutoScrollBottom(
    divRef: Ref<HTMLDivElement>,
    threshold: number = 30
) {
    function scrollToBottom() {
        nextTick(() => {
            if (divRef.value) {
                const div = divRef.value
                div.scrollTop = div.scrollHeight
            }
        })
    }
    const enabled = ref<boolean>(true)
    function handleDivScroll() {
        calcScrollDistanceToBottom()

        if (divRef.value) {
            const div = divRef.value

            if (div.scrollHeight - div.scrollTop - div.clientHeight > threshold) {
                enabled.value = false
            } else {
                enabled.value = true
            }
        }
    }
    function adjust() {
        calcScrollDistanceToBottom()

        nextTick(() => {
            if (divRef.value) {
                const div = divRef.value

                if (enabled.value) {
                    div.scrollTop = div.scrollHeight
                }
            }
        })
    }
    function enable() {
        calcScrollDistanceToBottom()

        enabled.value = true
        adjust()
    }


    // scroll distance to bottom
    const scrollDistanceToBottom = ref(0)
    const isTotallyScrolled = computed(() => {
        scrollDistanceToBottom.value <= 1
    })
    function calcScrollDistanceToBottom() {
        if (divRef.value) {
            const div = divRef.value

            const scrollHeight = div.scrollHeight
            const scrollTop = div.scrollTop
            const clientHeight = div.clientHeight

            scrollDistanceToBottom.value = scrollHeight - scrollTop - clientHeight
        }
    }

    onMounted(() => {
        if (divRef.value) {
            const div = divRef.value
            div.addEventListener('scroll', handleDivScroll)
        }
    })
    onUnmounted(() => {
        if (divRef.value) {
            const div = divRef.value
            div.removeEventListener('scroll', handleDivScroll)
        }
    })

    return {
        // shows if auto scroll enabled
        enabled,
        enable,
        // scroll to bottom if auto scroll enabled
        adjust,
        // force scroll to bottom
        scrollToBottom,

        isTotallyScrolled,
        scrollDistanceToBottom
    }
}