import React from 'react';
import { Link } from 'react-router-dom';
import './Style/HomePage.css';

export default function HomePage() {
    return (
        <div className="homepage">
            {/* Header */}
            <header className="header">
                <div className="logo-section">
                    <img src="/Logo.png" alt="Logo" className="logo" />
                    <span className="service-name">서비스 이름</span>
                </div>
                <nav className="nav">
                    <div className="center-nav">
                        <Link to="/" className="nav-item active">Home</Link>
                        <Link to="/context" className="nav-item">Context-aware learning</Link>
                        <Link to="/daily" className="nav-item">Daily Learning</Link>
                        <Link to="/settings" className="nav-item">Settings</Link>
                    </div>
                </nav>
            </header>

            {/* Main Section */}
            <div className="main">
                <div className="main-left">
                    <div className="intro-section">
                        <h1 className="intro-title">
                            <span>Korean Learning Journey</span><br />
                            <span>with Your Personal AI!</span>
                        </h1>
                        <p className="intro-subtitle">
                            Learn Korean tailored to different situations<br />
                            and get personalized one-on-one pronunciation feedback!
                        </p>

                        <div className="feature-box-container">
                            <div className="feature-card context-learning">
                                <h3>Context-aware learning</h3>
                                <p>Pick your situation and dive into personalized learning!</p>
                                <Link to="/context" className="start-button gray">Get Started</Link>
                            </div>

                            <div className="feature-card daily-learning">
                                <h3>Daily Learning</h3>
                                <p>Build your skills through steady daily learning!</p>
                                <Link to="/daily" className="start-button yellow">Get Started</Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="main-right">
                    <img src="/LearningFlow.png" alt="AI Korean learning" className="main-image" />
                </div>
            </div>
        </div>
    );
}
