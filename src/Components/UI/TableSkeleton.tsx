import { Skeleton } from "./Skeleton";

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

export const TableSkeleton = ({ columns, rows = 5 }: TableSkeletonProps) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-t border-border">
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j} className="py-4 px-6">
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};
