import { EventForm } from "../event-form"

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <EventForm mode="create" />
    </div>
  )
}
