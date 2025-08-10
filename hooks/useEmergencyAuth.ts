import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRoleByEmail } from '@/lib/emergency-auth';
import { useToast } from './use-toast';

// Type for emergency session data
type EmergencySession = {
  user: {
    email: string;
    name: string;
    role: string;
    uid: string;
    isEmergencySession: boolean;
  };
  timestamp: number;
};

export function useEmergencyAuth() {
  const [user, setUser] = useState<EmergencySession['user'] | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Check for an existing emergency session on mount
  useEffect(() => {
    const checkSession = () => {
      try {
        // Check if there's an emergency session in localStorage
        const sessionData = localStorage.getItem('emergencySession');
        
        if (!sessionData) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        const session: EmergencySession = JSON.parse(sessionData);
        const now = Date.now();
        
        // Check if session is not expired (24 hours)
        if (now - session.timestamp > 24 * 60 * 60 * 1000) {
          localStorage.removeItem('emergencySession');
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Valid session found
        setUser(session.user);
      } catch (error) {
        console.error("Error checking emergency session:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, []);

  // Create a manual login function for emergency use
  const login = async (email: string, password: string) => {
    try {
      // Get user role to determine navigation
      const role = await getUserRoleByEmail(email);
      
      if (!role) {
        throw new Error("User not found");
      }
      
      // Create an emergency session
      const session: EmergencySession = {
        user: {
          email: email,
          name: email.split('@')[0], // Simple fallback for name
          role: role,
          uid: `emergency-${Date.now()}`,
          isEmergencySession: true,
        },
        timestamp: Date.now()
      };
      
      // Store in localStorage
      localStorage.setItem('emergencySession', JSON.stringify(session));
      
      // Update state
      setUser(session.user);
      
      // Return user for convenience
      return session.user;
    } catch (error) {
      console.error("Emergency login error:", error);
      toast({
        title: "Emergency Login Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Log out of emergency session
  const logout = () => {
    localStorage.removeItem('emergencySession');
    setUser(null);
    router.push('/login');
  };

  return { 
    user,
    login,
    logout,
    loading,
    isEmergencySession: !!user?.isEmergencySession
  };
}
