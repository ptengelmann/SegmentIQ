// components/Charts/AreaChart.jsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './AreaChart.scss';

const AreaChart = ({ 
  data,
  width = '100%',
  height = 200,
  color = '#635bff',
  gradient = true,
  animate = true,
  showAxis = true,
  showTooltip = true,
  yAxisLabel = '',
  xAxisLabel = '',
  formatY = value => value,
  margin = { top: 20, right: 20, bottom: 30, left: 40 }
}) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    // Set dimensions
    const containerWidth = svgRef.current.clientWidth;
    const containerHeight = height;
    const chartWidth = containerWidth - margin.left - margin.right;
    const chartHeight = containerHeight - margin.top - margin.bottom;
    
    // Create chart container
    const chart = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.date)))
      .range([0, chartWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) * 1.1]) // 10% headroom
      .range([chartHeight, 0]);
    
    // Add gradient if enabled
    if (gradient) {
      const gradientId = `area-gradient-${Math.random().toString(36).substr(2, 9)}`;
      
      svg.append('defs')
        .append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%')
        .selectAll('stop')
        .data([
          { offset: '0%', color: color, opacity: 0.3 },
          { offset: '100%', color: color, opacity: 0.05 }
        ])
        .enter()
        .append('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => d.color)
        .attr('stop-opacity', d => d.opacity);
    
      // Create area generator
      const area = d3.area()
        .x(d => xScale(new Date(d.date)))
        .y0(chartHeight)
        .y1(d => yScale(d.value))
        .curve(d3.curveMonotoneX);
      
      // Add area
      chart.append('path')
        .datum(data)
        .attr('class', 'area')
        .attr('fill', `url(#${gradientId})`)
        .attr('d', area);
    }
    
    // Create line generator
    const line = d3.line()
      .x(d => xScale(new Date(d.date)))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);
    
    // Add line
    const path = chart.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('d', line);
    
    // Animate path
    if (animate) {
      const pathLength = path.node().getTotalLength();
      
      path
        .attr('stroke-dasharray', pathLength)
        .attr('stroke-dashoffset', pathLength)
        .transition()
        .duration(1500)
        .attr('stroke-dashoffset', 0);
    }
    
    // Add data points
    chart.selectAll('.data-point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'data-point')
      .attr('cx', d => xScale(new Date(d.date)))
      .attr('cy', d => yScale(d.value))
      .attr('r', 0)
      .attr('fill', color)
      .transition()
      .delay((_, i) => i * 50)
      .duration(300)
      .attr('r', 4);
    
    // Add axes if enabled
    if (showAxis) {
      // X-axis
      chart.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat('%b %d')))
        .selectAll('text')
        .style('font-size', '10px')
        .style('color', '#64748b');
      
      // Y-axis
      chart.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(formatY))
        .selectAll('text')
        .style('font-size', '10px')
        .style('color', '#64748b');
      
      // Axis labels if provided
      if (xAxisLabel) {
        chart.append('text')
          .attr('class', 'x-axis-label')
          .attr('x', chartWidth / 2)
          .attr('y', chartHeight + margin.bottom - 5)
          .attr('text-anchor', 'middle')
          .text(xAxisLabel)
          .style('font-size', '12px')
          .style('fill', '#64748b');
      }
      
      if (yAxisLabel) {
        chart.append('text')
          .attr('class', 'y-axis-label')
          .attr('transform', 'rotate(-90)')
          .attr('x', -chartHeight / 2)
          .attr('y', -margin.left + 15)
          .attr('text-anchor', 'middle')
          .text(yAxisLabel)
          .style('font-size', '12px')
          .style('fill', '#64748b');
      }
    }
    
    // Add tooltip if enabled
    if (showTooltip) {
      const tooltip = d3.select(tooltipRef.current);
      
      chart.selectAll('.data-point-hover')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'data-point-hover')
        .attr('cx', d => xScale(new Date(d.date)))
        .attr('cy', d => yScale(d.value))
        .attr('r', 12)
        .attr('fill', 'transparent')
        .on('mouseover', function(event, d) {
          d3.select(this.previousSibling)
            .transition()
            .duration(100)
            .attr('r', 6);
          
          tooltip
            .style('visibility', 'visible')
            .style('left', `${event.pageX + 15}px`)
            .style('top', `${event.pageY - 20}px`)
            .html(`
              <div class="tooltip-date">${new Date(d.date).toLocaleDateString()}</div>
              <div class="tooltip-value">${formatY(d.value)}</div>
            `);
        })
        .on('mouseout', function() {
          d3.select(this.previousSibling)
            .transition()
            .duration(100)
            .attr('r', 4);
          
          tooltip.style('visibility', 'hidden');
        });
    }
    
  }, [data, height, color, gradient, animate, showAxis, showTooltip, yAxisLabel, xAxisLabel, formatY]);
  
  return (
    <div className="area-chart-container" style={{ height: `${height}px` }}>
      <svg ref={svgRef} width={width} height={height} />
      {showTooltip && <div ref={tooltipRef} className="chart-tooltip" />}
    </div>
  );
};

export default AreaChart;