import { nextTick, onMounted, onUnmounted, ref, type Ref } from "vue";

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
    const enabled = ref<boolean>(false)
    function handleDivScroll() {
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
        nextTick(() => {
            if (divRef.value) {
                const div = divRef.value

                if (enabled.value) {
                    div.scrollTop = div.scrollHeight
                }
            }
        })
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
        // scroll to bottom if auto scroll enabled
        adjust,
        // force scroll to bottom
        scrollToBottom
    }
}