// React 기본 import
import React from 'react';

// 토스트 알림 라이브러리
import { Toaster } from 'react-hot-toast';

// Context Provider
import { AppProvider } from './context/AppContext';

// 메인 애플리케이션 컴포넌트
import TravelVoteApp from './components/TravelVoteApp';

// 스타일 import
import './App.css';

function App() {
  return (
      <div className="App">
        {/* 전역 상태 관리 Provider로 전체 앱을 감싸기 */}
        <AppProvider>
          {/* 메인 애플리케이션 컴포넌트 */}
          <TravelVoteApp />

          {/* 토스트 알림 컴포넌트 (전역적으로 사용) */}
          <Toaster
              position="top-right"
              reverseOrder={false}
              gutter={8}
              containerClassName=""
              containerStyle={{}}
              toastOptions={{
                // 기본 옵션
                className: '',
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                // 성공 메시지 스타일
                success: {
                  duration: 3000,
                  style: {
                    background: '#10b981',
                    color: '#fff',
                  },
                },
                // 에러 메시지 스타일
                error: {
                  duration: 4000,
                  style: {
                    background: '#ef4444',
                    color: '#fff',
                  },
                },
              }}
          />
        </AppProvider>
      </div>
  );
}

export default App;