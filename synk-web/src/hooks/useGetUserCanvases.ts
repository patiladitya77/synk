import { ICanvas } from "@/types/canvas";
import api from "@/utils/axiosInterceptor";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const useGetUserCanvases = () => {
  const [canvases, setCanvases] = useState<ICanvas[]>([]);
  const [loading, setLoading] = useState(true);
  const { authLoading, isAuthenticated } = useSelector(
    (state: any) => state.user
  );
  useEffect(() => {
    //  Wait until auth check finishes
    if (authLoading) return;

    // If user is NOT logged in, stop loading gracefully
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    const getCanvases = async () => {
      try {
        const res = await api.get("api/board/getboards", {
          withCredentials: true,
        });
        console.log(res);
        setCanvases(res.data.boards);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    getCanvases();
  }, [authLoading, isAuthenticated]);
  return { canvases, loading };
};
export default useGetUserCanvases;
