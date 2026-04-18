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
            { name: '슬라임', hp: 50, atk: 8, def: 2, xp: 23, gold: 10, loots: ['슬라임 젤리'], eva: 5 },
            { name: '독거미', hp: 80, atk: 12, def: 4, xp: 40, gold: 20, loots: ['거미줄'], eva: 8 },
            { name: '슬라임 퀸', hp: 450, atk: 25, def: 12, xp: 170, gold: 100, isMidBoss: true, eva: 10 },
            { name: '킹 슬라임', hp: 800, atk: 40, def: 15, xp: 580, gold: 300, loots: ['거대 젤리'], isBoss: true, eva: 12 }
        ],
        zone2: [
            { name: '돌 골렘', hp: 300, atk: 40, def: 30, xp: 140, gold: 80, loots: ['철광석'], eva: 5 },
            { name: '미믹', hp: 200, atk: 60, def: 15, xp: 175, gold: 500, loots: ['미믹의 파편'], eva: 15 },
            { name: '골렘 수호자', hp: 2500, atk: 120, def: 60, xp: 920, gold: 600, isMidBoss: true, eva: 12 },
            { name: '고블린 오버로드', hp: 3500, atk: 150, def: 80, xp: 2900, gold: 2000, loots: ['왕의 징표'], isBoss: true, eva: 15 }
        ],
        zone3: [
            { name: '서리 예티', hp: 1200, atk: 150, def: 80, xp: 700, gold: 400, loots: ['예티의 털'], eva: 10 },
            { name: '빙하 거머리', hp: 800, atk: 130, def: 120, xp: 630, gold: 350, loots: ['빙결 원석'], eva: 12 },
            { name: '서리 정령', hp: 7000, atk: 350, def: 200, xp: 3500, gold: 2000, isMidBoss: true, eva: 15 },
            { name: '프로스트 자이언트', hp: 12000, atk: 450, def: 250, xp: 11500, gold: 8000, loots: ['서리 심장'], isBoss: true, eva: 18 }
        ],
        zone4: [
            { name: '드레이크', hp: 4000, atk: 600, def: 350, xp: 2900, gold: 1500, loots: ['용의 비늘'], eva: 12 },
            { name: '용 기사', hp: 5500, atk: 750, def: 500, xp: 4000, gold: 2500, loots: ['부러진 마검'], eva: 15 },
            { name: '화염 드레이크', hp: 20000, atk: 1200, def: 600, xp: 17500, gold: 10000, isMidBoss: true, eva: 18 },
            { name: '드래곤 로드', hp: 35000, atk: 1400, def: 800, xp: 58000, gold: 40000, loots: ['드래곤 코어'], isBoss: true, eva: 20 }
        ],
        zone5: [
            { name: '심연의 망령', hp: 15000, atk: 2500, def: 1500, xp: 17500, gold: 10000, loots: ['공허의 정수'], eva: 15 },
            { name: '공허의 그림자', hp: 100000, atk: 5000, def: 3000, xp: 290000, gold: 100000, isMidBoss: true, eva: 20 },
            { name: '심연의 지배자', hp: 180000, atk: 6000, def: 4000, xp: 1150000, gold: 500000, loots: ['심연의 눈'], isBoss: true, eva: 25 }
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
            { id: 'w1', name: '초보자의 검', tier: 1, atk: 10, price: 50 },
            { id: 'w2', name: '강철 검', tier: 2, atk: 50, price: 1000 },
            { id: 'w3', name: '서리 칼날', tier: 3, atk: 200, price: 10000 },
            { id: 'w4', name: '용살자', tier: 4, atk: 800, price: 100000 },
            { id: 'w5', name: '심연의 절단기', tier: 5, atk: 3000, price: 1000000 }
        ],
        ARMORS: [
            { id: 'a1', name: '낡은 가죽옷', tier: 1, def: 5, price: 50 },
            { id: 'a2', name: '사슬 갑옷', tier: 2, def: 25, price: 1000 },
            { id: 'a3', name: '판금 갑옷', tier: 3, def: 100, price: 10000 },
            { id: 'a4', name: '드래곤 갑주', tier: 4, def: 400, price: 100000 },
            { id: 'a5', name: '심연의 로브', tier: 5, def: 1500, price: 1000000 }
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
