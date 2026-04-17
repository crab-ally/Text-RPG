/**
 * Void Abyss - 핵심 게임 엔진 스크립트
 * 획득한 장비, 레벨, 골드 등 모든 게임 진행 데이터와 
 * 전투, 상점, 탐험 로직을 관리합니다.
 */

class Game {
    constructor() {
        // 게임의 전역 상태 객체 정의
        this.gameState = {
            player: {
                level: 1, xp: 0, xpNext: 100,               // 레벨 및 경험치 시스템
                hp: 100, hpMax: 100, mp: 50, mpMax: 50,    // 생명력 및 마력
                atk: 10, def: 5, cri: 5, eva: 5, gold: 500, // 전투 스탯 및 재화
                equipment: { weapon: null, armor: null, accessory: [null, null, null] }, // 장착 장비
                inventory: [], skills: [],                 // 소지 아이템 및 스킬
                unlockedTowns: ['town1'],                  // 해금된 마을 리스트
                monsterEncyclopedia: {}                    // 몬스터 도감 데이터
            },
            world: {
                currentLocation: 'town1', day: 1, inflation: 1.0, // 현재 장소, 날짜, 물가 상승률
                dungeonDayUsed: false, losses: []                  // 던전 이용 여부 및 유실물 데이터
            }
        };
        this.currentBattle = null; // 현재 진행 중인 전투 정보 저장용
        this.init();
    }


    /**
     * 게임 초기화: 이벤트 리스너 설정 및 초기 UI 렌더링
     */
    init() {
        this.setupEventListeners();
        this.updateStats();
        this.updateUI();
    }


    /**
     * 게임 시작 또는 데이터 로드
     * slot 번호가 있으면 해당 슬롯에서 로딩, 없으면 새 게임 또는 슬롯 선택 화면 표시
     */
    startGame(isLoad, slot = null) {
        if (isLoad && slot !== null) {
            this.loadGame(slot);
        } else if (isLoad) {
            this.showSlotSelection();
            return;
        }
        
        document.body.classList.remove('menu-open');
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        this.updateStats();
        this.updateUI();
        this.renderTownActions();
    }


    showSlotSelection() {
        document.getElementById('initial-menu').classList.add('hidden');
        document.getElementById('slot-selection').classList.remove('hidden');
        this.renderLoadSlots();
    }

    hideSlotSelection() {
        document.getElementById('slot-selection').classList.add('hidden');
        document.getElementById('initial-menu').classList.remove('hidden');
    }

    renderLoadSlots() {
        const container = document.getElementById('load-slots-container');
        container.innerHTML = '';
        for (let i = 1; i <= 3; i++) {
            const summary = this.getSlotSummary(i);
            const slot = document.createElement('div');
            slot.className = `slot-card ${!summary ? 'empty' : ''}`;
            if (summary) {
                slot.innerHTML = `
                    <div class="slot-number">SLOT ${i}</div>
                    <div class="slot-lv">LV ${summary.level}</div>
                    <div class="slot-loc">${summary.location}</div>
                `;
                slot.onclick = () => this.startGame(true, i);
            } else {
                slot.innerHTML = `<div class="slot-empty-text">비어 있음</div>`;
            }
            container.appendChild(slot);
        }
    }

    openSaveModal() {
        let h = '<div class="slots-container">';
        for (let i = 1; i <= 3; i++) {
            const summary = this.getSlotSummary(i);
            h += `
                <div class="slot-card ${!summary ? 'empty' : ''}" onclick="game.saveGame(${i})">
                    <div class="slot-number">SLOT ${i}</div>
                    ${summary ? `<div class="slot-lv">LV ${summary.level}</div><div class="slot-loc">${summary.location}</div>` : '<div class="slot-empty-text">덮어쓰기</div>'}
                </div>
            `;
        }
        h += '</div>';
        this.showModal('저장할 슬롯 선택', h);
    }



    setupEventListeners() {
        document.getElementById('close-modal').addEventListener('click', () => this.closeModal());
    }

    /**
     * 진행 상황 저장 (3개 슬롯 중 선택된 곳에 로컬 스토리지 저장)
     */
    saveGame(slot) {
        localStorage.setItem(`void_abyss_save_${slot}`, JSON.stringify(this.gameState));
        this.log(`슬롯 ${slot}에 진행 상황이 저장되었습니다.`, 'system');
        this.closeModal();
    }

    /**
     * 특정 슬롯에서 데이터 불러오기
     */
    loadGame(slot) {
        const saved = localStorage.getItem(`void_abyss_save_${slot}`);
        if (saved) {
            try { this.gameState = JSON.parse(saved); } catch (e) { console.error("Save load failed", e); }
        }
    }


    getSlotSummary(slot) {
        const saved = localStorage.getItem(`void_abyss_save_${slot}`);
        if (!saved) return null;
        try {
            const data = JSON.parse(saved);
            const town = GAME_DATA.TOWNS.find(t => t.id === data.world.currentLocation);
            return {
                level: data.player.level,
                location: town ? town.name : '알 수 없음'
            };
        } catch (e) { return null; }
    }


    /**
     * 메세지 로그 출력 (최대 30개 유지)
     */
    log(msg, type = 'normal') {
        const log = document.getElementById('game-log');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.innerHTML = `[${new Date().toLocaleTimeString('ko-KR', { hour12: false })}] ${msg}`;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
        // 로그 개수 제한하여 성능 최적화
        while (log.children.length > 30) log.removeChild(log.firstChild);
    }


    updateUI() {
        const p = this.gameState.player; const w = this.gameState.world;
        document.getElementById('player-level').innerText = p.level;
        document.getElementById('player-gold').innerText = Math.floor(p.gold).toLocaleString();
        document.getElementById('game-day').innerText = w.day;
        document.getElementById('hp-cur').innerText = Math.ceil(p.hp);
        document.getElementById('hp-max').innerText = p.hpMax;
        document.getElementById('mp-cur').innerText = Math.ceil(p.mp);
        document.getElementById('mp-max').innerText = p.mpMax;
        document.getElementById('stat-atk').innerText = p.atk;
        document.getElementById('stat-def').innerText = p.def;
        document.getElementById('stat-cri').innerText = p.cri + '%';
        document.getElementById('stat-eva').innerText = p.eva + '%';
        document.getElementById('hp-bar').style.width = (p.hp / p.hpMax * 100) + '%';
        document.getElementById('mp-bar').style.width = (p.mp / p.mpMax * 100) + '%';
        document.getElementById('xp-bar').style.width = (p.xp / p.xpNext * 100) + '%';
        document.getElementById('xp-cur').innerText = Math.floor(p.xp);
        document.getElementById('xp-max').innerText = p.xpNext;
        const town = GAME_DATA.TOWNS.find(t => t.id === w.currentLocation);
        document.getElementById('current-location').innerText = town ? town.name : '알 수 없음';

        // Inventory
        const invContainer = document.getElementById('inventory-list');
        document.getElementById('inv-cur').innerText = p.inventory.length;
        invContainer.innerHTML = '';
        for (let i = 0; i < 30; i++) {
            const slot = document.createElement('div');
            slot.className = 'inv-item';
            if (p.inventory[i]) {
                const it = p.inventory[i];
                slot.innerText = it.name.substring(0, 4) + (it.name.length > 4 ? '..' : '');
                slot.onclick = () => this.useOrEquipItem(i);
            }
            invContainer.appendChild(slot);
        }

        // Equipment
        document.getElementById('slot-weapon').querySelector('.slot-item').innerText = p.equipment.weapon ? p.equipment.weapon.name : '-';
        document.getElementById('slot-armor').querySelector('.slot-item').innerText = p.equipment.armor ? p.equipment.armor.name : '-';
        p.equipment.accessory.forEach((acc, i) => {
            const el = document.getElementById(`slot-accessory-${i + 1}`);
            if (el) el.querySelector('.slot-item').innerText = acc ? acc.name : '-';
        });

        // Save Button Visibility: Only in Town (not in Battle/Dungeon)
        const saveBtn = document.getElementById('btn-manual-save');
        const dgCounter = document.getElementById('dg-counter');
        const isDungeon = document.body.classList.contains('in-dungeon') || this.currentBattle;

        if (saveBtn) saveBtn.style.display = isDungeon ? 'none' : 'block';
        if (dgCounter) {
            dgCounter.style.display = isDungeon ? 'none' : 'block';
            const used = this.gameState.world.dungeonDayUsed;
            dgCounter.innerText = `던전: ${used ? '1' : '0'}/1`;
            dgCounter.classList.toggle('used', used);
        }
    }

    updateStats() {
        const p = this.gameState.player;
        p.atk = 10 + (p.level - 1) * 2 + (p.equipment.weapon ? p.equipment.weapon.atk : 0);
        p.def = 5 + (p.level - 1) * 1 + (p.equipment.armor ? p.equipment.armor.def : 0);
    }

    /**
     * 마을 메인 행동 메뉴 렌더링 (던전 입장 / 마을 활동 / 다른 마을 이동)
     */
    renderTownActions() {
        const w = this.gameState.world; const p = this.gameState.player;
        const town = GAME_DATA.TOWNS.find(t => t.id === w.currentLocation);
        const panel = document.getElementById('action-panel');
        panel.innerHTML = '';
        if (!town) return;

        // 1. 던전 입장 버튼
        const dgBtn = document.createElement('button');
        dgBtn.innerText = '던전 입장';
        dgBtn.onclick = () => this.enterDungeon();
        panel.appendChild(dgBtn);

        // 2. 마을 활동 버튼 (상점, 여관 등 내부 시설)
        const townBtn = document.createElement('button');
        townBtn.innerText = '마을 활동';
        townBtn.onclick = () => this.renderBuildingActions();
        panel.appendChild(townBtn);

        // 3. 해금된 다른 마을로의 이동 버튼들
        GAME_DATA.TOWNS.forEach(t => {
            if (t.id !== w.currentLocation && p.unlockedTowns.includes(t.id)) {
                const btn = document.createElement('button');
                btn.className = 'secondary';
                btn.innerText = `이동: ${t.name}`;
                btn.onclick = () => this.travelTo(t.id);
                panel.appendChild(btn);
            }
        });
    }


    renderBuildingActions() {
        const w = this.gameState.world;
        const town = GAME_DATA.TOWNS.find(t => t.id === w.currentLocation);
        const panel = document.getElementById('action-panel');
        panel.innerHTML = '';

        // Requested Order: 여관 / 상점 / 대장간 / 연금술 실험실 / 수련장 / 골동품 가게 / 일일 퀘스트 / 마을 기부
        const order = ['inn', 'shop', 'blacksmith', 'alchemy', 'training', 'antique', 'quest', 'donation'];

        order.forEach(b => {
            if (town.buildings.includes(b)) {
                const btn = document.createElement('button');
                btn.innerText = this.getBuildingName(b);
                btn.onclick = () => this.openBuilding(b);
                panel.appendChild(btn);
            }
        });

        // Back button
        const backBtn = document.createElement('button');
        backBtn.className = 'secondary';
        backBtn.innerText = '뒤로 가기';
        backBtn.onclick = () => this.renderTownActions();
        panel.appendChild(backBtn);
    }

    getBuildingName(b) {
        const names = {
            'shop': '상점',
            'inn': '여관',
            'dungeon': '던전 입장',
            'donation': '마을 기부',
            'quest': '일일 퀘스트',
            'alchemy': '연금술 실험실',
            'training': '수련장',
            'blacksmith': '대장간',
            'antique': '골동품 가게'
        };
        return names[b] || b;
    }


    handleBuildingClick(b) {
        if (b === 'inn') this.openInn();
        else if (b === 'shop') this.openShop();
        else if (b === 'dungeon') this.enterDungeon();
        else if (b === 'blacksmith') this.openBlacksmith();
        else this.log(`${this.getBuildingName(b)}은(는) 구현 중입니다.`, 'system');
    }

    travelTo(id) {
        this.gameState.world.currentLocation = id;
        const name = GAME_DATA.TOWNS.find(t => t.id === id).name;
        this.log(`--- ${name} 이동 완료 ---`, 'location-change');
        this.updateUI(); this.renderTownActions();
    }

    openInn() {
        const w = this.gameState.world; const p = this.gameState.player;
        const cost = Math.floor(20 * w.inflation);
        this.showModal('여관', `
            <p>휴식을 취하면 HP/MP가 회복됩니다. (비용: ${cost} G)</p>
            <p><small>* 다음 날로 진행하며 세금이 발생합니다.</small></p>
            <button onclick="game.rest(${cost})">휴식하기</button>
        `);
    }

    rest(cost) {
        const p = this.gameState.player; const w = this.gameState.world;
        if (p.gold < cost) { alert('골드 부족'); return; }
        p.gold -= cost; p.hp = p.hpMax; p.mp = p.mpMax; w.day++; w.dungeonDayUsed = false;
        const tax = Math.floor(p.gold * 0.02); p.gold -= tax; w.inflation *= 1.005;
        this.log(`하루가 지났습니다. 세금 ${tax} G가 차감되었습니다.`, 'lose');
        this.closeModal(); this.updateUI(); this.renderTownActions();
    }

    openShop() {
        if (!this.purchasedInSession) this.purchasedInSession = new Set();
        const tier = GAME_DATA.TOWNS.find(t => t.id === this.gameState.world.currentLocation).tier;
        const inf = this.gameState.world.inflation;
        let h = '<div class="shop-container">';
        const renderGroup = (title, items, cat) => {
            h += `<h3>${title}</h3><div class="shop-grid">`;
            items.filter(i => (i.tier || 0) <= tier).forEach(it => {
                const pr = Math.floor(it.price * inf);
                const isBought = (cat !== 'CONSUMABLES' && this.purchasedInSession.has(it.id));
                h += `
                    <div class="shop-item">
                        <div class="shop-item-info">
                            <span class="shop-item-name">${it.name}</span>
                            <span class="shop-item-detail">${it.atk ? 'ATK+' + it.atk : (it.def ? 'DEF+' + it.def : (it.hp ? 'HP+' + it.hp : 'MP+' + it.mp))}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span class="shop-item-price">${pr}G</span>
                            <button onclick="game.buyItem('${cat}', '${it.id}')" ${isBought ? 'disabled' : ''}>${isBought ? '구매 완료' : '구매'}</button>
                        </div>
                    </div>`;
            });
            h += '</div>';
        }
        renderGroup('무기', GAME_DATA.ITEMS.WEAPONS, 'WEAPONS');
        renderGroup('방어구', GAME_DATA.ITEMS.ARMORS, 'ARMORS');
        renderGroup('소모품', GAME_DATA.ITEMS.CONSUMABLES, 'CONSUMABLES');
        this.showModal('상점', h + '</div>');
    }

    buyItem(cat, id) {
        const p = this.gameState.player; const it = GAME_DATA.ITEMS[cat].find(i => i.id === id);
        const pr = Math.floor(it.price * this.gameState.world.inflation);
        if (p.gold < pr) { alert('골드 부족'); return; }
        if (p.inventory.length >= 30) { alert('가방 가득 참'); return; }
        p.gold -= pr; p.inventory.push({ ...it, category: cat });
        if (cat === 'WEAPONS' || cat === 'ARMORS') this.purchasedInSession.add(id);
        this.log(`${it.name}을(를) 구매했습니다.`, 'gain'); this.updateUI(); this.openShop();
    }

    openBuilding(b) {
        if (b === 'shop') this.purchasedInSession = new Set();
        this.handleBuildingClick(b);
    }


    useOrEquipItem(i) {
        const p = this.gameState.player; const it = p.inventory[i];
        if (it.category === 'CONSUMABLES') {
            if (it.hp) p.hp = Math.min(p.hpMax, p.hp + it.hp);
            if (it.mp) p.mp = Math.min(p.mpMax, p.mp + it.mp);
            p.inventory.splice(i, 1);
        } else if (it.category === 'WEAPONS') {
            const old = p.equipment.weapon; p.equipment.weapon = it; p.inventory.splice(i, 1);
            if (old) p.inventory.push(old);
        } else if (it.category === 'ARMORS') {
            const old = p.equipment.armor; p.equipment.armor = it; p.inventory.splice(i, 1);
            if (old) p.inventory.push(old);
        }
        this.updateStats(); this.updateUI();
    }

    enterDungeon() {
        const w = this.gameState.world; const t = GAME_DATA.TOWNS.find(t => t.id === w.currentLocation);
        if (w.dungeonDayUsed) { this.log('하루에 한 번만 가능합니다.', 'system'); return; }
        document.body.classList.add('in-dungeon');
        w.dungeonDayUsed = true;
        this.log(`--- ${t.dungeon.name} 진입 ---`, 'location-change');
        this.exploreLoop(t.dungeon, 0);
        this.updateUI();
    }

    exploreLoop(dg, step) {
        // 보스 방 도착 체크
        if (step >= 5) { 
            this.log('보스 방 도착!', 'system'); 
            this.startBattle(dg, true); 
            return; 
        }
        
        const p = document.getElementById('action-panel');
        // 탐험 옵션 구성: 전진, 휴식, 귀환
        p.innerHTML = `
            <button onclick="game.nextEvent('${dg.id}', ${step})">전진 (${step + 1}/5)</button>
            <button onclick="game.dungeonRest('${dg.id}', ${step})">휴식</button>
            <button class="secondary" onclick="game.exitDungeon()">귀환</button>
        `;
    }

    /**
     * 던전 내 휴식 기능
     * 소량의 HP/MP를 회복하지만, 일정 확률로 적의 기습을 받을 수 있습니다.
     */
    dungeonRest(dgId, step) {
        const p = this.gameState.player;
        const dg = GAME_DATA.TOWNS.find(t => t.id === this.gameState.world.currentLocation).dungeon;
        
        // 30% 확률로 적의 기습 발생
        if (Math.random() < 0.3) {
            this.log('--- ! 기습 발생 ! ---', 'death-notice');
            this.log('휴식 중에 몬스터의 기습을 받았습니다.', 'lose');
            this.startBattle(dg, false, step);
        } else {
            // 휴식 성공 시 HP/MP 15% 회복
            const recoverHP = Math.floor(p.hpMax * 0.15);
            const recoverMP = Math.floor(p.mpMax * 0.15);
            p.hp = Math.min(p.hpMax, p.hp + recoverHP);
            p.mp = Math.min(p.mpMax, p.mp + recoverMP);
            
            this.log('조심스럽게 휴식을 취했습니다.', 'system');
            this.log(`HP +${recoverHP}, MP +${recoverMP} 회복 완료.`, 'gain');
            this.updateUI();
            // 휴식 후 다시 루프 표시
            this.exploreLoop(dg, step);
        }
    }


    exitDungeon() {
        document.body.classList.remove('in-dungeon');
        this.log('--- 마을 귀환 완료 ---', 'location-change');
        this.renderTownActions();
        this.updateUI();
    }


    /**
     * 던전 탐험 진행 (랜덤 이벤트 발생: 전투/보물/조용함)
     */
    nextEvent(dId, step) {
        const r = Math.random(); 
        const dg = GAME_DATA.TOWNS.find(t => t.id === this.gameState.world.currentLocation).dungeon;
        
        if (r < 0.6) {
            // 60% 확률로 몬스터 조우
            this.startBattle(dg, false, step);
        } else if (r < 0.75) {
            // 15% 확률로 보물상자 발견
            const g = Math.floor(Math.random() * 50 * (step + 1)); 
            this.gameState.player.gold += g;
            this.log(`보물상자! ${g} Gold 획득.`, 'gain'); 
            this.updateUI(); 
            this.exploreLoop(dg, step + 1);
        } else {
            // 25% 확률로 아무 일도 일어나지 않음
            this.log('길이 고요합니다.', 'system'); 
            this.exploreLoop(dg, step + 1); 
        }
    }


    startBattle(dg, isB, step) {
        const pool = GAME_DATA.MONSTERS[dg.id];
        let m = isB ? { ...pool.find(m => m.isBoss) } : { ...pool.filter(n => !n.isBoss)[Math.floor(Math.random() * (pool.length - 1))] };
        if (!isB && Math.random() < 0.1) {
            const mut = GAME_DATA.MUTANTS[Math.floor(Math.random() * GAME_DATA.MUTANTS.length)];
            m.name = mut.prefix + ' ' + m.name; if (mut.hpMult) m.hp *= mut.hpMult; if (mut.atkMult) m.atk *= mut.atkMult;
        }
        m.hpMax = m.hp; // Store max HP for UI
        this.currentBattle = { monster: m, isBoss: isB, step, dungeon: dg };
        
        // Show Monster UI
        const mStatus = document.getElementById('monster-status');
        mStatus.classList.remove('hidden');
        document.getElementById('monster-name').innerText = m.name;
        this.updateMonsterUI();
        
        this.log(`<strong>${m.name}</strong> 출현!`, 'lose');
        this.renderBattleActions();
    }

    updateMonsterUI() {
        const b = this.currentBattle; if (!b) return;
        const m = b.monster;
        document.getElementById('monster-hp-cur').innerText = Math.ceil(Math.max(0, m.hp));
        document.getElementById('monster-hp-max').innerText = Math.ceil(m.hpMax);
        document.getElementById('monster-hp-bar').style.width = (Math.max(0, m.hp) / m.hpMax * 100) + '%';
    }


    renderBattleActions() {
        const p = document.getElementById('action-panel');
        p.innerHTML = `<button onclick="game.battleTurn()">공격</button>
                       <button class="secondary" onclick="game.tryEscape()">도망</button>`;
    }

    battleTurn() {
        const p = this.gameState.player; const b = this.currentBattle; const m = b.monster;
        let d = Math.max(1, p.atk - m.def);
        if (Math.random() < p.cri / 100) { d *= 2; this.log(`치명타! ${d} 피해!`, 'crit'); }
        else this.log(`${m.name}에게 ${d} 피해.`);
        m.hp -= d;
        this.updateMonsterUI();

        if (m.hp <= 0) {
            this.victory(m.name, b.isBoss);
            document.getElementById('monster-status').classList.add('hidden');
            if (b.isBoss) {
                document.body.classList.remove('in-dungeon');
                this.currentBattle = null;
                this.renderTownActions();
            } else {
                this.exploreLoop(b.dungeon, b.step + 1);
            }
            this.updateUI();
            return;
        }

        let md = Math.max(1, m.atk - p.def); p.hp -= md; this.log(`${m.name}의 공격! ${md} 피해.`, 'lose');
        if (p.hp <= 0) this.death();
        this.updateUI();
    }

    victory(mN, isB) {
        const p = this.gameState.player; const m = Object.values(GAME_DATA.MONSTERS).flat().find(x => x.name === mN.split(' ').pop());
        const xp = m.xp; const g = m.gold; p.xp += xp; p.gold += g;
        this.log(`${mN} 처치!`, 'victory');
        this.log(`${xp} XP, ${g} G 획득.`, 'gain');
        if (p.xp >= p.xpNext) this.levelUp();
        if (isB) {
            const curr = GAME_DATA.TOWNS.find(t => t.id === this.gameState.world.currentLocation);
            const next = GAME_DATA.TOWNS[GAME_DATA.TOWNS.indexOf(curr) + 1];
            if (next && !p.unlockedTowns.includes(next.id)) { p.unlockedTowns.push(next.id); this.log(`${next.name} 해금!`, 'system'); }
        }
        this.updateUI();
    }

    levelUp() {
        const p = this.gameState.player; p.level++; p.xp -= p.xpNext; p.xpNext = Math.floor(p.xpNext * 1.5);
        p.hpMax += 20; p.mpMax += 10; p.hp = p.hpMax; p.mp = p.mpMax; this.updateStats();
        this.log(`LEVEL UP! ${p.level} 레벨 달성!`, 'system');
    }

    /**
     * 사망 시 처리: 골드 유실 및 HP/MP 전계 회복 후 마을 귀환
     */
    death() {
        const p = this.gameState.player; const lg = Math.floor(p.gold * 0.2);
        p.gold -= lg; p.hp = p.hpMax; p.mp = p.mpMax;
        
        this.log('--- 치명적 패배 ---', 'death-notice');
        this.log(`${lg} G를 유실하고 근처 마을에서 치료를 받아 부활했습니다.`, 'lose');
        
        document.body.classList.remove('in-dungeon');
        document.getElementById('monster-status').classList.add('hidden');
        this.currentBattle = null;
        this.renderTownActions(); 
        this.updateUI();
    }


    tryEscape() {
        if (Math.random() < 0.5) {
            this.log('탈출 성공!', 'system');
            document.body.classList.remove('in-dungeon');
            document.getElementById('monster-status').classList.add('hidden');
            this.currentBattle = null;
            this.renderTownActions();
            this.updateUI();
        }
        else { this.log('탈출 실패!', 'lose'); this.battleTurn(); }
    }

    openBlacksmith() {
        const eq = this.gameState.player.equipment;
        const target = eq.weapon || eq.armor;
        if (!target) { this.showModal('대장간', '<p>장착 중인 장비가 없습니다.</p>'); return; }
        const cost = Math.floor(100 * (target.tier || 1) * this.gameState.world.inflation);
        this.showModal('대장간', `<p>${target.name} 강화 (비용: ${cost} G)</p><button onclick="game.reinforce()">강화하기</button>`);
    }

    reinforce() {
        const p = this.gameState.player; const eq = p.equipment;
        const target = eq.weapon || eq.armor;
        const cost = Math.floor(100 * (target.tier || 1) * this.gameState.world.inflation);
        if (p.gold < cost) { alert('골드 부족'); return; }
        p.gold -= cost;
        if (Math.random() < 0.7) {
            if (target.atk) target.atk = Math.floor(target.atk * 1.2);
            if (target.def) target.def = Math.floor(target.def * 1.2);
            target.name += '+'; this.log(`${target.name} 강화 성공!`, 'gain');
        } else { this.log('강화 실패...', 'lose'); }
        this.updateStats(); this.updateUI(); this.closeModal();
    }

    showModal(t, b) { document.getElementById('modal-title').innerText = t; document.getElementById('modal-body').innerHTML = b; document.getElementById('game-modal').classList.remove('hidden'); }
    closeModal() { document.getElementById('game-modal').classList.add('hidden'); }
}

const game = new Game();
