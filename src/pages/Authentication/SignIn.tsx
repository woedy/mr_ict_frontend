import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { baseUrl } from '../../constants';
import backCover from '../../images/cover/ges.jpg';
import Logo from '../../images/logo/coat.png';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fcm_token, setFcmtoken] = useState('sddfdsfdsfsdf');
  const navigate = useNavigate();

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    let isValid = true;

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (!isValid) {
      return;
    }

    const url = baseUrl + 'api/accounts/login-user/';
    const data = {
      email,
      password,
      fcm_token,
    };

    setLoading(true);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json(); // Parse response body as JSON

      if (response.status === 200) {
        // Login successful, store user data and token in local storage
        localStorage.setItem('username', responseData.data.username);
        localStorage.setItem('user_id', responseData.data.user_id);
        localStorage.setItem('email', responseData.data.email);

        localStorage.setItem('photo', responseData.data.photo);

        localStorage.setItem('token', responseData.data.token);

        // Redirect to dashboard or perform other actions
        console.log('Login successful');
        console.log(responseData.data.token);
        navigate('/all-projects');
        window.location.reload();
      } else if (response.status === 400) {
        setEmailError(
          responseData.errors.email ? responseData.errors.email[0] : '',
        );
        setPasswordError(
          responseData.errors.password ? responseData.errors.password[0] : '',
        );
      } else {
        // Login failed, display error message
        console.error('Login failed:', responseData.message);
      }
    } catch (error) {
      // Network or other errors
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: `url(${backCover})` }}
        ></div>

        <div className="relative z-10 flex justify-center items-center max-w-lg mx-auto px-6 py-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl">
          <div className="w-full max-w-md space-y-8">
            <div className="flex items-center gap-2">
              <img className="h-20" src={Logo} alt="Logo" />

              <div>
                <h4 className="mb-1 text-xl font-semibold text-black dark:text-white">
                  {'<Mr ICT />'}
                </h4>

                <p className="text-sm font-medium">
                  Ghana Education Service (GES)
                </p>
              </div>
            </div>

            <h1 className="text-4xl text-center font-extrabold text-gray-900 dark:text-white">
              Welcome Back!
            </h1>
            <p className="text-center text-lg text-gray-600 dark:text-gray-300 mb-6">
              Please sign in to your account to continue.
            </p>

            {emailError && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6"
                role="alert"
              >
                <strong className="font-bold">Error!</strong>
                <span>{emailError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full p-4 text-lg rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-2"
                >
                  Re-type Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6+ Characters, 1 Capital letter"
                  className="w-full p-4 text-lg rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-center">
                {loading ? (
                  <div className="flex items-center space-x-3">
                    <svg
                      className="animate-spin w-6 h-6 text-indigo-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-gray-200"
                      />
                      <path
                        d="M4 12a8 8 0 018-8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-indigo-500">Loading...</span>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full p-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 focus:outline-none transition"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </form>

            {/* Sign Up Link */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Don’t have an account?{' '}
                <Link
                  to="/signup"
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
