import React from 'react'
import { useAppSelector } from './store/hook'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Footer from './components/ui/Footer'
import Navbar from './components/ui/Navbar'
import Home from './components/pages/Home'
import SearchResults from './components/pages/SearchResults'
import Login from './components/pages/Login'
import Regiter from './components/pages/Regiter'
import Compare from './components/pages/Compare'
import Analytics from './components/pages/Analytics'
import History from './components/pages/History'
import Resume from './components/pages/Resume'
import Admin from './components/pages/Admin'
import InterviewPrep from './components/pages/InterviewPrep'
import Roadmap from './components/pages/Roadmap'

const PrivateRoute = ({children}:{children:React.ReactNode})=>{
  const {token} = useAppSelector((s)=>s.auth)
 return token ? <>{children}</> : <Navigate to={"/login"} replace/>
  
}

const App = () => {
  return (
     <BrowserRouter>
      <div
        className="min-h-screen flex flex-col"
        style={{ background: "var(--color-background)" }}
      >
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/"          element={<Home/>}/>
            <Route path="/results"   element={<SearchResults/>} />
            <Route path="/compare"   element={<Compare/>}/>
            <Route path="/analytics" element={<Analytics/>} />
            <Route path="/login"     element={<Login/>} />
            <Route path="/register"  element={<Regiter/>} />
            <Route path="/admin"  element={<Admin/>} />
            <Route path="/interview-prep" element={<InterviewPrep />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route
              path="/history"
              element={
                <PrivateRoute>
                  <History/>
                </PrivateRoute>
              }
            />
          <Route path='/resume' element={<Resume/>}/>
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App