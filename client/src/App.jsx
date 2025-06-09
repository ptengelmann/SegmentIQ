// App.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { 
 Home,
 BarChart3, 
 Upload, 
 Layers, 
 ChevronLeft, 
 ChevronRight,
 Settings,
 Users,
 Bell,
 Search,
 TrendingUp,
 Database,
 PieChart,
 Activity
} from 'lucide-react';
import styles from './App.module.scss';

// Import pages
import HomePage from './pages/home/HomePage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import UploadPage from './pages/upload/upload';
import SegmentBuilder from './pages/segments/segmentBuilder';
import SegmentsList from './pages/segments/SegmentsList';
import ProfilesPage from './pages/profiles/profilesPage';

// Custom NavLink wrapper with animation capabilities
const SidebarNavLink = ({ to, icon, label, description, isExpanded, subItems = [] }) => {
 const [isHovering, setIsHovering] = useState(false);
 const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
 
 // Location for determining active state
 const location = useLocation();
 const isActive = location.pathname === to || 
                 (subItems.length > 0 && subItems.some(item => location.pathname === item.to));
 
 const handleMouseEnter = useCallback(() => setIsHovering(true), []);
 const handleMouseLeave = useCallback(() => setIsHovering(false), []);
 
 const toggleSubMenu = useCallback((e) => {
   if (subItems.length > 0) {
     e.preventDefault();
     setIsSubMenuOpen(!isSubMenuOpen);
   }
 }, [subItems, isSubMenuOpen]);

  // Reset submenu state when sidebar collapses
 useEffect(() => {
   if (!isExpanded) {
     setIsSubMenuOpen(false);
   }
 }, [isExpanded]);

 return (
   <div className={`${styles.navItemContainer} ${isActive ? styles.active : ''}`}>
     <NavLink 
       to={to}
       className={styles.navLink}
       onMouseEnter={handleMouseEnter}
       onMouseLeave={handleMouseLeave}
       onClick={subItems.length > 0 ? toggleSubMenu : undefined}
     >
       <div className={styles.navLinkContent}>
         <div className={styles.iconWrapper}>
           {React.cloneElement(icon, { 
             size: 20,
             className: `${styles.navIcon} ${isActive ? styles.activeIcon : ''}`
           })}
           {/* Glow effect for active state */}
           {isActive && <div className={styles.iconGlow} />}
         </div>
         
         {/* Label with transition */}
         <span className={`${styles.navLabel} ${isExpanded ? styles.visible : styles.hidden}`}>
           {label}
         </span>
         
         {/* Submenu indicator for collapsed state with submenus */}
         {!isExpanded && subItems.length > 0 && (
           <div className={styles.subMenuIndicator}></div>
         )}
         
         {/* Tooltip for collapsed state - now enhanced with submenu items */}
         {!isExpanded && isHovering && (
           <div className={`${styles.tooltip} ${subItems.length > 0 ? styles.withSubmenu : ''}`}>
             <div className={styles.tooltipLabel}>{label}</div>
             {description && !subItems.length && (
               <div className={styles.tooltipDescription}>{description}</div>
             )}
             
             {/* Show submenu items in tooltip when collapsed */}
             {subItems.length > 0 && (
               <div className={styles.tooltipSubmenu}>
                 {subItems.map((item, index) => (
                   <NavLink 
                     key={index}
                     to={item.to}
                     className={({ isActive }) => 
                       `${styles.tooltipSubmenuItem} ${isActive ? styles.activeTooltipSubmenuItem : ''}`
                     }
                     onClick={(e) => e.stopPropagation()} // Prevent parent click
                   >
                     {item.label}
                   </NavLink>
                 ))}
               </div>
             )}
           </div>
         )}
         
         {/* Chevron for items with subitems */}
         {subItems.length > 0 && isExpanded && (
           <ChevronRight 
             size={16} 
             className={`${styles.subMenuIcon} ${isSubMenuOpen ? styles.rotated : ''}`}
           />
         )}
       </div>
     </NavLink>
     
     {/* Submenu items */}
     {isExpanded && subItems.length > 0 && (
       <div className={`${styles.subMenu} ${isSubMenuOpen ? styles.open : ''}`}>
         {subItems.map((item, index) => (
           <NavLink 
             key={index}
             to={item.to}
             className={({ isActive }) => 
               `${styles.subNavLink} ${isActive ? styles.activeSubNav : ''}`
             }
           >
             <span className={styles.subNavDot}></span>
             <span>{item.label}</span>
           </NavLink>
         ))}
       </div>
     )}
   </div>
 );
};

// Main App component
function App() {
 const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
 const [isMobileView, setIsMobileView] = useState(false);
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

 // Toggle sidebar expansion state
 const toggleSidebar = useCallback(() => {
   setIsSidebarExpanded(prev => !prev);
 }, []);

 // Close mobile menu when route changes
 const handleRouteChange = useCallback(() => {
   if (isMobileView && isMobileMenuOpen) {
     setIsMobileMenuOpen(false);
   }
 }, [isMobileView, isMobileMenuOpen]);

 // Toggle mobile menu
 const toggleMobileMenu = useCallback(() => {
   setIsMobileMenuOpen(prev => !prev);
 }, []);

 // Responsive handler
 useEffect(() => {
   const handleResize = () => {
     setIsMobileView(window.innerWidth < 768);
     if (window.innerWidth >= 768) {
       setIsMobileMenuOpen(false);
     }
   };

   // Set initial state
   handleResize();

   // Add listener
   window.addEventListener('resize', handleResize);
   
   // Cleanup
   return () => window.removeEventListener('resize', handleResize);
 }, []);

 return (
   <Router>
     <div className={styles.appContainer}>
       {/* Mobile hamburger menu */}
       {isMobileView && (
         <button 
           className={`${styles.hamburgerMenu} ${isMobileMenuOpen ? styles.active : ''}`}
           onClick={toggleMobileMenu}
           aria-label="Toggle navigation menu"
         >
           <span></span>
           <span></span>
           <span></span>
         </button>
       )}

       {/* Sidebar navigation */}
       <aside 
         className={`
           ${styles.sidebar} 
           ${isSidebarExpanded ? styles.expanded : styles.collapsed}
           ${isMobileView ? styles.mobile : ''}
           ${isMobileMenuOpen ? styles.mobileOpen : ''}
         `}
       >
         <div className={styles.sidebarHeader}>
           <div className={styles.logoContainer}>
             <div className={styles.logoIconWrapper}>
               <div className={styles.logoIcon}>S</div>
             </div>
             <h1 className={`${styles.logoText} ${isSidebarExpanded ? styles.visible : styles.hidden}`}>
               SegmentIQ
             </h1>
           </div>
           
           {!isMobileView && (
             <button 
               className={styles.toggleButton}
               onClick={toggleSidebar}
               aria-label={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
             >
               {isSidebarExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
             </button>
           )}
         </div>

         <div className={styles.searchContainer}>
           <div className={styles.searchWrapper}>
             <Search size={16} className={styles.searchIcon} />
             <input 
               type="text" 
               placeholder="Search..." 
               className={`${styles.searchInput} ${isSidebarExpanded ? styles.visible : styles.hidden}`}
             />
           </div>
         </div>

         <nav className={styles.sidebarNav} onClick={handleRouteChange}>
           <div className={styles.navSection}>
             <div className={`${styles.sectionTitle} ${isSidebarExpanded ? styles.visible : styles.hidden}`}>
               Main
             </div>
             
             <SidebarNavLink 
               to="/" 
               icon={<Home />} 
               label="Home" 
               description="Overview & quick actions"
               isExpanded={isSidebarExpanded}
             />
             
             <SidebarNavLink 
               to="/dashboard" 
               icon={<BarChart3 />} 
               label="Dashboard" 
               description="Real-time metrics & insights"
               isExpanded={isSidebarExpanded}
             />

             <SidebarNavLink 
               to="/analytics" 
               icon={<TrendingUp />} 
               label="Analytics" 
               description="Advanced data analysis"
               isExpanded={isSidebarExpanded}
             />
             
             <SidebarNavLink 
               to="/upload" 
               icon={<Upload />} 
               label="Upload Profiles" 
               description="Import customer data"
               isExpanded={isSidebarExpanded}
             />
             
             <SidebarNavLink 
               to="/segments" 
               icon={<Layers />} 
               label="Segments" 
               description="Customer segmentation"
               isExpanded={isSidebarExpanded}
               subItems={[
                 { to: "/segments/create", label: "Create Segment" },
                 { to: "/segments/list", label: "View All" },
                 { to: "/segments/templates", label: "Templates" },
                 { to: "/segments/history", label: "History" }
               ]}
             />
           </div>
           
           <div className={styles.navSection}>
             <div className={`${styles.sectionTitle} ${isSidebarExpanded ? styles.visible : styles.hidden}`}>
               System
             </div>
             
             <SidebarNavLink 
               to="/profiles" 
               icon={<Users />} 
               label="Profiles" 
               description="Customer profile management"
               isExpanded={isSidebarExpanded}
             />
             
             <SidebarNavLink 
               to="/team" 
               icon={<Users />} 
               label="Team Members" 
               description="User management"
               isExpanded={isSidebarExpanded}
             />
             
             <SidebarNavLink 
               to="/notifications" 
               icon={<Bell />} 
               label="Notifications" 
               description="System alerts"
               isExpanded={isSidebarExpanded}
             />
             
             <SidebarNavLink 
               to="/settings" 
               icon={<Settings />} 
               label="Settings" 
               description="Application configuration"
               isExpanded={isSidebarExpanded}
             />
           </div>
         </nav>

         <div className={styles.sidebarFooter}>
           <div className={styles.userProfile}>
             <div className={styles.avatarWrapper}>
               <div className={styles.avatar}>JD</div>
             </div>
             {isSidebarExpanded && (
               <div className={styles.userInfo}>
                 <div className={styles.userName}>John Doe</div>
                 <div className={styles.userRole}>Administrator</div>
               </div>
             )}
           </div>
         </div>
       </aside>

       {/* Main content area */}
       <main className={`${styles.mainContent} ${isSidebarExpanded && !isMobileView ? styles.shifted : ''}`}>
         <div className={styles.contentWrapper}>
           <Routes>
             <Route path="/" element={<HomePage />} />
             <Route path="/dashboard" element={<DashboardPage />} />
             <Route path="/analytics" element={<AnalyticsPage />} />
             <Route path="/upload" element={<UploadPage />} />
             
             {/* Segment routes */}
             <Route path="/segments" element={<SegmentsList />} />
             <Route path="/segments/create" element={<SegmentBuilder />} />
             <Route path="/segments/list" element={<SegmentsList />} />
             
             <Route path="/profiles" element={<ProfilesPage />} />
             <Route path="/team" element={<div className={styles.placeholderPage}>Team Members Page</div>} />
             <Route path="/notifications" element={<div className={styles.placeholderPage}>Notifications Page</div>} />
             <Route path="/settings" element={<div className={styles.placeholderPage}>Settings Page</div>} />
           </Routes>
         </div>
       </main>
       
       {/* Overlay for mobile menu */}
       {isMobileView && isMobileMenuOpen && (
         <div className={styles.overlay} onClick={toggleMobileMenu}></div>
       )}
     </div>
   </Router>
 );
}

export default App;