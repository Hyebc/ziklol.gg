// client/src/pages/AdminLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    // 간단한 하드코딩 로그인 (실제 서비스에선 서버 검증 필요)
    if (id === 'admin' && pw === 'zigops') {
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin');
    } else {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

   const sharedInputStyle = {
    width: '85%',                  // ✅ 로그인 박스 기준 85% 너비
    padding: '0.75em',
    fontSize: '1em',
    marginTop: '0.25em',
    boxSizing: 'border-box',
    border: '1px solid #ccc',
    borderRadius: '4px',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto'            // ✅ 중앙 정렬
  };

  const buttonStyle = {
    ...sharedInputStyle,
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '1em'
  };

  return (
    <div
      style={{
        width: '90%',
        maxWidth: '400px',
        margin: '10vh auto',
        padding: '2em',
        border: '1px solid #ccc',
        borderRadius: '0.5em',
        boxSizing: 'border-box',
        fontFamily: 'sans-serif',
        background: '#f9f9f9'
      }}
    >
      <h2 style={{ marginBottom: '1.5em', textAlign: 'center' }}>관리자 로그인</h2>

      <div style={{ marginBottom: '1.2em' }}>
        <label style={{ display: 'block', marginLeft: '7.5%' }}>아이디</label>
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          style={sharedInputStyle}
        />
      </div>

      <div style={{ marginBottom: '1.2em' }}>
        <label style={{ display: 'block', marginLeft: '7.5%' }}>비밀번호</label>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          style={sharedInputStyle}
        />
      </div>

      {error && (
        <p style={{ color: 'red', textAlign: 'center', marginBottom: '1em' }}>{error}</p>
      )}

      <button onClick={handleLogin} style={buttonStyle}>
        로그인
      </button>
    </div>
  );
}


export default AdminLogin;
