import Link from "next/link";
import { NotificationsBell } from "@/components/notificationsBell";

type TopBarProps = {
  username?: string;
};

export function TopBar({ username }: TopBarProps) {
  return (
    <header className="border-b border-borderColor bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold text-primaryActive">
          LessSocial
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/feed">Feed</Link>
          <NotificationsBell />
          {username ? <Link href={`/${username}`}>Perfil</Link> : null}
          <Link href="/me">MinhaConta</Link>
        </nav>
      </div>
    </header>
  );
}
