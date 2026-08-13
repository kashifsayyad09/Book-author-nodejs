import React, { useState, useRef, useLayoutEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';
import VantaBackground from '../components/VantaBackground';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const cardRef = useRef(null);

  useLayoutEffect(() => {
    if (!cardRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(cardRef.current, { opacity: 0, y: 30, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.6 })
        .fromTo('[data-field]', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, '-=0.3');
    }, cardRef);
    return () => ctx.revert();
  }, []);

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.page}>
      <VantaBackground
        effect="fog"
        className={styles.vanta}
        options={{
          highlightColor: 0x8b5cf6,
          midtoneColor: 0x3a3a5c,
          lowlightColor: 0x0d0d1a,
          baseColor: 0x0d0d1a,
          blurFactor: 0.6,
          speed: 1.2,
          zoom: 0.8,
        }}
      />
      <div className={styles.card} ref={cardRef}>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={15} />
          Back
        </Link>

        <div className={styles.logo}>
          <div className={styles.logoIcon}><BookOpen size={22} /></div>
          <span>BookShelf<em>Pro</em></span>
        </div>

        <h1 className={styles.heading}>Welcome back</h1>
        <p className={styles.sub}>Sign in to manage your library</p>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field} data-field>
            <label><Mail size={14} /> Email</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required autoFocus />
          </div>
          <div className={styles.field} data-field>
            <label><Lock size={14} /> Password</label>
            <div className={styles.pwWrap}>
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="••••••••" required />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading} data-field>
            {loading ? <span className={styles.spinner} /> : <LogIn size={16} />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className={styles.footer}>
          Don't have an account? <Link to="/register">Create one</Link>
        </p>

      </div>
    </div>
  );
}
