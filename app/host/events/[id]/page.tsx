export default function EventPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Event Details</h1>
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <p className="text-muted-foreground mb-2">Event ID: {params.id}</p>
        <h2 className="text-xl font-semibold mb-4 text-primary">Event Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium">Upcoming</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">To be configured...</p>
          </div>
        </div>
      </div>
    </div>
  );
}