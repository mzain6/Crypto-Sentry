type SparklineProps = {
  values: number[];
  tone?: "green" | "red";
};

export function Sparkline({ values, tone = "green" }: SparklineProps) {
  const points = values.length > 1 ? values : [0, 0];
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const path = points
    .map((value, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * 100;
      const y = 48 - ((value - min) / range) * 38;

      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg className={`sparkline ${tone}`} viewBox="0 0 100 54" role="img">
      <polyline points={path} />
    </svg>
  );
}
