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
    BookOpen,
    Clock,
    GitCompare,
    Edit3,
    Target,
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

interface AlgorithmInfo {
    id: Algorithm;
    name: string;
    complexity: { best: string; avg: string; worst: string };
    space: string;
    stable: boolean;
    color: string;
    pseudocode: string[];
}

const algorithms: AlgorithmInfo[] = [
    {
        id: 'bubble',
        name: 'Bubble Sort',
        complexity: { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)' },
        space: 'O(1)',
        stable: true,
        color: 'from-blue-500 to-cyan-500',
        pseudocode: [
            'for i = 0 to n-1:',
            '  for j = 0 to n-i-1:',
            '    if arr[j] > arr[j+1]:',
            '      swap(arr[j], arr[j+1])',
        ],
    },
    {
        id: 'selection',
        name: 'Selection Sort',
        complexity: { best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)' },
        space: 'O(1)',
        stable: false,
        color: 'from-amber-500 to-orange-500',
        pseudocode: [
            'for i = 0 to n-1:',
            '  min_idx = i',
            '  for j = i+1 to n:',
            '    if arr[j] < arr[min_idx]:',
            '      min_idx = j',
            '  swap(arr[i], arr[min_idx])',
        ],
    },
    {
        id: 'insertion',
        name: 'Insertion Sort',
        complexity: { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)' },
        space: 'O(1)',
        stable: true,
        color: 'from-emerald-500 to-teal-500',
        pseudocode: [
            'for i = 1 to n:',
            '  key = arr[i]',
            '  j = i - 1',
            '  while j >= 0 and arr[j] > key:',
            '    arr[j+1] = arr[j]',
            '    j = j - 1',
            '  arr[j+1] = key',
        ],
    },
    {
        id: 'merge',
        name: 'Merge Sort',
        complexity: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)' },
        space: 'O(n)',
        stable: true,
        color: 'from-violet-500 to-purple-500',
        pseudocode: [
            'mergeSort(arr, l, r):',
            '  if l < r:',
            '    m = (l + r) / 2',
            '    mergeSort(arr, l, m)',
            '    mergeSort(arr, m+1, r)',
            '    merge(arr, l, m, r)',
        ],
    },
    {
        id: 'quick',
        name: 'Quick Sort',
        complexity: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)' },
        space: 'O(log n)',
        stable: false,
        color: 'from-rose-500 to-pink-500',
        pseudocode: [
            'quickSort(arr, low, high):',
            '  if low < high:',
            '    pivot = partition(arr, low, high)',
            '    quickSort(arr, low, pivot-1)',
            '    quickSort(arr, pivot+1, high)',
        ],
    },
    {
        id: 'heap',
        name: 'Heap Sort',
        complexity: { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)' },
        space: 'O(1)',
        stable: false,
        color: 'from-red-500 to-orange-500',
        pseudocode: [
            'buildMaxHeap(arr)',
            'for i = n-1 to 1:',
            '  swap(arr[0], arr[i])',
            '  heapify(arr, 0, i)',
        ],
    },
    {
        id: 'counting',
        name: 'Counting Sort',
        complexity: { best: 'O(n+k)', avg: 'O(n+k)', worst: 'O(n+k)' },
        space: 'O(k)',
        stable: true,
        color: 'from-cyan-500 to-blue-500',
        pseudocode: [
            'count[0..k] = 0',
            'for each x in arr:',
            '  count[x]++',
            'for i = 1 to k:',
            '  count[i] += count[i-1]',
            'for x in arr (reverse):',
            '  output[count[x]-1] = x',
        ],
    },
    {
        id: 'radix',
        name: 'Radix Sort',
        complexity: { best: 'O(nk)', avg: 'O(nk)', worst: 'O(nk)' },
        space: 'O(n+k)',
        stable: true,
        color: 'from-indigo-500 to-violet-500',
        pseudocode: [
            'for each digit position:',
            '  countingSort(arr, digit)',
        ],
    },
    {
        id: 'shell',
        name: 'Shell Sort',
        complexity: { best: 'O(n log n)', avg: 'O(n^1.3)', worst: 'O(n²)' },
        space: 'O(1)',
        stable: false,
        color: 'from-slate-500 to-gray-600',
        pseudocode: [
            'gap = n / 2',
            'while gap > 0:',
            '  for i = gap to n:',
            '    temp = arr[i]',
            '    j = i',
            '    while j >= gap and arr[j-gap] > temp:',
            '      arr[j] = arr[j-gap]',
            '      j -= gap',
            '    arr[j] = temp',
            '  gap /= 2',
        ],
    },
];

const SPEEDS = [
    { label: 'Slow', ms: 200 },
    { label: 'Medium', ms: 100 },
    { label: 'Fast', ms: 50 },
    { label: 'Ultra', ms: 10 },
];

const PRESETS = [
    { label: 'Random', generator: (size: number) => Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10) },
    {
        label: 'Nearly Sorted', generator: (size: number) => {
            const arr = Array.from({ length: size }, (_, i) => Math.floor((i / size) * 90) + 10);
            for (let i = 0; i < size / 10; i++) {
                const idx = Math.floor(Math.random() * size);
                const swapIdx = Math.min(idx + 1, size - 1);
                [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
            }
            return arr;
        }
    },
    { label: 'Reversed', generator: (size: number) => Array.from({ length: size }, (_, i) => Math.floor(((size - i) / size) * 90) + 10) },
    { label: 'Few Unique', generator: (size: number) => Array.from({ length: size }, () => [20, 45, 70, 95][Math.floor(Math.random() * 4)]) },
];

export function SortingPage() {
    // Mode: single or compare
    const [mode, setMode] = useState<'single' | 'compare'>('single');

    // Arrays and algorithms
    const [array1, setArray1] = useState<ArrayBar[]>([]);
    const [array2, setArray2] = useState<ArrayBar[]>([]);
    const [algorithm1, setAlgorithm1] = useState<Algorithm>('bubble');
    const [algorithm2, setAlgorithm2] = useState<Algorithm>('quick');

    // Controls
    const [arraySize, setArraySize] = useState(25);
    const [speedIndex, setSpeedIndex] = useState(1);
    const [presetIndex, setPresetIndex] = useState(0);

    // Running state
    const [isRunning1, setIsRunning1] = useState(false);
    const [isRunning2, setIsRunning2] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // Stats
    const [stats1, setStats1] = useState({ comparisons: 0, swaps: 0, time: 0 });
    const [stats2, setStats2] = useState({ comparisons: 0, swaps: 0, time: 0 });
    const [isSorted1, setIsSorted1] = useState(false);
    const [isSorted2, setIsSorted2] = useState(false);

    // Custom input
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customInputText, setCustomInputText] = useState('');

    // Pseudocode highlighting
    const [currentStep1, setCurrentStep1] = useState(-1);
    const [currentStep2, setCurrentStep2] = useState(-1);

    // Refs
    const isRunning1Ref = useRef(false);
    const isRunning2Ref = useRef(false);
    const isPausedRef = useRef(false);
    const speedRef = useRef(SPEEDS[1].ms);
    const startTime1Ref = useRef(0);
    const startTime2Ref = useRef(0);

    const currentAlgo1 = algorithms.find((a) => a.id === algorithm1)!;
    const currentAlgo2 = algorithms.find((a) => a.id === algorithm2)!;
    const isRunning = isRunning1 || isRunning2;

    useEffect(() => {
        speedRef.current = SPEEDS[speedIndex].ms;
    }, [speedIndex]);

    useEffect(() => {
        generateArrays();
    }, [arraySize, presetIndex]);

    const generateArrays = useCallback(() => {
        const values = PRESETS[presetIndex].generator(arraySize);
        const newArray1: ArrayBar[] = values.map((v, i) => ({ id: i, value: v, state: 'default' as const }));
        const newArray2: ArrayBar[] = values.map((v, i) => ({ id: i, value: v, state: 'default' as const }));
        setArray1(newArray1);
        setArray2(newArray2);
        setStats1({ comparisons: 0, swaps: 0, time: 0 });
        setStats2({ comparisons: 0, swaps: 0, time: 0 });
        setIsSorted1(false);
        setIsSorted2(false);
        setCurrentStep1(-1);
        setCurrentStep2(-1);
    }, [arraySize, presetIndex]);

    const applyCustomInput = () => {
        try {
            const values = customInputText.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0 && n <= 100);
            if (values.length < 2) throw new Error('Need at least 2 values');
            if (values.length > 50) throw new Error('Max 50 values');

            const newArray1: ArrayBar[] = values.map((v, i) => ({ id: i, value: v, state: 'default' as const }));
            const newArray2: ArrayBar[] = values.map((v, i) => ({ id: i, value: v, state: 'default' as const }));
            setArray1(newArray1);
            setArray2(newArray2);
            setStats1({ comparisons: 0, swaps: 0, time: 0 });
            setStats2({ comparisons: 0, swaps: 0, time: 0 });
            setShowCustomInput(false);
        } catch {
            alert('Enter comma-separated numbers (1-100), e.g., 45, 23, 67, 12');
        }
    };

    const sleep = (ms: number, ref: React.MutableRefObject<boolean>) =>
        new Promise<void>((resolve) => {
            const checkPause = () => {
                if (!ref.current) { resolve(); return; }
                if (isPausedRef.current) {
                    setTimeout(checkPause, 50);
                } else {
                    setTimeout(resolve, ms);
                }
            };
            checkPause();
        });

    // Generic sort runner
    const runSort = async (
        arr: ArrayBar[],
        setArr: React.Dispatch<React.SetStateAction<ArrayBar[]>>,
        algo: Algorithm,
        isRunningRef: React.MutableRefObject<boolean>,
        setStats: React.Dispatch<React.SetStateAction<{ comparisons: number; swaps: number; time: number }>>,
        setIsSorted: React.Dispatch<React.SetStateAction<boolean>>,
        setStep: React.Dispatch<React.SetStateAction<number>>,
        startTimeRef: React.MutableRefObject<number>
    ) => {
        const updateArr = (a: ArrayBar[]) => setArr([...a]);
        const addComparison = () => setStats(s => ({ ...s, comparisons: s.comparisons + 1 }));
        const addSwap = () => setStats(s => ({ ...s, swaps: s.swaps + 1 }));
        const updateTime = () => setStats(s => ({ ...s, time: Date.now() - startTimeRef.current }));

        startTimeRef.current = Date.now();

        switch (algo) {
            case 'bubble':
                await bubbleSort(arr, updateArr, addComparison, addSwap, isRunningRef, setStep, updateTime);
                break;
            case 'selection':
                await selectionSort(arr, updateArr, addComparison, addSwap, isRunningRef, setStep, updateTime);
                break;
            case 'insertion':
                await insertionSort(arr, updateArr, addComparison, addSwap, isRunningRef, setStep, updateTime);
                break;
            case 'quick':
                await quickSort(arr, updateArr, addComparison, addSwap, isRunningRef, setStep, updateTime);
                break;
            case 'merge':
                await mergeSort(arr, updateArr, addComparison, addSwap, isRunningRef, setStep, updateTime);
                break;
            case 'heap':
                await heapSort(arr, updateArr, addComparison, addSwap, isRunningRef, setStep, updateTime);
                break;
            case 'counting':
                await countingSort(arr, updateArr, addComparison, addSwap, isRunningRef, setStep, updateTime);
                break;
            case 'radix':
                await radixSort(arr, updateArr, addComparison, addSwap, isRunningRef, setStep, updateTime);
                break;
            case 'shell':
                await shellSort(arr, updateArr, addComparison, addSwap, isRunningRef, setStep, updateTime);
                break;
        }

        arr.forEach(b => b.state = 'sorted');
        updateArr(arr);
        updateTime();
        setIsSorted(true);
        setStep(-1);
    };

    // Bubble Sort
    const bubbleSort = async (arr: ArrayBar[], updateArr: (a: ArrayBar[]) => void, addComp: () => void, addSwap: () => void, ref: React.MutableRefObject<boolean>, setStep: React.Dispatch<React.SetStateAction<number>>, updateTime: () => void) => {
        for (let i = 0; i < arr.length - 1; i++) {
            setStep(0);
            for (let j = 0; j < arr.length - i - 1; j++) {
                if (!ref.current) return;
                setStep(1);
                arr[j].state = 'comparing'; arr[j + 1].state = 'comparing';
                updateArr(arr); addComp(); await sleep(speedRef.current, ref);
                setStep(2);
                if (arr[j].value > arr[j + 1].value) {
                    setStep(3);
                    arr[j].state = 'swapping'; arr[j + 1].state = 'swapping';
                    updateArr(arr); await sleep(speedRef.current, ref);
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; addSwap();
                }
                arr[j].state = 'default'; arr[j + 1].state = 'default';
                updateTime();
            }
            arr[arr.length - 1 - i].state = 'sorted';
        }
        arr[0].state = 'sorted';
        updateArr(arr);
    };

    // Selection Sort
    const selectionSort = async (arr: ArrayBar[], updateArr: (a: ArrayBar[]) => void, addComp: () => void, addSwap: () => void, ref: React.MutableRefObject<boolean>, setStep: React.Dispatch<React.SetStateAction<number>>, updateTime: () => void) => {
        for (let i = 0; i < arr.length - 1; i++) {
            if (!ref.current) return;
            let minIdx = i;
            setStep(0); arr[i].state = 'comparing'; updateArr(arr);
            for (let j = i + 1; j < arr.length; j++) {
                if (!ref.current) return;
                setStep(2); arr[j].state = 'comparing'; updateArr(arr); addComp();
                await sleep(speedRef.current, ref);
                setStep(3);
                if (arr[j].value < arr[minIdx].value) {
                    setStep(4); if (minIdx !== i) arr[minIdx].state = 'default';
                    minIdx = j; arr[minIdx].state = 'pivot';
                } else { arr[j].state = 'default'; }
                updateArr(arr); updateTime();
            }
            if (minIdx !== i) {
                setStep(5); arr[i].state = 'swapping'; arr[minIdx].state = 'swapping';
                updateArr(arr); await sleep(speedRef.current, ref);
                [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]; addSwap();
            }
            arr[i].state = 'sorted'; if (minIdx !== i) arr[minIdx].state = 'default';
            updateArr(arr);
        }
        arr[arr.length - 1].state = 'sorted'; updateArr(arr);
    };

    // Insertion Sort
    const insertionSort = async (arr: ArrayBar[], updateArr: (a: ArrayBar[]) => void, addComp: () => void, addSwap: () => void, ref: React.MutableRefObject<boolean>, setStep: React.Dispatch<React.SetStateAction<number>>, updateTime: () => void) => {
        arr[0].state = 'sorted'; updateArr(arr);
        for (let i = 1; i < arr.length; i++) {
            if (!ref.current) return;
            setStep(0); const key = arr[i]; key.state = 'pivot'; updateArr(arr);
            setStep(1); await sleep(speedRef.current, ref);
            let j = i - 1;
            setStep(3);
            while (j >= 0 && arr[j].value > key.value) {
                if (!ref.current) return;
                setStep(4); arr[j].state = 'comparing'; addComp(); updateArr(arr);
                await sleep(speedRef.current, ref);
                setStep(5); arr[j + 1] = arr[j]; arr[j].state = 'sorted'; addSwap(); j--;
                updateTime();
            }
            setStep(6); arr[j + 1] = key; arr[j + 1].state = 'sorted'; updateArr(arr);
        }
    };

    // Quick Sort
    const quickSort = async (arr: ArrayBar[], updateArr: (a: ArrayBar[]) => void, addComp: () => void, addSwap: () => void, ref: React.MutableRefObject<boolean>, setStep: React.Dispatch<React.SetStateAction<number>>, updateTime: () => void) => {
        const partition = async (low: number, high: number): Promise<number> => {
            const pivot = arr[high]; pivot.state = 'pivot'; updateArr(arr);
            let i = low - 1;
            for (let j = low; j < high; j++) {
                if (!ref.current) return -1;
                setStep(2); arr[j].state = 'comparing'; updateArr(arr); addComp();
                await sleep(speedRef.current, ref);
                if (arr[j].value < pivot.value) {
                    i++;
                    if (i !== j) {
                        arr[i].state = 'swapping'; arr[j].state = 'swapping';
                        updateArr(arr); await sleep(speedRef.current, ref);
                        [arr[i], arr[j]] = [arr[j], arr[i]]; addSwap();
                    }
                }
                arr[j].state = 'default'; if (i >= low) arr[i].state = 'default';
                updateTime();
            }
            setStep(3); arr[i + 1].state = 'swapping'; arr[high].state = 'swapping';
            updateArr(arr); await sleep(speedRef.current, ref);
            [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
            arr[i + 1].state = 'sorted'; addSwap(); updateArr(arr);
            return i + 1;
        };
        const sort = async (low: number, high: number) => {
            if (low < high) {
                setStep(1); const pi = await partition(low, high);
                if (pi === -1) return;
                setStep(4); await sort(low, pi - 1);
                setStep(4); await sort(pi + 1, high);
            } else if (low === high) { arr[low].state = 'sorted'; updateArr(arr); }
        };
        setStep(0); await sort(0, arr.length - 1);
    };

    // Merge Sort
    const mergeSort = async (arr: ArrayBar[], updateArr: (a: ArrayBar[]) => void, addComp: () => void, addSwap: () => void, ref: React.MutableRefObject<boolean>, setStep: React.Dispatch<React.SetStateAction<number>>, updateTime: () => void) => {
        const merge = async (l: number, m: number, r: number) => {
            setStep(5);
            const left = arr.slice(l, m + 1), right = arr.slice(m + 1, r + 1);
            let i = 0, j = 0, k = l;
            while (i < left.length && j < right.length) {
                if (!ref.current) return;
                arr[k].state = 'comparing'; updateArr(arr); addComp();
                await sleep(speedRef.current, ref);
                if (left[i].value <= right[j].value) { arr[k] = { ...left[i++], state: 'swapping' }; }
                else { arr[k] = { ...right[j++], state: 'swapping' }; }
                addSwap(); updateArr(arr); await sleep(speedRef.current, ref);
                arr[k].state = 'default'; k++; updateTime();
            }
            while (i < left.length) { arr[k++] = { ...left[i++], state: 'default' }; }
            while (j < right.length) { arr[k++] = { ...right[j++], state: 'default' }; }
            updateArr(arr);
        };
        const sort = async (l: number, r: number) => {
            if (l < r) {
                setStep(1); const m = Math.floor((l + r) / 2);
                setStep(3); await sort(l, m);
                setStep(4); await sort(m + 1, r);
                await merge(l, m, r);
            }
        };
        setStep(0); await sort(0, arr.length - 1);
    };

    // Heap Sort
    const heapSort = async (arr: ArrayBar[], updateArr: (a: ArrayBar[]) => void, addComp: () => void, addSwap: () => void, ref: React.MutableRefObject<boolean>, setStep: React.Dispatch<React.SetStateAction<number>>, updateTime: () => void) => {
        const heapify = async (n: number, i: number) => {
            if (!ref.current) return;
            let largest = i, left = 2 * i + 1, right = 2 * i + 2;
            if (left < n) {
                arr[left].state = 'comparing'; arr[largest].state = 'comparing';
                updateArr(arr); addComp(); await sleep(speedRef.current, ref);
                if (arr[left].value > arr[largest].value) largest = left;
                arr[left].state = 'default';
            }
            if (right < n) {
                arr[right].state = 'comparing'; arr[largest].state = 'comparing';
                updateArr(arr); addComp(); await sleep(speedRef.current, ref);
                if (arr[right].value > arr[largest].value) largest = right;
                arr[right].state = 'default';
            }
            if (largest !== i) {
                arr[i].state = 'swapping'; arr[largest].state = 'swapping';
                updateArr(arr); await sleep(speedRef.current, ref);
                [arr[i], arr[largest]] = [arr[largest], arr[i]]; addSwap();
                arr[i].state = 'default'; arr[largest].state = 'default';
                updateArr(arr); await heapify(n, largest);
            }
            arr[i].state = 'default'; updateArr(arr); updateTime();
        };
        setStep(0);
        for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) await heapify(arr.length, i);
        setStep(1);
        for (let i = arr.length - 1; i > 0; i--) {
            if (!ref.current) return;
            setStep(2); arr[0].state = 'swapping'; arr[i].state = 'swapping';
            updateArr(arr); await sleep(speedRef.current, ref);
            [arr[0], arr[i]] = [arr[i], arr[0]]; addSwap();
            arr[i].state = 'sorted'; arr[0].state = 'default';
            setStep(3); updateArr(arr); await heapify(i, 0);
        }
        arr[0].state = 'sorted'; updateArr(arr);
    };

    // Counting Sort
    const countingSort = async (arr: ArrayBar[], updateArr: (a: ArrayBar[]) => void, addComp: () => void, addSwap: () => void, ref: React.MutableRefObject<boolean>, setStep: React.Dispatch<React.SetStateAction<number>>, updateTime: () => void) => {
        const max = Math.max(...arr.map(b => b.value));
        const count = new Array(max + 1).fill(0);
        const output: ArrayBar[] = new Array(arr.length);
        setStep(0);
        for (let i = 0; i < arr.length; i++) {
            if (!ref.current) return;
            setStep(1); arr[i].state = 'comparing'; updateArr(arr);
            await sleep(speedRef.current / 2, ref);
            count[arr[i].value]++; arr[i].state = 'default'; addComp(); updateTime();
        }
        setStep(3);
        for (let i = 1; i <= max; i++) count[i] += count[i - 1];
        setStep(5);
        for (let i = arr.length - 1; i >= 0; i--) {
            if (!ref.current) return;
            setStep(6);
            const pos = count[arr[i].value] - 1;
            output[pos] = { ...arr[i], state: 'swapping' };
            count[arr[i].value]--; addSwap();
            for (let j = 0; j < output.length; j++) if (output[j]) arr[j] = { ...output[j] };
            updateArr(arr); await sleep(speedRef.current, ref); updateTime();
        }
    };

    // Radix Sort
    const radixSort = async (arr: ArrayBar[], updateArr: (a: ArrayBar[]) => void, addComp: () => void, addSwap: () => void, ref: React.MutableRefObject<boolean>, setStep: React.Dispatch<React.SetStateAction<number>>, updateTime: () => void) => {
        const max = Math.max(...arr.map(b => b.value));
        let exp = 1;
        while (Math.floor(max / exp) > 0) {
            if (!ref.current) return;
            setStep(0);
            const output: ArrayBar[] = new Array(arr.length);
            const count = new Array(10).fill(0);
            setStep(1);
            for (let i = 0; i < arr.length; i++) {
                if (!ref.current) return;
                arr[i].state = 'comparing'; updateArr(arr);
                await sleep(speedRef.current / 3, ref);
                const digit = Math.floor(arr[i].value / exp) % 10;
                count[digit]++; arr[i].state = 'default'; addComp(); updateTime();
            }
            for (let i = 1; i < 10; i++) count[i] += count[i - 1];
            for (let i = arr.length - 1; i >= 0; i--) {
                const digit = Math.floor(arr[i].value / exp) % 10;
                const pos = count[digit] - 1;
                output[pos] = { ...arr[i], state: 'swapping' };
                count[digit]--; addSwap();
            }
            for (let i = 0; i < arr.length; i++) arr[i] = output[i];
            updateArr(arr); await sleep(speedRef.current, ref);
            exp *= 10;
        }
    };

    // Shell Sort
    const shellSort = async (arr: ArrayBar[], updateArr: (a: ArrayBar[]) => void, addComp: () => void, addSwap: () => void, ref: React.MutableRefObject<boolean>, setStep: React.Dispatch<React.SetStateAction<number>>, updateTime: () => void) => {
        let gap = Math.floor(arr.length / 2);
        setStep(0);
        while (gap > 0) {
            setStep(1);
            for (let i = gap; i < arr.length; i++) {
                if (!ref.current) return;
                setStep(2); const temp = arr[i]; temp.state = 'pivot'; let j = i;
                setStep(4);
                while (j >= gap) {
                    arr[j - gap].state = 'comparing'; updateArr(arr); addComp();
                    await sleep(speedRef.current, ref);
                    setStep(5);
                    if (arr[j - gap].value > temp.value) {
                        setStep(6); arr[j] = { ...arr[j - gap], state: 'swapping' };
                        arr[j - gap].state = 'default'; addSwap();
                        updateArr(arr); await sleep(speedRef.current, ref); j -= gap;
                    } else { arr[j - gap].state = 'default'; break; }
                    updateTime();
                }
                setStep(8); arr[j] = { ...temp, state: 'default' }; updateArr(arr);
            }
            setStep(9); gap = Math.floor(gap / 2);
        }
    };

    const startSort = async () => {
        if (mode === 'single') {
            isRunning1Ref.current = true;
            setIsRunning1(true);
            setStats1({ comparisons: 0, swaps: 0, time: 0 });
            setIsSorted1(false);
            const arr = array1.map(b => ({ ...b, state: 'default' as const }));
            setArray1(arr);
            await runSort(arr, setArray1, algorithm1, isRunning1Ref, setStats1, setIsSorted1, setCurrentStep1, startTime1Ref);
            isRunning1Ref.current = false;
            setIsRunning1(false);
        } else {
            // Run both simultaneously
            isRunning1Ref.current = true;
            isRunning2Ref.current = true;
            setIsRunning1(true);
            setIsRunning2(true);
            setStats1({ comparisons: 0, swaps: 0, time: 0 });
            setStats2({ comparisons: 0, swaps: 0, time: 0 });
            setIsSorted1(false);
            setIsSorted2(false);

            const arr1 = array1.map(b => ({ ...b, state: 'default' as const }));
            const arr2 = array2.map(b => ({ ...b, state: 'default' as const }));
            setArray1(arr1);
            setArray2(arr2);

            await Promise.all([
                runSort(arr1, setArray1, algorithm1, isRunning1Ref, setStats1, setIsSorted1, setCurrentStep1, startTime1Ref).then(() => { isRunning1Ref.current = false; setIsRunning1(false); }),
                runSort(arr2, setArray2, algorithm2, isRunning2Ref, setStats2, setIsSorted2, setCurrentStep2, startTime2Ref).then(() => { isRunning2Ref.current = false; setIsRunning2(false); }),
            ]);
        }
    };

    const togglePause = () => { isPausedRef.current = !isPausedRef.current; setIsPaused(!isPaused); };

    const stopSort = () => {
        isRunning1Ref.current = false;
        isRunning2Ref.current = false;
        isPausedRef.current = false;
        setIsRunning1(false);
        setIsRunning2(false);
        setIsPaused(false);
        setArray1(prev => prev.map(b => ({ ...b, state: 'default' })));
        setArray2(prev => prev.map(b => ({ ...b, state: 'default' })));
        setCurrentStep1(-1);
        setCurrentStep2(-1);
    };

    const getBarColor = (state: ArrayBar['state']) => {
        switch (state) {
            case 'comparing': return 'bg-yellow-400';
            case 'swapping': return 'bg-red-500';
            case 'sorted': return 'bg-emerald-500';
            case 'pivot': return 'bg-purple-500';
            default: return 'bg-primary-500';
        }
    };

    const renderVisualization = (arr: ArrayBar[], _title: string, algoInfo: AlgorithmInfo, stats: { comparisons: number; swaps: number; time: number }, isSorted: boolean, currentStep: number) => (
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
                <h3 className={`text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r ${algoInfo.color}`}>
                    {algoInfo.name}
                </h3>
                {isSorted && (
                    <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full">
                        ✓ Done
                    </span>
                )}
            </div>

            {/* Bars */}
            <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-lg p-2 flex items-end justify-center gap-0.5">
                {arr.map((bar) => (
                    <motion.div
                        key={bar.id}
                        className={`${getBarColor(bar.state)} rounded-t`}
                        style={{ height: `${bar.value}%`, width: `${Math.max(100 / arr.length - 1, 2)}%` }}
                        animate={{ height: `${bar.value}%` }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    />
                ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                <div className="p-1.5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-center">
                    <p className="text-yellow-600 dark:text-yellow-400">Comparisons</p>
                    <p className="font-bold text-yellow-700 dark:text-yellow-300">{stats.comparisons}</p>
                </div>
                <div className="p-1.5 rounded bg-red-100 dark:bg-red-900/30 text-center">
                    <p className="text-red-600 dark:text-red-400">Swaps</p>
                    <p className="font-bold text-red-700 dark:text-red-300">{stats.swaps}</p>
                </div>
                <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-900/30 text-center">
                    <p className="text-blue-600 dark:text-blue-400">Time</p>
                    <p className="font-bold text-blue-700 dark:text-blue-300">{stats.time}ms</p>
                </div>
            </div>

            {/* Pseudocode */}
            <div className="mt-2 font-mono text-[10px] bg-slate-800 dark:bg-slate-900 p-2 rounded text-slate-300 max-h-24 overflow-auto">
                {algoInfo.pseudocode.map((line, i) => (
                    <div key={i} className={`px-1 rounded ${currentStep === i ? 'bg-yellow-500/30 text-yellow-300' : ''}`}>
                        {line}
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/" className="control-btn"><ChevronLeft className="w-5 h-5" /></Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Sorting Algorithms</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">Compare 9 sorting algorithms side-by-side</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Controls */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Mode Toggle */}
                        <div className="algo-card">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                <GitCompare className="w-4 h-4" /> Mode
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => setMode('single')} disabled={isRunning}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${mode === 'single' ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                    Single
                                </button>
                                <button onClick={() => setMode('compare')} disabled={isRunning}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${mode === 'compare' ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                    Compare
                                </button>
                            </div>
                        </div>

                        {/* Algorithm Selection */}
                        <div className="algo-card">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" /> {mode === 'compare' ? 'Algorithm 1' : 'Algorithm'}
                            </h3>
                            <select value={algorithm1} onChange={(e) => setAlgorithm1(e.target.value as Algorithm)} disabled={isRunning}
                                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-sm">
                                {algorithms.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                            {mode === 'compare' && (
                                <>
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-3 mb-2">Algorithm 2</h3>
                                    <select value={algorithm2} onChange={(e) => setAlgorithm2(e.target.value as Algorithm)} disabled={isRunning}
                                        className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-sm">
                                        {algorithms.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </>
                            )}
                        </div>

                        {/* Algorithm Info */}
                        <div className="algo-card">
                            <div className={`h-1 w-full bg-gradient-to-r ${currentAlgo1.color} rounded-full mb-2`} />
                            <div className="text-xs space-y-1">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span className="text-slate-500 dark:text-slate-400">Best:</span>
                                    <span className="font-mono text-primary-600 dark:text-primary-400">{currentAlgo1.complexity.best}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Target className="w-3 h-3 text-slate-400" />
                                    <span className="text-slate-500 dark:text-slate-400">Avg:</span>
                                    <span className="font-mono text-primary-600 dark:text-primary-400">{currentAlgo1.complexity.avg}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Zap className="w-3 h-3 text-slate-400" />
                                    <span className="text-slate-500 dark:text-slate-400">Worst:</span>
                                    <span className="font-mono text-red-500">{currentAlgo1.complexity.worst}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Gauge className="w-3 h-3 text-slate-400" />
                                    <span className="text-slate-500 dark:text-slate-400">Space:</span>
                                    <span className="font-mono">{currentAlgo1.space}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Info className="w-3 h-3 text-slate-400" />
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${currentAlgo1.stable ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                                        {currentAlgo1.stable ? 'Stable' : 'Unstable'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="algo-card">
                            <div className="mb-3">
                                <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Size: {arraySize}</label>
                                <input type="range" min="5" max="50" value={arraySize} onChange={(e) => !isRunning && setArraySize(parseInt(e.target.value))} disabled={isRunning}
                                    className="w-full accent-primary-500" />
                            </div>

                            <div className="mb-3">
                                <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Preset</label>
                                <div className="grid grid-cols-2 gap-1">
                                    {PRESETS.map((p, i) => (
                                        <button key={p.label} onClick={() => !isRunning && setPresetIndex(i)} disabled={isRunning}
                                            className={`px-2 py-1 text-xs rounded transition ${presetIndex === i ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Speed</label>
                                <div className="grid grid-cols-4 gap-1">
                                    {SPEEDS.map((s, i) => (
                                        <button key={s.label} onClick={() => setSpeedIndex(i)}
                                            className={`px-2 py-1 text-xs rounded transition ${speedIndex === i ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Input */}
                            <button onClick={() => setShowCustomInput(!showCustomInput)} disabled={isRunning}
                                className="w-full mb-2 px-3 py-2 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
                                <Edit3 className="w-3 h-3" /> Custom Input
                            </button>

                            <AnimatePresence>
                                {showCustomInput && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-2">
                                        <input type="text" value={customInputText} onChange={(e) => setCustomInputText(e.target.value)} placeholder="45, 23, 67, 12, 89"
                                            className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 mb-1" />
                                        <button onClick={applyCustomInput} className="w-full px-3 py-1.5 text-xs rounded-lg bg-emerald-500 text-white">Apply</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Action buttons */}
                            <div className="grid grid-cols-2 gap-2">
                                {!isRunning ? (
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={startSort} className="btn btn-primary col-span-2">
                                        <Play className="w-4 h-4" /> Start
                                    </motion.button>
                                ) : (
                                    <>
                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={togglePause} className="btn btn-secondary">
                                            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                                            {isPaused ? 'Resume' : 'Pause'}
                                        </motion.button>
                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={stopSort} className="btn btn-danger">
                                            <RotateCcw className="w-4 h-4" /> Stop
                                        </motion.button>
                                    </>
                                )}
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={generateArrays} disabled={isRunning} className="btn btn-secondary col-span-2 disabled:opacity-50">
                                    <Shuffle className="w-4 h-4" /> Generate New
                                </motion.button>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="algo-card">
                            <div className="text-xs grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary-500" /><span className="text-slate-600 dark:text-slate-400">Default</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-yellow-400" /><span className="text-slate-600 dark:text-slate-400">Comparing</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-500" /><span className="text-slate-600 dark:text-slate-400">Swapping</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500" /><span className="text-slate-600 dark:text-slate-400">Sorted</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Visualization */}
                    <div className="lg:col-span-3 visualizer-container">
                        <div className={`flex gap-4 ${mode === 'compare' ? '' : ''}`}>
                            {renderVisualization(array1, currentAlgo1.name, currentAlgo1, stats1, isSorted1, currentStep1)}
                            {mode === 'compare' && (
                                <>
                                    <div className="w-px bg-slate-200 dark:bg-slate-700 self-stretch" />
                                    {renderVisualization(array2, currentAlgo2.name, currentAlgo2, stats2, isSorted2, currentStep2)}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
