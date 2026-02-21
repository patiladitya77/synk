import { useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Loader2 } from "lucide-react";
import api from "@/utils/axiosInterceptor";
import { ICanvas } from "@/types/canvas";

type ShareDialogProps = {
  canvas: ICanvas;
};

const ShareDialog = ({ canvas }: ShareDialogProps) => {
  console.log(canvas);
  const [inviteLink, setInviteLink] = useState(
    canvas.inviteToken &&
      canvas.isInviteEnabled &&
      canvas.inviteTokenExpiresAt &&
      new Date(canvas.inviteTokenExpiresAt) > new Date()
      ? `${process.env.NEXT_PUBLIC_BASE_URL}invite/${canvas.inviteToken}`
      : null,
  );
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = async () => {
    let link = inviteLink;

    if (!link) {
      setLoading(true);
      setError(null);
      try {
        const res = await api.post(
          process.env.NEXT_PUBLIC_API_BASE_URL +
            `api/board/${canvas.id}/generateinvitelink`,
          {},
          { withCredentials: true },
        );

        if (!res.data.ok) throw new Error("Failed to generate invite link");

        link = res.data.inviteLink;
        setInviteLink(link);
      } catch (err) {
        setError("Could not generate invite link. Please try again.");
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    }

    await navigator.clipboard.writeText(link!);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Share Canvas</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Invite via Email */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Invite via email</p>
          <div className="flex gap-2">
            <Input placeholder="Enter email" />
            <Button>Send</Button>
          </div>
        </div>

        {/* Invite Link */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Invite link</p>
          <div className="flex gap-2">
            <Input
              value={inviteLink ?? ""}
              readOnly
              placeholder="Click copy to generate an invite link"
              className="text-muted-foreground"
            />
            <Button
              onClick={handleCopy}
              disabled={loading}
              className="shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          {inviteLink && (
            <p className="text-xs text-muted-foreground">
              Link expires in 24 hours
            </p>
          )}
        </div>
      </div>
    </DialogContent>
  );
};

export default ShareDialog;
