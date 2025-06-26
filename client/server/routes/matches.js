const express = require('express');
const router = express.Router();
const axios = require('axios');
const Match = require('../models/Match');

const RIOT_API_KEY = process.env.RIOT_API_KEY;

router.post('/save', async (req, res) => {
  try {
    const { matchId } = req.body;

    // 이미 저장된 match인지 확인
    const exists = await Match.findOne({ matchId });
    if (exists) {
      return res.status(400).json({ message: '이미 저장된 Match ID입니다.' });
    }

    // Riot API에서 match 정보 가져오기
    const response = await axios.get(
      `https://asia.api.riotgames.com/lol/match/v5/matches/${matchId}`,
      {
        headers: { 'X-Riot-Token': RIOT_API_KEY }
      }
    );

    const data = response.data;
    const participants = data.info.participants.map(p => ({
      summonerName: p.summonerName,
      puuid: p.puuid,
      championName: p.championName,
      kills: p.kills,
      deaths: p.deaths,
      assists: p.assists,
      win: p.win,
      teamId: p.teamId,
      role: p.role,
      lane: p.lane,
      kda: p.deaths === 0 ? (p.kills + p.assists) : ((p.kills + p.assists) / p.deaths)
    }));

    const match = new Match({
      matchId,
      gameCreation: data.info.gameCreation,
      participants
    });

    await match.save();
    res.status(200).json({ message: '전적 저장 완료', match });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: '전적 저장 실패' });
  }
});
router.get('/history/:summonerName', async (req, res) => {
  try {
    const { summonerName } = req.params;

    // Match에서 해당 소환사가 참가한 경기만 필터
    const matches = await Match.find({
      'participants.summonerName': summonerName
    }).sort({ gameCreation: -1 });

    // 해당 유저 기준으로 필터링된 participant 정보 추출
    const history = matches.map(match => {
      const participant = match.participants.find(p => p.summonerName === summonerName);
      return {
        matchId: match.matchId,
        gameCreation: match.gameCreation,
        championName: participant?.championName,
        kills: participant?.kills,
        deaths: participant?.deaths,
        assists: participant?.assists,
        kda: participant?.kda?.toFixed(2),
        win: participant?.win,
        lane: participant?.lane,
        role: participant?.role
      };
    });

    res.status(200).json({ summonerName, history });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: '전적 조회 실패' });
  }
  });
  // 수동으로 소환사 전적 저장
router.post('/manual', async (req, res) => {
  try {
    const {
      summonerName,
      championName,
      kills,
      deaths,
      assists,
      win,
      lane,
      role,
      gameCreation // 선택 입력. 없으면 현재 시간 사용
    } = req.body;

    const participant = {
      summonerName,
      puuid: 'manual', // 수동 입력임을 명시
      championName,
      kills,
      deaths,
      assists,
      win,
      teamId: 100,
      role,
      lane,
      kda: deaths === 0 ? kills + assists : ((kills + assists) / deaths),
    };

    const match = new Match({
      matchId: `manual_${Date.now()}`,
      gameCreation: gameCreation || Date.now(),
      participants: [participant],
    });

    await match.save();
    res.status(200).json({ message: '수동 전적 저장 완료', match });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: '수동 전적 저장 실패' });
  }
});

module.exports = router;
