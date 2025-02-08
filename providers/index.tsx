import {GraphQLClient} from "@refinedev/nestjs-query"
import { fetchWrapper } from "./data/fetch-wrapper"

export const API_URL = "http://api.crm.refine.dev"
export const client = new GraphQLClient(API_URL,{
    fetch: (url: string, options: RequestInit) => {
        try {
            return fetchWrapper(url, options)
        } catch (error) {
            return Promise.reject(error as Error)
        }
    }
})

// export const WS_URL = "ws://api.crm.refine.dev/graphql"