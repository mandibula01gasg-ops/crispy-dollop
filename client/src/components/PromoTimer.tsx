import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface PromoTimerProps {
  endTime?: Date;
}

export function PromoTimer({ endTime }: PromoTimerProps) {
  const [time, setTime] = useState({ minutes: 44, seconds: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        if (prev.seconds === 0) {
          if (prev.minutes === 0) {
            return { minutes: 59, seconds: 59 };
          }
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return { ...prev, seconds: prev.seconds - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-3xl p-5 text-center shadow-xl">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Clock className="h-5 w-5 text-red-600 animate-pulse" />
        <p className="text-sm text-red-700 font-bold">
          ⏰ Promoção vai acabar em:
        </p>
      </div>
      <div className="flex items-center justify-center gap-4">
        <div className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-2xl px-4 py-3 min-w-[60px] shadow-xl animate-pulse-scale">
          <div className="text-3xl font-black">{String(time.minutes).padStart(2, '0')}</div>
          <div className="text-[10px] uppercase tracking-wider font-bold mt-1">Minutos</div>
        </div>
        <div className="text-3xl font-black text-red-600 animate-blink">:</div>
        <div className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-2xl px-4 py-3 min-w-[60px] shadow-xl animate-pulse-scale" style={{ animationDelay: '0.5s' }}>
          <div className="text-3xl font-black">{String(time.seconds).padStart(2, '0')}</div>
          <div className="text-[10px] uppercase tracking-wider font-bold mt-1">Segundos</div>
        </div>
      </div>
      <style>{`
        @keyframes pulse-scale {
          0%, 100% { transform: scale(1); box-shadow: 0 10px 25px rgba(220, 38, 38, 0.3); }
          50% { transform: scale(1.08); box-shadow: 0 15px 35px rgba(220, 38, 38, 0.5); }
        }
        @keyframes blink {
          0%, 49%, 100% { opacity: 1; }
          50%, 99% { opacity: 0.3; }
        }
        .animate-pulse-scale {
          animation: pulse-scale 1.5s ease-in-out infinite;
        }
        .animate-blink {
          animation: blink 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
