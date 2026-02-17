'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { HiOutlineLogout } from 'react-icons/hi';
import { MdHistory } from 'react-icons/md';

export default function Navbar() {
    const { user, loading, signInWithGoogle, signOut } = useAuth();

    return (
        <nav className="navbar">
            <Link href="/" className="nav-brand">
                <span className="nav-shield">🛡️</span>
                <span className="nav-title">CyberSec Arena</span>
            </Link>
            <div className="nav-actions">
                {!loading && (
                    <>
                        {user ? (
                            <>
                                <Link href="/history" className="nav-history-btn">
                                    <MdHistory size={18} />
                                    <span>History</span>
                                </Link>
                                <div className="nav-user">
                                    {user.photoURL && (
                                        <img src={user.photoURL} alt="" className="nav-avatar" referrerPolicy="no-referrer" />
                                    )}
                                    <span className="nav-name">{user.displayName?.split(' ')[0]}</span>
                                </div>
                                <button onClick={signOut} className="nav-btn nav-btn-out" title="Sign out">
                                    <HiOutlineLogout size={18} />
                                </button>
                            </>
                        ) : (
                            <button onClick={signInWithGoogle} className="nav-btn nav-btn-google">
                                <FcGoogle size={18} />
                                <span>Sign in</span>
                            </button>
                        )}
                    </>
                )}
            </div>
        </nav>
    );
}
