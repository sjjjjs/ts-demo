import { ref } from "vue"
import { useRequest } from "./useRequest"
import { useDifyApi } from "./useDifyApi";

interface UserRecentConversationListOptions {
    baseUrl: string
    apiKey?: string
    user?: string
    limit: number
    id?: string
}
export function useRecentConversationList(
    options: UserRecentConversationListOptions
) {

    const {
        baseUrl,
        apiKey,
        user,
        limit,
        id = ''
    } = options

    const difyApi = useDifyApi(
        baseUrl,
        apiKey,
        user
    )

    const current = ref(id)
    const {
        run: refresh,
        loading,
        data: list
    } = useRequest(async () => {
        const rsp = await difyApi.getConversations({
            limit
        })

        return rsp.data
    })

    async function remove(id: string) {
        const p = difyApi.deleteConversation({
            conversation_id: id
        })
        await p.then(refresh)
        return p
    }
    async function rename(id: string, name: string) {
        const p = difyApi.renameConversation({
            conversation_id: id,
            name
        })
        p.then(refresh)
        return p
    }
    function setCurrent(id: string): void {
        current.value = id
    }

    return {
        current,
        refresh,
        loading,
        list,
        remove,
        rename,
        setCurrent
    }
}