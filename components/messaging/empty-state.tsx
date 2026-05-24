export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500">
      <div className="bg-gray-100 p-6 rounded-full mb-4">
        {/* Placeholder Icon */}
        <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900">No conversations yet</h3>
      <p className="mt-1">When you start a new booking or support chat, it will appear here.</p>
    </div>
  )
}