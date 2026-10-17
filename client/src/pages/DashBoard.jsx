import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function DashBoard() {
      const navigate = useNavigate();

      const handleLogout = () => {
            // Clear auth token
            localStorage.removeItem('opsdesk_token');
            // Redirect to login page
            navigate('/login', { replace: true });
      };

      return (
            <div className="min-h-screen bg-background text-foreground p-6">
                  <div className="max-w-6xl mx-auto space-y-6">

                        {/* Top Header */}
                        <div className="flex items-center justify-between border-b border-border pb-4">
                              <div>
                                    <h1 className="text-2xl font-bold tracking-tight">OpsHub Enterprise Dashboard</h1>
                                    <p className="text-sm text-muted-foreground">Welcome back, system operator.</p>
                              </div>

                              <Button
                                    onClick={handleLogout}
                                    variant="outline"
                                    className="h-9 px-4 text-xs font-medium cursor-pointer border-border hover:bg-accent"
                              >
                                    Sign out
                              </Button>
                        </div>

                        {/* Content Box */}
                        <div className="p-6 rounded-lg border border-border bg-card text-card-foreground">
                              <h2 className="text-lg font-semibold mb-2">Authentication Successful! 🎉</h2>
                              <p className="text-sm text-muted-foreground">
                                    Aap successfully authenticated ho aur Protected Route ka guard perfectly kaam kar raha hai.
                                    Bina login kiye koi yahan nahi aa sakta.
                              </p>
                        </div>

                  </div>
            </div>
      );
}