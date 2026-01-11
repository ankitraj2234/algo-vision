import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    Pause,
    RotateCcw,
    Shuffle,
    ChevronLeft,
    Info,
    Zap,
    Gauge,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ArrayBar {
    id: number;
    value: number;
    state: 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot';
}

type Algorithm =
    | 'bubble'
    | 'selection'
    | 'insertion'
    | 'merge'
    | 'quick'
    | 'heap'
    | 'counting'
    | 'radix'
    | 'shell';

const algorithms: { id: Algorithm; name: string; complexity: string }[] = [
    { id: 'bubble', name: 'Bubble Sort', complexity: 'O(n²)' },
    { id: 'selection', name: 'Selection Sort', complexity: 'O(n²)' },
    { id: 'insertion', name: 'Insertion Sort', complexity: 'O(n²)' },
    { id: 'merge', name: 'Merge Sort', complexity: 'O(n log n)' },
    { id: 'quick', name: 'Quick Sort', complexity: 'O(n log n)' },
    { id: 'heap', name: 'Heap Sort', complexity: 'O(n log n)' },
    { id: 'counting', name: 'Counting Sort', complexity: 'O(n + k)' },
    { id: 'radix', name: 'Radix Sort', complexity: 'O(nk)' },
    { id: 'shell', name: 'Shell Sort', complexity: 'O(n log²n)' },
];

const SPEEDS = [
    { label: 'Slow', ms: 200 },
    { label: 'Medium', ms: 100 },
    { label: 'Fast', ms: 50 },
    { label: 'Ultra', ms: 10 },
];

export function SortingPage() {
    const [array, setArray] = useState<ArrayBar[]>([]);
    const [arraySize, setArraySize] = useState(20);
    const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>('bubble');
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [speedIndex, setSpeedIndex] = useState(1);
    const [comparisons, setComparisons] = useState(0);
    const [swaps, setSwaps] = useState(0);
    const [isSorted, setIsSorted] = useState(false);

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
        const newArray: ArrayBar[] = Array.from({ length: arraySize }, (_, i) => ({
            id: i,
            value: Math.floor(Math.random() * 90) + 10,
            state: 'default',
        }));
        setArray(newArray);
        setComparisons(0);
        setSwaps(0);
        setIsSorted(false);
    }, [arraySize]);

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

    const updateArray = (newArray: ArrayBar[]) => {
        setArray([...newArray]);
    };

    // Bubble Sort
    const bubbleSort = async () => {
        const arr = [...array];
        for (let i = 0; i < arr.length - 1; i++) {
            for (let j = 0; j < arr.length - i - 1; j++) {
                if (!isRunningRef.current) return;

                arr[j].state = 'comparing';
                arr[j + 1].state = 'comparing';
                updateArray(arr);
                setComparisons((c) => c + 1);
                await sleep(speedRef.current);

                if (arr[j].value > arr[j + 1].value) {
                    arr[j].state = 'swapping';
                    arr[j + 1].state = 'swapping';
                    updateArray(arr);
                    await sleep(speedRef.current);

                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    setSwaps((s) => s + 1);
                }

                arr[j].state = 'default';
                arr[j + 1].state = 'default';
            }
            arr[arr.length - 1 - i].state = 'sorted';
        }
        arr[0].state = 'sorted';
        updateArray(arr);
        setIsSorted(true);
    };

    // Selection Sort
    const selectionSort = async () => {
        const arr = [...array];
        for (let i = 0; i < arr.length - 1; i++) {
            let minIdx = i;
            arr[i].state = 'comparing';
            updateArray(arr);

            for (let j = i + 1; j < arr.length; j++) {
                if (!isRunningRef.current) return;

                arr[j].state = 'comparing';
                updateArray(arr);
                setComparisons((c) => c + 1);
                await sleep(speedRef.current);

                if (arr[j].value < arr[minIdx].value) {
                    if (minIdx !== i) arr[minIdx].state = 'default';
                    minIdx = j;
                    arr[minIdx].state = 'pivot';
                } else {
                    arr[j].state = 'default';
                }
                updateArray(arr);
            }

            if (minIdx !== i) {
                arr[i].state = 'swapping';
                arr[minIdx].state = 'swapping';
                updateArray(arr);
                await sleep(speedRef.current);

                [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
                setSwaps((s) => s + 1);
            }

            arr[i].state = 'sorted';
            if (minIdx !== i) arr[minIdx].state = 'default';
            updateArray(arr);
        }
        arr[arr.length - 1].state = 'sorted';
        updateArray(arr);
        setIsSorted(true);
    };

    // Insertion Sort
    const insertionSort = async () => {
        const arr = [...array];
        arr[0].state = 'sorted';
        updateArray(arr);

        for (let i = 1; i < arr.length; i++) {
            if (!isRunningRef.current) return;

            const key = arr[i];
            key.state = 'pivot';
            updateArray(arr);
            await sleep(speedRef.current);

            let j = i - 1;
            while (j >= 0 && arr[j].value > key.value) {
                if (!isRunningRef.current) return;

                arr[j].state = 'comparing';
                setComparisons((c) => c + 1);
                updateArray(arr);
                await sleep(speedRef.current);

                arr[j + 1] = arr[j];
                arr[j].state = 'sorted';
                setSwaps((s) => s + 1);
                j--;
            }
            arr[j + 1] = key;
            arr[j + 1].state = 'sorted';
            updateArray(arr);
        }
        setIsSorted(true);
    };

    // Quick Sort
    const quickSort = async () => {
        const arr = [...array];

        const partition = async (low: number, high: number): Promise<number> => {
            const pivot = arr[high];
            pivot.state = 'pivot';
            updateArray(arr);
            let i = low - 1;

            for (let j = low; j < high; j++) {
                if (!isRunningRef.current) return -1;

                arr[j].state = 'comparing';
                updateArray(arr);
                setComparisons((c) => c + 1);
                await sleep(speedRef.current);

                if (arr[j].value < pivot.value) {
                    i++;
                    if (i !== j) {
                        arr[i].state = 'swapping';
                        arr[j].state = 'swapping';
                        updateArray(arr);
                        await sleep(speedRef.current);

                        [arr[i], arr[j]] = [arr[j], arr[i]];
                        setSwaps((s) => s + 1);
                    }
                }
                arr[j].state = 'default';
                if (i >= low) arr[i].state = 'default';
            }

            arr[i + 1].state = 'swapping';
            arr[high].state = 'swapping';
            updateArray(arr);
            await sleep(speedRef.current);

            [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
            arr[i + 1].state = 'sorted';
            setSwaps((s) => s + 1);
            updateArray(arr);

            return i + 1;
        };

        const sort = async (low: number, high: number) => {
            if (low < high) {
                const pi = await partition(low, high);
                if (pi === -1) return;
                await sort(low, pi - 1);
                await sort(pi + 1, high);
            } else if (low === high) {
                arr[low].state = 'sorted';
                updateArray(arr);
            }
        };

        await sort(0, arr.length - 1);
        arr.forEach((bar) => (bar.state = 'sorted'));
        updateArray(arr);
        setIsSorted(true);
    };

    // Merge Sort
    const mergeSort = async () => {
        const arr = [...array];

        const merge = async (l: number, m: number, r: number) => {
            const left = arr.slice(l, m + 1);
            const right = arr.slice(m + 1, r + 1);
            let i = 0,
                j = 0,
                k = l;

            while (i < left.length && j < right.length) {
                if (!isRunningRef.current) return;

                arr[k].state = 'comparing';
                updateArray(arr);
                setComparisons((c) => c + 1);
                await sleep(speedRef.current);

                if (left[i].value <= right[j].value) {
                    arr[k] = { ...left[i], state: 'swapping' };
                    i++;
                } else {
                    arr[k] = { ...right[j], state: 'swapping' };
                    j++;
                }
                setSwaps((s) => s + 1);
                updateArray(arr);
                await sleep(speedRef.current);
                arr[k].state = 'default';
                k++;
            }

            while (i < left.length) {
                arr[k] = { ...left[i], state: 'default' };
                i++;
                k++;
            }

            while (j < right.length) {
                arr[k] = { ...right[j], state: 'default' };
                j++;
                k++;
            }
            updateArray(arr);
        };

        const sort = async (l: number, r: number) => {
            if (l < r) {
                const m = Math.floor((l + r) / 2);
                await sort(l, m);
                await sort(m + 1, r);
                await merge(l, m, r);
            }
        };

        await sort(0, arr.length - 1);
        arr.forEach((bar) => (bar.state = 'sorted'));
        updateArray(arr);
        setIsSorted(true);
    };

    // Heap Sort
    const heapSort = async () => {
        const arr = [...array];

        const heapify = async (n: number, i: number) => {
            let largest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;

            if (!isRunningRef.current) return;

            if (left < n) {
                arr[left].state = 'comparing';
                arr[largest].state = 'comparing';
                updateArray(arr);
                setComparisons((c) => c + 1);
                await sleep(speedRef.current);
                if (arr[left].value > arr[largest].value) {
                    largest = left;
                }
                arr[left].state = 'default';
            }

            if (right < n) {
                arr[right].state = 'comparing';
                arr[largest].state = 'comparing';
                updateArray(arr);
                setComparisons((c) => c + 1);
                await sleep(speedRef.current);
                if (arr[right].value > arr[largest].value) {
                    largest = right;
                }
                arr[right].state = 'default';
            }

            if (largest !== i) {
                arr[i].state = 'swapping';
                arr[largest].state = 'swapping';
                updateArray(arr);
                await sleep(speedRef.current);

                [arr[i], arr[largest]] = [arr[largest], arr[i]];
                setSwaps((s) => s + 1);

                arr[i].state = 'default';
                arr[largest].state = 'default';
                updateArray(arr);

                await heapify(n, largest);
            }
            arr[i].state = 'default';
            updateArray(arr);
        };

        // Build max heap
        for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
            await heapify(arr.length, i);
        }

        // Extract elements
        for (let i = arr.length - 1; i > 0; i--) {
            if (!isRunningRef.current) return;

            arr[0].state = 'swapping';
            arr[i].state = 'swapping';
            updateArray(arr);
            await sleep(speedRef.current);

            [arr[0], arr[i]] = [arr[i], arr[0]];
            setSwaps((s) => s + 1);

            arr[i].state = 'sorted';
            arr[0].state = 'default';
            updateArray(arr);

            await heapify(i, 0);
        }

        arr[0].state = 'sorted';
        updateArray(arr);
        setIsSorted(true);
    };

    // Counting Sort (simplified for positive integers)
    const countingSort = async () => {
        const arr = [...array];
        const max = Math.max(...arr.map((b) => b.value));
        const count = new Array(max + 1).fill(0);
        const output: ArrayBar[] = new Array(arr.length);

        // Count occurrences
        for (let i = 0; i < arr.length; i++) {
            if (!isRunningRef.current) return;
            arr[i].state = 'comparing';
            updateArray(arr);
            await sleep(speedRef.current / 2);
            count[arr[i].value]++;
            arr[i].state = 'default';
            setComparisons((c) => c + 1);
        }

        // Cumulative count
        for (let i = 1; i <= max; i++) {
            count[i] += count[i - 1];
        }

        // Build output
        for (let i = arr.length - 1; i >= 0; i--) {
            if (!isRunningRef.current) return;
            const pos = count[arr[i].value] - 1;
            output[pos] = { ...arr[i], state: 'swapping' };
            count[arr[i].value]--;
            setSwaps((s) => s + 1);

            // Update visualization
            for (let j = 0; j < output.length; j++) {
                if (output[j]) arr[j] = { ...output[j] };
            }
            updateArray(arr);
            await sleep(speedRef.current);
        }

        arr.forEach((bar) => (bar.state = 'sorted'));
        updateArray(arr);
        setIsSorted(true);
    };

    // Shell Sort
    const shellSort = async () => {
        const arr = [...array];
        let gap = Math.floor(arr.length / 2);

        while (gap > 0) {
            for (let i = gap; i < arr.length; i++) {
                if (!isRunningRef.current) return;

                const temp = arr[i];
                temp.state = 'pivot';
                let j = i;

                while (j >= gap) {
                    arr[j - gap].state = 'comparing';
                    updateArray(arr);
                    setComparisons((c) => c + 1);
                    await sleep(speedRef.current);

                    if (arr[j - gap].value > temp.value) {
                        arr[j] = { ...arr[j - gap], state: 'swapping' };
                        arr[j - gap].state = 'default';
                        setSwaps((s) => s + 1);
                        updateArray(arr);
                        await sleep(speedRef.current);
                        j -= gap;
                    } else {
                        arr[j - gap].state = 'default';
                        break;
                    }
                }
                arr[j] = { ...temp, state: 'default' };
                updateArray(arr);
            }
            gap = Math.floor(gap / 2);
        }

        arr.forEach((bar) => (bar.state = 'sorted'));
        updateArray(arr);
        setIsSorted(true);
    };

    // Radix Sort
    const radixSort = async () => {
        const arr = [...array];
        const max = Math.max(...arr.map((b) => b.value));
        let exp = 1;

        while (Math.floor(max / exp) > 0) {
            const output: ArrayBar[] = new Array(arr.length);
            const count = new Array(10).fill(0);

            for (let i = 0; i < arr.length; i++) {
                if (!isRunningRef.current) return;
                arr[i].state = 'comparing';
                updateArray(arr);
                await sleep(speedRef.current / 3);
                const digit = Math.floor(arr[i].value / exp) % 10;
                count[digit]++;
                arr[i].state = 'default';
                setComparisons((c) => c + 1);
            }

            for (let i = 1; i < 10; i++) {
                count[i] += count[i - 1];
            }

            for (let i = arr.length - 1; i >= 0; i--) {
                const digit = Math.floor(arr[i].value / exp) % 10;
                const pos = count[digit] - 1;
                output[pos] = { ...arr[i], state: 'swapping' };
                count[digit]--;
                setSwaps((s) => s + 1);
            }

            for (let i = 0; i < arr.length; i++) {
                arr[i] = output[i];
            }
            updateArray(arr);
            await sleep(speedRef.current);

            exp *= 10;
        }

        arr.forEach((bar) => (bar.state = 'sorted'));
        updateArray(arr);
        setIsSorted(true);
    };

    const runAlgorithm = async () => {
        isRunningRef.current = true;
        isPausedRef.current = false;
        setIsRunning(true);
        setIsPaused(false);
        setComparisons(0);
        setSwaps(0);

        // Reset states
        setArray((prev) => prev.map((bar) => ({ ...bar, state: 'default' })));

        switch (selectedAlgorithm) {
            case 'bubble':
                await bubbleSort();
                break;
            case 'selection':
                await selectionSort();
                break;
            case 'insertion':
                await insertionSort();
                break;
            case 'merge':
                await mergeSort();
                break;
            case 'quick':
                await quickSort();
                break;
            case 'heap':
                await heapSort();
                break;
            case 'counting':
                await countingSort();
                break;
            case 'radix':
                await radixSort();
                break;
            case 'shell':
                await shellSort();
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
        setArray((prev) => prev.map((bar) => ({ ...bar, state: 'default' })));
    };

    const getBarColor = (state: ArrayBar['state']) => {
        switch (state) {
            case 'comparing':
                return 'bg-yellow-400';
            case 'swapping':
                return 'bg-red-500';
            case 'sorted':
                return 'bg-emerald-500';
            case 'pivot':
                return 'bg-purple-500';
            default:
                return 'bg-primary-500';
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
                            Sorting Algorithms
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Visualize 9 different sorting algorithms with step-by-step animations
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
                            <div className="grid grid-cols-1 gap-2">
                                {algorithms.map((algo) => (
                                    <motion.button
                                        key={algo.id}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={() => !isRunning && setSelectedAlgorithm(algo.id)}
                                        disabled={isRunning}
                                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedAlgorithm === algo.id
                                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                            } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span>{algo.name}</span>
                                        <span className="text-xs opacity-75">{algo.complexity}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="algo-card">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                                Controls
                            </h3>

                            {/* Array Size */}
                            <div className="mb-4">
                                <label className="text-sm text-slate-600 dark:text-slate-400 mb-1 block">
                                    Array Size: {arraySize}
                                </label>
                                <input
                                    type="range"
                                    min="5"
                                    max="50"
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
                                    onClick={generateArray}
                                    disabled={isRunning}
                                    className="btn btn-secondary col-span-2 disabled:opacity-50"
                                >
                                    <Shuffle className="w-4 h-4" />
                                    Generate New Array
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
                                    <Zap className="w-5 h-5 mx-auto mb-1 text-yellow-600 dark:text-yellow-400" />
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400">Comparisons</p>
                                    <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
                                        {comparisons}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-center">
                                    <Gauge className="w-5 h-5 mx-auto mb-1 text-red-600 dark:text-red-400" />
                                    <p className="text-xs text-red-600 dark:text-red-400">Swaps</p>
                                    <p className="text-xl font-bold text-red-700 dark:text-red-300">{swaps}</p>
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
                                        <span className="text-slate-600 dark:text-slate-400">Comparing</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded bg-red-500" />
                                        <span className="text-slate-600 dark:text-slate-400">Swapping</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded bg-emerald-500" />
                                        <span className="text-slate-600 dark:text-slate-400">Sorted</span>
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
                                {isSorted && (
                                    <motion.span
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 text-sm font-medium"
                                    >
                                        ✓ Sorted!
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Bar Chart */}
                        <div className="flex items-end justify-center gap-[2px] h-[400px] p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            {array.map((bar) => (
                                <motion.div
                                    key={bar.id}
                                    layout
                                    className={`${getBarColor(bar.state)} rounded-t-sm transition-colors duration-100`}
                                    style={{
                                        height: `${(bar.value / 100) * 100}%`,
                                        width: `${Math.max(100 / array.length - 0.5, 2)}%`,
                                    }}
                                    initial={false}
                                    animate={{ scaleY: 1 }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
