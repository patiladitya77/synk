"use client";
import Canvas from "@/components/Canvas";
import { useParams } from "next/navigation";

export default function Workspace() {
  const { slug } = useParams();
  console.log(slug);
  return (
    <div>
      <main className="relative w-screen h-screen overflow-hidden ">
        <Canvas />
      </main>
    </div>
  );
}
