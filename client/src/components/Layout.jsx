import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, LogIn, LogOut, User, Wifi, WifiOff, Menu, X } from 'lucide-react';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';
import { socket, connectSocket } from '../pages/config';
import VantaBackground from './VantaBackground';
import styles from './Layout.module.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [connected, setConnected] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled]  = useState(false);

  const navRef  = useRef(null);
  const mainRef = useRef(null);
  const liveDotRef = useRef(null);

  useEffect(() => {
    connectSocket();
    const onConnect    = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    setConnected(socket.connected);
    return () => { socket.off('connect', onConnect); socket.off('disconnect', onDisconnect); };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  // Nav entrance, once, on first mount
  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -72, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }
    );
  }, []);

  // Ambient pulse on the live/offline indicator
  useEffect(() => {
    if (!liveDotRef.current) return;
    const tween = gsap.to(liveDotRef.current, {
      scale: connected ? 1.35 : 1,
      opacity: connected ? 0.35 : 0.6,
      duration: 0.9,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    return () => tween.kill();
  }, [connected]);

  // Page transition on route change
  useEffect(() => {
    if (!mainRef.current) return;
    gsap.fromTo(
      mainRef.current,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }
    );
  }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };

  // One background lives at the shell level; it morphs by section so we
  // never run two WebGL contexts at once.
  const isDetailOrForm = /^\/(books\/|add|edit\/)/.test(location.pathname);
  const bgEffect  = isDetailOrForm ? 'cells' : 'net';
  const bgOptions = isDetailOrForm
    ? { color1: 0x6604c2, color2: 0x7efff3, size: 1.4, speed: 1.0 }
    : { color: 0xa78bfa, backgroundColor: 0x0d0d1a, points: 11.0, maxDistance: 22.0, spacing: 17.0, showDots: true };

  return (
    <div className={styles.shell}>
      {/* Dynamic, living background — morphs between a network of reading
          nodes (library / auth) and an organic cellular field (book detail
          and forms) */}
      <VantaBackground
        key={bgEffect}
        effect={bgEffect}
        className={styles.vanta}
        options={bgOptions}
      />

      <nav ref={navRef} className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
        <div className={styles.navInner}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}><BookOpen size={20} /></div>
            <span className={styles.logoText}>Veera<em>Ops Books</em></span>
          </Link>

          {/* Desktop nav links */}
          <div className={styles.navLinks}>
            <Link to="/" className={`${styles.navLink} ${location.pathname === '/' ? styles.active : ''}`}>
              Library
            </Link>
            {user && (
              <Link to="/add" className={`${styles.navLink} ${location.pathname === '/add' ? styles.active : ''}`}>
                Add Book
              </Link>
            )}
          </div>

          {/* Right controls */}
          <div className={styles.navRight}>
            {/* Live indicator */}
            <div className={`${styles.liveChip} ${connected ? styles.liveOn : styles.liveOff}`} title={connected ? 'Live updates active' : 'Offline'}>
              <span className={styles.liveDotWrap}>
                <span ref={liveDotRef} className={styles.liveDot} />
                {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
              </span>
              <span>{connected ? 'Live' : 'Offline'}</span>
            </div>

            {user ? (
              <>
                <div className={styles.userChip}>
                  <User size={14} />
                  <span>{user.username}</span>
                  {user.role === 'admin' && <span className={styles.adminBadge}>Admin</span>}
                </div>
                <button className={styles.iconBtn} onClick={handleLogout} title="Logout">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <Link to="/login" className={styles.loginBtn}>
                <LogIn size={15} /> Sign in
              </Link>
            )}

            {/* Mobile hamburger */}
            <button className={styles.hamburger} onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className={styles.mobileMenu}>
            <Link to="/" className={styles.mobileLink}>Library</Link>
            {user && <Link to="/add" className={styles.mobileLink}>+ Add Book</Link>}
            {user
              ? <button className={styles.mobileLink} onClick={handleLogout}>Sign out</button>
              : <Link to="/login" className={styles.mobileLink}>Sign in</Link>
            }
          </div>
        )}
      </nav>

      <main ref={mainRef} key={location.pathname} className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <p>BookShelf Pro &copy; {new Date().getFullYear()} &nbsp;·&nbsp; Built with ♥ for readers</p>
      </footer>
    </div>
  );
}
