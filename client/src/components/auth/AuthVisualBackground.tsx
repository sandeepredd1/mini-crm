export default function AuthVisualBackground() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] animate-pulse rounded-full bg-orange-300/20 blur-[120px]" />
        <div className="absolute -bottom-48 -right-40 h-[520px] w-[520px] animate-pulse rounded-full bg-amber-300/20 blur-[130px]" style={{ animationDelay: "1.5s" }} />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-orange-200/15 blur-[120px]" style={{ animationDelay: "0.8s" }} />
        <div className="absolute left-[8%] top-[18%] h-16 w-16 animate-bounce rounded-full border border-orange-200/60 bg-white/30 backdrop-blur-sm" style={{ animationDuration: "5s" }} />
        <div className="absolute right-[9%] top-[16%] h-10 w-10 animate-bounce rounded-full border border-amber-200/70 bg-orange-100/30 backdrop-blur-sm" style={{ animationDuration: "4s", animationDelay: "0.5s" }} />
        <div className="absolute bottom-[15%] left-[12%] h-8 w-8 animate-bounce rounded-full border border-orange-200/60 bg-orange-100/30" style={{ animationDuration: "4.5s", animationDelay: "1s" }} />
        <div className="absolute bottom-[20%] right-[15%] h-20 w-20 animate-spin rounded-[28px] border border-orange-200/60 bg-white/30 backdrop-blur-sm" style={{ animationDuration: "15s" }} />
        <div className="absolute left-[18%] top-[35%] h-2 w-2 animate-ping rounded-full bg-orange-500" />
        <div className="absolute right-[20%] top-[40%] h-2 w-2 animate-ping rounded-full bg-amber-500" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-[30%] left-[25%] h-1.5 w-1.5 animate-ping rounded-full bg-orange-500" style={{ animationDelay: "2s" }} />
        <div className="absolute left-0 top-1/2 h-px w-[25%] bg-gradient-to-r from-transparent via-orange-300/40 to-transparent" />
        <div className="absolute right-0 top-1/2 h-px w-[25%] bg-gradient-to-l from-transparent via-amber-300/40 to-transparent" />
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.7); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </>
  );
}
