import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, BarChart3, Clock, Database, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AlgorithmData {
    name: string;
    category: string;
    timeComplexity: {
        best: string;
        average: string;
        worst: string;
    };
    spaceComplexity: string;
    stable?: boolean;
    inPlace?: boolean;
}

const algorithms: AlgorithmData[] = [
    // Sorting
    {
        name: 'Bubble Sort',
        category: 'Sorting',
        timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
        spaceComplexity: 'O(1)',
        stable: true,
        inPlace: true,
    },
    {
        name: 'Selection Sort',
        category: 'Sorting',
        timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
        spaceComplexity: 'O(1)',
        stable: false,
        inPlace: true,
    },
    {
        name: 'Insertion Sort',
        category: 'Sorting',
        timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
        spaceComplexity: 'O(1)',
        stable: true,
        inPlace: true,
    },
    {
        name: 'Merge Sort',
        category: 'Sorting',
        timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
        spaceComplexity: 'O(n)',
        stable: true,
        inPlace: false,
    },
    {
        name: 'Quick Sort',
        category: 'Sorting',
        timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
        spaceComplexity: 'O(log n)',
        stable: false,
        inPlace: true,
    },
    {
        name: 'Heap Sort',
        category: 'Sorting',
        timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
        spaceComplexity: 'O(1)',
        stable: false,
        inPlace: true,
    },
    {
        name: 'Counting Sort',
        category: 'Sorting',
        timeComplexity: { best: 'O(n + k)', average: 'O(n + k)', worst: 'O(n + k)' },
        spaceComplexity: 'O(k)',
        stable: true,
        inPlace: false,
    },
    {
        name: 'Radix Sort',
        category: 'Sorting',
        timeComplexity: { best: 'O(nk)', average: 'O(nk)', worst: 'O(nk)' },
        spaceComplexity: 'O(n + k)',
        stable: true,
        inPlace: false,
    },
    {
        name: 'Shell Sort',
        category: 'Sorting',
        timeComplexity: { best: 'O(n log n)', average: 'O(n^1.3)', worst: 'O(n²)' },
        spaceComplexity: 'O(1)',
        stable: false,
        inPlace: true,
    },
    // Searching
    {
        name: 'Linear Search',
        category: 'Searching',
        timeComplexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
        spaceComplexity: 'O(1)',
    },
    {
        name: 'Binary Search',
        category: 'Searching',
        timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
        spaceComplexity: 'O(1)',
    },
    {
        name: 'Jump Search',
        category: 'Searching',
        timeComplexity: { best: 'O(1)', average: 'O(√n)', worst: 'O(√n)' },
        spaceComplexity: 'O(1)',
    },
    // Graph
    {
        name: 'BFS',
        category: 'Graph',
        timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
        spaceComplexity: 'O(V)',
    },
    {
        name: 'DFS',
        category: 'Graph',
        timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
        spaceComplexity: 'O(V)',
    },
    {
        name: "Dijkstra's",
        category: 'Graph',
        timeComplexity: { best: 'O((V + E) log V)', average: 'O((V + E) log V)', worst: 'O(V²)' },
        spaceComplexity: 'O(V)',
    },
    // Data Structures
    {
        name: 'Stack (Push/Pop)',
        category: 'Data Structure',
        timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
        spaceComplexity: 'O(n)',
    },
    {
        name: 'Queue (Enqueue/Dequeue)',
        category: 'Data Structure',
        timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
        spaceComplexity: 'O(n)',
    },
    {
        name: 'Hash Table (Lookup)',
        category: 'Data Structure',
        timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(n)' },
        spaceComplexity: 'O(n)',
    },
    {
        name: 'Linked List (Insert)',
        category: 'Data Structure',
        timeComplexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
        spaceComplexity: 'O(n)',
    },
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
        if (complexity.includes(key.replace('O(', '').replace(')', ''))) {
            return value;
        }
    }
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
};

export function AnalysisPage() {
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredAlgorithms =
        selectedCategory === 'All'
            ? algorithms
            : algorithms.filter((a) => a.category === selectedCategory);

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
                            Algorithm Analysis
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Compare time and space complexity across algorithms
                        </p>
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0 }}
                        className="algo-card"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {algorithms.filter((a) => a.category === 'Sorting').length}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Sorting Algorithms</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="algo-card"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {algorithms.filter((a) => a.category === 'Searching').length}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Searching Algorithms</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="algo-card"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
                                <Database className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {algorithms.filter((a) => a.category === 'Graph').length}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Graph Algorithms</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="algo-card"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {algorithms.filter((a) => a.category === 'Data Structure').length}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Data Structures</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map((category) => (
                        <motion.button
                            key={category}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === category
                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            {category}
                        </motion.button>
                    ))}
                </div>

                {/* Complexity Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="algo-card overflow-x-auto"
                >
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                        Complexity Comparison
                    </h2>
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                                    Algorithm
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                                    Category
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                                    Best Case
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                                    Average Case
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                                    Worst Case
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                                    Space
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAlgorithms.map((algo, index) => (
                                <motion.tr
                                    key={algo.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                                        {algo.name}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                            {algo.category}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span
                                            className={`px-2 py-1 rounded-lg text-xs font-mono font-medium ${getComplexityColor(
                                                algo.timeComplexity.best
                                            )}`}
                                        >
                                            {algo.timeComplexity.best}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span
                                            className={`px-2 py-1 rounded-lg text-xs font-mono font-medium ${getComplexityColor(
                                                algo.timeComplexity.average
                                            )}`}
                                        >
                                            {algo.timeComplexity.average}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span
                                            className={`px-2 py-1 rounded-lg text-xs font-mono font-medium ${getComplexityColor(
                                                algo.timeComplexity.worst
                                            )}`}
                                        >
                                            {algo.timeComplexity.worst}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span
                                            className={`px-2 py-1 rounded-lg text-xs font-mono font-medium ${getComplexityColor(
                                                algo.spaceComplexity
                                            )}`}
                                        >
                                            {algo.spaceComplexity}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>

                {/* Complexity Guide */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="algo-card mt-6"
                >
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                        Complexity Guide
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                            <h3 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                                O(1) - Constant
                            </h3>
                            <p className="text-sm text-emerald-600 dark:text-emerald-300">
                                Fastest. Time doesn't depend on input size.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                            <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                                O(log n) - Logarithmic
                            </h3>
                            <p className="text-sm text-green-600 dark:text-green-300">
                                Very efficient. Divides problem in half each step.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                            <h3 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">
                                O(n) - Linear
                            </h3>
                            <p className="text-sm text-yellow-600 dark:text-yellow-300">
                                Good. Time grows proportionally with input.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">
                                O(n²) - Quadratic
                            </h3>
                            <p className="text-sm text-red-600 dark:text-red-300">
                                Slow for large inputs. Avoid if possible.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
