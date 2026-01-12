import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    ArrowLeft,
    Eye,
    Trash2,
    RotateCcw,
    Info,
    ChevronLeft,
    RefreshCw,
    ArrowUpDown,
    Printer,
    ListOrdered,
    Circle,
    Clock,
    BookOpen,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface QueueItem {
    id: number;
    value: number;
    priority?: number;
    label?: string;
}

type QueueType = 'linear' | 'circular' | 'priority' | 'deque';

const MAX_CAPACITY = 8;

const queueTypes = [
    { id: 'linear' as QueueType, name: 'Linear Queue', icon: ListOrdered, description: 'Standard FIFO queue' },
    { id: 'circular' as QueueType, name: 'Circular Queue', icon: RefreshCw, description: 'Wraps around when end is reached' },
    { id: 'priority' as QueueType, name: 'Priority Queue', icon: ArrowUpDown, description: 'Higher priority = dequeued first' },
    { id: 'deque' as QueueType, name: 'Deque', icon: ArrowRight, description: 'Double-ended queue' },
];

const pseudocode: Record<QueueType, string[]> = {
    linear: [
        'enqueue(value):',
        '  if queue is full: error',
        '  queue[rear] = value',
        '  rear++',
        '',
        'dequeue():',
        '  if queue is empty: error',
        '  value = queue[front]',
        '  front++',
        '  return value',
    ],
    circular: [
        'enqueue(value):',
        '  if isFull(): error',
        '  rear = (rear + 1) % capacity',
        '  queue[rear] = value',
        '',
        'dequeue():',
        '  if isEmpty(): error',
        '  value = queue[front]',
        '  front = (front + 1) % capacity',
        '  return value',
    ],
    priority: [
        'enqueue(value, priority):',
        '  insert (value, priority)',
        '  heapify_up()',
        '',
        'dequeue():',
        '  max = queue[0]',
        '  swap(queue[0], queue[last])',
        '  heapify_down()',
        '  return max',
    ],
    deque: [
        'addFront(value):',
        '  front = (front - 1) % capacity',
        '  queue[front] = value',
        '',
        'addRear(value):',
        '  queue[rear] = value',
        '  rear = (rear + 1) % capacity',
        '',
        'removeFront(): // like dequeue',
        'removeRear(): // from back',
    ],
};

const realWorldExamples: Record<QueueType, { title: string; items: { label: string; value: number; priority?: number }[] }> = {
    linear: {
        title: '🖨️ Print Queue',
        items: [
            { label: 'Report.pdf', value: 1 },
            { label: 'Invoice.doc', value: 2 },
            { label: 'Photo.jpg', value: 3 },
        ],
    },
    circular: {
        title: '🎵 Music Player',
        items: [
            { label: 'Song 1', value: 1 },
            { label: 'Song 2', value: 2 },
            { label: 'Song 3', value: 3 },
            { label: 'Song 4', value: 4 },
        ],
    },
    priority: {
        title: '🏥 Hospital ER',
        items: [
            { label: 'Heart Attack', value: 1, priority: 10 },
            { label: 'Broken Arm', value: 2, priority: 5 },
            { label: 'Headache', value: 3, priority: 2 },
        ],
    },
    deque: {
        title: '↩️ Undo/Redo',
        items: [
            { label: 'Action 1', value: 1 },
            { label: 'Action 2', value: 2 },
            { label: 'Action 3', value: 3 },
        ],
    },
};

export function QueuePage() {
    const [queueType, setQueueType] = useState<QueueType>('linear');
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [inputPriority, setInputPriority] = useState('5');
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
    const [highlightType, setHighlightType] = useState<'front' | 'rear' | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentStep, setCurrentStep] = useState(-1);

    // Circular queue pointers
    const [front, setFront] = useState(0);
    const [rear, setRear] = useState(0);

    const showMessage = useCallback((type: 'success' | 'error' | 'info', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    }, []);

    const highlightStep = (step: number, duration = 500) => {
        setCurrentStep(step);
        setTimeout(() => setCurrentStep(-1), duration);
    };

    // Enqueue operations based on queue type
    const enqueue = useCallback(() => {
        if (isAnimating) return;
        const value = parseInt(inputValue);
        if (isNaN(value)) { showMessage('error', 'Please enter a valid number'); return; }
        if (queue.length >= MAX_CAPACITY) { showMessage('error', 'Queue is full!'); return; }

        setIsAnimating(true);
        highlightStep(queueType === 'linear' ? 2 : queueType === 'circular' ? 3 : 1);

        const priority = queueType === 'priority' ? parseInt(inputPriority) || 5 : undefined;
        const newItem: QueueItem = { id: Date.now(), value, priority };

        if (queueType === 'priority') {
            // Insert and sort by priority (max heap style)
            setQueue(prev => [...prev, newItem].sort((a, b) => (b.priority || 0) - (a.priority || 0)));
            showMessage('success', `Added ${value} with priority ${priority}`);
        } else {
            setQueue(prev => [...prev, newItem]);
            showMessage('success', `Enqueued ${value} to rear`);
        }

        setInputValue('');
        setTimeout(() => setIsAnimating(false), 300);
    }, [inputValue, inputPriority, queue.length, isAnimating, showMessage, queueType]);

    // Enqueue at front (deque only)
    const enqueueFront = useCallback(() => {
        if (isAnimating || queueType !== 'deque') return;
        const value = parseInt(inputValue);
        if (isNaN(value)) { showMessage('error', 'Please enter a valid number'); return; }
        if (queue.length >= MAX_CAPACITY) { showMessage('error', 'Queue is full!'); return; }

        setIsAnimating(true);
        highlightStep(0);
        const newItem: QueueItem = { id: Date.now(), value };
        setQueue(prev => [newItem, ...prev]);
        setInputValue('');
        showMessage('success', `Added ${value} to front`);
        setTimeout(() => setIsAnimating(false), 300);
    }, [inputValue, queue.length, isAnimating, showMessage, queueType]);

    // Dequeue operations
    const dequeue = useCallback(() => {
        if (isAnimating || queue.length === 0) {
            if (queue.length === 0) showMessage('error', 'Queue is empty!');
            return;
        }

        setIsAnimating(true);
        highlightStep(queueType === 'linear' ? 7 : queueType === 'circular' ? 6 : 5);
        const dequeuedValue = queue[0].value;
        setQueue(prev => prev.slice(1));
        showMessage('success', `Dequeued ${dequeuedValue} from front`);
        setTimeout(() => setIsAnimating(false), 300);
    }, [queue, isAnimating, showMessage, queueType]);

    // Dequeue from rear (deque only)
    const dequeueRear = useCallback(() => {
        if (isAnimating || queue.length === 0 || queueType !== 'deque') {
            if (queue.length === 0) showMessage('error', 'Queue is empty!');
            return;
        }

        setIsAnimating(true);
        highlightStep(9);
        const dequeuedValue = queue[queue.length - 1].value;
        setQueue(prev => prev.slice(0, -1));
        showMessage('success', `Removed ${dequeuedValue} from rear`);
        setTimeout(() => setIsAnimating(false), 300);
    }, [queue, isAnimating, showMessage, queueType]);

    const peekFront = useCallback(() => {
        if (queue.length === 0) { showMessage('error', 'Queue is empty!'); return; }
        setHighlightedIndex(0);
        setHighlightType('front');
        showMessage('info', `Front: ${queue[0].value}${queue[0].priority !== undefined ? ` (priority ${queue[0].priority})` : ''}`);
        setTimeout(() => { setHighlightedIndex(null); setHighlightType(null); }, 1500);
    }, [queue, showMessage]);

    const peekRear = useCallback(() => {
        if (queue.length === 0) { showMessage('error', 'Queue is empty!'); return; }
        setHighlightedIndex(queue.length - 1);
        setHighlightType('rear');
        showMessage('info', `Rear: ${queue[queue.length - 1].value}`);
        setTimeout(() => { setHighlightedIndex(null); setHighlightType(null); }, 1500);
    }, [queue, showMessage]);

    const loadRealWorldExample = () => {
        const example = realWorldExamples[queueType];
        const items: QueueItem[] = example.items.map((item, i) => ({
            id: Date.now() + i,
            value: item.value,
            priority: item.priority,
            label: item.label,
        }));
        if (queueType === 'priority') {
            items.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        }
        setQueue(items);
        showMessage('success', `Loaded: ${example.title}`);
    };

    const clear = () => { setQueue([]); setFront(0); setRear(0); showMessage('success', 'Queue cleared'); };
    const reset = () => { setQueue([]); setInputValue(''); setInputPriority('5'); setMessage(null); setHighlightedIndex(null); setFront(0); setRear(0); };

    const fillPercentage = (queue.length / MAX_CAPACITY) * 100;
    const getProgressColor = () => fillPercentage >= 80 ? 'from-red-500 to-red-600' : fillPercentage >= 50 ? 'from-orange-500 to-orange-600' : 'from-emerald-500 to-emerald-600';

    const currentTypeInfo = queueTypes.find(t => t.id === queueType)!;

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/" className="control-btn"><ChevronLeft className="w-5 h-5" /></Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Queue Data Structures</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">Linear, Circular, Priority Queue & Deque</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Controls */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Queue Type Selection */}
                        <div className="algo-card">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" /> Queue Type
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {queueTypes.map(type => (
                                    <button key={type.id} onClick={() => { setQueueType(type.id); reset(); }}
                                        className={`flex flex-col items-center p-2 rounded-lg text-xs transition ${queueType === type.id ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                        <type.icon className="w-4 h-4 mb-1" />
                                        {type.name.split(' ')[0]}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{currentTypeInfo.description}</p>
                        </div>

                        {/* Operations */}
                        <div className="algo-card">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Operations</h3>

                            <div className="flex gap-2 mb-2">
                                <input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Value" className="input-field flex-1" disabled={isAnimating} />
                                {queueType === 'priority' && (
                                    <input type="number" value={inputPriority} onChange={(e) => setInputPriority(e.target.value)}
                                        placeholder="Priority" className="input-field w-20" disabled={isAnimating} min="1" max="10" />
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {queueType === 'deque' && (
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={enqueueFront}
                                        disabled={isAnimating || queue.length >= MAX_CAPACITY} className="btn btn-secondary disabled:opacity-50 text-xs">
                                        <ArrowLeft className="w-3 h-3" /> Add Front
                                    </motion.button>
                                )}
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={enqueue}
                                    disabled={isAnimating || queue.length >= MAX_CAPACITY}
                                    className={`btn btn-primary disabled:opacity-50 text-xs ${queueType !== 'deque' ? 'col-span-2' : ''}`}>
                                    {queueType === 'deque' ? <><ArrowRight className="w-3 h-3" /> Add Rear</> : <><ArrowRight className="w-3 h-3" /> Enqueue</>}
                                </motion.button>

                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={dequeue}
                                    disabled={isAnimating || queue.length === 0}
                                    className={`btn btn-secondary disabled:opacity-50 text-xs ${queueType !== 'deque' ? 'col-span-2' : ''}`}>
                                    <ArrowLeft className="w-3 h-3" /> {queueType === 'deque' ? 'Remove Front' : 'Dequeue'}
                                </motion.button>
                                {queueType === 'deque' && (
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={dequeueRear}
                                        disabled={isAnimating || queue.length === 0} className="btn btn-secondary disabled:opacity-50 text-xs">
                                        <ArrowRight className="w-3 h-3" /> Remove Rear
                                    </motion.button>
                                )}

                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={peekFront}
                                    disabled={queue.length === 0} className="btn btn-secondary disabled:opacity-50 text-xs">
                                    <Eye className="w-3 h-3" /> Peek Front
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={peekRear}
                                    disabled={queue.length === 0} className="btn btn-secondary disabled:opacity-50 text-xs">
                                    <Eye className="w-3 h-3" /> Peek Rear
                                </motion.button>

                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={loadRealWorldExample}
                                    className="btn btn-secondary col-span-2 text-xs">
                                    <Printer className="w-3 h-3" /> Load Example
                                </motion.button>

                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={clear}
                                    disabled={queue.length === 0} className="btn btn-danger disabled:opacity-50 text-xs">
                                    <Trash2 className="w-3 h-3" /> Clear
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={reset}
                                    className="btn btn-secondary text-xs">
                                    <RotateCcw className="w-3 h-3" /> Reset
                                </motion.button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="algo-card">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Statistics</h3>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-center">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Size</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">{queue.length}</p>
                                </div>
                                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-center">
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Front</p>
                                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                                        {queue.length > 0 ? queue[0].value : '-'}
                                    </p>
                                </div>
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-center">
                                    <p className="text-xs text-blue-600 dark:text-blue-400">Rear</p>
                                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                                        {queue.length > 0 ? queue[queue.length - 1].value : '-'}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-600 dark:text-slate-400">Capacity</span>
                                    <span className="font-medium">{queue.length}/{MAX_CAPACITY}</span>
                                </div>
                                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div className={`h-full bg-gradient-to-r ${getProgressColor()}`}
                                        animate={{ width: `${fillPercentage}%` }} transition={{ duration: 0.3 }} />
                                </div>
                            </div>
                        </div>

                        {/* Pseudocode */}
                        <div className="algo-card">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Pseudocode</h3>
                            <div className="font-mono text-[10px] bg-slate-800 dark:bg-slate-900 p-2 rounded text-slate-300 max-h-32 overflow-auto">
                                {pseudocode[queueType].map((line, i) => (
                                    <div key={i} className={`px-1 rounded ${currentStep === i ? 'bg-yellow-500/30 text-yellow-300' : ''}`}>
                                        {line || '\u00A0'}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Complexity */}
                        <div className="algo-card">
                            <div className="flex items-start gap-2">
                                <Info className="w-4 h-4 text-primary-500 mt-0.5" />
                                <div className="text-xs space-y-1">
                                    <div className="flex gap-2">
                                        <span className="text-slate-500">Enqueue:</span>
                                        <span className="font-mono text-emerald-500">O(1)</span>
                                        {queueType === 'priority' && <span className="text-slate-400">(O(log n) with heap)</span>}
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-slate-500">Dequeue:</span>
                                        <span className="font-mono text-emerald-500">O(1)</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-slate-500">Space:</span>
                                        <span className="font-mono text-blue-500">O(n)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visualization */}
                    <div className="lg:col-span-2 visualizer-container">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{currentTypeInfo.name} Visualization</h3>
                            {queueType === 'circular' && (
                                <span className="text-xs px-2 py-1 bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 rounded-full">
                                    <RefreshCw className="w-3 h-3 inline mr-1" /> Wraps Around
                                </span>
                            )}
                        </div>

                        {/* Message */}
                        <AnimatePresence>
                            {message && (
                                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                    className={`mb-4 px-4 py-2 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : message.type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'}`}>
                                    {message.text}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Queue Display */}
                        <div className="flex-1 flex items-center justify-center py-8">
                            {queueType === 'circular' ? (
                                // Circular Queue Visualization
                                <div className="relative w-64 h-64">
                                    <div className="absolute inset-0 rounded-full border-4 border-dashed border-slate-300 dark:border-slate-600" />
                                    {Array.from({ length: MAX_CAPACITY }).map((_, i) => {
                                        const angle = (i / MAX_CAPACITY) * 2 * Math.PI - Math.PI / 2;
                                        const x = 50 + 40 * Math.cos(angle);
                                        const y = 50 + 40 * Math.sin(angle);
                                        const item = queue[i];
                                        return (
                                            <motion.div key={i}
                                                className={`absolute w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transform -translate-x-1/2 -translate-y-1/2 ${item ? 'bg-primary-500 text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'} ${highlightedIndex === i ? 'ring-4 ring-yellow-400' : ''}`}
                                                style={{ left: `${x}%`, top: `${y}%` }}
                                                animate={{ scale: item ? 1 : 0.8 }}>
                                                {item ? item.value : ''}
                                                <span className="absolute -bottom-5 text-[10px] text-slate-400">[{i}]</span>
                                            </motion.div>
                                        );
                                    })}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Size</p>
                                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{queue.length}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Linear/Priority/Deque Visualization
                                <div className="flex items-center gap-2">
                                    {queue.length > 0 && (
                                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                            className="text-emerald-600 dark:text-emerald-400 text-xs font-bold flex flex-col items-center">
                                            <span>FRONT</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </motion.div>
                                    )}

                                    <div className="flex items-center gap-2 px-4">
                                        <AnimatePresence mode="popLayout">
                                            {queue.map((item, index) => (
                                                <motion.div key={item.id} layout
                                                    initial={{ x: 50, opacity: 0, scale: 0.8 }}
                                                    animate={{ x: 0, opacity: 1, scale: highlightedIndex === index ? 1.1 : 1 }}
                                                    exit={{ x: -50, opacity: 0, scale: 0.8 }}
                                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                    className={`queue-element relative ${highlightedIndex === index ? (highlightType === 'front' ? 'ring-4 ring-emerald-400' : 'ring-4 ring-blue-400') : ''}`}>
                                                    <span className="text-lg">{item.value}</span>
                                                    {queueType === 'priority' && item.priority !== undefined && (
                                                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 text-yellow-900 rounded-full text-[10px] flex items-center justify-center font-bold">
                                                            {item.priority}
                                                        </span>
                                                    )}
                                                    {item.label && (
                                                        <span className="absolute -bottom-5 text-[10px] text-slate-400 whitespace-nowrap">{item.label}</span>
                                                    )}
                                                    <span className="absolute -bottom-5 right-0 text-[10px] text-slate-500">[{index}]</span>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>

                                    {queue.length > 0 && (
                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                            className="text-blue-600 dark:text-blue-400 text-xs font-bold flex flex-col items-center">
                                            <span>REAR</span>
                                            <ArrowLeft className="w-4 h-4" />
                                        </motion.div>
                                    )}

                                    {queue.length === 0 && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            className="text-center text-slate-400 dark:text-slate-500 py-12">
                                            <Circle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p className="text-lg font-medium">Queue is empty</p>
                                            <p className="text-sm mt-1">Add elements or load an example</p>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Real World Example Info */}
                        <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                <strong>Real-world use case:</strong> {realWorldExamples[queueType].title} -
                                {queueType === 'linear' && ' Documents are printed in the order they are submitted.'}
                                {queueType === 'circular' && ' Songs loop back to the beginning after playing the last one.'}
                                {queueType === 'priority' && ' Critical patients are treated first regardless of arrival time.'}
                                {queueType === 'deque' && ' Undo removes from one end, redo adds from the same end.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
