import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Register() {
      const navigate = useNavigate();
      const [formData, setFormData] = useState({ name: '', email: '', password: '' });
      const [loading, setLoading] = useState(false);

      const handleChange = (e) => {
            setFormData({ ...formData, [e.target.name]: e.target.value });
      };

      const handleSubmit = (e) => {
            e.preventDefault();
            setLoading(true);

            setTimeout(() => {
                  setLoading(false);
                  navigate('/login');
            }, 500);
      };

      return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
                  <div className="w-full max-w-sm space-y-6">

                        <form onSubmit={handleSubmit} className="space-y-4">

                              <div className="space-y-1.5">
                                    <Label htmlFor="name">Full Name<span className="text-destructive">*</span></Label>
                                    <Input
                                          id="name"
                                          name="name"
                                          type="text"
                                          required
                                          value={formData.name}
                                          onChange={handleChange}
                                          placeholder="John Doe"
                                          className="h-10 border-input focus-visible:ring-1 focus-visible:ring-foreground"
                                    />
                              </div>

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

                              <div className="space-y-1.5">
                                    <Label htmlFor="password">Password<span className="text-destructive">*</span></Label>
                                    <Input
                                          id="password"
                                          name="password"
                                          type="password"
                                          required
                                          value={formData.password}
                                          onChange={handleChange}
                                          placeholder="Create a password"
                                          className="h-10 border-input focus-visible:ring-1 focus-visible:ring-foreground"
                                    />
                              </div>

                              <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-10 bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors mt-2"
                              >
                                    {loading ? 'Creating account...' : 'Create account'}
                              </Button>
                        </form>

                        <div className="text-center text-xs text-muted-foreground pt-2">
                              Already have an account?{' '}
                              <Link to="/login" className="text-foreground font-medium hover:underline">
                                    Sign in
                              </Link>
                        </div>

                  </div>
            </div>
      );
}