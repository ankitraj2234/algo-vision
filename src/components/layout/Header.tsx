import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Sun,
    Moon,
    Menu,
    X,
    Layers,
    Github
} from 'lucide-react';
import { useState } from 'react';
import { useThemeStore } from '../../stores/themeStore';

export function Header() {
    const { isDark, toggleTheme } = useThemeStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const isHome = location.pathname === '/';

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3">
                        <motion.div
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.3 }}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30"
                        >
                            <Layers className="w-5 h-5 text-white" />
                        </motion.div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-bold text-gradient">AlgoVision</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 -mt-0.5">
                                Algorithm Visualizer
                            </p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        <NavLink to="/" active={isHome}>Home</NavLink>
                        <NavLink to="/stack" active={location.pathname === '/stack'}>Stack</NavLink>
                        <NavLink to="/queue" active={location.pathname === '/queue'}>Queue</NavLink>
                        <NavLink to="/linked-list" active={location.pathname === '/linked-list'}>Linked List</NavLink>
                        <NavLink to="/sorting" active={location.pathname === '/sorting'}>Sorting</NavLink>
                        <NavLink to="/searching" active={location.pathname === '/searching'}>Searching</NavLink>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <motion.a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="control-btn hidden sm:flex"
                            aria-label="GitHub Repository"
                        >
                            <Github className="w-5 h-5" />
                        </motion.a>

                        <motion.button
                            onClick={toggleTheme}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="control-btn"
                            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDark ? (
                                <Sun className="w-5 h-5 text-yellow-500" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </motion.button>

                        {/* Mobile Menu Button */}
                        <motion.button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            whileTap={{ scale: 0.95 }}
                            className="control-btn md:hidden"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <motion.nav
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="md:hidden glass border-t border-slate-200 dark:border-slate-700"
                >
                    <div className="px-4 py-4 space-y-2">
                        <MobileNavLink to="/" onClick={() => setIsMenuOpen(false)}>Home</MobileNavLink>
                        <MobileNavLink to="/stack" onClick={() => setIsMenuOpen(false)}>Stack</MobileNavLink>
                        <MobileNavLink to="/queue" onClick={() => setIsMenuOpen(false)}>Queue</MobileNavLink>
                        <MobileNavLink to="/linked-list" onClick={() => setIsMenuOpen(false)}>Linked List</MobileNavLink>
                        <MobileNavLink to="/hash-table" onClick={() => setIsMenuOpen(false)}>Hash Table</MobileNavLink>
                        <MobileNavLink to="/sorting" onClick={() => setIsMenuOpen(false)}>Sorting</MobileNavLink>
                        <MobileNavLink to="/searching" onClick={() => setIsMenuOpen(false)}>Searching</MobileNavLink>
                        <MobileNavLink to="/graph" onClick={() => setIsMenuOpen(false)}>Graph</MobileNavLink>
                        <MobileNavLink to="/analysis" onClick={() => setIsMenuOpen(false)}>Analysis</MobileNavLink>
                    </div>
                </motion.nav>
            )}
        </header>
    );
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
    return (
        <Link
            to={to}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${active
                    ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
        >
            {children}
        </Link>
    );
}

function MobileNavLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className="block px-4 py-3 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
        >
            {children}
        </Link>
    );
}
