import Footer from "../components/Footer";
import Header from "../components/Header";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const LogIn = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // http://localhost:4000/api/login
    try {
      const response = await axios.post("http://localhost:4000/api/login", { email, password });
      if(response.data.success === true) {
        localStorage.setItem("loggedIn", "true");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  }
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="grow bg-gray-300 flex items-center justify-center px-4">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h1 className="text-slate-900 text-center text-3xl font-semibold">
            Log in
          </h1>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            {/* EMAIL */}
            <div>
              <label className="text-slate-900 text-sm font-medium mb-2 block">
                User Email
              </label>
              <input
                type="email"
                required
                className="w-full text-slate-900 text-sm border border-slate-300 px-4 py-3 rounded-md outline-slate-800"
                placeholder="Enter user email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                name="email"
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <label className="text-slate-900 text-sm font-medium mb-2 block">
                Password
              </label>
              <input type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required className="w-full text-slate-900 text-sm border border-slate-300 px-4 py-3 rounded-md outline-slate-800 pr-10"
                placeholder="Enter password"
                name="password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  // Eye-off SVG
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-9a9.96 9.96 0 013.327-7.406m3.548 3.548a3 3 0 104.242 4.242M6.338 6.338l11.324 11.324" />
                  </svg>
                ) : (
                  // Eye SVG
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>


            {/* OPTIONS */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 text-slate-900">
                  Remember me
                </label>
              </div>

              <Link to="/forgot-password" className="text-blue-600 hover:underline font-semibold">
                Forgot password?
              </Link>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="w-full py-2.5 text-[15px] font-medium rounded-md text-white bg-[#121e31] hover:bg-blue-700 transition"
            >
              Log in
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LogIn;
