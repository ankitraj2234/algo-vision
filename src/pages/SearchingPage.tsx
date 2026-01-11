import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    Pause,
    RotateCcw,
    Shuffle,
    ChevronLeft,
    Info,
    Search,
    Target,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ArrayElement {
    id: number;
    value: number;
    state: 'default' | 'searching' | 'found' | 'checked' | 'range';
}

type Algorithm = 'linear' | 'binary' | 'jump';

const algorithms: { id: Algorithm; name: string; complexity: string; requirement: string }[] = [
    { id: 'linear', name: 'Linear Search', complexity: 'O(n)', requirement: 'Any array' },
    { id: 'binary', name: 'Binary Search', complexity: 'O(log n)', requirement: 'Sorted array' },
    { id: 'jump', name: 'Jump Search', complexity: 'O(√n)', requirement: 'Sorted array' },
];

const SPEEDS = [
    { label: 'Slow', ms: 500 },
    { label: 'Medium', ms: 250 },
    { label: 'Fast', ms: 100 },
];

export function SearchingPage() {
    const [array, setArray] = useState<ArrayElement[]>([]);
    const [arraySize, setArraySize] = useState(15);
    const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>('linear');
    const [target, setTarget] = useState<number | ''>('');
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [speedIndex, setSpeedIndex] = useState(1);
    const [comparisons, setComparisons] = useState(0);
    const [result, setResult] = useState<{ found: boolean; index: number } | null>(null);
    const [message, setMessage] = useState<string>('');

    const isRunningRef = useRef(false);
    const isPausedRef = useRef(false);
    const speedRef = useRef(SPEEDS[1].ms);

    useEffect(() => {
        speedRef.current = SPEEDS[speedIndex].ms;
    }, [speedIndex]);

    useEffect(() => {
        generateArray();
    }, [arraySize]);

    const generateArray = useCallback(() => {
        const newArray: ArrayElement[] = Array.from({ length: arraySize }, (_, i) => ({
            id: i,
            value: Math.floor(Math.random() * 99) + 1,
            state: 'default',
        }));

        // Sort for binary and jump search
        if (selectedAlgorithm !== 'linear') {
            newArray.sort((a, b) => a.value - b.value);
        }

        setArray(newArray);
        setComparisons(0);
        setResult(null);
        setMessage('');
    }, [arraySize, selectedAlgorithm]);

    useEffect(() => {
        generateArray();
    }, [selectedAlgorithm]);

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

    const updateArray = (newArray: ArrayElement[]) => {
        setArray([...newArray]);
    };

    // Linear Search
    const linearSearch = async (targetValue: number) => {
        const arr = [...array];

        for (let i = 0; i < arr.length; i++) {
            if (!isRunningRef.current) return;

            // Reset previous
            arr.forEach((el, idx) => {
                if (idx < i) el.state = 'checked';
                else el.state = 'default';
            });

            arr[i].state = 'searching';
            updateArray(arr);
            setComparisons((c) => c + 1);
            await sleep(speedRef.current);

            if (arr[i].value === targetValue) {
                arr[i].state = 'found';
                updateArray(arr);
                return { found: true, index: i };
            }
        }

        arr.forEach((el) => (el.state = 'checked'));
        updateArray(arr);
        return { found: false, index: -1 };
    };

    // Binary Search
    const binarySearch = async (targetValue: number) => {
        const arr = [...array];
        let left = 0;
        let right = arr.length - 1;

        while (left <= right) {
            if (!isRunningRef.current) return { found: false, index: -1 };

            // Reset states
            arr.forEach((el) => (el.state = 'default'));

            // Highlight range
            for (let i = left; i <= right; i++) {
                arr[i].state = 'range';
            }

            const mid = Math.floor((left + right) / 2);
            arr[mid].state = 'searching';
            updateArray(arr);
            setComparisons((c) => c + 1);
            await sleep(speedRef.current);

            if (arr[mid].value === targetValue) {
                arr[mid].state = 'found';
                updateArray(arr);
                return { found: true, index: mid };
            } else if (arr[mid].value < targetValue) {
                for (let i = left; i <= mid; i++) {
                    arr[i].state = 'checked';
                }
                left = mid + 1;
            } else {
                for (let i = mid; i <= right; i++) {
                    arr[i].state = 'checked';
                }
                right = mid - 1;
            }
            updateArray(arr);
            await sleep(speedRef.current / 2);
        }

        arr.forEach((el) => (el.state = 'checked'));
        updateArray(arr);
        return { found: false, index: -1 };
    };

    // Jump Search
    const jumpSearch = async (targetValue: number) => {
        const arr = [...array];
        const n = arr.length;
        const step = Math.floor(Math.sqrt(n));
        let prev = 0;

        // Finding block
        while (arr[Math.min(step, n) - 1].value < targetValue) {
            if (!isRunningRef.current) return { found: false, index: -1 };

            // Highlight jump
            for (let i = prev; i < Math.min(step, n); i++) {
                arr[i].state = 'checked';
            }
            arr[Math.min(step, n) - 1].state = 'searching';
            updateArray(arr);
            setComparisons((c) => c + 1);
            await sleep(speedRef.current);

            prev = step;
            if (prev >= n) {
                arr.forEach((el) => (el.state = 'checked'));
                updateArray(arr);
                return { found: false, index: -1 };
            }
        }

        // Linear search in block
        for (let i = prev; i < Math.min(step + 1, n); i++) {
            if (!isRunningRef.current) return { found: false, index: -1 };

            arr[i].state = 'searching';
            updateArray(arr);
            setComparisons((c) => c + 1);
            await sleep(speedRef.current);

            if (arr[i].value === targetValue) {
                arr[i].state = 'found';
                updateArray(arr);
                return { found: true, index: i };
            }
            arr[i].state = 'checked';
        }

        arr.forEach((el) => (el.state = 'checked'));
        updateArray(arr);
        return { found: false, index: -1 };
    };

    const runAlgorithm = async () => {
        if (target === '' || target < 1 || target > 99) {
            setMessage('Please enter a target value between 1-99');
            return;
        }

        isRunningRef.current = true;
        isPausedRef.current = false;
        setIsRunning(true);
        setIsPaused(false);
        setComparisons(0);
        setResult(null);
        setMessage('');

        // Reset states
        setArray((prev) => prev.map((el) => ({ ...el, state: 'default' })));

        let searchResult: { found: boolean; index: number } | undefined;

        switch (selectedAlgorithm) {
            case 'linear':
                searchResult = await linearSearch(target);
                break;
            case 'binary':
                searchResult = await binarySearch(target);
                break;
            case 'jump':
                searchResult = await jumpSearch(target);
                break;
        }

        if (searchResult) {
            setResult(searchResult);
            setMessage(
                searchResult.found
                    ? `Found ${target} at index ${searchResult.index}!`
                    : `${target} not found in the array`
            );
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
        setArray((prev) => prev.map((el) => ({ ...el, state: 'default' })));
    };

    const getElementColor = (state: ArrayElement['state']) => {
        switch (state) {
            case 'searching':
                return 'bg-yellow-400 border-yellow-300 text-yellow-900';
            case 'found':
                return 'bg-emerald-500 border-emerald-400 text-white';
            case 'checked':
                return 'bg-slate-400 dark:bg-slate-600 border-slate-300 dark:border-slate-500 text-slate-700 dark:text-slate-300';
            case 'range':
                return 'bg-blue-400 border-blue-300 text-blue-900';
            default:
                return 'bg-primary-500 border-primary-400 text-white';
        }
    };

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/" className="control-btn" aria-label="Back to home">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Searching Algorithms
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Visualize Linear, Binary, and Jump search algorithms
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
                                        <div className="flex justify-between w-full">
                                            <span>{algo.name}</span>
                                            <span className="text-xs opacity-75">{algo.complexity}</span>
                                        </div>
                                        <span className="text-xs opacity-60 mt-0.5">{algo.requirement}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Target Input & Controls */}
                        <div className="algo-card">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                                Search Target
                            </h3>

                            <div className="flex gap-2 mb-4">
                                <input
                                    type="number"
                                    min="1"
                                    max="99"
                                    value={target}
                                    onChange={(e) => setTarget(e.target.value ? parseInt(e.target.value) : '')}
                                    placeholder="1-99"
                                    className="input-field flex-1"
                                    disabled={isRunning}
                                />
                                <button
                                    onClick={() => {
                                        const randomValue = array[Math.floor(Math.random() * array.length)]?.value;
                                        if (randomValue) setTarget(randomValue);
                                    }}
                                    disabled={isRunning}
                                    className="btn btn-secondary"
                                >
                                    <Target className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Array Size */}
                            <div className="mb-4">
                                <label className="text-sm text-slate-600 dark:text-slate-400 mb-1 block">
                                    Array Size: {arraySize}
                                </label>
                                <input
                                    type="range"
                                    min="5"
                                    max="25"
                                    value={arraySize}
                                    onChange={(e) => !isRunning && setArraySize(parseInt(e.target.value))}
                                    disabled={isRunning}
                                    className="w-full accent-primary-500"
                                />
                            </div>

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
                                        <Search className="w-4 h-4" />
                                        Search
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
                                    onClick={generateArray}
                                    disabled={isRunning}
                                    className="btn btn-secondary col-span-2 disabled:opacity-50"
                                >
                                    <Shuffle className="w-4 h-4" />
                                    New Array
                                </motion.button>
                            </div>
                        </div>

                        {/* Statistics */}
                        <div className="algo-card">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                                Statistics
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 text-center">
                                    <Search className="w-5 h-5 mx-auto mb-1 text-yellow-600 dark:text-yellow-400" />
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400">Comparisons</p>
                                    <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
                                        {comparisons}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-xl text-center ${result?.found
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                        : result?.found === false
                                            ? 'bg-red-100 dark:bg-red-900/30'
                                            : 'bg-slate-100 dark:bg-slate-800'
                                    }`}>
                                    <Target className={`w-5 h-5 mx-auto mb-1 ${result?.found
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : result?.found === false
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-slate-600 dark:text-slate-400'
                                        }`} />
                                    <p className={`text-xs ${result?.found
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : result?.found === false
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-slate-600 dark:text-slate-400'
                                        }`}>Result</p>
                                    <p className={`text-xl font-bold ${result?.found
                                            ? 'text-emerald-700 dark:text-emerald-300'
                                            : result?.found === false
                                                ? 'text-red-700 dark:text-red-300'
                                                : 'text-slate-700 dark:text-slate-300'
                                        }`}>
                                        {result?.found ? `Index ${result.index}` : result?.found === false ? 'Not Found' : '-'}
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
                                        <div className="w-3 h-3 rounded bg-primary-500" />
                                        <span className="text-slate-600 dark:text-slate-400">Default</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded bg-yellow-400" />
                                        <span className="text-slate-600 dark:text-slate-400">Searching</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded bg-blue-400" />
                                        <span className="text-slate-600 dark:text-slate-400">Active Range</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded bg-emerald-500" />
                                        <span className="text-slate-600 dark:text-slate-400">Found</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visualization Panel */}
                    <div className="lg:col-span-2 visualizer-container">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Visualization
                            </h3>
                            <AnimatePresence>
                                {message && (
                                    <motion.span
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${result?.found
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                                            }`}
                                    >
                                        {message}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Array Display */}
                        <div className="flex flex-wrap justify-center gap-2 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl min-h-[300px] items-center">
                            <AnimatePresence mode="popLayout">
                                {array.map((element, index) => (
                                    <motion.div
                                        key={element.id}
                                        layout
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        className="flex flex-col items-center"
                                    >
                                        <motion.div
                                            animate={{
                                                scale: element.state === 'searching' || element.state === 'found' ? 1.1 : 1,
                                                y: element.state === 'found' ? -10 : 0,
                                            }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                            className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg border-2 transition-colors duration-150 ${getElementColor(element.state)}`}
                                        >
                                            {element.value}
                                        </motion.div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {index}
                                        </span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Target Info */}
                        {target !== '' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center gap-3"
                            >
                                <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                <span className="text-primary-700 dark:text-primary-300 font-medium">
                                    Searching for: <span className="font-bold text-lg">{target}</span>
                                </span>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
