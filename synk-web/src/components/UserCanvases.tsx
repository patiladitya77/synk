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
import { useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { MoreHorizontal } from "lucide-react";
import ShareDialog from "./ShareDialog";
import { RootState } from "@/utils/appStore";
const UserCanvases = () => {
  const user = useSelector((store: RootState) => store.user.user);
  const router = useRouter();
  const { canvases, loading } = useGetUserCanvases();
  if (loading) return <TableSkeleton rows={6} />;

  return (
    <Table className="text-base">
      <TableHeader>
        {canvases.length === 0 && !loading ? (
          <TableRow>
            <TableCell
              colSpan={4}
              className="text-center py-6 text-muted-foreground"
            >
              No canvases yet
            </TableCell>
          </TableRow>
        ) : (
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Edited</TableHead>
            <TableHead>Author</TableHead>
          </TableRow>
        )}
      </TableHeader>

      <TableBody>
        {canvases.map((canvas) => (
          <TableRow key={canvas.id} className="cursor-pointer hover:bg-muted">
            <TableCell
              className="py-3 font-medium"
              onClick={() => router.push(`/workspace/${canvas.slug}`)}
            >
              {canvas.title}
            </TableCell>

            <TableCell>
              {new Date(canvas.createdAt).toLocaleDateString()}
            </TableCell>

            <TableCell>
              {new Date(canvas.updatedAt).toLocaleDateString()}
            </TableCell>

            <TableCell className="flex items-center justify-between">
              <span>
                {canvas.ownerId === user?.id ? "You" : "Collaborator"}
              </span>

              <Dialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="p-1 hover:bg-muted rounded"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DialogTrigger asChild>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        Share
                      </DropdownMenuItem>
                    </DialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>

                <ShareDialog canvas={canvas} />
              </Dialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export default UserCanvases;
