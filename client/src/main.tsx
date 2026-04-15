import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { store } from './store/index.ts'

const queryClient = new QueryClient({
  defaultOptions : {
    queries:{
      retry : 1,
      refetchOnWindowFocus : false
  }
  }
})

createRoot(document.getElementById('root')!).render(
 <Provider store={store}>
<QueryClientProvider client={queryClient}>
  <App/>
</QueryClientProvider>
 </Provider>
)
