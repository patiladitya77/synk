import { ICanvas } from "@/types/canvas";
import axios from "axios";
import { useEffect, useState } from "react";

const useGetUserCanvases = () => {
  const [canvases, setCanvases] = useState<ICanvas[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCanvases = async () => {
      try {
        const res = await axios.get(
          process.env.NEXT_PUBLIC_API_BASE_URL + "api/board/getboards",
          { withCredentials: true }
        );
        console.log(res);
        setCanvases(res.data.boards);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    getCanvases();
  }, []);
  return { canvases, loading };
};
export default useGetUserCanvases;
