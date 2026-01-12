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
    BookOpen,
    TrendingUp,
    Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ArrayElement {
    id: number;
    value: number;
    state: 'default' | 'searching' | 'found' | 'checked' | 'range';
}

type Algorithm = 'linear' | 'binary' | 'jump' | 'interpolation' | 'exponential' | 'ternary';

interface AlgorithmInfo {
    id: Algorithm;
    name: string;
    complexity: { best: string; avg: string; worst: string };
    requirement: string;
    color: string;
    description: string;
    pseudocode: string[];
}

const algorithms: AlgorithmInfo[] = [
    {
        id: 'linear',
        name: 'Linear Search',
        complexity: { best: 'O(1)', avg: 'O(n)', worst: 'O(n)' },
        requirement: 'Any array',
        color: 'from-blue-500 to-cyan-500',
        description: 'Sequentially checks each element until found or end reached',
        pseudocode: [
            'for i = 0 to n-1:',
            '  if arr[i] == target:',
            '    return i',
            'return -1',
        ],
    },
    {
        id: 'binary',
        name: 'Binary Search',
        complexity: { best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)' },
        requirement: 'Sorted array',
        color: 'from-emerald-500 to-teal-500',
        description: 'Divides search space in half each iteration',
        pseudocode: [
            'left = 0, right = n-1',
            'while left <= right:',
            '  mid = (left + right) / 2',
            '  if arr[mid] == target: return mid',
            '  if arr[mid] < target: left = mid + 1',
            '  else: right = mid - 1',
            'return -1',
        ],
    },
    {
        id: 'jump',
        name: 'Jump Search',
        complexity: { best: 'O(1)', avg: 'O(√n)', worst: 'O(√n)' },
        requirement: 'Sorted array',
        color: 'from-violet-500 to-purple-500',
        description: 'Jumps ahead by √n steps, then linear search in block',
        pseudocode: [
            'step = √n',
            'while arr[min(step,n)-1] < target:',
            '  prev = step',
            '  step += √n',
            '  if prev >= n: return -1',
            'for i = prev to min(step,n):',
            '  if arr[i] == target: return i',
            'return -1',
        ],
    },
    {
        id: 'interpolation',
        name: 'Interpolation Search',
        complexity: { best: 'O(1)', avg: 'O(log log n)', worst: 'O(n)' },
        requirement: 'Sorted, uniform distribution',
        color: 'from-amber-500 to-orange-500',
        description: 'Estimates position based on value distribution',
        pseudocode: [
            'while lo <= hi and target in range:',
            '  pos = lo + ((target - arr[lo]) *',
            '         (hi - lo)) / (arr[hi] - arr[lo])',
            '  if arr[pos] == target: return pos',
            '  if arr[pos] < target: lo = pos + 1',
            '  else: hi = pos - 1',
            'return -1',
        ],
    },
    {
        id: 'exponential',
        name: 'Exponential Search',
        complexity: { best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)' },
        requirement: 'Sorted array',
        color: 'from-rose-500 to-pink-500',
        description: 'Finds range by doubling, then binary search',
        pseudocode: [
            'if arr[0] == target: return 0',
            'i = 1',
            'while i < n and arr[i] <= target:',
            '  i *= 2  // double the range',
            'binary_search(arr, i/2, min(i,n-1), target)',
        ],
    },
    {
        id: 'ternary',
        name: 'Ternary Search',
        complexity: { best: 'O(1)', avg: 'O(log₃ n)', worst: 'O(log₃ n)' },
        requirement: 'Sorted array',
        color: 'from-cyan-500 to-blue-500',
        description: 'Divides array into 3 parts each iteration',
        pseudocode: [
            'while left <= right:',
            '  mid1 = left + (right-left)/3',
            '  mid2 = right - (right-left)/3',
            '  if arr[mid1] == target: return mid1',
            '  if arr[mid2] == target: return mid2',
            '  if target < arr[mid1]: right = mid1 - 1',
            '  else if target > arr[mid2]: left = mid2 + 1',
            '  else: left = mid1 + 1, right = mid2 - 1',
        ],
    },
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
    const [currentStep, setCurrentStep] = useState(-1);
    const [executionTime, setExecutionTime] = useState(0);

    const isRunningRef = useRef(false);
    const isPausedRef = useRef(false);
    const speedRef = useRef(SPEEDS[1].ms);
    const startTimeRef = useRef(0);

    const currentAlgo = algorithms.find(a => a.id === selectedAlgorithm)!;

    useEffect(() => { speedRef.current = SPEEDS[speedIndex].ms; }, [speedIndex]);
    useEffect(() => { generateArray(); }, [arraySize, selectedAlgorithm]);

    const generateArray = useCallback(() => {
        const newArray: ArrayElement[] = Array.from({ length: arraySize }, (_, i) => ({
            id: i,
            value: Math.floor(Math.random() * 99) + 1,
            state: 'default',
        }));
        if (selectedAlgorithm !== 'linear') {
            newArray.sort((a, b) => a.value - b.value);
        }
        setArray(newArray);
        setComparisons(0);
        setResult(null);
        setMessage('');
        setCurrentStep(-1);
        setExecutionTime(0);
    }, [arraySize, selectedAlgorithm]);

    const sleep = (ms: number) =>
        new Promise<void>((resolve) => {
            const check = () => {
                if (!isRunningRef.current) { resolve(); return; }
                if (isPausedRef.current) { setTimeout(check, 50); }
                else { setTimeout(resolve, ms); }
            };
            check();
        });

    const updateArray = (arr: ArrayElement[]) => setArray([...arr]);

    // Linear Search
    const linearSearch = async (t: number) => {
        const arr = [...array];
        for (let i = 0; i < arr.length; i++) {
            if (!isRunningRef.current) return { found: false, index: -1 };
            setCurrentStep(0);
            arr.forEach((el, idx) => el.state = idx < i ? 'checked' : 'default');
            arr[i].state = 'searching';
            updateArray(arr);
            setComparisons(c => c + 1);
            await sleep(speedRef.current);
            setCurrentStep(1);
            if (arr[i].value === t) {
                arr[i].state = 'found';
                updateArray(arr);
                return { found: true, index: i };
            }
        }
        arr.forEach(el => el.state = 'checked');
        updateArray(arr);
        return { found: false, index: -1 };
    };

    // Binary Search
    const binarySearch = async (t: number) => {
        const arr = [...array];
        let left = 0, right = arr.length - 1;
        while (left <= right) {
            if (!isRunningRef.current) return { found: false, index: -1 };
            arr.forEach(el => el.state = 'default');
            for (let i = left; i <= right; i++) arr[i].state = 'range';
            const mid = Math.floor((left + right) / 2);
            setCurrentStep(2);
            arr[mid].state = 'searching';
            updateArray(arr);
            setComparisons(c => c + 1);
            await sleep(speedRef.current);
            setCurrentStep(3);
            if (arr[mid].value === t) {
                arr[mid].state = 'found';
                updateArray(arr);
                return { found: true, index: mid };
            }
            setCurrentStep(arr[mid].value < t ? 4 : 5);
            if (arr[mid].value < t) {
                for (let i = left; i <= mid; i++) arr[i].state = 'checked';
                left = mid + 1;
            } else {
                for (let i = mid; i <= right; i++) arr[i].state = 'checked';
                right = mid - 1;
            }
            updateArray(arr);
            await sleep(speedRef.current / 2);
        }
        arr.forEach(el => el.state = 'checked');
        updateArray(arr);
        return { found: false, index: -1 };
    };

    // Jump Search
    const jumpSearch = async (t: number) => {
        const arr = [...array];
        const n = arr.length;
        const step = Math.floor(Math.sqrt(n));
        let prev = 0, curr = step;
        setCurrentStep(0);
        while (curr < n && arr[curr].value < t) {
            if (!isRunningRef.current) return { found: false, index: -1 };
            setCurrentStep(1);
            for (let i = prev; i <= curr; i++) arr[i].state = 'checked';
            arr[curr].state = 'searching';
            updateArray(arr);
            setComparisons(c => c + 1);
            await sleep(speedRef.current);
            prev = curr;
            curr += step;
        }
        setCurrentStep(5);
        for (let i = prev; i < Math.min(curr + 1, n); i++) {
            if (!isRunningRef.current) return { found: false, index: -1 };
            arr[i].state = 'searching';
            updateArray(arr);
            setComparisons(c => c + 1);
            await sleep(speedRef.current);
            if (arr[i].value === t) {
                arr[i].state = 'found';
                updateArray(arr);
                return { found: true, index: i };
            }
            arr[i].state = 'checked';
        }
        arr.forEach(el => el.state = 'checked');
        updateArray(arr);
        return { found: false, index: -1 };
    };

    // Interpolation Search
    const interpolationSearch = async (t: number) => {
        const arr = [...array];
        let lo = 0, hi = arr.length - 1;
        setCurrentStep(0);
        while (lo <= hi && t >= arr[lo].value && t <= arr[hi].value) {
            if (!isRunningRef.current) return { found: false, index: -1 };
            arr.forEach(el => el.state = 'default');
            for (let i = lo; i <= hi; i++) arr[i].state = 'range';
            setCurrentStep(1);
            const pos = lo + Math.floor(((t - arr[lo].value) * (hi - lo)) / (arr[hi].value - arr[lo].value || 1));
            arr[pos].state = 'searching';
            updateArray(arr);
            setComparisons(c => c + 1);
            await sleep(speedRef.current);
            setCurrentStep(3);
            if (arr[pos].value === t) {
                arr[pos].state = 'found';
                updateArray(arr);
                return { found: true, index: pos };
            }
            setCurrentStep(arr[pos].value < t ? 4 : 5);
            if (arr[pos].value < t) {
                for (let i = lo; i <= pos; i++) arr[i].state = 'checked';
                lo = pos + 1;
            } else {
                for (let i = pos; i <= hi; i++) arr[i].state = 'checked';
                hi = pos - 1;
            }
            updateArray(arr);
            await sleep(speedRef.current / 2);
        }
        arr.forEach(el => el.state = 'checked');
        updateArray(arr);
        return { found: false, index: -1 };
    };

    // Exponential Search
    const exponentialSearch = async (t: number) => {
        const arr = [...array];
        setCurrentStep(0);
        if (arr[0].value === t) {
            arr[0].state = 'found';
            updateArray(arr);
            setComparisons(c => c + 1);
            return { found: true, index: 0 };
        }
        let i = 1;
        setCurrentStep(2);
        while (i < arr.length && arr[i].value <= t) {
            if (!isRunningRef.current) return { found: false, index: -1 };
            arr[i].state = 'searching';
            updateArray(arr);
            setComparisons(c => c + 1);
            await sleep(speedRef.current / 2);
            arr[i].state = 'range';
            i *= 2;
        }
        setCurrentStep(4);
        // Binary search in range
        let left = Math.floor(i / 2), right = Math.min(i, arr.length - 1);
        while (left <= right) {
            if (!isRunningRef.current) return { found: false, index: -1 };
            arr.forEach((el, idx) => { if (idx >= Math.floor(i / 2) && idx <= Math.min(i, arr.length - 1)) el.state = 'range'; });
            const mid = Math.floor((left + right) / 2);
            arr[mid].state = 'searching';
            updateArray(arr);
            setComparisons(c => c + 1);
            await sleep(speedRef.current);
            if (arr[mid].value === t) {
                arr[mid].state = 'found';
                updateArray(arr);
                return { found: true, index: mid };
            }
            if (arr[mid].value < t) left = mid + 1;
            else right = mid - 1;
            arr[mid].state = 'checked';
            updateArray(arr);
        }
        arr.forEach(el => el.state = 'checked');
        updateArray(arr);
        return { found: false, index: -1 };
    };

    // Ternary Search
    const ternarySearch = async (t: number) => {
        const arr = [...array];
        let left = 0, right = arr.length - 1;
        setCurrentStep(0);
        while (left <= right) {
            if (!isRunningRef.current) return { found: false, index: -1 };
            arr.forEach(el => el.state = 'default');
            for (let i = left; i <= right; i++) arr[i].state = 'range';
            const mid1 = left + Math.floor((right - left) / 3);
            const mid2 = right - Math.floor((right - left) / 3);
            setCurrentStep(1);
            arr[mid1].state = 'searching';
            arr[mid2].state = 'searching';
            updateArray(arr);
            setComparisons(c => c + 2);
            await sleep(speedRef.current);
            setCurrentStep(3);
            if (arr[mid1].value === t) {
                arr[mid1].state = 'found';
                updateArray(arr);
                return { found: true, index: mid1 };
            }
            setCurrentStep(4);
            if (arr[mid2].value === t) {
                arr[mid2].state = 'found';
                updateArray(arr);
                return { found: true, index: mid2 };
            }
            setCurrentStep(5);
            if (t < arr[mid1].value) {
                for (let i = mid1; i <= right; i++) arr[i].state = 'checked';
                right = mid1 - 1;
            } else if (t > arr[mid2].value) {
                for (let i = left; i <= mid2; i++) arr[i].state = 'checked';
                left = mid2 + 1;
            } else {
                for (let i = left; i <= mid1; i++) arr[i].state = 'checked';
                for (let i = mid2; i <= right; i++) arr[i].state = 'checked';
                left = mid1 + 1;
                right = mid2 - 1;
            }
            updateArray(arr);
            await sleep(speedRef.current / 2);
        }
        arr.forEach(el => el.state = 'checked');
        updateArray(arr);
        return { found: false, index: -1 };
    };

    const runAlgorithm = async () => {
        if (target === '' || target < 1 || target > 99) {
            setMessage('Enter a target (1-99)');
            return;
        }
        isRunningRef.current = true;
        isPausedRef.current = false;
        setIsRunning(true);
        setIsPaused(false);
        setComparisons(0);
        setResult(null);
        setMessage('');
        setCurrentStep(-1);
        startTimeRef.current = Date.now();
        setArray(prev => prev.map(el => ({ ...el, state: 'default' })));

        let res: { found: boolean; index: number } | undefined;
        switch (selectedAlgorithm) {
            case 'linear': res = await linearSearch(target); break;
            case 'binary': res = await binarySearch(target); break;
            case 'jump': res = await jumpSearch(target); break;
            case 'interpolation': res = await interpolationSearch(target); break;
            case 'exponential': res = await exponentialSearch(target); break;
            case 'ternary': res = await ternarySearch(target); break;
        }

        setExecutionTime(Date.now() - startTimeRef.current);
        if (res) {
            setResult(res);
            setMessage(res.found ? `Found ${target} at index ${res.index}!` : `${target} not found`);
        }
        setCurrentStep(-1);
        isRunningRef.current = false;
        setIsRunning(false);
    };

    const togglePause = () => { isPausedRef.current = !isPaused; setIsPaused(!isPaused); };
    const stop = () => { isRunningRef.current = false; setIsRunning(false); setIsPaused(false); setArray(prev => prev.map(el => ({ ...el, state: 'default' }))); setCurrentStep(-1); };

    const getElementColor = (state: ArrayElement['state']) => {
        switch (state) {
            case 'searching': return 'bg-yellow-400 border-yellow-300 text-yellow-900';
            case 'found': return 'bg-emerald-500 border-emerald-400 text-white';
            case 'checked': return 'bg-slate-400 dark:bg-slate-600 border-slate-300 text-slate-700 dark:text-slate-300';
            case 'range': return 'bg-blue-400 border-blue-300 text-blue-900';
            default: return 'bg-primary-500 border-primary-400 text-white';
        }
    };

    // Complexity comparison data
    const complexityData = [
        { n: 10, linear: 10, binary: 4, jump: 4, interpolation: 2, exponential: 4, ternary: 3 },
        { n: 100, linear: 100, binary: 7, jump: 10, interpolation: 3, exponential: 7, ternary: 5 },
        { n: 1000, linear: 1000, binary: 10, jump: 32, interpolation: 4, exponential: 10, ternary: 7 },
        { n: 10000, linear: 10000, binary: 14, jump: 100, interpolation: 4, exponential: 14, ternary: 9 },
    ];

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/" className="control-btn"><ChevronLeft className="w-5 h-5" /></Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Searching Algorithms</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">6 algorithms with complexity comparison</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Controls */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Algorithm Selection */}
                        <div className="algo-card">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" /> Algorithm
                            </h3>
                            <div className="space-y-1">
                                {algorithms.map(algo => (
                                    <button key={algo.id} onClick={() => !isRunning && setSelectedAlgorithm(algo.id)} disabled={isRunning}
                                        className={`w-full flex justify-between px-2 py-1.5 rounded text-xs font-medium transition ${selectedAlgorithm === algo.id ? `bg-gradient-to-r ${algo.color} text-white` : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                                        <span>{algo.name}</span>
                                        <span className="opacity-75">{algo.complexity.avg}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Algorithm Info */}
                        <div className="algo-card">
                            <div className={`h-1 w-full bg-gradient-to-r ${currentAlgo.color} rounded-full mb-2`} />
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{currentAlgo.description}</p>
                            <div className="text-xs grid grid-cols-2 gap-1">
                                <div className="flex gap-1"><span className="text-slate-500">Best:</span><span className="font-mono text-emerald-600">{currentAlgo.complexity.best}</span></div>
                                <div className="flex gap-1"><span className="text-slate-500">Avg:</span><span className="font-mono text-primary-600">{currentAlgo.complexity.avg}</span></div>
                                <div className="flex gap-1"><span className="text-slate-500">Worst:</span><span className="font-mono text-red-600">{currentAlgo.complexity.worst}</span></div>
                                <div className="flex gap-1"><span className="text-slate-500">Req:</span><span className="text-slate-600">{currentAlgo.requirement}</span></div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="algo-card">
                            <div className="flex gap-2 mb-2">
                                <input type="number" min="1" max="99" value={target} onChange={(e) => setTarget(e.target.value ? parseInt(e.target.value) : '')}
                                    placeholder="Target (1-99)" className="input-field flex-1" disabled={isRunning} />
                                <button onClick={() => { const rv = array[Math.floor(Math.random() * array.length)]?.value; if (rv) setTarget(rv); }}
                                    disabled={isRunning} className="btn btn-secondary"><Target className="w-4 h-4" /></button>
                            </div>

                            <div className="mb-2">
                                <label className="text-xs text-slate-600 dark:text-slate-400">Size: {arraySize}</label>
                                <input type="range" min="5" max="30" value={arraySize} onChange={(e) => !isRunning && setArraySize(parseInt(e.target.value))}
                                    disabled={isRunning} className="w-full accent-primary-500" />
                            </div>

                            <div className="flex gap-1 mb-2">
                                {SPEEDS.map((s, i) => (
                                    <button key={s.label} onClick={() => setSpeedIndex(i)}
                                        className={`flex-1 px-2 py-1 text-xs rounded transition ${speedIndex === i ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                        {s.label}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {!isRunning ? (
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={runAlgorithm} className="btn btn-primary col-span-2">
                                        <Search className="w-4 h-4" /> Search
                                    </motion.button>
                                ) : (
                                    <>
                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={togglePause} className="btn btn-secondary">
                                            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                                            {isPaused ? 'Resume' : 'Pause'}
                                        </motion.button>
                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={stop} className="btn btn-danger">
                                            <RotateCcw className="w-4 h-4" /> Stop
                                        </motion.button>
                                    </>
                                )}
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={generateArray} disabled={isRunning}
                                    className="btn btn-secondary col-span-2 disabled:opacity-50">
                                    <Shuffle className="w-4 h-4" /> New Array
                                </motion.button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="algo-card">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-2 rounded bg-yellow-100 dark:bg-yellow-900/30 text-center">
                                    <Search className="w-4 h-4 mx-auto text-yellow-600" />
                                    <p className="text-[10px] text-yellow-600">Comparisons</p>
                                    <p className="font-bold text-yellow-700 dark:text-yellow-300">{comparisons}</p>
                                </div>
                                <div className="p-2 rounded bg-blue-100 dark:bg-blue-900/30 text-center">
                                    <Clock className="w-4 h-4 mx-auto text-blue-600" />
                                    <p className="text-[10px] text-blue-600">Time</p>
                                    <p className="font-bold text-blue-700 dark:text-blue-300">{executionTime}ms</p>
                                </div>
                                <div className={`p-2 rounded text-center ${result?.found ? 'bg-emerald-100 dark:bg-emerald-900/30' : result?.found === false ? 'bg-red-100 dark:bg-red-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                    <Target className={`w-4 h-4 mx-auto ${result?.found ? 'text-emerald-600' : result?.found === false ? 'text-red-600' : 'text-slate-600'}`} />
                                    <p className={`text-[10px] ${result?.found ? 'text-emerald-600' : result?.found === false ? 'text-red-600' : 'text-slate-600'}`}>Result</p>
                                    <p className={`font-bold ${result?.found ? 'text-emerald-700' : result?.found === false ? 'text-red-700' : 'text-slate-700'}`}>
                                        {result?.found ? `[${result.index}]` : result?.found === false ? 'N/A' : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Pseudocode */}
                        <div className="algo-card">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Pseudocode</h3>
                            <div className="font-mono text-[10px] bg-slate-800 dark:bg-slate-900 p-2 rounded text-slate-300 max-h-24 overflow-auto">
                                {currentAlgo.pseudocode.map((line, i) => (
                                    <div key={i} className={`px-1 rounded ${currentStep === i ? 'bg-yellow-500/30 text-yellow-300' : ''}`}>{line}</div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Visualization */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="visualizer-container">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Visualization</h3>
                                <AnimatePresence>
                                    {message && (
                                        <motion.span initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${result?.found ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'}`}>
                                            {message}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex flex-wrap justify-center gap-2 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl min-h-[200px] items-center">
                                <AnimatePresence mode="popLayout">
                                    {array.map((el, idx) => (
                                        <motion.div key={el.id} layout initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                            className="flex flex-col items-center">
                                            <motion.div animate={{ scale: el.state === 'searching' || el.state === 'found' ? 1.1 : 1, y: el.state === 'found' ? -10 : 0 }}
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold border-2 ${getElementColor(el.state)}`}>
                                                {el.value}
                                            </motion.div>
                                            <span className="text-[10px] text-slate-500 mt-0.5">{idx}</span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {target !== '' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="mt-4 p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center gap-2">
                                    <Target className="w-4 h-4 text-primary-600" />
                                    <span className="text-primary-700 dark:text-primary-300 text-sm">Target: <strong>{target}</strong></span>
                                </motion.div>
                            )}
                        </div>

                        {/* Complexity Comparison Chart */}
                        <div className="algo-card">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Complexity Comparison (comparisons for n elements)
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700">
                                            <th className="text-left p-2 text-slate-500">n</th>
                                            <th className="text-center p-2 text-blue-600">Linear</th>
                                            <th className="text-center p-2 text-emerald-600">Binary</th>
                                            <th className="text-center p-2 text-violet-600">Jump</th>
                                            <th className="text-center p-2 text-amber-600">Interp.</th>
                                            <th className="text-center p-2 text-rose-600">Expon.</th>
                                            <th className="text-center p-2 text-cyan-600">Ternary</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {complexityData.map(row => (
                                            <tr key={row.n} className="border-b border-slate-100 dark:border-slate-800">
                                                <td className="p-2 font-mono font-bold">{row.n.toLocaleString()}</td>
                                                <td className="text-center p-2 font-mono text-blue-600">{row.linear}</td>
                                                <td className="text-center p-2 font-mono text-emerald-600">{row.binary}</td>
                                                <td className="text-center p-2 font-mono text-violet-600">{row.jump}</td>
                                                <td className="text-center p-2 font-mono text-amber-600">{row.interpolation}</td>
                                                <td className="text-center p-2 font-mono text-rose-600">{row.exponential}</td>
                                                <td className="text-center p-2 font-mono text-cyan-600">{row.ternary}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-3 flex gap-4 justify-center text-[10px] text-slate-500">
                                <span>📈 O(n) = Linear growth</span>
                                <span>📉 O(log n) = Logarithmic (much faster!)</span>
                                <span>⚡ O(log log n) = Best for uniform data</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
