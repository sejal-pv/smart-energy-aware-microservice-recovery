import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS } from 'chart.js';

// We'll import and register these in the component itself
const createChart = (type, data, options) => {
  class CustomChart extends React.Component {
    constructor(props) {
      super(props);
      this.canvasRef = React.createRef();
      this.chartInstance = null;
    }

    componentDidMount() {
      this.renderChart();
    }

    componentDidUpdate(prevProps) {
      if (this.chartInstance) {
        this.chartInstance.data = this.props.data;
        this.chartInstance.options = this.props.options;
        this.chartInstance.update('none'); // Prevent flickering
      }
    }

    componentWillUnmount() {
      if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = null;
      }
    }

    renderChart() {
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      const ctx = this.canvasRef.current.getContext('2d');
      this.chartInstance = new ChartJS(ctx, {
        type: type,
        data: this.props.data,
        options: this.props.options
      });
    }

    render() {
      return <canvas ref={this.canvasRef} />;
    }
  }

  return CustomChart;
};

export const LineChart = createChart('line');
export const BarChart = createChart('bar');
// Add other chart types as needed