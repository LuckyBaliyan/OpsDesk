import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '@/stores/slices/userSlice';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function DashboardHeader() {
      const user = useSelector(selectCurrentUser);
      const dispatch = useDispatch();
      const navigate = useNavigate();

      const handleLogout = () => {
            dispatch(logout());
            navigate('/login', { replace: true });
      };

      return (
            <div className="flex items-center justify-between p-4 border-b border-border">
                  <div>
                        <h2 className="text-sm font-semibold text-foreground">
                              Welcome, {user?.name || 'Operator'}
                        </h2>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>

                  <Button onClick={handleLogout} variant="outline" className="h-8 text-xs cursor-pointer">
                        Sign out
                  </Button>
            </div>
      );
}