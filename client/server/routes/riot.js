const express = require('express');
const router = express.Router();
const axios = require('axios');

const RIOT_API_KEY = process.env.RIOT_API_KEY;

// Riot API 기본 URL (region별로 다름)
const SUMMONER_BASE_URL = 'https://kr.api.riotgames.com/lol/summoner/v4';
const MATCH_BASE_URL = 'https://asia.api.riotgames.com/lol/match/v5';

// Tournament Stub API URL (americas region 고정)
const TOURNAMENT_BASE_URL = 'https://americas.api.riotgames.com/lol/tournament-stub/v4';

let providerId = null;
let tournamentId = null;

// 1) Provider 등록 (한 번만 호출)
async function registerProvider() {
  if (providerId) return providerId;
  const res = await axios.post(
    `${TOURNAMENT_BASE_URL}/providers`,
    {
      region: 'KR',
      url: 'https://your-callback-url.com',  // 실제 콜백 URL, 없으면 임의 URL도 가능
    },
    { headers: { 'X-Riot-Token': RIOT_API_KEY } }
  );
  providerId = res.data;
  return providerId;
}

// 2) Tournament 생성 (한 번만 호출)
async function createTournament() {
  if (tournamentId) return tournamentId;
  const pid = await registerProvider();
  const res = await axios.post(
    `${TOURNAMENT_BASE_URL}/tournaments`,
    {
      name: 'ziklol.gg 토너먼트',
      providerId: pid,
    },
    { headers: { 'X-Riot-Token': RIOT_API_KEY } }
  );
  tournamentId = res.data;
  return tournamentId;
}

// 3) 토너먼트 코드 생성 (요청마다 가능)
router.post('/create-tournament-code', async (req, res) => {
  try {
    const {
      teamSize = 5,
      mapType = 'SUMMONERS_RIFT',
      pickType = 'TOURNAMENT_DRAFT',
      spectatorType = 'ALL',
      metadata = 'ziklol.gg 내전',
    } = req.body;

    const tid = await createTournament();

    const response = await axios.post(
      `${TOURNAMENT_BASE_URL}/codes?count=1&tournamentId=${tid}`,
      {
        mapType,
        pickType,
        spectatorType,
        teamSize,
        metadata,
      },
      { headers: { 'X-Riot-Token': RIOT_API_KEY } }
    );

    res.json({ tournamentCode: response.data[0] });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: '토너먼트 코드 생성 실패' });
  }
});

// 소환사 정보 조회 API (puuid 포함)
router.get('/summoner/:name', async (req, res) => {
  try {
    const { name } = req.params;

    const response = await axios.get(
      `${SUMMONER_BASE_URL}/summoners/by-name/${encodeURIComponent(name)}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: '소환사 정보를 가져오는 데 실패했습니다.' });
  }
});

// puuid로 Match ID 리스트 조회 (최대 count 개수)
router.get('/matches/by-puuid/:puuid', async (req, res) => {
  try {
    const { puuid } = req.params;
    const count = req.query.count || 10; // 기본 10개

    const response = await axios.get(
      `${MATCH_BASE_URL}/matches/by-puuid/${puuid}/ids?start=0&count=${count}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Match ID 리스트를 가져오는 데 실패했습니다.' });
  }
});

module.exports = router;
