// import React, { useEffect, useRef, useState } from "react";
// import * as d3 from "d3";

// interface Props {
//   field: "similarity";
//   ticks: number;
//   height?: number;
//   width?: number;
//   lineValue?: number;
//   lineText?: string;
//   calculateBinColor?: (x1: number, x2: number) => string;

// }

// const Histogram = (props : Props) => {
//   const histogramElement = useRef<HTMLDivElement>(null);
//   const [chart, setChart] = useState<d3.Selection<SVGSVGElement, any, null, any> | null>(null);

//   const margin = { top: 10, bottom: 55, left: 60, right: 45 };
//   const [size, setSize] = useState({ width: 0, height: 0 });

//   const width = Math.max((props.width ?? size.width) - margin.left - margin.right, 0);
//   const height = Math.max((props.height ?? 400) - margin.top - margin.bottom, 0);

//   const tooltipMessage = (d: any): string => {
//     return `There are **<span class="math-inline">\{d\.length\}\*\* submissions that have a highest similarity between \*\*</span>{d.x0}** and **${d.x1}**`;
//   };

//   const drawHistogram = () => {
//     if (!chart) return;

//     chart
//       .attr("width", width + margin.left + margin.right)
//       .attr("height", height + margin.top + margin.bottom);

//     chart.selectAll("*").remove();

//      // Assuming you have access to this data

//     const binsData = records.map((record) => {
//       if (props.field === "similarity") {
//         return record.similarity || 0;
//         }
//       return 0;
//     });

//     const fieldName =
//       props.field === "similarity"
//         ? "Similarity"
//         : props.field === "totalOverlap"
//         ? "Total Overlap"
//         : "Longest Fragment";

//     const x = d3.scaleLinear().domain([0, 1]).range([0, width]);
//     const y = d3
//       .scaleLinear()
//       .range([height, 0])
//       .domain([0, d3.max(binsData, (d) => d.length)]);

//     const histogram = d3.bin().domain([0, 1]).thresholds(props.ticks);
//     const bins = histogram(binsData);

//     const xAxis = d3.axisBottom(x).tickFormat(d3.format(".0%"));
//     const yAxis = d3.axisLeft(y);

//     chart
//       .append("g")
//       .attr("transform", `translate(${margin.left}, ${margin.top})`);

//     chart.append("g")
//       .attr("transform", `translate(0,${height})`)
//       .call(xAxis)
//       .classed("d3-ticks", true)
//       .append("text")
//       .text(fieldName)
//       .classed("d3-label", true)
//       .attr("transform", `translate(${width / 2}, 50)`);

//     chart.append("g").call(yAxis).classed("d3-ticks", true);

//     chart
//       .append("g")
//       .attr("transform", `translate(-55, ${height / 2 + 35}) rotate(90)`)
//       .append("text")
//       .text("Amount of files")
//       .classed("d3-label", true);

//     if (binsData.length > 0) {
//       chart
//         .selectAll("rect")
//         .data(bins)
//         .enter()
//         .append("rect")
//         .attr("x", 0)
//         .attr(
//             "transform",
//             (d) => `translate(${x(d.x0 ?? 0)}, ${y(d.length)})`
//             )
//             .attr("width", (d) => Math.max(0, x(d.x1 ?? 0) - x(d.x0 ?? 0) - 1))
//             .attr("height", (d) => height - y(d.length))
//             .style("fill", (d) => props.calculateBinColor?.(d.x0 ?? 0, d.x1 ?? 1) ?? "#1976D2")
//             .style("cursor", "pointer")
//             .on("click", (_: MouseEvent, d) => {
//             const x0 = d.x0 ?? 0;
//             const x1 = d.x1 ?? 1;
//             // Replace with your actual routing logic
//             // router.push({ /* ... */ });
//         });
            
//         // Add hover line
//         const line = chart
//             .append("g")
//             .append("line")
//             .attr("x1", x(0.5))
//             .attr("y1", 0)
//             .attr("x2", x(0.5))
//             .attr("y2", height)
//             .attr("stroke", "black")
//             .attr("stroke-width", 1)
//             .attr("stroke-dasharray", "3,3")
//             .attr("pointer-events", "none")
//             .attr("z-index", 2)
//             .attr("visibility", "hidden");
    
//         const lineNumber = chart
//             .append("g")
//             .append("text")
//             .classed("d3-ticks", true)
//             .attr("x", x(0.5))
//             .attr("y", 0)
//             .attr("dy", "0.71em")
//             .attr("visibility", "hidden");
    
//         chart.on("mouseenter", () => {
//             line.attr("visibility", "visible");
//             lineNumber.attr("visibility", "visible");
//         });
    
//         chart.on("mousemove", (o) => {
//             const xCoord = d3.pointer(o)[0] - margin.left;
//             line.attr("x1", xCoord);
//             line.attr("x2", xCoord);
//             lineNumber.attr("x", xCoord + 8);
//             lineNumber.text(`${(x.invert(xCoord) * 100).toFixed(0)}%`);
    
//             if (xCoord < 0 || xCoord > width) {
//             line.attr("visibility", "hidden");
//             lineNumber.attr("visibility", "hidden");
//             } else {
//             line.attr("visibility", "visible");
//             lineNumber.attr("visibility", "visible");
//             }
//         });
    
//         chart.on("mouseleave", () => {
//             line.attr("visibility", "hidden");
//             lineNumber.attr("visibility", "hidden");
//         });
    
//         // Add line, if specified.
//         if (props.lineValue) {
//             chart
//             .select("g")
//             .append("line")
//             .attr("class", "line")
//             .attr("x1", x(props.lineValue))
//             .attr("y1", 0)
//             .attr("x2", x(props.lineValue))
//             .attr("y2", height)
//             .attr("stroke", "black")
//             .attr("stroke-width", 1)
//             .attr("pointer-events", "none")
//             .attr("z-index", 2);

//             if (props.lineText) {
//             chart
//                 .select("g")
//                 .append("text")
//                 .attr("class", "line-text")
//                 .classed("d3-ticks", true)
//                 .attr("x", x(props.lineValue))
//                 .attr("y", 0)
//                 .attr("dy", "0.71em")
//             }
//         }
//     }
//                 useEffect(() => {
//                     const handleResize = () => {
//                         const newSize = {
//                         width: histogramElement.current?.clientWidth || 0,
//                         height: histogramElement.current?.clientHeight || 0,
//                         };
//                         setSize(newSize);
//                     };
                
//                     window.addEventListener("resize", handleResize);
                
//                     return () => window.removeEventListener("resize", handleResize);
//                     }, []);
                
//                     useEffect(() => {
//                     if (histogramElement.current) {
//                         setChart(d3.select(histogramElement.current).append("svg"));
//                         drawHistogram();
//                     }
//                     }, [histogramElement.current, props]);
                
//                     return <div ref={histogramElement} />;
//                 };
//             };
// export default Histogram;