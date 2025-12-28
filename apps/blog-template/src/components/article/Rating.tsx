'use client';

interface RatingProps {
  score: number; // 0-5
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function Rating({ score, maxScore = 5, size = 'md', showLabel = true }: RatingProps) {
  const normalizedScore = Math.min(Math.max(score, 0), maxScore);
  const percentage = (normalizedScore / maxScore) * 100;

  const sizeClasses = {
    sm: 'text-xs gap-0.5',
    md: 'text-sm gap-1',
    lg: 'text-base gap-1.5',
  };

  const starSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={`flex items-center ${sizeClasses[size]}`}>
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => {
          const fillPercentage = Math.min(Math.max((normalizedScore - i) * 100, 0), 100);
          return (
            <div key={i} className={`relative ${starSizes[size]}`}>
              {/* Empty star */}
              <svg
                className="absolute text-neutral-200"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {/* Filled star with clip */}
              <svg
                className="absolute text-amber-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                style={{ clipPath: `inset(0 ${100 - fillPercentage}% 0 0)` }}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          );
        })}
      </div>
      {showLabel && (
        <span className="font-semibold text-neutral-900 ml-1">
          {normalizedScore.toFixed(1)}/{maxScore}
        </span>
      )}
    </div>
  );
}

interface ScoreBadgeProps {
  score: number;
  label?: string;
}

export function ScoreBadge({ score, label }: ScoreBadgeProps) {
  const getColorClass = (score: number) => {
    if (score >= 4.5) return 'bg-green-500 text-white';
    if (score >= 4) return 'bg-green-400 text-white';
    if (score >= 3.5) return 'bg-lime-500 text-white';
    if (score >= 3) return 'bg-yellow-500 text-white';
    if (score >= 2) return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`w-14 h-14 rounded-xl ${getColorClass(score)} flex items-center justify-center shadow-lg`}>
        <span className="text-xl font-bold">{score.toFixed(1)}</span>
      </div>
      {label && <span className="text-xs text-neutral-500 mt-1">{label}</span>}
    </div>
  );
}
