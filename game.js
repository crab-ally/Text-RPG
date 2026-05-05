/**
 * Void Abyss - 핵심 게임 엔진 스크립트
 * 획득한 장비, 레벨, 골드 등 모든 게임 진행 데이터와 
 * 전투, 상점, 탐험 로직을 관리합니다.
 */

class Game {
    constructor() {
        /**
         * gameState: 게임의 모든 영구 데이터를 보관하는 중앙 상태 객체입니다.
         * 플레이어의 스탯, 장비, 인벤토리, 그리고 세계관 정보(날짜, 위치 등)를 포함합니다.
         */
        this.gameState = {
            player: {
                job: '초보자', mag: 0,                   // 직업 및 마력
                level: 1, xp: 0, xpNext: 80,               // 레벨 및 경험치 시스템
                hp: 120, hpMax: 120, mp: 60, mpMax: 60,    // 생명력 및 마력
                atk: 10, def: 5, cri: 5, eva: 5, gold: 500, // 전투 스탯 및 재화
                equipment: { weapon: null, armor: null, accessory: [null, null, null] }, // 장착 장비
                inventory: [], skills: [], invMax: 10,       // 소지 아이템, 스킬, 가방 최대 칸수
                defeatedMidBosses: {},                     // { zoneId: { defeated: bool, day: number } }
                unlockedTowns: ['town1'],                  // 해금된 마을 리스트
                monsterEncyclopedia: {},                    // 몬스터 도감 데이터
                unlockedRecipes: [],                        // 사용 완료된 레시피 (하얀색 표시)
                discoveredRecipes: [],                      // 보유 중인 레시피 (노란색 표시)
                materials: {},                              // 몬스터 전리품 인벤토리
                activeStatusEffects: [],                    // [NEW] 플레이어 상시 상태이상 (전투 외에도 유지될 수 있음)
                skillLevels: {}                             // [NEW] 스킬별 강화 수치 (id: level)
            },
            world: {
                currentLocation: 'town1', day: 1, inflation: 1.0, // 현재 장소, 날짜, 물가 상승률
                dungeonDayUsed: false, losses: [],                  // 던전 이용 여부 및 유실물 데이터
                quests: {}                                          // 마을별 의뢰 데이터 (townId: { hunt, collect })
            }
        };
        this.currentBattle = null; // 현재 진행 중인 전투 정보 (전투 중이 아닐 때는 null)
        this.dungeonRestCount = 0; // 던전 내 휴식 횟수 추적
        this.init();
    }


    /**
     * 게임 초기화: 이벤트 리스너 설정 및 초기 UI 렌더링
     */
    init() {
        this.setupEventListeners();
        this.recalculateMaxStats();
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


    /**
     * 저장 슬롯 선택 화면을 표시합니다.
     */
    showSlotSelection() {
        document.getElementById('initial-menu').classList.add('hidden');
        document.getElementById('slot-selection').classList.remove('hidden');
        this.renderLoadSlots();
    }

    /**
     * 슬롯 선택 화면을 숨기고 초기 메뉴로 돌아갑니다.
     */
    hideSlotSelection() {
        document.getElementById('slot-selection').classList.add('hidden');
        document.getElementById('initial-menu').classList.remove('hidden');
    }

    /**
     * 로컬 스토리지에서 각 슬롯의 세이브 데이터를 확인하여 슬롯 목록을 렌더링합니다.
     */
    renderLoadSlots() {
        const container = document.getElementById('load-slots-container');
        container.innerHTML = '';
        for (let i = 1; i <= 3; i++) {
            const summary = this.getSlotSummary(i);
            const slotWrapper = document.createElement('div');
            slotWrapper.className = 'slot-wrapper';

            const slot = document.createElement('div');
            slot.className = `slot-card ${!summary ? 'empty' : ''}`;
            if (summary) {
                slot.innerHTML = `
                    <div class="slot-number">SLOT ${i}</div>
                    <div class="slot-lv">LV ${summary.level}</div>
                    <div class="slot-job">${summary.job}</div>
                    <div class="slot-loc">${summary.location}</div>
                `;
                slot.onclick = () => this.startGame(true, i);

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'slot-delete-btn';
                deleteBtn.innerText = '삭제';
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.deleteGame(i, 'load');
                };
                slotWrapper.appendChild(slot);
                slotWrapper.appendChild(deleteBtn);
            } else {
                slot.innerHTML = `<div class="slot-empty-text">비어 있음</div>`;
                slotWrapper.appendChild(slot);
            }
            container.appendChild(slotWrapper);
        }
    }

    /**
     * 진행 중인 게임에서 세이브 모달을 엽니다.
     */
    openSaveModal() {
        let h = '<div class="slots-container">';
        for (let i = 1; i <= 3; i++) {
            const summary = this.getSlotSummary(i);
            h += `
                <div class="slot-wrapper">
                    <div class="slot-card ${!summary ? 'empty' : ''}" onclick="game.saveGame(${i})">
                        <div class="slot-number">SLOT ${i}</div>
                        ${summary ? `<div class="slot-lv">LV ${summary.level}</div><div class="slot-job">${summary.job}</div><div class="slot-loc">${summary.location}</div>` : '<div class="slot-empty-text">덮어쓰기</div>'}
                    </div>
                    ${summary ? `<button class="slot-delete-btn" onclick="event.stopPropagation(); game.deleteGame(${i}, 'save')">삭제</button>` : ''}
                </div>
            `;
        }
        h += '</div>';
        this.showModal('저장할 슬롯 선택', h);
    }

    /**
     * 일반적인 DOM 이벤트 리스너를 설정합니다. (예: 모달 닫기 버튼)
     */
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
     * 특정 슬롯의 세이브 데이터를 삭제합니다.
     */
    deleteGame(slot, context) {
        if (confirm(`슬롯 ${slot}의 데이터를 정말 삭제하시겠습니까?`)) {
            localStorage.removeItem(`void_abyss_save_${slot}`);
            this.log(`슬롯 ${slot}의 데이터가 삭제되었습니다.`, 'system');
            if (context === 'load') this.renderLoadSlots();
            else if (context === 'save') this.openSaveModal();
        }
    }

    /**
     * 특정 슬롯에서 데이터 불러오기
     */
    loadGame(slot) {
        const saved = localStorage.getItem(`void_abyss_save_${slot}`);
        if (saved) {
            try {
                this.gameState = JSON.parse(saved);
                // [NEW] 기존 세이브 데이터에 skillLevels가 없는 경우 초기화
                if (!this.gameState.player.skillLevels) {
                    this.gameState.player.skillLevels = {};
                }
            } catch (e) { console.error("Save load failed", e); }
        }
    }


    /**
     * 세이브 슬롯의 요약 정보(레벨, 위치)를 가져옵니다.
     * 슬롯 선택 UI에서 정보를 미리 보여주기 위해 사용됩니다.
     */
    getSlotSummary(slot) {
        const saved = localStorage.getItem(`void_abyss_save_${slot}`);
        if (!saved) return null;
        try {
            const data = JSON.parse(saved);
            const town = GAME_DATA.TOWNS.find(t => t.id === data.world.currentLocation);
            return {
                level: data.player.level,
                job: data.player.job || '초보자',
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
        entry.innerHTML = `${msg}`;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
        // 로그 개수 제한하여 성능 최적화
        while (log.children.length > 30) log.removeChild(log.firstChild);
    }


    /**
     * 모든 UI 요소를 현재 게임 상태에 맞게 새로고침합니다.
     * 플레이어 스탯 바, 골드, 날짜, 인벤토리, 장착 아이템 등을 포함합니다.
     */
    updateUI() {
        const p = this.gameState.player; const w = this.gameState.world;
        this.invalidateStaleDailyQuest();

        // 상단 캐릭터 바 업데이트
        document.getElementById('player-level').innerText = p.level;
        document.getElementById('player-gold').innerText = Math.floor(p.gold).toLocaleString();
        document.getElementById('game-day').innerText = w.day;

        // 직업 및 공격력/마력 텍스트 업데이트
        const jobEl = document.getElementById('player-job');
        if (jobEl) {
            p.job = p.job || '초보자';
            jobEl.innerText = p.job;
            jobEl.className = p.job === '전사' ? 'job-warrior' : (p.job === '마법사' ? 'job-mage' : '');
        }
        const atkLabel = document.getElementById('stat-atk-label');
        if (atkLabel) atkLabel.innerText = p.job === '마법사' ? '마력' : '공격력';

        // 스탯 바 (HP/MP/XP) 업데이트
        document.getElementById('hp-cur').innerText = Math.ceil(p.hp);
        document.getElementById('hp-max').innerText = p.hpMax;
        document.getElementById('mp-cur').innerText = Math.ceil(p.mp);
        document.getElementById('mp-max').innerText = p.mpMax;
        document.getElementById('stat-atk').innerText = p.job === '마법사' ? (p.mag || 0) : p.atk;
        document.getElementById('stat-def').innerText = p.def;
        document.getElementById('stat-cri').innerText = p.cri + '%';
        document.getElementById('stat-eva').innerText = p.eva + '%';

        // 상태이상 리스트 표시
        this.renderStatusEffects();

        document.getElementById('hp-bar').style.width = (p.hp / p.hpMax * 100) + '%';
        document.getElementById('mp-bar').style.width = (p.mp / p.mpMax * 100) + '%';
        document.getElementById('xp-bar').style.width = (p.xp / p.xpNext * 100) + '%';
        document.getElementById('xp-cur').innerText = Math.floor(p.xp);
        document.getElementById('xp-max').innerText = p.xpNext;

        // 현재 위치 정보
        const town = GAME_DATA.TOWNS.find(t => t.id === w.currentLocation);
        document.getElementById('current-location').innerText = town ? town.name : '알 수 없음';

        // 인벤토리 목록 렌더링
        const invContainer = document.getElementById('inventory-list');
        document.getElementById('inv-cur').innerText = p.inventory.reduce((acc, it) => acc + (it.count || 1), 0);
        document.querySelector('.inv-count').innerHTML = `<span id="inv-cur">${p.inventory.length}</span>/${p.invMax}`;
        invContainer.innerHTML = '';

        for (let i = 0; i < p.invMax; i++) {
            const slot = document.createElement('div');
            slot.className = 'inv-item';
            if (p.inventory[i]) {
                const it = p.inventory[i];
                const plusText = it.plus > 0 ? ` +${it.plus}` : '';
                const effectText = it.category === 'CONSUMABLES' ? `<span class="inv-item-effect">${it.hp ? 'H+' + it.hp : (it.mp ? 'M+' + it.mp : '')}</span>` : '';
                const gradeClass = it.grade ? this.getGradeClass(it.grade) : '';
                slot.innerHTML = `
                    <span class="inv-item-name ${gradeClass}">${it.name}${plusText}</span>
                    ${effectText}
                    ${it.count > 1 ? `<span class="inv-item-count">${it.count}</span>` : ''}
                `;
                slot.onclick = () => this.useOrEquipItem(i);
            }
            invContainer.appendChild(slot);
        }

        // 장착 장비 칸 업데이트
        const weapon = p.equipment.weapon;
        const armor = p.equipment.armor;

        const setSlotItem = (elId, item) => {
            const el = document.getElementById(elId).querySelector('.slot-item');
            el.innerText = item ? `${item.name} ${item.plus > 0 ? '+' + item.plus : ''}` : '-';
            el.className = 'slot-item';
            if (item && item.grade) {
                const gradeClass = this.getGradeClass(item.grade);
                if (gradeClass) el.classList.add(gradeClass);
            }
        };

        setSlotItem('slot-weapon', weapon);
        setSlotItem('slot-armor', armor);

        p.equipment.accessory.forEach((acc, i) => {
            const elId = `slot-accessory-${i + 1}`;
            setSlotItem(elId, acc);
        });

        // 저장 버튼 및 던전 카운터 노출 여부 관리 (마을에서만 저장 가능)
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

        this.renderDailyQuestHeader();
    }

    /**
     * 날짜·마을 변경 등으로 무효화된 일일 퀘스트를 제거합니다.
     */
    invalidateStaleDailyQuest() {
        const w = this.gameState.world;
        const curDay = w.day;

        // 1. 데이터 구조 마이그레이션 (전역 슬롯 -> 마을별 슬롯)
        if (!w.quests || w.quests.hunt !== undefined || w.quests.collect !== undefined) {
            const oldQuests = w.quests || { hunt: w.quest, collect: null };
            w.quests = {};
            GAME_DATA.TOWNS.forEach(t => { w.quests[t.id] = { hunt: null, collect: null }; });

            if (oldQuests.hunt && oldQuests.hunt.day === curDay) {
                const tid = oldQuests.hunt.townId || 'town1';
                if (w.quests[tid]) w.quests[tid].hunt = oldQuests.hunt;
            }
            if (oldQuests.collect && oldQuests.collect.day === curDay) {
                const tid = oldQuests.collect.townId || 'town1';
                if (w.quests[tid]) w.quests[tid].collect = oldQuests.collect;
            }
            delete w.quest;
        }

        // 2. 만료된 의뢰 정리 (마을 이동 여부와 관계없이 날짜 기준)
        Object.keys(w.quests).forEach(tId => {
            ['hunt', 'collect'].forEach(type => {
                const q = w.quests[tId][type];
                if (q && q.day < curDay) {
                    w.quests[tId][type] = null;
                }
            });
        });
    }

    /**
     * 등급에 해당하는 CSS 클래스명을 반환합니다.
     */
    getGradeClass(grade) {
        const mapping = {
            '일반': 'grade-common', '고급': 'grade-high', '레어': 'grade-rare',
            '영웅': 'grade-hero', '전설': 'grade-legend', '신화': 'grade-mythic',
            '초월': 'grade-transcend', '희석': 'grade-common', '약함': 'grade-high',
            '농축': 'grade-rare', '고농축': 'grade-hero', '극농축': 'grade-legend',
            '순수': 'grade-mythic'
        };
        return mapping[grade] || '';
    }

    /**
     * 전투 중 표시되는 몬스터 이름에서 뮤턴트 접두를 떼어, 일일 퀘스트 목표 이름과 비교할 수 있게 합니다.
     */
    stripMutantMonsterName(displayName) {
        if (!displayName) return '';
        for (const mut of GAME_DATA.MUTANTS) {
            const pre = mut.prefix + ' ';
            if (displayName.startsWith(pre)) return displayName.slice(pre.length);
        }
        return displayName;
    }

    /** 일일 퀘스트 보상이 골드인지 (구세이브: type, 신규: rewardType) */
    questRewardIsGold(reward) {
        if (!reward) return false;
        return reward.rewardType === 'gold' || reward.type === 'gold';
    }

    /**
     * 헤더(저장 버튼 옆)에 일일 퀘스트 요약·진행도를 표시합니다.
     */
    renderDailyQuestHeader() {
        const qh = document.getElementById('daily-quest-header');
        if (!qh) return;

        const p = this.gameState.player;
        const w = this.gameState.world;
        qh.onclick = null; qh.onkeydown = null;

        this.invalidateStaleDailyQuest();

        // 모든 마을에서 활성화된 의뢰 수집 (최대 3개 표시)
        const activeQuests = [];
        Object.keys(w.quests).forEach(tId => {
            const t = w.quests[tId];
            if (t.hunt && !t.hunt.claimed) activeQuests.push(t.hunt);
            if (t.collect && !t.collect.claimed) activeQuests.push(t.collect);
        });

        if (activeQuests.length === 0) {
            qh.className = 'daily-quest-header daily-quest-header--idle';
            qh.title = '의뢰 진행 (표시 전용) — 마을 의뢰소에서 수락';
            qh.innerHTML = `
                <div class="dq-row"><span class="dq-tag">의뢰</span><span class="dq-main">없음</span></div>
                <span class="dq-status" style="color:var(--text-dim);font-weight:400;">마을 의뢰소에서 수락</span>
            `;
            return;
        }

        qh.className = 'daily-quest-header';
        qh.title = '진행 중인 의뢰 (전체 마을 통합)';

        let html = '';
        activeQuests.slice(0, 3).forEach(q => {
            const isCollect = q.type === 'collect';
            let currentCount = q.currentCount;
            if (isCollect) {
                const material = p.inventory.find(it => it.name === q.itemName && it.category === 'MATERIAL');
                currentCount = material ? material.count : 0;
            }

            const townName = (GAME_DATA.TOWNS.find(t => t.id === q.townId)?.name || '마을').slice(0, 4);
            const isReady = q.completed || (isCollect && currentCount >= q.targetCount);
            const readyTag = isReady ? '<span style="color:var(--gold-color); margin-left:4px;">!</span>' : '';

            html += `
                <div class="dq-row">
                    <span class="dq-tag">${isCollect ? '수집' : '처치'}</span>
                    <span class="dq-main">(${townName}) ${isCollect ? q.itemName : q.monsterName}${readyTag}</span>
                    <span class="dq-count">${currentCount}/${q.targetCount}</span>
                </div>
            `;
        });

        if (activeQuests.length > 3) {
            html += `<div style="font-size:0.6rem; text-align:right; opacity:0.6;">외 ${activeQuests.length - 3}건 더 있음</div>`;
        }

        qh.innerHTML = html;
    }

    /**
     * 플레이어의 최종 공격력과 방어력을 계산합니다.
     * 레벨 보너스와 장착 장비의 기본 스탯 + 강화 수치(복리 적용), 직업 보정, 패시브 효과를 합산합니다.
     */
    updateStats() {
        const p = this.gameState.player;
        p.job = p.job || '초보자';

        const getEqStat = (it, stat) => {
            if (!it || !it[stat]) return 0;
            const plus = it.plus || 0;
            return Math.floor(it[stat] * Math.pow(1.12, plus));
        };

        let baseAtk = 10 + (p.level - 1) * 3 + getEqStat(p.equipment.weapon, 'atk') + getEqStat(p.equipment.armor, 'atk');
        let baseDef = 5 + (p.level - 1) * 2 + getEqStat(p.equipment.weapon, 'def') + getEqStat(p.equipment.armor, 'def');

        p.atk = baseAtk;
        p.def = baseDef;
        p.cri = 5;
        p.eva = 5;
        p.mag = 0;

        // 직업별 기본 보정 및 패시브
        if (p.job === '전사') {
            p.def = Math.floor(p.def * 1.35);
            p.eva = Math.max(0, p.eva - 5);

            // 투쟁심 (Lv 60) - 공 20% + 강화당 4%, 치명타 15% + 강화당 4%
            if (p.level >= 60 && (p.hp / p.hpMax) <= 0.5) {
                const rLv = p.skillLevels['ws6'] || 0;
                p.atk = Math.floor(p.atk * (1.2 + rLv * 0.04));
                p.cri += (15 + rLv * 4);
            }
        } else if (p.job === '마법사') {
            p.mag = p.atk; // 공격력 -> 마력 치환
            p.atk = 0;
            p.def = Math.floor(p.def * 0.75);

            // 집중 (Lv 60) - 마력 15% + 강화당 4%, 치명타 15% + 강화당 4%
            if (p.level >= 60 && (p.mp / p.mpMax) >= 0.7) {
                const rLv = p.skillLevels['ms6'] || 0;
                p.mag = Math.floor(p.mag * (1.15 + rLv * 0.04));
                p.cri += (15 + rLv * 4);
            }
        }

        // 전투 중 버프 및 상태이상 효과 적용
        if (this.currentBattle) {
            if (this.currentBattle.activeBuffs) {
                this.currentBattle.activeBuffs.forEach(b => {
                    if (b.type === 'berserk') { p.atk = Math.floor(p.atk * 1.5); p.eva = 0; }
                    if (b.type === 'phaseShift') { p.cri += 50; p.eva = 100; }
                    if (b.type === 'ironWall') { p.def = Math.floor(p.def * 1.5); }
                });
            }

            // 플레이어 상태이상 효과 적용
            if (this.currentBattle.playerStatusEffects) {
                this.currentBattle.playerStatusEffects.forEach(s => {
                    if (s.type === 'fear') p.atk = Math.floor(p.atk * 0.75);
                    if (s.type === 'weaken') p.def = Math.floor(p.def * 0.75);
                    if (s.type === 'slow') p.eva = Math.max(0, p.eva - 10);
                });
            }
        }
    }

    /**
     * 상태이상 데이터를 정의합니다.
     */
    static STATUS_EFFECT_DATA = {
        'bleeding': { name: '출혈', effect: '매 턴 최대 체력의 4% 감소', class: 'status-dot' },
        'burn': { name: '화상', effect: '매 턴 최대 체력의 4% 감소', class: 'status-dot' },
        'poison': { name: '중독', effect: '매 턴 최대 체력의 2% 감소', class: 'status-dot' },
        'curse': { name: '저주', effect: '매 턴 최대 체력의 5% 감소', class: 'status-dot' },
        'stun': { name: '기절', effect: '행동 불능', class: 'status-cc' },
        'sleep': { name: '수면', effect: '행동 불능', class: 'status-cc' },
        'freeze': { name: '빙결', effect: '행동 불능', class: 'status-cc' },
        'electrocution': { name: '감전', effect: '행동 불능', class: 'status-cc' },
        'fear': { name: '공포', effect: '공격력 25% 감소', class: 'status-debuff' },
        'weaken': { name: '약화', effect: '방어력 25% 감소', class: 'status-debuff' },
        'slow': { name: '둔화', effect: '회피율 10% 감소', class: 'status-debuff' }
    };

    /**
     * 플레이어와 몬스터의 상태이상을 화면에 렌더링합니다.
     */
    renderStatusEffects() {
        const pList = document.getElementById('player-status-list');
        const mList = document.getElementById('monster-status-list');
        const mContainer = document.getElementById('monster-status-container');
        if (!pList || !mList) return;

        pList.innerHTML = '';
        mList.innerHTML = '';

        // 플레이어 상태이상 렌더링 (버프도 포함하여 렌더링 가능하지만 여기선 상태이상 위주)
        if (this.currentBattle) {
            // 버프 먼저 표시
            if (this.currentBattle.activeBuffs) {
                this.currentBattle.activeBuffs.forEach(b => {
                    const span = document.createElement('span');
                    span.className = 'buff-item';
                    span.innerText = `${b.name} (${b.duration}턴)`;
                    pList.appendChild(span);
                });
            }

            // 상태이상 표시
            if (this.currentBattle.playerStatusEffects) {
                this.currentBattle.playerStatusEffects.forEach(s => {
                    pList.appendChild(this.createStatusItem(s));
                });
            }

            // 몬스터 상태이상 표시
            if (this.currentBattle.monsterStatusEffects) {
                mContainer.style.display = 'block';
                document.getElementById('monster-status-label').innerText = `${this.currentBattle.monster.name}`;
                this.currentBattle.monsterStatusEffects.forEach(s => {
                    mList.appendChild(this.createStatusItem(s));
                });
            } else {
                mContainer.style.display = 'none';
            }
        } else {
            mContainer.style.display = 'none';
        }
    }

    createStatusItem(s) {
        const data = Game.STATUS_EFFECT_DATA[s.type];
        if (!data) return document.createElement('div');

        const div = document.createElement('div');
        div.className = `status-item ${data.class}`;
        div.innerHTML = `
            <div class="status-item-header">
                <span class="status-name status-${s.type}">${data.name}</span>
                <span class="status-turns">${s.duration}T</span>
            </div>
            <div class="status-effect">${data.effect}</div>
        `;
        return div;
    }

    /**
     * [NEW] 플레이어의 최대 HP/MP를 직업, 레벨, 강화 수치에 따라 재계산합니다.
     */
    recalculateMaxStats() {
        const p = this.gameState.player;

        // 기본치: 레벨당 HP 25, MP 12 증가
        let baseHp = 120 + (p.level - 1) * 25;
        let baseMp = 60 + (p.level - 1) * 12;

        // 직업 보너스
        if (p.job === '전사') baseHp = Math.floor(baseHp * 1.35);
        if (p.job === '마법사') baseMp = Math.floor(baseMp * 1.4);

        // 스킬 보너스
        if (p.job === '전사' && p.level >= 20) {
            const rLv = p.skillLevels['ws2'] || 0;
            baseHp = Math.floor(baseHp * (1.2 + rLv * 0.04));
        }
        if (p.job === '마법사' && p.level >= 20) {
            const rLv = p.skillLevels['ms2'] || 0;
            baseMp = Math.floor(baseMp * (1.2 + rLv * 0.04));
        }

        p.hpMax = baseHp;
        p.mpMax = baseMp;
        p.hp = Math.min(p.hp, p.hpMax);
        p.mp = Math.min(p.mp, p.mpMax);
    }

    /**
     * 마을 메인 행동 메뉴 렌더링 (던전 입장 / 의뢰소 / 마을 활동 / 다른 마을 이동)
     * 현재 위치를 기반으로 상호작용 가능한 버튼들을 화면에 표시합니다.
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

        // 2. 의뢰소 버튼
        const questBtn = document.createElement('button');
        questBtn.innerText = '의뢰소';
        questBtn.onclick = () => this.openQuest();
        panel.appendChild(questBtn);

        // 3. 마을 활동 버튼 (상점, 여관 등 내부 시설 목록으로 전환)
        const townBtn = document.createElement('button');
        townBtn.innerText = '마을 활동';
        townBtn.onclick = () => this.renderBuildingActions();
        panel.appendChild(townBtn);

        // 4. 해금된 다른 마을로의 이동 버튼들
        GAME_DATA.TOWNS.forEach(t => {
            if (t.id !== w.currentLocation && p.unlockedTowns.includes(t.id)) {
                const btn = document.createElement('button');
                btn.className = 'secondary';
                const minLevel = Number.parseInt((t.levelRange || '').match(/\d+/)?.[0] || '1', 10);
                btn.innerText = `이동: Lv${minLevel} ${t.name}`;
                btn.onclick = () => this.travelTo(t.id);
                panel.appendChild(btn);
            }
        });
    }


    /**
     * 마을 내부 시설(건물) 버튼들을 렌더링합니다.
     * 상점, 여관, 대장간 등 마을 등급에 따라 해금된 건물들이 표시됩니다.
     */
    renderBuildingActions() {
        const w = this.gameState.world;
        const town = GAME_DATA.TOWNS.find(t => t.id === w.currentLocation);
        const panel = document.getElementById('action-panel');
        panel.innerHTML = '';

        // 건물 정렬 순서 정의
        const order = ['jobCenter', 'inn', 'shop', 'blacksmith', 'alchemy', 'training', 'antique', 'donation'];

        order.forEach(b => {
            const isUnlocked = town.buildings.includes(b);
            if (isUnlocked || b === 'alchemy') {
                const btn = document.createElement('button');
                btn.innerText = this.getBuildingName(b);
                btn.onclick = () => this.openBuilding(b);
                if (!isUnlocked) btn.className = 'secondary';
                panel.appendChild(btn);
            }
        });

        // 뒤로 가기 (마을 메인 메뉴로)
        const backBtn = document.createElement('button');
        backBtn.className = 'secondary';
        backBtn.innerText = '뒤로 가기';
        backBtn.onclick = () => this.renderTownActions();
        panel.appendChild(backBtn);
    }

    getBuildingName(b) {
        const names = {
            'jobCenter': '전직소',
            'shop': '상점',
            'inn': '여관',
            'dungeon': '던전 입장',
            'donation': '마을 기부',
            'quest': '의뢰소',
            'alchemy': '연금술 실험실',
            'training': '수련장',
            'blacksmith': '대장간',
            'antique': '골동품 가게'
        };
        return names[b] || b;
    }


    /**
     * 특정 건물 버튼을 눌렀을 때 해당 기능으로 분기합니다.
     */
    openBuilding(b) {
        if (b === 'jobCenter') this.openJobCenter();
        else if (b === 'inn') this.openInn();
        else if (b === 'shop') this.openShop();
        else if (b === 'dungeon') this.enterDungeon();
        else if (b === 'blacksmith') this.openBlacksmith();
        else if (b === 'alchemy') this.openAlchemyLab();
        else if (b === 'quest') this.openQuest();
        else if (b === 'training') this.openTraining();
        else this.log(`${this.getBuildingName(b)}은(는) 구현 중입니다.`, 'system');
    }

    /**
     * 다른 마을로 이동합니다.
     */
    travelTo(id) {
        this.gameState.world.currentLocation = id;
        const name = GAME_DATA.TOWNS.find(t => t.id === id).name;
        this.log(`--- ${name} 이동 완료 ---`, 'location-change');
        this.updateUI(); this.renderTownActions();
    }

    /**
     * 여관 모달창을 엽니다. (휴식 설명 및 버튼 배치)
     */
    openInn() {
        const w = this.gameState.world; const p = this.gameState.player;
        const cost = Math.floor(20 * w.inflation);
        this.showModal('여관', `
            <p>휴식을 취하면 HP/MP가 회복됩니다. (비용: ${cost} G)</p>
            <p><small>* 다음 날로 진행하며 세금이 발생합니다.</small></p>
            <button onclick="game.rest(${cost})">휴식하기</button>
        `);
    }

    openJobCenter() {
        const p = this.gameState.player;
        if (p.level < 10) {
            this.showModal('전직소', '<p>레벨 10 이상부터 전직이 가능합니다.</p>');
            return;
        }
        if (p.job !== '초보자') {
            this.showModal('전직소', `<p>이미 <strong>${p.job}</strong>(으)로 전직하셨습니다.</p>`);
            return;
        }

        let h = `
            <div style="text-align:center; margin-bottom: 20px;">
                <h3 style="color:var(--accent-cyan); font-family:'Orbitron', sans-serif;">직업 선택</h3>
                <p style="color:var(--text-dim); font-size:0.9rem;">전직 시 되돌릴 수 없으며, 스탯이 직업에 맞게 변경됩니다.</p>
            </div>
            <div style="display:flex; gap:15px; margin-top:20px;">
                <div class="shop-item" style="flex:1; flex-direction:column; gap:15px; text-align:center; align-items:center;">
                    <h3 class="job-warrior" style="font-size:1.5rem; margin:0;">전사</h3>
                    <p style="font-size:0.85rem; color:var(--text-dim); line-height:1.5;">높은 체력과 방어력을 바탕으로 적의 공격을 맞고 버티는 근접 전투의 전문가.</p>
                    <button onclick="game.changeJob('전사')" style="width:100%;">전사로 전직</button>
                </div>
                <div class="shop-item" style="flex:1; flex-direction:column; gap:15px; text-align:center; align-items:center;">
                    <h3 class="job-mage" style="font-size:1.5rem; margin:0;">마법사</h3>
                    <p style="font-size:0.85rem; color:var(--text-dim); line-height:1.5;">압도적인 마력과 MP. 방어력은 낮지만 강력한 파괴력을 지닌 하이리스크 딜러.</p>
                    <button onclick="game.changeJob('마법사')" style="width:100%;">마법사로 전직</button>
                </div>
            </div>
        `;
        this.showModal('전직소', h);
    }

    /**
     * 훈련소(수련장) 모달을 엽니다.
     * 모든 스킬을 표시하고, 레벨 조건에 따라 활성화/비활성화하며 강화를 지원합니다.
     */
    openTraining() {
        const p = this.gameState.player;
        const skills = p.job === '전사' ? GAME_DATA.WARRIOR_SKILLS : (p.job === '마법사' ? GAME_DATA.MAGE_SKILLS : []);

        if (skills.length === 0) {
            this.showModal('훈련소', '<p>전직 후에 이용 가능합니다.</p>');
            return;
        }

        let h = `
            <div style="text-align:center; margin-bottom: 20px;">
                <h3 style="color:var(--accent-cyan); font-family:'Orbitron', sans-serif;">스킬 연마</h3>
                <p style="color:var(--text-dim); font-size:0.85rem;">획득한 스킬을 강화하여 위력을 높일 수 있습니다. (최대 3강)</p>
            </div>
            <div class="shop-grid">
        `;

        skills.forEach(s => {
            const isUnlocked = p.level >= s.reqLv;
            const currentLv = p.skillLevels[s.id] || 0;
            const skillTier = Math.floor(s.reqLv / 10);
            const cost = Math.floor(2000 * Math.pow(2.5, skillTier - 1) * (currentLv + 1));

            h += `
                <div class="shop-item ${!isUnlocked ? 'locked' : ''}" style="${!isUnlocked ? 'opacity: 0.5; filter: grayscale(1);' : ''}">
                    <div class="shop-item-info">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span class="shop-item-name">${s.name}</span>
                            <span style="font-size:0.7rem; color:var(--gold-color); font-weight:700;">+${currentLv}</span>
                        </div>
                        <span class="shop-item-detail">${this.getSkillDesc(s, currentLv)}</span>
                        <div style="font-size:0.75rem; color:var(--accent-cyan); margin-top:2px;">
                            강화 효과: ${s.type === 'active' ? '대미지 +10% (복리)' : '효과 +4% (단리)'}
                        </div>
                        <div style="font-size:0.75rem; color:var(--text-dim); margin-top:4px;">
                            ${s.costVal > 0 ? `${s.costType.toUpperCase()} ${s.costVal} 소모` : '패시브 스킬'} | 요구 Lv.${s.reqLv}
                        </div>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:flex-end; gap:5px;">
                        ${isUnlocked ? (currentLv < 3 ? `
                            <span class="shop-item-price" style="font-size:0.8rem;">${cost.toLocaleString()}G</span>
                            <button onclick="game.reinforceSkill('${s.id}')" style="padding: 4px 10px; font-size:0.8rem;">강화</button>
                        ` : `
                            <span style="color:var(--accent-cyan); font-weight:700; font-size:0.8rem;">최대 강화</span>
                        `) : `
                            <span style="color:var(--text-dim); font-size:0.8rem;">잠김</span>
                        `}
                    </div>
                </div>
            `;
        });

        h += '</div>';
        this.showModal('훈련소', h);
    }

    /**
     * 특정 스킬을 강화합니다.
     */
    reinforceSkill(skillId) {
        const p = this.gameState.player;
        const skills = p.job === '전사' ? GAME_DATA.WARRIOR_SKILLS : GAME_DATA.MAGE_SKILLS;
        const skill = skills.find(s => s.id === skillId);
        if (!skill) return;

        const currentLv = p.skillLevels[skillId] || 0;
        if (currentLv >= 3) { alert('이미 최대 강화 상태입니다.'); return; }
        if (p.level < skill.reqLv) { alert('아직 획득하지 못한 스킬입니다.'); return; }

        const skillTier = Math.floor(skill.reqLv / 10);
        const cost = Math.floor(2000 * Math.pow(2.5, skillTier - 1) * (currentLv + 1));

        if (p.gold < cost) {
            alert('골드가 부족합니다.');
            return;
        }

        p.gold -= cost;
        p.skillLevels[skillId] = currentLv + 1;

        this.recalculateMaxStats();
        this.log(`<strong>${skill.name}</strong> 스킬을 +${p.skillLevels[skillId]}로 강화했습니다!`, 'victory');
        this.updateUI();
        this.openTraining(); // UI 갱신
    }

    changeJob(job) {
        const p = this.gameState.player;
        p.job = job;
        if (job === '전사') {
            p.hpMax = Math.floor(p.hpMax * 1.35);
            p.hp = p.hpMax;
        } else if (job === '마법사') {
            p.mpMax = Math.floor(p.mpMax * 1.4);
            p.mp = p.mpMax;
        }

        this.log(`축하합니다! <strong>${job}</strong>(으)로 전직했습니다!`, 'victory');
        this.updateStats();
        this.updateUI();
        this.closeModal();
    }

    /**
     * 실제로 휴식을 취하여 스탯을 회복하고 날짜를 경과시킵니다.
     * 골드 차감, 세금 징수, 물가 상승 로직이 포함됩니다.
     */
    rest(cost) {
        const p = this.gameState.player; const w = this.gameState.world;
        if (p.gold < cost) { alert('골드 부족'); return; }
        p.gold -= cost; p.hp = p.hpMax; p.mp = p.mpMax; w.day++; w.dungeonDayUsed = false;
        const tax = Math.floor(p.gold * 0.015); p.gold -= tax; w.inflation *= 1.002;
        this.log(`하루가 지났습니다. 세금 ${tax} G가 차감되었습니다.`, 'lose');
        this.closeModal(); this.updateUI(); this.renderTownActions();
    }

    /**
     * 상점 모달을 엽니다. 구매와 판매 탭으로 구분됩니다.
     */
    openShop(mode = 'buy') {
        if (!this.purchasedInSession) this.purchasedInSession = new Set();
        const tier = GAME_DATA.TOWNS.find(t => t.id === this.gameState.world.currentLocation).tier;
        const inf = this.gameState.world.inflation;
        const p = this.gameState.player;

        let h = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; padding:12px; background:rgba(0,0,0,0.2); border-radius:8px; border:1px solid var(--border-color);">
                <span style="color:var(--text-dim); font-size:0.85rem; font-weight:700;">보유 자금</span>
                <span style="color:var(--gold-color); font-weight:700; font-family:'Orbitron', sans-serif; font-size:1.1rem;">${p.gold.toLocaleString()} G</span>
            </div>
            <div class="shop-tabs">
                <button class="shop-tab ${mode === 'buy' ? 'active' : ''}" onclick="game.openShop('buy')">구매</button>
                <button class="shop-tab ${mode === 'sell' ? 'active' : ''}" onclick="game.openShop('sell')">판매</button>
            </div>
            <div class="shop-container">
        `;

        if (mode === 'buy') {
            // 아이템 그룹별 렌더링 헬퍼
            const renderGroup = (title, items, cat) => {
                h += `<h3>${title}</h3><div class="shop-grid">`;
                items.filter(i => {
                    if (cat === 'CONSUMABLES') {
                        // 마을 티어에 맞는 HP/MP 포션 1종씩만 판매
                        const potionTier = Math.min(tier, 6);
                        return Number(i.tier) === potionTier && (i.hp != null || i.mp != null);
                    }
                    // 전설(Tier 5) 등급 까지만 판매, 신화(Tier 6) 이상 제외
                    // [MOD] 현재 마을 티어와 정확히 일치하는 아이템만 판매
                    return (i.grade !== '신화' && i.grade !== '초월') && (i.tier || 0) === Math.min(tier, 5);
                }).forEach(it => {
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
            };

            renderGroup('무기', GAME_DATA.ITEMS.WEAPONS, 'WEAPONS');
            renderGroup('방어구', GAME_DATA.ITEMS.ARMORS, 'ARMORS');
            renderGroup('소모품', GAME_DATA.ITEMS.CONSUMABLES, 'CONSUMABLES');

            // 인벤토리 확장 섹션
            const town = GAME_DATA.TOWNS.find(t => t.id === this.gameState.world.currentLocation);
            const nextSlots = p.invMax === 10 ? 15 : (p.invMax === 15 ? 20 : (p.invMax === 20 ? 25 : (p.invMax === 25 ? 30 : (p.invMax === 30 ? 40 : null))));
            const expansionCosts = { 15: 500, 20: 2000, 25: 10000, 30: 50000, 40: 200000 };
            const tierLimits = { 1: 15, 2: 20, 3: 25, 4: 30, 5: 40 };

            if (nextSlots && nextSlots <= tierLimits[town.tier]) {
                const cost = expansionCosts[nextSlots];
                h += `<h3>인벤토리 확장</h3><div class="shop-grid">
                    <div class="shop-item">
                        <div class="shop-item-info">
                            <span class="shop-item-name">전술 가방 확장 (+${nextSlots - p.invMax}칸)</span>
                            <span class="shop-item-detail">가방 최대 칸수가 ${nextSlots}칸으로 증가합니다.</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span class="shop-item-price">${cost}G</span>
                            <button onclick="game.expandInventory(${nextSlots}, ${cost})">구매</button>
                        </div>
                    </div>
                </div>`;
            } else if (nextSlots) {
                h += `<h3>인벤토리 확장</h3><p style="font-size:0.8rem; color:var(--text-dim);">이 마을에서는 더 이상 가방을 확장할 수 없습니다. (현재: ${p.invMax}칸)</p>`;
            }
        } else {
            // 판매 모드: 인벤토리 목록 렌더링
            h += '<h3>아이템 판매</h3><div class="shop-grid">';
            if (p.inventory.length === 0) {
                h += '<p style="color:var(--text-dim);">가방이 비어 있습니다.</p>';
            } else {
                p.inventory.forEach((it, idx) => {
                    const unitPrice = this.calculateSellPrice(it, true);
                    const plusText = it.plus > 0 ? ` +${it.plus}` : '';
                    h += `
                        <div class="shop-item">
                            <div class="shop-item-info">
                                <span class="shop-item-name">${it.name}${plusText}</span>
                                <span class="shop-item-detail">${it.count > 1 ? `수량: ${it.count} / ` : ''}${it.atk ? 'ATK+' + it.atk : (it.def ? 'DEF+' + it.def : (it.hp ? 'HP+' + it.hp : 'MP+' + it.mp))}</span>
                            </div>
                            <div style="display:flex; align-items:center; gap:10px;">
                                <span class="shop-item-price">${unitPrice.toLocaleString()}G</span>
                                <button onclick="game.sellItem(${idx})">판매</button>
                                <button onclick="game.sellItemStack(${idx})">일괄 판매</button>
                            </div>
                        </div>`;
                });
            }
            h += '</div>';
        }

        this.showModal('상점', h + '</div>');
    }

    /**
     * 아이템의 판매 가격을 계산합니다.
     * 기본은 구매가의 40%이며, 강화 단계에 따라 복리로 보너스가 붙습니다.
     */
    calculateSellPrice(it, isUnit = false) {
        const base = (it.price || 0) * 0.5;
        const plus = it.plus || 0;
        // 강화 단계당 10%씩 복리 증가
        const unitPrice = Math.floor(base * Math.pow(1.1, plus));
        return isUnit ? unitPrice : unitPrice * (it.count || 1);
    }

    /**
     * 인벤토리의 특정 아이템을 판매합니다.
     */
    sellItem(idx) {
        const p = this.gameState.player;
        const it = p.inventory[idx];
        if (!it) return;

        const price = this.calculateSellPrice(it, true); // 1개 가격으로 계산
        p.gold += price;

        if (it.count > 1) {
            it.count--;
        } else {
            p.inventory.splice(idx, 1);
        }

        this.log(`${it.name}을(를) 1개 판매했습니다. (${price} G 획득)`, 'gain');
        this.updateUI();
        this.openShop('sell'); // 판매 후 목록 갱신을 위해 판매 탭 다시 열기
    }

    /**
     * 인벤토리의 특정 항목(스택)을 한 번에 모두 판매합니다.
     */
    sellItemStack(idx) {
        const p = this.gameState.player;
        const it = p.inventory[idx];
        if (!it) return;

        const count = it.count || 1;
        const totalPrice = this.calculateSellPrice(it);
        p.gold += totalPrice;
        p.inventory.splice(idx, 1);

        this.log(`${it.name} ${count}개를 일괄 판매했습니다. (${totalPrice.toLocaleString()} G 획득)`, 'gain');
        this.updateUI();
        this.openShop('sell');
    }

    /**
     * 마을 상점에서 가방 칸수를 확장합니다.
     */
    expandInventory(next, cost) {
        const p = this.gameState.player;
        if (p.gold < cost) { alert('골드 부족'); return; }
        p.gold -= cost;
        p.invMax = next;
        this.log(`가방이 ${next}칸으로 확장되었습니다.`, 'gain');
        this.updateUI(); this.openShop();
    }

    /**
     * 상점에서 아이템을 구매합니다. 
     * 소모품은 스태킹(중첩) 처리를 하며, 장비품은 가방 칸수를 체크합니다.
     */
    buyItem(cat, id) {
        const p = this.gameState.player; const itData = GAME_DATA.ITEMS[cat].find(i => i.id === id);
        const pr = Math.floor(itData.price * this.gameState.world.inflation);
        if (p.gold < pr) { alert('골드 부족'); return; }

        // 스태킹 체크 (소모품만 가능)
        const existing = p.inventory.find(i => i.id === id && i.category === cat && (i.plus || 0) === 0);

        if (existing && cat === 'CONSUMABLES') {
            p.gold -= pr;
            existing.count = (existing.count || 1) + 1;
        } else {
            if (p.inventory.length >= p.invMax) { alert('가방 가득 참'); return; }
            p.gold -= pr;
            p.inventory.push({ ...itData, category: cat, count: 1, plus: 0 });
        }

        if (cat === 'WEAPONS' || cat === 'ARMORS') this.purchasedInSession.add(id);
        this.log(`${itData.name}을(를) 구매했습니다.`, 'gain'); this.updateUI(); this.openShop();
    }

    //openBuilding(b) {
    //    if (b === 'shop') this.purchasedInSession = new Set();
    //    this.handleBuildingClick(b);
    //}


    /**
     * 인벤토리의 아이템을 사용하거나 장착합니다.
     * 카테고리에 따라 포션 사용(회복), 무기 장착, 방어구 장착으로 분기합니다.
     */
    useOrEquipItem(i) {
        const p = this.gameState.player; const it = p.inventory[i];
        if (!it) return;

        if (it.category === 'CONSUMABLES') {
            // 마을에서는 포션 사용 불가 (전투/던전 중 전용)
            const inAction = document.body.classList.contains('in-dungeon') || this.currentBattle;
            if (!inAction) {
                this.log('마을에서는 포션을 사용할 수 없습니다.', 'system');
                return;
            }

            if (it.hp) p.hp = Math.min(p.hpMax, p.hp + it.hp);
            if (it.mp) p.mp = Math.min(p.mpMax, p.mp + it.mp);

            it.count--;
            if (it.count <= 0) p.inventory.splice(i, 1);
        } else if (it.category === 'WEAPONS') {
            const old = p.equipment.weapon; p.equipment.weapon = it; p.inventory.splice(i, 1);
            if (old) p.inventory.push(old);
        } else if (it.category === 'ARMORS') {
            const old = p.equipment.armor; p.equipment.armor = it; p.inventory.splice(i, 1);
            if (old) p.inventory.push(old);
        }
        this.updateStats(); this.updateUI();
    }

    /**
     * 던전에 입장합니다. 하루 한 번만 입장 가능하며 입장 시 전용 클래스가 추가됩니다.
     */
    enterDungeon() {
        const w = this.gameState.world; const t = GAME_DATA.TOWNS.find(t => t.id === w.currentLocation);
        if (w.dungeonDayUsed) { this.log('하루에 한 번만 가능합니다.', 'system'); return; }
        document.body.classList.add('in-dungeon');
        w.dungeonDayUsed = true;
        this.dungeonRestCount = 0; // 던전 입장 시 휴식 횟수 초기화
        this.log(`--- ${t.dungeon.name} 진입 ---`, 'location-change');
        this.exploreLoop(t.dungeon, 0);
        this.updateUI();
    }

    /**
     * 던전 탐험의 메인 루프입니다. 현재 진행도(step)에 따라 
     * 전진, 휴식, 귀환 버튼을 렌더링하며, 보스 방 도착 여부를 판단합니다.
     */
    exploreLoop(dg, step) {
        const pState = this.gameState.player;
        const wState = this.gameState.world;
        const midInfo = pState.defeatedMidBosses[dg.id];

        // 보스 방 도착 체크 (설정된 steps 이상 진행 시)
        if (step >= dg.steps) {
            const panel = document.getElementById('action-panel');

            if (!midInfo) {
                // 중간 보스를 한 번도 처격하지 않은 경우
                this.log('심상치 않은 기운이 느껴집니다... 중간 보스 출현!', 'system');
                panel.innerHTML = `<button onclick="game.startBattle(GAME_DATA.TOWNS.find(t => t.id === '${wState.currentLocation}').dungeon, false, ${step}, 'mid')">중간 보스 도전</button>
                                   <button class="secondary" onclick="game.exitDungeon()">귀환</button>`;
            } else if (midInfo.day === wState.day) {
                // 중간 보스를 처치한 당일인 경우 (최종 보스 조우 불가)
                this.log('중간 보스를 처치했습니다. 최종 보스는 내일부터 도전 가능합니다.', 'system');
                panel.innerHTML = `<button class="secondary" onclick="game.exitDungeon()">마을로 귀환</button>`;
            } else {
                // 이미 이전에 중간 보스를 처치한 경우 (중간 보스 격파 후 최종 보스전으로 연결)
                this.log('고지가 눈앞입니다. 최종 보스를 향한 마지막 관문입니다.', 'system');
                panel.innerHTML = `<button onclick="game.startBattle(GAME_DATA.TOWNS.find(t => t.id === '${wState.currentLocation}').dungeon, false, ${step}, 'mid_sequential')">중간 보스 처치 후 최종 보스 도전</button>
                                   <button class="secondary" onclick="game.exitDungeon()">귀환</button>`;
            }
            return;
        }

        const p = document.getElementById('action-panel');
        // 탐험 옵션 구성: 전진, 휴식, 귀환
        const restDisabled = this.dungeonRestCount >= 3;
        p.innerHTML = `
            <button onclick="game.nextEvent('${dg.id}', ${step})">전진 (${step + 1}/${dg.steps})</button>
            <button onclick="game.dungeonRest('${dg.id}', ${step})" ${restDisabled ? 'disabled' : ''}>휴식 (${this.dungeonRestCount}/3)</button>
            <button class="secondary" onclick="game.exitDungeon()">귀환</button>
        `;
    }

    /**
     * 던전 내 휴식 기능
     * 소량의 HP/MP를 회복하지만, 일정 확률로 적의 기습을 받을 수 있습니다.
     */
    dungeonRest(dgId, step) {
        if (this.dungeonRestCount >= 3) {
            this.log('더 이상 휴식할 수 없습니다. (최대 3회)', 'system');
            return;
        }

        const p = this.gameState.player;
        const dg = GAME_DATA.TOWNS.find(t => t.id === this.gameState.world.currentLocation).dungeon;
        this.dungeonRestCount++;

        // 20% 확률로 적의 기습 발생
        if (Math.random() < 0.2) {
            this.log('--- ! 기습 발생 ! ---', 'death-notice');
            this.log('휴식 중에 몬스터의 기습을 받았습니다.', 'lose');
            this.startBattle(dg, false, step);
        } else {
            // 휴식 성공 시 HP/MP 25% 회복
            const recoverHP = Math.floor(p.hpMax * 0.25);
            const recoverMP = Math.floor(p.mpMax * 0.25);
            p.hp = Math.min(p.hpMax, p.hp + recoverHP);
            p.mp = Math.min(p.mpMax, p.mp + recoverMP);

            this.log(`조심스럽게 휴식을 취했습니다. (${this.dungeonRestCount}/3)`, 'system');
            this.log(`HP +${recoverHP}, MP +${recoverMP} 회복 완료.`, 'gain');
            this.updateUI();
            // 휴식 후 다시 루프 표시
            this.exploreLoop(dg, step);
        }
    }


    /**
     * 던전을 중단하고 마을로 안전하게 귀환합니다.
     */
    exitDungeon() {
        document.body.classList.remove('in-dungeon');
        this.log('--- 마을 귀환 완료 ---', 'location-change');
        this.renderTownActions();
        this.updateUI();
    }

    /**
     * 던전 탐험 진행 (랜덤 이벤트 분기: 전투/보물상자/무작위 이벤트/정적)
     */
    nextEvent(dId, step) {
        const r = Math.random();
        const dg = GAME_DATA.TOWNS.find(t => t.id === this.gameState.world.currentLocation).dungeon;

        if (r < 0.50) {
            // 50% 확률로 일반 몬스터와 조우
            this.startBattle(dg, false, step);
        } else if (r < 0.68) {
            // 18% 확률로 보물상자 발견
            this.handleTreasureChest(dg, step);
        } else if (r < 0.83) {
            // 15% 확률로 무작위 이벤트 발생
            this.handleRandomEvent(dg, step);
        } else if (r < 0.84) {
            // 1% 확률로 초월 등급 장비 보스 조우 이벤트
            this.handleTranscendenceEvent(dg, step);
        } else {
            // 16% 확률로 평화롭게 지나감
            this.log('길이 고요합니다. 아무 일도 일어나지 않았습니다.', 'system');
            this.exploreLoop(dg, step + 1);
        }
    }

    /**
     * 초월 등급 이벤트: 해당 던전 보스급 몬스터와 전투 후 승리 시 초월 장비 획득
     */
    handleTranscendenceEvent(dg, step) {
        this.log('!!! 차원이 뒤틀리며 강력한 기운이 뿜어져 나옵니다 !!!', 'death-notice');
        this.log('초월의 수호자가 앞길을 가로막습니다.', 'system');

        // 보스 데이터를 기반으로 하되 능력치 +20% (초월급)
        const pool = GAME_DATA.MONSTERS[dg.id];
        const bossTemplate = pool.find(m => m.isBoss);
        const m = {
            ...bossTemplate,
            name: `[초월] ${bossTemplate.name}`,
            hp: Math.floor(bossTemplate.hp * 1.2),
            hpMax: Math.floor(bossTemplate.hp * 1.2),
            atk: Math.floor(bossTemplate.atk * 1.2),
            xp: bossTemplate.xp * 2,
            gold: bossTemplate.gold * 2,
            isTranscendenceBoss: true
        };

        this.currentBattle = {
            monster: m,
            isBoss: true,
            type: 'transcendence',
            step,
            dungeon: dg,
            skillCooldowns: {},
            activeBuffs: [],
            playerStatusEffects: [],
            monsterStatusEffects: [],
            turnCount: 0
        };
        document.getElementById('monster-status').classList.remove('hidden');
        document.getElementById('monster-name').innerHTML = `<span class="grade-transcend">${m.name}</span>`;
        this.updateMonsterUI();
        this.renderBattleActions();
    }

    /**
     * 보물상자 처리 로직
     */
    handleTreasureChest(dg, step) {
        const r = Math.random();
        const p = this.gameState.player;
        const tier = GAME_DATA.TOWNS.find(t => t.id === this.gameState.world.currentLocation).tier;

        if (r < 0.8) {
            // 80% 확률: 골드 보상 (소폭 하항 조정)
            const g = Math.floor((Math.random() * 30 + 10) * (step + 1) * tier);
            p.gold += g;
            this.log(`보물상자를 열어 <strong>${g} Gold</strong>를 획득했습니다!`, 'gain');
        } else if (r < 0.95) {
            // 15% 확률: 현재 마을 티어에 맞는 무작위 포션 획득
            const potionPool = GAME_DATA.ITEMS.CONSUMABLES.filter(i => (i.tier || 0) <= tier);
            const potion = potionPool[Math.floor(Math.random() * potionPool.length)];

            if (p.inventory.length < p.invMax) {
                const existing = p.inventory.find(i => i.id === potion.id && i.category === 'CONSUMABLES');
                if (existing) existing.count = (existing.count || 1) + 1;
                else p.inventory.push({ ...potion, category: 'CONSUMABLES', count: 1, plus: 0 });
                this.log(`보물상자에서 <strong>${potion.name}</strong>을(를) 발견했습니다!`, 'gain');
            } else {
                this.log(`보물상자에서 ${potion.name}을(를) 발견했지만, 가방이 가득 차 가져가지 못했습니다.`, 'lose');
            }
        } else {
            // 5% 확률: 해당 티어 수준의 장비 (무기 또는 갑옷)
            const type = Math.random() < 0.5 ? 'WEAPONS' : 'ARMORS';
            const pool = GAME_DATA.ITEMS[type].filter(i => i.tier === tier);
            if (pool.length > 0) {
                const item = { ...pool[Math.floor(Math.random() * pool.length)], category: type, count: 1, plus: 0 };
                if (p.inventory.length < p.invMax) {
                    p.inventory.push(item);
                    this.log(`!!! 보물상자에서 빛나는 장비 <strong>[${item.name}]</strong>을(를) 획득했습니다 !!!`, 'victory');
                } else {
                    this.log(`희귀한 장비 ${item.name}을(를) 발견했지만 가방이 가득 찼습니다.`, 'lose');
                }
            } else {
                // 해당 티어 장비가 없는 경우 골드로 대체
                p.gold += 500;
                this.log('보물상자에서 낡은 금화 주머니(500G)를 발견했습니다.', 'gain');
            }
        }
        this.updateUI();
        this.exploreLoop(dg, step + 1);
    }

    /**
     * 무작위 이벤트 처리 로직 (긍정적/부정적 효과)
     */
    handleRandomEvent(dg, step) {
        const r = Math.random();
        const p = this.gameState.player;
        const events = [
            {
                name: '오래된 샘물', msg: '숲 사이에서 맑은 샘물을 발견했습니다. 기운이 솟아납니다.', effect: () => {
                    const hp = Math.floor(p.hpMax * 0.2); const mp = Math.floor(p.mpMax * 0.2);
                    p.hp = Math.min(p.hpMax, p.hp + hp); p.mp = Math.min(p.mpMax, p.mp + mp);
                    this.log(`HP/MP가 ${hp}/${mp} 만큼 회복되었습니다.`, 'gain');
                }
            },
            {
                name: '행운의 동전', msg: '바닥에서 반짝이는 동전을 주웠습니다.', effect: () => {
                    const g = Math.floor(Math.random() * 100 + 50); p.gold += g;
                    this.log(`${g} Gold를 획득했습니다.`, 'gain');
                }
            },
            {
                name: '숨겨진 덫', msg: '이끼에 가려진 덫을 밟았습니다!', effect: () => {
                    const dmg = Math.floor(p.hpMax * 0.1); p.hp -= dmg;
                    this.log(`${dmg}의 대미지를 입었습니다.`, 'lose');
                    if (p.hp <= 0) this.death();
                }
            },
            {
                name: '불길한 바람', msg: '갑자기 불어온 강풍에 가방이 흔들려 골드가 일부 쏟아졌습니다.', effect: () => {
                    const g = Math.floor(p.gold * 0.05); p.gold -= g;
                    this.log(`${g} Gold를 유실했습니다.`, 'lose');
                }
            },
            {
                name: '공허의 기운', msg: '공허의 기운이 몸을 감쌉니다. 마력이 정화됩니다.', effect: () => {
                    p.mp = p.mpMax; this.log('MP가 완전히 회복되었습니다.', 'gain');
                }
            }
        ];

        const ev = events[Math.floor(Math.random() * events.length)];
        this.log(`[이벤트] ${ev.name}: ${ev.msg}`, 'system');
        ev.effect();
        this.updateUI();

        // 사망하지 않았을 경우에만 진행 (덫 등으로 사망 가능성 때문)
        if (p.hp > 0) this.exploreLoop(dg, step + 1);
    }


    /**
     * 전투를 시작합니다. 몬스터 풀에서 랜덤하게 선택하거나 보스를 설정합니다.
     * 뮤턴트(특수 접두사) 몬스터 확률도 포함되어 있습니다.
     */
    startBattle(dg, isB, step, type = 'normal') {
        const pool = GAME_DATA.MONSTERS[dg.id];
        let m;

        // 전투 타입(일반, 중간보스, 최종보스)에 따른 몬스터 선택
        if (type === 'mid' || type === 'mid_sequential') {
            m = { ...pool.find(m => m.isMidBoss) };
        } else if (isB) {
            m = { ...pool.find(m => m.isBoss) };
        } else {
            // 일반 몬스터 필터링 후 랜덤 선택
            const normals = pool.filter(n => !n.isBoss && !n.isMidBoss);
            m = { ...normals[Math.floor(Math.random() * normals.length)] };
        }

        // 8% 확률로 특수한 능력치를 가진 뮤턴트 몬스터 출현
        if (type === 'normal' && !isB && Math.random() < 0.08) {
            const mut = GAME_DATA.MUTANTS[Math.floor(Math.random() * GAME_DATA.MUTANTS.length)];
            m.name = mut.prefix + ' ' + m.name;
            if (mut.hpMult) m.hp *= mut.hpMult;
            if (mut.atkMult) m.atk *= mut.atkMult;
            if (mut.goldMult) m.gold *= mut.goldMult;
        }
        m.hpMax = m.hp;

        // 전투 상태 객체 생성
        this.currentBattle = {
            monster: m,
            isBoss: isB || type.includes('mid') || type === 'boss',
            type,
            step,
            dungeon: dg,
            skillCooldowns: {},
            activeBuffs: [],
            playerStatusEffects: [],
            monsterStatusEffects: [],
            turnCount: 0
        };

        // 몬스터 체력 바 및 UI 표시
        const mStatus = document.getElementById('monster-status');
        mStatus.classList.remove('hidden');

        // [NEW] 몬스터 레벨 계산 (일반 몬스터도 던전 진행도에 따라 레벨 부여)
        const town = GAME_DATA.TOWNS.find(t => t.id === this.gameState.world.currentLocation);
        const minLv = parseInt((town.levelRange || '').match(/\d+/)?.[0] || '1', 10);
        const maxLv = parseInt((town.levelRange || '').match(/~\s*(\d+)/)?.[1] || '20', 10);

        m.level = m.isMidBoss ? dg.midBossLv : (m.isBoss ? dg.bossLv : Math.floor(minLv + (step / (dg.steps || 1)) * (maxLv - minLv)));

        let displayName = m.name;
        displayName += ` <small style="color:var(--text-dim); font-size:0.7rem;">(Lv.${m.level})</small>`;

        document.getElementById('monster-name').innerHTML = displayName;
        this.updateMonsterUI();

        this.log(`<strong>${m.name}</strong> 출현!`, 'lose');
        this.renderBattleActions();
    }

    /**
     * 전투 화면 중 몬스터의 HP 정보를 업데이트합니다.
     */
    updateMonsterUI() {
        const b = this.currentBattle; if (!b) return;
        const m = b.monster;
        document.getElementById('monster-hp-cur').innerText = Math.ceil(Math.max(0, m.hp));
        document.getElementById('monster-hp-max').innerText = Math.ceil(m.hpMax);
        document.getElementById('monster-hp-bar').style.width = (Math.max(0, m.hp) / m.hpMax * 100) + '%';
        this.renderStatusEffects();
    }


    /**
     * 전투 중 행동 옵션(공격, 스킬, 도망) 버튼을 렌더링합니다.
     */
    renderBattleActions() {
        const p = document.getElementById('action-panel');
        p.innerHTML = `<button onclick="game.battleTurn()">공격</button>
                       <button onclick="game.openSkillPanel()">스킬</button>
                       <button class="secondary" onclick="game.tryEscape()">도망</button>`;
    }

    openSkillPanel() {
        const p = this.gameState.player;
        const b = this.currentBattle;
        if (!b) return;

        let skills = [];
        if (p.job === '전사') skills = GAME_DATA.WARRIOR_SKILLS;
        else if (p.job === '마법사') skills = GAME_DATA.MAGE_SKILLS;

        const activeSkills = skills.filter(s => s.type === 'active' && p.level >= s.reqLv);

        if (activeSkills.length === 0) {
            this.log('사용 가능한 스킬이 없습니다.', 'system');
            return;
        }

        let h = '<div class="skill-grid">';
        activeSkills.forEach(s => {
            const cd = b.skillCooldowns[s.id] || 0;
            const canAfford = s.costType === 'hp' ? p.hp > s.costVal : (s.costType === 'mp' ? p.mp >= s.costVal : true);
            const isUsable = cd <= 0 && canAfford && !b.skillUsedThisTurn;

            h += `
                <button class="skill-btn" onclick="game.useSkill('${s.id}')" ${!isUsable ? 'disabled' : ''}>
                    <div class="skill-btn-header">
                        <span class="skill-name">${s.name}</span>
                        <span class="skill-cost cost-${s.costType}">${s.costType.toUpperCase()} ${s.costVal}</span>
                    </div>
                    <div class="skill-desc">${this.getSkillDesc(s, b.skillCooldowns[s.id] || 0, true)}</div>
                    ${cd > 0 ? `<div class="skill-cooldown">쿨타임: ${cd}턴</div>` : ''}
                </button>
            `;
        });
        h += '</div><button class="secondary" style="margin-top:15px; width:100%;" onclick="game.closeSkillPanel()">돌아가기</button>';

        const panel = document.getElementById('action-panel');
        panel.innerHTML = h;
    }

    closeSkillPanel() {
        this.renderBattleActions();
    }

    /**
     * 스킬 레벨에 따라 동적으로 강화된 수치를 포함한 설명을 반환합니다.
     */
    getSkillDesc(s, rLv, isBattle = false) {
        // 전투 중일 때는 skillLevels에서 가져와야 함 (매개변수 rLv가 쿨타임으로 전달되는 경우가 있으므로 주의)
        const level = isBattle ? (this.gameState.player.skillLevels[s.id] || 0) : rLv;
        let desc = s.desc;

        if (s.type === 'active') {
            if (s.mult) {
                const currentMult = s.mult * Math.pow(1.10, level);
                const multText = ` <span style="color:var(--accent-cyan)">[계수: ${currentMult.toFixed(2)}x]</span>`;
                return desc + multText;
            }
            return desc;
        } else {
            // 패시브: % 수치를 찾아서 레벨당 4%p씩 증가시킴 (단, 조건부 %는 제외)
            return desc.replace(/(\d+)%(?=\s*(증가|회복|확률|무시|감소|추가))/g, (match, p1) => {
                const val = parseInt(p1);
                const newVal = val + (level * 4);
                return `<span style="color:var(--accent-cyan)">${newVal}%</span>`;
            });
        }
    }

    useSkill(skillId) {
        const p = this.gameState.player;
        const b = this.currentBattle;

        let skills = p.job === '전사' ? GAME_DATA.WARRIOR_SKILLS : GAME_DATA.MAGE_SKILLS;
        const skill = skills.find(s => s.id === skillId);
        if (!skill) return;

        if (skill.costType === 'hp') {
            if (p.hp <= skill.costVal) { this.log('HP가 부족합니다.', 'system'); return; }
            p.hp -= skill.costVal;
        } else if (skill.costType === 'mp') {
            let cost = skill.costVal;
            const rLv = p.skillLevels['ms9'] || 0;
            if (p.job === '마법사' && p.level >= 90 && Math.random() < (0.2 + rLv * 0.04)) {
                this.log('현자의 지혜 발동! MP를 소모하지 않습니다.', 'gain');
                cost = 0;
            }
            if (p.mp < cost) { this.log('MP가 부족합니다.', 'system'); return; }
            p.mp -= cost;
        }

        b.skillCooldowns[skill.id] = skill.cooldown;
        b.skillUsedThisTurn = true;

        this.closeSkillPanel();
        this.battleTurn(skill);
    }

    /**
     * 전투 턴을 진행합니다.
     */
    battleTurn(skill = null) {
        const p = this.gameState.player; const b = this.currentBattle; const m = b.monster;
        if (!b) return;
        b.skillUsedThisTurn = false;

        this.updateStats();

        let canAttack = true;
        let playerDmgMult = 1.0;
        let isCriticalShift = false;

        if (b.activeBuffs.some(buff => buff.type === 'timeRift')) { playerDmgMult = 2.0; }
        if (b.activeBuffs.some(buff => buff.type === 'phaseShift')) { isCriticalShift = true; }
        if (b.activeBuffs.some(buff => buff.type === 'lordDescent')) {
            canAttack = false;
            this.log('기력 소진으로 행동할 수 없습니다.', 'lose');
        }

        if (canAttack) {
            let mEva = m.eva || 0;
            if (b.activeBuffs.some(buff => buff.type === 'frozenSpear')) mEva = Math.max(0, mEva - 20);

            if (Math.random() < mEva / 100 && (!skill || skill.id !== 'ws10')) {
                this.log(`${m.name}이(가) 공격을 신속하게 회피했습니다!`, 'system');
            } else {
                let atkStat = p.job === '마법사' ? p.mag : p.atk;
                let d = Math.max(1, atkStat - m.def);

                if (skill) {
                    this.log(`[스킬 사용] ${skill.name}!`, 'system');
                    if (skill.mult) d = Math.max(1, (atkStat * skill.mult) - m.def);

                    if (skill.id === 'ws3' && Math.random() < 0.2) this.applyStatusEffect('monster', 'stun', 1);
                    if (skill.id === 'ws4') b.activeBuffs.push({ type: 'ironWall', name: '철벽', duration: 3 });
                    if (skill.id === 'ws5') b.activeBuffs.push({ type: 'retribution', name: '심판', duration: 3 });
                    if (skill.id === 'ws7') d = Math.max(1, (atkStat * skill.mult) - (m.def * 0.5));
                    if (skill.id === 'ws8') b.activeBuffs.push({ type: 'berserk', name: '광폭', duration: 3 });
                    if (skill.id === 'ws10') { d = atkStat * skill.mult; b.activeBuffs.push({ type: 'lordDescent', name: '소진', duration: 2 }); }

                    if (skill.id === 'ms3') b.activeBuffs.push({ type: 'frozenSpear', name: '둔화', duration: 2 });
                    if (skill.id === 'ms4') b.activeBuffs.push({ type: 'manaShield', name: '실드', duration: 99 });
                    if (skill.id === 'ms5') b.activeBuffs.push({ type: 'timeRift', name: '파열', duration: 2 });
                    if (skill.id === 'ms7') this.applyStatusEffect('monster', 'burn', 3);
                    if (skill.id === 'ms8') b.activeBuffs.push({ type: 'phaseShift', name: '위상', duration: 1 });
                    if (skill.id === 'ms10') {
                        d = (atkStat * skill.mult) + (p.mp * 2);
                        b.activeBuffs.push({ type: 'mpBlock', name: '마나차단', duration: 2 });
                    }
                }

                d = Math.floor(d * playerDmgMult);

                // [NEW] 스킬 강화 보너스 적용 (강화 레벨당 대미지 15% 복리 증가)
                if (skill) {
                    const rLv = p.skillLevels[skill.id] || 0;
                    d = Math.floor(d * Math.pow(1.10, rLv));
                }

                let criChance = p.cri;
                if (isCriticalShift) criChance += 50;

                if (Math.random() < criChance / 100) { d *= 2; this.log(`치명타! ${d} 피해!`, 'crit'); }
                else if (d > 0) this.log(`${m.name}에게 ${d} 피해.`);

                m.hp -= d;
                this.updateMonsterUI();
            }
        }

        if (m.hp <= 0) return this.handleMonsterDeath();

        // 플레이어 행동불능 체크
        if (this.isIncapacitated('player')) {
            this.log('상태이상으로 인해 행동할 수 없습니다!', 'lose');
        }

        // 몬스터 행동불능 체크
        if (this.isIncapacitated('monster')) {
            this.log(`${m.name}은(는) 상태이상으로 인해 행동하지 못합니다!`, 'system');
        } else {
            let pEva = p.eva || 0;
            if (b.activeBuffs.some(buff => buff.type === 'phaseShift')) pEva = 100;
            if (b.activeBuffs.some(buff => buff.type === 'berserk')) pEva = 0;

            if (Math.random() < pEva / 100) {
                this.log(`${m.name}의 공격을 회피했습니다!`, 'system');
            } else {
                let md = Math.max(1, m.atk - p.def);
                if (b.activeBuffs.some(buff => buff.type === 'ironWall')) md = Math.floor(md * 0.5);
                if (b.activeBuffs.some(buff => buff.type === 'berserk')) md = Math.floor(md * 1.5);

                if (b.activeBuffs.some(buff => buff.type === 'manaShield')) {
                    let mpDmg = Math.floor(md * 1.5);
                    if (p.mp >= mpDmg) {
                        p.mp -= mpDmg;
                        md = 0;
                        this.log(`마나 실드로 피해를 방어했습니다! (MP -${mpDmg})`, 'gain');
                    } else {
                        b.activeBuffs = b.activeBuffs.filter(buff => buff.type !== 'manaShield');
                        this.log(`마나가 부족하여 마나 실드가 깨졌습니다!`, 'lose');
                    }
                }

                if (md > 0) {
                    p.hp -= md;
                    this.log(`${m.name}의 공격! ${md} 피해.`, 'lose');

                    // 몬스터의 상태이상 부여 체크
                    if (m.statusEffects) {
                        m.statusEffects.forEach(se => {
                            if (Math.random() < se.chance) {
                                this.applyStatusEffect('player', se.type, se.duration);
                            }
                        });
                    }

                    let counterChance = 0;
                    let isRetribution = false;
                    if (b.activeBuffs.some(buff => buff.type === 'ironWall')) counterChance += 0.3;
                    if (b.activeBuffs.some(buff => buff.type === 'retribution')) { counterChance = 1.0; isRetribution = true; }

                    if (Math.random() < counterChance && m.hp > 0) {
                        let cdmg = Math.floor(p.atk * 0.8);
                        m.hp -= cdmg;
                        this.log(`반격! ${m.name}에게 ${cdmg} 피해.`, 'system');
                        if (isRetribution) {
                            let heal = Math.floor(cdmg * 0.3);
                            p.hp = Math.min(p.hpMax, p.hp + heal);
                            this.log(`심판의 일격으로 HP ${heal} 회복.`, 'gain');
                        }
                        this.updateMonsterUI();
                    }
                }

                if (p.hp <= 0) return this.death();
            }
        }

        if (m.hp <= 0) return this.handleMonsterDeath();

        this.endOfTurnProcessing();
    }

    /**
    * 상태이상을 부여합니다.
    */
    applyStatusEffect(target, type, duration) {
        const b = this.currentBattle;
        if (!b) return;

        const list = target === 'player' ? b.playerStatusEffects : b.monsterStatusEffects;
        const data = Game.STATUS_EFFECT_DATA[type];

        const existing = list.find(s => s.type === type);
        if (existing) {
            existing.duration = Math.max(existing.duration, duration);
        } else {
            list.push({ type, duration });
            const targetName = target === 'player' ? '플레이어' : b.monster.name;
            this.log(`[상태이상] ${targetName}이(가) <strong>${data.name}</strong> 상태에 빠졌습니다!`, 'lose');
        }
        this.updateUI();
    }

    /**
     * 행동불능 상태인지 체크합니다.
     */
    isIncapacitated(target) {
        const b = this.currentBattle;
        if (!b) return false;

        const list = target === 'player' ? b.playerStatusEffects : b.monsterStatusEffects;
        const ccTypes = ['stun', 'sleep', 'freeze', 'electrocution'];
        return list.some(s => ccTypes.includes(s.type));
    }

    handleMonsterDeath() {
        const bData = this.currentBattle;
        const bType = bData.type;

        this.victory(bData.monster.name, bData.isBoss);
        this.currentBattle = null;
        document.getElementById('monster-status').classList.add('hidden');

        if (bType === 'normal') this.exploreLoop(bData.dungeon, bData.step + 1);
        else if (bType === 'mid') { document.body.classList.remove('in-dungeon'); this.renderTownActions(); }
        else if (bType === 'mid_sequential') { /* handled in victory */ }
        else if (bData.isBoss || bType === 'boss') { document.body.classList.remove('in-dungeon'); this.renderTownActions(); }

        this.updateUI();
    }

    endOfTurnProcessing() {
        const p = this.gameState.player;
        const b = this.currentBattle; const m = b.monster;

        // 플레이어 도트 데미지 처리
        if (b.playerStatusEffects) {
            b.playerStatusEffects.forEach(s => {
                let dotDmg = 0;
                if (s.type === 'bleeding') dotDmg = Math.floor(p.hpMax * 0.04);
                if (s.type === 'burn') dotDmg = Math.floor(p.hpMax * 0.04);
                if (s.type === 'poison') dotDmg = Math.floor(p.hpMax * 0.02);
                if (s.type === 'curse') dotDmg = Math.floor(p.hpMax * 0.05);

                if (dotDmg > 0) {
                    // [NEW] 레벨 차에 따른 데미지 감소 (플레이어 레벨이 더 높을 때)
                    const lvDiff = p.level - (m.level || 1);
                    if (lvDiff > 0) {
                        const reduction = Math.min(0.9, lvDiff * 0.02);
                        dotDmg = Math.floor(dotDmg * (1 - reduction));
                    }

                    p.hp -= dotDmg;
                    this.log(`[${Game.STATUS_EFFECT_DATA[s.type].name}] 플레이어가 ${dotDmg} 피해를 입었습니다.`, 'lose');
                }
            });
            if (p.hp <= 0) return this.death();
        }

        // 몬스터 도트 데미지 처리
        if (b.monsterStatusEffects) {
            b.monsterStatusEffects.forEach(s => {
                let dotDmg = 0;
                if (s.type === 'bleeding') dotDmg = Math.floor(m.hpMax * 0.04);
                if (s.type === 'burn') dotDmg = Math.floor(m.hpMax * 0.04);
                if (s.type === 'poison') dotDmg = Math.floor(m.hpMax * 0.02);
                if (s.type === 'curse') dotDmg = Math.floor(m.hpMax * 0.05);

                if (dotDmg > 0) {
                    // [NEW] 레벨 차에 따른 데미지 감소 (몬스터 레벨이 더 높을 때)
                    const lvDiff = (m.level || 1) - p.level;
                    if (lvDiff > 0) {
                        const reduction = Math.min(0.9, lvDiff * 0.02);
                        dotDmg = Math.floor(dotDmg * (1 - reduction));
                    }

                    m.hp -= dotDmg;
                    this.log(`[${Game.STATUS_EFFECT_DATA[s.type].name}] ${m.name}이(가) ${dotDmg} 피해를 입었습니다.`, 'crit');
                }
            });
            this.updateMonsterUI();
            if (m.hp <= 0) return this.handleMonsterDeath();
        }

        let mpRecoveryBlocked = b.activeBuffs.some(buff => buff.type === 'mpBlock');

        if (p.job === '마법사' && !mpRecoveryBlocked) {
            if (p.level >= 20) {
                const rLv = p.skillLevels['ms2'] || 0;
                p.mp = Math.min(p.mpMax, p.mp + Math.floor(p.mpMax * (0.05 + rLv * 0.04)));
            }
        }

        if (b.activeBuffs.some(buff => buff.type === 'manaShield')) {
            if (p.mp >= 15) { p.mp -= 15; }
            else { b.activeBuffs = b.activeBuffs.filter(buff => buff.type !== 'manaShield'); this.log(`유지 비용 부족으로 마나 실드가 해제되었습니다.`, 'system'); }
        }

        if (p.job === '전사' && p.level >= 90 && (p.hp / p.hpMax) <= 0.3) {
            const rLv = p.skillLevels['ws9'] || 0;
            let heal = Math.floor(p.hpMax * (0.1 + rLv * 0.04));
            p.hp = Math.min(p.hpMax, p.hp + heal);
            this.log(`[강철 심장] HP ${heal} 회복.`, 'gain');
        }

        for (let k in b.skillCooldowns) {
            if (b.skillCooldowns[k] > 0) b.skillCooldowns[k]--;
        }

        // 지속 시간 감소 및 만료 처리
        b.activeBuffs.forEach(buff => buff.duration--);
        b.activeBuffs = b.activeBuffs.filter(buff => buff.duration > 0 || buff.type === 'manaShield');

        if (b.playerStatusEffects) {
            b.playerStatusEffects.forEach(s => s.duration--);
            b.playerStatusEffects = b.playerStatusEffects.filter(s => s.duration > 0);
        }

        if (b.monsterStatusEffects) {
            b.monsterStatusEffects.forEach(s => s.duration--);
            b.monsterStatusEffects = b.monsterStatusEffects.filter(s => s.duration > 0);
        }

        b.turnCount++;
        this.updateStats();
        this.updateUI();
    }

    /**
     * 전투 승리 시 보상 및 상태 업데이트를 처리합니다.
     */
    victory(mN, isB) {
        const p = this.gameState.player; const w = this.gameState.world;
        const b = this.currentBattle;
        if (!b || !b.monster) return;

        const m = b.monster;
        const xp = m.xp || 0;
        const g = Math.floor((m.gold || 0) * 1.4); // 몬스터 사냥 골드 40% 상향
        p.xp += xp; p.gold += g;

        this.log(`${mN} 처치!`, 'victory');
        this.log(`${xp} XP, ${g} G 획득.`, 'gain');

        // 일일 의뢰 진행도 체크 (모든 마을의 처치 의뢰 슬롯 확인)
        Object.values(w.quests || {}).forEach(tQs => {
            const q = tQs.hunt;
            if (q && !q.completed) {
                const questTargetName = this.stripMutantMonsterName(mN);
                if (q.monsterName === questTargetName) {
                    q.currentCount++;
                    this.log(`[의뢰] ${mN} 처치 (${q.currentCount}/${q.targetCount})`, 'system');
                    if (q.currentCount >= q.targetCount) {
                        q.completed = true;
                        this.log(`의뢰 목표 달성! 해당 마을 의뢰소에서 보상을 받으십시오.`, 'reinforce-success');
                    }
                }
            }
        });

        if (p.xp >= p.xpNext) this.levelUp();

        if (b.type === 'mid') {
            // 첫 중간보스 격파 시 진행도 저장
            p.defeatedMidBosses[b.dungeon.id] = { defeated: true, day: w.day };
            this.log('중간 보스를 최초로 처치했습니다! 마을로 돌아가 재정비하십시오.', 'system');
        } else if (b.type === 'mid_sequential') {
            // 연속 전투 중 중간보스 격파 시 최종보스 도전 기회 제공
            this.log('중간 보스를 격파했습니다! 최종 보스가 나타나기 전 정비할 수 있습니다.', 'system');
            const panel = document.getElementById('action-panel');
            panel.innerHTML = `<button onclick="game.startBattle(GAME_DATA.TOWNS.find(t => t.id === '${w.currentLocation}').dungeon, true, ${b.step}, 'boss')">최종 보스에게 도전</button>
                               <button class="secondary" onclick="game.exitDungeon()">귀환</button>`;
            this.currentBattle = null;
            return;
        } else if (isB || b.type === 'boss') {
            // 보스 격파 시 다음 마을 해금
            const curr = GAME_DATA.TOWNS.find(t => t.id === this.gameState.world.currentLocation);
            const next = GAME_DATA.TOWNS[GAME_DATA.TOWNS.indexOf(curr) + 1];
            if (next && !p.unlockedTowns.includes(next.id)) { p.unlockedTowns.push(next.id); this.log(`${next.name} 해금!`, 'system'); }

            // 80레벨 이상 보스(Zone 4 이상) 처치 시 20% 확률로 레시피 드랍
            if (curr.tier >= 4 && Math.random() < 0.2) {
                this.handleRecipeDrop();
            }
        }

        // 초월 보스 처치 시 확정적으로 해당 던전 티어의 초월 장비 드랍
        if (b.monster.isTranscendenceBoss) {
            this.handleTranscendenceDrop(b.dungeon);
        }

        // 몬스터 전리품 획득 로직
        if (m.loots && m.loots.length > 0) {
            m.loots.forEach(lootName => {
                if (Math.random() < 0.5) { // 50% 확률로 고유 전리품 획득
                    if (p.inventory.length < p.invMax) {
                        const existing = p.inventory.find(it => it.name === lootName && it.category === 'MATERIAL');
                        if (existing) {
                            existing.count = (existing.count || 1) + 1;
                        } else {
                            p.inventory.push({ name: lootName, category: 'MATERIAL', count: 1, price: (m.tier || 1) * 20 });
                        }
                        this.log(`전리품 <strong>[${lootName}]</strong>을(를) 획득했습니다.`, 'gain');
                    } else {
                        this.log(`전리품 ${lootName}을(를) 발견했지만 가방이 가득 찼습니다.`, 'lose');
                    }
                }
            });
        }

        this.updateUI();

        // 몬스터 처치 시 포션 드랍 로직 추가
        this.handlePotionDrop(b);
    }

    /**
     * 전투 승리 시 확률적으로 포션을 드랍합니다.
     */
    handlePotionDrop(battle) {
        const p = this.gameState.player;
        const b = battle;
        const tier = GAME_DATA.TOWNS.find(t => t.id === this.gameState.world.currentLocation).tier;

        let dropChance = 0.08; // 일반 몬스터 8%
        if (b.type === 'mid' || b.type === 'mid_sequential') dropChance = 0.35; // 중간 보스 35%
        else if (b.isBoss || b.type === 'boss') dropChance = 0.7; // 최종 보스 70%

        if (Math.random() < dropChance) {
            // 현재 던전 티어에 맞는 포션 풀 구성
            const potionPool = GAME_DATA.ITEMS.CONSUMABLES.filter(i => (i.tier || 0) <= tier);
            if (potionPool.length === 0) return;

            const potion = potionPool[Math.floor(Math.random() * potionPool.length)];

            if (p.inventory.length < p.invMax) {
                const existing = p.inventory.find(i => i.id === potion.id && i.category === 'CONSUMABLES');
                if (existing) existing.count = (existing.count || 1) + 1;
                else p.inventory.push({ ...potion, category: 'CONSUMABLES', count: 1, plus: 0 });
                this.log(`몬스터가 <strong>${potion.name}</strong>을(를) 떨어뜨렸습니다!`, 'gain');
                this.updateUI();
            } else {
                this.log(`몬스터가 ${potion.name}을(를) 떨어뜨렸지만 가방이 가득 찼습니다.`, 'lose');
            }
        }
    }

    /**
     * 레벨 업을 처리합니다. 최대 체력/마력이 상승하고 즉시 회복됩니다.
     */
    levelUp() {
        const p = this.gameState.player; p.level++; p.xp -= p.xpNext; p.xpNext = Math.floor(p.xpNext * 1.12);
        this.recalculateMaxStats();
        p.hp = p.hpMax; p.mp = p.mpMax; this.updateStats();
        this.log(`LEVEL UP! ${p.level} 레벨 달성!`, 'system');
    }

    /**
     * 사망 시 처리: 골드 유실 및 HP/MP 전계 회복 후 마을 귀환
     */
    death() {
        const p = this.gameState.player; const lg = Math.floor(p.gold * 0.15);
        p.gold -= lg; p.hp = p.hpMax; p.mp = p.mpMax;

        this.log('--- 치명적 패배 ---', 'death-notice');
        this.log(`${lg} G를 유실하고 근처 마을에서 치료를 받아 부활했습니다.`, 'lose');

        document.body.classList.remove('in-dungeon');
        document.getElementById('monster-status').classList.add('hidden');
        this.currentBattle = null;
        this.renderTownActions();
        this.updateUI();
    }


    /**
     * 레시피 드랍 처리
     */
    handleRecipeDrop() {
        const p = this.gameState.player;
        const recipeKeys = Object.keys(GAME_DATA.RECIPES);
        const rKey = recipeKeys[Math.floor(Math.random() * recipeKeys.length)];
        const recipe = GAME_DATA.RECIPES[rKey];

        if (!p.discoveredRecipes.includes(rKey) && !p.unlockedRecipes.includes(rKey)) {
            p.discoveredRecipes.push(rKey);
            this.log(`역사적인 발견! <strong>[${recipe.name}]</strong>을(를) 획득했습니다.`, 'victory');
        }
    }

    /**
     * 초월 장비 드랍 처리
     */
    handleTranscendenceDrop(dg) {
        const p = this.gameState.player;
        const type = Math.random() < 0.5 ? 'WEAPONS' : 'ARMORS';
        const item = GAME_DATA.ITEMS[type].find(i => i.grade === '초월');

        if (item && p.inventory.length < p.invMax) {
            p.inventory.push({ ...item, category: type, count: 1, plus: 0 });
            this.log(`!!! 천상의 기운이 서린 <strong>[${item.name}]</strong>을(를) 획득했습니다 !!!`, 'victory');
        } else {
            this.log('초월 장비를 발견했으나 가방이 가득 차 소실되었습니다!', 'death-notice');
        }
    }
    tryEscape() {
        if (this.currentBattle.monster.isTranscendenceBoss || Math.random() < 0.6) { //초월 몬스터는 100% 도망 가능, 일반 60%
            this.log('탈출 성공!', 'system');
            document.body.classList.remove('in-dungeon');
            document.getElementById('monster-status').classList.add('hidden');
            this.currentBattle = null;
            this.renderTownActions();
            this.updateUI();
        }
        else { this.log('탈출 실패!', 'lose'); this.battleTurn(); }
    }

    /**
     * 대장간 모달을 엽니다. 장착 중인 무기와 방어구 중 강화할 대상을 선택합니다.
     */
    /**
     * 대장간: 강화와 제작 탭을 제공합니다.
     */
    openBlacksmith(activeTab = 'reinforce') {
        let h = `
            <div class="building-tabs">
                <button class="building-tab ${activeTab === 'reinforce' ? 'active' : ''}" onclick="game.openBlacksmith('reinforce')">장비 강화</button>
                <button class="building-tab ${activeTab === 'craft' ? 'active' : ''}" onclick="game.openBlacksmith('craft')">장비 제작</button>
            </div>
            <div id="building-content">`;

        if (activeTab === 'reinforce') {
            h += this.getReinforceUI();
        } else {
            h += this.getCraftingUI('blacksmith');
        }

        h += '</div>';
        this.showModal('대장간', h);
    }

    /**
     * 연금술 실험실: 제작 기능만 제공합니다 (80레벨 이상 마을).
     */
    openAlchemyLab() {
        const town = GAME_DATA.TOWNS.find(t => t.id === this.gameState.world.currentLocation);
        if (town.tier < 5) {
            this.showModal('연금술 실험실', '<p>이 시설은 최소 단계 5 이상의 마을(Lv. 80+)에서만 이용 가능합니다.</p>');
            return;
        }

        let h = `<div id="building-content">${this.getCraftingUI('alchemy')}</div>`;
        this.showModal('연금술 실험실', h);
    }

    getReinforceUI() {
        const eq = this.gameState.player.equipment;
        const weapon = eq.weapon;
        const armor = eq.armor;

        if (!weapon && !armor) return '<p style="text-align:center; padding:20px; color:var(--text-dim);">강화할 장착 장비가 없습니다.</p>';

        let h = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding:12px; background:rgba(0,0,0,0.2); border-radius:8px; border:1px solid var(--border-color);">
                <span style="color:var(--text-dim); font-size:0.85rem; font-weight:700;">보유 자금</span>
                <span style="color:var(--gold-color); font-weight:700; font-family:\'Orbitron\', sans-serif; font-size:1.1rem;">${this.gameState.player.gold.toLocaleString()} G</span>
            </div>
            <div class="shop-grid">`;

        const renderEqRow = (it, type, label) => {
            if (!it) return;
            const plus = it.plus || 0;
            const cost = Math.floor(100 * (it.tier || 1) * Math.pow(1.5, plus) * this.gameState.world.inflation);
            let successRate = 0, downRate = 0, destroyRate = 0, failRate = 0;

            if (plus < 4) { successRate = 100; }
            else if (plus < 7) {
                successRate = plus === 4 ? 80 : (plus === 5 ? 65 : 50);
                downRate = plus === 4 ? 5 : (plus === 5 ? 10 : 20);
                failRate = 100 - successRate - downRate;
            } else {
                successRate = plus === 7 ? 35 : (plus === 8 ? 25 : 18);
                downRate = plus === 7 ? 25 : (plus === 8 ? 25 : 30);
                destroyRate = plus === 7 ? 10 : (plus === 8 ? 15 : 20);
                failRate = 100 - successRate - destroyRate - downRate;
            }

            const getStatPreview = (statKey, label) => {
                if (!it[statKey]) return '';
                const cur = Math.floor(it[statKey] * Math.pow(1.12, plus));
                const next = Math.floor(it[statKey] * Math.pow(1.12, plus + 1));
                return `<div>${label} ${cur} <span style="color:var(--accent-cyan)">→ ${next}</span></div>`;
            };

            h += `
                <div class="shop-item" style="flex-direction:column; align-items:flex-start; gap:8px;">
                    <div style="display:flex; justify-content:space-between; width:100%;">
                        <span class="shop-item-name ${this.getGradeClass(it.grade)}">${label}: ${it.name} +${plus}</span>
                        <span class="shop-item-price">${cost.toLocaleString()}G</span>
                    </div>
                    <div style="font-size:0.8rem; width:100%; color:var(--text-dim);">
                        ${getStatPreview('atk', '공격력')} ${getStatPreview('def', '방어력')}
                    </div>
                    <div style="font-size:0.7rem; display:flex; gap:10px;">
                        <span style="color:var(--accent-cyan)">성공: ${successRate}%</span>
                        ${downRate > 0 ? `<span style="color:#ff884d">하락: ${downRate}%</span>` : ''}
                        ${destroyRate > 0 ? `<span style="color:#ff4d4d">파괴: ${destroyRate}%</span>` : ''}
                    </div>
                    <button style="width:100%; margin-top:5px;" onclick="game.reinforce('${type}')">강화 시도</button>
                </div>
            `;
        };
        renderEqRow(weapon, 'weapon', '무기');
        renderEqRow(armor, 'armor', '방어구');
        return h + '</div>';
    }

    /**
     * 제작 UI 생성 (두 칸 구성)
     */
    getCraftingUI(type) {
        const p = this.gameState.player;
        const category = type === 'blacksmith' ? ['WEAPONS', 'ARMORS'] : ['CONSUMABLES'];

        // 해당 카테고리에 속한 모든 제작 아이템(신화/순수 등) 리스트
        const items = [];
        category.forEach(cat => {
            GAME_DATA.ITEMS[cat].forEach(it => {
                if (it.grade === '신화' || it.grade === '순수') {
                    items.push({ ...it, cat });
                }
            });
        });

        let listHtml = '';
        items.forEach(it => {
            let stateClass = ''; // Default Gray
            const recipeKey = 'r_' + it.id;
            if (p.unlockedRecipes.includes(recipeKey)) stateClass = 'unlocked'; // White
            else if (p.discoveredRecipes.includes(recipeKey)) stateClass = 'has-item'; // Yellow

            listHtml += `<button class="crafting-item-btn ${stateClass}" onclick="game.selectCraftItem('${it.id}', '${type}')">${it.name}</button>`;
        });

        return `
            <div class="crafting-container">
                <div class="crafting-list">${listHtml}</div>
                <div id="crafting-detail-pane" class="crafting-detail">
                    <div class="crafting-empty-state">왼쪽 리스트에서 아이템을 선택하십시오.</div>
                </div>
            </div>
        `;
    }

    /**
     * 제작 아이템 상세 정보 표시
     */
    selectCraftItem(id, type) {
        const p = this.gameState.player;
        const cat = type === 'blacksmith' ? (id.startsWith('w') ? 'WEAPONS' : 'ARMORS') : 'CONSUMABLES';
        const it = GAME_DATA.ITEMS[cat].find(i => i.id === id);
        const craftData = GAME_DATA.CRAFTING[id];
        const recipeKey = 'r_' + id;

        const isDiscovered = p.discoveredRecipes.includes(recipeKey);
        const isUnlocked = p.unlockedRecipes.includes(recipeKey);

        let h = `
            <div class="crafting-header">
                <div class="crafting-name ${this.getGradeClass(it.grade)}">${it.name}</div>
                <div class="crafting-desc">${it.atk ? '공격력 +' + it.atk : (it.def ? '방어력 +' + it.def : '효과: HP ' + it.hp + ' 회복')}</div>
            </div>
            <div class="materials-section">
                <h4 style="margin-bottom:10px; font-size:0.85rem; color:var(--text-dim);">필요 재료</h4>
                <div class="materials-list">
        `;

        let canCraft = isUnlocked && p.gold >= (craftData.gold || 0);

        const getOwnedCount = (mName) => {
            const item = p.inventory.find(it => it.name === mName && it.category === 'MATERIAL');
            return item ? (item.count || 1) : 0;
        };

        if (craftData.materials) {
            for (const [matName, needed] of Object.entries(craftData.materials)) {
                const owned = getOwnedCount(matName);
                const suffice = owned >= needed;
                if (!suffice) canCraft = false;
                h += `
                    <div class="material-item ${suffice ? 'sufficient' : 'lacking'}">
                        <span>${matName}</span>
                        <span>${owned} / ${needed}</span>
                    </div>
                `;
            }
        }

        h += `
            <div class="material-item ${p.gold >= (craftData.gold || 0) ? 'sufficient' : 'lacking'}">
                <span>필요 골드</span>
                <span>${p.gold.toLocaleString()} / ${(craftData.gold || 0).toLocaleString()} G</span>
            </div>
        `;

        h += `</div></div><div class="crafting-footer">`;

        if (isUnlocked) {
            h += `<button onclick="game.craftItem('${id}', '${type}')" ${canCraft ? '' : 'disabled'}>아이템 제작</button>`;
        } else if (isDiscovered) {
            h += `<button class="secondary" onclick="game.useRecipe('${recipeKey}', '${type}')">레시피 사용</button>`;
        } else {
            h += `<p style="font-size:0.8rem; color:var(--hp-color);">레시피가 필요합니다.</p>`;
        }

        h += `</div>`;

        const pane = document.getElementById('crafting-detail-pane');
        pane.innerHTML = h;

        // 버튼 활성화 상태 시각화
        const btns = document.querySelectorAll('.crafting-item-btn');
        btns.forEach(b => b.classList.remove('active'));
        event.currentTarget.classList.add('active');
    }

    useRecipe(rKey, type) {
        const p = this.gameState.player;
        const idx = p.discoveredRecipes.indexOf(rKey);
        if (idx > -1) {
            p.discoveredRecipes.splice(idx, 1);
            p.unlockedRecipes.push(rKey);
            this.log('레시피를 습득하여 이제 해당 아이템을 제작할 수 있습니다!', 'gain');
            if (type === 'blacksmith') this.openBlacksmith('craft');
            else this.openAlchemyLab();
        }
    }

    craftItem(id, type) {
        const p = this.gameState.player;
        const craftData = GAME_DATA.CRAFTING[id];
        const cat = type === 'blacksmith' ? (id.startsWith('w') ? 'WEAPONS' : 'ARMORS') : 'CONSUMABLES';
        const itData = GAME_DATA.ITEMS[cat].find(i => i.id === id);

        const getOwnedCount = (mName) => {
            const item = p.inventory.find(it => it.name === mName && it.category === 'MATERIAL');
            return item ? (item.count || 1) : 0;
        };

        // 최종 검증
        if (p.gold < (craftData.gold || 0)) return;
        if (craftData.materials) {
            for (const [matName, needed] of Object.entries(craftData.materials)) {
                if (getOwnedCount(matName) < needed) return;
            }
        }
        if (p.inventory.length >= p.invMax) { alert('가방 가득 참'); return; }

        // 소비
        p.gold -= (craftData.gold || 0);
        if (craftData.materials) {
            for (const [matName, needed] of Object.entries(craftData.materials)) {
                const invIdx = p.inventory.findIndex(it => it.name === matName && it.category === 'MATERIAL');
                const item = p.inventory[invIdx];
                item.count -= needed;
                if (item.count <= 0) p.inventory.splice(invIdx, 1);
            }
        }

        // 획득
        p.inventory.push({ ...itData, category: cat, count: 1, plus: 0 });
        this.log(`성공적으로 <strong>[${itData.name}]</strong>을(를) 제작하였습니다!`, 'reinforce-success');

        this.updateUI();
        if (type === 'blacksmith') this.openBlacksmith('craft');
        else this.openAlchemyLab();
    }

    /**
     * 장비를 강화합니다. (성공 시 능력치 상승, 실패 시 하락 또는 파괴 위험)
     * 등급에 따라 성공 확률이 낮아지고 리스크가 커집니다.
     */
    reinforce(type) {
        const p = this.gameState.player; const eq = p.equipment;
        const target = eq[type];
        if (!target) return;

        const plus = target.plus || 0;
        const cost = Math.floor(100 * (target.tier || 1) * Math.pow(1.5, plus) * this.gameState.world.inflation);

        // 골드 부족 체크
        if (p.gold < cost) { alert('골드 부족'); return; }
        p.gold -= cost;

        const r = Math.random() * 100;
        let result = 'success'; // success, fail, down, destroy

        if (plus < 4) {
            // +4단계까지는 100% 성공
            result = 'success';
        } else if (plus < 7) {
            // +5 ~ +7 구간: 실패 및 하락 확률 존재
            const successRate = plus === 4 ? 80 : (plus === 5 ? 65 : 50);
            const downRate = plus === 4 ? 5 : (plus === 5 ? 10 : 20);
            if (r < successRate) result = 'success';
            else if (r < successRate + downRate) result = 'down';
            else result = 'fail';
        } else {
            // +8 ~ +10 구간: 파괴 확률 발생
            const successRate = plus === 7 ? 35 : (plus === 8 ? 25 : 18);
            const downRate = plus === 7 ? 25 : (plus === 8 ? 25 : 30);
            const destroyRate = plus === 7 ? 10 : (plus === 8 ? 15 : 20);
            if (r < successRate) result = 'success';
            else if (r < successRate + destroyRate) result = 'destroy';
            else if (r < successRate + destroyRate + downRate) result = 'down';
            else result = 'fail';
        }

        // 강화 결과 처리 및 로그 출력
        if (result === 'success') {
            target.plus = (target.plus || 0) + 1;
            this.log(`[강화 성공] ${target.name} +${target.plus} 달성!`, 'reinforce-success');
        } else if (result === 'down') {
            target.plus = Math.max(0, (target.plus || 0) - 1);
            this.log(`[강화 실패] ${target.name}의 강화 단계가 하락했습니다...`, 'reinforce-down');
        } else if (result === 'destroy') {
            this.log(`[강화 실패] !!! ${target.name}이(가) 파괴되었습니다 !!!`, 'reinforce-destroy');
            if (eq.weapon === target) eq.weapon = null;
            else if (eq.armor === target) eq.armor = null;
        } else {
            this.log(`[강화 실패] ${target.name} 강화에 실패했습니다.`, 'reinforce-fail');
        }

        this.updateStats(); this.updateUI(); this.openBlacksmith();
    }

    /**
     * 의뢰소: 일일 의뢰 수락·보상 UI (마을 건물에서만 열립니다).
     */
    openQuest() {
        const w = this.gameState.world;
        const p = this.gameState.player;
        const townId = w.currentLocation;
        this.invalidateStaleDailyQuest();

        if (!w.quests[townId]) w.quests[townId] = { hunt: null, collect: null };
        const qs = w.quests[townId];
        let h = '<div class="quest-slots-container">';

        ['hunt', 'collect'].forEach((type, idx) => {
            const q = qs[type];
            const typeName = type === 'hunt' ? '처치 의뢰' : '전리품 수집';
            const typeDesc = type === 'hunt' ? '지정된 몬스터 처치' : '몬스터 전리품 수집';

            h += `
                <div class="quest-slot-card ${idx === 0 ? 'top' : 'bottom'}">
                    <div class="quest-slot-header">
                        <span class="slot-type-tag">${typeName}</span>
                        <span class="slot-desc-text">${typeDesc}</span>
                    </div>
            `;

            if (!q) {
                h += `
                    <div class="quest-welcome">
                        <p>오늘의 새로운 의뢰를 기다리고 있습니다.</p>
                        <button onclick="game.generateDailyQuest('${type}')">의뢰 수락</button>
                    </div>
                `;
            } else {
                const isCollect = q.type === 'collect';
                let currentCount = q.currentCount;

                if (isCollect) {
                    const material = p.inventory.find(it => it.name === q.itemName && it.category === 'MATERIAL');
                    currentCount = material ? material.count : 0;
                }

                const rewardText = this.questRewardIsGold(q.reward)
                    ? `${q.reward.amount} G`
                    : `${q.reward.name} ${q.reward.amount}개`;
                const progress = Math.min(100, (currentCount / q.targetCount) * 100);
                const isCompleted = q.completed || (isCollect && currentCount >= q.targetCount);

                h += `
                    <div class="quest-item-content">
                        <div class="quest-info-row">
                            <h3 class="quest-title">[일일] ${isCollect ? q.itemName + ' 수집' : q.monsterName + ' 처치'}</h3>
                            <span class="quest-target-detail">목표: ${isCollect ? q.itemName + ' ' + q.targetCount + '개' : q.monsterName + ' ' + q.targetCount + '마리'}</span>
                        </div>
                        
                        <div class="quest-progress-section">
                            <div class="progress-info">
                                <span>진행도</span>
                                <span>${currentCount} / ${q.targetCount}</span>
                            </div>
                            <div class="progress-container mini">
                                <div class="progress-bar" style="width:${progress}%;"></div>
                            </div>
                        </div>

                        <div class="quest-reward-row">
                            <span class="reward-label">보상</span>
                            <span class="reward-value">${rewardText}</span>
                        </div>

                        <div class="quest-footer-actions">
                            ${isCompleted ?
                        `<button class="claim-btn" onclick="game.claimQuestReward('${type}')" ${q.claimed ? 'disabled' : ''}>${q.claimed ? '수령 완료' : '보상 받기'}</button>` :
                        `<p class="quest-hint-text">${isCollect ? '몬스터 전리품을 모으십시오.' : '목표 몬스터를 처치하십시오.'}</p>`
                    }
                        </div>
                    </div>
                `;
            }
            h += `</div>`;
        });

        h += '</div>';

        this.showModal('마을 의뢰소', h);
        this.updateUI();
    }

    /**
     * 일일 의뢰를 생성합니다.
     */
    generateDailyQuest(type) {
        const w = this.gameState.world;
        const townId = w.currentLocation;
        const dungeon = GAME_DATA.TOWNS.find(t => t.id === townId).dungeon;
        const monsters = GAME_DATA.MONSTERS[dungeon.id].filter(m => !m.isBoss && !m.isMidBoss);

        if (monsters.length === 0) {
            this.log('이 지역에는 의뢰 대상 몬스터가 없습니다.', 'system');
            return;
        }

        const m = monsters[Math.floor(Math.random() * monsters.length)];
        let targetCount, itemName, goldRewardMult;

        if (type === 'hunt') {
            targetCount = 2 + Math.floor(Math.random() * 2); // 2 ~ 3마리
            goldRewardMult = 1.7;
        } else {
            // 수집 대상 아이템 선정 (몬스터 전리품 중 무작위)
            itemName = m.loots[Math.floor(Math.random() * m.loots.length)];
            targetCount = 3 + Math.floor(Math.random() * 5); // 3 ~ 7개
            goldRewardMult = 2.5;
        }

        // 보상 결정 (수집 의뢰는 항상 골드 보상)
        const isGold = type === 'collect' || Math.random() < 0.5;
        const goldAmount = () => Math.max(1, Math.floor((m.gold || 0) * targetCount * goldRewardMult));
        let reward;

        if (isGold) {
            reward = { rewardType: 'gold', amount: goldAmount() };
        } else {
            const tier = Number(GAME_DATA.TOWNS.find(t => t.id === townId)?.tier) || 1;
            const potion = GAME_DATA.ITEMS.CONSUMABLES.find(
                i => Number(i.tier) === tier && i.hp != null && i.hp > 0
            );
            if (potion) {
                reward = {
                    rewardType: 'potion',
                    amount: Math.max(1, Math.floor(targetCount / 2)),
                    category: 'CONSUMABLES',
                    id: potion.id,
                    name: potion.name,
                    tier: potion.tier,
                    hp: potion.hp,
                    price: potion.price
                };
            } else {
                reward = { rewardType: 'gold', amount: goldAmount() };
            }
        }

        w.quests[townId][type] = {
            type: type,
            monsterName: m.name,
            itemName: itemName,
            targetCount: targetCount,
            currentCount: 0,
            reward: reward,
            day: w.day,
            townId: townId,
            completed: false,
            claimed: false
        };

        const msg = type === 'hunt'
            ? `처치 의뢰 수락: ${m.name} ${targetCount}마리`
            : `장리품 수집 수락: ${itemName} ${targetCount}개`;
        this.log(msg, 'system');
        this.openQuest();
    }

    /**
     * 의뢰 보상을 수령합니다.
     */
    claimQuestReward(type) {
        const w = this.gameState.world;
        const p = this.gameState.player;
        const townId = w.currentLocation;
        const q = w.quests[townId] ? w.quests[townId][type] : null;

        if (!q || q.claimed) return;

        const isCollect = type === 'collect';
        let currentCount = q.currentCount;
        if (isCollect) {
            const material = p.inventory.find(it => it.name === q.itemName && it.category === 'MATERIAL');
            currentCount = material ? material.count : 0;
        }

        const isCompleted = q.completed || (isCollect && currentCount >= q.targetCount);
        if (!isCompleted) return;

        // 아이템 소모 (수집 퀘스트)
        if (isCollect) {
            const invIdx = p.inventory.findIndex(it => it.name === q.itemName && it.category === 'MATERIAL');
            if (invIdx > -1) {
                p.inventory[invIdx].count -= q.targetCount;
                if (p.inventory[invIdx].count <= 0) p.inventory.splice(invIdx, 1);
            }
        }

        if (this.questRewardIsGold(q.reward)) {
            const amt = Math.max(0, Math.floor(Number(q.reward.amount) || 0));
            p.gold += amt;
            this.log(`의뢰 보상으로 ${amt} G를 획득했습니다.`, 'gain');
        } else {
            if (p.inventory.length >= p.invMax) {
                alert('가방이 가득 차 보상을 받을 수 없습니다.');
                return;
            }
            const existing = p.inventory.find(i => i.id === q.reward.id && i.category === 'CONSUMABLES');
            if (existing) {
                existing.count = (existing.count || 1) + q.reward.amount;
            } else {
                p.inventory.push({
                    id: q.reward.id,
                    name: q.reward.name,
                    tier: q.reward.tier,
                    hp: q.reward.hp,
                    mp: q.reward.mp,
                    price: q.reward.price,
                    category: 'CONSUMABLES',
                    count: q.reward.amount,
                    plus: 0
                });
            }
            this.log(`의뢰 보상으로 ${q.reward.name} ${q.reward.amount}개를 획득했습니다.`, 'gain');
        }

        q.claimed = true;
        this.updateUI();
        this.openQuest();
    }

    /**
     * 화면 중앙에 모달창을 띄웁니다.
     */
    showModal(t, b) {
        document.getElementById('modal-title').innerText = t;
        document.getElementById('modal-body').innerHTML = b;
        document.getElementById('game-modal').classList.remove('hidden');
    }

    /**
     * 모달창을 닫습니다.
     */
    closeModal() {
        document.getElementById('game-modal').classList.add('hidden');
    }
}

// 싱글톤 게임 인스턴스 생성 및 전역 연결
const game = new Game();
