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
    Clock,
    Zap,
    BookOpen,
    Target,
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
    state?: 'default' | 'exploring' | 'path';
}

type Algorithm = 'bfs' | 'dfs' | 'dijkstra';

interface AlgorithmInfo {
    id: Algorithm;
    name: string;
    description: string;
    timeComplexity: string;
    spaceComplexity: string;
    useCase: string;
    color: string;
    pseudocode: string[];
}

const algorithms: AlgorithmInfo[] = [
    {
        id: 'bfs',
        name: 'Breadth-First Search',
        description: 'Explores neighbors level by level using a queue. Guarantees shortest path in unweighted graphs.',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V)',
        useCase: 'Shortest path (unweighted), level-order traversal',
        color: 'from-blue-500 to-cyan-500',
        pseudocode: [
            'queue ← [start]',
            'visited ← {start}',
            'while queue not empty:',
            '  current ← dequeue()',
            '  if current == target: ✓',
            '  for neighbor in adj[current]:',
            '    if neighbor not visited:',
            '      enqueue(neighbor)',
            '      visited.add(neighbor)',
        ],
    },
    {
        id: 'dfs',
        name: 'Depth-First Search',
        description: 'Explores as deep as possible before backtracking using recursion/stack.',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V)',
        useCase: 'Cycle detection, topological sort, maze solving',
        color: 'from-purple-500 to-pink-500',
        pseudocode: [
            'function DFS(node):',
            '  if node == target: ✓',
            '  visited.add(node)',
            '  for neighbor in adj[node]:',
            '    if neighbor not visited:',
            '      DFS(neighbor)',
            '  // backtrack',
        ],
    },
    {
        id: 'dijkstra',
        name: "Dijkstra's Algorithm",
        description: 'Finds shortest path in weighted graphs using a priority queue.',
        timeComplexity: 'O((V + E) log V)',
        spaceComplexity: 'O(V)',
        useCase: 'GPS navigation, network routing, weighted shortest path',
        color: 'from-amber-500 to-orange-500',
        pseudocode: [
            'dist[start] ← 0',
            'pq ← [(0, start)]',
            'while pq not empty:',
            '  (d, u) ← extract_min()',
            '  if u == target: ✓',
            '  for (v, weight) in adj[u]:',
            '    if dist[u]+weight < dist[v]:',
            '      dist[v] ← dist[u]+weight',
            '      pq.insert((dist[v], v))',
        ],
    },
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
    const [currentStep, setCurrentStep] = useState(-1);
    const [queueStack, setQueueStack] = useState<number[]>([]);
    const [pathLength, setPathLength] = useState<number | null>(null);

    const canvasRef = useRef<HTMLDivElement>(null);
    const isRunningRef = useRef(false);
    const isPausedRef = useRef(false);
    const speedRef = useRef(SPEEDS[1].ms);

    const currentAlgoInfo = algorithms.find((a) => a.id === selectedAlgorithm)!;

    useEffect(() => {
        speedRef.current = SPEEDS[speedIndex].ms;
    }, [speedIndex]);

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

    // BFS with enhanced visualization
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
        setEdges((prev) => prev.map((e) => ({ ...e, state: 'default' as const })));

        while (queue.length > 0) {
            if (!isRunningRef.current) return;

            setQueueStack([...queue]);
            setCurrentStep(3); // "current ← dequeue()"

            const current = queue.shift()!;
            if (visited.has(current)) continue;
            visited.add(current);
            count++;
            setVisitedCount(count);

            setCurrentStep(4); // checking target
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
                const pathLen = await highlightPath(parent, startNode, endNode);
                setPathLength(pathLen);
                setMessage('Path found!');
                setCurrentStep(-1);
                return;
            }

            setCurrentStep(5); // exploring neighbors
            for (const neighbor of adj.get(current) || []) {
                if (!visited.has(neighbor.node)) {
                    queue.push(neighbor.node);
                    if (!parent.has(neighbor.node)) {
                        parent.set(neighbor.node, current);
                    }
                    // Highlight exploring edge
                    setEdges((prev) =>
                        prev.map((e) =>
                            (e.from === current && e.to === neighbor.node) ||
                                (e.to === current && e.from === neighbor.node)
                                ? { ...e, state: 'exploring' as const }
                                : e
                        )
                    );
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
        setCurrentStep(-1);
    };

    // DFS with enhanced visualization
    const dfs = async () => {
        if (startNode === null) return;
        const adj = getAdjacencyList();
        const visited = new Set<number>();
        const parent = new Map<number, number>();
        const stack: number[] = [];
        let count = 0;

        setNodes((prev) =>
            prev.map((n) => ({
                ...n,
                state: n.id === startNode ? 'start' : n.id === endNode ? 'end' : 'default',
            }))
        );
        setEdges((prev) => prev.map((e) => ({ ...e, state: 'default' as const })));

        const dfsRecursive = async (node: number): Promise<boolean> => {
            if (!isRunningRef.current) return false;
            if (visited.has(node)) return false;

            stack.push(node);
            setQueueStack([...stack]);
            visited.add(node);
            count++;
            setVisitedCount(count);

            setCurrentStep(1); // checking target
            setNodes((prev) =>
                prev.map((n) => ({
                    ...n,
                    state: n.id === node ? (n.id === endNode ? 'end' : 'visiting') : n.state,
                }))
            );
            await sleep(speedRef.current);

            if (node === endNode) {
                const pathLen = await highlightPath(parent, startNode!, endNode);
                setPathLength(pathLen);
                setMessage('Path found!');
                setCurrentStep(-1);
                return true;
            }

            setCurrentStep(3); // exploring neighbors
            for (const neighbor of adj.get(node) || []) {
                if (!visited.has(neighbor.node)) {
                    parent.set(neighbor.node, node);
                    // Highlight exploring edge
                    setEdges((prev) =>
                        prev.map((e) =>
                            (e.from === node && e.to === neighbor.node) ||
                                (e.to === node && e.from === neighbor.node)
                                ? { ...e, state: 'exploring' as const }
                                : e
                        )
                    );
                    if (await dfsRecursive(neighbor.node)) return true;
                }
            }

            setCurrentStep(6); // backtrack
            stack.pop();
            setQueueStack([...stack]);
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
        setCurrentStep(-1);
    };

    // Dijkstra with enhanced visualization
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
        setEdges((prev) => prev.map((e) => ({ ...e, state: 'default' as const })));

        while (visited.size < nodes.length) {
            if (!isRunningRef.current) return;

            setCurrentStep(3); // extract_min
            let minNode: number | null = null;
            let minDist = Infinity;
            for (const [node, dist] of distances) {
                if (!visited.has(node) && dist < minDist) {
                    minDist = dist;
                    minNode = node;
                }
            }

            if (minNode === null || minDist === Infinity) break;

            // Show priority queue state
            const pqState = Array.from(distances.entries())
                .filter(([n, d]) => !visited.has(n) && d !== Infinity)
                .sort((a, b) => a[1] - b[1])
                .map(([n]) => n);
            setQueueStack(pqState);

            visited.add(minNode);
            count++;
            setVisitedCount(count);

            setCurrentStep(4); // checking target
            setNodes((prev) =>
                prev.map((n) => ({
                    ...n,
                    state: n.id === minNode ? 'visiting' : n.state === 'visiting' ? 'visited' : n.state,
                    distance: distances.get(n.id),
                }))
            );
            await sleep(speedRef.current);

            if (minNode === endNode) {
                const pathLen = await highlightPath(parent, startNode, endNode);
                setPathLength(pathLen);
                setMessage(`Shortest path: ${distances.get(endNode)}`);
                setCurrentStep(-1);
                return;
            }

            setCurrentStep(5); // relaxing edges
            for (const neighbor of adj.get(minNode) || []) {
                if (!visited.has(neighbor.node)) {
                    const newDist = minDist + neighbor.weight;
                    if (newDist < (distances.get(neighbor.node) || Infinity)) {
                        distances.set(neighbor.node, newDist);
                        parent.set(neighbor.node, minNode);
                        // Highlight exploring edge
                        setEdges((prev) =>
                            prev.map((e) =>
                                (e.from === minNode && e.to === neighbor.node) ||
                                    (e.to === minNode && e.from === neighbor.node)
                                    ? { ...e, state: 'exploring' as const }
                                    : e
                            )
                        );
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
        setCurrentStep(-1);
    };

    const highlightPath = async (
        parent: Map<number, number>,
        start: number,
        end: number
    ): Promise<number> => {
        const path: number[] = [];
        let current: number | undefined = end;
        while (current !== undefined && current !== start) {
            path.unshift(current);
            current = parent.get(current);
        }
        if (current === start) path.unshift(start);

        // Highlight path edges
        for (let i = 0; i < path.length - 1; i++) {
            const from = path[i];
            const to = path[i + 1];
            setEdges((prev) =>
                prev.map((e) =>
                    (e.from === from && e.to === to) || (e.from === to && e.to === from)
                        ? { ...e, state: 'path' as const }
                        : e
                )
            );
        }

        for (const nodeId of path) {
            setNodes((prev) =>
                prev.map((n) => ({
                    ...n,
                    state: n.id === nodeId ? 'path' : n.state,
                }))
            );
            await sleep(speedRef.current / 2);
        }
        return path.length;
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
        setCurrentStep(0);
        setQueueStack([]);
        setPathLength(null);

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
        setQueueStack([]);
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
        setEdges((prev) => prev.map((e) => ({ ...e, state: 'default' as const })));
        setVisitedCount(0);
        setMessage('');
        setCurrentStep(-1);
        setQueueStack([]);
        setPathLength(null);
    };

    const clearGraph = () => {
        setNodes([]);
        setEdges([]);
        setStartNode(null);
        setEndNode(null);
        setSelectedNode(null);
        setVisitedCount(0);
        setMessage('');
        setCurrentStep(-1);
        setQueueStack([]);
        setPathLength(null);
    };

    const handleCanvasClick = useCallback(
        (e: React.MouseEvent) => {
            if (isRunning) return;
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const clickedNode = nodes.find((n) => Math.hypot(n.x - x, n.y - y) < 25);

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
                return 'bg-emerald-500 border-emerald-400 shadow-emerald-500/50';
            case 'end':
                return 'bg-red-500 border-red-400 shadow-red-500/50';
            case 'visiting':
                return 'bg-yellow-400 border-yellow-300 shadow-yellow-500/50';
            case 'visited':
                return 'bg-slate-400 dark:bg-slate-600 border-slate-300 shadow-slate-500/30';
            case 'path':
                return 'bg-purple-500 border-purple-400 shadow-purple-500/50';
            default:
                return 'bg-primary-500 border-primary-400 shadow-primary-500/30';
        }
    };

    const getEdgeColor = (state?: Edge['state']) => {
        switch (state) {
            case 'exploring':
                return 'stroke-yellow-400';
            case 'path':
                return 'stroke-purple-500';
            default:
                return 'stroke-slate-400 dark:stroke-slate-500';
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
                        {/* Algorithm Selection with Info */}
                        <div className="algo-card">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
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
                                            ? `bg-gradient-to-r ${algo.color} text-white shadow-lg`
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                            } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span>{algo.name}</span>
                                        <span className="text-xs opacity-75">{algo.description.split('.')[0]}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Algorithm Details */}
                        <motion.div
                            key={selectedAlgorithm}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="algo-card"
                        >
                            <div className={`h-1 w-full bg-gradient-to-r ${currentAlgoInfo.color} rounded-full mb-3`} />
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-600 dark:text-slate-400">Time:</span>
                                    <span className="font-mono text-primary-600 dark:text-primary-400">
                                        {currentAlgoInfo.timeComplexity}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-600 dark:text-slate-400">Space:</span>
                                    <span className="font-mono text-primary-600 dark:text-primary-400">
                                        {currentAlgoInfo.spaceComplexity}
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Target className="w-4 h-4 text-slate-400 mt-0.5" />
                                    <span className="text-slate-600 dark:text-slate-400">{currentAlgoInfo.useCase}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Pseudocode */}
                        <div className="algo-card">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Pseudocode</h3>
                            <div className="font-mono text-xs space-y-0.5 bg-slate-800 dark:bg-slate-900 p-3 rounded-lg text-slate-300">
                                {currentAlgoInfo.pseudocode.map((line, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            backgroundColor: currentStep === i ? 'rgba(250, 204, 21, 0.3)' : 'transparent',
                                        }}
                                        className="px-1 rounded"
                                    >
                                        {line}
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Queue/Stack Visualization */}
                        {isRunning && queueStack.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="algo-card"
                            >
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                    {selectedAlgorithm === 'dfs' ? 'Stack' : selectedAlgorithm === 'dijkstra' ? 'Priority Queue' : 'Queue'}
                                </h3>
                                <div className="flex flex-wrap gap-1">
                                    {queueStack.map((nodeId, i) => (
                                        <motion.div
                                            key={`${nodeId}-${i}`}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center text-sm font-bold"
                                        >
                                            {nodeId}
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Mode Selection */}
                        <div className="algo-card">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Edit Mode</h3>
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
                                    <Target className="w-4 h-4" />
                                    Start/End
                                </button>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="algo-card">
                            <div className="mb-3">
                                <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Speed</label>
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
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Statistics</h3>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-center">
                                    <p className="text-xs text-primary-600 dark:text-primary-400">Nodes</p>
                                    <p className="text-lg font-bold text-primary-700 dark:text-primary-300">{nodes.length}</p>
                                </div>
                                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-center">
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400">Visited</p>
                                    <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">{visitedCount}</p>
                                </div>
                                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-center">
                                    <p className="text-xs text-purple-600 dark:text-purple-400">Path</p>
                                    <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                                        {pathLength ?? '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="algo-card">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center flex-shrink-0">
                                    <Info className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div className="text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                        <span className="text-slate-600 dark:text-slate-400">Start</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <span className="text-slate-600 dark:text-slate-400">End</span>
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
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Graph Canvas</h3>
                            <AnimatePresence>
                                {message && (
                                    <motion.span
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${message.includes('found') || message.includes('Shortest')
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
                                            <motion.line
                                                x1={fromNode.x}
                                                y1={fromNode.y}
                                                x2={toNode.x}
                                                y2={toNode.y}
                                                className={getEdgeColor(edge.state)}
                                                strokeWidth={edge.state === 'path' ? 4 : 2}
                                                animate={{
                                                    strokeWidth: edge.state === 'path' ? 4 : edge.state === 'exploring' ? 3 : 2,
                                                }}
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
                                        className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full flex items-center justify-center font-bold text-white border-2 shadow-lg ${getNodeColor(
                                            node.state
                                        )} ${selectedNode === node.id ? 'ring-2 ring-yellow-400' : ''}`}
                                        style={{ left: node.x, top: node.y }}
                                    >
                                        <span className="text-sm">{node.id}</span>
                                        {node.distance !== undefined && selectedAlgorithm === 'dijkstra' && (
                                            <span className="absolute -bottom-5 text-[10px] text-slate-600 dark:text-slate-300 font-mono">
                                                d={node.distance === Infinity ? '∞' : node.distance}
                                            </span>
                                        )}
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
