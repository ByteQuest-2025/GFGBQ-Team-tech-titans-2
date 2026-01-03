function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Trust Score Skeleton */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center mb-8">
          <div className="w-48 h-48 bg-gray-200 rounded-full"></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Citation Cards Skeleton */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 border-l-4 border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fact Check Skeleton */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 border-l-4 border-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="w-24 h-6 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SkeletonLoader;