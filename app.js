/**
 * Player 클래스: 플레이어의 능력치와 상태를 관리
 */
class Player {
    constructor() {
        this.lvl = 1;
        this.hp = 100;
        this.maxHp = 100;
        this.atk = 10;
        this.def = 5;
        this.gold = 0;
        this.exp = 0;
        this.maxExp = 100;
    }

    // 경험치 획득 및 레벨업 체크
    gainExp(amount) {
        this.exp += amount;
        game.log(`경험치를 ${amount} 획득했습니다.`, 'log-info');
        if (this.exp >= this.maxExp) {
            this.levelUp();
        }
    }

    // 레벨업 시 능력치 상승 로직
    levelUp() {
        this.lvl++;
        this.exp -= this.maxExp;
        this.maxExp = Math.floor(this.maxExp * 1.5);
        this.maxHp += 20;
        this.hp = this.maxHp; // 레벨업 시 HP 전회복
        this.atk += 5;
        this.def += 2;
        game.log(`LEVEL UP! 레벨 ${this.lvl}이 되었습니다!`, 'log-reward');
        game.updateUI();
    }

    // 피해 입을 때 호출
    takeDamage(amount) {
        const damage = Math.max(1, amount - this.def); // 방어력 수치만큼 감쇄
        this.hp = Math.max(0, this.hp - damage);
        game.log(`당신은 ${damage}의 피해를 입었습니다.`, 'log-combat');
        game.updateUI();
        if (this.hp <= 0) {
            game.gameOver();
        }
    }
}

/**
 * Monster 클래스: 적 몬스터의 능력치 관리
 */
class Monster {
    constructor(name, hp, atk, exp, gold) {
        this.name = name;
        this.hp = hp;
        this.maxHp = hp;
        this.atk = atk;
        this.expReward = exp;
        this.goldReward = gold;
    }

    // 몬스터가 피해를 입음
    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        game.log(`${this.name}에게 ${amount}의 피해를 입혔습니다.`, 'log-info');
        game.updateUI();
        return this.hp <= 0; // 사망 여부 반환
    }
}

/**
 * game 객체: 게임의 전체적인 흐름과 UI 연동을 담당하는 메인 엔진
 */
const game = {
    player: new Player(),
    currentMonster: null,
    state: 'TOWN', // TOWN, DUNGEON, BATTLE
    location: '마을',

    // 초기화: DOM 요소 연결 및 이벤트 리스너 등록
    init() {
        this.el = {
            hp: document.getElementById('player-hp'),
            hpBar: document.getElementById('player-hp-bar'),
            lvl: document.getElementById('player-lvl'),
            atk: document.getElementById('player-atk'),
            def: document.getElementById('player-def'),
            gold: document.getElementById('player-gold'),
            exp: document.getElementById('player-exp'),
            log: document.getElementById('log-panel'),
            location: document.getElementById('current-location'),
            monsterStatus: document.getElementById('monster-status'),
            monsterName: document.getElementById('monster-name'),
            monsterHp: document.getElementById('monster-hp'),
            monsterHpBar: document.getElementById('monster-hp-bar'),
            townActions: document.getElementById('town-actions'),
            dungeonActions: document.getElementById('dungeon-actions'),
            battleActions: document.getElementById('battle-actions'),
        };

        // 버튼 클릭 이벤트 바인딩
        document.getElementById('btn-enter-dungeon').onclick = () => this.enterDungeon();
        document.getElementById('btn-enter-shop').onclick = () => this.enterShop();
        document.getElementById('btn-return-town').onclick = () => this.enterTown();
        document.getElementById('btn-explore').onclick = () => this.explore();
        document.getElementById('btn-rest').onclick = () => this.rest();
        document.getElementById('btn-attack').onclick = () => this.attack();
        document.getElementById('btn-run').onclick = () => this.run();

        this.enterTown(); // 시작은 마을에서
    },

    // 현재 플레이어 및 몬스터 상태를 화면에 갱신
    updateUI() {
        // 플레이어 배지 정보 업데이트
        this.el.location.innerText = this.location;
        this.el.gold.innerText = this.player.gold;

        // 플레이어 HP 바 및 텍스트 업데이트
        const hpPercent = (this.player.hp / this.player.maxHp) * 100;
        this.el.hp.innerText = `${this.player.hp} / ${this.player.maxHp}`;
        this.el.hpBar.style.width = `${hpPercent}%`;

        // 플레이어 상세 스탯 업데이트
        this.el.lvl.innerText = this.player.lvl;
        this.el.atk.innerText = this.player.atk;
        this.el.def.innerText = this.player.def;
        this.el.exp.innerText = `${this.player.exp} / ${this.player.maxExp}`;

        // 몬스터 상태창 업데이트 (전투 중일 때만)
        if (this.currentMonster) {
            const mHpPercent = (this.currentMonster.hp / this.currentMonster.maxHp) * 100;
            this.el.monsterName.innerText = this.currentMonster.name;
            this.el.monsterHp.innerText = `${this.currentMonster.hp} / ${this.currentMonster.maxHp}`;
            this.el.monsterHpBar.style.width = `${mHpPercent}%`;
            this.el.monsterStatus.classList.remove('hidden');
        } else {
            this.el.monsterStatus.classList.add('hidden');
        }

        // 상태에 따라 버튼 그룹 노출 제어
        this.el.townActions.classList.add('hidden');
        this.el.dungeonActions.classList.add('hidden');
        this.el.battleActions.classList.add('hidden');

        if (this.state === 'TOWN') {
            this.el.townActions.classList.remove('hidden');
        } else if (this.state === 'DUNGEON') {
            this.el.dungeonActions.classList.remove('hidden');
        } else if (this.state === 'BATTLE') {
            this.el.battleActions.classList.remove('hidden');
        }
    },

    // 마을 입장
    enterTown() {
        this.state = 'TOWN';
        this.location = '마을';
        this.log('마을에 도착했습니다. 이곳은 평화로운 분위기입니다.', 'log-info');
        this.updateUI();
    },

    // 던전 입장
    enterDungeon() {
        this.state = 'DUNGEON';
        this.location = '던전 깊은 곳';
        this.log('어두컴컴한 던전에 발을 들이밀었습니다. 긴장을 늦추지 마세요.', 'log-warning');
        this.updateUI();
    },

    // 상점 입장 (미구현)
    enterShop() {
        this.log('상점은 아직 공사 중입니다. 다음 업데이트를 기대해 주세요!', 'log-info');
    },

    // 로그 패널에 메시지 추가
    log(msg, className = '') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${className}`;
        entry.innerText = msg;
        this.el.log.appendChild(entry);

        // 로그 개수 제한: 30개가 넘으면 가장 오래된 것부터 삭제
        if (this.el.log.children.length > 30) {
            this.el.log.removeChild(this.el.log.firstChild);
        }

        this.el.log.scrollTop = this.el.log.scrollHeight; // 항상 최신 로그 아래로 스크롤
    },

    // 탐험 로직: 랜덤 이벤트 발생
    explore() {
        this.log('주변을 탐색합니다...', 'log-info');
        const rand = Math.random();

        if (rand < 0.2) {
            // 20% 확률로 골드 발견
            const foundGold = Math.floor(Math.random() * 20) + 10;
            this.player.gold += foundGold;
            this.log(`금화를 ${foundGold}개 발견했습니다!`, 'log-reward');
            this.updateUI();
        } else if (rand < 0.8) {
            // 60% 확률로 전투 발생
            this.startBattle();
        } else {
            // 20% 확률로 아무 일 없음
            this.log('평화로운 숲길이 이어집니다. 아무 일도 일어나지 않았습니다.');
        }
    },

    // 휴식 로직: 체력 회복
    rest() {
        if (this.player.hp === this.player.maxHp) {
            this.log('이미 체력이 가득 차 있습니다.');
            return;
        }
        const heal = 20;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
        this.log('휴식을 취해 체력을 회복합니다. (+20 HP)');
        this.updateUI();
    },

    // 전투 시작: 몬스터 생성 및 모드 전환
    startBattle() {
        const monsters = [
            { name: '슬라임', hp: 30, atk: 8, exp: 20, gold: 10 },
            { name: '고블린', hp: 50, atk: 12, exp: 40, gold: 25 },
            { name: '늑대', hp: 40, atk: 15, exp: 35, gold: 15 }
        ];
        // 몬스터 데이터 선택 및 스케일링
        const mData = monsters[Math.floor(Math.random() * monsters.length)];
        this.currentMonster = new Monster(
            mData.name,
            mData.hp + (this.player.lvl * 5),
            mData.atk + this.player.lvl,
            mData.exp + (this.player.lvl * 2),
            mData.gold + (this.player.lvl * 3)
        );

        this.state = 'BATTLE';
        this.log(`야생의 ${this.currentMonster.name}(이)가 나타났다!`, 'log-warning');
        this.updateUI();
    },

    // 공격 로직: 턴제 공방
    attack() {
        if (!this.currentMonster) return;

        // 플레이어 선제 공격
        const isDead = this.currentMonster.takeDamage(this.player.atk);

        if (isDead) {
            this.log(`${this.currentMonster.name}(을)를 물리쳤습니다!`, 'log-reward');
            this.player.gainExp(this.currentMonster.expReward);
            this.player.gold += this.currentMonster.goldReward;
            this.log(`골드 ${this.currentMonster.goldReward}개를 획득했습니다.`, 'log-reward');
            this.endBattle();
        } else {
            // 몬스터 반격 (0.5초 딜레이)
            setTimeout(() => {
                if (this.isBattle) {
                    this.player.takeDamage(this.currentMonster.atk);
                }
            }, 500);
        }
    },

    // 도망가기 로직: 50% 확률 성공
    run() {
        if (Math.random() < 0.5) {
            this.log('무사히 도망쳤습니다!', 'log-info');
            this.endBattle();
        } else {
            this.log('도망치는 데 실패했습니다!', 'log-warning');
            this.player.takeDamage(this.currentMonster.atk);
        }
    },

    // 전투 종료 상태 처리
    endBattle() {
        this.state = 'DUNGEON';
        this.currentMonster = null;
        this.updateUI();
    },

    // 게임 오버 처리
    gameOver() {
        this.state = 'DUNGEON'; // 전투 상태 해제하여 버튼 패널 전환 준비
        this.updateUI();       // UI 갱신하여 메인 액션 패널 노출

        this.log('당신은 쓰러졌습니다... GAME OVER', 'log-combat');
        // 다시 시작 버튼 노출
        this.el.dungeonActions.innerHTML = '<button onclick="location.reload()" class="btn primary">다시 시작</button>';
    }
};

// 페이지 로드 완료 시 게임 초기화 실행
window.onload = () => game.init();