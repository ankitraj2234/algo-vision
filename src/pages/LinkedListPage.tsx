import { useState, useCallback, useRef } from 'react';
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
    ArrowLeft,
    RefreshCw,
    Link2,
    BookOpen,
    Play,
    Pause,
    AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ListNode {
    id: number;
    value: number;
    hasCycle?: boolean;
}

type ListType = 'singly' | 'doubly' | 'circular';

const listTypes = [
    { id: 'singly' as ListType, name: 'Singly Linked', icon: ArrowRight, description: 'Each node points to the next' },
    { id: 'doubly' as ListType, name: 'Doubly Linked', icon: Link2, description: 'Nodes point both directions' },
    { id: 'circular' as ListType, name: 'Circular Linked', icon: RefreshCw, description: 'Tail connects back to head' },
];

const pseudocode: Record<ListType, string[]> = {
    singly: [
        'class Node:',
        '  data, next',
        '',
        'insertAtHead(value):',
        '  newNode.next = head',
        '  head = newNode',
        '',
        'insertAtTail(value):',
        '  traverse to last node',
        '  lastNode.next = newNode',
    ],
    doubly: [
        'class Node:',
        '  prev, data, next',
        '',
        'insertAtHead(value):',
        '  newNode.next = head',
        '  head.prev = newNode',
        '  head = newNode',
        '',
        'insertAtTail(value):',
        '  tail.next = newNode',
        '  newNode.prev = tail',
        '  tail = newNode',
    ],
    circular: [
        'class Node:',
        '  data, next',
        '',
        'insertAtTail(value):',
        '  newNode.next = head',
        '  tail.next = newNode',
        '  tail = newNode',
        '',
        'traverse():',
        '  while curr != head:',
        '    curr = curr.next',
    ],
};

const cycleDetectionPseudocode = [
    "Floyd's Cycle Detection:",
    '',
    'slow = head',
    'fast = head',
    '',
    'while fast and fast.next:',
    '  slow = slow.next       // 1 step',
    '  fast = fast.next.next  // 2 steps',
    '  if slow == fast:',
    '    return true  // Cycle found!',
    '',
    'return false  // No cycle',
];

export function LinkedListPage() {
    const [listType, setListType] = useState<ListType>('singly');
    const [list, setList] = useState<ListNode[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [positionValue, setPositionValue] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
    const [searchingIndex, setSearchingIndex] = useState<number | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentStep, setCurrentStep] = useState(-1);

    // Cycle detection state
    const [cycleTargetIndex, setCycleTargetIndex] = useState<number | null>(null);
    const [isDetectingCycle, setIsDetectingCycle] = useState(false);
    const [slowPointer, setSlowPointer] = useState<number | null>(null);
    const [fastPointer, setFastPointer] = useState<number | null>(null);
    const [cycleFound, setCycleFound] = useState(false);

    const isRunningRef = useRef(false);

    const showMessage = useCallback((type: 'success' | 'error' | 'info', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    }, []);

    const highlightStep = (step: number, duration = 500) => {
        setCurrentStep(step);
        setTimeout(() => setCurrentStep(-1), duration);
    };

    // Insert operations
    const insertAtBeginning = useCallback(() => {
        if (isAnimating) return;
        const value = parseInt(inputValue);
        if (isNaN(value)) { showMessage('error', 'Enter a valid number'); return; }

        setIsAnimating(true);
        highlightStep(listType === 'singly' ? 4 : listType === 'doubly' ? 4 : 4);
        const newNode: ListNode = { id: Date.now(), value };
        setList(prev => [newNode, ...prev]);
        setInputValue('');
        showMessage('success', `Inserted ${value} at head`);
        setTimeout(() => setIsAnimating(false), 300);
    }, [inputValue, isAnimating, showMessage, listType]);

    const insertAtEnd = useCallback(() => {
        if (isAnimating) return;
        const value = parseInt(inputValue);
        if (isNaN(value)) { showMessage('error', 'Enter a valid number'); return; }

        setIsAnimating(true);
        highlightStep(listType === 'singly' ? 8 : listType === 'doubly' ? 9 : 4);
        const newNode: ListNode = { id: Date.now(), value };
        setList(prev => [...prev, newNode]);
        setInputValue('');
        showMessage('success', `Inserted ${value} at tail`);
        setTimeout(() => setIsAnimating(false), 300);
    }, [inputValue, isAnimating, showMessage, listType]);

    const insertAtPosition = useCallback(() => {
        if (isAnimating) return;
        const value = parseInt(inputValue);
        const position = parseInt(positionValue);

        if (isNaN(value)) { showMessage('error', 'Enter a valid value'); return; }
        if (isNaN(position) || position < 0 || position > list.length) {
            showMessage('error', `Position must be 0-${list.length}`);
            return;
        }

        setIsAnimating(true);
        const newNode: ListNode = { id: Date.now(), value };
        setList(prev => [...prev.slice(0, position), newNode, ...prev.slice(position)]);
        setInputValue('');
        setPositionValue('');
        showMessage('success', `Inserted ${value} at position ${position}`);
        setTimeout(() => setIsAnimating(false), 300);
    }, [inputValue, positionValue, list.length, isAnimating, showMessage]);

    // Delete operations
    const deleteByValue = useCallback(() => {
        if (isAnimating) return;
        const value = parseInt(inputValue);
        if (isNaN(value)) { showMessage('error', 'Enter a value to delete'); return; }

        const index = list.findIndex(node => node.value === value);
        if (index === -1) { showMessage('error', `Value ${value} not found`); return; }

        setIsAnimating(true);
        setHighlightedIndex(index);
        setTimeout(() => {
            setList(prev => prev.filter((_, i) => i !== index));
            setHighlightedIndex(null);
            setInputValue('');
            showMessage('success', `Deleted ${value}`);
            setIsAnimating(false);
        }, 500);
    }, [inputValue, list, isAnimating, showMessage]);

    const deleteAtPosition = useCallback(() => {
        if (isAnimating) return;
        const position = parseInt(positionValue);

        if (isNaN(position) || position < 0 || position >= list.length) {
            showMessage('error', `Position must be 0-${list.length - 1}`);
            return;
        }

        setIsAnimating(true);
        setHighlightedIndex(position);
        setTimeout(() => {
            const deletedValue = list[position].value;
            setList(prev => prev.filter((_, i) => i !== position));
            setHighlightedIndex(null);
            setPositionValue('');
            showMessage('success', `Deleted ${deletedValue} at position ${position}`);
            setIsAnimating(false);
        }, 500);
    }, [positionValue, list, isAnimating, showMessage]);

    // Reverse list (especially useful for doubly linked)
    const reverseList = useCallback(async () => {
        if (isAnimating || list.length < 2) return;
        setIsAnimating(true);
        isRunningRef.current = true;

        const reversed = [...list].reverse();
        for (let i = 0; i < reversed.length; i++) {
            if (!isRunningRef.current) break;
            setHighlightedIndex(i);
            await new Promise(r => setTimeout(r, 200));
        }

        setList(reversed);
        setHighlightedIndex(null);
        showMessage('success', 'List reversed!');
        setIsAnimating(false);
        isRunningRef.current = false;
    }, [list, isAnimating, showMessage]);

    // Search with pointer animation
    const searchValue = useCallback(async () => {
        if (isAnimating) return;
        const value = parseInt(inputValue);
        if (isNaN(value)) { showMessage('error', 'Enter a value to search'); return; }

        setIsAnimating(true);
        isRunningRef.current = true;

        for (let i = 0; i < list.length; i++) {
            if (!isRunningRef.current) break;
            setSearchingIndex(i);
            await new Promise(r => setTimeout(r, 400));

            if (list[i].value === value) {
                setHighlightedIndex(i);
                setSearchingIndex(null);
                showMessage('success', `Found ${value} at position ${i}!`);
                setTimeout(() => { setHighlightedIndex(null); setIsAnimating(false); }, 2000);
                isRunningRef.current = false;
                return;
            }
        }

        setSearchingIndex(null);
        showMessage('error', `Value ${value} not found`);
        setIsAnimating(false);
        isRunningRef.current = false;
    }, [inputValue, list, isAnimating, showMessage]);

    // Create cycle (for demo)
    const createCycle = useCallback(() => {
        if (list.length < 3 || cycleTargetIndex !== null) {
            showMessage('info', cycleTargetIndex !== null ? 'Cycle already exists' : 'Need at least 3 nodes');
            return;
        }
        const targetIdx = Math.floor(list.length / 2);
        setCycleTargetIndex(targetIdx);
        showMessage('info', `Cycle created: tail → node[${targetIdx}]`);
    }, [list.length, cycleTargetIndex, showMessage]);

    // Floyd's Cycle Detection Algorithm
    const detectCycle = useCallback(async () => {
        if (isAnimating || list.length < 2) return;
        setIsDetectingCycle(true);
        setIsAnimating(true);
        isRunningRef.current = true;
        setCycleFound(false);

        let slow = 0, fast = 0;
        setSlowPointer(slow);
        setFastPointer(fast);
        await new Promise(r => setTimeout(r, 500));

        const maxIterations = cycleTargetIndex !== null ? list.length * 3 : list.length;

        for (let iter = 0; iter < maxIterations; iter++) {
            if (!isRunningRef.current) break;

            // Move slow by 1
            slow = cycleTargetIndex !== null && slow === list.length - 1 ? cycleTargetIndex : slow + 1;
            if (slow >= list.length && cycleTargetIndex === null) break;

            // Move fast by 2
            for (let step = 0; step < 2; step++) {
                fast = cycleTargetIndex !== null && fast === list.length - 1 ? cycleTargetIndex : fast + 1;
                if (fast >= list.length && cycleTargetIndex === null) break;
            }
            if (fast >= list.length && cycleTargetIndex === null) break;

            setSlowPointer(slow % list.length);
            setFastPointer(fast % list.length);
            await new Promise(r => setTimeout(r, 600));

            // Check if pointers meet
            if (slow === fast && cycleTargetIndex !== null) {
                setCycleFound(true);
                showMessage('success', `🔄 Cycle detected! Slow & Fast met at position ${slow}`);
                setIsDetectingCycle(false);
                setIsAnimating(false);
                isRunningRef.current = false;
                return;
            }
        }

        setSlowPointer(null);
        setFastPointer(null);
        showMessage('info', 'No cycle detected');
        setIsDetectingCycle(false);
        setIsAnimating(false);
        isRunningRef.current = false;
    }, [list.length, cycleTargetIndex, isAnimating, showMessage]);

    const removeCycle = () => { setCycleTargetIndex(null); setCycleFound(false); setSlowPointer(null); setFastPointer(null); showMessage('success', 'Cycle removed'); };
    const clear = () => { setList([]); setCycleTargetIndex(null); setCycleFound(false); setSlowPointer(null); setFastPointer(null); showMessage('success', 'List cleared'); };
    const reset = () => { setList([]); setInputValue(''); setPositionValue(''); setMessage(null); setHighlightedIndex(null); setSearchingIndex(null); setCycleTargetIndex(null); setCycleFound(false); setSlowPointer(null); setFastPointer(null); isRunningRef.current = false; };
    const stopOperation = () => { isRunningRef.current = false; };

    const currentTypeInfo = listTypes.find(t => t.id === listType)!;

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/" className="control-btn"><ChevronLeft className="w-5 h-5" /></Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Linked List Data Structures</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">Singly, Doubly, Circular + Cycle Detection</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Controls */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* List Type Selection */}
                        <div className="algo-card">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" /> List Type
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                {listTypes.map(type => (
                                    <button key={type.id} onClick={() => { setListType(type.id); reset(); }}
                                        className={`flex flex-col items-center p-2 rounded-lg text-xs transition ${listType === type.id ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
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

                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Value" className="input-field" disabled={isAnimating} />
                                <input type="number" value={positionValue} onChange={(e) => setPositionValue(e.target.value)}
                                    placeholder="Position" className="input-field" disabled={isAnimating} />
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Insert</p>
                            <div className="grid grid-cols-3 gap-1 mb-2">
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={insertAtBeginning}
                                    disabled={isAnimating} className="btn btn-primary text-xs disabled:opacity-50">
                                    <Plus className="w-3 h-3" /> Head
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={insertAtEnd}
                                    disabled={isAnimating} className="btn btn-primary text-xs disabled:opacity-50">
                                    <Plus className="w-3 h-3" /> Tail
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={insertAtPosition}
                                    disabled={isAnimating} className="btn btn-secondary text-xs disabled:opacity-50">
                                    <Plus className="w-3 h-3" /> At Pos
                                </motion.button>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Delete</p>
                            <div className="grid grid-cols-2 gap-1 mb-2">
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={deleteByValue}
                                    disabled={isAnimating || list.length === 0} className="btn btn-danger text-xs disabled:opacity-50">
                                    <Minus className="w-3 h-3" /> By Value
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={deleteAtPosition}
                                    disabled={isAnimating || list.length === 0} className="btn btn-danger text-xs disabled:opacity-50">
                                    <Minus className="w-3 h-3" /> By Pos
                                </motion.button>
                            </div>

                            <div className="grid grid-cols-3 gap-1">
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={searchValue}
                                    disabled={isAnimating || list.length === 0} className="btn btn-secondary text-xs disabled:opacity-50">
                                    <Search className="w-3 h-3" /> Search
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={reverseList}
                                    disabled={isAnimating || list.length < 2} className="btn btn-secondary text-xs disabled:opacity-50">
                                    <RefreshCw className="w-3 h-3" /> Reverse
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={clear}
                                    disabled={list.length === 0} className="btn btn-secondary text-xs disabled:opacity-50">
                                    <Trash2 className="w-3 h-3" /> Clear
                                </motion.button>
                            </div>
                        </div>

                        {/* Cycle Detection */}
                        <div className="algo-card">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-orange-500" /> Cycle Detection
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                Floyd's Tortoise & Hare Algorithm - O(n) time, O(1) space
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={createCycle}
                                    disabled={list.length < 3 || cycleTargetIndex !== null} className="btn btn-secondary text-xs disabled:opacity-50">
                                    Create Cycle
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={removeCycle}
                                    disabled={cycleTargetIndex === null} className="btn btn-secondary text-xs disabled:opacity-50">
                                    Remove Cycle
                                </motion.button>
                                {!isDetectingCycle ? (
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={detectCycle}
                                        disabled={isAnimating || list.length < 2} className="btn btn-primary col-span-2 text-xs disabled:opacity-50">
                                        <Play className="w-3 h-3" /> Detect Cycle
                                    </motion.button>
                                ) : (
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={stopOperation}
                                        className="btn btn-danger col-span-2 text-xs">
                                        <Pause className="w-3 h-3" /> Stop
                                    </motion.button>
                                )}
                            </div>
                            {cycleTargetIndex !== null && (
                                <div className="mt-2 p-2 bg-orange-100 dark:bg-orange-900/30 rounded text-xs text-orange-700 dark:text-orange-300">
                                    ⚠️ Cycle: tail → node[{cycleTargetIndex}]
                                </div>
                            )}
                            {cycleFound && (
                                <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 rounded text-xs text-green-700 dark:text-green-300">
                                    ✓ Cycle detected by Floyd's Algorithm!
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="algo-card">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-center">
                                    <p className="text-xs text-slate-500">Size</p>
                                    <p className="text-lg font-bold">{list.length}</p>
                                </div>
                                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-center">
                                    <p className="text-xs text-violet-600 dark:text-violet-400">Head</p>
                                    <p className="text-lg font-bold text-violet-700 dark:text-violet-300">{list.length > 0 ? list[0].value : '-'}</p>
                                </div>
                                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-center">
                                    <p className="text-xs text-purple-600 dark:text-purple-400">Tail</p>
                                    <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{list.length > 0 ? list[list.length - 1].value : '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Pseudocode */}
                        <div className="algo-card">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                {isDetectingCycle ? "Floyd's Algorithm" : 'Pseudocode'}
                            </h3>
                            <div className="font-mono text-[10px] bg-slate-800 dark:bg-slate-900 p-2 rounded text-slate-300 max-h-32 overflow-auto">
                                {(isDetectingCycle ? cycleDetectionPseudocode : pseudocode[listType]).map((line, i) => (
                                    <div key={i} className={`px-1 rounded ${currentStep === i ? 'bg-yellow-500/30 text-yellow-300' : ''}`}>
                                        {line || '\u00A0'}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Visualization */}
                    <div className="lg:col-span-2 visualizer-container">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{currentTypeInfo.name} List</h3>
                            {isDetectingCycle && (
                                <div className="flex gap-4 text-xs">
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500" /> Slow (Tortoise)</span>
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500" /> Fast (Hare)</span>
                                </div>
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

                        {/* List */}
                        <div className="flex-1 flex items-center justify-start py-8 overflow-x-auto">
                            <div className="flex items-center gap-0 px-4">
                                {list.length > 0 && <div className="text-violet-600 dark:text-violet-400 text-xs font-bold mr-2">HEAD</div>}

                                <AnimatePresence mode="popLayout">
                                    {list.map((node, index) => (
                                        <motion.div key={node.id} layout
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0, rotate: 360 }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                            className="flex items-center relative">

                                            {/* Doubly linked: prev arrow */}
                                            {listType === 'doubly' && index > 0 && (
                                                <motion.div className="text-purple-400 -ml-1 -mr-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                    <ArrowLeft className="w-3 h-3" />
                                                </motion.div>
                                            )}

                                            {/* Node */}
                                            <div className={`ll-node relative ${highlightedIndex === index ? 'ring-4 ring-green-400 bg-gradient-to-br from-green-500 to-green-600' :
                                                    searchingIndex === index ? 'ring-4 ring-orange-400 bg-gradient-to-br from-orange-500 to-orange-600' :
                                                        slowPointer === index && fastPointer === index ? 'ring-4 ring-yellow-400 bg-gradient-to-br from-yellow-500 to-yellow-600' :
                                                            slowPointer === index ? 'ring-4 ring-green-400' :
                                                                fastPointer === index ? 'ring-4 ring-red-400' :
                                                                    cycleTargetIndex !== null && index === cycleTargetIndex ? 'ring-2 ring-orange-400' : ''
                                                }`}>
                                                <span className="text-sm font-bold">{node.value}</span>
                                                <span className="absolute -bottom-5 text-[10px] text-slate-400">[{index}]</span>

                                                {/* Pointer labels */}
                                                {slowPointer === index && (
                                                    <span className="absolute -top-5 text-[10px] bg-green-500 text-white px-1 rounded">🐢</span>
                                                )}
                                                {fastPointer === index && fastPointer !== slowPointer && (
                                                    <span className="absolute -top-5 text-[10px] bg-red-500 text-white px-1 rounded">🐇</span>
                                                )}
                                            </div>

                                            {/* Next arrow or circular back */}
                                            {index < list.length - 1 ? (
                                                <motion.div className="mx-1 text-slate-400" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                                    <ArrowRight className="w-5 h-5" />
                                                </motion.div>
                                            ) : listType === 'circular' || cycleTargetIndex !== null ? (
                                                <motion.div className="mx-1 flex items-center text-orange-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                    <ArrowRight className="w-5 h-5" />
                                                    <span className="text-xs">→[{cycleTargetIndex ?? 0}]</span>
                                                </motion.div>
                                            ) : (
                                                <motion.div className="flex items-center ml-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                    <ArrowRight className="w-5 h-5 text-slate-400" />
                                                    <span className="ml-1 px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-xs font-mono text-slate-600 dark:text-slate-400">NULL</span>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {list.length === 0 && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="text-center text-slate-400 dark:text-slate-500 py-12 w-full">
                                        <Link2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-lg font-medium">List is empty</p>
                                        <p className="text-sm mt-1">Insert nodes to visualize</p>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Complexity info */}
                        <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs grid grid-cols-4 gap-2">
                            <div className="text-center">
                                <p className="text-slate-500">Insert Head</p>
                                <p className="font-mono text-emerald-600">O(1)</p>
                            </div>
                            <div className="text-center">
                                <p className="text-slate-500">Insert Tail</p>
                                <p className="font-mono text-emerald-600">{listType === 'doubly' ? 'O(1)' : 'O(n)'}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-slate-500">Delete</p>
                                <p className="font-mono text-yellow-600">O(n)</p>
                            </div>
                            <div className="text-center">
                                <p className="text-slate-500">Search</p>
                                <p className="font-mono text-yellow-600">O(n)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
