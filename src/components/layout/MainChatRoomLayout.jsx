import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import '../../Style/ChatRoomList.scss';

export default function MainChatRoomLayout() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [chatRoomData, setChatRoomData] = useState([]);
    const [error, setError] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/api/v1/chat/rooms', {
                    headers: {
                        'Authorization': 'Bearer ZATae5h-sckvlY06-aks7r-Kn2uMq'
                    }
                });
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const json = await res.json();
                setChatRoomData(json);
                console.log(json);
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    function formatDate(input) {
        const date = new Date(input);
        const year = date.getFullYear() % 100;
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        const ss = String(date.getSeconds()).padStart(2, '0');

        return `${year}년 ${month}월 ${day}일 ${hh}:${mm}:${ss}`;
    }

    const handleCreateNewChat = () => {
        const input = window.prompt('Please describe the situation you are going to talk to.');
        if (input === null || input === undefined || input === '') {
            return;
        }
        console.log(input);

        const fetchData = async () => {
            setIsCreating(true);
            try {
                const res = await fetch('/api/v1/chat', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ZATae5h-sckvlY06-aks7r-Kn2uMq',
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        situation: input
                    })
                });

                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const json = await res.json();
                console.log(json);
                navigate(`/context/${json.chat_id}`);
            } catch (err) {
                window.alert(`채팅방 생성 오류 ${err}`);
            } finally {
                setIsCreating(false);
            }
        };

        fetchData();
    };

    const handleDeleteChatRoom = (chatId, idx) => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/v1/chat/${chatId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer ZATae5h-sckvlY06-aks7r-Kn2uMq',
                    },
                });

                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                setChatRoomData(chatRoomData.filter((_, i) => i !== idx))
            } catch (err) {
                window.alert(`채팅방 삭제 오류 ${err}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    };

    if (error) {
        return (
            <div className="context-aware-modern">
                <div className="bg-shapes">
                    <div className="shape shape1"></div>
                    <div className="shape shape2"></div>
                    <div className="shape shape3"></div>
                </div>

                <header className="context-header-modern">
                    <div className="header-left">
                        <button className="back-btn" onClick={() => navigate(-1)}>
                            <span>←</span>
                        </button>
                        <div className="page-title">
                            <h1>🎯 Context-aware Learning</h1>
                            <p>Learn Korean in real-life situations</p>
                        </div>
                    </div>
                </header>

                <div className="error-container">
                    <div className="error-message">
                        <h2>오류가 발생했습니다</h2>
                        <p>{error.message}</p>
                        <button onClick={() => window.location.reload()} className="retry-btn">
                            다시 시도
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="context-aware-modern">
            {/* Background Shapes */}
            <div className="bg-shapes">
                <div className="shape shape1"></div>
                <div className="shape shape2"></div>
                <div className="shape shape3"></div>
            </div>

            {/* Header */}
            <header className="context-header-modern">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <span>←</span>
                    </button>
                    <div className="page-title">
                        <h1>🎯 Context-aware Learning</h1>
                        <p>Learn Korean in real-life situations</p>
                    </div>
                </div>
                <button
                    className={`create-btn ${isCreating ? 'creating' : ''}`}
                    onClick={handleCreateNewChat}
                    disabled={isCreating}
                >
                    {isCreating ? (
                        <span className="loading-spinner">⏳</span>
                    ) : (
                        <span className="plus-icon">+</span>
                    )}
                </button>
            </header>

            {/* Main Content */}
            <main className="context-main">
                <div className="context-container">
                    {isLoading ? (
                        <div className="loading-section">
                            <div className="loading-spinner-large">🔄</div>
                            <h3>채팅방을 불러오는 중...</h3>
                            <p>잠시만 기다려주세요</p>
                        </div>
                    ) : (
                        <div className="chatroom-section">
                            <div className="section-header">
                                <h2>내 채팅방</h2>
                                <span className="chatroom-count">
                                    {chatRoomData.length}개의 채팅방
                                </span>
                            </div>

                            {chatRoomData.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">💬</div>
                                    <h3>아직 채팅방이 없습니다</h3>
                                    <p>새로운 상황을 설명하고 첫 번째 채팅방을 만들어보세요!</p>
                                    <button
                                        className="create-first-btn"
                                        onClick={handleCreateNewChat}
                                        disabled={isCreating}
                                    >
                                        첫 번째 채팅방 만들기
                                    </button>
                                </div>
                            ) : (
                                <div className="chatroom-grid">
                                    {chatRoomData.map((room, index) => (
                                        <div
                                            key={room.chat_id || index}
                                            className="chatroom-card"
                                        >
                                            <div className="card-header">
                                                <div className="room-icon">🗣️</div>
                                                <div className="room-status">활성</div>
                                                <button
                                                    className="delete-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // 카드 클릭 이벤트 방지
                                                        if (window.confirm('정말로 이 채팅방을 삭제하시겠습니까?')) {
                                                            // TODO: 삭제 API 호출
                                                            handleDeleteChatRoom(room.chat_id, index)
                                                            console.log('Delete room:', room.chat_id);
                                                        }
                                                    }}
                                                    title="채팅방 삭제"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div
                                                className="card-content"
                                                onClick={() => {
                                                    console.log(room.chat_id);
                                                    navigate(`/context/${room.chat_id}`);
                                                }}
                                            >
                                                <h3 className="room-title">{room.title}</h3>
                                                <p className="room-date">
                                                    생성일: {formatDate(room.created_at)}
                                                </p>
                                            </div>

                                            <div
                                                className="card-footer"
                                                onClick={() => {
                                                    console.log(room.chat_id);
                                                    navigate(`/context/${room.chat_id}`);
                                                }}
                                            >
                                                <span className="continue-label">대화 계속하기</span>
                                                <span className="arrow-icon">→</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}