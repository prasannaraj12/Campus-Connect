// Reusable skeleton components for loading states

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 animate-pulse">
      {/* Category strip */}
      <div className="h-8 bg-gray-200" />
      <div className="p-5 space-y-3">
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded-lg w-3/4" />
        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-5/6" />
        </div>
        {/* Meta */}
        <div className="space-y-2 pt-2">
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="h-4 bg-gray-100 rounded w-2/3" />
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-gray-100 rounded-full" />
        {/* Buttons */}
        <div className="flex gap-2 pt-2">
          <div className="h-9 bg-gray-200 rounded-lg flex-1" />
          <div className="h-9 bg-gray-100 rounded-lg w-24" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonEventGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 animate-pulse">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-gray-200 rounded-lg" />
        <div className="h-8 w-12 bg-gray-200 rounded" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-1" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats */}
      <div className="bg-white rounded-2xl p-6">
        <div className="h-7 bg-gray-200 rounded w-48 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-64 mb-6" />
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <SkeletonStatCard key={i} />)}
        </div>
      </div>
      {/* Events */}
      <SkeletonEventGrid />
    </div>
  )
}

export function SkeletonDiscussion() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
      <div className="flex gap-2">
        <div className="h-6 w-20 bg-gray-100 rounded-lg" />
        <div className="h-6 w-16 bg-gray-100 rounded-lg" />
      </div>
    </div>
  )
}

/** Consistent loading spinner used across all pages */
export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin ${className}`} />
  )
}

/** Full-page centered loading state */
export function PageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Spinner />
      <p className="text-slate-500 font-medium text-sm">{message}</p>
    </div>
  )
}
