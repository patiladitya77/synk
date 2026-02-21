"use client";
import { RootState } from "@/utils/appStore";
import api from "@/utils/axiosInterceptor";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const user = useSelector((store: RootState) => store.user.user);
  const isAuthLoading = useSelector(
    (store: RootState) => store.user.authLoading,
  );
  const [status, setStatus] = useState<"idle" | "joining" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  useEffect(() => {
    if (!params.token) return;
    if (isAuthLoading) return;
    if (!user) {
      router.replace(`/login?invite=${params.token}`);
      return;
    }
    acceptInvite();
  }, [user, isAuthLoading]);
  const acceptInvite = async () => {
    setStatus("joining");
    const res = await api.post(
      process.env.NEXT_PUBLIC_API_BASE_URL + "api/board/invite/" + params.token,
      {},
      { withCredentials: true },
    );
    console.log(res);
    const boardId = res.data.boardId;
    router.push("http://localhost:3000/workspace/" + boardId);
  };

  return <div>Joining board</div>;
}
