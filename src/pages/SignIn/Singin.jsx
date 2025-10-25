import { useState } from "react";
import logo from "../../Images/SVG 1 1.png"
import loginImage from "../../Images/college entrance exam-pana 1 (1).png"
import axios from "../../axios";
const Signin = () => {

  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")

 const handleLogin= (e)=>{
  e.preventDefault();
  axios
    .post("/adminLogin", { email, password })
    .then((response) => {

      console.log(response)
      localStorage.setItem("token", response.data.accessToken);
      
      // toast.success("Login successfull");
   if( response.data){
    const homeUrl = `/dash`;

    window.location.replace(homeUrl);
    console.log("bbbbbbbbbbbbbb")
   }
  
    })
    .catch(function (error) {
    console.log(error)
    });
 }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-teal-600">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
          {/* Left Side - Image */}
          <div className="hidden lg:flex lg:w-1/2 justify-center">
            <div className="relative">
              <img 
                src={loginImage} 
                alt="Login Illustration" 
                className="w-full max-w-md h-auto drop-shadow-lg"
              />
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full lg:w-1/2">
            {/* Simple and Sweet Container */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              
              {/* Logo */}
              <div className="text-center mb-8">
                <img src={logo} alt="Logo" className="w-32 mx-auto" />
              </div>

              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-teal-800 mb-2">
                  Admin Login
                </h1>
                <p className="text-teal-600 text-sm">
                  Secure access to your dashboard
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Field */}
                <div className="relative">
                  <label className="block text-sm font-medium text-teal-700 mb-2">
                    Email
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-teal-50"
                    name="email"
                    placeholder="User Id"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="relative">
                  <label className="block text-sm font-medium text-teal-700 mb-2">
                    Password
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-teal-50"
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Login Button */}
                <div className="pt-4">
                  <button
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 text-lg shadow-lg hover:shadow-xl"
                    type="submit"
                  >
                    Login
                  </button>
                </div>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-teal-500 text-xs">
                  Secure login powered by Sai Finance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
