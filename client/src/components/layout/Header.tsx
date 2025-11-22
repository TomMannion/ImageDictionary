import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from '../ui/ThemeToggle';

export const Header = () => {
  const location = useLocation();
  const isCreatePage = location.pathname === '/create';

  return (
    <header className="bg-cream-50 border-b border-charcoal-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-4 md:py-8">
        <div className="flex items-center justify-between">
          <div>
            <Link to="/" className="flex items-center space-x-2 md:space-x-4 group">
              <h1 className="text-xl md:text-3xl font-display font-medium text-charcoal-800 tracking-tight group-hover:text-charcoal-600 transition-colors">
                Image Dictionary
              </h1>
              <span className="text-lg md:text-2xl text-charcoal-500 opacity-70 hidden sm:inline">
                画像辞書
              </span>
            </Link>
            {isCreatePage && (
              <p className="text-sm font-serif text-charcoal-500 mt-2 ml-1">
                Create New Entry
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {!isCreatePage && (
              <Link to="/create" className="btn-primary">
                New Entry
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
