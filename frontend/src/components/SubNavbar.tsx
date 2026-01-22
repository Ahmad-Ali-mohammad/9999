import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface Tab {
    path: string;
    labelKey: string;
    icon?: string;
}

interface SubNavbarProps {
    tabs: Tab[];
}

const SubNavbar: React.FC<SubNavbarProps> = ({ tabs }) => {
    const location = useLocation();
    const { t, direction } = useLanguage();

    const isActive = (path: string) => {
        // Exact match or if the current path starts with this path (for sub-routes)
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    return (
        <div className="flex items-center gap-2 mb-8 bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit" dir={direction}>
            {tabs.map((tab) => (
                <Link
                    key={tab.path}
                    to={tab.path}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-semibold text-sm ${isActive(tab.path)
                            ? 'bg-gradient-to-r from-brand-navy to-brand-green text-white shadow-lg shadow-brand-green/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    {tab.icon && <span className="text-lg">{tab.icon}</span>}
                    {t(tab.labelKey)}
                </Link>
            ))}
        </div>
    );
};

export default SubNavbar;
