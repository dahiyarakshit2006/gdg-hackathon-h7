export default function EventDetails({ params }: { params: { id: string } }) {
  return <div className="p-8">Event ID: {params.id} ka page jald aa raha hai!</div>;
}