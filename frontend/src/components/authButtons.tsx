"use client";

import { signIn, signOut } from "next-auth/react";
import { useState } from "react";

type AuthButtonsProps = {
  isAuthenticated: boolean;
};

export function AuthButtons({ isAuthenticated }: AuthButtonsProps) {
  const [isLoadingSignIn, setIsLoadingSignIn] = useState(false);

  const HandleGoogleSignIn = async () => {
    if (isLoadingSignIn) {
      return;
    }
    setIsLoadingSignIn(true);
    try {
      const csrfResponse = await fetch("/api/auth/csrf", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      if (!csrfResponse.ok) {
        await signIn(undefined, { redirectTo: "/feed" });
        return;
      }
      const csrfPayload = (await csrfResponse.json()) as { csrfToken?: string };
      if (!csrfPayload.csrfToken) {
        await signIn(undefined, { redirectTo: "/feed" });
        return;
      }
      const signInForm = document.createElement("form");
      signInForm.method = "POST";
      signInForm.action = "/api/auth/signin/google";

      const csrfInput = document.createElement("input");
      csrfInput.type = "hidden";
      csrfInput.name = "csrfToken";
      csrfInput.value = csrfPayload.csrfToken;
      signInForm.appendChild(csrfInput);

      const callbackInput = document.createElement("input");
      callbackInput.type = "hidden";
      callbackInput.name = "callbackUrl";
      callbackInput.value = `${window.location.origin}/feed`;
      signInForm.appendChild(callbackInput);

      document.body.appendChild(signInForm);
      signInForm.submit();
    } finally {
      setIsLoadingSignIn(false);
    }
  };

  if (isAuthenticated) {
    return (
      <button
        onClick={() => signOut()}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primaryHover active:bg-primaryActive"
      >
        Sair
      </button>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => void HandleGoogleSignIn()}
        disabled={isLoadingSignIn}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primaryHover active:bg-primaryActive"
      >
        {isLoadingSignIn ? "Entrando..." : "Criar Conta Com Google"}
      </button>
      <button
        onClick={() => void HandleGoogleSignIn()}
        disabled={isLoadingSignIn}
        className="rounded-md border border-borderColor bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary"
      >
        Ja Tenho Conta
      </button>
    </div>
  );
}
