import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Minus,
    Search,
    Trash2,
    RotateCcw,
    Info,
    ChevronLeft,
    ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ListNode {
    id: number;
    value: number;
}

export function LinkedListPage() {
    const [list, setList] = useState<ListNode[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [positionValue, setPositionValue] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
    const [searchingIndex, setSearchingIndex] = useState<number | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const showMessage = useCallback((type: 'success' | 'error' | 'info', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    }, []);

    const insertAtBeginning = useCallback(() => {
        if (isAnimating) return;

        const value = parseInt(inputValue);
        if (isNaN(value)) {
            showMessage('error', 'Please enter a valid number');
            return;
        }

        setIsAnimating(true);
        const newNode: ListNode = { id: Date.now(), value };
        setList((prev) => [newNode, ...prev]);
        setInputValue('');
        showMessage('success', `Inserted ${value} at the beginning`);

        setTimeout(() => setIsAnimating(false), 300);
    }, [inputValue, isAnimating, showMessage]);

    const insertAtEnd = useCallback(() => {
        if (isAnimating) return;

        const value = parseInt(inputValue);
        if (isNaN(value)) {
            showMessage('error', 'Please enter a valid number');
            return;
        }

        setIsAnimating(true);
        const newNode: ListNode = { id: Date.now(), value };
        setList((prev) => [...prev, newNode]);
        setInputValue('');
        showMessage('success', `Inserted ${value} at the end`);

        setTimeout(() => setIsAnimating(false), 300);
    }, [inputValue, isAnimating, showMessage]);

    const insertAtPosition = useCallback(() => {
        if (isAnimating) return;

        const value = parseInt(inputValue);
        const position = parseInt(positionValue);

        if (isNaN(value)) {
            showMessage('error', 'Please enter a valid value');
            return;
        }

        if (isNaN(position) || position < 0 || position > list.length) {
            showMessage('error', `Position must be between 0 and ${list.length}`);
            return;
        }

        setIsAnimating(true);
        const newNode: ListNode = { id: Date.now(), value };
        setList((prev) => [
            ...prev.slice(0, position),
            newNode,
            ...prev.slice(position),
        ]);
        setInputValue('');
        setPositionValue('');
        showMessage('success', `Inserted ${value} at position ${position}`);

        setTimeout(() => setIsAnimating(false), 300);
    }, [inputValue, positionValue, list.length, isAnimating, showMessage]);

    const deleteByValue = useCallback(() => {
        if (isAnimating) return;

        const value = parseInt(inputValue);
        if (isNaN(value)) {
            showMessage('error', 'Please enter a value to delete');
            return;
        }

        const index = list.findIndex((node) => node.value === value);
        if (index === -1) {
            showMessage('error', `Value ${value} not found in the list`);
            return;
        }

        setIsAnimating(true);
        setHighlightedIndex(index);

        setTimeout(() => {
            setList((prev) => prev.filter((_, i) => i !== index));
            setHighlightedIndex(null);
            setInputValue('');
            showMessage('success', `Deleted ${value} from the list`);
            setIsAnimating(false);
        }, 500);
    }, [inputValue, list, isAnimating, showMessage]);

    const deleteAtPosition = useCallback(() => {
        if (isAnimating) return;

        const position = parseInt(positionValue);

        if (isNaN(position) || position < 0 || position >= list.length) {
            showMessage('error', `Position must be between 0 and ${list.length - 1}`);
            return;
        }

        setIsAnimating(true);
        setHighlightedIndex(position);

        setTimeout(() => {
            const deletedValue = list[position].value;
            setList((prev) => prev.filter((_, i) => i !== position));
            setHighlightedIndex(null);
            setPositionValue('');
            showMessage('success', `Deleted ${deletedValue} at position ${position}`);
            setIsAnimating(false);
        }, 500);
    }, [positionValue, list, isAnimating, showMessage]);

    const searchValue = useCallback(async () => {
        if (isAnimating) return;

        const value = parseInt(inputValue);
        if (isNaN(value)) {
            showMessage('error', 'Please enter a value to search');
            return;
        }

        setIsAnimating(true);

        for (let i = 0; i < list.length; i++) {
            setSearchingIndex(i);
            await new Promise((resolve) => setTimeout(resolve, 400));

            if (list[i].value === value) {
                setHighlightedIndex(i);
                setSearchingIndex(null);
                showMessage('success', `Found ${value} at position ${i}!`);

                setTimeout(() => {
                    setHighlightedIndex(null);
                    setIsAnimating(false);
                }, 2000);
                return;
            }
        }

        setSearchingIndex(null);
        showMessage('error', `Value ${value} not found in the list`);
        setIsAnimating(false);
    }, [inputValue, list, isAnimating, showMessage]);

    const clear = useCallback(() => {
        if (list.length === 0) {
            showMessage('info', 'List is already empty');
            return;
        }

        setList([]);
        showMessage('success', 'List cleared');
    }, [list.length, showMessage]);

    const reset = useCallback(() => {
        setList([]);
        setInputValue('');
        setPositionValue('');
        setMessage(null);
        setHighlightedIndex(null);
        setSearchingIndex(null);
    }, []);

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/" className="control-btn" aria-label="Back to home">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Linked List Data Structure
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Dynamic data structure with node-based connections
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

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <input
                                    type="number"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Value"
                                    className="input-field"
                                    disabled={isAnimating}
                                />
                                <input
                                    type="number"
                                    value={positionValue}
                                    onChange={(e) => setPositionValue(e.target.value)}
                                    placeholder="Position (optional)"
                                    className="input-field"
                                    disabled={isAnimating}
                                />
                            </div>

                            {/* Insert Operations */}
                            <div className="mb-4">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Insert</p>
                                <div className="grid grid-cols-3 gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={insertAtBeginning}
                                        disabled={isAnimating}
                                        className="btn btn-primary text-sm disabled:opacity-50"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Start
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={insertAtEnd}
                                        disabled={isAnimating}
                                        className="btn btn-primary text-sm disabled:opacity-50"
                                    >
                                        <Plus className="w-4 h-4" />
                                        End
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={insertAtPosition}
                                        disabled={isAnimating}
                                        className="btn btn-secondary text-sm disabled:opacity-50"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Position
                                    </motion.button>
                                </div>
                            </div>

                            {/* Delete Operations */}
                            <div className="mb-4">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Delete</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={deleteByValue}
                                        disabled={isAnimating || list.length === 0}
                                        className="btn btn-danger text-sm disabled:opacity-50"
                                    >
                                        <Minus className="w-4 h-4" />
                                        By Value
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={deleteAtPosition}
                                        disabled={isAnimating || list.length === 0}
                                        className="btn btn-danger text-sm disabled:opacity-50"
                                    >
                                        <Minus className="w-4 h-4" />
                                        By Position
                                    </motion.button>
                                </div>
                            </div>

                            {/* Other Operations */}
                            <div className="grid grid-cols-3 gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={searchValue}
                                    disabled={isAnimating || list.length === 0}
                                    className="btn btn-secondary text-sm disabled:opacity-50"
                                >
                                    <Search className="w-4 h-4" />
                                    Search
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={clear}
                                    disabled={list.length === 0}
                                    className="btn btn-secondary text-sm disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Clear
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={reset}
                                    className="btn btn-secondary text-sm"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Reset
                                </motion.button>
                            </div>
                        </div>

                        {/* Stats Panel */}
                        <div className="algo-card">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                List Statistics
                            </h3>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-center">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Size</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {list.length}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-center">
                                    <p className="text-sm text-violet-600 dark:text-violet-400">Head</p>
                                    <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">
                                        {list.length > 0 ? list[0].value : '-'}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-center">
                                    <p className="text-sm text-purple-600 dark:text-purple-400">Tail</p>
                                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                        {list.length > 0 ? list[list.length - 1].value : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Info Panel */}
                        <div className="algo-card">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center flex-shrink-0">
                                    <Info className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                        About Linked List
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                        A singly linked list where each node points to the next node.
                                        Insertion at head is O(1), insertion at tail is O(n), and search is O(n).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visualization Panel */}
                    <div className="visualizer-container flex flex-col">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Linked List Visualization
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

                        {/* List Container */}
                        <div className="flex-1 flex items-center justify-start py-8 overflow-x-auto scrollbar-thin">
                            <div className="flex items-center gap-0 px-4">
                                {/* HEAD Label */}
                                {list.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-violet-600 dark:text-violet-400 text-xs font-bold mr-2"
                                    >
                                        HEAD
                                    </motion.div>
                                )}

                                {/* List Nodes */}
                                <AnimatePresence mode="popLayout">
                                    {list.map((node, index) => (
                                        <motion.div
                                            key={node.id}
                                            layout
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{
                                                scale: 1,
                                                opacity: 1,
                                            }}
                                            exit={{
                                                scale: 0,
                                                opacity: 0,
                                                rotate: 360,
                                            }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 500,
                                                damping: 30,
                                            }}
                                            className="flex items-center"
                                        >
                                            {/* Node */}
                                            <div
                                                className={`ll-node ${highlightedIndex === index
                                                        ? 'ring-4 ring-green-400 ring-offset-2 dark:ring-offset-slate-800 bg-gradient-to-br from-green-500 to-green-600'
                                                        : searchingIndex === index
                                                            ? 'ring-4 ring-orange-400 ring-offset-2 dark:ring-offset-slate-800 bg-gradient-to-br from-orange-500 to-orange-600'
                                                            : ''
                                                    }`}
                                            >
                                                <span className="text-sm font-bold">{node.value}</span>
                                                <span className="absolute -bottom-6 text-xs text-slate-400">
                                                    [{index}]
                                                </span>
                                            </div>

                                            {/* Arrow */}
                                            {index < list.length - 1 && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="mx-1 text-slate-400"
                                                >
                                                    <ArrowRight className="w-5 h-5" />
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* NULL Indicator */}
                                {list.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center ml-1"
                                    >
                                        <ArrowRight className="w-5 h-5 text-slate-400" />
                                        <span className="ml-1 px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-xs font-mono text-slate-600 dark:text-slate-400">
                                            NULL
                                        </span>
                                    </motion.div>
                                )}

                                {/* Empty State */}
                                {list.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center text-slate-400 dark:text-slate-500 py-12 w-full"
                                    >
                                        <p className="text-lg font-medium">List is empty</p>
                                        <p className="text-sm mt-1">Insert nodes to visualize</p>
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
