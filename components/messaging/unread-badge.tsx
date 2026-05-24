export function UnreadBadge({
  count,
}: {
  count: number
}) {
  if (!count) return null

  return (
    <div className="min-w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center px-1">
      {count > 99 ? "99+" : count}
    </div>
  )
}