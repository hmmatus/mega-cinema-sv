import { Card } from '@cinema/ui';

export default function DashboardPage() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold">Dashboard</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card title="Movies">
          <p className="text-3xl font-bold text-gray-800">—</p>
          <p className="text-sm text-gray-500">Total in catalog</p>
        </Card>
        <Card title="Screenings Today">
          <p className="text-3xl font-bold text-gray-800">—</p>
          <p className="text-sm text-gray-500">Scheduled</p>
        </Card>
        <Card title="Tickets Sold">
          <p className="text-3xl font-bold text-gray-800">—</p>
          <p className="text-sm text-gray-500">This week</p>
        </Card>
      </div>
    </div>
  );
}
