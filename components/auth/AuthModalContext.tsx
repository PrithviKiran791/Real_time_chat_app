"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

export type AuthMode = "sign-in" | "sign-up";

interface AuthModalContextValue {
  isOpen: boolean;
  mode: AuthMode;
  openSignIn: () => void;
  openSignUp: () => void;
  closeModal: () => void;
  setMode: (mode: AuthMode) => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("sign-in");

  const openSignIn = useCallback(() => {
    setMode("sign-in");
    setIsOpen(true);
  }, []);

  const openSignUp = useCallback(() => {
    setMode("sign-up");
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      mode,
      openSignIn,
      openSignUp,
      closeModal,
      setMode,
    }),
    [isOpen, mode, openSignIn, openSignUp, closeModal]
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
