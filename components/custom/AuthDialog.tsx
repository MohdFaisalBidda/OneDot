"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ReusableDialog } from './DialogWithForm';
import { Button } from '../ui/button';
import { Fingerprint, UserPlus } from 'lucide-react';
import SignupForm from '@/app/_components/forms/signup-form';
import LoginForm from '@/app/_components/forms/login-form';

type AuthDialogContextType = {
  openSignup: () => void;
  openLogin: () => void;
  closeAll: () => void;
  popoverOpen: boolean;
  setPopoverOpen: (open: boolean) => void;
};

const AuthDialogContext = createContext<AuthDialogContextType | undefined>(undefined);

export const useAuthDialog = () => {
  const context = useContext(AuthDialogContext);
  if (!context) {
    throw new Error('useAuthDialog must be used within an AuthDialogProvider');
  }
  return context;
};

type AuthDialogProps = {
  children: ReactNode;
};

export const AuthDialogProvider = ({ children }: AuthDialogProps) => {
  const [signupDialogOpen, setSignupDialogOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const closeAll = useCallback(() => {
    setSignupDialogOpen(false);
    setLoginDialogOpen(false);
    setPopoverOpen(false);
  }, []);

  const openSignup = useCallback(() => {
    closeAll();
    setSignupDialogOpen(true);
  }, [closeAll]);

  const openLogin = useCallback(() => {
    closeAll();
    setLoginDialogOpen(true);
  }, [closeAll]);

  const value = {
    openSignup,
    openLogin,
    closeAll,
    popoverOpen,
    setPopoverOpen,
  };

  return (
    <AuthDialogContext.Provider value={value}>
      {children}
      <AuthDialogs
        signupDialogOpen={signupDialogOpen}
        loginDialogOpen={loginDialogOpen}
        onSignupOpenChange={setSignupDialogOpen}
        onLoginOpenChange={setLoginDialogOpen}
        onCloseAll={closeAll}
        popoverOpen={popoverOpen}
        onPopoverOpenChange={setPopoverOpen}
      />
    </AuthDialogContext.Provider>
  );
};

type AuthDialogsProps = {
  signupDialogOpen: boolean;
  loginDialogOpen: boolean;
  onSignupOpenChange: (open: boolean) => void;
  onLoginOpenChange: (open: boolean) => void;
  onCloseAll: () => void;
  popoverOpen: boolean;
  onPopoverOpenChange: (open: boolean) => void;
};

const AuthDialogs = ({
  signupDialogOpen,
  loginDialogOpen,
  onSignupOpenChange,
  onLoginOpenChange,
  onCloseAll,
  popoverOpen,
  onPopoverOpenChange,
}: AuthDialogsProps) => {
  return (
    <>
      <ReusableDialog
        trigger={
          <Button
            variant={"ghost"}
            className="hidden w-full justify-start gap-4 font-medium border-none"
          >
            <UserPlus className="h-4 w-4" />
            Sign up
          </Button>
        }
        title="Create Account"
        description="Start your journey to better focus and decisions"
        open={signupDialogOpen}
        onOpenChange={onSignupOpenChange}
      >
        <SignupForm
          onSubmitSuccess={onCloseAll}
          onSwitchToLogin={() => {
            onSignupOpenChange(false);
            onLoginOpenChange(true);
          }}
        />
      </ReusableDialog>

      <ReusableDialog
        trigger={
          <Button
            variant={"ghost"}
            className="hidden w-full justify-start gap-4 font-medium border-none"
          >
            <Fingerprint className="h-4 w-4" />
            Log in
          </Button>
        }
        title="Welcome Back"
        description="Enter your credentials to access your account"
        open={loginDialogOpen}
        onOpenChange={onLoginOpenChange}
      >
        <LoginForm
          onSubmitSuccess={onCloseAll}
          onSwitchToSignup={() => {
            onLoginOpenChange(false);
            onSignupOpenChange(true);
          }}
        />
      </ReusableDialog>
    </>
  );
};

// Default export for backward compatibility
const AuthDialog = () => {
  const { openSignup, openLogin } = useAuthDialog();
  
  return (
    <>
      <Button
        variant={"ghost"}
        className="w-full justify-start gap-4 font-medium border-none"
        onClick={openSignup}
      >
        <UserPlus className="h-4 w-4" />
        Sign up
      </Button>
      <Button
        variant={"ghost"}
        className="w-full justify-start gap-4 font-medium border-none"
        onClick={openLogin}
      >
        <Fingerprint className="h-4 w-4" />
        Log in
      </Button>
    </>
  );
};

export default AuthDialog;