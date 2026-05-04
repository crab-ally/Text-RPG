const GAME_DATA = {
    TOWNS: [
        {
            id: 'town1',
            name: '시작의 마을',
            levelRange: '1 ~ 20',
            tier: 1,
            unlockCondition: '기본 제공',
            buildings: ['jobCenter', 'shop', 'inn', 'dungeon', 'donation', 'quest', 'training', 'blacksmith', 'antique'],
            dungeon: { id: 'zone1', name: '초심자의 숲', midBoss: '슬라임 퀸', midBossLv: 12, boss: '킹 슬라임', bossLv: 20, steps: 10 }
        },
        {
            id: 'town2',
            name: '철광석 도시',
            levelRange: '20 ~ 40',
            tier: 2,
            unlockCondition: 'Zone 1 보스 처치',
            buildings: ['shop', 'inn', 'dungeon', 'donation', 'quest', 'training', 'blacksmith', 'antique'],
            dungeon: { id: 'zone2', name: '심연의 광산', midBoss: '골렘 가디언', midBossLv: 32, boss: '강철 기사', bossLv: 40, steps: 15 }
        },
        {
            id: 'town3',
            name: '안개 항구',
            levelRange: '40 ~ 60',
            tier: 3,
            unlockCondition: 'Zone 2 보스 처치',
            buildings: ['shop', 'inn', 'dungeon', 'donation', 'quest', 'training', 'blacksmith', 'antique'],
            dungeon: { id: 'zone3', name: '유령 함선', midBoss: '심해의 공포', midBossLv: 52, boss: '해골 선장', bossLv: 60, steps: 22 }
        },
        {
            id: 'town4',
            name: '성역 도시',
            levelRange: '60 ~ 80',
            tier: 4,
            unlockCondition: 'Zone 3 보스 처치',
            buildings: ['shop', 'inn', 'dungeon', 'donation', 'quest', 'training', 'blacksmith', 'antique'],
            dungeon: { id: 'zone4', name: '타락한 절벽', midBoss: '가시 지옥', midBossLv: 72, boss: '파멸의 천사', bossLv: 80, steps: 30 }
        },
        {
            id: 'town5',
            name: '마지막 보루',
            levelRange: '80 ~ 100',
            tier: 5,
            unlockCondition: 'Zone 4 보스 처치',
            buildings: ['shop', 'inn', 'dungeon', 'donation', 'quest', 'alchemy', 'training', 'blacksmith', 'antique'],
            dungeon: { id: 'zone5', name: '용의 둥지', midBoss: '에이션트 드레이크', midBossLv: 92, boss: '드래곤 로드', bossLv: 100, steps: 40 }
        },
        {
            id: 'town6',
            name: '공허의 심장',
            levelRange: '100+',
            tier: 6,
            unlockCondition: 'Zone 5 보스 처치',
            buildings: ['shop', 'inn', 'dungeon', 'donation', 'quest', 'alchemy', 'training', 'blacksmith', 'antique'],
            dungeon: { id: 'zone6', name: '공허의 중심', midBoss: '심연의 그림자', midBossLv: 110, boss: '공허의 절대자', bossLv: 120, steps: 50 }
        }
    ],

    GRADE_COLORS: {
        '일반': '#ffffff',
        '고급': '#1eff00',
        '레어': '#0070dd',
        '영웅': '#a335ee',
        '전설': '#ff8000',
        '신화': '#ff0000',
        '초월': '#00f2ff'
    },

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

    MUTANTS: [
        { prefix: '강인한', hpMult: 1.3 },
        { prefix: '광폭한', atkMult: 1.3 },
        { prefix: '민첩한', evaAdd: 15 },
        { prefix: '전설의', hpMult: 1.8, atkMult: 1.8, goldMult: 3.0 }
    ],

    ITEMS: {
        WEAPONS: [
            { id: 'w1', name: '낡은 검', grade: '일반', tier: 1, atk: 12, price: 50 },
            { id: 'w2', name: '날카로운 검', grade: '고급', tier: 2, atk: 35, price: 1000 },
            { id: 'w3', name: '정교한 단검', grade: '레어', tier: 3, atk: 90, price: 10000 },
            { id: 'w4', name: '기사단의 대검', grade: '영웅', tier: 4, atk: 250, price: 100000 },
            { id: 'w5', name: '성스러운 성검', grade: '전설', tier: 5, atk: 800, price: 1000000 },
            { id: 'w6', name: '혼돈의 파괴자', grade: '신화', tier: 6, atk: 2800, price: 0 },
            { id: 'w7', name: '공허의 종결자', grade: '초월', tier: 7, atk: 9000, price: 0 }
        ],
        ARMORS: [
            { id: 'a1', name: '낡은 천옷', grade: '일반', tier: 1, def: 8, price: 50 },
            { id: 'a2', name: '가죽 갑옷', grade: '고급', tier: 2, def: 24, price: 1000 },
            { id: 'a3', name: '사슬 갑옷', grade: '레어', tier: 3, def: 65, price: 10000 },
            { id: 'a4', name: '판금 갑옷', grade: '영웅', tier: 4, def: 180, price: 100000 },
            { id: 'a5', name: '성스러운 성갑', grade: '전설', tier: 5, def: 580, price: 1000000 },
            { id: 'a6', name: '심연의 갑주', grade: '신화', tier: 6, def: 2000, price: 0 },
            { id: 'a7', name: '공허의 장막', grade: '초월', tier: 7, def: 6500, price: 0 }
        ],
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
        ]
    },

    RECIPES: {
        'r_w6': { id: 'r_w6', name: '혼돈의 파괴자 레시피', targetId: 'w6', category: 'WEAPONS' },
        'r_a6': { id: 'r_a6', name: '심연의 갑주 레시피', targetId: 'a6', category: 'ARMORS' },
        'r_p6': { id: 'r_p6', name: '순수한 생명수 레시피', targetId: 'p6', category: 'CONSUMABLES' },
        'r_mp6': { id: 'r_mp6', name: '순수한 마나수 레시피', targetId: 'mp6', category: 'CONSUMABLES' }
    },

    CRAFTING: {
        'w6': { materials: { '용의 핵심': 10, '타락한 깃털': 50 }, gold: 500000 },
        'a6': { materials: { '용의 핵심': 8, '검은 성서': 60 }, gold: 500000 },
        'p6': { materials: { '공허의 정수': 5 }, gold: 100000 },
        'mp6': { materials: { '공허의 정수': 5 }, gold: 100000 }
    },

    WARRIOR_SKILLS: [
        { id: 'ws1', name: '강타', type: 'active', reqLv: 10, costType: 'hp', costVal: 10, desc: '강한 물리 피해를 입힙니다.', mult: 1.4, cooldown: 0 },
        { id: 'ws2', name: '강인한 신체', type: 'passive', reqLv: 20, costType: 'none', costVal: 0, desc: '최대 HP가 20% 증가합니다.', cooldown: 0 },
        { id: 'ws3', name: '돌진 기동', type: 'active', reqLv: 30, costType: 'hp', costVal: 25, desc: '적에게 빠르게 접근 후 공격합니다. (20% 확률로 1턴 기절)', mult: 1.7, cooldown: 2 },
        { id: 'ws4', name: '철벽 자세', type: 'active', reqLv: 40, costType: 'hp', costVal: 40, desc: '3턴 동안 받는 피해가 50% 감소하고 반격 확률이 30% 증가합니다.', cooldown: 5 },
        { id: 'ws5', name: '심판의 반격', type: 'active', reqLv: 50, costType: 'hp', costVal: 50, desc: '3턴 동안 피격 시 무조건 반격합니다. (반격 시 가한 피해의 일부 흡수)', cooldown: 6 },
        { id: 'ws6', name: '투쟁심', type: 'passive', reqLv: 60, costType: 'none', costVal: 0, desc: 'HP가 50% 이하일 때 공격력이 20%, 치명타 확률이 15% 증가합니다.', cooldown: 0 },
        { id: 'ws7', name: '분쇄격', type: 'active', reqLv: 70, costType: 'hp', costVal: 80, desc: '적의 방어력을 50% 무시하는 강력한 공격을 가합니다.', mult: 2.0, cooldown: 4 },
        { id: 'ws8', name: '광전사의 혼', type: 'active', reqLv: 80, costType: 'hp', costVal: 150, desc: '3턴 동안 공격력이 대폭 증가하지만 회피율이 0이 되고 받는 피해가 증가합니다.', cooldown: 8 },
        { id: 'ws9', name: '강철 심장', type: 'passive', reqLv: 90, costType: 'none', costVal: 0, desc: 'HP가 30% 이하일 때 턴 종료 시 최대 HP의 10%를 회복합니다.', cooldown: 0 },
        { id: 'ws10', name: '군주 강림', type: 'active', reqLv: 100, costType: 'hp', costVal: 300, desc: '적에게 초강력 일격을 가합니다. 사용 후 2턴 간 스킬을 사용할 수 없습니다.', mult: 3.5, cooldown: 10 }
    ],

    MAGE_SKILLS: [
        { id: 'ms1', name: '화염구', type: 'active', reqLv: 10, costType: 'mp', costVal: 15, desc: '기본적인 마법 화염 피해를 입힙니다.', mult: 1.5, cooldown: 0 },
        { id: 'ms2', name: '마력 친화', type: 'passive', reqLv: 20, costType: 'none', costVal: 0, desc: '최대 MP가 20% 증가하며, 매 턴 최대 MP의 5%를 자연 회복합니다.', cooldown: 0 },
        { id: 'ms3', name: '빙결의 창', type: 'active', reqLv: 30, costType: 'mp', costVal: 35, desc: '얼음 창을 날려 피해를 주고, 2턴 동안 적의 회피율을 감소시킵니다.', mult: 1.7, cooldown: 3 },
        { id: 'ms4', name: '마나 실드', type: 'active', reqLv: 40, costType: 'mp', costVal: 0, desc: '활성화 시 피해를 HP 대신 MP로 1.5배 흡수합니다. 턴당 MP 15 유지 비용.', cooldown: 5 },
        { id: 'ms5', name: '시간 파열', type: 'active', reqLv: 50, costType: 'mp', costVal: 60, desc: '시간 균열을 일으켜 다음 턴 플레이어의 공격력을 2배로 만듭니다.', mult: 1.1, cooldown: 6 },
        { id: 'ms6', name: '집중', type: 'passive', reqLv: 60, costType: 'none', costVal: 0, desc: '현재 MP가 70% 이상일 때 마력과 치명타 확률이 15% 증가합니다.', cooldown: 0 },
        { id: 'ms7', name: '폭렬 마법', type: 'active', reqLv: 70, costType: 'mp', costVal: 100, desc: '강력한 폭발을 일으키며, 적에게 3턴간 화상(매 턴 체력 비례 피해)을 입힙니다.', mult: 2.2, cooldown: 5 },
        { id: 'ms8', name: '위상 변환', type: 'active', reqLv: 80, costType: 'mp', costVal: 120, desc: '다음 1턴 간 적의 모든 공격을 회피하고 다음 공격의 치명타 확률이 50% 증가합니다.', cooldown: 7 },
        { id: 'ms9', name: '현자의 지혜', type: 'passive', reqLv: 90, costType: 'none', costVal: 0, desc: '스킬 사용 시 20% 확률로 MP를 소모하지 않습니다.', cooldown: 0 },
        { id: 'ms10', name: '메테오', type: 'active', reqLv: 100, costType: 'mp', costVal: 300, desc: '현재 MP에 비례한 괴멸적 피해를 입히지만 2턴간 MP 회복이 차단됩니다.', mult: 3.0, cooldown: 12 }
    ]
};
