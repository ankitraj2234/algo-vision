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
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface QueueItem {
    id: number;
    value: number;
}

const MAX_CAPACITY = 10;

export function QueuePage() {
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
    const [highlightType, setHighlightType] = useState<'front' | 'rear' | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const showMessage = useCallback((type: 'success' | 'error' | 'info', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    }, []);

    const enqueue = useCallback(() => {
        if (isAnimating) return;

        const value = parseInt(inputValue);
        if (isNaN(value)) {
            showMessage('error', 'Please enter a valid number');
            return;
        }

        if (queue.length >= MAX_CAPACITY) {
            showMessage('error', 'Queue is full! Maximum capacity reached');
            return;
        }

        setIsAnimating(true);
        const newItem: QueueItem = { id: Date.now(), value };
        setQueue((prev) => [...prev, newItem]);
        setInputValue('');
        showMessage('success', `Enqueued ${value} to the rear`);

        setTimeout(() => setIsAnimating(false), 300);
    }, [inputValue, queue.length, isAnimating, showMessage]);

    const dequeue = useCallback(() => {
        if (isAnimating) return;

        if (queue.length === 0) {
            showMessage('error', 'Queue is empty! Nothing to dequeue');
            return;
        }

        setIsAnimating(true);
        const dequeuedValue = queue[0].value;
        setQueue((prev) => prev.slice(1));
        showMessage('success', `Dequeued ${dequeuedValue} from the front`);

        setTimeout(() => setIsAnimating(false), 300);
    }, [queue, isAnimating, showMessage]);

    const peekFront = useCallback(() => {
        if (queue.length === 0) {
            showMessage('error', 'Queue is empty! Nothing to peek');
            return;
        }

        setHighlightedIndex(0);
        setHighlightType('front');
        showMessage('info', `Front element is ${queue[0].value}`);

        setTimeout(() => {
            setHighlightedIndex(null);
            setHighlightType(null);
        }, 1500);
    }, [queue, showMessage]);

    const peekRear = useCallback(() => {
        if (queue.length === 0) {
            showMessage('error', 'Queue is empty! Nothing to peek');
            return;
        }

        setHighlightedIndex(queue.length - 1);
        setHighlightType('rear');
        showMessage('info', `Rear element is ${queue[queue.length - 1].value}`);

        setTimeout(() => {
            setHighlightedIndex(null);
            setHighlightType(null);
        }, 1500);
    }, [queue, showMessage]);

    const clear = useCallback(() => {
        if (queue.length === 0) {
            showMessage('info', 'Queue is already empty');
            return;
        }

        setQueue([]);
        showMessage('success', 'Queue cleared');
    }, [queue.length, showMessage]);

    const reset = useCallback(() => {
        setQueue([]);
        setInputValue('');
        setMessage(null);
        setHighlightedIndex(null);
        setHighlightType(null);
    }, []);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            enqueue();
        }
    };

    const fillPercentage = (queue.length / MAX_CAPACITY) * 100;
    const getProgressColor = () => {
        if (fillPercentage >= 80) return 'from-red-500 to-red-600';
        if (fillPercentage >= 50) return 'from-orange-500 to-orange-600';
        return 'from-emerald-500 to-emerald-600';
    };

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        to="/"
                        className="control-btn"
                        aria-label="Back to home"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Queue Data Structure
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            FIFO (First In, First Out) with enqueue and dequeue operations
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Controls Panel */}
                    <div className="space-y-6">
                        {/* Input Section */}
                        <div className="algo-card">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Operations
                            </h3>

                            <div className="flex gap-3 mb-4">
                                <input
                                    type="number"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Enter a value..."
                                    className="input-field flex-1"
                                    disabled={isAnimating}
                                />
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={enqueue}
                                    disabled={isAnimating || queue.length >= MAX_CAPACITY}
                                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                    Enqueue
                                </motion.button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={dequeue}
                                    disabled={isAnimating || queue.length === 0}
                                    className="btn btn-secondary disabled:opacity-50"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Dequeue
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={peekFront}
                                    disabled={queue.length === 0}
                                    className="btn btn-secondary disabled:opacity-50"
                                >
                                    <Eye className="w-4 h-4" />
                                    Front
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={peekRear}
                                    disabled={queue.length === 0}
                                    className="btn btn-secondary disabled:opacity-50"
                                >
                                    <Eye className="w-4 h-4" />
                                    Rear
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={clear}
                                    disabled={queue.length === 0}
                                    className="btn btn-danger disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Clear
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={reset}
                                    className="btn btn-secondary"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Reset
                                </motion.button>
                            </div>
                        </div>

                        {/* Stats Panel */}
                        <div className="algo-card">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Queue Statistics
                            </h3>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-center">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Size</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {queue.length}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-center">
                                    <p className="text-sm text-emerald-600 dark:text-emerald-400">Front</p>
                                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                                        {queue.length > 0 ? queue[0].value : '-'}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-center">
                                    <p className="text-sm text-blue-600 dark:text-blue-400">Rear</p>
                                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                        {queue.length > 0 ? queue[queue.length - 1].value : '-'}
                                    </p>
                                </div>
                            </div>

                            {/* Capacity Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-400">Capacity</span>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {queue.length} / {MAX_CAPACITY}
                                    </span>
                                </div>
                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full bg-gradient-to-r ${getProgressColor()} rounded-full`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${fillPercentage}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Info Panel */}
                        <div className="algo-card">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                                    <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                        About Queue
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                        A queue follows the <strong>FIFO</strong> principle. The first element
                                        added is the first one to be removed. Enqueue adds to rear, dequeue removes from front.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visualization Panel */}
                    <div className="visualizer-container flex flex-col">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Queue Visualization
                        </h3>

                        {/* Message Toast */}
                        <AnimatePresence>
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${message.type === 'success'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                            : message.type === 'error'
                                                ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                                        }`}
                                >
                                    {message.text}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Queue Container */}
                        <div className="flex-1 flex items-center justify-center py-8">
                            <div className="flex items-center gap-2">
                                {/* Front Arrow */}
                                {queue.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-emerald-600 dark:text-emerald-400 text-sm font-bold flex flex-col items-center"
                                    >
                                        <span>FRONT</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </motion.div>
                                )}

                                {/* Queue Elements */}
                                <div className="flex items-center gap-2 px-4">
                                    <AnimatePresence mode="popLayout">
                                        {queue.map((item, index) => (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ x: 50, opacity: 0, scale: 0.8 }}
                                                animate={{
                                                    x: 0,
                                                    opacity: 1,
                                                    scale: highlightedIndex === index ? 1.1 : 1,
                                                }}
                                                exit={{
                                                    x: -50,
                                                    opacity: 0,
                                                    scale: 0.8,
                                                }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 500,
                                                    damping: 30,
                                                }}
                                                className={`queue-element ${highlightedIndex === index
                                                        ? highlightType === 'front'
                                                            ? 'ring-4 ring-emerald-400 ring-offset-2 dark:ring-offset-slate-800'
                                                            : 'ring-4 ring-blue-400 ring-offset-2 dark:ring-offset-slate-800'
                                                        : ''
                                                    }`}
                                            >
                                                <span className="text-lg">{item.value}</span>
                                                <span className="absolute -bottom-6 text-xs text-slate-400">
                                                    [{index}]
                                                </span>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {/* Rear Arrow */}
                                {queue.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-blue-600 dark:text-blue-400 text-sm font-bold flex flex-col items-center"
                                    >
                                        <span>REAR</span>
                                        <ArrowLeft className="w-5 h-5" />
                                    </motion.div>
                                )}

                                {/* Empty State */}
                                {queue.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center text-slate-400 dark:text-slate-500 py-12"
                                    >
                                        <p className="text-lg font-medium">Queue is empty</p>
                                        <p className="text-sm mt-1">Enqueue elements to visualize</p>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
