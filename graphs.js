/**
 * SVG Graph Generation Module
 * Creates interactive SVG graphs for data visualization
 */

/**
 * Create XP Progress Over Time Line Chart
 * @param {string} containerId - Container element ID
 * @param {Array} transactions - XP transaction data
 */
function createXPProgressGraph(containerId, transactions) {
    const container = document.getElementById(containerId);
    if (!container || !transactions || transactions.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No XP data available</p>';
        return;
    }
    
    // Prepare data - calculate cumulative XP
    let cumulativeXP = 0;
    const dataPoints = transactions.map(t => {
        cumulativeXP += t.amount;
        return {
            date: new Date(t.createdAt),
            xp: cumulativeXP,
            project: t.object?.name || 'Unknown',
            amount: t.amount
        };
    });
    
    // SVG dimensions
    const margin = { top: 20, right: 30, bottom: 60, left: 80 };
    const width = container.clientWidth;
    const height = 350;
    const graphWidth = width - margin.left - margin.right;
    const graphHeight = height - margin.top - margin.bottom;
    
    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    
    // Create scales
    const maxXP = Math.max(...dataPoints.map(d => d.xp));
    const minDate = dataPoints[0].date.getTime();
    const maxDate = dataPoints[dataPoints.length - 1].date.getTime();
    
    const xScale = (date) => {
        return margin.left + ((date.getTime() - minDate) / (maxDate - minDate)) * graphWidth;
    };
    
    const yScale = (xp) => {
        return height - margin.bottom - (xp / maxXP) * graphHeight;
    };
    
    // Create gradient
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'xpGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '0%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#667eea');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#764ba2');
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);
    
    // Draw grid lines
    const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gridGroup.setAttribute('class', 'grid');
    
    for (let i = 0; i <= 5; i++) {
        const y = height - margin.bottom - (i / 5) * graphHeight;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', margin.left);
        line.setAttribute('y1', y);
        line.setAttribute('x2', width - margin.right);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', 'var(--border-color)');
        line.setAttribute('stroke-width', '1');
        line.setAttribute('opacity', '0.3');
        gridGroup.appendChild(line);
    }
    svg.appendChild(gridGroup);
    
    // Draw axes
    const axisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Y-axis
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', margin.left);
    yAxis.setAttribute('y1', margin.top);
    yAxis.setAttribute('x2', margin.left);
    yAxis.setAttribute('y2', height - margin.bottom);
    yAxis.setAttribute('stroke', 'var(--text-muted)');
    yAxis.setAttribute('stroke-width', '2');
    axisGroup.appendChild(yAxis);
    
    // X-axis
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', margin.left);
    xAxis.setAttribute('y1', height - margin.bottom);
    xAxis.setAttribute('x2', width - margin.right);
    xAxis.setAttribute('y2', height - margin.bottom);
    xAxis.setAttribute('stroke', 'var(--text-muted)');
    xAxis.setAttribute('stroke-width', '2');
    axisGroup.appendChild(xAxis);
    
    svg.appendChild(axisGroup);
    
    // Y-axis labels
    const yLabelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    for (let i = 0; i <= 5; i++) {
        const value = (i / 5) * maxXP;
        const y = height - margin.bottom - (i / 5) * graphHeight;
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', margin.left - 10);
        text.setAttribute('y', y);
        text.setAttribute('text-anchor', 'end');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('fill', 'var(--text-muted)');
        text.setAttribute('font-size', '12');
        text.textContent = formatNumber(value);
        yLabelGroup.appendChild(text);
    }
    svg.appendChild(yLabelGroup);
    
    // X-axis labels (dates)
    const xLabelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const numXLabels = Math.min(5, dataPoints.length);
    for (let i = 0; i < numXLabels; i++) {
        const index = Math.floor(i * (dataPoints.length - 1) / (numXLabels - 1));
        const point = dataPoints[index];
        const x = xScale(point.date);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', height - margin.bottom + 20);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', 'var(--text-muted)');
        text.setAttribute('font-size', '12');
        text.textContent = formatDate(point.date);
        xLabelGroup.appendChild(text);
    }
    svg.appendChild(xLabelGroup);
    
    // Draw area under line
    const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let areaD = `M ${margin.left} ${height - margin.bottom}`;
    dataPoints.forEach(point => {
        areaD += ` L ${xScale(point.date)} ${yScale(point.xp)}`;
    });
    areaD += ` L ${xScale(dataPoints[dataPoints.length - 1].date)} ${height - margin.bottom} Z`;
    areaPath.setAttribute('d', areaD);
    areaPath.setAttribute('fill', 'url(#xpGradient)');
    areaPath.setAttribute('opacity', '0.2');
    svg.appendChild(areaPath);
    
    // Draw line
    const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let lineD = `M ${xScale(dataPoints[0].date)} ${yScale(dataPoints[0].xp)}`;
    dataPoints.slice(1).forEach(point => {
        lineD += ` L ${xScale(point.date)} ${yScale(point.xp)}`;
    });
    linePath.setAttribute('d', lineD);
    linePath.setAttribute('stroke', 'url(#xpGradient)');
    linePath.setAttribute('stroke-width', '3');
    linePath.setAttribute('fill', 'none');
    linePath.setAttribute('stroke-linecap', 'round');
    linePath.setAttribute('stroke-linejoin', 'round');
    
    // Animate line drawing
    const length = linePath.getTotalLength();
    linePath.style.strokeDasharray = length;
    linePath.style.strokeDashoffset = length;
    linePath.style.animation = 'drawLine 2s ease-out forwards';
    
    svg.appendChild(linePath);
    
    // Add points with tooltips
    const pointsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    dataPoints.forEach((point, index) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', xScale(point.date));
        circle.setAttribute('cy', yScale(point.xp));
        circle.setAttribute('r', '4');
        circle.setAttribute('fill', '#667eea');
        circle.setAttribute('stroke', 'white');
        circle.setAttribute('stroke-width', '2');
        circle.style.cursor = 'pointer';
        circle.style.opacity = '0';
        circle.style.animation = `fadeIn 0.5s ease-out ${index * 0.01}s forwards`;
        
        // Tooltip
        circle.addEventListener('mouseenter', (e) => {
            showTooltip(e, `
                <div class="tooltip-title">${point.project}</div>
                <div class="tooltip-value">XP: ${formatNumber(point.xp)}</div>
                <div class="tooltip-value">Gained: +${formatNumber(point.amount)}</div>
                <div class="tooltip-value">${formatDate(point.date)}</div>
            `);
        });
        circle.addEventListener('mouseleave', hideTooltip);
        
        pointsGroup.appendChild(circle);
    });
    svg.appendChild(pointsGroup);
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes drawLine {
            to {
                stroke-dashoffset: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    container.innerHTML = '';
    container.appendChild(svg);
}

/**
 * Create XP by Project Bar Chart
 * @param {string} containerId - Container element ID
 * @param {Array} transactions - XP transaction data
 */
function createXPByProjectGraph(containerId, transactions) {
    const container = document.getElementById(containerId);
    if (!container || !transactions || transactions.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No project data available</p>';
        return;
    }
    
    // Aggregate XP by project
    const projectXP = {};
    transactions.forEach(t => {
        const projectName = t.object?.name || 'Unknown';
        projectXP[projectName] = (projectXP[projectName] || 0) + t.amount;
    });
    
    // Sort and get top 15 projects
    const sortedProjects = Object.entries(projectXP)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);
    
    if (sortedProjects.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No project data available</p>';
        return;
    }
    
    // SVG dimensions
    const margin = { top: 20, right: 30, bottom: 120, left: 80 };
    const width = container.clientWidth;
    const height = 350;
    const graphWidth = width - margin.left - margin.right;
    const graphHeight = height - margin.top - margin.bottom;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    
    const maxXP = Math.max(...sortedProjects.map(p => p[1]));
    const barWidth = graphWidth / sortedProjects.length - 10;
    
    // Draw bars
    sortedProjects.forEach((project, index) => {
        const [name, xp] = project;
        const x = margin.left + index * (graphWidth / sortedProjects.length) + 5;
        const barHeight = (xp / maxXP) * graphHeight;
        const y = height - margin.bottom - barHeight;
        
        // Bar
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', height - margin.bottom);
        rect.setAttribute('width', barWidth);
        rect.setAttribute('height', '0');
        rect.setAttribute('fill', getBarColor(xp, maxXP));
        rect.setAttribute('rx', '4');
        rect.style.cursor = 'pointer';
        rect.style.transition = 'all 0.3s';
        
        // Animate bar height
        setTimeout(() => {
            rect.setAttribute('y', y);
            rect.setAttribute('height', barHeight);
        }, index * 50);
        
        // Hover effect
        rect.addEventListener('mouseenter', (e) => {
            rect.setAttribute('opacity', '0.8');
            showTooltip(e, `
                <div class="tooltip-title">${truncateText(name, 30)}</div>
                <div class="tooltip-value">XP: ${formatNumber(xp)}</div>
            `);
        });
        rect.addEventListener('mouseleave', () => {
            rect.setAttribute('opacity', '1');
            hideTooltip();
        });
        
        svg.appendChild(rect);
        
        // Project label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x + barWidth / 2);
        text.setAttribute('y', height - margin.bottom + 15);
        text.setAttribute('text-anchor', 'end');
        text.setAttribute('transform', `rotate(-45, ${x + barWidth / 2}, ${height - margin.bottom + 15})`);
        text.setAttribute('fill', 'var(--text-muted)');
        text.setAttribute('font-size', '11');
        text.textContent = truncateText(name, 20);
        svg.appendChild(text);
    });
    
    // Y-axis
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', margin.left);
    yAxis.setAttribute('y1', margin.top);
    yAxis.setAttribute('x2', margin.left);
    yAxis.setAttribute('y2', height - margin.bottom);
    yAxis.setAttribute('stroke', 'var(--text-muted)');
    yAxis.setAttribute('stroke-width', '2');
    svg.appendChild(yAxis);
    
    // X-axis
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', margin.left);
    xAxis.setAttribute('y1', height - margin.bottom);
    xAxis.setAttribute('x2', width - margin.right);
    xAxis.setAttribute('y2', height - margin.bottom);
    xAxis.setAttribute('stroke', 'var(--text-muted)');
    xAxis.setAttribute('stroke-width', '2');
    svg.appendChild(xAxis);
    
    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
        const value = (i / 5) * maxXP;
        const y = height - margin.bottom - (i / 5) * graphHeight;
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', margin.left - 10);
        text.setAttribute('y', y);
        text.setAttribute('text-anchor', 'end');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('fill', 'var(--text-muted)');
        text.setAttribute('font-size', '12');
        text.textContent = formatNumber(value);
        svg.appendChild(text);
    }
    
    container.innerHTML = '';
    container.appendChild(svg);
}

/**
 * Create Audit Ratio Pie Chart
 * @param {string} containerId - Container element ID
 * @param {object} auditData - Audit data with totalUp and totalDown
 */
function createAuditRatioGraph(containerId, auditData) {
    const container = document.getElementById(containerId);
    if (!container || !auditData) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No audit data available</p>';
        return;
    }
    
    const totalUp = auditData.totalUp || 0;
    const totalDown = auditData.totalDown || 0;
    const total = totalUp + totalDown;
    
    if (total === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No audit data available</p>';
        return;
    }
    
    const width = container.clientWidth;
    const height = 300;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;
    const innerRadius = radius * 0.6; // Donut chart
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    
    // Calculate angles
    const upAngle = (totalUp / total) * 360;
    const downAngle = (totalDown / total) * 360;
    
    // Create slices
    const slices = [
        { label: 'Audits Done', value: totalUp, angle: upAngle, color: '#48bb78', startAngle: 0 },
        { label: 'Audits Received', value: totalDown, angle: downAngle, color: '#667eea', startAngle: upAngle }
    ];
    
    let currentAngle = -90; // Start from top
    
    slices.forEach((slice, index) => {
        if (slice.value > 0) {
            const path = createDonutSlice(centerX, centerY, radius, innerRadius, currentAngle, currentAngle + slice.angle);
            path.setAttribute('fill', slice.color);
            path.style.cursor = 'pointer';
            path.style.transition = 'all 0.3s';
            path.style.opacity = '0';
            path.style.animation = `fadeIn 0.5s ease-out ${index * 0.2}s forwards`;
            
            path.addEventListener('mouseenter', (e) => {
                path.setAttribute('opacity', '0.8');
                const percentage = ((slice.value / total) * 100).toFixed(1);
                showTooltip(e, `
                    <div class="tooltip-title">${slice.label}</div>
                    <div class="tooltip-value">${formatBytes(slice.value)}</div>
                    <div class="tooltip-value">${percentage}%</div>
                `);
            });
            path.addEventListener('mouseleave', () => {
                path.setAttribute('opacity', '1');
                hideTooltip();
            });
            
            svg.appendChild(path);
            currentAngle += slice.angle;
        }
    });
    
    // Center text
    const ratio = auditData.auditRatio || 0;
    const ratioText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    ratioText.setAttribute('x', centerX);
    ratioText.setAttribute('y', centerY - 10);
    ratioText.setAttribute('text-anchor', 'middle');
    ratioText.setAttribute('font-size', '32');
    ratioText.setAttribute('font-weight', 'bold');
    ratioText.setAttribute('fill', 'var(--text-primary)');
    ratioText.textContent = ratio.toFixed(2);
    svg.appendChild(ratioText);
    
    const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labelText.setAttribute('x', centerX);
    labelText.setAttribute('y', centerY + 15);
    labelText.setAttribute('text-anchor', 'middle');
    labelText.setAttribute('font-size', '14');
    labelText.setAttribute('fill', 'var(--text-muted)');
    labelText.textContent = 'Ratio';
    svg.appendChild(labelText);
    
    // Legend
    const legendY = height - 40;
    slices.forEach((slice, index) => {
        const legendX = width / 2 - 100 + index * 120;
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', legendX);
        rect.setAttribute('y', legendY);
        rect.setAttribute('width', '15');
        rect.setAttribute('height', '15');
        rect.setAttribute('fill', slice.color);
        rect.setAttribute('rx', '3');
        svg.appendChild(rect);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', legendX + 20);
        text.setAttribute('y', legendY + 12);
        text.setAttribute('font-size', '12');
        text.setAttribute('fill', 'var(--text-muted)');
        text.textContent = slice.label.split(' ')[1];
        svg.appendChild(text);
    });
    
    container.innerHTML = '';
    container.appendChild(svg);
}

/**
 * Create Pass/Fail Ratio Pie Chart
 * @param {string} containerId - Container element ID
 * @param {Array} results - Project results data
 */
function createPassFailGraph(containerId, results) {
    const container = document.getElementById(containerId);
    if (!container || !results || results.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No results data available</p>';
        return;
    }
    
    // Count pass/fail
    let passCount = 0;
    let failCount = 0;
    
    results.forEach(result => {
        if (result.grade !== null && result.grade !== undefined) {
            if (result.grade >= 1) {
                passCount++;
            } else {
                failCount++;
            }
        }
    });
    
    const total = passCount + failCount;
    
    if (total === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No results data available</p>';
        return;
    }
    
    const width = container.clientWidth;
    const height = 300;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    
    // Calculate angles
    const passAngle = (passCount / total) * 360;
    const failAngle = (failCount / total) * 360;
    
    // Create slices
    const slices = [
        { label: 'Pass', value: passCount, angle: passAngle, color: '#48bb78', startAngle: 0 },
        { label: 'Fail', value: failCount, angle: failAngle, color: '#f56565', startAngle: passAngle }
    ];
    
    let currentAngle = -90;
    
    slices.forEach((slice, index) => {
        if (slice.value > 0) {
            const path = createPieSlice(centerX, centerY, radius, currentAngle, currentAngle + slice.angle);
            path.setAttribute('fill', slice.color);
            path.style.cursor = 'pointer';
            path.style.transition = 'all 0.3s';
            path.style.opacity = '0';
            path.style.animation = `fadeIn 0.5s ease-out ${index * 0.2}s forwards`;
            
            path.addEventListener('mouseenter', (e) => {
                path.setAttribute('opacity', '0.8');
                const percentage = ((slice.value / total) * 100).toFixed(1);
                showTooltip(e, `
                    <div class="tooltip-title">${slice.label}</div>
                    <div class="tooltip-value">Count: ${slice.value}</div>
                    <div class="tooltip-value">${percentage}%</div>
                `);
            });
            path.addEventListener('mouseleave', () => {
                path.setAttribute('opacity', '1');
                hideTooltip();
            });
            
            svg.appendChild(path);
            currentAngle += slice.angle;
        }
    });
    
    // Center text
    const percentage = ((passCount / total) * 100).toFixed(1);
    const percentText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    percentText.setAttribute('x', centerX);
    percentText.setAttribute('y', centerY - 10);
    percentText.setAttribute('text-anchor', 'middle');
    percentText.setAttribute('font-size', '32');
    percentText.setAttribute('font-weight', 'bold');
    percentText.setAttribute('fill', 'var(--text-primary)');
    percentText.textContent = `${percentage}%`;
    svg.appendChild(percentText);
    
    const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    labelText.setAttribute('x', centerX);
    labelText.setAttribute('y', centerY + 15);
    labelText.setAttribute('text-anchor', 'middle');
    labelText.setAttribute('font-size', '14');
    labelText.setAttribute('fill', 'var(--text-muted)');
    labelText.textContent = 'Success Rate';
    svg.appendChild(labelText);
    
    // Legend
    const legendY = height - 40;
    slices.forEach((slice, index) => {
        const legendX = width / 2 - 80 + index * 100;
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', legendX);
        rect.setAttribute('y', legendY);
        rect.setAttribute('width', '15');
        rect.setAttribute('height', '15');
        rect.setAttribute('fill', slice.color);
        rect.setAttribute('rx', '3');
        svg.appendChild(rect);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', legendX + 20);
        text.setAttribute('y', legendY + 12);
        text.setAttribute('font-size', '12');
        text.setAttribute('fill', 'var(--text-muted)');
        text.textContent = `${slice.label} (${slice.value})`;
        svg.appendChild(text);
    });
    
    container.innerHTML = '';
    container.appendChild(svg);
}

// Helper Functions

/**
 * Create a pie slice path
 */
function createPieSlice(cx, cy, radius, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, radius, endAngle);
    const end = polarToCartesian(cx, cy, radius, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
    
    const d = [
        'M', cx, cy,
        'L', start.x, start.y,
        'A', radius, radius, 0, largeArc, 0, end.x, end.y,
        'Z'
    ].join(' ');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    return path;
}

/**
 * Create a donut slice path
 */
function createDonutSlice(cx, cy, radius, innerRadius, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, radius, endAngle);
    const end = polarToCartesian(cx, cy, radius, startAngle);
    const innerStart = polarToCartesian(cx, cy, innerRadius, endAngle);
    const innerEnd = polarToCartesian(cx, cy, innerRadius, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
    
    const d = [
        'M', start.x, start.y,
        'A', radius, radius, 0, largeArc, 0, end.x, end.y,
        'L', innerEnd.x, innerEnd.y,
        'A', innerRadius, innerRadius, 0, largeArc, 1, innerStart.x, innerStart.y,
        'Z'
    ].join(' ');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    return path;
}

/**
 * Convert polar coordinates to cartesian
 */
function polarToCartesian(cx, cy, radius, angle) {
    const angleRad = (angle - 90) * Math.PI / 180;
    return {
        x: cx + radius * Math.cos(angleRad),
        y: cy + radius * Math.sin(angleRad)
    };
}

/**
 * Get bar color based on value
 */
function getBarColor(value, maxValue) {
    const ratio = value / maxValue;
    if (ratio > 0.7) return '#48bb78';
    if (ratio > 0.4) return '#667eea';
    if (ratio > 0.2) return '#ed8936';
    return '#f56565';
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return Math.round(num).toLocaleString();
}

/**
 * Format bytes to readable format
 */
function formatBytes(bytes) {
    if (bytes >= 1000000) {
        return (bytes / 1000000).toFixed(1) + ' MB';
    }
    if (bytes >= 1000) {
        return (bytes / 1000).toFixed(1) + ' KB';
    }
    return bytes + ' B';
}

/**
 * Format date
 */
function formatDate(date) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Truncate text
 */
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Show tooltip
 */
function showTooltip(event, content) {
    let tooltip = document.querySelector('.tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        document.body.appendChild(tooltip);
    }
    
    tooltip.innerHTML = content;
    tooltip.classList.add('show');
    
    const rect = event.target.getBoundingClientRect();
    tooltip.style.left = (rect.left + rect.width / 2) + 'px';
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
}

/**
 * Hide tooltip
 */
function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.classList.remove('show');
    }
}

// Export functions
window.Graphs = {
    createXPProgressGraph,
    createXPByProjectGraph,
    createAuditRatioGraph,
    createPassFailGraph
};
