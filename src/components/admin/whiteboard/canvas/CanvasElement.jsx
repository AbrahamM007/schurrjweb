import React, { useState, useRef, useEffect } from 'react';
import { Rect, Text, Group, Circle, Transformer, Image as KonvaImage, Arrow } from 'react-konva';
import { Html } from 'react-konva-utils';
import useImage from 'use-image';

const URLImage = ({ src, width, height }) => {
    const [image] = useImage(src);
    return <KonvaImage image={image} width={width} height={height} />;
};

const CanvasElement = ({ shapeProps, isSelected, onSelect, onChange, onDuplicate }) => {
    const shapeRef = useRef();
    const trRef = useRef();
    const [isEditing, setIsEditing] = useState(false);
    const [isDraggingWithAlt, setIsDraggingWithAlt] = useState(false);

    useEffect(() => {
        if (isSelected && trRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    const handleDblClick = () => {
        if (shapeProps.locked) return;
        if (shapeProps.type === 'text' || shapeProps.type === 'sticky') {
            setIsEditing(true);
        }
    };

    const isDraggable = !shapeProps.locked;

    const handleTextChange = (e) => {
        onChange({
            ...shapeProps,
            content: e.target.value
        });
    };

    const handleBlur = () => {
        setIsEditing(false);
    };

    // Sticky Note
    if (shapeProps.type === 'sticky') {
        return (
            <React.Fragment>
                <Group
                    id={shapeProps.id}
                    x={shapeProps.x}
                    y={shapeProps.y}
                    draggable
                    onClick={onSelect}
                    onTap={onSelect}
                    onDragStart={(e) => {
                        if (e.evt.altKey) {
                            setIsDraggingWithAlt(true);
                        }
                    }}
                    onDragEnd={(e) => {
                        if (isDraggingWithAlt && onDuplicate) {
                            onDuplicate({
                                ...shapeProps,
                                x: e.target.x(),
                                y: e.target.y(),
                            });
                            setIsDraggingWithAlt(false);
                            // Reset position to original
                            e.target.x(shapeProps.x);
                            e.target.y(shapeProps.y);
                        } else {
                            onChange({
                                ...shapeProps,
                                x: e.target.x(),
                                y: e.target.y(),
                            });
                        }
                    }}
                    onDblClick={handleDblClick}
                    ref={shapeRef}
                >
                    <Rect
                        width={shapeProps.width || 200}
                        height={shapeProps.height || 200}
                        fill={shapeProps.fill || '#fff740'}
                        shadowColor="black"
                        shadowBlur={10}
                        shadowOpacity={0.1}
                        shadowOffsetX={5}
                        shadowOffsetY={5}
                    />
                    {!isEditing && (
                        <Text
                            x={10}
                            y={10}
                            width={(shapeProps.width || 200) - 20}
                            height={(shapeProps.height || 200) - 20}
                            text={shapeProps.content || 'New Sticky'}
                            fontSize={16}
                            fontFamily="Inter, sans-serif"
                            fill="#333"
                            wrap="word"
                        />
                    )}
                    {isEditing && (
                        <Html divProps={{ style: { opacity: 1 } }}>
                            <textarea
                                value={shapeProps.content}
                                onChange={handleTextChange}
                                onBlur={handleBlur}
                                autoFocus
                                style={{
                                    width: `${(shapeProps.width || 200) - 20}px`,
                                    height: `${(shapeProps.height || 200) - 20}px`,
                                    position: 'absolute',
                                    top: '10px',
                                    left: '10px',
                                    border: 'none',
                                    padding: '0',
                                    margin: '0',
                                    background: 'transparent',
                                    resize: 'none',
                                    outline: 'none',
                                    fontSize: '16px',
                                    fontFamily: 'Inter, sans-serif',
                                    color: '#333'
                                }}
                            />
                        </Html>
                    )}
                </Group>
                {isSelected && (
                    <Transformer
                        ref={trRef}
                        boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < 50 || newBox.height < 50) {
                                return oldBox;
                            }
                            return newBox;
                        }}
                    />
                )}
            </React.Fragment>
        );
    }

    // Text
    if (shapeProps.type === 'text') {
        return (
            <React.Fragment>
                <Group
                    id={shapeProps.id}
                    x={shapeProps.x}
                    y={shapeProps.y}
                    draggable
                    onClick={onSelect}
                    onTap={onSelect}
                    onDragStart={(e) => {
                        if (e.evt.altKey) {
                            setIsDraggingWithAlt(true);
                        }
                    }}
                    onDragEnd={(e) => {
                        if (isDraggingWithAlt && onDuplicate) {
                            onDuplicate({
                                ...shapeProps,
                                x: e.target.x(),
                                y: e.target.y(),
                            });
                            setIsDraggingWithAlt(false);
                            e.target.x(shapeProps.x);
                            e.target.y(shapeProps.y);
                        } else {
                            onChange({
                                ...shapeProps,
                                x: e.target.x(),
                                y: e.target.y(),
                            });
                        }
                    }}
                    onDblClick={handleDblClick}
                    ref={shapeRef}
                >
                    {!isEditing && (
                        <Text
                            text={shapeProps.content || 'Text'}
                            fontSize={shapeProps.fontSize || 24}
                            fontFamily="Inter, sans-serif"
                            fill={shapeProps.fill || '#fff'}
                            fontStyle={shapeProps.fontStyle || 'normal'}
                            fontVariant={shapeProps.fontWeight === 'bold' ? 'bold' : 'normal'}
                            align={shapeProps.align || 'left'}
                            lineHeight={shapeProps.lineHeight || 1.2}
                            letterSpacing={shapeProps.letterSpacing || 0}
                            width={shapeProps.width || 200}
                        />
                    )}
                    {isEditing && (
                        <Html>
                            <textarea
                                value={shapeProps.content}
                                onChange={handleTextChange}
                                onBlur={handleBlur}
                                autoFocus
                                style={{
                                    position: 'absolute',
                                    top: '-5px',
                                    left: '-5px',
                                    border: 'none',
                                    padding: '0',
                                    margin: '0',
                                    background: 'transparent',
                                    resize: 'none',
                                    outline: 'none',
                                    fontSize: `${shapeProps.fontSize || 24}px`,
                                    fontFamily: 'Inter, sans-serif',
                                    color: shapeProps.fill || '#fff',
                                    fontWeight: shapeProps.fontWeight || 'normal',
                                    fontStyle: shapeProps.fontStyle || 'normal',
                                    textAlign: shapeProps.align || 'left',
                                    lineHeight: shapeProps.lineHeight || 1.2,
                                    letterSpacing: `${shapeProps.letterSpacing || 0}px`,
                                    minWidth: shapeProps.width || '200px',
                                    width: shapeProps.width || '200px'
                                }}
                            />
                        </Html>
                    )}
                </Group>
                {isSelected && (
                    <Transformer
                        ref={trRef}
                        enabledAnchors={['middle-left', 'middle-right']}
                        boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < 20) {
                                return oldBox;
                            }
                            return newBox;
                        }}
                    />
                )}
            </React.Fragment>
        );
    }

    // Image
    if (shapeProps.type === 'image') {
        return (
            <React.Fragment>
                <Group
                    id={shapeProps.id}
                    x={shapeProps.x}
                    y={shapeProps.y}
                    draggable
                    onClick={onSelect}
                    onTap={onSelect}
                    onDragStart={(e) => {
                        if (e.evt.altKey) {
                            setIsDraggingWithAlt(true);
                        }
                    }}
                    onDragEnd={(e) => {
                        if (isDraggingWithAlt && onDuplicate) {
                            onDuplicate({
                                ...shapeProps,
                                x: e.target.x(),
                                y: e.target.y(),
                            });
                            setIsDraggingWithAlt(false);
                            e.target.x(shapeProps.x);
                            e.target.y(shapeProps.y);
                        } else {
                            onChange({
                                ...shapeProps,
                                x: e.target.x(),
                                y: e.target.y(),
                            });
                        }
                    }}
                    ref={shapeRef}
                >
                    <URLImage src={shapeProps.src} width={shapeProps.width} height={shapeProps.height} />
                </Group>
                {isSelected && (
                    <Transformer
                        ref={trRef}
                        boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                            }
                            return newBox;
                        }}
                    />
                )}
            </React.Fragment>
        );
    }

    // Rectangle
    if (shapeProps.type === 'rect') {
        return (
            <React.Fragment>
                <Rect
                    onClick={onSelect}
                    onTap={onSelect}
                    ref={shapeRef}
                    {...shapeProps}
                    draggable={isDraggable}
                    onDragStart={(e) => {
                        if (e.evt.altKey) {
                            setIsDraggingWithAlt(true);
                        }
                    }}
                    onDragEnd={(e) => {
                        if (isDraggingWithAlt && onDuplicate) {
                            onDuplicate({
                                ...shapeProps,
                                x: e.target.x(),
                                y: e.target.y(),
                            });
                            setIsDraggingWithAlt(false);
                            e.target.x(shapeProps.x);
                            e.target.y(shapeProps.y);
                        } else {
                            onChange({
                                ...shapeProps,
                                x: e.target.x(),
                                y: e.target.y(),
                            });
                        }
                    }}
                    onTransformEnd={(e) => {
                        const node = shapeRef.current;
                        const scaleX = node.scaleX();
                        const scaleY = node.scaleY();

                        node.scaleX(1);
                        node.scaleY(1);
                        onChange({
                            ...shapeProps,
                            x: node.x(),
                            y: node.y(),
                            width: Math.max(5, node.width() * scaleX),
                            height: Math.max(node.height() * scaleY),
                        });
                    }}
                />
                {isSelected && (
                    <Transformer
                        ref={trRef}
                        boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                            }
                            return newBox;
                        }}
                    />
                )}
            </React.Fragment>
        );
    }

    // Arrow
    if (shapeProps.type === 'arrow') {
        return (
            <React.Fragment>
                <Arrow
                    points={shapeProps.points}
                    stroke={shapeProps.stroke || "#000"}
                    strokeWidth={2}
                    fill={shapeProps.stroke || "#000"}
                    draggable
                    onClick={onSelect}
                    onTap={onSelect}
                    onDragStart={(e) => {
                        if (e.evt.altKey) {
                            setIsDraggingWithAlt(true);
                        }
                    }}
                    onDragEnd={(e) => {
                        if (isDraggingWithAlt && onDuplicate) {
                            onDuplicate({
                                ...shapeProps,
                                x: e.target.x(),
                                y: e.target.y(),
                            });
                            setIsDraggingWithAlt(false);
                            e.target.x(shapeProps.x);
                            e.target.y(shapeProps.y);
                        } else {
                            onChange({
                                ...shapeProps,
                                x: e.target.x(),
                                y: e.target.y(),
                            });
                        }
                    }}
                    ref={shapeRef}
                />
                {isSelected && (
                    <Transformer
                        ref={trRef}
                        boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                            }
                            return newBox;
                        }}
                    />
                )}
            </React.Fragment>
        );
    }

    // Circle
    if (shapeProps.type === 'circle') {
        return (
            <React.Fragment>
                <Circle
                    onClick={onSelect}
                    onTap={onSelect}
                    ref={shapeRef}
                    {...shapeProps}
                    draggable={isDraggable}
                    onDragStart={(e) => {
                        if (e.evt.altKey) {
                            setIsDraggingWithAlt(true);
                        }
                    }}
                    onDragEnd={(e) => {
                        if (isDraggingWithAlt && onDuplicate) {
                            onDuplicate({
                                ...shapeProps,
                                x: e.target.x(),
                                y: e.target.y(),
                            });
                            setIsDraggingWithAlt(false);
                            e.target.x(shapeProps.x);
                            e.target.y(shapeProps.y);
                        } else {
                            onChange({
                                ...shapeProps,
                                x: e.target.x(),
                                y: e.target.y(),
                            });
                        }
                    }}
                    onTransformEnd={(e) => {
                        const node = shapeRef.current;
                        const scaleX = node.scaleX();

                        node.scaleX(1);
                        node.scaleY(1);
                        onChange({
                            ...shapeProps,
                            x: node.x(),
                            y: node.y(),
                            radius: Math.max(5, node.radius() * scaleX),
                        });
                    }}
                />
                {isSelected && (
                    <Transformer
                        ref={trRef}
                        boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                            }
                            return newBox;
                        }}
                    />
                )}
            </React.Fragment>
        );
    }

    return null;
};

export default CanvasElement;
