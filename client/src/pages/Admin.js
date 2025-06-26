// client/src/pages/Admin.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Admin() {
  const navigate = useNavigate();
  const [matchIdInput, setMatchIdInput] = useState('');
  const [matchSaveMsg, setMatchSaveMsg] = useState('');

  const [summonerName, setSummonerName] = useState('');
  const [puuid, setPuuid] = useState('');
  const [matchIds, setMatchIds] = useState([]);
  const [puuidError, setPuuidError] = useState('');

  const [manual, setManual] = useState({
    summonerName: '',
    championName: '',
    kills: '',
    deaths: '',
    assists: '',
    win: true,
    lane: '',
    role: '',
  });
  const [manualMsg, setManualMsg] = useState('');

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin !== 'true') navigate('/admin/login');
  }, [navigate]);

  const handleMatchSave = async () => {
    if (!matchIdInput) return;
    try {
      const res = await axios.post('/api/matches/save', { matchId: matchIdInput });
      setMatchSaveMsg(`✅ 저장 완료: ${res.data.match.matchId}`);
    } catch (err) {
      setMatchSaveMsg(`❌ 오류: ${err.response?.data?.message || '저장 실패'}`);
    }
  };

  const handlePuuidLookup = async () => {
    try {
      const res = await axios.get(`https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`, {
        headers: { 'X-Riot-Token': process.env.REACT_APP_RIOT_API_KEY }
      });
      setPuuid(res.data.puuid);
      setPuuidError('');
    } catch (err) {
      setPuuid('');
      setPuuidError('❌ puuid 조회 실패');
    }
  };

  const handleMatchIdLookup = async () => {
    if (!puuid) return;
    try {
      const res = await axios.get(`https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=5`, {
        headers: { 'X-Riot-Token': process.env.REACT_APP_RIOT_API_KEY }
      });
      setMatchIds(res.data);
    } catch (err) {
      setMatchIds([]);
    }
  };

  const handleManualChange = (e) => {
    const { name, value, type, checked } = e.target;
    setManual(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleManualSubmit = async () => {
    try {
      await axios.post('/api/matches/manual', manual);
      setManualMsg('✅ 수동 저장 완료');
      setManual({
        summonerName: '', championName: '', kills: '', deaths: '', assists: '',
        win: true, lane: '', role: ''
      });
    } catch (err) {
      setManualMsg('❌ 저장 실패');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🛠 관리자 도구</h2>

      {/* 1. puuid 조회 & match ID 조회 */}
      <section style={{ marginBottom: 30 }}>
        <h4>🔍 puuid / match ID 조회</h4>
        <input
          placeholder="소환사명 입력"
          value={summonerName}
          onChange={e => setSummonerName(e.target.value)}
          style={{ width: 300, marginRight: 10 }}
        />
        <button onClick={handlePuuidLookup}>puuid 조회</button>
        <button onClick={handleMatchIdLookup} style={{ marginLeft: 5 }}>match ID 조회</button>
        {puuid && <p><strong>puuid:</strong> {puuid}</p>}
        {puuidError && <p style={{ color: 'red' }}>{puuidError}</p>}
        {matchIds.length > 0 && (
          <ul>
            {matchIds.map((id, idx) => <li key={idx}>{id}</li>)}
          </ul>
        )}
      </section>

      {/* 2. Match ID 수동 저장 */}
      <section style={{ marginBottom: 30 }}>
        <h4>📌 Match ID로 전적 저장</h4>
        <input
          placeholder="예: KR_1234567890"
          value={matchIdInput}
          onChange={e => setMatchIdInput(e.target.value)}
          style={{ width: 300, marginRight: 10 }}
        />
        <button onClick={handleMatchSave}>저장</button>
        {matchSaveMsg && <p>{matchSaveMsg}</p>}
      </section>


      {/* 3. 수동 전적 입력 */}
      <section>
        <h4>✍️ 수동 전적 입력</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 400 }}>
          <input name="summonerName" placeholder="소환사명" value={manual.summonerName} onChange={handleManualChange} />
          <input name="championName" placeholder="챔피언명" value={manual.championName} onChange={handleManualChange} />
          <input name="kills" placeholder="킬 수" value={manual.kills} onChange={handleManualChange} />
          <input name="deaths" placeholder="데스 수" value={manual.deaths} onChange={handleManualChange} />
          <input name="assists" placeholder="어시 수" value={manual.assists} onChange={handleManualChange} />
          <label>
            승리 여부: <input type="checkbox" name="win" checked={manual.win} onChange={handleManualChange} />
          </label>
          <input name="lane" placeholder="라인 (예: MID)" value={manual.lane} onChange={handleManualChange} />
          <input name="role" placeholder="역할 (예: SOLO, DUO_SUPPORT)" value={manual.role} onChange={handleManualChange} />
          <button onClick={handleManualSubmit}>수동 저장</button>
          {manualMsg && <p>{manualMsg}</p>}
        </div>
      </section>
    </div>
  );
}

export default Admin;
