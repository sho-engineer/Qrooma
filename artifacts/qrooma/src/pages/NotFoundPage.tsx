import { Link } from "wouter";

export default function NotFoundPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
      <p className="text-4xl font-bold text-muted-foreground">404</p>
      <p className="text-sm text-muted-foreground">Page not found.</p>
      <Link href="/rooms" className="text-sm text-primary underline underline-offset-2">
        Back to rooms
      </Link>
    </div>
  );
}
