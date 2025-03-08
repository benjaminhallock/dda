import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface DataPoint {
  date: Date;
  value: number;
}

interface DataVisualizationProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  color?: string;
  animate?: boolean;
}

export function DataVisualization({
  data,
  width = 640,
  height = 400,
  marginTop = 20,
  marginRight = 20,
  marginBottom = 40,
  marginLeft = 40,
  xAxisLabel = 'Date',
  yAxisLabel = 'Value',
  color = 'steelblue',
  animate = true
}: DataVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [hoveredData, setHoveredData] = useState<DataPoint | null>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    const svg = d3.select(svgRef.current);
    const contentWidth = width - marginLeft - marginRight;
    const contentHeight = height - marginTop - marginBottom;
    
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, contentWidth]);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) as number])
      .nice()
      .range([contentHeight, 0]);
    
    const line = d3.line<DataPoint>()
      .x(d => x(d.date))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);
    
    const area = d3.area<DataPoint>()
      .x(d => x(d.date))
      .y0(contentHeight)
      .y1(d => y(d.value))
      .curve(d3.curveMonotoneX);
    
    // Create container for chart
    const g = svg
      .append('g')
      .attr('transform', `translate(${marginLeft},${marginTop})`);
    
    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${contentHeight})`)
      .call(d3.axisBottom(x).ticks(5))
      .call(g => g.select('.domain').attr('stroke-opacity', 0.2))
      .call(g => g.selectAll('.tick line').attr('stroke-opacity', 0.2))
      .append('text')
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'end')
      .attr('x', contentWidth)
      .attr('y', 30)
      .text(xAxisLabel);
    
    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .call(g => g.select('.domain').attr('stroke-opacity', 0.2))
      .call(g => g.selectAll('.tick line')
        .attr('x2', contentWidth)
        .attr('stroke-opacity', 0.2))
      .append('text')
      .attr('fill', 'currentColor')
      .attr('transform', 'rotate(-90)')
      .attr('y', -30)
      .attr('text-anchor', 'end')
      .text(yAxisLabel);
    
    // Add filled area
    const areaPath = g.append('path')
      .datum(data)
      .attr('fill', `${color}20`) // 20% opacity
      .attr('d', area);
    
    // Add the line path
    const path = g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('d', line);
    
    // Animate path if enabled
    if (animate) {
      const pathLength = (path.node() as SVGPathElement).getTotalLength();
      
      path
        .attr('stroke-dasharray', pathLength)
        .attr('stroke-dashoffset', pathLength)
        .transition()
        .duration(1500)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0);
      
      areaPath
        .style('opacity', 0)
        .transition()
        .delay(300)
        .duration(1200)
        .style('opacity', 1);
    }
    
    // Add dots
    const dots = g.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.value))
      .attr('r', 4)
      .style('fill', 'white')
      .style('stroke', color)
      .style('stroke-width', 2)
      .style('opacity', 0);
    
    if (animate) {
      dots
        .transition()
        .delay((_, i) => 1500 + i * 50)
        .duration(300)
        .style('opacity', 1);
    } else {
      dots.style('opacity', 1);
    }
    
    // Add hover interaction
    const overlay = g.append('rect')
      .attr('width', contentWidth)
      .attr('height', contentHeight)
      .attr('fill', 'transparent')
      .style('pointer-events', 'all');
    
    overlay
      .on('mousemove', (event) => {
        const [mouseX] = d3.pointer(event);
        const xValue = x.invert(mouseX);
        
        // Find closest data point
        const bisect = d3.bisector((d: DataPoint) => d.date).left;
        const index = bisect(data, xValue, 1);
        const d0 = data[index - 1];
        const d1 = data[index] || d0;
        const closestPoint = xValue.valueOf() - d0.date.valueOf() > d1.date.valueOf() - xValue.valueOf() ? d1 : d0;
        
        setHoveredData(closestPoint);
        
        // Update dots highlight
        dots
          .style('fill', d => d === closestPoint ? color : 'white')
          .style('stroke-width', d => d === closestPoint ? 3 : 2)
          .attr('r', d => d === closestPoint ? 6 : 4);
        
        // Show tooltip
        if (tooltipRef.current) {
          const tooltipWidth = tooltipRef.current.offsetWidth;
          const tooltipHeight = tooltipRef.current.offsetHeight;
          const dotX = x(closestPoint.date) + marginLeft;
          const dotY = y(closestPoint.value) + marginTop;
          
          // Position tooltip above dot and centered
          let tooltipLeft = dotX - tooltipWidth / 2;
          let tooltipTop = dotY - tooltipHeight - 10;
          
          // Keep tooltip within bounds
          if (tooltipLeft < 10) tooltipLeft = 10;
          if (tooltipLeft + tooltipWidth > width - 10) tooltipLeft = width - tooltipWidth - 10;
          if (tooltipTop < 10) tooltipTop = dotY + 15; // Show below if too high
          
          tooltipRef.current.style.left = `${tooltipLeft}px`;
          tooltipRef.current.style.top = `${tooltipTop}px`;
          tooltipRef.current.style.opacity = '1';
        }
      })
      .on('mouseleave', () => {
        setHoveredData(null);
        // Reset dots
        dots
          .style('fill', 'white')
          .style('stroke-width', 2)
          .attr('r', 4);
        
        // Hide tooltip
        if (tooltipRef.current) {
          tooltipRef.current.style.opacity = '0';
        }
      });

  }, [data, width, height, marginTop, marginRight, marginBottom, marginLeft, xAxisLabel, yAxisLabel, color, animate]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="overflow-visible"
      />
      <div
        ref={tooltipRef}
        className="absolute pointer-events-none px-3 py-2 bg-card border rounded shadow-md transition-opacity duration-200 opacity-0"
      >
        {hoveredData && (
          <div className="flex flex-col gap-1 text-xs">
            <div className="font-medium">
              {hoveredData.date.toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span>Value: {hoveredData.value.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
