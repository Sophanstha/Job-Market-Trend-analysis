import { useQuery } from "@tanstack/react-query"
import { querykey } from "../api/queryKey"
import { fetchAnalyticsFn } from "../api/queryFunctions"


export const useAnalytics =()=>{
    return useQuery({
        queryKey : querykey.analytics,
        queryFn : fetchAnalyticsFn,
        staleTime : 5*60*1000
    })
}