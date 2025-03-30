import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { baseUrl } from '../../constants';
import backCover from '../../images/cover/ges.jpg';
import Logo from '../../images/logo/coat.png';


const SignUp: React.FC = () => {
  const [username, setUsername] = useState('');

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  const [inputError, setInputError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    if (!validateEmail(email)) {
      setInputError('Invalid email address');
      return;
    }

    // Clear any previous error
    setInputError('');

    if (username === '') {
      setInputError('Username required.');
      return;
    }

 


    if (password === '') {
      setInputError('Passwords required.');
      return;
    }

    if (password2 === '') {
      setInputError('Password2 required.');
      return;
    }

    if (password !== password2) {
      setInputError('Passwords do not match');
      return;
    }

    if (!validatePassword(password)) {
      setInputError(
        'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character',
      );
      return;
    }

    // Create FormData object
    const formData = new FormData();
    formData.append('password', password);
    formData.append('password2', password2);
    formData.append('email', email);
    formData.append('username', username);

    // Make a POST request to the server
    const url = baseUrl + 'api/accounts/register-user/';

    try {
      setLoading(true);
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      // Log formData
      const formDataObject = {};
      formData.forEach((value, key) => {
        formDataObject[key] = value;
      });
      console.log('formData:', formDataObject);

      const data = await response.json();

      if (!response.ok) {
        console.log('############################33');
        console.log(data.errors);
        throw new Error(data.message);
      }

      // Registration successful
      console.log('User registered successfully');
      navigate('/verify-user'); // Navigate to success page
    } catch (error) {
      console.error('Error registering user:', error.message);
      if (error.message === 'Errors' && error.errors) {
        setInputError(Object.values(error.errors).flat().join('\n'));
      } else {
        setInputError('Failed to register');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-!@#\$%^&*_()-+=/.,<>?"~`£{}|:;])[A-Za-z\d-!@#\$%^&*_()-+=/.,<>?"~`£{}|:;]{8,}$/;
    return passwordRegex.test(password);
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

            {inputError && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6"
                role="alert"
              >
                <strong className="font-bold">Error!</strong>
                <span>{inputError}</span>
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
                    Sign Up
                  </button>
                )}
              </div>
            </form>

            {/* Sign Up Link */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Already have an account?{' '}
                <Link
                  to="/"
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
