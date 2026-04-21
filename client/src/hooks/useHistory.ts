import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { querykey } from "../api/queryKey"
import { deleteHistoryfn, fetchHistoryFn } from "../api/queryFunctions"
// import { error } from "console"


export const useHistory =()=>{
    const queryClient = useQueryClient()

    const history = useQuery({
        queryKey : querykey.history,
        queryFn : fetchHistoryFn,
        staleTime : 0
    })

    const deletMutation = useMutation({
        mutationFn : deleteHistoryfn,
        onSuccess : ()=>queryClient.invalidateQueries({queryKey : querykey.history})
    })
    return{
        history : history.data ?? [],
        loading : history.isLoading,
        error : history.error?.message ?? null,
        deleteItem : (id:string)=>{ 
            // console.log(id)
            deletMutation.mutate(id)
        },
        deleteloading : deletMutation.isPending
    }
}