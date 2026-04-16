import React from 'react'
interface Props{
    label?:string;
    score:number,
    color?:string
}
const ScoreBar = ({label,score,color="var(--color-primary)"}: Props) => {
  return (
      <div>
      <div className="flex justify-between text-xs label-precision mb-2">
        <span style={{ color: "var(--color-on-surface-variant)" }}>
          {label}
        </span>
        <span style={{ color }}>{score}</span>
      </div>
      <div
        className="h-1.5 w-full rounded-full overflow-hidden"
        style={{ background: "var(--color-surface-container-highest)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  )
}

export default ScoreBar