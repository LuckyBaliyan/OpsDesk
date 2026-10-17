import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
      const navigate = useNavigate();
      const [formData, setFormData] = useState({ email: '', password: '' });
      const [loading, setLoading] = useState(false);

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

      const handleSubmit = (e) => {
            e.preventDefault();
            setLoading(true);

            setTimeout(() => {
                  localStorage.setItem('opsdesk_token', 'mock_jwt_token_auth');
                  setLoading(false);
                  navigate('/dashboard');
            }, 500);
      };

      return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
                  <div className="w-full max-w-sm space-y-6">

                        <form onSubmit={handleSubmit} className="space-y-4">

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
                                    disabled={loading}
                                    className="w-full h-10 bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors"
                              >
                                    {loading ? 'Signing in...' : 'Sign in'}
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