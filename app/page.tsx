'use client';
import React, {useRef, useState, useEffect} from 'react';
import {Brush, Eraser, Square, Circle, Minus, RotateCcw, Download, Palette, ArrowUpDown} from 'lucide-react';

type Tool = 'brush' | 'eraser' | 'rectangle' | 'circle' | 'line';

interface Position {
    x: number;
    y: number;
}

const colors: string[] = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB',
    '#A52A2A', '#808080', '#000080', '#008000', '#FF69B4', '#87CEEB'
];

export default function WhiteboardApp() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [tool, setTool] = useState<Tool>('brush');
    const [brushSize, setBrushSize] = useState<number>(5);
    const [color, setColor] = useState<string>('#000000');
    const [startPos, setStartPos] = useState<Position>({x: 0, y: 0});
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.parentElement!.parentElement!.offsetHeight - 32; // Adjust height based on parent container

        // Set default styles
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, [isCollapsed]);

    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Position => {
        const canvas = canvasRef.current;
        if (!canvas) return {x: 0, y: 0};

        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>): Position => {
        const canvas = canvasRef.current;
        if (!canvas) return {x: 0, y: 0};

        const rect = canvas.getBoundingClientRect();
        return {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): void => {
        e.preventDefault();
        setIsDrawing(true);
        const pos = e.type.includes('touch')
            ? getTouchPos(e as React.TouchEvent<HTMLCanvasElement>)
            : getMousePos(e as React.MouseEvent<HTMLCanvasElement>);
        setStartPos(pos);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (tool === 'brush') {
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): void => {
        e.preventDefault();
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const pos = e.type.includes('touch')
            ? getTouchPos(e as React.TouchEvent<HTMLCanvasElement>)
            : getMousePos(e as React.MouseEvent<HTMLCanvasElement>);

        ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;

        if (tool === 'brush' || tool === 'eraser') {
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        }
    };

    const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): void => {
        e.preventDefault();
        if (!isDrawing) return;
        setIsDrawing(false);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const pos = e.type.includes('touch')
            ? getTouchPos(e as React.TouchEvent<HTMLCanvasElement>)
            : getMousePos(e as React.MouseEvent<HTMLCanvasElement>);

        if (tool === 'rectangle') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = color;
            ctx.lineWidth = brushSize;
            ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
        } else if (tool === 'circle') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = color;
            ctx.lineWidth = brushSize;
            const radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
            ctx.beginPath();
            ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (tool === 'line') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = color;
            ctx.lineWidth = brushSize;
            ctx.beginPath();
            ctx.moveTo(startPos.x, startPos.y);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        }
    };

    const clearCanvas = (): void => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const downloadCanvas = (): void => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = 'whiteboard-drawing.png';
        link.href = canvas.toDataURL();
        link.click();
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-lg px-4 py-2 border-b">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                    {/* Drawing Tools */}
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg" hidden={isCollapsed}>
                        <button
                            onClick={() => setTool('brush')}
                            className={`p-2 rounded-md transition-colors ${
                                tool === 'brush' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Brush size={20}/>
                        </button>
                        <button
                            onClick={() => setTool('eraser')}
                            className={`p-2 rounded-md transition-colors ${
                                tool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Eraser size={20}/>
                        </button>
                        <button
                            onClick={() => setTool('rectangle')}
                            className={`p-2 rounded-md transition-colors ${
                                tool === 'rectangle' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Square size={20}/>
                        </button>
                        <button
                            onClick={() => setTool('circle')}
                            className={`p-2 rounded-md transition-colors ${
                                tool === 'circle' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Circle size={20}/>
                        </button>
                        <button
                            onClick={() => setTool('line')}
                            className={`p-2 rounded-md transition-colors ${
                                tool === 'line' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Minus size={20}/>
                        </button>
                    </div>

                    {/* Brush Size */}
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg" hidden={isCollapsed}>
                        <span className="text-sm text-gray-600">Size:</span>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={brushSize}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBrushSize(Number(e.target.value))}
                            className="w-20"
                        />
                        <span className="text-sm text-gray-600 w-8">{brushSize}</span>
                    </div>

                    {/* Color Picker */}
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                        <Palette size={20} className="text-gray-600"/>
                        <input
                            type="color"
                            value={color}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setColor(e.target.value)}
                            className="w-8 h-8 border-none rounded cursor-pointer"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                        <button onClick={() => setIsCollapsed(prevState => !prevState)}
                                className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                            <ArrowUpDown size={20}/>
                        </button>
                        <button
                            onClick={clearCanvas}
                            className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        >
                            <RotateCcw size={20}/>
                        </button>
                        <button
                            onClick={downloadCanvas}
                            className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                        >
                            <Download size={20}/>
                        </button>
                    </div>
                </div>

                {/* Color Palette */}
                <div className="flex flex-wrap justify-center gap-2 mt-4" hidden={isCollapsed}>
                    {colors.map((c: string) => (
                        <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                                color === c ? 'border-gray-800 scale-110' : 'border-gray-300'
                            }`}
                            style={{backgroundColor: c}}
                        />
                    ))}
                </div>
            </header>

            {/* Canvas */}
            <main className="flex-1 p-4">
                <div className="bg-white rounded-lg shadow-lg h-full">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full cursor-crosshair rounded-lg"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        style={{touchAction: 'none'}}
                    />
                </div>
            </main>
        </div>
    );
}