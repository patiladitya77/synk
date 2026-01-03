"use client";
import CreateCanvasCard from "@/components/CreateCanvasCard";
import TitleDialog from "@/components/TitleDialog";
import { useGlobalToast } from "@/components/Toast-provider";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Dashboard() {
  const [title, setTitle] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();
  const { showToast } = useGlobalToast();
  const handleCreateCanvas = async () => {
    try {
      const res = await axios.post(
        process.env.NEXT_PUBLIC_API_BASE_URL + "api/board/create",
        {
          title: title,
        },
        {
          withCredentials: true,
        }
      );
      const slug = res.data.savedBoard.slug;
      if (res.status === 200) {
        router.push(`workspace/${slug}`);
        showToast("Canvas Created Successfully", "success");
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <CreateCanvasCard onClick={() => setShowDialog(true)} />

      <TitleDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        title={title}
        setTitle={setTitle}
        onCreate={handleCreateCanvas}
      />
    </div>
  );
}
