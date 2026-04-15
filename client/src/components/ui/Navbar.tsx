import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { UseSearch } from "../../hooks/useSearch";
import { Link, useNavigate } from "react-router-dom";
import { FiLogOut, FiMenu, FiSearch, FiUser, FiX } from "react-icons/fi";
import { logout } from "../../store/slices/AuthSlice";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const { User } = useAppSelector((v) => v.auth);
  const { loading, search } = UseSearch();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [menu, setmenu] = useState(false);

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Compare", to: "/compare" },
    { label: "Analytics", to: "/analytics" },
    { label: "History", to: "/history" },
  ];

  const handleSearch=(e:React.FormEvent)=>{
    e.preventDefault()
    if(!query.trim()) return
    search(query.trim())
    setQuery("")
    setmenu(false)
  }

  const handlelogout=()=>{
    dispatch(logout())
    navigate("/login")
  }

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "var(--color-surface)",
        borderBottom: "1px solid rgba(70, 69, 84, 0.2)",
      }}
    >
      <nav className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        {/* logo */}
        <Link
          to="/"
          className="headline text-xl font-bold flex-shrink-0"
          style={{ color: "var(--color-on-surface)" }}
        >
          Trend<span style={{ color: "var(--color-primary)" }}>Architect</span>
        </Link>

        {/* desktop link */}
        <div className="hidden md:flex items-center gap-8">
      {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: "var(--color-on-surface-variant)" }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "var(--color-primary)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color =
                  "var(--color-on-surface-variant)")
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
        {/* Desktop search */}
       <form
       onSubmit={handleSearch}
       className="hidden lg:flex flex-1 relative items-center max-w-xs"
       >
         <FiSearch
            size={14}
            className="absolute left-3"
            style={{ color: "var(--color-on-surface-variant)" }}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any career..."
            disabled={loading}
            className="w-full text-sm pl-9 pr-4 py-2 rounded-lg outline-none transition-all"
            style={{
              background: "var(--color-surface-container-lowest)",
              color:      "var(--color-on-surface)",
            }}
          />
       </form>
{/* Disktop auth */}
{
  <div
  className="hidden md:flex items-center gap-3"
  >
    {
      User ? (
          <div className="flex items-center gap-4">
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                <FiUser size={14} />
                <span>
                  Hi,{" "}
                  <span
                    className="font-medium"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    {User.name.split(" ")[0]}
                  </span>
                </span>
              </div>
              <button
                onClick={handlelogout}
                className="flex items-center gap-1.5 text-sm transition-colors"
                style={{ color: "var(--color-on-surface-variant)" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "var(--color-error)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "var(--color-on-surface-variant)")
                }
              >
                <FiLogOut size={14} />
                Logout
              </button>
            </div>
      ) :(
                    <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm transition-colors"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95 hero-gradient"
                style={{ color: "var(--color-on-primary-fixed)" }}
              >
                Register
              </Link>
            </div>
      )
    }
  </div>
  
}
  {/* mobile toogle */}
    <button 
    onClick={()=>setmenu(!menu)}
    className="md:hidden p-1 transition-colors"
    style={{ color: "var(--color-on-surface)" }}
    >
      {menu ? <FiX size={22} /> : <FiMenu size={22} />}
    </button>
      </nav>
      {/* mobile menu */}
      {
        menu && (
          <div
          className="md:hidden px-6 py-4 space-y-4"
             style={{
            background: "var(--color-surface-container-low)",
            borderTop:  "1px solid rgba(70, 69, 84, 0.2)",
          }}
          >
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="relative flex items-center">
            <FiSearch
              size={14}
              className="absolute left-3"
              style={{ color: "var(--color-on-surface-variant)" }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any career..."
              className="w-full text-sm pl-9 pr-4 py-2.5 rounded-lg outline-none"
              style={{
                background: "var(--color-surface-container-lowest)",
                color:      "var(--color-on-surface)",
              }}
            />
          </form>
{/* mobile menu */}
     {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setmenu(false)}
              className="block text-sm py-1"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-3 flex gap-3"
            style={{ borderTop: "1px solid rgba(70, 69, 84, 0.2)" }}
          >
             {User ? (
              <>
                <span
                  className="flex-1 text-sm flex items-center gap-2"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  <FiUser size={13} />
                  {User?.name.split(" ")[0]}
                </span>
                <button
                  onClick={handlelogout}
                  className="flex items-center gap-1.5 text-sm font-medium"
                  style={{ color: "var(--color-error)" }}
                >
                  <FiLogOut size={13} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setmenu(false)}
                  className="flex-1 text-center text-sm py-2 rounded-lg"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setmenu(false)}
                  className="flex-1 text-center text-sm py-2 rounded-lg font-bold hero-gradient"
                  style={{ color: "var(--color-on-primary-fixed)" }}
                >
                  Register
                </Link>
              </>
            )}

          </div>


          </div>
        )
      }
    </header>
  );
};

export default Navbar;
