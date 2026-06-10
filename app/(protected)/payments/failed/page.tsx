export default function FailedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="space-y-4 text-center max-w-md p-6">
        <h1 className="text-5xl font-serif italic font-black text-destructive">
          Payment Deferred
        </h1>
        <p className="text-muted-foreground text-sm uppercase tracking-widest">
          The transaction could not be completed or was cancelled.
        </p>
        <p className="text-xs text-muted-foreground">
          No funds have been deducted. Please try initiating the gateway from your message thread again.
        </p>
      </div>
    </div>
  )
}