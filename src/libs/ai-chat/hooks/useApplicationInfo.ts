import { useDifyApi } from "./useDifyApi";
import { useRequest } from "./useRequest";

export function useApplicationInfo(
    options: {
        baseUrl: string,
        apiKey?: string,
        user?: string,

        requires?: ('info' | 'meta' | 'parameters')[]
    }
) {
    const {
        baseUrl,
        apiKey,
        user,
        requires = ['info', 'meta', 'parameters']
    } = options
    const difyApi = useDifyApi(baseUrl, apiKey, user)

    const infoRequest = useRequest(async () => {
        return difyApi.getInfo()
    }, { manul: true })
    const parametersRequest = useRequest(async () => {
        return difyApi.getParameters()
    }, { manul: true })
    const metaRequest = useRequest(async () => {
        return difyApi.getMetaInfo()
    }, { manul: true })

        ;[...new Set(requires)].forEach(i => {
            if (i === 'info') {
                infoRequest.run()
            } else if (i === 'meta') {
                metaRequest.run()
            } else if (i === 'parameters') {
                parametersRequest.run()
            }
        })

    return {
        info: infoRequest.data,
        infoLoading: infoRequest.loading,
        infoError: infoRequest.error,

        parameters: parametersRequest.data,
        parametersLoading: parametersRequest.loading,
        parametersError: parametersRequest.error,

        meta: metaRequest.data,
        metaLoading: metaRequest.loading,
        metaError: metaRequest.error,
    }
}