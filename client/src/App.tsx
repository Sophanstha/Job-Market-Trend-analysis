import React from 'react'
import { useAppSelector } from './store/hook'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Footer from './components/ui/Footer'
import Navbar from './components/ui/Navbar'
import Home from './components/pages/Home'

const PrivateRoute = ({children}:{children:React.ReactNode})=>{
  const {token} = useAppSelector((s)=>s.auth)
 return token ? <>{children}</> : <Navigate to={"/login"} replace/>
  
}

const Placeholder = ({ name }: { name: string }) => (
  <div className="flex items-center justify-center h-96">
    <p
      className="label-precision text-lg"
      style={{ color: "var(--color-on-surface-variant)" }}
    >
      {name} — building next...
    </p>
  </div>
);


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
            <Route path="/results"   element={<Placeholder name="Search Results" />} />
            <Route path="/compare"   element={<Placeholder name="Compare" />} />
            <Route path="/analytics" element={<Placeholder name="Analytics" />} />
            <Route path="/login"     element={<Placeholder name="Login" />} />
            <Route path="/register"  element={<Placeholder name="Register" />} />
            <Route
              path="/history"
              element={
                <PrivateRoute>
                  <Placeholder name="History" />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App