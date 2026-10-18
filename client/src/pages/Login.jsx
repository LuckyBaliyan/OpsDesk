import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLoginUserMutation } from '@/stores/slices/authSlice';
import { FullPageLoader, Loader } from '@/components/ui/Loader';
import { setCredentials } from '@/stores/slices/userSlice';
import { useDispatch } from 'react-redux';

export default function Login() {
      const navigate = useNavigate();
      const dispatch = useDispatch();
      const [formData, setFormData] = useState({ email: '', password: '' });

      const [loginUser, { isLoading, error }] = useLoginUserMutation();

      //if user already logged in redirect to dashboard
      useEffect(() => {
            const token = localStorage.getItem('opsdesk_token');
            if (token) {
                  navigate('/dashboard', { replace: true });
            }
      }, [navigate]);

      const handleChange = (e) => {
            setFormData({ ...formData, [e.target.name]: e.target.value });
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                  const response = await loginUser(formData).unwrap();

                  // Token aur user data ko store karo then no need for localStorage 
                  dispatch(setCredentials({
                        token: response.token,
                        user: response.user
                  }));

                  navigate("/dashboard");
            } catch (error) {
                  console.log("Error logging in:", error);
            }
      };

      if (isLoading) return <FullPageLoader />;

      return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
                  <div className="w-full max-w-sm space-y-6">

                        <form onSubmit={handleSubmit} className="space-y-4">

                              {error && (
                                    <div className="p-3 text-xs bg-destructive/10 text-destructive rounded-md border border-destructive/20">
                                          {error.data?.message || 'Invalid email or password'}
                                    </div>
                              )}

                              {/* Email Field */}
                              <div className="space-y-1.5">
                                    <Label htmlFor="email">Email<span className="text-destructive">*</span></Label>
                                    <Input
                                          id="email"
                                          name="email"
                                          type="email"
                                          required
                                          value={formData.email}
                                          onChange={handleChange}
                                          placeholder="example@shadcnspace.com"
                                          className="h-10 border-input focus-visible:ring-1 focus-visible:ring-foreground"
                                    />
                              </div>

                              {/* Password Field */}
                              <div className="space-y-1.5">
                                    <Label htmlFor="password">Password<span className="text-destructive">*</span></Label>
                                    <Input
                                          id="password"
                                          name="password"
                                          type="password"
                                          required
                                          value={formData.password}
                                          onChange={handleChange}
                                          placeholder="Enter your password"
                                          className="h-10 border-input focus-visible:ring-1 focus-visible:ring-foreground"
                                    />
                              </div>

                              {/* Remember me & Forgot Password */}
                              <div className="flex items-center justify-between text-xs py-1">
                                    <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                                          <input
                                                type="checkbox"
                                                className="rounded border-input bg-transparent text-primary focus:ring-0 w-4 h-4 accent-foreground"
                                          />
                                          Remember this device
                                    </label>
                                    <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-foreground hover:underline font-medium">
                                          Forgot Password?
                                    </a>
                              </div>

                              {/* Sign In Button using Shadcn Button */}
                              <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-10 bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors"
                              >
                                    {isLoading ? (
                                          <div className="flex items-center gap-2">
                                                <Loader size="sm" />
                                                <span>Signing in...</span>
                                          </div>
                                    ) : (
                                          'Sign in'
                                    )}
                              </Button>
                        </form>

                        {/* Bottom Navigation */}
                        <div className="text-center text-xs text-muted-foreground pt-2">
                              Don't have an account?{' '}
                              <Link to="/register" className="text-foreground font-medium hover:underline">
                                    Create an account
                              </Link>
                        </div>

                  </div>
            </div>
      );
}
