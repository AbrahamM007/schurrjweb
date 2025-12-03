import React from 'react';
import { Circle, RegularPolygon, Text, Group } from 'react-konva';

const RealTimeCursor = ({ x, y, color, name }) => {
    return (
        <Group x={x} y={y}>
            <RegularPolygon
                sides={3}
                radius={10}
                fill={color}
                rotation={150}
            />
            <Text
                x={15}
                y={5}
                text={name}
                fontSize={12}
                fill="white"
                padding={4}
                listening={false}
            />
            <Group x={12} y={2}>
                <RegularPolygon
                    sides={4} // Rectangle background for text
                    width={name.length * 8 + 10}
                    height={20}
                    fill={color}
                    cornerRadius={4}
                    opacity={0.8}
                    listening={false}
                    scaleX={name.length * 0.5} // Hacky background scaling
                />
            </Group>
        </Group>
    );
};

// Simplified version for Konva
const Cursor = ({ x, y, color, name }) => (
    <Group x={x} y={y} listening={false}>
        {/* Cursor Arrow */}
        <RegularPolygon
            sides={3}
            radius={8}
            fill={color}
            rotation={30}
            offsetY={-4}
            offsetX={-4}
        />
        {/* Name Tag */}
        <Group x={10} y={10}>
            <Text
                text={name}
                fontSize={12}
                fill="white"
                padding={5}
                opacity={1}
            />
        </Group>
    </Group>
);

export default Cursor;
