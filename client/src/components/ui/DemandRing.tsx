import React from 'react'
interface Props{
score:number,
size?:number
}
const getColor = (score: number): string => {
  if (score >= 85) return "var(--color-secondary)";
  if (score >= 70) return "var(--color-primary)";
  if (score >= 55) return "var(--color-tertiary)";
  return "var(--color-error)";
};

const getLabel = (score:number):string=>{
    if(score >= 85) return "Very High Demand";
    if(score >= 70) return "High Demand";
    if(score >= 55) return "Moderate Demand";
    if(score >=40) return "Low Demand"
    return "Very Low Demand"
}

const getHexColor = (score: number): string => {
  if (score >= 85) return "#4edea3";
  if (score >= 70) return "#c0c1ff";
  if (score >= 55) return "#ffb95f";
  return "#ffb4ab";
};

const DemandRing = ({score , size=200}:Props) => {
    const color = getColor(score)
    const hexColor = getHexColor(score)
    const label = getLabel(score);
    const radius = 80;
    const stroke = 10;
    const normalize = radius -stroke/2;
    const circ = 2 * Math.PI * normalize;
    const offset = circ -(score/100) *circ

  return (
       <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
        width={size}
          height={size}
          viewBox="0 0 180 180"
          style={{ transform: "rotate(-90deg)" }}
        >
            <circle
            cx="90"
            cy="90"
            r={normalize}
            fill="none"
            stroke="#181c22"
            strokeWidth={stroke}
            />
            <circle
                 cx="90"
            cy="90"
            r={normalize}
            fill="none"
            stroke={hexColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease" }}
            />
        </svg>
               {/* Center text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          <span
            className="label-precision font-bold"
            style={{
              fontSize: size * 0.2,
              color,
            }}
          >
            {score}
          </span>
          <span
            className="label-precision text-[10px] tracking-widest uppercase"
            style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}
          >
            Score
          </span>
        </div>
        </div>
          <div className="text-center">
        <p
          className="headline text-xl font-bold"
          style={{ color: "var(--color-on-surface)" }}
        >
          {label}
        </p>
      </div>
        </div>
  )
}

export default DemandRing