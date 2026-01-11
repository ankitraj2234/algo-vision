import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Trash2,
    RotateCcw,
    Info,
    ChevronLeft,
    Hash,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface HashEntry {
    id: number;
    key: string;
    value: string;
}

interface Bucket {
    index: number;
    entries: HashEntry[];
}

const TABLE_SIZE = 7; // Prime number for better distribution

export function HashTablePage() {
    const [buckets, setBuckets] = useState<Bucket[]>(() =>
        Array.from({ length: TABLE_SIZE }, (_, i) => ({ index: i, entries: [] }))
    );
    const [keyInput, setKeyInput] = useState('');
    const [valueInput, setValueInput] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const [highlightedBucket, setHighlightedBucket] = useState<number | null>(null);
    const [highlightedEntry, setHighlightedEntry] = useState<{ bucket: number; key: string } | null>(null);
    const [hashAnimation, setHashAnimation] = useState<{ key: string; hash: number } | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const showMessage = useCallback((type: 'success' | 'error' | 'info', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    }, []);

    // Simple hash function
    const hashFunction = (key: string): number => {
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            hash = (hash * 31 + key.charCodeAt(i)) % TABLE_SIZE;
        }
        return Math.abs(hash);
    };

    const insert = useCallback(async () => {
        if (isAnimating) return;

        if (!keyInput.trim()) {
            showMessage('error', 'Please enter a key');
            return;
        }

        if (!valueInput.trim()) {
            showMessage('error', 'Please enter a value');
            return;
        }

        setIsAnimating(true);
        const hash = hashFunction(keyInput.trim());

        // Show hash animation
        setHashAnimation({ key: keyInput.trim(), hash });
        await new Promise((r) => setTimeout(r, 800));
        setHashAnimation(null);

        // Highlight bucket
        setHighlightedBucket(hash);
        await new Promise((r) => setTimeout(r, 400));

        // Check for existing key
        const existingEntryIndex = buckets[hash].entries.findIndex(
            (e) => e.key === keyInput.trim()
        );

        if (existingEntryIndex !== -1) {
            // Update existing
            setBuckets((prev) => {
                const newBuckets = [...prev];
                newBuckets[hash] = {
                    ...newBuckets[hash],
                    entries: newBuckets[hash].entries.map((e, i) =>
                        i === existingEntryIndex ? { ...e, value: valueInput.trim() } : e
                    ),
                };
                return newBuckets;
            });
            showMessage('info', `Updated key "${keyInput}" with new value`);
        } else {
            // Insert new
            const newEntry: HashEntry = {
                id: Date.now(),
                key: keyInput.trim(),
                value: valueInput.trim(),
            };
            setBuckets((prev) => {
                const newBuckets = [...prev];
                newBuckets[hash] = {
                    ...newBuckets[hash],
                    entries: [...newBuckets[hash].entries, newEntry],
                };
                return newBuckets;
            });

            const hasCollision = buckets[hash].entries.length > 0;
            showMessage(
                'success',
                hasCollision
                    ? `Inserted "${keyInput}" at bucket ${hash} (Collision handled!)`
                    : `Inserted "${keyInput}" at bucket ${hash}`
            );
        }

        setKeyInput('');
        setValueInput('');

        setTimeout(() => {
            setHighlightedBucket(null);
            setIsAnimating(false);
        }, 500);
    }, [keyInput, valueInput, buckets, isAnimating, showMessage]);

    const search = useCallback(async () => {
        if (isAnimating) return;

        if (!keyInput.trim()) {
            showMessage('error', 'Please enter a key to search');
            return;
        }

        setIsAnimating(true);
        const hash = hashFunction(keyInput.trim());

        // Show hash animation
        setHashAnimation({ key: keyInput.trim(), hash });
        await new Promise((r) => setTimeout(r, 800));
        setHashAnimation(null);

        // Highlight bucket
        setHighlightedBucket(hash);
        await new Promise((r) => setTimeout(r, 400));

        // Search in bucket
        const entry = buckets[hash].entries.find((e) => e.key === keyInput.trim());

        if (entry) {
            setHighlightedEntry({ bucket: hash, key: entry.key });
            showMessage('success', `Found! Key: "${entry.key}", Value: "${entry.value}"`);
            setTimeout(() => {
                setHighlightedEntry(null);
                setHighlightedBucket(null);
                setIsAnimating(false);
            }, 2000);
        } else {
            showMessage('error', `Key "${keyInput}" not found`);
            setTimeout(() => {
                setHighlightedBucket(null);
                setIsAnimating(false);
            }, 500);
        }
    }, [keyInput, buckets, isAnimating, showMessage]);

    const deleteKey = useCallback(async () => {
        if (isAnimating) return;

        if (!keyInput.trim()) {
            showMessage('error', 'Please enter a key to delete');
            return;
        }

        setIsAnimating(true);
        const hash = hashFunction(keyInput.trim());

        // Show hash animation
        setHashAnimation({ key: keyInput.trim(), hash });
        await new Promise((r) => setTimeout(r, 800));
        setHashAnimation(null);

        // Highlight bucket
        setHighlightedBucket(hash);
        await new Promise((r) => setTimeout(r, 400));

        // Find entry
        const entryIndex = buckets[hash].entries.findIndex(
            (e) => e.key === keyInput.trim()
        );

        if (entryIndex !== -1) {
            setHighlightedEntry({ bucket: hash, key: buckets[hash].entries[entryIndex].key });
            await new Promise((r) => setTimeout(r, 500));

            setBuckets((prev) => {
                const newBuckets = [...prev];
                newBuckets[hash] = {
                    ...newBuckets[hash],
                    entries: newBuckets[hash].entries.filter((_, i) => i !== entryIndex),
                };
                return newBuckets;
            });
            showMessage('success', `Deleted key "${keyInput}"`);
        } else {
            showMessage('error', `Key "${keyInput}" not found`);
        }

        setKeyInput('');
        setTimeout(() => {
            setHighlightedEntry(null);
            setHighlightedBucket(null);
            setIsAnimating(false);
        }, 500);
    }, [keyInput, buckets, isAnimating, showMessage]);

    const clear = useCallback(() => {
        setBuckets(
            Array.from({ length: TABLE_SIZE }, (_, i) => ({ index: i, entries: [] }))
        );
        showMessage('success', 'Hash table cleared');
    }, [showMessage]);

    const reset = useCallback(() => {
        setBuckets(
            Array.from({ length: TABLE_SIZE }, (_, i) => ({ index: i, entries: [] }))
        );
        setKeyInput('');
        setValueInput('');
        setMessage(null);
        setHighlightedBucket(null);
        setHighlightedEntry(null);
    }, []);

    // Statistics
    const totalEntries = buckets.reduce((sum, b) => sum + b.entries.length, 0);
    const loadFactor = (totalEntries / TABLE_SIZE).toFixed(2);
    const collisions = buckets.filter((b) => b.entries.length > 1).length;

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
                            Hash Table Data Structure
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Key-value storage with hash function and chaining collision resolution
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
                                    type="text"
                                    value={keyInput}
                                    onChange={(e) => setKeyInput(e.target.value)}
                                    placeholder="Key"
                                    className="input-field"
                                    disabled={isAnimating}
                                />
                                <input
                                    type="text"
                                    value={valueInput}
                                    onChange={(e) => setValueInput(e.target.value)}
                                    placeholder="Value"
                                    className="input-field"
                                    disabled={isAnimating}
                                />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={insert}
                                    disabled={isAnimating}
                                    className="btn btn-primary disabled:opacity-50"
                                >
                                    <Plus className="w-4 h-4" />
                                    Insert
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={search}
                                    disabled={isAnimating}
                                    className="btn btn-secondary disabled:opacity-50"
                                >
                                    <Search className="w-4 h-4" />
                                    Search
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={deleteKey}
                                    disabled={isAnimating}
                                    className="btn btn-danger disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
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

                        {/* Hash Animation */}
                        <AnimatePresence>
                            {hashAnimation && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="algo-card bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Hash className="w-6 h-6" />
                                            <span className="font-mono font-bold">
                                                hash("{hashAnimation.key}")
                                            </span>
                                        </div>
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="text-2xl font-bold"
                                        >
                                            = {hashAnimation.hash}
                                        </motion.span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Stats Panel */}
                        <div className="algo-card">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Table Statistics
                            </h3>

                            <div className="grid grid-cols-4 gap-3">
                                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-center">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Entries</p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                                        {totalEntries}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-center">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Buckets</p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                                        {TABLE_SIZE}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-center">
                                    <p className="text-xs text-amber-600 dark:text-amber-400">Load Factor</p>
                                    <p className="text-xl font-bold text-amber-700 dark:text-amber-300">
                                        {loadFactor}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-center">
                                    <p className="text-xs text-red-600 dark:text-red-400">Collisions</p>
                                    <p className="text-xl font-bold text-red-700 dark:text-red-300">
                                        {collisions}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Info Panel */}
                        <div className="algo-card">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                                    <Info className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                        About Hash Table
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                        Hash tables provide O(1) average-case for insert, search, and delete.
                                        Collisions are handled using <strong>chaining</strong> (linked lists in buckets).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visualization Panel */}
                    <div className="visualizer-container flex flex-col">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Hash Table Visualization
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

                        {/* Buckets Grid */}
                        <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin">
                            {buckets.map((bucket) => (
                                <motion.div
                                    key={bucket.index}
                                    layout
                                    className={`flex items-stretch gap-2 p-2 rounded-xl transition-colors ${highlightedBucket === bucket.index
                                            ? 'bg-amber-100 dark:bg-amber-900/30'
                                            : 'bg-slate-100 dark:bg-slate-800'
                                        }`}
                                >
                                    {/* Bucket Index */}
                                    <div
                                        className={`w-12 h-12 rounded-lg flex items-center justify-center font-mono font-bold text-lg ${highlightedBucket === bucket.index
                                                ? 'bg-amber-500 text-white'
                                                : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        {bucket.index}
                                    </div>

                                    {/* Entries */}
                                    <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-thin py-1">
                                        <AnimatePresence mode="popLayout">
                                            {bucket.entries.map((entry, i) => (
                                                <motion.div
                                                    key={entry.id}
                                                    layout
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{
                                                        scale: 1,
                                                        opacity: 1,
                                                    }}
                                                    exit={{ scale: 0, opacity: 0, rotate: 180 }}
                                                    className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium ${highlightedEntry?.bucket === bucket.index &&
                                                            highlightedEntry?.key === entry.key
                                                            ? 'bg-green-500 text-white ring-2 ring-green-300'
                                                            : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600'
                                                        }`}
                                                >
                                                    <span className="font-bold text-amber-600 dark:text-amber-400">
                                                        {entry.key}
                                                    </span>
                                                    <span className="text-slate-400 mx-1">:</span>
                                                    <span className="text-slate-700 dark:text-slate-300">
                                                        {entry.value}
                                                    </span>
                                                    {i < bucket.entries.length - 1 && (
                                                        <span className="ml-2 text-slate-400">→</span>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        {/* Empty bucket indicator */}
                                        {bucket.entries.length === 0 && (
                                            <span className="text-sm text-slate-400 dark:text-slate-500 italic">
                                                Empty
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
