import { useState, useEffect } from "react";
import { CircleAlert, Eye, EyeOff, LogIn } from "lucide-react";
import axios from "axios";
import { API_ROUTER } from "../../App";

export function RegistrationForm({ onShowRegistration, onBackToLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [currentPhase, setCurrentPhase] = useState(1); // 1: Form, 2: Verification
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentPhase === 1) {
      // Phase 1: Initial registration form
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match");
        return;
      }

      if (password.length < 6) {
        setErrorMsg("Password must be at least 6 characters long");
        return;
      }

      // Start loading and send OTP
      setIsLoading(true);
      setErrorMsg("");

      try {
        await SendOtp({ email });
        // If we reach here, OTP was sent successfully
        setCurrentPhase(2);
        setOtpSent(true);
        setCountdown(60); // 60 second countdown
      } catch (error) {
        // Handle different error scenarios
        if (
          error.response &&
          error.response.status === 400 &&
          error.response.data?.message ===
            "Email already exists. Please use a different email."
        ) {
          setErrorMsg("Email already exists. Please use a different email.");
        } else {
          setErrorMsg("Failed to send OTP. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // Phase 2: OTP verification
      if (!code.trim()) {
        setErrorMsg("Please enter the OTP code");
        return;
      }

      if (code.length !== 6) {
        setErrorMsg("OTP must be 6 digits");
        return;
      }

      setIsLoading(true);
      setErrorMsg("");

      try {
        // Complete registration
        await handleRegistration(email, password, code);

        setRegistrationSuccess(true);

        // Redirect back to login after 2 seconds
        setTimeout(() => {
          if (onShowRegistration) {
            onShowRegistration(false); // Hides the registration form
          }
        }, 2000);
      } catch (error) {
        setErrorMsg("Invalid OTP code. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    setCurrentPhase(1);
    setErrorMsg("");
    setCode("");
    setOtpSent(false);
  };

  const resendOtp = async () => {
    if (countdown === 0 && !isLoading) {
      setIsLoading(true);
      setErrorMsg("");

      try {
        await SendOtp({ email });
        setCountdown(60); // Reset countdown
        setErrorMsg("");
      } catch (error) {
        setErrorMsg("Failed to resend OTP. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Success state
  if (registrationSuccess) {
    return (
      <div className="min-h-fit w-3/4  flex flex-col gap-4 rounded-xl bg-gray-100 shadow-2xl border border-gray-100 px-10 py-12 relative overflow-hidden">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-green-600 mb-3 animate-pulse">
            Registration Successful!
          </h2>
          <p className="text-gray-600 mb-6 text-lg">
            Your account has been created successfully.
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-cnsc-primary-color rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-cnsc-primary-color rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-cnsc-primary-color rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 rounded-xl bg-gray-100 shadow-2xl border border-gray-100 px-16  py-12 relative overflow-hidden">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-20 transition-all duration-300">
          <div className="text-center transform scale-110">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 mx-auto mb-6"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-cnsc-primary-color border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            </div>
            <p className="text-cnsc-primary-color font-semibold text-lg">
              {currentPhase === 1
                ? "Sending verification code..."
                : "Verifying code..."}
            </p>
            <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
          </div>
        </div>
      )}

      {/* Enhanced Phase Indicator */}
      <div className="">
        <div className="flex justify-center">
          <div className="flex items-center space-x-6">
            <div
              className={`flex items-center space-x-3 transition-all duration-500 ${
                currentPhase >= 1
                  ? "text-cnsc-primary-color scale-105"
                  : "text-gray-400"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 shadow-md ${
                  currentPhase >= 1
                    ? "bg-cnsc-primary-color text-white shadow-lg transform scale-110"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                1
              </div>
              <span className="text-sm font-semibold">Account Details</span>
            </div>
            <div
              className={`w-12 h-1 rounded-full transition-all duration-500 ${
                currentPhase >= 2
                  ? "bg-cnsc-primary-color shadow-md"
                  : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`flex items-center space-x-3 transition-all duration-500 ${
                currentPhase >= 2
                  ? "text-cnsc-primary-color scale-105"
                  : "text-gray-400"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 shadow-md ${
                  currentPhase >= 2
                    ? "bg-cnsc-primary-color text-white shadow-lg transform scale-110"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
              <span className="text-sm font-semibold">Email Verification</span>
            </div>
          </div>
        </div>
      </div>

      {currentPhase === 1 && (
        <div className=" flextransform transition-all duration-500">
          <div className="text-center mb-8 ">
            <h2 className="text-3xl font-bold text-cnsc-primary-color ">
              Create Your Account
            </h2>
            <p className="text-gray-600">Join us and get started today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="group ">
              <label className="block text-sm ml-2 font-semibold mb-2 text-gray-700  transition-colors group-focus-within:text-cnsc-primary-color">
                Organizational Email Address
              </label>
              <input
                type="email"
                placeholder="your.email@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white text-black w-full px-5 py-4 text-base border border-gray-500 rounded-xl focus:border-cnsc-primary-color focus:outline-none transition-all duration-300 focus:shadow-lg focus:scale-105 hover:border-gray-300"
                required
              />
              <p className="text-sm ml-3 mt-2 text-red-400  flex items-center">
                <CircleAlert size={16} className="mr-1 " />
                Organizational email is recommended
              </p>
            </div>

            <div className="relative group">
              <label className="block text-sm font-semibold text-gray-700 ml-4 transition-colors group-focus-within:text-cnsc-primary-color">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white text-black w-full px-5 py-4 pr-14 rounded-2xl border-2 border-gray-200 focus:border-cnsc-primary-color focus:outline-none transition-all duration-300 focus:shadow-lg focus:scale-105 hover:border-gray-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-11 transform cursor-pointer text-gray-400 hover:text-cnsc-primary-color transition-all duration-300 hover:scale-110"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="relative group">
              <label className="block text-sm font-semibold text-gray-700 ml-4 transition-colors group-focus-within:text-cnsc-primary-color">
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-white text-black w-full px-5 py-4 pr-14 rounded-2xl border-2 border-gray-200 focus:border-cnsc-primary-color focus:outline-none transition-all duration-300 focus:shadow-lg focus:scale-105 hover:border-gray-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-4 top-11 transform cursor-pointer text-gray-400 hover:text-cnsc-primary-color transition-all duration-300 hover:scale-110"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg transform transition-all duration-300">
                <div className="flex">
                  <svg
                    className="w-5 h-5 text-red-400 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-red-700 text-sm font-medium">{errorMsg}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="bg-cnsc-primary-color text-white w-full py-4 mt-4 text-lg font-semibold rounded-2xl hover:bg-cnsc-secondary-color hover:text-black transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:hover:bg-cnsc-primary-color disabled:hover:text-white focus:outline-none focus:ring-4 focus:ring-cnsc-primary-color focus:ring-opacity-20"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending Code...</span>
                </div>
              ) : (
                "Continue to Verification"
              )}
            </button>

            <div className="relative ">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className=" px-6 py-2 text-cnsc-primary-color hover:text-cnsc-secondary-color font-semibold transition-all duration-300 hover:scale-105 underline decoration-2 underline-offset-4 hover:decoration-cnsc-secondary-color"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {currentPhase === 2 && (
        <div className="px-8 py-8 transform transition-all duration-500">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-cnsc-primary-color bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-cnsc-primary-color"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-cnsc-primary-color mb-3">
              Check Your Email
            </h2>
            <p className="text-gray-600 text-lg mb-2">
              We've sent a 6-digit verification code to
            </p>
            <p className="text-cnsc-primary-color font-semibold text-lg bg-gray-50 px-4 py-2 rounded-lg inline-block">
              {email}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                Enter 6-digit verification code
              </label>
              <input
                type="text"
                placeholder="• • • • • •"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="bg-gray-50 text-black w-full px-6 py-6 text-center text-3xl font-mono rounded-2xl border-2 border-gray-200 focus:border-cnsc-primary-color focus:outline-none transition-all duration-300 tracking-widest focus:shadow-xl focus:bg-white transform focus:scale-105"
                maxLength={6}
                autoComplete="one-time-code"
              />

              <div className="text-center mt-4">
                {countdown > 0 ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      className="w-4 h-4 text-gray-400 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <p className="text-gray-500 text-sm font-medium">
                      Resend code in {countdown}s
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={resendOtp}
                    disabled={isLoading}
                    className="text-cnsc-primary-color hover:text-cnsc-secondary-color text-sm font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 underline decoration-2 underline-offset-4 hover:decoration-cnsc-secondary-color"
                  >
                    {isLoading ? "Sending..." : "Resend verification code"}
                  </button>
                )}
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg transform transition-all duration-300">
                <div className="flex">
                  <svg
                    className="w-5 h-5 text-red-400 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-red-700 text-sm font-medium">{errorMsg}</p>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleBack}
                disabled={isLoading}
                className="flex-1 bg-gray-100 text-gray-700 py-4 text-lg font-semibold rounded-2xl hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none border-2 border-gray-200 hover:border-gray-300"
              >
                Back to Details
              </button>
              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="flex-1 bg-cnsc-primary-color text-white py-4 text-lg font-semibold rounded-2xl hover:bg-cnsc-secondary-color hover:text-black transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:hover:bg-cnsc-primary-color disabled:hover:text-white focus:outline-none focus:ring-4 focus:ring-cnsc-primary-color focus:ring-opacity-20"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  "Complete Registration"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const handleRegistration = async (email, password, code) => {
  console.log(email, password, code);
  try {
    const response = await axios.post(`${API_ROUTER}/confirmVerification`, {
      email,
      position: "student-leader",
      password,
      code,
    });

    // Proceed to registration form or next step
    console.log("OTP confirmed successfully:", response.data);
  } catch (err) {
    console.error("OTP confirmation failed", err.response?.data || err.message);
  }
};

const SendOtp = async ({ email }) => {
  console.log(email);
  try {
    const response = await axios.post(`${API_ROUTER}/sendVerification`, {
      email,
    });
    console.log("OTP sent response:", response.data);
    return response.data; // Return the response for success handling
  } catch (err) {
    console.error("OTP sending failed", err.response?.data || err.message);
    throw err; // Re-throw the error so it can be caught in the component
  }
};
