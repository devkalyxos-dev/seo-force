interface ProsConsBoxProps {
  pros?: string[];
  cons?: string[];
}

export function ProsConsBox({ pros = [], cons = [] }: ProsConsBoxProps) {
  if (pros.length === 0 && cons.length === 0) return null;

  return (
    <div className="grid md:grid-cols-2 gap-4 my-8">
      {/* Pros */}
      {pros.length > 0 && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-5">
          <h4 className="flex items-center gap-2 text-green-700 font-semibold mb-4">
            <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            Points forts
          </h4>
          <ul className="space-y-2.5">
            {pros.map((pro, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-green-800">
                <svg className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {pro}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cons */}
      {cons.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-5">
          <h4 className="flex items-center gap-2 text-red-700 font-semibold mb-4">
            <span className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
            Points faibles
          </h4>
          <ul className="space-y-2.5">
            {cons.map((con, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-red-800">
                <svg className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {con}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface VerdictBoxProps {
  title?: string;
  score?: number;
  verdict: string;
  pros?: string[];
  cons?: string[];
}

export function VerdictBox({ title = "Notre verdict", score, verdict, pros = [], cons = [] }: VerdictBoxProps) {
  const getScoreColor = (score: number) => {
    if (score >= 4) return 'from-green-500 to-emerald-600';
    if (score >= 3) return 'from-yellow-500 to-amber-600';
    return 'from-orange-500 to-red-600';
  };

  return (
    <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-6 md:p-8 my-10 text-white">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-neutral-300 text-sm leading-relaxed">{verdict}</p>
        </div>
        {score && (
          <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${getScoreColor(score)} flex items-center justify-center shadow-lg`}>
            <span className="text-2xl font-bold">{score.toFixed(1)}</span>
          </div>
        )}
      </div>

      {(pros.length > 0 || cons.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4 pt-6 border-t border-neutral-700">
          {pros.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-wider text-green-400 font-semibold mb-3">On aime</h4>
              <ul className="space-y-2">
                {pros.slice(0, 4).map((pro, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {cons.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-wider text-red-400 font-semibold mb-3">On regrette</h4>
              <ul className="space-y-2">
                {cons.slice(0, 4).map((con, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
