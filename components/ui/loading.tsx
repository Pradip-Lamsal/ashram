"use client";

import { ReactNode } from "react";

interface LoadingSkeletonProps {
  className?: string;
  children?: ReactNode;
}

export const LoadingSkeleton = ({
  className = "h-4 bg-gray-200 rounded animate-pulse",
}: LoadingSkeletonProps) => <div className={className} />;

export const CardSkeleton = () => (
  <div className="p-6 bg-white rounded-lg shadow animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="space-y-2">
        <LoadingSkeleton className="h-4 bg-gray-200 rounded w-24" />
        <LoadingSkeleton className="h-8 bg-gray-300 rounded w-16" />
      </div>
      <LoadingSkeleton className="h-12 w-12 bg-gray-200 rounded-full" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3 animate-pulse">
    <div className="grid grid-cols-4 gap-4 p-4 border-b">
      {Array.from({ length: 4 }).map((_, i) => (
        <LoadingSkeleton key={i} className="h-4 bg-gray-300 rounded" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b">
        {Array.from({ length: 4 }).map((_, j) => (
          <LoadingSkeleton key={j} className="h-4 bg-gray-200 rounded" />
        ))}
      </div>
    ))}
  </div>
);

export const DashboardLoading = () => (
  <div className="px-6 py-8 max-w-7xl mx-auto">
    <div className="mb-8">
      <LoadingSkeleton className="h-8 bg-gray-300 rounded w-48 mb-2" />
      <LoadingSkeleton className="h-4 bg-gray-200 rounded w-64" />
    </div>

    <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
          <LoadingSkeleton className="h-6 bg-gray-300 rounded w-32 mb-4" />
          <LoadingSkeleton className="h-[300px] bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  </div>
);
