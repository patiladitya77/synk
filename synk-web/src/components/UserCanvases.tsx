"use client";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import useGetUserCanvases from "@/hooks/useGetUserCanvases";
import TableSkeleton from "./TableSkeleton";
import { useRouter } from "next/navigation";

const UserCanvases = () => {
  const router = useRouter();
  const { canvases, loading } = useGetUserCanvases();
  if (loading) return <TableSkeleton rows={6} />;

  return (
    <Table className="text-base">
      <TableHeader>
        {canvases.length === 0 && !loading && (
          <TableRow>
            <TableCell
              colSpan={4}
              className="text-center py-6 text-muted-foreground"
            >
              No canvases yet
            </TableCell>
          </TableRow>
        )}

        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Edited</TableHead>
          <TableHead>Author</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {canvases.map((canvas) => (
          <TableRow
            key={canvas._id}
            className="cursor-pointer hover:bg-muted"
            onClick={() => router.push(`/workspace/${canvas.slug}`)}
          >
            <TableCell className="py-3 font-medium">{canvas.title}</TableCell>

            <TableCell>
              {new Date(canvas.createdAt).toLocaleDateString()}
            </TableCell>

            <TableCell>
              {new Date(canvas.updatedAt).toLocaleDateString()}
            </TableCell>

            <TableCell>{canvas.ownerId ? "You" : "Collaborator"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export default UserCanvases;
