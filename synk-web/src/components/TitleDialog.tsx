"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useEffect, useState } from "react";
interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  setTitle: (v: string) => void;
  onCreate: () => void;
}
const TitleDialog = ({
  open,
  onOpenChange,
  title,
  setTitle,
  onCreate,
}: Props) => {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  useEffect(() => {
    if (!title) return;
    const checkAvailabilty = async () => {
      setChecking(true);
      try {
        const res = await axios.get(
          process.env.NEXT_PUBLIC_API_BASE_URL + "api/board/checkname",
          {
            params: { title },
            withCredentials: true,
          }
        );
        setAvailable(res.data.available);
      } catch (error) {
        console.log(error);
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    };
    const timer = setTimeout(checkAvailabilty, 400);
    return () => clearTimeout(timer);
  }, [title]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Give a name for your Canvas</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="untitled canvas"
              />
              {checking && (
                <p className="text-sm text-gray-400">Checking availability…</p>
              )}
              {available === false && (
                <p className="text-sm text-red-500">
                  You already have a canvas with this name
                </p>
              )}
              {available === true && (
                <p className="text-sm text-green-500">Available</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button onClick={() => onOpenChange(false)} variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={() => {
                onCreate();
                onOpenChange(false);
              }}
              type="submit"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default TitleDialog;
