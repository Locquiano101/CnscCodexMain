export default function LoadingModal() {
  return (
    <div
      className="flex items-center justify-center h-screen"
      style={{
        background: "linear-gradient(135deg, #f1f1f1 0%, #e0e0e0 100%)",
      }}
    >
      <div className="flex flex-col items-center space-y-6">
        {/* Gradient Spinner using conic-gradient */}
        <div className="relative w-16 h-16">
          {/* Outer rotating circle with gradient */}
          <div
            className="absolute top-0 left-0 w-full h-full rounded-full animate-spin"
            style={{
              background: "conic-gradient(#500000, #ee8f00, #003092, #500000)",
              maskImage:
                "radial-gradient(farthest-side, transparent calc(100% - 4px), black 100%)",
              WebkitMaskImage:
                "radial-gradient(farthest-side, transparent calc(100% - 4px), black 100%)",
            }}
          ></div>

          {/* Inner solid circle to simulate border */}
          <div className="absolute top-[4px] left-[4px] w-[calc(100%-8px)] h-[calc(100%-8px)] bg-white rounded-full z-10"></div>
        </div>

        {/* Pulsing dots */}
        <div className="flex space-x-2">
          <div
            className="w-3 h-3 rounded-full animate-bounce"
            style={{ backgroundColor: "#500000" }}
          />
          <div
            className="w-3 h-3 rounded-full animate-bounce"
            style={{ backgroundColor: "#ee8f00", animationDelay: ".2s" }}
          />
          <div
            className="w-3 h-3 rounded-full animate-bounce"
            style={{ backgroundColor: "#003092", animationDelay: ".3s" }}
          />
        </div>

        <p className="text-sm animate-fade-in" style={{ color: "#4d4d4d" }}>
          Just a moment while we prepare everything for you...
        </p>
      </div>
    </div>
  );
}
