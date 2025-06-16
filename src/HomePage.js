import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
    return (
        <div className="homepage-container">
            {/* Background Shapes */}
            <div className="bg-shapes">
                <div className="shape shape1"></div>
                <div className="shape shape2"></div>
                <div className="shape shape3"></div>
            </div>

            {/* Header */}
            <header className="modern-header">
                <div className="logo-section">
                    <div className="logo-icon">AI</div>
                    <span className="service-name">서비스 이름</span>
                </div>
                <nav className="main-nav">
                    <Link to="/" className="nav-link active">Home</Link>
                    <Link to="/context" className="nav-link">Context-aware learning</Link>
                    <Link to="/daily" className="nav-link">Daily Learning</Link>
                    <Link to="/settings" className="nav-link">Settings</Link>
                </nav>
            </header>

            {/* Main Content */}
            <main className="main-content">
                <div className="content-left">
                    <div className="hero-section">
                        <h1 className="hero-title">
                            Korean Learning Journey<br />
                            with Your <span className="text-gradient">Personal AI!</span>
                        </h1>
                        <p className="hero-subtitle">
                            Learn Korean tailored to different situations and get personalized one-on-one pronunciation feedback!
                        </p>
                    </div>

                    <div className="learning-options">
                        <div className="learning-card context-card">
                            <div className="card-content">
                                <h3>Context-aware learning</h3>
                                <p>Pick your situation and dive into personalized learning!</p>
                                <Link to="/context" className="action-btn context-btn">
                                    Get Started
                                    <span className="btn-arrow">→</span>
                                </Link>
                            </div>
                        </div>

                        <div className="learning-card daily-card">
                            <div className="card-content">
                                <h3>Daily Learning</h3>
                                <p>Build your skills through steady daily learning!</p>
                                <Link to="/daily" className="action-btn daily-btn">
                                    Get Started
                                    <span className="btn-arrow">→</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="content-right">
                    <div className="illustration-area">
                        <div className="orbit-ring"></div>
                        <div className="ai-robot">
                            <div className="robot-face">🤖</div>
                        </div>

                        <div className="floating-chat">
                            안녕하세요! 👋
                        </div>

                        <div className="floating-progress">
                            Daily Progress<br />
                            ★★★☆☆
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}