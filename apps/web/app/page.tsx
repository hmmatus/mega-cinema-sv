import { Button } from '@cinema/ui';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-5xl font-bold tracking-tight">Cinema Manager</h1>
      <p className="text-lg text-gray-500">
        Your all-in-one cinema management system.
      </p>
      <div className="flex gap-3">
        <Button variant="primary">Get Started</Button>
        <Button variant="secondary">Learn More</Button>
      </div>
    </main>
  );
}
