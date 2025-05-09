
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  ClipboardList, 
  Home,
  Settings,
  FileSpreadsheet,
  HelpCircle,
  Menu,
  Atom,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);
  
  const toggleMenu = () => setIsOpen(!isOpen);
  
  const navItems = [
    { name: 'Dashboard', icon: <Home className="mr-2 h-4 w-4" />, path: '/' },
    { name: 'Data Entry', icon: <ClipboardList className="mr-2 h-4 w-4" />, path: '/data-entry' },
    { name: 'Reports', icon: <FileSpreadsheet className="mr-2 h-4 w-4" />, path: '/reports' },
    { name: 'Analytics', icon: <BarChart3 className="mr-2 h-4 w-4" />, path: '/analytics' },
    { name: 'Monitoring', icon: <Monitor className="mr-2 h-4 w-4" />, path: '/monitoring' },
    { name: 'Settings', icon: <Settings className="mr-2 h-4 w-4" />, path: '/settings' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-carbon text-xl font-bold flex items-center">
                <Atom className="h-6 w-6 mr-2" />
                BARYON
              </span>
            </div>
          </div>
          
          {isMobile ? (
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={toggleMenu}>
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          ) : (
            <div className="hidden md:ml-6 md:flex md:space-x-2">
              {navItems.map((item) => (
                <Link 
                  key={item.name} 
                  to={item.path}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-carbon hover:bg-gray-50 rounded-md"
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>
          )}
          
          <div className="hidden md:flex items-center">
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobile && isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center px-3 py-2 text-base font-medium text-gray-600 hover:text-carbon hover:bg-gray-50 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
