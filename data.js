const GAME_DATA = {
    TOWNS: [
        {
            id: 'town1',
            name: '시작의 마을',
            levelRange: '1 ~ 25',
            tier: 1,
            unlockCondition: '기본 제공',
            buildings: ['shop', 'inn', 'dungeon', 'donation', 'quest', 'alchemy', 'training', 'blacksmith', 'antique'],
            dungeon: { id: 'zone1', name: '시작의 숲', boss: '킹 슬라임', bossLv: 25 }
        },
        {
            id: 'town2',
            name: '자유 교역 도시',
            levelRange: '26 ~ 50',
            tier: 2,
            unlockCondition: 'Zone 1 보스 처치',
            buildings: ['shop', 'inn', 'dungeon', 'donation', 'quest', 'alchemy', 'training', 'blacksmith', 'antique'],
            dungeon: { id: 'zone2', name: '버려진 광산', boss: '고블린 오버로드', bossLv: 50 }
        },
        {
            id: 'town3',
            name: '혹한의 요새',
            levelRange: '51 ~ 75',
            tier: 3,
            unlockCondition: 'Zone 2 보스 처치',
            buildings: ['shop', 'inn', 'dungeon', 'donation', 'quest', 'alchemy', 'training', 'blacksmith', 'antique'],
            dungeon: { id: 'zone3', name: '혹한의 설원', boss: '프로스트 자이언트', bossLv: 75 }
        },
        {
            id: 'town4',
            name: '용의 성소',
            levelRange: '76 ~ 100',
            tier: 4,
            unlockCondition: 'Zone 3 보스 처치',
            buildings: ['shop', 'inn', 'dungeon', 'donation', 'quest', 'alchemy', 'training', 'blacksmith', 'antique'],
            dungeon: { id: 'zone4', name: '용의 둥지', boss: '드래곤 로드', bossLv: 100 }
        },
        {
            id: 'town5',
            name: '공허의 심연',
            levelRange: '100',
            tier: 5,
            unlockCondition: 'Zone 4 보스 처치',
            buildings: ['shop', 'inn', 'dungeon', 'donation', 'quest', 'alchemy', 'training', 'blacksmith', 'antique'],
            dungeon: { id: 'zone5', name: '공허의 심연', boss: '심연의 지배자', bossLv: 120 }
        }
    ],

    MONSTERS: {
        zone1: [
            { name: '슬라임', hp: 50, atk: 8, def: 2, xp: 20, gold: 10, loots: ['슬라임 젤리'] },
            { name: '독거미', hp: 80, atk: 12, def: 4, xp: 35, gold: 20, loots: ['거미줄'] },
            { name: '킹 슬라임', hp: 1000, atk: 45, def: 20, xp: 500, gold: 300, loots: ['거대 젤리'], isBoss: true }
        ],
        zone2: [
            { name: '돌 골렘', hp: 300, atk: 40, def: 30, xp: 120, gold: 80, loots: ['철광석'] },
            { name: '미믹', hp: 200, atk: 60, def: 15, xp: 150, gold: 500, loots: ['미믹의 파편'] },
            { name: '고블린 오버로드', hp: 5000, atk: 180, def: 100, xp: 2500, gold: 2000, loots: ['왕의 징표'], isBoss: true }
        ],
        zone3: [
            { name: '서리 예티', hp: 1200, atk: 150, def: 80, xp: 600, gold: 400, loots: ['예티의 털'] },
            { name: '빙하 거머리', hp: 800, atk: 130, def: 120, xp: 550, gold: 350, loots: ['빙결 원석'] },
            { name: '프로스트 자이언트', hp: 15000, atk: 550, def: 300, xp: 10000, gold: 8000, loots: ['서리 심장'], isBoss: true }
        ],
        zone4: [
            { name: '드레이크', hp: 4000, atk: 600, def: 350, xp: 2500, gold: 1500, loots: ['용의 비늘'] },
            { name: '용 기사', hp: 5500, atk: 750, def: 500, xp: 3500, gold: 2500, loots: ['부러진 마검'] },
            { name: '드래곤 로드', hp: 50000, atk: 1800, def: 1000, xp: 50000, gold: 40000, loots: ['드래곤 코어'], isBoss: true }
        ],
        zone5: [
            { name: '심연의 망령', hp: 15000, atk: 2500, def: 1500, xp: 15000, gold: 10000, loots: ['공허의 정수'] },
            { name: '심연의 지배자', hp: 250000, atk: 8000, def: 5000, xp: 1000000, gold: 500000, loots: ['심연의 눈'], isBoss: true }
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
            { id: 'p1', name: '하급 포션', hp: 50, price: 10 },
            { id: 'p2', name: '중급 포션', hp: 200, price: 50 },
            { id: 'p3', name: '상급 포션', hp: 1000, price: 200 },
            { id: 'p4', name: '마나 포션', mp: 50, price: 20 }
        ]
    },

    SKILLS: [
        { id: 's1', name: '강타', level: 5, cost: 500, type: 'active', mp: 10, mult: 1.5 },
        { id: 's2', name: '연속 공격', level: 15, cost: 5000, type: 'active', mp: 25, mult: 2.5 },
        { id: 's3', name: '심연의 일격', level: 50, cost: 100000, type: 'active', mp: 60, mult: 5.0 }
    ]
};
