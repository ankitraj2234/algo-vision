import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowDown,
    ArrowUp,
    Eye,
    Trash2,
    RotateCcw,
    Info,
    ChevronLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface StackItem {
    id: number;
    value: number;
}

const MAX_CAPACITY = 10;

export function StackPage() {
    const [stack, setStack] = useState<StackItem[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const [peekingIndex, setPeekingIndex] = useState<number | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const showMessage = useCallback((type: 'success' | 'error' | 'info', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    }, []);

    const push = useCallback(() => {
        if (isAnimating) return;

        const value = parseInt(inputValue);
        if (isNaN(value)) {
            showMessage('error', 'Please enter a valid number');
            return;
        }

        if (stack.length >= MAX_CAPACITY) {
            showMessage('error', 'Stack Overflow! Maximum capacity reached');
            return;
        }

        setIsAnimating(true);
        const newItem: StackItem = { id: Date.now(), value };
        setStack((prev) => [...prev, newItem]);
        setInputValue('');
        showMessage('success', `Pushed ${value} onto the stack`);

        setTimeout(() => setIsAnimating(false), 300);
    }, [inputValue, stack.length, isAnimating, showMessage]);

    const pop = useCallback(() => {
        if (isAnimating) return;

        if (stack.length === 0) {
            showMessage('error', 'Stack Underflow! Stack is empty');
            return;
        }

        setIsAnimating(true);
        const poppedValue = stack[stack.length - 1].value;
        setStack((prev) => prev.slice(0, -1));
        showMessage('success', `Popped ${poppedValue} from the stack`);

        setTimeout(() => setIsAnimating(false), 300);
    }, [stack, isAnimating, showMessage]);

    const peek = useCallback(() => {
        if (stack.length === 0) {
            showMessage('error', 'Stack is empty! Nothing to peek');
            return;
        }

        setPeekingIndex(stack.length - 1);
        showMessage('info', `Top element is ${stack[stack.length - 1].value}`);

        setTimeout(() => setPeekingIndex(null), 1500);
    }, [stack, showMessage]);

    const clear = useCallback(() => {
        if (stack.length === 0) {
            showMessage('info', 'Stack is already empty');
            return;
        }

        setStack([]);
        showMessage('success', 'Stack cleared');
    }, [stack.length, showMessage]);

    const reset = useCallback(() => {
        setStack([]);
        setInputValue('');
        setMessage(null);
        setPeekingIndex(null);
    }, []);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            push();
        }
    };

    const fillPercentage = (stack.length / MAX_CAPACITY) * 100;
    const getProgressColor = () => {
        if (fillPercentage >= 80) return 'from-red-500 to-red-600';
        if (fillPercentage >= 50) return 'from-orange-500 to-orange-600';
        return 'from-green-500 to-green-600';
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
                            Stack Data Structure
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            LIFO (Last In, First Out) with push, pop, and peek operations
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
                                    onClick={push}
                                    disabled={isAnimating || stack.length >= MAX_CAPACITY}
                                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ArrowDown className="w-4 h-4" />
                                    Push
                                </motion.button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={pop}
                                    disabled={isAnimating || stack.length === 0}
                                    className="btn btn-secondary disabled:opacity-50"
                                >
                                    <ArrowUp className="w-4 h-4" />
                                    Pop
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={peek}
                                    disabled={stack.length === 0}
                                    className="btn btn-secondary disabled:opacity-50"
                                >
                                    <Eye className="w-4 h-4" />
                                    Peek
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={clear}
                                    disabled={stack.length === 0}
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
                                Stack Statistics
                            </h3>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Current Size</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {stack.length}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Capacity</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {MAX_CAPACITY}
                                    </p>
                                </div>
                            </div>

                            {/* Capacity Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-400">Capacity</span>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {fillPercentage.toFixed(0)}%
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
                                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center flex-shrink-0">
                                    <Info className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                        About Stack
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                        A stack follows the <strong>LIFO</strong> principle. The last element
                                        added is the first one to be removed. Common operations are O(1) time complexity.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visualization Panel */}
                    <div className="visualizer-container flex flex-col">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Stack Visualization
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

                        {/* Stack Container */}
                        <div className="flex-1 flex flex-col-reverse items-center justify-start pt-4 pb-8 gap-2 min-h-[400px]">
                            {/* Base of Stack */}
                            <div className="w-32 h-2 bg-slate-300 dark:bg-slate-600 rounded-full" />

                            {/* Stack Elements */}
                            <AnimatePresence mode="popLayout">
                                {stack.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ y: -50, opacity: 0, scale: 0.8 }}
                                        animate={{
                                            y: 0,
                                            opacity: 1,
                                            scale: peekingIndex === index ? 1.1 : 1,
                                        }}
                                        exit={{
                                            y: -30,
                                            opacity: 0,
                                            scale: 0.8,
                                            rotate: 180,
                                        }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 500,
                                            damping: 30,
                                        }}
                                        className={`relative stack-element ${peekingIndex === index
                                                ? 'ring-4 ring-yellow-400 ring-offset-2 dark:ring-offset-slate-800'
                                                : ''
                                            }`}
                                    >
                                        <span>{item.value}</span>
                                        {index === stack.length - 1 && (
                                            <motion.span
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="absolute -right-16 text-xs font-bold text-primary-600 dark:text-primary-400"
                                            >
                                                ← TOP
                                            </motion.span>
                                        )}
                                        <span className="absolute -left-10 text-xs text-slate-400">
                                            [{index}]
                                        </span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Empty State */}
                            {stack.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center text-slate-400 dark:text-slate-500 py-12"
                                >
                                    <p className="text-lg font-medium">Stack is empty</p>
                                    <p className="text-sm mt-1">Push elements to visualize</p>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
