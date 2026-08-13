import React, { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Plus, TrendingUp, BookOpen, Package, DollarSign, RefreshCw } from 'lucide-react';
import gsap from 'gsap';
import { useBooks, useBookStats, useCategories } from '../hooks/useBooks';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';
import Spinner from '../components/Spinner';
import styles from './BooksPage.module.css';

const SORTS = [
  { value: 'created_at', label: 'Newest' },
  { value: 'price',      label: 'Price'  },
  { value: 'title',      label: 'Title'  },
  { value: 'rating',     label: 'Rating' },
];

export default function BooksPage() {
  const { user } = useAuth();
  const [search, setSearch]     = useState('');
  const [debouncedQ, setDQ]     = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort]         = useState('created_at');
  const [order, setOrder]       = useState('desc');
  const [page, setPage]         = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search
  const handleSearch = useCallback((v) => {
    setSearch(v);
    clearTimeout(window._st);
    window._st = setTimeout(() => { setDQ(v); setPage(1); }, 400);
  }, []);

  const params = { page, limit: 12, sort, order, ...(debouncedQ && { search: debouncedQ }), ...(category && { category }) };
  const { data: booksRes, isLoading, isFetching, refetch } = useBooks(params);
  const { data: statsRes } = useBookStats();
  const { data: catRes }   = useCategories();

  const books      = booksRes?.data       || [];
  const pagination = booksRes?.pagination || {};
  const stats      = statsRes?.data;
  const categories = catRes?.data         || [];

  const heroRef  = useRef(null);
  const gridRef  = useRef(null);
  const statsRefContainer = useRef(null);

  // Hero entrance — headline, subhead and CTA arrive in sequence
  useLayoutEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo('[data-hero="eyebrow"]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 })
        .fromTo('[data-hero="heading"]', { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.3')
        .fromTo('[data-hero="sub"]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.35')
        .fromTo('[data-hero="cta"]', { opacity: 0, y: 12, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.45 }, '-=0.25');
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // Stat cards: rise-in stagger + numbers count up whenever fresh stats arrive
  useEffect(() => {
    if (!stats || !statsRefContainer.current) return;
    const ctx = gsap.context(() => {
      const cards = statsRefContainer.current.querySelectorAll('[data-stat-card]');
      gsap.fromTo(cards, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' });

      statsRefContainer.current.querySelectorAll('[data-count]').forEach((el) => {
        const target = parseFloat(el.dataset.count);
        if (Number.isNaN(target)) return;
        const prefix = el.dataset.prefix || '';
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.1,
          ease: 'power2.out',
          onUpdate: () => { el.textContent = `${prefix}${Math.round(obj.val).toLocaleString('en-IN')}`; },
        });
      });
    }, statsRefContainer);
    return () => ctx.revert();
  }, [stats]);

  // Grid: staggered reveal whenever the visible set of books changes
  useEffect(() => {
    if (!gridRef.current || books.length === 0) return;
    const cards = gridRef.current.children;
    gsap.fromTo(
      cards,
      { opacity: 0, y: 26, rotateX: -6 },
      { opacity: 1, y: 0, rotateX: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
    );
  }, [books.length, page, debouncedQ, category, sort, order]);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero} ref={heroRef}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow} data-hero="eyebrow">Your digital library With</p>
          <h1 className={styles.heading} data-hero="heading">
            Multicloud Devops<br />
            <em>By Veera Sir Nareshit</em>
          </h1>
          <p className={styles.sub} data-hero="sub">
            A complete platform to learn, explore, and master AWS, Azure, Kubernetes, Terraform, CI/CD, and modern cloud technologies with real-time projects..
          </p>
          {user && (
            <Link to="/add" className={styles.heroCta} data-hero="cta">
              <Plus size={18} /> Add a Book
            </Link>
          )}
        </div>

        {/* Stats strip */}
        {stats && (
          <div className={styles.statsStrip} ref={statsRefContainer}>
            <StatCard icon={<BookOpen size={18} />} label="Total Books"  count={stats.total_books} />
            <StatCard icon={<Package size={18} />}  label="In Stock"     count={stats.total_stock} />
            <StatCard icon={<DollarSign size={18} />} label="Avg Price"  count={Number(stats.avg_price || 0).toFixed(0)} prefix="₹" />
            <StatCard icon={<TrendingUp size={18} />} label="Categories" count={stats.categories?.length || 0} />
          </div>
        )}
      </section>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search titles, authors, descriptions…"
          />
          {isFetching && <span className={styles.fetching} />}
        </div>

        <button className={styles.filterToggle} onClick={() => setShowFilters(v => !v)}>
          <SlidersHorizontal size={15} />
          Filters
        </button>

        <button className={styles.refreshBtn} onClick={() => refetch()} title="Refresh">
          <RefreshCw size={15} className={isFetching ? styles.spinning : ''} />
        </button>

        {user && (
          <Link to="/add" className={styles.addBtn}>
            <Plus size={15} /> Add
          </Link>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>Category</label>
            <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
              <option value="">All categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label>Sort by</label>
            <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label>Order</label>
            <select value={order} onChange={e => { setOrder(e.target.value); setPage(1); }}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
          <button className={styles.clearBtn} onClick={() => { setCategory(''); setSort('created_at'); setOrder('desc'); setSearch(''); setDQ(''); setPage(1); }}>
            Clear filters
          </button>
        </div>
      )}

      {/* Category chips */}
      {categories.length > 0 && !showFilters && (
        <div className={styles.chips}>
          <button className={`${styles.chip} ${category === '' ? styles.chipActive : ''}`} onClick={() => setCategory('')}>All</button>
          {categories.map(c => (
            <button
              key={c.id}
              className={`${styles.chip} ${category === String(c.id) ? styles.chipActive : ''}`}
              onClick={() => { setCategory(String(c.id)); setPage(1); }}
              style={{ '--c': c.color }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className={styles.loadingWrap}><Spinner size={40} /></div>
      ) : books.length === 0 ? (
        <div className={styles.empty}>
          <BookOpen size={48} strokeWidth={1} />
          <h3>No books found</h3>
          <p>Try a different search term or filter.</p>
          {user && <Link to="/add" className={styles.heroCta}><Plus size={16} /> Add the first book</Link>}
        </div>
      ) : (
        <>
          <div className={styles.resultsInfo}>
            <span>{pagination.total} book{pagination.total !== 1 ? 's' : ''}</span>
          </div>
          <div className={styles.grid} ref={gridRef}>
            {books.map((book, i) => <BookCard key={book.id} book={book} index={i} />)}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className={styles.pageBtn}>← Prev</button>
              <span className={styles.pageInfo}>Page {page} of {pagination.totalPages}</span>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)} className={styles.pageBtn}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, count, prefix = '' }) {
  return (
    <div className={styles.statCard} data-stat-card>
      <div className={styles.statIcon}>{icon}</div>
      <div>
        <div className={styles.statValue} data-count={count} data-prefix={prefix}>{prefix}0</div>
        <div className={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
}
