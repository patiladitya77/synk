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
import { useDispatch, useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import ShareDialog from "./ShareDialog";
import { RootState } from "@/utils/appStore";
import { ICanvas } from "@/types/canvas";
import { useState } from "react";
import api from "@/utils/axiosInterceptor";
import { removeUserCanvases } from "@/utils/canvasSlice";

const UserCanvases = () => {
  const user = useSelector((store: RootState) => store.user.user);
  const router = useRouter();
  const { loading } = useGetUserCanvases();
  const canvases = useSelector((store: RootState) => store.canvas.canvases);
  const dispatch = useDispatch();

  const [shareCanvas, setShareCanvas] = useState<ICanvas | null>(null);
  const [deleteCanvas, setDeleteCanvas] = useState<ICanvas | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const res = await api.delete(
        process.env.NEXT_PUBLIC_API_BASE_URL +
          `api/board/archive/${deleteCanvas?.id}/`,
        {},
      );
      console.log("Delete canvas:", deleteCanvas?.id);
      setDeleteCanvas(null);
      dispatch(removeUserCanvases(deleteCanvas?.id));
      console.log(res);
    } catch (err) {
      console.error("Could not delete canvas. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <TableSkeleton rows={6} />;

  return (
    <>
      <Table className="text-base">
        <TableHeader>
          {(!canvases || canvases.length === 0) && !loading ? (
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
          {canvases?.map((canvas: ICanvas) => (
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
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setShareCanvas(canvas);
                      }}
                    >
                      Share
                    </DropdownMenuItem>
                    {canvas.ownerId === user?.id && (
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteCanvas(canvas);
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Share Dialog */}
      <Dialog
        open={!!shareCanvas}
        onOpenChange={(open) => !open && setShareCanvas(null)}
      >
        {shareCanvas && <ShareDialog canvas={shareCanvas} />}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteCanvas}
        onOpenChange={(open) => !open && setDeleteCanvas(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Canvas</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteCanvas?.title}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteCanvas(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default UserCanvases;
