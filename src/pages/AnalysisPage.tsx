import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, BarChart3, Clock, Database, Zap, TrendingUp, ArrowUpDown, Info, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AlgorithmData {
    name: string;
    category: string;
    timeComplexity: { best: string; average: string; worst: string };
    spaceComplexity: string;
    stable?: boolean;
    inPlace?: boolean;
    description: string;
}

const algorithms: AlgorithmData[] = [
    // Sorting
    { name: 'Bubble Sort', category: 'Sorting', timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' }, spaceComplexity: 'O(1)', stable: true, inPlace: true, description: 'Simple comparison sort, swaps adjacent elements' },
    { name: 'Selection Sort', category: 'Sorting', timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' }, spaceComplexity: 'O(1)', stable: false, inPlace: true, description: 'Finds minimum element and moves to front' },
    { name: 'Insertion Sort', category: 'Sorting', timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' }, spaceComplexity: 'O(1)', stable: true, inPlace: true, description: 'Builds sorted array one element at a time' },
    { name: 'Merge Sort', category: 'Sorting', timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' }, spaceComplexity: 'O(n)', stable: true, inPlace: false, description: 'Divide and conquer, merges sorted halves' },
    { name: 'Quick Sort', category: 'Sorting', timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' }, spaceComplexity: 'O(log n)', stable: false, inPlace: true, description: 'Partition-based, very fast in practice' },
    { name: 'Heap Sort', category: 'Sorting', timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' }, spaceComplexity: 'O(1)', stable: false, inPlace: true, description: 'Uses binary heap data structure' },
    { name: 'Counting Sort', category: 'Sorting', timeComplexity: { best: 'O(n + k)', average: 'O(n + k)', worst: 'O(n + k)' }, spaceComplexity: 'O(k)', stable: true, inPlace: false, description: 'Non-comparison, counts occurrences' },
    { name: 'Radix Sort', category: 'Sorting', timeComplexity: { best: 'O(nk)', average: 'O(nk)', worst: 'O(nk)' }, spaceComplexity: 'O(n + k)', stable: true, inPlace: false, description: 'Sorts by individual digits/characters' },
    { name: 'Shell Sort', category: 'Sorting', timeComplexity: { best: 'O(n log n)', average: 'O(n^1.3)', worst: 'O(n²)' }, spaceComplexity: 'O(1)', stable: false, inPlace: true, description: 'Improved insertion sort with gaps' },
    // Searching
    { name: 'Linear Search', category: 'Searching', timeComplexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' }, spaceComplexity: 'O(1)', description: 'Sequential search through all elements' },
    { name: 'Binary Search', category: 'Searching', timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' }, spaceComplexity: 'O(1)', description: 'Halves search space each step (sorted)' },
    { name: 'Jump Search', category: 'Searching', timeComplexity: { best: 'O(1)', average: 'O(√n)', worst: 'O(√n)' }, spaceComplexity: 'O(1)', description: 'Jumps by √n steps (sorted)' },
    { name: 'Interpolation Search', category: 'Searching', timeComplexity: { best: 'O(1)', average: 'O(log log n)', worst: 'O(n)' }, spaceComplexity: 'O(1)', description: 'Estimates position (uniform distribution)' },
    { name: 'Exponential Search', category: 'Searching', timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' }, spaceComplexity: 'O(1)', description: 'Finds range then binary search' },
    { name: 'Ternary Search', category: 'Searching', timeComplexity: { best: 'O(1)', average: 'O(log₃ n)', worst: 'O(log₃ n)' }, spaceComplexity: 'O(1)', description: 'Divides into 3 parts (sorted)' },
    // Graph
    { name: 'BFS', category: 'Graph', timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' }, spaceComplexity: 'O(V)', description: 'Level-order traversal using queue' },
    { name: 'DFS', category: 'Graph', timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' }, spaceComplexity: 'O(V)', description: 'Depth-first traversal using stack' },
    { name: "Dijkstra's", category: 'Graph', timeComplexity: { best: 'O((V+E) log V)', average: 'O((V+E) log V)', worst: 'O(V²)' }, spaceComplexity: 'O(V)', description: 'Shortest path (non-negative weights)' },
    { name: "Bellman-Ford", category: 'Graph', timeComplexity: { best: 'O(VE)', average: 'O(VE)', worst: 'O(VE)' }, spaceComplexity: 'O(V)', description: 'Shortest path (handles negative weights)' },
    { name: "A* Search", category: 'Graph', timeComplexity: { best: 'O(E)', average: 'O(E)', worst: 'O(V²)' }, spaceComplexity: 'O(V)', description: 'Heuristic-guided pathfinding' },
    { name: "Prim's MST", category: 'Graph', timeComplexity: { best: 'O(E log V)', average: 'O(E log V)', worst: 'O(V²)' }, spaceComplexity: 'O(V)', description: 'Minimum spanning tree (greedy)' },
    { name: "Kruskal's MST", category: 'Graph', timeComplexity: { best: 'O(E log E)', average: 'O(E log E)', worst: 'O(E log E)' }, spaceComplexity: 'O(V)', description: 'MST using Union-Find' },
    // Data Structures
    { name: 'Stack (Push/Pop)', category: 'Data Structure', timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' }, spaceComplexity: 'O(n)', description: 'LIFO structure' },
    { name: 'Queue (Enqueue/Dequeue)', category: 'Data Structure', timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' }, spaceComplexity: 'O(n)', description: 'FIFO structure' },
    { name: 'Priority Queue', category: 'Data Structure', timeComplexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)' }, spaceComplexity: 'O(n)', description: 'Heap-based priority' },
    { name: 'Hash Table (Lookup)', category: 'Data Structure', timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(n)' }, spaceComplexity: 'O(n)', description: 'Key-value store' },
    { name: 'Linked List (Insert)', category: 'Data Structure', timeComplexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' }, spaceComplexity: 'O(n)', description: 'Node-based list' },
    { name: 'Binary Search Tree', category: 'Data Structure', timeComplexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' }, spaceComplexity: 'O(n)', description: 'Ordered tree structure' },
];

const categories = ['All', 'Sorting', 'Searching', 'Graph', 'Data Structure'];

const complexityColors: Record<string, string> = {
    'O(1)': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    'O(log n)': 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    'O(√n)': 'bg-lime-100 text-lime-700 dark:bg-lime-900/50 dark:text-lime-300',
    'O(n)': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
    'O(n log n)': 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
    'O(n²)': 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    'O(V + E)': 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
};

const getComplexityColor = (complexity: string): string => {
    for (const [key, value] of Object.entries(complexityColors)) {
        if (complexity.includes(key.replace('O(', '').replace(')', ''))) return value;
    }
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
};

// Interactive complexity chart data
const chartDataPoints = [
    { n: 1, log: 0, sqrt: 1, linear: 1, nlogn: 0, quad: 1 },
    { n: 2, log: 1, sqrt: 1.4, linear: 2, nlogn: 2, quad: 4 },
    { n: 4, log: 2, sqrt: 2, linear: 4, nlogn: 8, quad: 16 },
    { n: 8, log: 3, sqrt: 2.8, linear: 8, nlogn: 24, quad: 64 },
    { n: 16, log: 4, sqrt: 4, linear: 16, nlogn: 64, quad: 256 },
    { n: 32, log: 5, sqrt: 5.7, linear: 32, nlogn: 160, quad: 1024 },
    { n: 64, log: 6, sqrt: 8, linear: 64, nlogn: 384, quad: 4096 },
    { n: 128, log: 7, sqrt: 11.3, linear: 128, nlogn: 896, quad: 16384 },
];

export function AnalysisPage() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [compareMode, setCompareMode] = useState(false);
    const [selectedAlgos, setSelectedAlgos] = useState<string[]>([]);
    const [hoveredN, setHoveredN] = useState<number | null>(null);

    const filteredAlgorithms = useMemo(() =>
        selectedCategory === 'All' ? algorithms : algorithms.filter(a => a.category === selectedCategory),
        [selectedCategory]
    );

    const toggleAlgoSelection = (name: string) => {
        setSelectedAlgos(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : prev.length < 4 ? [...prev, name] : prev
        );
    };

    const comparedAlgos = useMemo(() =>
        algorithms.filter(a => selectedAlgos.includes(a.name)),
        [selectedAlgos]
    );

    const maxQuad = Math.max(...chartDataPoints.map(d => d.quad));

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/" className="control-btn"><ChevronLeft className="w-5 h-5" /></Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Algorithm Analysis</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">Complexity comparison & interactive charts</p>
                    </div>
                    <button onClick={() => setCompareMode(!compareMode)}
                        className={`btn ${compareMode ? 'btn-primary' : 'btn-secondary'}`}>
                        <Scale className="w-4 h-4" />
                        {compareMode ? 'Exit Compare' : 'Compare Mode'}
                    </button>
                </div>

                {/* Overview Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        { icon: BarChart3, count: algorithms.filter(a => a.category === 'Sorting').length, label: 'Sorting', color: 'from-rose-500 to-pink-600' },
                        { icon: Zap, count: algorithms.filter(a => a.category === 'Searching').length, label: 'Searching', color: 'from-cyan-500 to-blue-600' },
                        { icon: Database, count: algorithms.filter(a => a.category === 'Graph').length, label: 'Graph', color: 'from-fuchsia-500 to-purple-600' },
                        { icon: Clock, count: algorithms.filter(a => a.category === 'Data Structure').length, label: 'Data Structures', color: 'from-amber-500 to-orange-600' },
                    ].map((item, i) => (
                        <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="algo-card">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                                    <item.icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{item.count}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Interactive Complexity Chart */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="algo-card mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" /> Interactive Complexity Chart
                        </h2>
                        <span className="text-xs text-slate-500">Hover over bars to see values</span>
                    </div>

                    {/* Chart */}
                    <div className="relative h-64 flex items-end gap-2 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        {chartDataPoints.map((point, i) => (
                            <div key={point.n} className="flex-1 flex flex-col items-center gap-1"
                                onMouseEnter={() => setHoveredN(point.n)} onMouseLeave={() => setHoveredN(null)}>
                                {/* Bars */}
                                <div className="w-full flex items-end gap-0.5 h-48">
                                    <motion.div className="flex-1 bg-emerald-500 rounded-t" style={{ height: `${(point.log / maxQuad) * 100 * 50}%` }}
                                        initial={{ height: 0 }} animate={{ height: `${Math.max(2, (point.log / 7) * 100)}%` }} transition={{ delay: i * 0.05 }} />
                                    <motion.div className="flex-1 bg-lime-500 rounded-t"
                                        initial={{ height: 0 }} animate={{ height: `${Math.max(2, (point.sqrt / 11.3) * 100)}%` }} transition={{ delay: i * 0.05 + 0.1 }} />
                                    <motion.div className="flex-1 bg-yellow-500 rounded-t"
                                        initial={{ height: 0 }} animate={{ height: `${Math.max(2, (point.linear / 128) * 100)}%` }} transition={{ delay: i * 0.05 + 0.2 }} />
                                    <motion.div className="flex-1 bg-orange-500 rounded-t"
                                        initial={{ height: 0 }} animate={{ height: `${Math.max(2, (point.nlogn / 896) * 100)}%` }} transition={{ delay: i * 0.05 + 0.3 }} />
                                    <motion.div className="flex-1 bg-red-500 rounded-t"
                                        initial={{ height: 0 }} animate={{ height: `${Math.max(2, (point.quad / maxQuad) * 100)}%` }} transition={{ delay: i * 0.05 + 0.4 }} />
                                </div>
                                <span className="text-xs font-mono text-slate-500">n={point.n}</span>
                            </div>
                        ))}

                        {/* Tooltip */}
                        <AnimatePresence>
                            {hoveredN !== null && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="absolute top-2 right-2 bg-white dark:bg-slate-900 shadow-lg rounded-lg p-3 text-xs">
                                    <p className="font-bold mb-1">n = {hoveredN}</p>
                                    {(() => {
                                        const d = chartDataPoints.find(p => p.n === hoveredN)!;
                                        return (
                                            <div className="space-y-1">
                                                <div className="flex justify-between gap-4"><span className="text-emerald-600">O(log n):</span><span className="font-mono">{d.log}</span></div>
                                                <div className="flex justify-between gap-4"><span className="text-lime-600">O(√n):</span><span className="font-mono">{d.sqrt.toFixed(1)}</span></div>
                                                <div className="flex justify-between gap-4"><span className="text-yellow-600">O(n):</span><span className="font-mono">{d.linear}</span></div>
                                                <div className="flex justify-between gap-4"><span className="text-orange-600">O(n log n):</span><span className="font-mono">{d.nlogn}</span></div>
                                                <div className="flex justify-between gap-4"><span className="text-red-600">O(n²):</span><span className="font-mono">{d.quad}</span></div>
                                            </div>
                                        );
                                    })()}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500" /> O(log n)</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-lime-500" /> O(√n)</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500" /> O(n)</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500" /> O(n log n)</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500" /> O(n²)</span>
                    </div>
                </motion.div>

                {/* Compare Mode Panel */}
                <AnimatePresence>
                    {compareMode && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="algo-card mb-6 overflow-hidden">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <ArrowUpDown className="w-5 h-5" /> Algorithm Comparison (select up to 4)
                            </h3>
                            {comparedAlgos.length > 0 ? (
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {comparedAlgos.map(algo => (
                                        <div key={algo.name} className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                                            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">{algo.name}</h4>
                                            <div className="space-y-1 text-xs">
                                                <div className="flex justify-between"><span className="text-slate-500">Best:</span><span className={`px-1 rounded ${getComplexityColor(algo.timeComplexity.best)}`}>{algo.timeComplexity.best}</span></div>
                                                <div className="flex justify-between"><span className="text-slate-500">Avg:</span><span className={`px-1 rounded ${getComplexityColor(algo.timeComplexity.average)}`}>{algo.timeComplexity.average}</span></div>
                                                <div className="flex justify-between"><span className="text-slate-500">Worst:</span><span className={`px-1 rounded ${getComplexityColor(algo.timeComplexity.worst)}`}>{algo.timeComplexity.worst}</span></div>
                                                <div className="flex justify-between"><span className="text-slate-500">Space:</span><span className={`px-1 rounded ${getComplexityColor(algo.spaceComplexity)}`}>{algo.spaceComplexity}</span></div>
                                                {algo.stable !== undefined && <div className="flex justify-between"><span className="text-slate-500">Stable:</span><span>{algo.stable ? '✓' : '✗'}</span></div>}
                                            </div>
                                            <button onClick={() => toggleAlgoSelection(algo.name)} className="mt-2 text-xs text-red-500 hover:underline">Remove</button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 text-sm">Click on algorithms in the table below to compare them</p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {categories.map(category => (
                        <motion.button key={category} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === category ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                            {category}
                        </motion.button>
                    ))}
                </div>

                {/* Complexity Table */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="algo-card overflow-x-auto">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Complexity Comparison</h2>
                    <table className="w-full min-w-[800px] text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                {compareMode && <th className="py-2 px-2 text-left">Select</th>}
                                <th className="text-left py-2 px-3 font-semibold text-slate-900 dark:text-white">Algorithm</th>
                                <th className="text-left py-2 px-3 font-semibold text-slate-900 dark:text-white">Category</th>
                                <th className="text-center py-2 px-2 font-semibold text-slate-900 dark:text-white">Best</th>
                                <th className="text-center py-2 px-2 font-semibold text-slate-900 dark:text-white">Average</th>
                                <th className="text-center py-2 px-2 font-semibold text-slate-900 dark:text-white">Worst</th>
                                <th className="text-center py-2 px-2 font-semibold text-slate-900 dark:text-white">Space</th>
                                <th className="text-left py-2 px-3 font-semibold text-slate-900 dark:text-white">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAlgorithms.map((algo, index) => (
                                <motion.tr key={algo.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.02 }}
                                    onClick={() => compareMode && toggleAlgoSelection(algo.name)}
                                    className={`border-b border-slate-100 dark:border-slate-800 transition-colors ${compareMode ? 'cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'} ${selectedAlgos.includes(algo.name) ? 'bg-primary-100 dark:bg-primary-900/30' : ''}`}>
                                    {compareMode && (
                                        <td className="py-2 px-2">
                                            <input type="checkbox" checked={selectedAlgos.includes(algo.name)} onChange={() => { }} className="accent-primary-500" />
                                        </td>
                                    )}
                                    <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">{algo.name}</td>
                                    <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{algo.category}</span></td>
                                    <td className="py-2 px-2 text-center"><span className={`px-2 py-0.5 rounded text-xs font-mono ${getComplexityColor(algo.timeComplexity.best)}`}>{algo.timeComplexity.best}</span></td>
                                    <td className="py-2 px-2 text-center"><span className={`px-2 py-0.5 rounded text-xs font-mono ${getComplexityColor(algo.timeComplexity.average)}`}>{algo.timeComplexity.average}</span></td>
                                    <td className="py-2 px-2 text-center"><span className={`px-2 py-0.5 rounded text-xs font-mono ${getComplexityColor(algo.timeComplexity.worst)}`}>{algo.timeComplexity.worst}</span></td>
                                    <td className="py-2 px-2 text-center"><span className={`px-2 py-0.5 rounded text-xs font-mono ${getComplexityColor(algo.spaceComplexity)}`}>{algo.spaceComplexity}</span></td>
                                    <td className="py-2 px-3 text-xs text-slate-500 dark:text-slate-400">{algo.description}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>

                {/* Complexity Guide */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="algo-card mt-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5" /> Complexity Guide
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'O(1) - Constant', desc: 'Fastest. Time doesn\'t depend on input size.', color: 'emerald' },
                            { label: 'O(log n) - Logarithmic', desc: 'Very efficient. Divides problem in half each step.', color: 'green' },
                            { label: 'O(n) - Linear', desc: 'Good. Time grows proportionally with input.', color: 'yellow' },
                            { label: 'O(n²) - Quadratic', desc: 'Slow for large inputs. Avoid if possible.', color: 'red' },
                        ].map(item => (
                            <div key={item.label} className={`p-4 rounded-xl bg-${item.color}-50 dark:bg-${item.color}-900/20 border border-${item.color}-200 dark:border-${item.color}-800`}>
                                <h3 className={`font-semibold text-${item.color}-700 dark:text-${item.color}-400 mb-2`}>{item.label}</h3>
                                <p className={`text-sm text-${item.color}-600 dark:text-${item.color}-300`}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
