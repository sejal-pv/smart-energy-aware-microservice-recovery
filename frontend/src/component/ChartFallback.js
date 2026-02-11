// Replace ALL Chart.js related code with this single function:
const createSparklineData = (values, color) => {
  return {
    values: values,
    color: color,
    max: Math.max(...values),
    min: Math.min(...values),
    avg: values.reduce((a, b) => a + b, 0) / values.length
  };
};

// In your App component state:
const [cpuSparkline] = useState(() => createSparklineData([45, 52, 48, 60, 55, 65, 70], "#00D4FF"));
const [memSparkline] = useState(() => createSparklineData([800, 850, 900, 950, 1000, 1050, 1100], "#00FF9D"));

// In your render method:
<div className="sparkline-chart">
  <div className="sparkline-header">
    <span>CPU UTILIZATION</span>
    <span style={{ color: '#00D4FF' }}>{cpuSparkline.values.slice(-1)[0]}%</span>
  </div>
  <div className="sparkline-graph">
    {cpuSparkline.values.map((value, i) => (
      <div key={i} className="sparkline-dot" style={{
        left: `${(i / (cpuSparkline.values.length - 1)) * 100}%`,
        bottom: `${(value / cpuSparkline.max) * 100}%`,
        backgroundColor: '#00D4FF'
      }} />
    ))}
  </div>
</div>