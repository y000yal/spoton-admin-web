import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { Button, Card, CardContent, InputField } from '../components/UI';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();
  const { showError } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // Show error toast when error changes
  useEffect(() => {
    if (error) {
      showError(error, 'Login Failed');
      clearError(); // Clear the error after showing toast
    }
  }, [error, showError, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the Redux slice and displayed as toast
      console.error('Login failed:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Admin Panel Access
          </p>
        </div>
        
        <Card>
          <CardContent>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <InputField
                  label="Username/Email"
                  name="username"
                  type="email"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username or email"
                  required
                  leftIcon={<User className="h-5 w-5 text-gray-400" />}
                />
                
                <InputField
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  }
                />
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Sign in
                </Button>
              </div>
              
              <div className="text-center text-sm text-gray-600">
                <p>Demo Credentials:</p>
                <p>Username: admin@spoton.me</p>
                <p>Password: password</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
