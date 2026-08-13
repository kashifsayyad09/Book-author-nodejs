import React, { useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import gsap from 'gsap';
import BookForm from '../components/BookForm';
import { useCreateBook } from '../hooks/useBooks';
import styles from './FormPage.module.css';

export default function AddBookPage() {
  const navigate = useNavigate();
  const createBook = useCreateBook();
  const headerRef = useRef(null);

  useLayoutEffect(() => {
    if (!headerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' });
    }, headerRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (data) => {
    createBook.mutate(data, { onSuccess: () => navigate('/') });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header} ref={headerRef}>
        <div className={styles.iconWrap}><Plus size={20} /></div>
        <div>
          <h1 className={styles.heading}>Add a New Book</h1>
          <p className={styles.sub}>Fill in the details below to add a book to your library.</p>
        </div>
      </div>
      <BookForm
        onSubmit={handleSubmit}
        submitting={createBook.isPending}
        submitLabel="Add Book"
      />
    </div>
  );
}
