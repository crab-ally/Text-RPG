const GAME_DATA = {
    TOWNS: [
        {
            id: 'town1',
            name: '시작의 마을',
            levelRange: '1 ~ 20',
            tier: 1,
            unlockCondition: '기본 제공',
            buildings: ['shop', 'inn', 'dungeon', 'donation', 'quest', 'training', 'blacksmith', 'antique'],
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
            { name: '슬라임', hp: 130, atk: 15, def: 5, xp: 23, gold: 15, loots: ['슬라임 젤리'], eva: 5 },
            { name: '숲 거미', hp: 240, atk: 22, def: 8, xp: 40, gold: 30, loots: ['거미의 독샘'], eva: 8 },
            { name: '슬라임 퀸', hp: 700, atk: 40, def: 15, xp: 170, gold: 180, loots: ['왕관 조각'], isMidBoss: true, eva: 10 },
            { name: '킹 슬라임', hp: 1200, atk: 60, def: 25, xp: 580, gold: 550, loots: ['거대 핵'], isBoss: true, eva: 15 }
        ],
        zone2: [
            { name: '돌 괴물', hp: 700, atk: 80, def: 35, xp: 140, gold: 120, loots: ['암석 파편'], eva: 5 },
            { name: '미믹', hp: 500, atk: 110, def: 25, xp: 175, gold: 750, loots: ['미믹의 이빨'], eva: 15 },
            { name: '골렘 가디언', hp: 2500, atk: 150, def: 75, xp: 920, gold: 1000, loots: ['강철 원석'], isMidBoss: true, eva: 12 },
            { name: '강철 기사', hp: 5500, atk: 220, def: 110, xp: 2900, gold: 3500, loots: ['빛나는 강철'], isBoss: true, eva: 15 }
        ],
        zone3: [
            { name: '원령', hp: 2400, atk: 260, def: 100, xp: 700, gold: 650, loots: ['유령의 혼'], eva: 15 },
            { name: '녹슨 검객', hp: 1600, atk: 350, def: 150, xp: 630, gold: 550, loots: ['녹슨 칼날'], eva: 12 },
            { name: '심해의 공포', hp: 8500, atk: 550, def: 250, xp: 3500, gold: 3200, loots: ['거대 촉수'], isMidBoss: true, eva: 15 },
            { name: '해골 선장', hp: 18000, atk: 660, def: 350, xp: 11500, gold: 14000, loots: ['부러진 나침반'], isBoss: true, eva: 18 }
        ],
        zone4: [
            { name: '가고일', hp: 8000, atk: 1000, def: 450, xp: 2900, gold: 2500, loots: ['돌의 날개'], eva: 12 },
            { name: '타락한 사제', hp: 11000, atk: 1300, def: 650, xp: 4000, gold: 4500, loots: ['검은 성서'], eva: 15 },
            { name: '가시 지옥', hp: 28000, atk: 1700, def: 750, xp: 17500, gold: 18000, loots: ['피묻은 가시'], isMidBoss: true, eva: 18 },
            { name: '파멸의 천사', hp: 55000, atk: 2200, def: 1000, xp: 58000, gold: 65000, loots: ['타락한 깃털'], isBoss: true, eva: 20 }
        ],
        zone5: [
            { name: '에이션트 웜', hp: 35000, atk: 3600, def: 2000, xp: 17500, gold: 18000, loots: ['오래된 껍질'], eva: 10 },
            { name: '에이션트 드레이크', hp: 100000, atk: 6600, def: 4000, xp: 290000, gold: 150000, loots: ['마른 비늘'], isMidBoss: true, eva: 20 },
            { name: '드래곤 로드', hp: 180000, atk: 9000, def: 5500, xp: 1150000, gold: 750000, loots: ['용의 핵심'], isBoss: true, eva: 30 }
        ],
        zone6: [
            { name: '공허의 망령', hp: 250000, atk: 15000, def: 8000, xp: 500000, gold: 100000, loots: ['공허의 정수'], eva: 25 },
            { name: '심연의 그림자', hp: 800000, atk: 35000, def: 15000, xp: 2500000, gold: 500000, loots: ['심연의 조각'], isMidBoss: true, eva: 35 },
            { name: '공허의 절대자', hp: 2000000, atk: 80000, def: 40000, xp: 10000000, gold: 2000000, loots: ['공허의 눈'], isBoss: true, eva: 50 }
        ]
    },

    MUTANTS: [
        { prefix: '강인한', hpMult: 1.5 },
        { prefix: '광폭한', atkMult: 1.5 },
        { prefix: '민첩한', evaAdd: 20 },
        { prefix: '전설의', hpMult: 2.0, atkMult: 2.0, goldMult: 3.0 }
    ],

    ITEMS: {
        WEAPONS: [
            { id: 'w1', name: '낡은 검', grade: '일반', tier: 1, atk: 15, price: 50 },
            { id: 'w2', name: '날카로운 검', grade: '고급', tier: 2, atk: 45, price: 1000 },
            { id: 'w3', name: '정교한 단검', grade: '레어', tier: 3, atk: 120, price: 10000 },
            { id: 'w4', name: '기사단의 대검', grade: '영웅', tier: 4, atk: 350, price: 100000 },
            { id: 'w5', name: '성스러운 성검', grade: '전설', tier: 5, atk: 1200, price: 1000000 },
            { id: 'w6', name: '혼돈의 파괴자', grade: '신화', tier: 6, atk: 4500, price: 0 },
            { id: 'w7', name: '공허의 종결자', grade: '초월', tier: 7, atk: 15000, price: 0 }
        ],
        ARMORS: [
            { id: 'a1', name: '낡은 천옷', grade: '일반', tier: 1, def: 10, price: 50 },
            { id: 'a2', name: '가죽 갑옷', grade: '고급', tier: 2, def: 30, price: 1000 },
            { id: 'a3', name: '사슬 갑옷', grade: '레어', tier: 3, def: 85, price: 10000 },
            { id: 'a4', name: '판금 갑옷', grade: '영웅', tier: 4, def: 250, price: 100000 },
            { id: 'a5', name: '성스러운 성갑', grade: '전설', tier: 5, def: 900, price: 1000000 },
            { id: 'a6', name: '심연의 갑주', grade: '신화', tier: 6, def: 3500, price: 0 },
            { id: 'a7', name: '공허의 장막', grade: '초월', tier: 7, def: 12000, price: 0 }
        ],
        CONSUMABLES: [
            { id: 'p1', name: '희석된 HP 포션', grade: '희석', tier: 1, hp: 70, price: 15 },
            { id: 'p2', name: '약한 HP포션', grade: '약함', tier: 2, hp: 200, price: 60 },
            { id: 'p3', name: '농축된 HP 포션', grade: '농축', tier: 3, hp: 700, price: 250 },
            { id: 'p4', name: '고농축 HP 포션', grade: '고농축', tier: 4, hp: 2500, price: 1000 },
            { id: 'p5', name: '극농축 HP 포션', grade: '극농축', tier: 5, hp: 8000, price: 6000 },
            { id: 'p6', name: '순수한 생명수', grade: '순수', tier: 6, hp: 30000, price: 0 },
            { id: 'mp1', name: '희석된 MP 포션', grade: '희석', tier: 1, mp: 50, price: 30 },
            { id: 'mp2', name: '약한 MP 포션', grade: '약함', tier: 2, mp: 140, price: 90 },
            { id: 'mp3', name: '농축된 MP 포션', grade: '농축', tier: 3, mp: 350, price: 300 },
            { id: 'mp4', name: '고농축 MP 포션', grade: '고농축', tier: 4, mp: 900, price: 1200 },
            { id: 'mp5', name: '극농축 MP 포션', grade: '극농축', tier: 5, mp: 2500, price: 7000 },
            { id: 'mp6', name: '순수한 마나수', grade: '순수', tier: 6, mp: 10000, price: 0 }
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

    SKILLS: [
        { id: 's1', name: '강타', level: 5, cost: 500, type: 'active', mp: 10, mult: 1.5 },
        { id: 's2', name: '연속 공격', level: 15, cost: 5000, type: 'active', mp: 25, mult: 2.5 },
        { id: 's3', name: '심연의 일격', level: 50, cost: 100000, type: 'active', mp: 60, mult: 5.0 }
    ]
};
