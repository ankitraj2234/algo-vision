import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Layers,
    List,
    Link2,
    Hash,
    BarChart3,
    Search,
    Network,
    LineChart,
    ArrowRight,
    Sparkles
} from 'lucide-react';

interface AlgorithmCard {
    title: string;
    description: string;
    icon: React.ReactNode;
    path: string;
    gradient: string;
    delay: number;
}

const algorithms: AlgorithmCard[] = [
    {
        title: 'Stack',
        description: 'LIFO data structure with push, pop, and peek operations',
        icon: <Layers className="w-8 h-8" />,
        path: '/stack',
        gradient: 'from-blue-500 to-indigo-600',
        delay: 0,
    },
    {
        title: 'Queue',
        description: 'FIFO data structure with enqueue and dequeue operations',
        icon: <List className="w-8 h-8" />,
        path: '/queue',
        gradient: 'from-emerald-500 to-teal-600',
        delay: 0.1,
    },
    {
        title: 'Linked List',
        description: 'Dynamic data structure with node-based connections',
        icon: <Link2 className="w-8 h-8" />,
        path: '/linked-list',
        gradient: 'from-violet-500 to-purple-600',
        delay: 0.2,
    },
    {
        title: 'Hash Table',
        description: 'Key-value storage with hash function and collision handling',
        icon: <Hash className="w-8 h-8" />,
        path: '/hash-table',
        gradient: 'from-amber-500 to-orange-600',
        delay: 0.3,
    },
    {
        title: 'Sorting',
        description: '9 sorting algorithms with real-time visualization',
        icon: <BarChart3 className="w-8 h-8" />,
        path: '/sorting',
        gradient: 'from-rose-500 to-pink-600',
        delay: 0.4,
    },
    {
        title: 'Searching',
        description: 'Linear, Binary, and Interpolation search algorithms',
        icon: <Search className="w-8 h-8" />,
        path: '/searching',
        gradient: 'from-cyan-500 to-blue-600',
        delay: 0.5,
    },
    {
        title: 'Graph',
        description: 'BFS, DFS, Dijkstra, and more graph algorithms',
        icon: <Network className="w-8 h-8" />,
        path: '/graph',
        gradient: 'from-fuchsia-500 to-pink-600',
        delay: 0.6,
    },
    {
        title: 'Analysis',
        description: 'Compare algorithm complexities and performance',
        icon: <LineChart className="w-8 h-8" />,
        path: '/analysis',
        gradient: 'from-slate-600 to-slate-800',
        delay: 0.7,
    },
];

export function HomePage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
                {/* Background decoration */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span>Interactive Algorithm Visualizer</span>
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight"
                    >
                        <span className="text-slate-900 dark:text-white">Master </span>
                        <span className="text-gradient">Data Structures</span>
                        <br />
                        <span className="text-slate-900 dark:text-white">& </span>
                        <span className="text-gradient">Algorithms</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed"
                    >
                        Visualize complex algorithms step-by-step with beautiful animations.
                        Perfect for students, educators, and developers preparing for interviews.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="mt-10 flex flex-wrap justify-center gap-4"
                    >
                        <Link to="/stack" className="btn btn-primary">
                            Get Started
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <a
                            href="https://github.com/AnkitRaj-12/AlgoVision"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                        >
                            View on GitHub
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Algorithm Cards Grid */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Explore Algorithms
                        </h2>
                        <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Choose from a variety of data structures and algorithms to visualize
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {algorithms.map((algo) => (
                            <AlgorithmCardComponent key={algo.path} {...algo} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100 dark:bg-slate-800/50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Sparkles className="w-6 h-6" />}
                            title="Beautiful Animations"
                            description="Smooth, step-by-step animations powered by Framer Motion"
                        />
                        <FeatureCard
                            icon={<BarChart3 className="w-6 h-6" />}
                            title="Real-time Stats"
                            description="Track comparisons, swaps, and execution time"
                        />
                        <FeatureCard
                            icon={<Search className="w-6 h-6" />}
                            title="Code Examples"
                            description="View and copy implementation code in multiple languages"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

function AlgorithmCardComponent({ title, description, icon, path, gradient, delay }: AlgorithmCard) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
        >
            <Link to={path}>
                <motion.div
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="algo-card h-full cursor-pointer group"
                >
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        {icon}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        {title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {description}
                    </p>
                    <div className="mt-4 flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Explore</span>
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                </motion.div>
            </Link>
        </motion.div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center p-6"
        >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
                {description}
            </p>
        </motion.div>
    );
}
