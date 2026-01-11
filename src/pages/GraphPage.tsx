import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    Pause,
    RotateCcw,
    ChevronLeft,
    Info,
    Trash2,
    Plus,
    MousePointer,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Node {
    id: number;
    x: number;
    y: number;
    state: 'default' | 'visiting' | 'visited' | 'path' | 'start' | 'end';
    distance?: number;
}

interface Edge {
    from: number;
    to: number;
    weight: number;
}

type Algorithm = 'bfs' | 'dfs' | 'dijkstra';

const algorithms: { id: Algorithm; name: string; description: string }[] = [
    { id: 'bfs', name: 'Breadth-First Search', description: 'Level-by-level traversal' },
    { id: 'dfs', name: 'Depth-First Search', description: 'Deep exploration first' },
    { id: 'dijkstra', name: "Dijkstra's Algorithm", description: 'Shortest path (weighted)' },
];

const SPEEDS = [
    { label: 'Slow', ms: 800 },
    { label: 'Medium', ms: 400 },
    { label: 'Fast', ms: 150 },
];

export function GraphPage() {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>('bfs');
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [speedIndex, setSpeedIndex] = useState(1);
    const [mode, setMode] = useState<'add' | 'connect' | 'select'>('add');
    const [selectedNode, setSelectedNode] = useState<number | null>(null);
    const [startNode, setStartNode] = useState<number | null>(null);
    const [endNode, setEndNode] = useState<number | null>(null);
    const [visitedCount, setVisitedCount] = useState(0);
    const [message, setMessage] = useState('');

    const canvasRef = useRef<HTMLDivElement>(null);
    const isRunningRef = useRef(false);
    const isPausedRef = useRef(false);
    const speedRef = useRef(SPEEDS[1].ms);

    useEffect(() => {
        speedRef.current = SPEEDS[speedIndex].ms;
    }, [speedIndex]);

    // Generate sample graph
    useEffect(() => {
        generateSampleGraph();
    }, []);

    const generateSampleGraph = () => {
        const sampleNodes: Node[] = [
            { id: 0, x: 100, y: 100, state: 'default' },
            { id: 1, x: 250, y: 80, state: 'default' },
            { id: 2, x: 400, y: 100, state: 'default' },
            { id: 3, x: 150, y: 220, state: 'default' },
            { id: 4, x: 300, y: 200, state: 'default' },
            { id: 5, x: 450, y: 220, state: 'default' },
            { id: 6, x: 200, y: 320, state: 'default' },
            { id: 7, x: 380, y: 320, state: 'default' },
        ];
        const sampleEdges: Edge[] = [
            { from: 0, to: 1, weight: 4 },
            { from: 0, to: 3, weight: 2 },
            { from: 1, to: 2, weight: 3 },
            { from: 1, to: 4, weight: 5 },
            { from: 2, to: 5, weight: 1 },
            { from: 3, to: 4, weight: 3 },
            { from: 3, to: 6, weight: 4 },
            { from: 4, to: 5, weight: 2 },
            { from: 4, to: 7, weight: 6 },
            { from: 5, to: 7, weight: 3 },
            { from: 6, to: 7, weight: 5 },
        ];
        setNodes(sampleNodes);
        setEdges(sampleEdges);
        setStartNode(0);
        setEndNode(7);
    };

    const sleep = (ms: number) =>
        new Promise<void>((resolve) => {
            const checkPause = () => {
                if (!isRunningRef.current) {
                    resolve();
                    return;
                }
                if (isPausedRef.current) {
                    setTimeout(checkPause, 50);
                } else {
                    setTimeout(resolve, ms);
                }
            };
            checkPause();
        });

    const getAdjacencyList = () => {
        const adj: Map<number, { node: number; weight: number }[]> = new Map();
        nodes.forEach((n) => adj.set(n.id, []));
        edges.forEach((e) => {
            adj.get(e.from)?.push({ node: e.to, weight: e.weight });
            adj.get(e.to)?.push({ node: e.from, weight: e.weight });
        });
        return adj;
    };

    // BFS
    const bfs = async () => {
        if (startNode === null) return;
        const adj = getAdjacencyList();
        const visited = new Set<number>();
        const queue = [startNode];
        const parent = new Map<number, number>();
        let count = 0;

        setNodes((prev) =>
            prev.map((n) => ({
                ...n,
                state: n.id === startNode ? 'start' : n.id === endNode ? 'end' : 'default',
            }))
        );

        while (queue.length > 0) {
            if (!isRunningRef.current) return;

            const current = queue.shift()!;
            if (visited.has(current)) continue;
            visited.add(current);
            count++;
            setVisitedCount(count);

            setNodes((prev) =>
                prev.map((n) => ({
                    ...n,
                    state:
                        n.id === current
                            ? n.id === endNode
                                ? 'end'
                                : 'visiting'
                            : n.state === 'visiting'
                                ? 'visited'
                                : n.state,
                }))
            );
            await sleep(speedRef.current);

            if (current === endNode) {
                await highlightPath(parent, startNode, endNode);
                setMessage('Path found!');
                return;
            }

            for (const neighbor of adj.get(current) || []) {
                if (!visited.has(neighbor.node)) {
                    queue.push(neighbor.node);
                    if (!parent.has(neighbor.node)) {
                        parent.set(neighbor.node, current);
                    }
                }
            }

            setNodes((prev) =>
                prev.map((n) => ({
                    ...n,
                    state: n.id === current ? 'visited' : n.state,
                }))
            );
        }
        setMessage('No path found');
    };

    // DFS
    const dfs = async () => {
        if (startNode === null) return;
        const adj = getAdjacencyList();
        const visited = new Set<number>();
        const parent = new Map<number, number>();
        let count = 0;

        setNodes((prev) =>
            prev.map((n) => ({
                ...n,
                state: n.id === startNode ? 'start' : n.id === endNode ? 'end' : 'default',
            }))
        );

        const dfsRecursive = async (node: number): Promise<boolean> => {
            if (!isRunningRef.current) return false;
            if (visited.has(node)) return false;

            visited.add(node);
            count++;
            setVisitedCount(count);

            setNodes((prev) =>
                prev.map((n) => ({
                    ...n,
                    state: n.id === node ? (n.id === endNode ? 'end' : 'visiting') : n.state,
                }))
            );
            await sleep(speedRef.current);

            if (node === endNode) {
                await highlightPath(parent, startNode!, endNode);
                setMessage('Path found!');
                return true;
            }

            for (const neighbor of adj.get(node) || []) {
                if (!visited.has(neighbor.node)) {
                    parent.set(neighbor.node, node);
                    if (await dfsRecursive(neighbor.node)) return true;
                }
            }

            setNodes((prev) =>
                prev.map((n) => ({
                    ...n,
                    state: n.id === node ? 'visited' : n.state,
                }))
            );
            return false;
        };

        const found = await dfsRecursive(startNode);
        if (!found) setMessage('No path found');
    };

    // Dijkstra
    const dijkstra = async () => {
        if (startNode === null || endNode === null) return;
        const adj = getAdjacencyList();
        const distances = new Map<number, number>();
        const parent = new Map<number, number>();
        const visited = new Set<number>();
        let count = 0;

        nodes.forEach((n) => distances.set(n.id, Infinity));
        distances.set(startNode, 0);

        setNodes((prev) =>
            prev.map((n) => ({
                ...n,
                state: n.id === startNode ? 'start' : n.id === endNode ? 'end' : 'default',
                distance: n.id === startNode ? 0 : undefined,
            }))
        );

        while (visited.size < nodes.length) {
            if (!isRunningRef.current) return;

            // Get unvisited node with min distance
            let minNode: number | null = null;
            let minDist = Infinity;
            for (const [node, dist] of distances) {
                if (!visited.has(node) && dist < minDist) {
                    minDist = dist;
                    minNode = node;
                }
            }

            if (minNode === null || minDist === Infinity) break;

            visited.add(minNode);
            count++;
            setVisitedCount(count);

            setNodes((prev) =>
                prev.map((n) => ({
                    ...n,
                    state: n.id === minNode ? 'visiting' : n.state === 'visiting' ? 'visited' : n.state,
                    distance: distances.get(n.id),
                }))
            );
            await sleep(speedRef.current);

            if (minNode === endNode) {
                await highlightPath(parent, startNode, endNode);
                setMessage(`Shortest path distance: ${distances.get(endNode)}`);
                return;
            }

            for (const neighbor of adj.get(minNode) || []) {
                if (!visited.has(neighbor.node)) {
                    const newDist = minDist + neighbor.weight;
                    if (newDist < (distances.get(neighbor.node) || Infinity)) {
                        distances.set(neighbor.node, newDist);
                        parent.set(neighbor.node, minNode);
                    }
                }
            }

            setNodes((prev) =>
                prev.map((n) => ({
                    ...n,
                    state: n.id === minNode ? 'visited' : n.state,
                }))
            );
        }
        setMessage('No path found');
    };

    const highlightPath = async (
        parent: Map<number, number>,
        start: number,
        end: number
    ) => {
        const path: number[] = [];
        let current: number | undefined = end;
        while (current !== undefined && current !== start) {
            path.unshift(current);
            current = parent.get(current);
        }
        if (current === start) path.unshift(start);

        for (const nodeId of path) {
            setNodes((prev) =>
                prev.map((n) => ({
                    ...n,
                    state: n.id === nodeId ? 'path' : n.state,
                }))
            );
            await sleep(speedRef.current / 2);
        }
    };

    const runAlgorithm = async () => {
        if (startNode === null) {
            setMessage('Please set a start node');
            return;
        }

        isRunningRef.current = true;
        isPausedRef.current = false;
        setIsRunning(true);
        setIsPaused(false);
        setVisitedCount(0);
        setMessage('');

        switch (selectedAlgorithm) {
            case 'bfs':
                await bfs();
                break;
            case 'dfs':
                await dfs();
                break;
            case 'dijkstra':
                await dijkstra();
                break;
        }

        isRunningRef.current = false;
        setIsRunning(false);
    };

    const togglePause = () => {
        isPausedRef.current = !isPausedRef.current;
        setIsPaused(!isPaused);
    };

    const stop = () => {
        isRunningRef.current = false;
        isPausedRef.current = false;
        setIsRunning(false);
        setIsPaused(false);
        resetGraph();
    };

    const resetGraph = () => {
        setNodes((prev) =>
            prev.map((n) => ({
                ...n,
                state: n.id === startNode ? 'start' : n.id === endNode ? 'end' : 'default',
                distance: undefined,
            }))
        );
        setVisitedCount(0);
        setMessage('');
    };

    const clearGraph = () => {
        setNodes([]);
        setEdges([]);
        setStartNode(null);
        setEndNode(null);
        setSelectedNode(null);
        setVisitedCount(0);
        setMessage('');
    };

    const handleCanvasClick = useCallback(
        (e: React.MouseEvent) => {
            if (isRunning) return;
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Check if clicked on existing node
            const clickedNode = nodes.find(
                (n) => Math.hypot(n.x - x, n.y - y) < 25
            );

            if (mode === 'add' && !clickedNode) {
                const newNode: Node = {
                    id: nodes.length > 0 ? Math.max(...nodes.map((n) => n.id)) + 1 : 0,
                    x,
                    y,
                    state: 'default',
                };
                setNodes([...nodes, newNode]);
            } else if (mode === 'connect' && clickedNode) {
                if (selectedNode === null) {
                    setSelectedNode(clickedNode.id);
                } else if (selectedNode !== clickedNode.id) {
                    // Add edge if not exists
                    const exists = edges.some(
                        (e) =>
                            (e.from === selectedNode && e.to === clickedNode.id) ||
                            (e.from === clickedNode.id && e.to === selectedNode)
                    );
                    if (!exists) {
                        setEdges([
                            ...edges,
                            { from: selectedNode, to: clickedNode.id, weight: Math.floor(Math.random() * 9) + 1 },
                        ]);
                    }
                    setSelectedNode(null);
                }
            } else if (mode === 'select' && clickedNode) {
                if (startNode === null) {
                    setStartNode(clickedNode.id);
                    setNodes((prev) =>
                        prev.map((n) => ({ ...n, state: n.id === clickedNode.id ? 'start' : n.state }))
                    );
                } else if (endNode === null && clickedNode.id !== startNode) {
                    setEndNode(clickedNode.id);
                    setNodes((prev) =>
                        prev.map((n) => ({ ...n, state: n.id === clickedNode.id ? 'end' : n.state }))
                    );
                }
            }
        },
        [nodes, edges, mode, selectedNode, startNode, endNode, isRunning]
    );

    const getNodeColor = (state: Node['state']) => {
        switch (state) {
            case 'start':
                return 'bg-emerald-500 border-emerald-400';
            case 'end':
                return 'bg-red-500 border-red-400';
            case 'visiting':
                return 'bg-yellow-400 border-yellow-300';
            case 'visited':
                return 'bg-slate-400 dark:bg-slate-600 border-slate-300';
            case 'path':
                return 'bg-purple-500 border-purple-400';
            default:
                return 'bg-primary-500 border-primary-400';
        }
    };

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/" className="control-btn" aria-label="Back to home">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Graph Algorithms
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Visualize BFS, DFS, and Dijkstra's shortest path algorithm
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Controls Panel */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Algorithm Selection */}
                        <div className="algo-card">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                                Algorithm
                            </h3>
                            <div className="space-y-2">
                                {algorithms.map((algo) => (
                                    <motion.button
                                        key={algo.id}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={() => !isRunning && setSelectedAlgorithm(algo.id)}
                                        disabled={isRunning}
                                        className={`w-full flex flex-col items-start px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedAlgorithm === algo.id
                                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                            } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span>{algo.name}</span>
                                        <span className="text-xs opacity-75">{algo.description}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Mode Selection */}
                        <div className="algo-card">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                                Edit Mode
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => setMode('add')}
                                    disabled={isRunning}
                                    className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all ${mode === 'add'
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Node
                                </button>
                                <button
                                    onClick={() => setMode('connect')}
                                    disabled={isRunning}
                                    className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all ${mode === 'connect'
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                >
                                    <MousePointer className="w-4 h-4" />
                                    Connect
                                </button>
                                <button
                                    onClick={() => setMode('select')}
                                    disabled={isRunning}
                                    className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all ${mode === 'select'
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                >
                                    <MousePointer className="w-4 h-4" />
                                    Start/End
                                </button>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="algo-card">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                                Controls
                            </h3>

                            {/* Speed */}
                            <div className="mb-4">
                                <label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">
                                    Speed
                                </label>
                                <div className="flex gap-2">
                                    {SPEEDS.map((speed, i) => (
                                        <button
                                            key={speed.label}
                                            onClick={() => setSpeedIndex(i)}
                                            className={`flex-1 px-2 py-1 text-xs rounded-lg transition-all ${speedIndex === i
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                }`}
                                        >
                                            {speed.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-2">
                                {!isRunning ? (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={runAlgorithm}
                                        className="btn btn-primary col-span-2"
                                    >
                                        <Play className="w-4 h-4" />
                                        Start
                                    </motion.button>
                                ) : (
                                    <>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={togglePause}
                                            className="btn btn-secondary"
                                        >
                                            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                                            {isPaused ? 'Resume' : 'Pause'}
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={stop}
                                            className="btn btn-danger"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            Stop
                                        </motion.button>
                                    </>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={resetGraph}
                                    disabled={isRunning}
                                    className="btn btn-secondary disabled:opacity-50"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Reset
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={clearGraph}
                                    disabled={isRunning}
                                    className="btn btn-secondary disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Clear
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={generateSampleGraph}
                                    disabled={isRunning}
                                    className="btn btn-secondary col-span-2 disabled:opacity-50"
                                >
                                    Sample Graph
                                </motion.button>
                            </div>
                        </div>

                        {/* Statistics */}
                        <div className="algo-card">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                                Statistics
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-center">
                                    <p className="text-xs text-primary-600 dark:text-primary-400">Nodes</p>
                                    <p className="text-xl font-bold text-primary-700 dark:text-primary-300">
                                        {nodes.length}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 text-center">
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400">Visited</p>
                                    <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
                                        {visitedCount}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="algo-card">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center flex-shrink-0">
                                    <Info className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div className="text-xs space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                        <span className="text-slate-600 dark:text-slate-400">Start Node</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <span className="text-slate-600 dark:text-slate-400">End Node</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                        <span className="text-slate-600 dark:text-slate-400">Visiting</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                                        <span className="text-slate-600 dark:text-slate-400">Path</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visualization Panel */}
                    <div className="lg:col-span-2 visualizer-container">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Graph Canvas
                            </h3>
                            <AnimatePresence>
                                {message && (
                                    <motion.span
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${message.includes('found')
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                                            }`}
                                    >
                                        {message}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Graph Canvas */}
                        <div
                            ref={canvasRef}
                            onClick={handleCanvasClick}
                            className="relative h-[400px] bg-slate-100 dark:bg-slate-800 rounded-xl cursor-crosshair overflow-hidden"
                        >
                            {/* SVG for edges */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                {edges.map((edge, i) => {
                                    const fromNode = nodes.find((n) => n.id === edge.from);
                                    const toNode = nodes.find((n) => n.id === edge.to);
                                    if (!fromNode || !toNode) return null;
                                    const midX = (fromNode.x + toNode.x) / 2;
                                    const midY = (fromNode.y + toNode.y) / 2;
                                    return (
                                        <g key={i}>
                                            <line
                                                x1={fromNode.x}
                                                y1={fromNode.y}
                                                x2={toNode.x}
                                                y2={toNode.y}
                                                className="stroke-slate-400 dark:stroke-slate-500"
                                                strokeWidth="2"
                                            />
                                            {selectedAlgorithm === 'dijkstra' && (
                                                <text
                                                    x={midX}
                                                    y={midY - 5}
                                                    className="fill-slate-600 dark:fill-slate-300 text-xs font-medium"
                                                    textAnchor="middle"
                                                >
                                                    {edge.weight}
                                                </text>
                                            )}
                                        </g>
                                    );
                                })}
                            </svg>

                            {/* Nodes */}
                            <AnimatePresence>
                                {nodes.map((node) => (
                                    <motion.div
                                        key={node.id}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{
                                            scale: node.state === 'visiting' ? 1.2 : 1,
                                            opacity: 1,
                                        }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                        className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full flex items-center justify-center font-bold text-white border-2 ${getNodeColor(
                                            node.state
                                        )} ${selectedNode === node.id ? 'ring-2 ring-yellow-400' : ''}`}
                                        style={{ left: node.x, top: node.y }}
                                    >
                                        {node.id}
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Instructions */}
                            {nodes.length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                    <p>Click to add nodes, or load a sample graph</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
