import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Search() {
  const [summoner, setSummoner] = useState('');
  const [result, setResult] = useState([]);
  const [filteredResult, setFilteredResult] = useState([]);

  // 필터 상태
  const [championFilter, setChampionFilter] = useState('');
  const [winFilter, setWinFilter] = useState('all'); // all, win, lose
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 소환사 전적 가져오기
  const handleSearch = async () => {
    if (!summoner) return;
    try {
      const res = await axios.get(`/api/matches/history/${summoner}`);
      setResult(res.data.history);
      setFilteredResult(res.data.history);
      // 초기 필터 리셋
      setChampionFilter('');
      setWinFilter('all');
      setStartDate('');
      setEndDate('');
    } catch (err) {
      console.error(err);
      setResult([]);
      setFilteredResult([]);
    }
  };

  // 필터 적용
  useEffect(() => {
    let filtered = [...result];

    if (championFilter) {
      filtered = filtered.filter(match => match.championName === championFilter);
    }

    if (winFilter !== 'all') {
      const isWin = winFilter === 'win';
      filtered = filtered.filter(match => match.win === isWin);
    }

    if (startDate) {
      const startTimestamp = new Date(startDate).getTime();
      filtered = filtered.filter(match => match.gameCreation >= startTimestamp);
    }

    if (endDate) {
      const endTimestamp = new Date(endDate).getTime() + 86400000; // 하루 더하기 (포함)
      filtered = filtered.filter(match => match.gameCreation <= endTimestamp);
    }

    setFilteredResult(filtered);
  }, [championFilter, winFilter, startDate, endDate, result]);

  // 챔피언 목록 추출 (중복 제거)
  const championList = [...new Set(result.map(m => m.championName))].sort();

  return (
    <div>
      <h3>🔍 내전 전적 검색</h3>
      <input
        value={summoner}
        onChange={e => setSummoner(e.target.value)}
        placeholder="소환사명을 입력하세요"
        style={{ marginRight: 8 }}
      />
      <button onClick={handleSearch}>검색</button>

      {result.length > 0 && (
        <>
          {/* 필터 UI */}
          <div style={{ marginTop: 20, marginBottom: 10 }}>
            <label>
              챔피언:
              <select value={championFilter} onChange={e => setChampionFilter(e.target.value)} style={{ marginLeft: 5, marginRight: 20 }}>
                <option value="">전체</option>
                {championList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>

            <label>
              승패:
              <select value={winFilter} onChange={e => setWinFilter(e.target.value)} style={{ marginLeft: 5, marginRight: 20 }}>
                <option value="all">전체</option>
                <option value="win">승리</option>
                <option value="lose">패배</option>
              </select>
            </label>

            <label>
              시작일:
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ marginLeft: 5, marginRight: 20 }} />
            </label>

            <label>
              종료일:
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ marginLeft: 5 }} />
            </label>
          </div>

          {/* 전적 리스트 */}
          <div>
            <h4>총 {filteredResult.length}경기 검색됨</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {filteredResult.map((match, idx) => (
                <li
                  key={idx}
                  style={{
                    marginBottom: 12,
                    color: match.win ? '#1E90FF' : '#FF4500', // 승: 파랑, 패: 빨강
                    border: `1px solid ${match.win ? '#1E90FF' : '#FF4500'}`,
                    borderRadius: 6,
                    padding: 10,
                    backgroundColor: match.win ? '#E6F0FF' : '#FFE6E1',
                  }}
                >
                  <strong>{match.championName}</strong> / {match.kills}/{match.deaths}/{match.assists} (KDA: {match.kda})<br />
                  결과: {match.win ? '승리' : '패배'}<br />
                  포지션: {match.lane} / 역할: {match.role}<br />
                  날짜: {new Date(match.gameCreation).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default Search;
