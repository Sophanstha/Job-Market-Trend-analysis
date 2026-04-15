export const querykey = {
    analytics: ["analytics"] as const,
    history : ["history"] as const,
    search : (query:string)=>["search",query] as const,
    compare : (a:string , b:string)=>["compare",a,b] as const
}