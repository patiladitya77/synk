"use client";
import { useParams } from "next/navigation";

export default function Workspace() {
  const { slug } = useParams();
  console.log(slug);
  return <div>hii there</div>;
}
