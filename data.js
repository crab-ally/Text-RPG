const GAME_DATA = {
    TOWNS: [
        {
            id: 'town1',
            name: '시작의 마을',
            levelRange: '1 ~ 25',
            tier: 1,
            unlockCondition: '기본 제공',
            buildings: ['shop', 'inn', 'dungeon', 'donation', 'quest', 'alchemy', 'training', 'blacksmith', 'antique'],
            dungeon: { id: 'zone1', name: '시작의 숲', midBoss: '슬라임 퀸', midBossLv: 15, boss: '킹 슬라임', bossLv: 25, steps: 10 }
        },
        {
            id: 'town2',
            name: '자유 교역 도시',
            levelRange: '26 ~ 50',
            tier: 2,
            unlockCondition: 'Zone 1 보스 처치',
            buildings: ['shop', 'inn', 'dungeon', 'donation', 'quest', 'alchemy', 'training', 'blacksmith', 'antique'],
            dungeon: { id: 'zone2', name: '버려진 광산', midBoss: '골렘 수호자', midBossLv: 40, boss: '고블린 오버로드', bossLv: 50, steps: 15 }
        },
        {
            id: 'town3',
            name: '혹한의 요새',
            levelRange: '51 ~ 75',
            tier: 3,
            unlockCondition: 'Zone 2 보스 처치',
            buildings: ['shop', 'inn', 'dungeon', 'donation', 'quest', 'alchemy', 'training', 'blacksmith', 'antique'],
            dungeon: { id: 'zone3', name: '혹한의 설원', midBoss: '서리 정령', midBossLv: 65, boss: '프로스트 자이언트', bossLv: 75, steps: 22 }
        },
        {
            id: 'town4',
            name: '용의 성소',
            levelRange: '76 ~ 100',
            tier: 4,
            unlockCondition: 'Zone 3 보스 처치',
            buildings: ['shop', 'inn', 'dungeon', 'donation', 'quest', 'alchemy', 'training', 'blacksmith', 'antique'],
            dungeon: { id: 'zone4', name: '용의 둥지', midBoss: '화염 드레이크', midBossLv: 85, boss: '드래곤 로드', bossLv: 100, steps: 30 }
        },
        {
            id: 'town5',
            name: '공허의 심연',
            levelRange: '100',
            tier: 5,
            unlockCondition: 'Zone 4 보스 처치',
            buildings: ['shop', 'inn', 'dungeon', 'donation', 'quest', 'alchemy', 'training', 'blacksmith', 'antique'],
            dungeon: { id: 'zone5', name: '공허의 심연', midBoss: '공허의 그림자', midBossLv: 110, boss: '심연의 지배자', bossLv: 120, steps: 40 }
        }
    ],

    MONSTERS: {
        zone1: [
            { name: '슬라임', hp: 130, atk: 15, def: 5, xp: 23, gold: 15, loots: ['슬라임 젤리'], eva: 5 },
            { name: '독거미', hp: 240, atk: 22, def: 8, xp: 40, gold: 30, loots: ['거미줄'], eva: 8 },
            { name: '슬라임 퀸', hp: 700, atk: 40, def: 15, xp: 170, gold: 180, isMidBoss: true, eva: 10 },
            { name: '킹 슬라임', hp: 1200, atk: 60, def: 25, xp: 580, gold: 550, loots: ['거대 젤리'], isBoss: true, eva: 15 }
        ],
        zone2: [
            { name: '돌 골렘', hp: 700, atk: 80, def: 35, xp: 140, gold: 120, loots: ['철광석'], eva: 5 },
            { name: '미믹', hp: 500, atk: 110, def: 25, xp: 175, gold: 750, loots: ['미믹의 파편'], eva: 15 },
            { name: '골렘 수호자', hp: 2500, atk: 150, def: 75, xp: 920, gold: 1000, isMidBoss: true, eva: 12 },
            { name: '고블린 오버로드', hp: 5500, atk: 220, def: 110, xp: 2900, gold: 3500, loots: ['왕의 징표'], isBoss: true, eva: 15 }
        ],
        zone3: [
            { name: '서리 예티', hp: 2400, atk: 260, def: 100, xp: 700, gold: 650, loots: ['예티의 털'], eva: 10 },
            { name: '빙하 거머리', hp: 1600, atk: 220, def: 150, xp: 630, gold: 550, loots: ['빙결 원석'], eva: 12 },
            { name: '서리 정령', hp: 8500, atk: 550, def: 250, xp: 3500, gold: 3200, isMidBoss: true, eva: 15 },
            { name: '프로스트 자이언트', hp: 18000, atk: 660, def: 350, xp: 11500, gold: 14000, loots: ['서리 심장'], isBoss: true, eva: 18 }
        ],
        zone4: [
            { name: '드레이크', hp: 8000, atk: 1000, def: 450, xp: 2900, gold: 2500, loots: ['용의 비늘'], eva: 12 },
            { name: '용 기사', hp: 11000, atk: 1300, def: 650, xp: 4000, gold: 4500, loots: ['부러진 마검'], eva: 15 },
            { name: '화염 드레이크', hp: 28000, atk: 1700, def: 750, xp: 17500, gold: 18000, isMidBoss: true, eva: 18 },
            { name: '드래곤 로드', hp: 55000, atk: 2200, def: 1000, xp: 58000, gold: 65000, loots: ['드래곤 코어'], isBoss: true, eva: 20 }
        ],
        zone5: [
            { name: '심연의 망령', hp: 35000, atk: 3600, def: 2000, xp: 17500, gold: 15000, loots: ['공허의 정수'], eva: 15 },
            { name: '공허의 그림자', hp: 100000, atk: 6600, def: 4000, xp: 290000, gold: 150000, isMidBoss: true, eva: 20 },
            { name: '심연의 지배자', hp: 180000, atk: 9000, def: 5500, xp: 1150000, gold: 750000, loots: ['심연의 눈'], isBoss: true, eva: 30 }
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
            { id: 'w1', name: '초보자의 검', tier: 1, atk: 15, price: 50 },
            { id: 'w2', name: '강철 검', tier: 2, atk: 35, price: 1000 },
            { id: 'w3', name: '서리 칼날', tier: 3, atk: 80, price: 10000 },
            { id: 'w4', name: '용살자', tier: 4, atk: 185, price: 100000 },
            { id: 'w5', name: '심연의 절단기', tier: 5, atk: 430, price: 1000000 }
        ],
        ARMORS: [
            { id: 'a1', name: '낡은 가죽옷', tier: 1, def: 10, price: 50 },
            { id: 'a2', name: '사슬 갑옷', tier: 2, def: 23, price: 1000 },
            { id: 'a3', name: '판금 갑옷', tier: 3, def: 53, price: 10000 },
            { id: 'a4', name: '드래곤 갑주', tier: 4, def: 122, price: 100000 },
            { id: 'a5', name: '심연의 로브', tier: 5, def: 280, price: 1000000 }
        ],
        CONSUMABLES: [
            { id: 'p1', name: '최하급 포션', tier: 1, hp: 50, price: 10 },
            { id: 'p2', name: '하급 포션', tier: 2, hp: 150, price: 50 },
            { id: 'p3', name: '중급 포션', tier: 3, hp: 500, price: 200 },
            { id: 'p4', name: '상급 포션', tier: 4, hp: 1500, price: 800 },
            { id: 'p5', name: '최상급 포션', tier: 5, hp: 5000, price: 5000 },
            { id: 'p6', name: '마나 포션', tier: 1, mp: 50, price: 30 }
        ]
    },

    SKILLS: [
        { id: 's1', name: '강타', level: 5, cost: 500, type: 'active', mp: 10, mult: 1.5 },
        { id: 's2', name: '연속 공격', level: 15, cost: 5000, type: 'active', mp: 25, mult: 2.5 },
        { id: 's3', name: '심연의 일격', level: 50, cost: 100000, type: 'active', mp: 60, mult: 5.0 }
    ]
};
