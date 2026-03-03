import api from "@/utils/axiosInterceptor";
import { setUserCanvases } from "@/utils/canvasSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetUserCanvases = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { authLoading, isAuthenticated } = useSelector(
    (state: any) => state.user,
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
        dispatch(setUserCanvases(res.data.boards));
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    getCanvases();
  }, [authLoading, isAuthenticated]);
  return { loading };
};
export default useGetUserCanvases;
