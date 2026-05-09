type CanvasTopBarProps = {
  onSelectRect: () => void;
  onSelectCircle: () => void;
  onSelectArrow: () => void;
  activeTool: "rect" | "oval" | "arrow";
};

const CanvasTopBar = ({
  onSelectRect,
  onSelectCircle,
  onSelectArrow,
  activeTool,
}: CanvasTopBarProps) => {
  const base =
    "w-10 h-10 border text-black rounded p-1 hover:bg-gray-100 transition-colors";
  const active = "bg-blue-100 border-blue-400 text-blue-600";
  const inactive = "bg-white border-gray-200";
  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 
                 flex items-center gap-3 
                 bg-white/90 backdrop-blur 
                 border rounded-xl shadow-lg 
                 px-4 py-2 z-10"
    >
      <button
        onClick={onSelectRect}
        className="w-10 h-10 text-black border p-1 rounded hover:bg-gray-100"
        title="Rectangle"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
        </svg>
      </button>

      <button
        onClick={onSelectCircle}
        className="w-10 h-10 border text-black rounded p-1 hover:bg-gray-100"
        title="Circle"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      </button>
      <button
        onClick={onSelectArrow}
        className={`${base} ${activeTool === "arrow" ? active : inactive}`}
        title="Arrow"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
          />
        </svg>
      </button>
    </div>
  );
};

export default CanvasTopBar;
