import { ref } from "vue";
import { useDifyApi } from "./useDifyApi";
import { useRequest } from "./useRequest";

export function useConversationList(options: {
    baseUrl: string,
    apiKey?: string,
    user?: string,
    limit?: number
}) {
    const { baseUrl, apiKey, user } = options
    const difyApi = useDifyApi(baseUrl, apiKey, user)

    const list = ref<{
        id: string
        name: string
        inputs: {}
        status: string
        introduction: string
        created_at: number
        updated_at: number
    }[]>([])
    const lastId = ref<string | undefined>()
    const limit = ref<number | undefined>(options.limit)
    const hasMore = ref(true)

    const {
        run: fetchConversationList,
        loading
    } = useRequest(async () => {
        const rsp = await difyApi.getConversations({
            last_id: lastId.value,
            limit: limit.value
        })

        if (!rsp.has_more) {
            hasMore.value = false
        }

        list.value = [...rsp.data]
    })

    async function deleteConversation(id: string) {
        return difyApi.deleteConversation({
            conversation_id: id
        }).finally(() => {
            console.log('update fater delete conversation')
            fetchConversationList()
        })
    }
    async function renameConversation(id: string, name: string) {
        return difyApi.renameConversation({
            conversation_id: id,
            name
        }).finally(() => {
            fetchConversationList()
        })
    }

    function reload() {
        // list.value = []
        lastId.value = undefined
        hasMore.value = true

        fetchConversationList()
    }
    function loadMore() {
        if (!hasMore.value) {
            return
        }
        lastId.value = list.value?.[list.value?.length - 1]?.id || undefined
        fetchConversationList()
    }

    return {
        loading,
        hasMore,
        limit,
        conversationList: list,
        deleteConversation,
        renameConversation,
        reload,
        loadMore
    }
}