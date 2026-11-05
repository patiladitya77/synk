type ConnectedUser = { userId: string; name: string };

type CanvasTopBarProps = {
  onSelectRect: () => void;
  onSelectCircle: () => void;
  onSelectArrow: () => void;
  onSelectDiamond: () => void;
  onSelectText: () => void;
  activeTool: "rect" | "oval" | "arrow" | "diamond" | "text";
  connectedUsers?: ConnectedUser[];
  currentUserId?: string;
  zoom?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
};

/** Deterministic colour from a userId string */
const avatarColour = (userId: string) => {
  const colours = [
    "#f87171", "#fb923c", "#fbbf24", "#34d399",
    "#38bdf8", "#818cf8", "#e879f9", "#f472b6",
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  return colours[Math.abs(hash) % colours.length];
};

const CanvasTopBar = ({
  onSelectRect,
  onSelectCircle,
  onSelectArrow,
  onSelectDiamond,
  onSelectText,
  activeTool,
  connectedUsers = [],
  currentUserId,
  zoom = 1,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}: CanvasTopBarProps) => {
  const base =
    "w-10 h-10 border text-black rounded p-1 hover:bg-gray-100 transition-colors flex items-center justify-center";
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
        className={`${base} ${activeTool === "rect" ? active : inactive}`}
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
        className={`${base} ${activeTool === "oval" ? active : inactive}`}
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

      <button
        onClick={onSelectDiamond}
        className={`${base} ${activeTool === "diamond" ? active : inactive}`}
        title="Diamond"
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
            d="M12 3L21 12L12 21L3 12Z"
          />
        </svg>
      </button>

      <button
        onClick={onSelectText}
        className={`${base} ${activeTool === "text" ? active : inactive}`}
        title="Text"
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
            d="M7.5 4.5h9M12 4.5v15M9 19.5h6"
          />
        </svg>
      </button>

      {/* Presence avatars */}
      {connectedUsers.length > 0 && (
        <>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <div className="flex items-center -space-x-2">
            {connectedUsers.slice(0, 3).map((u) => {
              const isSelf = u.userId === currentUserId;
              return (
                <div
                  key={u.userId}
                  title={isSelf ? `${u.name} (You)` : u.name}
                  style={{ backgroundColor: avatarColour(u.userId) }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold select-none ${isSelf
                      ? "ring-2 ring-green-400 ring-offset-1"
                      : "ring-2 ring-white"
                    }`}
                >
                  {u.name.charAt(0).toUpperCase()}
                </div>
              );
            })}
            {connectedUsers.length > 3 && (
              <div
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-semibold ring-2 ring-white cursor-default"
                title={connectedUsers.slice(3).map((u) => u.name).join(", ")}
              >
                +{connectedUsers.length - 3}
              </div>
            )}
          </div>
        </>
      )}

      {/* Zoom controls */}
      <div className="w-px h-6 bg-gray-200 mx-1" />
      <div className="flex items-center gap-1">
        <button
          onClick={onZoomOut}
          className={`${base} ${inactive}`}
          title="Zoom out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
          </svg>
        </button>
        <button
          onClick={onZoomReset}
          className="h-8 px-2 text-xs font-medium border border-gray-200 bg-white rounded hover:bg-gray-100 transition-colors min-w-[46px] text-black"
          title="Reset zoom to 100%"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={onZoomIn}
          className={`${base} ${inactive}`}
          title="Zoom in"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CanvasTopBar;
