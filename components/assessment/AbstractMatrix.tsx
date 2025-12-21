'use client';

// Types for Abstract Reasoning Grid
export interface ShapeCell {
    type: 'square' | 'circle' | 'triangle' | 'diamond' | 'star' | 'hexagon';
    fill: 'solid' | 'outline' | 'striped';
    rotation: number; // degrees
    color: string;
    count: number; // number of shapes in this cell
}

interface AbstractMatrixProps {
    grid: (ShapeCell | null)[]; // 9 cells (3x3), last one is usually null (the question mark)
    size?: 'small' | 'medium' | 'large';
}

interface ShapeOptionProps {
    shape: ShapeCell;
    size?: number;
}

// Individual Shape Renderer
export function ShapeRenderer({ shape, size = 40 }: ShapeOptionProps) {
    const { type, fill, rotation, color, count } = shape;

    const renderShape = (index: number) => {
        const strokeWidth = fill === 'outline' ? 2 : 0;
        const fillColor = fill === 'solid' ? color : 'none';
        const stroke = color;

        // Striped pattern for striped fill
        const patternId = `stripe-${index}-${Math.random().toString(36).substr(2, 9)}`;
        const stripePattern = fill === 'striped' ? (
            <defs>
                <pattern id={patternId} patternUnits="userSpaceOnUse" width="4" height="4" patternTransform={`rotate(45)`}>
                    <line x1="0" y1="0" x2="0" y2="4" stroke={color} strokeWidth="2" />
                </pattern>
            </defs>
        ) : null;

        const actualFill = fill === 'striped' ? `url(#${patternId})` : fillColor;

        const shapeOffset = count > 1 ? (index - (count - 1) / 2) * 12 : 0;
        const center = size / 2;
        const shapeSize = size * 0.35;

        switch (type) {
            case 'square':
                return (
                    <g key={index} transform={`translate(${shapeOffset}, 0) rotate(${rotation}, ${center}, ${center})`}>
                        {stripePattern}
                        <rect
                            x={center - shapeSize / 2}
                            y={center - shapeSize / 2}
                            width={shapeSize}
                            height={shapeSize}
                            fill={actualFill}
                            stroke={stroke}
                            strokeWidth={strokeWidth}
                        />
                    </g>
                );
            case 'circle':
                return (
                    <g key={index} transform={`translate(${shapeOffset}, 0)`}>
                        {stripePattern}
                        <circle
                            cx={center}
                            cy={center}
                            r={shapeSize / 2}
                            fill={actualFill}
                            stroke={stroke}
                            strokeWidth={strokeWidth}
                        />
                    </g>
                );
            case 'triangle':
                const triPoints = `${center},${center - shapeSize / 2} ${center - shapeSize / 2},${center + shapeSize / 2} ${center + shapeSize / 2},${center + shapeSize / 2}`;
                return (
                    <g key={index} transform={`translate(${shapeOffset}, 0) rotate(${rotation}, ${center}, ${center})`}>
                        {stripePattern}
                        <polygon
                            points={triPoints}
                            fill={actualFill}
                            stroke={stroke}
                            strokeWidth={strokeWidth}
                        />
                    </g>
                );
            case 'diamond':
                const diamondPoints = `${center},${center - shapeSize / 2} ${center + shapeSize / 2},${center} ${center},${center + shapeSize / 2} ${center - shapeSize / 2},${center}`;
                return (
                    <g key={index} transform={`translate(${shapeOffset}, 0) rotate(${rotation}, ${center}, ${center})`}>
                        {stripePattern}
                        <polygon
                            points={diamondPoints}
                            fill={actualFill}
                            stroke={stroke}
                            strokeWidth={strokeWidth}
                        />
                    </g>
                );
            case 'star':
                // 5-pointed star
                const starPoints = generateStarPoints(center, center, 5, shapeSize / 2, shapeSize / 4);
                return (
                    <g key={index} transform={`translate(${shapeOffset}, 0) rotate(${rotation}, ${center}, ${center})`}>
                        {stripePattern}
                        <polygon
                            points={starPoints}
                            fill={actualFill}
                            stroke={stroke}
                            strokeWidth={strokeWidth}
                        />
                    </g>
                );
            case 'hexagon':
                const hexPoints = generateHexagonPoints(center, center, shapeSize / 2);
                return (
                    <g key={index} transform={`translate(${shapeOffset}, 0) rotate(${rotation}, ${center}, ${center})`}>
                        {stripePattern}
                        <polygon
                            points={hexPoints}
                            fill={actualFill}
                            stroke={stroke}
                            strokeWidth={strokeWidth}
                        />
                    </g>
                );
            default:
                return null;
        }
    };

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {Array.from({ length: count }, (_, i) => renderShape(i))}
        </svg>
    );
}

// Helper functions for complex shapes
function generateStarPoints(cx: number, cy: number, points: number, outerR: number, innerR: number): string {
    const coords: string[] = [];
    for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (Math.PI / points) * i - Math.PI / 2;
        coords.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    return coords.join(' ');
}

function generateHexagonPoints(cx: number, cy: number, r: number): string {
    const coords: string[] = [];
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        coords.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    return coords.join(' ');
}

// Main Abstract Matrix Component (3x3 grid)
export default function AbstractMatrix({ grid, size = 'medium' }: AbstractMatrixProps) {
    const cellSizes = {
        small: 60,
        medium: 90,
        large: 120
    };
    const cellSize = cellSizes[size];
    const gap = 8;
    const totalSize = cellSize * 3 + gap * 2;

    return (
        <div
            className="inline-grid grid-cols-3 bg-white rounded-xl border-2 border-gray-200 p-3"
            style={{ gap: `${gap}px` }}
        >
            {grid.map((cell, index) => (
                <div
                    key={index}
                    className={`flex items-center justify-center rounded-lg border-2 ${cell === null
                            ? 'border-dashed border-cevace-blue bg-cevace-blue/5'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                    style={{ width: cellSize, height: cellSize }}
                >
                    {cell === null ? (
                        <span className="text-2xl font-bold text-cevace-blue">?</span>
                    ) : (
                        <ShapeRenderer shape={cell} size={cellSize - 16} />
                    )}
                </div>
            ))}
        </div>
    );
}

// Small version for answer options
export function ShapeOption({ shape, selected, correct, showResult }: {
    shape: ShapeCell;
    selected: boolean;
    correct?: boolean;
    showResult: boolean;
}) {
    let borderClass = 'border-gray-200 hover:border-cevace-blue/50';
    let bgClass = 'bg-white';

    if (showResult) {
        if (correct) {
            borderClass = 'border-green-500';
            bgClass = 'bg-green-50';
        } else if (selected && !correct) {
            borderClass = 'border-red-500';
            bgClass = 'bg-red-50';
        }
    } else if (selected) {
        borderClass = 'border-cevace-blue';
        bgClass = 'bg-cevace-blue/5';
    }

    return (
        <div className={`p-3 rounded-xl border-2 transition-all ${borderClass} ${bgClass}`}>
            <ShapeRenderer shape={shape} size={50} />
        </div>
    );
}
