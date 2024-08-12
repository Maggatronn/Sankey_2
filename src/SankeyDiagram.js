// src/components/SankeyDiagram.js

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import Tooltip from './tooltip';

const SankeyDiagram = ({ data }) => {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState({ visible: false, content: '', x: 0, y: 0 });

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const { width, height } = svg.node().getBoundingClientRect();

    const sankeyGenerator = sankey()
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[1, 1], [width - 1, height - 6]]);

    const { nodes, links } = sankeyGenerator({
      nodes: data.nodes.map(d => Object.assign({}, d)),
      links: data.links.map(d => Object.assign({}, d))
    });

    svg.selectAll('*').remove();

    // Draw links
    // Select the links
    const link = svg.append('g')
        .selectAll('path')
        .data(links)
        .enter()
        .append('path')
        .attr('d', sankeyLinkHorizontal())
        .attr('stroke-width', d => Math.max(1, d.width))
        .attr('stroke', d => d.color)
        .attr('fill', 'none')
        .attr('stroke-opacity', 0.6)
        .attr('class', 'link')
        .on('mouseover', function(event, d) {
            // Highlight the link
            d3.select(this)
                .attr('opacity', 1); // Change color to highlight
                
            d3.selectAll('.link')
                .filter(link => link.name === d.name)
                .attr('opacity', 1);

            // Highlight the nodes
            d3.selectAll('.node')
                .filter(node => node.id === d.source || node.id === d.target)
                .attr('opacity', 1); // Change color to highlight

            // Show tooltip
            setTooltip({
                visible: true,
                content: `Speaker: ${d.name} \n Source: ${d.source.name}\nValue: ${d.source.value}\nTarget: ${d.target.name}\nValue: ${d.target.value}`,
                x: event.pageX,
                y: event.pageY,
            });
        })
        .on('mouseout', function(event, d) {
            // Reset link color
            d3.select(this)
                .attr('opacity', 0.6);

            d3.selectAll('.link')
                // .filter(link => link.name === d.name)
                .attr('opacity', 0.6);    

            // Reset node color
            d3.selectAll('.node')
                .filter(node => node.id === d.source || node.id === d.target)
                .attr('opacity', 0.6);

            // Hide tooltip
            setTooltip({ visible: false, content: '', x: 0, y: 0 });
        });

    // Draw nodes
    const node = svg.append('g')
        .selectAll('rect')
        .data(nodes)
        .enter()
        .append('rect')
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('height', d => d.y1 - d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('fill', 'blue')
        .attr('opacity', 0.6)
        // .attr('stroke', 'black')
        .on('mouseover', function(event, d) {
            // Highlight the node
            d3.select(this)
                .attr('opacity', 1); // Change color to highlight

            // Highlight the links
            d3.selectAll('.link')
                .filter(link => link.source === d || link.target === d)
                .attr('stroke-opacity', 1); // Change color to highlight

            // Show tooltip
            setTooltip({
                visible: true,
                content: `Node: ${d.name}\nValue: ${d.value}`,
                x: event.pageX,
                y: event.pageY,
            });
        })
        .on('mouseout', function(event, d) {
            // Reset node color
            d3.select(this)
                .attr('opacity', 0.6);

            // Reset link color
            d3.selectAll('.link')
                .filter(link => link.source === d || link.target === d)
                .attr('stroke-opacity', 0.6);

            // Hide tooltip
            setTooltip({ visible: false, content: '', x: 0, y: 0 });
        });
    // Add node labels
    svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('x', d => d.x0 - 6)
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('font-size', 10)
      .text(d => d.name)
      .filter(d => d.x0 < width / 2)
      .attr('x', d => d.x1 + 6)
      .attr('text-anchor', 'start');
  }, [data]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '500px' }}></svg>
      {tooltip.visible && <Tooltip left={tooltip.x} top={tooltip.y}>{tooltip.content}</Tooltip>}
    </div>
  );
};

export default SankeyDiagram;
