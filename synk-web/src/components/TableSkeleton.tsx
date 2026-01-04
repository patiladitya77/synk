import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  rows?: number;
}

const TableSkeleton = ({ rows = 6 }: TableSkeletonProps) => {
  return (
    <Table className="text-base">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Edited</TableHead>
          <TableHead>Author</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i}>
            <TableCell className="py-6">
              <Skeleton className="h-4 w-[70%]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[60%]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[60%]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[50%]" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TableSkeleton;
