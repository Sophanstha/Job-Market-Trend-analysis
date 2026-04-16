import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hook"
import { useMutation } from "@tanstack/react-query";
import { searchJobFn } from "../api/queryFunctions";
import { searchQuery, setSearchResult } from "../store/slices/SearchSlice";

export const UseSearch =()=>{
    const dispatch =useAppDispatch();
    const naviagete = useNavigate()

    const mutation = useMutation({
        mutationFn : (query:string)=>searchJobFn(query),
        onSuccess : (data , query)=>{
        dispatch(searchQuery(query))
        dispatch(setSearchResult(data))
         naviagete("/results")
        }
    })
    // console.log(mutation)
    const search = (query:string)=>{
           if (!query.trim()) return;
    mutation.mutate(query.trim());
    }
    return {
        search ,
        loading : mutation.isPending,
        error : mutation.error?.message ?? null
    }
}