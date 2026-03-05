"use client";

import { signIn, signOut } from "next-auth/react";

type AuthButtonsProps = {
  isAuthenticated: boolean;
};

export function AuthButtons({ isAuthenticated }: AuthButtonsProps) {
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
    <button
      onClick={() => signIn("google")}
      className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primaryHover active:bg-primaryActive"
    >
      EntrarComGoogle
    </button>
  );
}
