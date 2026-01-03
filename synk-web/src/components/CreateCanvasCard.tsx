"use client";

interface props {
  onClick: () => void;
}
const CreateCanvasCard = ({ onClick }: props) => {
  return (
    <div
      className="
        bg-gray-800 
        w-70 h-50 
        rounded-md 
        m-10 p-5
        flex flex-col 
        items-center justify-center
        cursor-pointer
        hover:bg-gray-700 transition
      "
      onClick={onClick}
    >
      <div className="text-6xl font-light leading-none">+</div>

      <div className="mt-3 text-sm text-gray-300">Create a blank canvas</div>
    </div>
  );
};

export default CreateCanvasCard;
