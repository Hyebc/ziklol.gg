import React, { useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Search from './pages/Search';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';

function App() {
  // 토너먼트 코드 생성기 상태
  const [tournamentCode, setTournamentCode] = useState('');
  const [createError, setCreateError] = useState('');

  const createCode = async () => {
    setCreateError('');
    try {
      const res = await axios.post('/api/riot/create-tournament-code', { teamSize: 5 });
      setTournamentCode(res.data.tournamentCode);
    } catch (e) {
      setCreateError('토너먼트 코드 생성 실패');
      setTournamentCode('');
    }
  };

  return (
    <Router>
      <div style={{ padding: 20 }}>
        <h2>ziklol.gg</h2>

        {/* 내비게이션 */}
        <nav style={{ marginBottom: 20 }}>
          <Link to="/" style={{ marginRight: 20 }}> 🏆토너먼트 코드 생성기</Link>
          <Link to="/search" style={{ marginRight: 20 }}>🔍 내전 전적 검색</Link>
          <Link to="/admin/login" style={{ marginRight: 20 }}>🧑‍💻 관리자</Link>
        </nav>

        <Routes>
          {/* 홈 화면 - 토너먼트 코드 생성기 */}
          <Route path="/" element={
            <>
              <h3>토너먼트 코드 생성기</h3>
              <button onClick={createCode}>토너먼트 코드 생성</button>
              {tournamentCode && (
                <p>생성된 코드: <strong>{tournamentCode}</strong></p>
              )}
              {createError && (
                <p style={{ color: 'red' }}>{createError}</p>
              )}
            </>
          }/>

          {/* 전적 검색 페이지 */}
          <Route path="/search" element={<Search />} />

          {/* 관리자 페이지 */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
        
        </Routes>
      </div>
    </Router>
  );
}

export default App;
