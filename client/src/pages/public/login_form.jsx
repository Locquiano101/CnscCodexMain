import { useState } from "react";
import { Eye, EyeOff, LogIn, User } from "lucide-react";
import axios from "axios";
import { API_ROUTER } from "../../App";

export default function Login({ navigate, onShowRegistration }) {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log({ email: username, password });
    try {
      const response = await axios.post(
        `${API_ROUTER}/login`,
        { email: username, password },
        { withCredentials: true }
      );

      console.log("response moto", response.data);

      const role = response.data.user.position;
      if (role === "student-leader") {
        navigate("/student-leader");
      } else if (role === "adviser" || role === "Adviser") {
        navigate("/adviser");
      } else if (role === "dean") {
        navigate("/dean");
      } else if (role === "ossd coordinator" || role === "ossd") {
        navigate("/OSSD-");
      } else if (role === "sdu-coordinator" || role === "sdu-coordinator") {
        navigate("/sdu-coordinator");
      } else if (role === "sdu" || role === "SDU") {
        navigate("/SDU");
      } else {
        navigate("/unauthorized");
      }
    } catch (err) {
      console.error("Login failed", err.response?.data || err.message);
      const msg =
        err.response?.data?.message || "Login failed. Please try again.";
      setErrorMsg(msg);
    }
  };

  return (
    <div className="min-h-fit w-3/4  flex flex-col gap-4 rounded-xl bg-gray-100 shadow-2xl border border-gray-100 px-10 py-12 relative overflow-hidden">
      {/* Subtle background decoration */}

      <form
        className="w-full flex flex-col gap-6 relative z-10"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-5">
          <div className="relative group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-50 text-gray-800 w-full px-5 py-4 text-base rounded-2xl border-2 border-gray-200 focus:border-cnsc-primary-color focus:bg-white focus:outline-none focus:ring-4 focus:ring-cnsc-primary-color/10 transition-all duration-300 group-hover:border-gray-300"
              required
            />
          </div>

          <div className="relative group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-50 text-gray-800 w-full px-5 py-4 pr-14 text-base rounded-2xl border-2 border-gray-200 focus:border-cnsc-primary-color focus:bg-white focus:outline-none focus:ring-4 focus:ring-cnsc-primary-color/10 transition-all duration-300 group-hover:border-gray-300"
              required
            />
            <div
              className="absolute right-4 top-12 flex justify-center items-center cursor-pointer text-gray-500 hover:text-cnsc-primary-color transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>
        </div>
        {/* Error Message */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-red-600 text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              {errorMsg}
            </p>
          </div>
        )}
        {/* Login Button */}
        <button
          type="submit"
          className="bg-cnsc-primary-color text-cnsc-white-color w-full px-6 py-4 text-lg font-semibold rounded-2xl border-2 border-cnsc-primary-color hover:bg-cnsc-secondary-color hover:border-cnsc-secondary-color hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 shadow-md"
        >
          <LogIn size={22} />
          Sign In
        </button>
      </form>

      {/* Divider and Register */}
      <div className="flex items-center justify-center w-full text-sm mt-4 relative z-10">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent mr-4"></div>

        <button
          onClick={onShowRegistration}
          className="text-cnsc-primary-color text-base font-semibold hover:text-cnsc-secondary-color transition-colors duration-300 relative group"
        >
          Don't have an account?{" "}
          <span className="underline decoration-2 underline-offset-4 decoration-cnsc-primary-color group-hover:decoration-cnsc-secondary-color">
            Register here
          </span>
        </button>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-500 to-transparent ml-4"></div>
      </div>
    </div>
  );
}
