import React, { useState, useEffect } from 'react';
import {useNavigate} from "react-router-dom";

import '../../Style/ChatRoomList.scss'

export default function MainChatRoomLayout() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [chatRoomData, setChatRoomData] = useState([])
    const [error, setError] = useState(null)

    useEffect(() => {
        // IIFE(즉시실행함수) 또는 별도 async 함수로 감싸서 async/await 사용 가능
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/api/v1/chat/rooms', {
                    headers: {
                        'Authorization': 'Bearer ZATae5h-sckvlY06-aks7r-Kn2uMq'
                    }
                }); // 호출할 API 경로
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const json = await res.json();
                setChatRoomData(json);
                console.log(json)
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
        const year = date.getFullYear() % 100;            // 2025 → 25
        const month = date.getMonth() + 1;                // 0-based → 1~12
        const day = date.getDate();
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        const ss = String(date.getSeconds()).padStart(2, '0');

        return `${year}년 ${month}월 ${day}일 ${hh}:${mm}:${ss}`;
    }


    if (error)   return <p>Error: {error.message}</p>;

    return <div className="daily-learning">
        <header className="dl-header">
            <button className="back-button" onClick={() => navigate(-1)}>←</button>
            <h2>Context-aware learning</h2>
            <button className="back-button" onClick={() => {
                const input = window.prompt('Please describe the situation you are going to talk to.');
                if (input === null || input === undefined || input === '') {
                    return;
                }
                console.log(input)

                const fetchData = async () => {
                    setIsLoading(true);
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
                        // setChatRoomData(json);
                        console.log(json)
                        navigate(`/context/${json.chat_id}`)
                    } catch (err) {
                        window.alert(`채팅방 생성 오류 ${err}`)
                    } finally {
                        setIsLoading(false);
                    }
                };

                fetchData();
            }}>+</button>
        </header>
        {isLoading ? 'Loading...' : (
            <div className='chatroom-root'>
                {chatRoomData.map((value) => (
                    <div
                        className='chatroom-list-root'
                        onClick={() => {
                            console.log(value.chat_id)
                            navigate(`/context/${value.chat_id}`)
                        }}
                    >
                        <div className='chatroom-title'>{value.title}</div>
                        <div>{formatDate(value.created_at)}</div>
                    </div>
                ))}
            </div>
        )}
    </div>
}