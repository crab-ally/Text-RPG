/**
 * GAME_DATA - 게임의 모든 정적 데이터를 관리하는 전역 상수
 * 마을, 몬스터, 아이템, 스킬 등 게임 내 콘텐츠 정의
 */
const GAME_DATA = {

    // ─── 마을 정보 ───────────────────────────────────────────
    // 각 마을은 id, 이름, 권장 레벨, 티어, 해금 조건, 건물 목록, 던전 정보를 포함
    TOWNS: [
        {
            id: 'town1', name: '시작의 마을', levelRange: '1 ~ 20', tier: 1, unlockCondition: '기본 제공',
            buildings: ['jobCenter', 'shop', 'inn', 'dungeon', 'donation', 'quest', 'training', 'blacksmith', 'antique'],
            dungeon: { id: 'zone1', name: '초심자의 숲', midBoss: '슬라임 퀸', midBossLv: 12, boss: '킹 슬라임', bossLv: 20, steps: 10 }
        },
        {
            id: 'town2', name: '철광석 도시', levelRange: '20 ~ 40', tier: 2, unlockCondition: 'Zone 1 보스 처치',
            buildings: ['shop', 'inn', 'dungeon', 'donation', 'quest', 'training', 'blacksmith', 'antique'],
            dungeon: { id: 'zone2', name: '심연의 광산', midBoss: '골렘 가디언', midBossLv: 32, boss: '강철 기사', bossLv: 40, steps: 15 }
        },
        {
            id: 'town3', name: '안개 항구', levelRange: '40 ~ 60', tier: 3, unlockCondition: 'Zone 2 보스 처치',
            buildings: ['shop', 'inn', 'dungeon', 'donation', 'quest', 'training', 'blacksmith', 'antique'],
            dungeon: { id: 'zone3', name: '유령 함선', midBoss: '심해의 공포', midBossLv: 52, boss: '해골 선장', bossLv: 60, steps: 22 }
        },
        {
            id: 'town4', name: '성역 도시', levelRange: '60 ~ 80', tier: 4, unlockCondition: 'Zone 3 보스 처치',
            buildings: ['shop', 'inn', 'dungeon', 'donation', 'quest', 'training', 'blacksmith', 'antique'],
            dungeon: { id: 'zone4', name: '타락한 절벽', midBoss: '가시 지옥', midBossLv: 72, boss: '파멸의 천사', bossLv: 80, steps: 30 }
        },
        {
            id: 'town5', name: '마지막 보루', levelRange: '80 ~ 100', tier: 5, unlockCondition: 'Zone 4 보스 처치',
            buildings: ['shop', 'inn', 'dungeon', 'donation', 'quest', 'alchemy', 'training', 'blacksmith', 'antique'],
            dungeon: { id: 'zone5', name: '용의 둥지', midBoss: '에이션트 드레이크', midBossLv: 92, boss: '드래곤 로드', bossLv: 100, steps: 40 }
        },
        {
            id: 'town6', name: '공허의 심장', levelRange: '100 ~ 100', tier: 6, unlockCondition: 'Zone 5 보스 처치',
            buildings: ['shop', 'inn', 'dungeon', 'donation', 'quest', 'alchemy', 'training', 'blacksmith', 'antique'],
            dungeon: { id: 'zone6', name: '공허의 중심', midBoss: '심연의 그림자', midBossLv: 110, boss: '공허의 절대자', bossLv: 120, steps: 50 }
        }
    ],

    // ─── 등급별 색상 ─────────────────────────────────────────
    // UI에서 아이템/장비 등급을 표시할 때 사용하는 색상 코드
    GRADE_COLORS: {
        '일반': '#ffffff', '고급': '#1eff00', '레어': '#0070dd',
        '영웅': '#a335ee', '전설': '#ff8000', '신화': '#ff0000', '초월': '#00f2ff'
    },

    // ─── 몬스터 데이터 ───────────────────────────────────────
    // 존(zone)별 몬스터 목록 — hp, atk, def, xp, gold, 드롭, 회피율, 상태이상 포함
    // isMidBoss/isBoss 플래그로 보스 여부 구분
    MONSTERS: {
        zone1: [
            { name: '슬라임', hp: 110, atk: 12, def: 4, xp: 28, gold: 18, loots: ['슬라임 젤리'], eva: 3 },
            { name: '숲 거미', hp: 200, atk: 18, def: 7, xp: 48, gold: 36, loots: ['거미의 독샘'], eva: 6, statusEffects: [{ type: 'poison', chance: 0.15, duration: 3 }] },
            { name: '슬라임 퀸', hp: 600, atk: 34, def: 12, xp: 200, gold: 216, loots: ['왕관 조각'], isMidBoss: true, eva: 8 },
            { name: '킹 슬라임', hp: 1020, atk: 50, def: 22, xp: 700, gold: 660, loots: ['거대 핵'], isBoss: true, eva: 12 }
        ],
        zone2: [
            { name: '돌 괴물', hp: 600, atk: 68, def: 30, xp: 168, gold: 144, loots: ['암석 파편'], eva: 4 },
            { name: '미믹', hp: 425, atk: 94, def: 22, xp: 210, gold: 900, loots: ['미믹의 이빨'], eva: 12 },
            { name: '골렘 가디언', hp: 2100, atk: 128, def: 65, xp: 1100, gold: 1200, loots: ['강철 원석'], isMidBoss: true, eva: 10, statusEffects: [{ type: 'stun', chance: 0.15, duration: 1 }] },
            { name: '강철 기사', hp: 4100, atk: 153, def: 80, xp: 3480, gold: 4200, loots: ['빛나는 강철'], isBoss: true, eva: 12, statusEffects: [{ type: 'stun', chance: 0.1, duration: 1 }] }
        ],
        zone3: [
            { name: '원령', hp: 2040, atk: 220, def: 90, xp: 840, gold: 780, loots: ['유령의 혼'], eva: 12, statusEffects: [{ type: 'curse', chance: 0.15, duration: 3 }] },
            { name: '녹슨 검객', hp: 1360, atk: 298, def: 135, xp: 756, gold: 660, loots: ['녹슨 칼날'], eva: 10 },
            { name: '심해의 공포', hp: 7200, atk: 468, def: 212, xp: 4200, gold: 3840, loots: ['거대 촉수'], isMidBoss: true, eva: 12, statusEffects: [{ type: 'fear', chance: 0.25, duration: 3 }] },
            { name: '해골 선장', hp: 12300, atk: 460, def: 240, xp: 13800, gold: 16800, loots: ['부러진 나침반'], isBoss: true, eva: 15 }
        ],
        zone4: [
            { name: '가고일', hp: 6800, atk: 850, def: 400, xp: 3480, gold: 3000, loots: ['돌의 날개'], eva: 10 },
            { name: '타락한 사제', hp: 9350, atk: 1100, def: 585, xp: 4800, gold: 5400, loots: ['검은 성서'], eva: 12, statusEffects: [{ type: 'curse', chance: 0.25, duration: 3 }] },
            { name: '가시 지옥', hp: 23800, atk: 1445, def: 640, xp: 21000, gold: 21600, loots: ['피묻은 가시'], isMidBoss: true, eva: 15, statusEffects: [{ type: 'bleeding', chance: 0.25, duration: 3 }] },
            { name: '파멸의 천사', hp: 38200, atk: 1530, def: 680, xp: 69600, gold: 78000, loots: ['타락한 깃털'], isBoss: true, eva: 17, statusEffects: [{ type: 'weaken', chance: 0.15, duration: 3 }] }
        ],
        zone5: [
            { name: '에이션트 웜', hp: 29750, atk: 3060, def: 1800, xp: 21000, gold: 21600, loots: ['오래된 껍질'], eva: 8 },
            { name: '에이션트 드레이크', hp: 85000, atk: 5610, def: 3400, xp: 348000, gold: 180000, loots: ['마른 비늘'], isMidBoss: true, eva: 17, statusEffects: [{ type: 'burn', chance: 0.15, duration: 3 }] },
            { name: '드래곤 로드', hp: 119000, atk: 6120, def: 3825, xp: 1380000, gold: 900000, loots: ['용의 핵심'], isBoss: true, eva: 25, statusEffects: [{ type: 'burn', chance: 0.25, duration: 3 }] }
        ],
        zone6: [
            { name: '공허의 망령', hp: 212500, atk: 12750, def: 6800, xp: 600000, gold: 120000, loots: ['공허의 정수'], eva: 22, statusEffects: [{ type: 'slow', chance: 0.15, duration: 3 }] },
            { name: '심연의 그림자', hp: 680000, atk: 29750, def: 12750, xp: 3000000, gold: 600000, loots: ['심연의 조각'], isMidBoss: true, eva: 30, statusEffects: [{ type: 'sleep', chance: 0.08, duration: 1 }] },
            { name: '공허의 절대자', hp: 1700000, atk: 68000, def: 34000, xp: 12000000, gold: 2400000, loots: ['공허의 눈'], isBoss: true, eva: 42, statusEffects: [{ type: 'curse', chance: 0.3, duration: 4 }] }
        ]
    },

    // ─── 변이 몬스터 접두사 ──────────────────────────────────
    // 일반 몬스터에 무작위 적용되는 변이 — 스탯 배율 또는 추가치 부여
    MUTANTS: [
        { prefix: '강인한', hpMult: 1.3 },
        { prefix: '광폭한', atkMult: 1.3 },
        { prefix: '민첩한', evaAdd: 15 },
        { prefix: '전설의', hpMult: 1.8, atkMult: 1.8, goldMult: 3.0 }
    ],

    // ─── 아이템 데이터 ───────────────────────────────────────
    ITEMS: {
        // 무기 — 티어별 공격력 상승, 신화·초월 등급은 제작 전용 (price: 0)
        WEAPONS: [
            // 전사용 무기
            { id: 'w1', name: '낡은 롱소드', grade: '일반', tier: 1, atk: 12, price: 50, job: '전사' },
            { id: 'w2', name: '강철 도끼', grade: '고급', tier: 2, atk: 35, price: 1000, job: '전사' },
            { id: 'w3', name: '정교한 클레이모어', grade: '레어', tier: 3, atk: 90, price: 10000, job: '전사' },
            { id: 'w4', name: '기사단의 대검', grade: '영웅', tier: 4, atk: 250, price: 100000, job: '전사' },
            { id: 'w5', name: '성스러운 성검', grade: '전설', tier: 5, atk: 800, price: 1000000, job: '전사' },
            { id: 'w6', name: '혼돈의 파괴자', grade: '신화', tier: 6, atk: 2800, price: 0, job: '전사' },
            { id: 'w7', name: '공허의 종결자', grade: '초월', tier: 7, atk: 9000, price: 0, job: '전사' },
            // 마법사용 무기
            { id: 'mw1', name: '낡은 지팡이', grade: '일반', tier: 1, atk: 12, price: 50, job: '마법사' },
            { id: 'mw2', name: '수정 구슬', grade: '고급', tier: 2, atk: 35, price: 1000, job: '마법사' },
            { id: 'mw3', name: '현자의 마법서', grade: '레어', tier: 3, atk: 90, price: 10000, job: '마법사' },
            { id: 'mw4', name: '대마법사의 지팡이', grade: '영웅', tier: 4, atk: 250, price: 100000, job: '마법사' },
            { id: 'mw5', name: '성스러운 마법봉', grade: '전설', tier: 5, atk: 800, price: 1000000, job: '마법사' },
            { id: 'mw6', name: '심연의 눈', grade: '신화', tier: 6, atk: 2800, price: 0, job: '마법사' },
            { id: 'mw7', name: '공허의 창조자', grade: '초월', tier: 7, atk: 9000, price: 0, job: '마법사' }
        ],
        // 방어구 — 티어별 방어력 상승
        ARMORS: [
            { id: 'a1', name: '낡은 천옷', grade: '일반', tier: 1, def: 8, price: 50 },
            { id: 'a2', name: '가죽 갑옷', grade: '고급', tier: 2, def: 24, price: 1000 },
            { id: 'a3', name: '사슬 갑옷', grade: '레어', tier: 3, def: 65, price: 10000 },
            { id: 'a4', name: '판금 갑옷', grade: '영웅', tier: 4, def: 180, price: 100000 },
            { id: 'a5', name: '성스러운 성갑', grade: '전설', tier: 5, def: 580, price: 1000000 },
            { id: 'a6', name: '심연의 갑주', grade: '신화', tier: 6, def: 2000, price: 0 },
            { id: 'a7', name: '공허의 장막', grade: '초월', tier: 7, def: 6500, price: 0 }
        ],
        // 소모품 — HP/MP 포션 (티어별 회복량 증가)
        CONSUMABLES: [
            { id: 'p1', name: '희석된 HP 포션', grade: '희석', tier: 1, hp: 80, price: 15 },
            { id: 'p2', name: '약한 HP포션', grade: '약함', tier: 2, hp: 250, price: 60 },
            { id: 'p3', name: '농축된 HP 포션', grade: '농축', tier: 3, hp: 850, price: 250 },
            { id: 'p4', name: '고농축 HP 포션', grade: '고농축', tier: 4, hp: 3000, price: 1000 },
            { id: 'p5', name: '극농축 HP 포션', grade: '극농축', tier: 5, hp: 9500, price: 6000 },
            { id: 'p6', name: '순수한 생명수', grade: '순수', tier: 6, hp: 35000, price: 0 },
            { id: 'mp1', name: '희석된 MP 포션', grade: '희석', tier: 1, mp: 60, price: 30 },
            { id: 'mp2', name: '약한 MP 포션', grade: '약함', tier: 2, mp: 170, price: 90 },
            { id: 'mp3', name: '농축된 MP 포션', grade: '농축', tier: 3, mp: 420, price: 300 },
            { id: 'mp4', name: '고농축 MP 포션', grade: '고농축', tier: 4, mp: 1080, price: 1200 },
            { id: 'mp5', name: '극농축 MP 포션', grade: '극농축', tier: 5, mp: 3000, price: 7000 },
            { id: 'mp6', name: '순수한 마나수', grade: '순수', tier: 6, mp: 12000, price: 0 }
        ],
        // 장신구 — 특수 옵션 제공 (장신구당 한 가지 효과만 보유)
        ACCESSORIES: [
            // 일반 등급 (Town 2 판매) - Tier 2
            { id: 'acc_cri_n', name: '치명타의 반지', grade: '일반', tier: 2, price: 3000, cri: 4 },
            { id: 'acc_eva_n', name: '회피의 목걸이', grade: '일반', tier: 2, price: 3000, eva: 4 },
            { id: 'acc_ls_n', name: '흡혈의 귀걸이', grade: '일반', tier: 2, price: 5000, lifeSteal: 2 },
            { id: 'acc_hp_n', name: '재생의 휘장', grade: '일반', tier: 2, price: 4000, hpRegen: 1 },
            { id: 'acc_mp_n', name: '마력의 수정', grade: '일반', tier: 2, price: 4000, mpRegen: 1 },
            { id: 'acc_pen_n', name: '관통의 팔찌', grade: '일반', tier: 2, price: 3500, pen: 8 },

            // 레어 등급 (Town 4 판매) - Tier 4
            { id: 'acc_cri_r', name: '숙련자의 반지', grade: '레어', tier: 4, price: 35000, cri: 9 },
            { id: 'acc_eva_r', name: '민첩의 목걸이', grade: '레어', tier: 4, price: 35000, eva: 9 },
            { id: 'acc_ls_r', name: '갈증의 귀걸이', grade: '레어', tier: 4, price: 55000, lifeSteal: 5 },
            { id: 'acc_hp_r', name: '치유의 휘장', grade: '레어', tier: 4, price: 45000, hpRegen: 2 },
            { id: 'acc_mp_r', name: '명상의 수정', grade: '레어', tier: 4, price: 45000, mpRegen: 2 },
            { id: 'acc_pen_r', name: '파괴의 팔찌', grade: '레어', tier: 4, price: 40000, pen: 18 },

            // 영웅 등급 (Town 6 판매) - Tier 6
            { id: 'acc_cri_h', name: '용사의 반지', grade: '영웅', tier: 6, price: 200000, cri: 15 },
            { id: 'acc_eva_h', name: '바람의 목걸이', grade: '영웅', tier: 6, price: 200000, eva: 15 },
            { id: 'acc_ls_h', name: '선혈의 귀걸이', grade: '영웅', tier: 6, price: 300000, lifeSteal: 9 },
            { id: 'acc_hp_h', name: '생명의 휘장', grade: '영웅', tier: 6, price: 250000, hpRegen: 3 },
            { id: 'acc_mp_h', name: '영혼의 수정', grade: '영웅', tier: 6, price: 250000, mpRegen: 3 },
            { id: 'acc_pen_h', name: '심판의 팔찌', grade: '영웅', tier: 6, price: 220000, pen: 32 },

            // 전설 등급 (대장간 제작) - Tier 7
            { id: 'acc_cri_l', name: '고대 제왕의 반지', grade: '신화', tier: 7, price: 1500000, cri: 25 },
            { id: 'acc_eva_l', name: '고대 환영의 목걸이', grade: '신화', tier: 7, price: 1500000, eva: 25 },
            { id: 'acc_ls_l', name: '고대 악마의 귀걸이', grade: '신화', tier: 7, price: 2200000, lifeSteal: 15 },
            { id: 'acc_hp_l', name: '고대 성자의 휘장', grade: '신화', tier: 7, price: 1800000, hpRegen: 6 },
            { id: 'acc_mp_l', name: '고대 현자의 수정', grade: '신화', tier: 7, price: 1800000, mpRegen: 6 },
            { id: 'acc_pen_l', name: '고대 거인의 팔찌', grade: '신화', tier: 7, price: 1600000, pen: 55 },

            // 초월 등급 (초월 몬스터 드랍) - Tier 7
            { id: 'acc_t_dmg', name: '공허의 심장', grade: '초월', tier: 7, price: 0, extraDmg: 30 },
            { id: 'acc_t_exec', name: '처형자의 인장', grade: '초월', tier: 7, price: 0, execution: 20 },
            { id: 'acc_t_null', name: '아이기스의 펜던트', grade: '초월', tier: 7, price: 0, nullify: 18 },
            { id: 'acc_t_turn', name: '가속의 고리', grade: '초월', tier: 7, price: 0, extraTurn: 25 }
        ]
    },

    // ─── 제작 레시피 ─────────────────────────────────────────
    // 연금술 NPC에서 사용하는 레시피 — targetId로 제작 대상 아이템 참조
    RECIPES: {
        'r_w6': { id: 'r_w6', name: '혼돈의 파괴자 레시피', targetId: 'w6', category: 'WEAPONS' },
        'r_mw6': { id: 'r_mw6', name: '심연의 눈 레시피', targetId: 'mw6', category: 'WEAPONS' },
        'r_a6': { id: 'r_a6', name: '심연의 갑주 레시피', targetId: 'a6', category: 'ARMORS' },
        'r_p6': { id: 'r_p6', name: '순수한 생명수 레시피', targetId: 'p6', category: 'CONSUMABLES' },
        'r_mp6': { id: 'r_mp6', name: '순수한 마나수 레시피', targetId: 'mp6', category: 'CONSUMABLES' },
        'r_acc_cri_l': { id: 'r_acc_cri_l', name: '고대 제왕의 반지 레시피', targetId: 'acc_cri_l', category: 'ACCESSORIES' },
        'r_acc_eva_l': { id: 'r_acc_eva_l', name: '고대 환영의 목걸이 레시피', targetId: 'acc_eva_l', category: 'ACCESSORIES' },
        'r_acc_ls_l': { id: 'r_acc_ls_l', name: '고대 악마의 귀걸이 레시피', targetId: 'acc_ls_l', category: 'ACCESSORIES' },
        'r_acc_hp_l': { id: 'r_acc_hp_l', name: '고대 성자의 휘장 레시피', targetId: 'acc_hp_l', category: 'ACCESSORIES' },
        'r_acc_mp_l': { id: 'r_acc_mp_l', name: '고대 현자의 수정 레시피', targetId: 'acc_mp_l', category: 'ACCESSORIES' },
        'r_acc_pen_l': { id: 'r_acc_pen_l', name: '고대 거인의 팔찌 레시피', targetId: 'acc_pen_l', category: 'ACCESSORIES' }
    },

    // ─── 제작 재료 및 비용 ───────────────────────────────────
    // 아이템 ID를 키로, 필요 재료(드롭 아이템 이름: 수량)와 골드 비용 정의
    CRAFTING: {
        'w6': { materials: { '용의 핵심': 10, '타락한 깃털': 50 }, gold: 500000 },
        'mw6': { materials: { '용의 핵심': 10, '타락한 깃털': 50 }, gold: 500000 },
        'a6': { materials: { '용의 핵심': 8, '검은 성서': 60 }, gold: 500000 },
        'p6': { materials: { '공허의 정수': 5 }, gold: 100000 },
        'mp6': { materials: { '공허의 정수': 5 }, gold: 100000 },
        'acc_cri_l': { materials: { '용의 핵심': 10, '타락한 깃털': 20 }, gold: 1200000 },
        'acc_eva_l': { materials: { '용의 핵심': 10, '검은 성서': 20 }, gold: 1200000 },
        'acc_ls_l': { materials: { '용의 핵심': 15, '공허의 정수': 10 }, gold: 1500000 },
        'acc_hp_l': { materials: { '공허의 정수': 15, '검은 성서': 30 }, gold: 1000000 },
        'acc_mp_l': { materials: { '공허의 정수': 15, '타락한 깃털': 30 }, gold: 1000000 },
        'acc_pen_l': { materials: { '용의 핵심': 15, '검은 성서': 15 }, gold: 1300000 }
    },

    // ─── 전사 스킬 ───────────────────────────────────────────
    // type: 'active' = 전투 중 사용, 'passive' = 상시 효과
    // costType: 스킬 사용 시 소모 자원 (hp/mp/none), mult: 데미지 배율
    WARRIOR_SKILLS: [
        { id: 'ws1', name: '강타', type: 'active', reqLv: 10, costType: 'hp', costVal: 10, desc: '강한 물리 피해를 입힙니다.', mult: 1.4, cooldown: 0 },
        { id: 'ws2', name: '강인한 신체', type: 'passive', reqLv: 20, costType: 'none', costVal: 0, desc: '최대 HP가 20% 증가합니다.', cooldown: 0 },
        { id: 'ws3', name: '돌진 기동', type: 'active', reqLv: 30, costType: 'hp', costVal: 25, desc: '적에게 빠르게 접근 후 공격하며 20%의 확률로 기절시킵니다.', mult: 1.7, cooldown: 2 },
        { id: 'ws4', name: '철벽 자세', type: 'active', reqLv: 40, costType: 'hp', costVal: 40, desc: '3턴 동안 받는 피해가 50% 감소하고 반격 확률이 30% 증가합니다.', cooldown: 5 },
        { id: 'ws5', name: '심판의 반격', type: 'active', reqLv: 50, costType: 'hp', costVal: 50, desc: '3턴 동안 피격 시 무조건 반격합니다. (반격 시 가한 피해의 30% 흡수)', cooldown: 6 },
        { id: 'ws6', name: '투쟁심', type: 'passive', reqLv: 60, costType: 'none', costVal: 0, desc: 'HP가 50% 이하일 때 공격력이 20% 증가, 치명타 확률이 15% 증가합니다.', cooldown: 0 },
        { id: 'ws7', name: '분쇄격', type: 'active', reqLv: 70, costType: 'hp', costVal: 80, desc: '적의 방어력을 50% 무시하는 강력한 공격을 가합니다.', mult: 2.0, cooldown: 4 },
        { id: 'ws8', name: '광전사의 혼', type: 'active', reqLv: 80, costType: 'hp', costVal: 150, desc: '3턴 동안 공격력이 50% 증가하지만 회피율이 0이 되고 받는 피해가 1.5배 증가합니다.', cooldown: 8 },
        { id: 'ws9', name: '강철 심장', type: 'passive', reqLv: 90, costType: 'none', costVal: 0, desc: 'HP가 30% 이하일 때 턴 종료 시 최대 HP의 10%를 회복합니다.', cooldown: 0 },
        { id: 'ws10', name: '군주 강림', type: 'active', reqLv: 100, costType: 'hp', costVal: 300, desc: '적에게 초강력 일격을 가합니다. 사용 후 2턴 간 스킬을 사용할 수 없습니다.', mult: 3.5, cooldown: 10 }
    ],

    // ─── 마법사 스킬 ─────────────────────────────────────────
    MAGE_SKILLS: [
        { id: 'ms1', name: '화염구', type: 'active', reqLv: 10, costType: 'mp', costVal: 15, desc: '기본적인 마법 화염 피해를 입힙니다.', mult: 1.5, cooldown: 0 },
        { id: 'ms2', name: '마력 친화', type: 'passive', reqLv: 20, costType: 'none', costVal: 0, desc: '최대 MP가 20% 증가하며, 매 턴 최대 MP의 5%를 자연 회복합니다.', cooldown: 0 },
        { id: 'ms3', name: '빙결의 창', type: 'active', reqLv: 30, costType: 'mp', costVal: 35, desc: '얼음 창을 날려 피해를 주고, 2턴 동안 적의 회피율 10%를 감소시킵니다.', mult: 1.7, cooldown: 3 },
        { id: 'ms4', name: '마나실드', type: 'passive', reqLv: 40, costType: 'none', costVal: 0, desc: '피해를 HP 대신 MP로 150% 효율로 흡수합니다. 턴당 MP 15 유지 비용.', cooldown: 0 },
        { id: 'ms5', name: '시간 파열', type: 'active', reqLv: 50, costType: 'mp', costVal: 60, desc: '시간 균열을 일으켜 다음 턴 플레이어의 공격력을 2배로 만듭니다.', mult: 1.1, cooldown: 6 },
        { id: 'ms6', name: '집중', type: 'passive', reqLv: 60, costType: 'none', costVal: 0, desc: '현재 MP가 70% 이상일 때 마력과 치명타 확률이 15% 증가합니다.', cooldown: 0 },
        { id: 'ms7', name: '폭렬 마법', type: 'active', reqLv: 70, costType: 'mp', costVal: 100, desc: '강력한 폭발을 일으키며, 적에게 3턴간 화상을 입힙니다.', mult: 2.2, cooldown: 5 },
        { id: 'ms8', name: '위상 변환', type: 'active', reqLv: 80, costType: 'mp', costVal: 120, desc: '다음 1턴 간 적의 모든 공격을 회피하고 다음 공격의 치명타 확률이 50% 증가합니다.', cooldown: 7 },
        { id: 'ms9', name: '현자의 지혜', type: 'passive', reqLv: 90, costType: 'none', costVal: 0, desc: '스킬 사용 시 20% 확률로 MP를 소모하지 않습니다.', cooldown: 0 },
        { id: 'ms10', name: '메테오', type: 'active', reqLv: 100, costType: 'mp', costVal: 300, desc: '현재 MP에 비례한 괴멸적 피해를 입히지만 2턴간 MP 회복이 차단됩니다.', mult: 3.0, cooldown: 12 }
    ]
};
