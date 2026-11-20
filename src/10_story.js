// ================= STORY & DIALOGUE =================
const AR = (t, o = {}) => say('Ардан', t, Object.assign({ p: 'hero' }, o));
const IV = (t, m = 0, o = {}) => say('Ивель', t, Object.assign({ p: 'ivel', m }, o));
const AN = (t, o = {}) => say('Ансельм', t, Object.assign({ p: 'ansel' }, o));
function gainPrayer(id) { if (!G.prayers.includes(id)) { G.prayers.push(id); sfx('levelup'); note('Новая молитва: ' + PRAYERS[id].n); } }
function gainItem(id) { if (addItem(id)) { sfx('item'); note('Получено: ' + ITEMS[id].n); } }
function gainEquip(id) { G.flags['own_' + id] = true; sfx('equip'); note('Получено: ' + EQUIP[id].n); }
function removeEnt(id) { World.ents = World.ents.filter(e => e.id !== id); }

const STORY = {
  async intro() {
    Game.scene = 'cine'; Game.cine = 'moon'; Game.cineT = 0; Music.play('t01', { fade: 2 });
    await fade(0, 2);
    await nar('Сто лет назад король Альдерих Серый испугался смерти.', { top: true });
    await nar('Серая чума шла по его землям, и король заключил договор с Пустотой: никто в его королевстве не умрёт.', { top: true });
    await nar('Пустота сдержала слово. Королевство уснуло — и больше не проснулось.', { top: true });
    Game.cine = 'seal'; Game.cineT = 0; flash('#9fd0ff', 0.4);
    await nar('Тогда трое из Ордена Бледной Луны — два рыцаря и жрица — запечатали короля под Озером Забвения.', { top: true });
    await nar('Печать стоила жизни рыцарю. Его пепел упокоили в часовне на краю леса.', { top: true });
    Game.cine = 'moon2'; Game.cineT = 0;
    await nar('Прошло сто лет. Этой ночью луна заплакала пеплом.', { top: true });
    await nar('И печать дала трещину.', { top: true, shake: 0.4 });
    await fade(1, 1.5);
    Game.scene = 'world'; Game.hidePlayer = true;
    await card('Пролог', 'Пепельное бдение');
    await gotoMap('chapel', 9, 9, 0, { nofade: true });
  },
  async chapelWake() {
    Game.hidePlayer = true; World.player.x = 9 * 16 + 8; World.player.y = 9 * 16 + 14;
    const an = entById('ansel'); an.x = 7 * 16 + 8; an.y = 9 * 16 + 14; an.dir = 2;
    World.camLock = { x: 9 * 16 + 8, y: 8 * 16, sp: 4 };
    await fade(0, 1.5);
    await wait(0.8);
    await AN('...и да не погаснет луна. И да не погаснет луна...');
    await AN('Сто лет я читаю эту молитву над твоим прахом, сэр Ардан. Сто лет — и ни единого ответа.', { m: 2 });
    await wait(0.6); sfx('rumble'); shake(3); await wait(0.8);
    sfx('light'); flash('#9fd0ff', 1); shake(5);
    for (let i = 0; i < 40; i++) addPart({ x: 9 * 16 + 16 + rnd(-10, 10), y: 8 * 16 + 8 + rnd(-4, 4), vx: rnd(-50, 50), vy: rnd(-70, -10), max: rnd(0.8, 2), col: pick(['#8a8890', '#a8a6ae', '#8fd8ff']), size: pick([1, 2]), grav: 30 });
    Game.hidePlayer = false; face('player', 0);
    await wait(1);
    emote(an, '!'); an.dir = 2; await wait(0.8);
    await AN('Сэр... Ардан?! Владычица Луна... Значит, печать и правда треснула.', { m: 0 });
    let c = await choose(['Кто ты?', 'Где я?', '...']);
    if (c === 0) await AN('Ансельм. Хранитель этой часовни — и, видно, последний, кто ещё помнит Орден.');
    else if (c === 1) await AN('В Пепельной часовне, на краю Туманного леса. Здесь сто лет покоился твой прах.');
    else await AN('Понимаю. После ста лет в урне я бы тоже молчал.');
    await AN('Ты пал в ночь Запечатывания, сэр. Твою жизнь забрала печать, что держит Забытого Короля под озером.');
    await AN('Мы сохранили твой пепел... на случай, если печать падёт. Ты сам так велел.');
    await AN('Теперь луна плачет пеплом, а мёртвые не спят. Что-то пробуждается.', { m: 2 });
    await AN('Ступай в Терновую Стену — деревню за лесом, на севере. Старейшина Мирра знает больше меня.');
    await wait(0.3); sfx('caw', { rate: 2.2, vol: 0.4 }); emote(an, '?');
    await AN('Но сперва... слышишь писк? В очаге у дверей опять завелась пепельная крыса.');
    await AN('Покажи старику, что твой меч ещё помнит своё дело.');
    camFree();
    const res = await battle(['ashrat'], {
      area: 'chapel', music: 't05',
      intro: async () => {
        await btext('[y]Это бой![/] Внизу — команды. Выбирай стрелками, подтверждай [y]Enter[/] (на телефоне — [y]A[/]).');
        await btext('[y]УДАР[/] — атака: останови полосу в центре. [y]ДЕЙСТВИЕ[/] — поговори с врагом, наполни его [y]покой[/] и [y]пощади[/].');
        await btext('[y]МОЛИТВА[/] тратит [y]Дух[/] (шкала слева). [y]ЩИТ[/] вдвое снижает урон.');
      },
      beforeAttack: async () => { if (!F('tut_dodge')) { setF('tut_dodge'); await btext('Ход врага! Двигай [b]щит-искру[/] и уклоняйся. Нажми [y]Enter/A[/] в миг удара — это [y]парирование[/]: снаряд разлетится! Касаясь снарядов вскользь, копишь Дух.'); } }
    });
    setF('rat_done');
    if (res === 'spare') await AN('Ты пощадил её... Орден всегда учил милосердию. Хорошо, что хоть это ты не забыл.');
    else await AN('Рука не дрогнула. Хорошо. Там, снаружи, будут твари и пострашнее.');
    await AN('Вон та голубая свеча — [b]Свеча Обета[/]. Коснись её пламени: оно залечит раны и запомнит твой путь.');
    await AN('Если падёшь, пламя вернёт тебя к последней свече. Ну... или я помолюсь ещё сто лет.');
    gainItem('bread');
    await AN('Возьми хлеба в дорогу. Он чёрствый, но рыцарю не привыкать. Пусть луна хранит тебя, сэр Ардан.');
    setF('intro_done');
  },
  async ivelMeet(e) {
    await nar('На ветке мёртвого дерева висит старый фонарь. Внутри бьётся голубой огонёк.');
    await IV('Ой! Ты... ты меня видишь? Правда видишь?!', 1);
    await IV('Наконец-то! Я тут вишу уже... очень долго. Кажется. Выпусти меня, пожалуйста!');
    const c = await choose(['Открыть фонарь', 'Уйти']);
    if (c === 1) { await IV('Эй! Не уходи! Тут же туман... и волки... и скучно!', 2); return; }
    sfx('light'); flash('#9fd0ff', 0.8);
    removeEnt('lantern');
    World.ivel = { x: e.x, y: e.y };
    setF('ivel');
    for (let i = 0; i < 30; i++) addPart({ x: e.x + 3, y: e.y - 20, vx: rnd(-40, 40), vy: rnd(-40, 20), max: rnd(0.6, 1.4), col: pick(['#8fc8ff', '#e8f6ff', '#3a6aff']), glow: 1 });
    await wait(0.6);
    await IV('Свобода! Ух! Я — Ивель. По крайней мере, мне так кажется...', 1);
    await IV('Я ничего не помню. Только свет. И... твоё лицо? Хотя нет, у тебя вместо лица шлем. И пепел. Ты весь из пепла!');
    const c2 = await choose(['Я — Ардан, рыцарь Ордена', '...']);
    if (c2 === 0) await IV('Ардан... Красивое имя. Почему-то мне от него тепло.');
    else await IV('Молчаливый рыцарь! Ладно, буду болтать за двоих.');
    await IV('Рыцарям ведь нужен свет? Можно я пойду с тобой? Я умею разгонять туман! И, кажется, умею кое-что ещё...');
    gainPrayer('moon');
    await IV('Видишь? Лунный луч! Нежить его терпеть не может. Пойдём, туман на севере больше не помеха.', 1);
    sfx('chime'); await nar('Туман на северной тропе редеет.');
  },
  async villageArrive() {
    await IV('Деревня! Настоящие живые люди! ...Они на нас смотрят.', 1);
    await IV('Наверное, из-за пепла. Или из-за меня. Или потому что ты страшно гремишь. Найдём старейшину Мирру!');
  },
  async cathEnter() {
    sfx('bigbell', { vol: 0.6 });
    await IV('Брр... Колокола! Слышишь? Звон идёт сверху — из трёх башен сразу.', 2);
    await IV('Если заглушить все три колокола, Епископ останется без голоса. Ищи рычаги!');
  },
  async lever(e) {
    if (F(e.flag)) { await nar('Рычаг уже опущен.'); return; }
    const c = await choose(['Опустить рычаг', 'Не трогать']); if (c) return;
    sfx('lever'); setF(e.flag); await wait(0.4);
    const n = ['lv1', 'lv2', 'lv3'].filter(F).length;
    sfx('bigbell', { rate: 0.6, vol: 0.5 }); shake(2);
    await nar(`Высоко наверху колокол глухо стонет — и замолкает. (${n}/3)`);
    if (e.flag === 'lv1') { sfx('door'); await nar('Неподалёку со скрежетом поднимается решётка.'); }
    if (n === 3) { setF('bells'); await wait(0.5); sfx('rumble'); shake(4); await nar('Собор погружается в тишину. В глубине нефа с грохотом открывается путь к алтарю.'); await IV('Тишина... Теперь он нас услышит.'); }
  },
  async bishopFight() {
    const b = entById('bishop');
    await camTo(17, 4, 2);
    await say('Ржавый Епископ', 'Кто... КТО посмел заглушить мои колокола?!', { shake: 0.6 });
    await say('Ржавый Епископ', 'Без набата паства уснёт — и не проснётся! Я один держу их на ногах! Сто лет я звоню, рыцарь!');
    const c = await choose(['Они хотят покоя', 'Твоё время вышло']);
    if (c === 0) await say('Ржавый Епископ', 'Покоя?! Покой — это смерть! Я не отдам им ни одной души!');
    else await say('Ржавый Епископ', 'Время? Время остановилось сто лет назад, глупец!');
    sfx('roar'); camFree();
    const r = await battle(['bishop'], { area: 'cathedral', music: 't19', boss: true });
    setF('bishop_done'); removeEnt('bishop');
    if (r === 'spare') { await IV('Он просто... очень устал. Как и все здесь.', 2); }
    else { await IV('Колокола замолчали навсегда. Надеюсь, хоть теперь он спит спокойно.', 2); }
    sfx('item'); await nar('В ржавой пыли лежит тяжёлый ключ.'); gainItem('cryptkey');
    gainPrayer('flurry');
    await IV('Ключ! Наверное, Мирра знает, от чего он. Вернёмся в деревню.');
  },
  async cryptEnter() {
    await IV('Здесь так темно... Держись ближе ко мне, ладно? Я посвечу.', 2);
    await IV('И... Ардан? Здесь пахнет чем-то знакомым. Как будто я уже бывала тут. Странно.');
  },
  async brazier(e) {
    if (F('crypt_puzzle')) { await nar('Огонь горит ровно и холодно.'); return; }
    if (e.lit) { await nar('Жаровня уже горит зелёным огнём.'); return; }
    e.lit = true; sfx('fire');
    const order = ['E', 'S', 'W', 'N'];
    G.flags.brz = (G.flags.brz || []).concat(e.dirn);
    const seq = G.flags.brz;
    const ok = seq.every((d, i) => d === order[i]);
    if (!ok) {
      await wait(0.5); sfx('ghost'); shake(2);
      for (const b of World.ents) if (b.type === 'brazier') b.lit = false;
      G.flags.brz = [];
      await nar('Холодный вздох проносится по залу — и все огни гаснут. Порядок неверен.');
      if (!F('brz_hint')) { setF('brz_hint'); await IV('Надпись у входа... луна встаёт на востоке, потом юг, потом запад, потом север. Может, в этом дело?'); }
      return;
    }
    if (seq.length === 4) { setF('crypt_puzzle'); await wait(0.5); sfx('door'); sfx('rumble'); shake(3); await nar('Четыре огня вспыхивают разом. Глубоко внизу поднимается решётка.'); await IV('Получилось! Ты так умеешь!', 1); }
  },
  async tomasFight() {
    await camTo(19, 27, 2);
    const t = entById('tomas'); t.dir = 3;
    await say('???', 'Стой. Никто не пройдёт к могиле сэра Ардана.', { p: 'tomasU' });
    await say('???', 'Я обещал ждать его. И я жду. Уже... очень давно.', { p: 'tomasU' });
    await IV('Ардан... Он сказал «сэр Ардан»? Это же ты!', 2);
    const c = await choose(['Томас... это я', 'Отойди']);
    if (c === 0) await say('Томас', 'Ложь! Мой рыцарь не носил пепел вместо лица! Ты — тварь из-под печати, надевшая его доспех!', { p: 'tomasU', shake: 0.5 });
    else await say('Томас', 'Отойти? Я сто лет не сходил с этого места. И не сойду ради чужака в краденых латах!', { p: 'tomasU' });
    camFree(); sfx('roar', { rate: 1.3 });
    const r = await battle(['tomas'], { area: 'crypt', music: 't18', boss: true });
    setF('tomas_done');
    if (r === 'spare') {
      t.char = 'tomas'; t.dir = 3; flash('#9fffd0', 0.4);
      await say('Томас', 'Сэр... вы правда вернулись. Я знал. Я ЗНАЛ!', { p: 'tomas' });
      await say('Томас', 'Вот. Знак Ордена. Вы отдали его мне в ту ночь, перед тем как уйти к озеру.', { p: 'tomas' });
      await say('Томас', 'Сказали: «Если не вернусь — передай достойному». Я никого не нашёл достойнее вас, сэр.', { p: 'tomas' });
      gainItem('sigil');
      await say('Томас', 'Мне больше не нужно ждать. Можно... можно я теперь отдохну?', { p: 'tomas', m: 2 });
      const c2 = await choose(['Отдыхай, Томас', 'Ты был лучшим оруженосцем']);
      if (c2 === 1) await say('Томас', 'Куда вы — туда и я, сэр. Даже теперь.', { p: 'tomas' });
      else await say('Томас', 'Спасибо, сэр. Спокойной ночи.', { p: 'tomas' });
      sfx('spare'); for (let i = 0; i < 30; i++) addPart({ x: t.x + rnd(-6, 6), y: t.y - rnd(0, 20), vx: rnd(-10, 10), vy: rnd(-40, -15), max: rnd(1, 2.2), col: pick(['#9fffd0', '#ffffff', '#c8d8ff']), glow: 1 });
      removeEnt('tomas');
    } else {
      await say('Томас', 'Сэр...? Это... и правда вы... Я... дождался...', { p: 'tomasU', m: 2 });
      removeEnt('tomas'); sfx('die');
      await IV('Он ждал тебя сто лет, Ардан...', 2);
      await nar('В пыли лежит серебряная луна на цепочке.'); gainItem('sigil');
    }
    setF('northgate'); gainPrayer('ward');
    await STORY.memory1();
  },
  async memory1() {
    await fade(1, 1); const prevMusic = Music.id; Music.play('t12', { fade: 1 });
    Game.scene = 'cine'; Game.cine = 'memory'; Game.cineT = 0;
    await fade(0, 1);
    await nar('Ты вспоминаешь. Костёр на берегу озера. Сто лет назад.', { top: true });
    await nar('Гарет, смеясь, начищает свой двуручник. Томас спит, обняв знамя Ордена.', { top: true });
    await nar('Жрица в белом смотрит на луну. Её глаза — голубые, как пламя.', { top: true });
    await nar('«Завтра мы запечатаем короля, — говорит она. — Печать потребует жизнь. Жизнь одного рыцаря».', { top: true });
    await nar('Ты помнишь, что вызвался первым.', { top: true });
    await fade(1, 1);
    Game.scene = 'world'; Music.play(World.map.music, { fade: 1 });
    await fade(0, 1);
    await IV('Жрица в белом... Почему мне так больно, когда я это слышу?', 2);
    await IV('Ладно. Знак Ордена откроет северные ворота деревни. Пойдём, Ардан.');
  },
  async keepEnter() {
    await IV('Крепость Ордена... Вы здесь жили? Тут всё выгорело.', 2);
    await nar('Подъёмный мост через ров поднят. Где-то должен быть механизм.');
  },
  async bridgeLever(e) {
    if (F('keep_bridge')) { await nar('Цепи натянуты. Мост опущен.'); return; }
    sfx('lever'); setF('keep_bridge'); await wait(0.3); sfx('rumble'); shake(4);
    for (let y = 24; y <= 26; y++) for (const x of [21, 22]) patchCell(x, y, '=');
    sfx('door'); await nar('Скрипят цепи — и подъёмный мост с грохотом ложится на ров.');
  },
  async garethFight() {
    await camTo(21, 5, 2);
    const ga = entById('gareth');
    await say('Падший рыцарь', 'Я слышал, как ты идёшь, Ардан. Пепел шуршит громче, чем ты думаешь.', { p: 'garethF' });
    await IV('Ты его знаешь?', 2);
    await say('Гарет', 'Знает. Мы вместе принесли клятву. Под одной луной.', { p: 'garethF' });
    await say('Гарет', 'В ночь Запечатывания ты отдал печати жизнь. А я... я бежал.', { p: 'garethF' });
    await say('Гарет', 'Король нашёл меня. Обещал забвение. Сто лет я служу ему — и ни дня не смог забыть.', { p: 'garethF' });
    const c = await choose(['Я не виню тебя', 'Ты предал Орден']);
    if (c === 0) await say('Гарет', 'Не винишь?! ВИНИ! Подними меч, брат, и вини меня!', { p: 'garethF', shake: 0.5 });
    else await say('Гарет', 'Да. Предал. Так закончи то, что должен был сделать сто лет назад!', { p: 'garethF' });
    camFree(); sfx('roar', { rate: 0.8 });
    const r = await battle(['gareth'], { area: 'keep', music: 't10', boss: true });
    setF('gareth_done');
    if (r === 'spare') {
      ga.char = 'gareth'; flash('#ffe8a0', 0.5);
      await say('Гарет', 'Сто лет я ждал удара. А получил прощение.', { p: 'gareth', m: 2 });
      await say('Гарет', 'Слушай, брат. Печать держалась на твоей жизни — и на клятве нас двоих. Я сбежал, и печать вышла неполной.', { p: 'gareth' });
      await say('Гарет', 'Сто лет она трескалась. А теперь король просыпается — и вместе с ним Пустота.', { p: 'gareth' });
      await say('Гарет', 'За крепостью — его Спящее королевство. Дальше — Лунная тропа и Озеро Забвения.', { p: 'gareth' });
      await say('Гарет', 'Возьми мой клинок. А я вернусь в Терновую Стену. Буду охранять живых. Наконец-то — правильное дело.', { p: 'gareth' });
      gainEquip('gsword'); removeEnt('gareth');
    } else {
      await say('Гарет', 'Спасибо... брат. За крепостью... его королевство. Озеро... Забвения...', { p: 'garethF', m: 2 });
      removeEnt('gareth'); sfx('die');
      await IV('Он хотел, чтобы это закончилось. Наверное.', 2);
      await nar('Ты поднимаешь его тяжёлый клинок.'); gainEquip('gsword');
    }
    gainPrayer('solace');
    await IV('Путь за троном... Там что-то светится. Пойдём.');
  },
  async sleepEnter() {
    await IV('Тише... Ты видишь? Они все спят. Стоя. Посреди улиц.', 2);
    await IV('Сто лет. Сто лет они так стоят.');
    const ela = entById('ela');
    if (ela) { emote(ela, '!'); await wait(0.5); await say('Призрачная девочка', 'Ты не спишь?! Ты первый за сто лет, кто не спит! Подойди, поговори со мной!', { p: 'ghost' }); }
  },
  async moonAltar() {
    await IV('Подожди... Ардан, стой. Этот алтарь. Я... я его помню.', 2);
    await fade(1, 0.8); Game.scene = 'cine'; Game.cine = 'seal'; Game.cineT = 0; await fade(0, 0.8);
    await IV('Я была жрицей Луны. Мы стояли здесь в ту ночь — ты, Гарет и я.', 2, { top: true });
    await IV('Печать требовала жизнь рыцаря. Ты отдал её. А я вплела свою душу в печать, чтобы она светила вечно.', 0, { top: true });
    await IV('Я стала её луной. Сто лет я светила над озером... пока печать не треснула. И я выпала из неё — как искра из костра. Без памяти.', 2, { top: true });
    await fade(1, 0.8); Game.scene = 'world'; await fade(0, 0.8);
    await IV('Ардан... Когда всё закончится, печать снова потребует плату. Ты ведь знаешь это?', 2);
    const c = await choose(['Знаю', 'Мы найдём другой путь']);
    if (c === 0) await IV('Конечно знаешь. Ты всегда знал. И всё равно шёл первым.', 2);
    else await IV('Другой путь... Может, он и правда есть. Спящие шептали что-то о голосах... Король ведь когда-то любил свой народ.', 0);
    await IV('Пойдём. Озеро уже близко.');
  },
  async lakeEnter() {
    await IV('Озеро Забвения... Видишь меч на острове? Это твой меч, Ардан. Ты вонзил его в сердце печати.', 2);
    if (G.voices < 3) await IV('И... может, стоит вернуться и послушать сны спящих? Мне кажется, королю нужно их услышать.', 0);
  },
  async swordStone() {
    await nar('Твой меч. Сто лет он держал печать. Вода вокруг острова дрожит.');
    await IV('Если ты вытащишь его — печать откроется, и мы спустимся к трону. Обратного пути не будет. (Сохранись у свечи, если нужно.)', 2);
    const c = await choose(['Вытащить меч', 'Ещё не время']);
    if (c === 1) { await walk('player', 18, 11); return; }
    setF('descend');
    sfx('rumble'); shake(6); await wait(0.8); sfx('light'); flash('#c8e0ff', 1); await wait(0.4); sfx('splash'); shake(8);
    await nar('Ты вырываешь меч из камня. Озеро с рёвом уходит вниз, в бездонную воронку...');
    Music.stop(1.5);
    await fade(1, 1.2, '#dfe8ff');
    await wait(0.6);
    await gotoMap('throne', 12, 26, 3, { nofade: true });
    await fade(0, 1.2);
  },
  async kingFight() {
    await camTo(13, 5, 1.5);
    await say('Король Альдерих', 'Рыцарь Бледной Луны. Снова.', { p: 'king' });
    await say('Король Альдерих', 'Ты уже отнял у меня жизнь однажды. Теперь пришёл отнять и сон моего народа?', { p: 'king' });
    await say('Король Альдерих', 'Пустота обещала: никто в моём королевстве не умрёт. Я сдержал слово. Они живы.', { p: 'king' });
    await IV('Они не живы! Они заперты! Сто лет в одном сне!', 2);
    await say('Король Альдерих', 'Жрица... И ты здесь. Как трогательно. Твоя луна погасла, девочка.', { p: 'king' });
    const c = await choose(['Отпусти их, Альдерих', 'Я пришёл закончить это']);
    if (c === 0) await say('Король Альдерих', 'Отпустить — значит отдать смерти. Никогда.', { p: 'king' });
    else await say('Король Альдерих', 'Тогда склонись перед Серой Короной, рыцарь!', { p: 'king', shake: 0.5 });
    camFree(); sfx('roar', { rate: 0.6 }); shake(5);
    let said = {};
    const r = await battle(['king'], { area: 'king', music: 't29', boss: true,
      flavor: () => G.voices > 0 && !said.v ? 'Ты помнишь сны спящих. Может, король должен их услышать?' : null,
      afterAttack: async () => {
        const k = B.enemies[0]; const ratio = k.hp / k.maxhp;
        if (ratio < 0.66 && !said.a) { said.a = 1; await btext('Король: «Ты не понимаешь! Я видел, как они умирали от чумы!»'); }
        if (ratio < 0.33 && !said.b) { said.b = 1; await btext('Корона трещит. Король: «Если я паду — все они умрут! ВСЕ!»'); }
        if (k.mercy >= 60 && !said.c) { said.c = 1; await btext('Король дрожит. Голоса спящих звучат в зале. «Марк... Анна... маленькая Эла...»'); }
      } });
    setF('king_done');
    if (r === 'spare') await STORY.endingDawn(); else await STORY.endingWatch();
  },
  async endingDawn() {
    await say('Король Альдерих', 'Я слышу их... Как же я устал.', { p: 'king', m: 3 });
    await say('Король Альдерих', 'Пусть просыпаются. Пусть живут. И пусть... умирают, когда придёт их время.', { p: 'king' });
    sfx('shatter'); flash('#fff', 1); shake(6);
    await fade(1, 1.5, '#fff');
    Music.play('t15', { fade: 2 });
    Game.scene = 'cine'; Game.cine = 'dawn'; Game.cineT = 0;
    await fade(0, 2, '#fff');
    await nar('В ту ночь над Вальдмором взошло солнце — впервые за сто лет.', { top: true });
    await nar('В Спящем королевстве люди открывали глаза. Пекарь Марк обжёгся о свежий хлеб. Анна услышала, как плачет её дочь.', { top: true });
    await nar('Маленькая Эла увидела утро.', { top: true });
    if (F('gareth_spared')) await nar('В Терновой Стене седой рыцарь Гарет встречал рассвет у ворот — и впервые за век улыбался.', { top: true });
    if (F('tomas_spared')) await nar('А в склепе Ордена, у пустой могилы, кто-то оставил истлевшее знамя. Аккуратно сложенным.', { top: true });
    await IV('Ардан... Твой пепел. Он светится. Ты уходишь, да?', 2, { top: true });
    await AR('Печать больше не нужна. Моя служба окончена.', { top: true });
    await IV('Тогда... пойдём вместе? Туда, где утро. Я ведь тоже немножко луна.', 1, { top: true });
    await nar('Рыцарь из пепла и маленький голубой огонёк растаяли в первых лучах солнца.', { top: true });
    await STORY.credits('Рассвет над Вальдмором');
  },
  async endingWatch() {
    sfx('boom'); shake(8); flash('#c8d8ff', 1);
    await IV('Король пал... но печать рушится! Без неё Пустота вырвется наружу!', 2);
    await AR('Значит, печать получит то, что ей нужно.');
    await IV('Ардан, нет..! ...Да. Я знала, что ты так скажешь.', 2);
    await fade(1, 1.5);
    Music.play('t15', { fade: 2 });
    Game.scene = 'cine'; Game.cine = 'watch'; Game.cineT = 0;
    await fade(0, 2);
    await nar('Рыцарь опустился на колено и вонзил меч в сердце печати. Голубой огонёк вплёлся в её свет.', { top: true });
    await nar('Спящее королевство так и не проснулось. Но мёртвые вновь уснули, а живые перестали бояться ночи.', { top: true });
    if (F('gareth_spared')) await nar('Гарет нёс стражу у Терновой Стены до конца своих дней.', { top: true });
    await nar('Говорят, в лунные ночи над Озером Забвения видно рыцаря, несущего вечную стражу. И голубой огонёк рядом с ним.', { top: true });
    await STORY.credits('Вечное бдение');
  },
  async credits(endName) {
    await wait(1);
    Game.cine = 'credits'; Game.cineT = 0; Game.endName = endName;
    Music.play('t16', { fade: 3 });
    localStorage.setItem('ashen_cleared', '1');
    await waitUntil(() => Game.cineT > 48 || (Game.cineT > 6 && Input.p('ok')));
    await fade(1, 2);
    location.reload();
  },
};

// ================= TALK =================
async function shop(title, list) {
  while (true) {
    const avail = list.filter(i => !i.cond || i.cond());
    const opts = avail.map(i => { const nm = i.equip ? EQUIP[i.id].n : ITEMS[i.id].n; const own = i.equip && G.flags['own_' + i.id]; return `${nm} — ${own ? 'есть' : i.price + 'м'}`; });
    opts.push('Уйти');
    const k = await choose(opts, { title: `${title}  (у тебя ${G.gold}м)`, cancel: true });
    if (k < 0 || k === avail.length) return;
    const it = avail[k];
    if (it.equip && G.flags['own_' + it.id]) { await nar('У тебя это уже есть.'); continue; }
    if (G.gold < it.price) { sfx('deny'); await nar('Не хватает монет.'); continue; }
    if (!it.equip && G.items.length >= 12) { sfx('deny'); await nar('Сумка переполнена.'); continue; }
    G.gold -= it.price; sfx('item');
    if (it.equip) { G.flags['own_' + it.id] = true; const c = await choose(['Надеть сейчас', 'Позже']); if (c === 0) { G[EQUIP[it.id].slot] = it.id; sfx('equip'); } }
    else G.items.push(it.id);
  }
}
const TALK = {
  async shrine(e) {
    sfx('heal'); G.hp = maxHp(); G.tp = Math.max(G.tp, 0);
    for (let i = 0; i < 12; i++) addPart({ x: e.x + rnd(-8, 8), y: e.y - 8, vx: rnd(-10, 10), vy: rnd(-40, -20), max: 1.2, col: pick(['#8fc8ff', '#e8f6ff']), glow: 1 });
    await nar('Голубое пламя Свечи Обета согревает пепел внутри лат. Раны затягиваются.');
    const c = await choose(['Сохранить путь', 'Не сейчас']);
    if (c === 0) {
      G.x = Math.floor(World.player.x / 16); G.y = Math.floor((World.player.y) / 16); G.dir = World.player.dir; G.map = World.id;
      if (saveGame()) { sfx('save'); await nar(`Путь сохранён.  [s]${MAPS[World.id].name} · LV${G.lv} · ${fmtTime(G.time)}[/]`); }
      else await nar('Не удалось сохранить...');
    }
  },
  async ansel(e) {
    if (!F('rat_done')) { await AN('Крыса у дверей, сэр. Она всё ещё там, я её слышу.'); return; }
    if (F('gareth_done')) await AN('Ты возмужал, сэр. Хотя куда уж больше для человека из пепла.');
    else if (F('bishop_done')) await AN('Колокола смолкли! Даже здесь слышно эту тишину. Благослови тебя Луна.');
    else await AN(pick(['Терновая Стена — на север, за туманом. Не сходи с тропы.', 'Свеча Обета у стены залечит твои раны.', 'Орден Бледной Луны... Я был мальчишкой, когда видел последних рыцарей.']));
  },
  async ivelMeet(e) { await STORY.ivelMeet(e); },
  async mirra(e) {
    const M = (t, o = {}) => say('Мирра', t, Object.assign({ p: 'mirra' }, o));
    if (!F('met_mirra')) {
      setF('met_mirra');
      await M('Латы Ордена... и пепел вместо лица. Значит, Ансельм всё-таки дождался.');
      await M('Я Мирра, старейшина Терновой Стены. Того, что от неё осталось.');
      await M('Каждую ночь в соборе к востоку звонят колокола. И с каждым ударом мёртвые встают из могил.');
      await M('Это Епископ. Когда-то он был добрым пастырем... пока ржавчина не съела его разум.');
      await M('Заставь колокола умолкнуть, рыцарь. Я скажу Хоску открыть восточные ворота.');
      setF('eastgate'); sfx('door'); note('Восточные ворота открыты');
      await M('И загляни к Браму в кузню и к Гвидо — торговцу. Без доброй стали за стеной делать нечего.');
      return;
    }
    if (F('tomas_done') && !F('gareth_done')) { await M('Знак Ордена... Северные ворота откроются перед ним. За ними — старая крепость.'); await M('Говорят, там живёт падший рыцарь. Будь осторожен — он когда-то был одним из вас.'); return; }
    if (F('bishop_done') && !F('tomas_done')) {
      if (!F('mirra_key')) { setF('mirra_key'); await M('Колокола молчат! Первая тихая ночь за сто лет...', { m: 2 }); }
      await M('Ключ, что ты нашёл, — от склепа Ордена под нашим кладбищем, на западе деревни.');
      await M('Легенда гласит, что там хранится Знак Ордена. Без него северные ворота не открыть.');
      return;
    }
    if (F('gareth_done')) { await M('Ты вернулся из крепости... живым? Насколько это слово к тебе вообще применимо.'); await M('Иди, рыцарь. Терновая Стена будет ждать тебя. Мы все будем.'); return; }
    await M('Собор — к востоку, за воротами. Колокола, рыцарь. Колокола.');
  },
  async guido(e) {
    const Gd = (t, o = {}) => say('Гвидо', t, Object.assign({ p: 'guido' }, o));
    if (!F('met_guido')) { setF('met_guido'); await Gd('О-о-о! Покупатель! Настоящий! Да ещё и рыцарь! Гвидо, лучший торговец по эту сторону Пустоты, к вашим услугам!', { m: 4 }); await Gd('Цены честные! Ну, почти. Ну, для конца света — честные.'); }
    else await Gd(pick(['Чем могу служить, сэр Пепел?', 'Свежий товар! Ну, свежий для своих ста лет.', 'Если что, я не грабил мёртвых. Они сами всё оставили.']), { m: 4 });
    await shop('Лавка Гвидо', [
      { id: 'bread', price: 8 }, { id: 'herb', price: 18 }, { id: 'candle', price: 25 },
      { id: 'elixir', price: 40, cond: () => F('bishop_done') }, { id: 'holy', price: 90, cond: () => F('tomas_done') },
      { id: 'feather', price: 120, cond: () => F('gareth_done') && !hasItem('feather') },
    ]);
    await Gd('Заходите ещё! Если выживете!', { m: 4 });
  },
  async bram(e) {
    const Br = (t, o = {}) => say('Брам', t, Object.assign({ p: 'bram' }, o));
    if (hasItem('stariron')) {
      await Br('Это... звёздное железо? Откуда?! Его не видели со времён Ордена!', { m: 1 });
      await Br('Дай-ка сюда. И свой старый меч тоже. Подожди минуту.');
      removeItem('stariron'); await fade(1, 0.4); for (let i = 0; i < 4; i++) { sfx('equip', { rate: 0.7 }); await wait(0.35); } await fade(0, 0.4);
      gainEquip('moon');
      await Br('Лунный клинок. Лучшая моя работа. Не потеряй, рыцарь.');
      const c = await choose(['Надеть сейчас', 'Позже']); if (c === 0) { G.weapon = 'moon'; sfx('equip'); }
      return;
    }
    if (!F('met_bram')) { setF('met_bram'); await Br('Хм. Латы Ордена. Помятые. Ржавые. Позорище.', { m: 1 }); await Br('Я Брам. Кую то, что держит мертвецов за стеной. Покупай или не загораживай свет.'); }
    else await Br(pick(['Сталь не врёт. В отличие от Гвидо.', 'Если найдёшь что-то необычное из металла — неси мне.', 'Хорошая броня — это лишние три удара, которые ты переживёшь.']));
    await shop('Кузня Брама', [
      { id: 'ssword', price: 60, equip: true }, { id: 'chain', price: 50, equip: true },
      { id: 'thorn', price: 120, equip: true, cond: () => F('bishop_done') },
    ]);
  },
  async lina(e) {
    const Li = (t, o = {}) => say('Лина', t, Object.assign({ p: 'lina' }, o));
    if (F('lina_done')) { await Li(pick(['Пуговка говорит тебе спасибо!', 'Когда вырасту, буду рыцарем. Как ты! Только с лицом.', 'Ивель такая красивая! Можно её потрогать?'])); return; }
    if (hasItem('doll')) {
      await Li('ПУГОВКА!!! Ты нашёл её! Ты нашёл Пуговку!', { m: 4 });
      removeItem('doll'); setF('lina_done');
      await Li('Вот, держи. Я сама сплела! Это оберег. Мама говорит, он защищает от всего-всего.');
      gainEquip('lcharm'); await nar('Надеть оберег можно в меню (С / ☰) → Снаряжение.');
      return;
    }
    await Li('Моя кукла Пуговка... Я уронила её, когда мы бежали мимо собора.', { m: 2 });
    await Li('Её, наверное, утащили горгульи! Если увидишь — принеси, пожалуйста...', { m: 2 });
  },
  async hosk(e) {
    const Ho = (t, o = {}) => say('Хоск', t, Object.assign({ p: 'hosk' }, o));
    if (!F('eastgate')) { await Ho('Стой. Восточные ворота закрыты. Приказ старейшины Мирры.'); await Ho('Её дом — на северо-западе, с дымящей трубой.'); return; }
    await Ho(pick(['Проходи, рыцарь. Да хранит тебя... что там у вас хранит.', 'Собор — прямо по дороге. Не заблудишься: иди на звон.', 'Если что — кричи. Я не приду, но хоть буду знать.']));
  },
  async vA() { await say('Крестьянин', F('bishop_done') ? 'Ночью было тихо! Ни одного мертвеца! Я даже выспался, представляешь?' : 'Говорят, сто лет назад король уснул под озером. А вместе с ним — всё его королевство.', { p: 'villager' }); },
  async vB() { await say('Вдова', F('bishop_done') ? 'Спасибо тебе. Теперь мой муж... спит спокойно. Я это чувствую.' : 'Мой муж ушёл к собору и не вернулся. Если увидишь его там... Нет. Не говори мне.', { p: 'villager' }); },
  async vC() { await say('Старик', F('tomas_done') ? 'Трое героев: два рыцаря и жрица. Один погиб, второй сбежал, а жрица... Жрица стала луной, так говорила бабка.' : 'Орден Бледной Луны... Помню сказки бабки. Трое героев запечатали короля. Двое рыцарей и жрица.', { p: 'villager' }); },
  async vD() { await say('Пастух', pick(['Ты не видел мою козу? Белую такую. Она уже сто лет как... ладно, неважно.', 'Кузнец Брам ворчит, но кует лучше всех в округе.', 'Не ходи к кладбищу ночью. Хотя для тебя, наверное, это как домой сходить.']), { p: 'villager' }); },
  async garethV() { await say('Гарет', pick(['Охраняю живых, брат. Иди — и вернись, если сможешь.', 'Мирра ворчит, что я слишком громко точу меч. Это хорошо. Значит, она спит.']), { p: 'gareth' }); },
  async bishop() { await STORY.bishopFight(); },
  async tomasB() { await STORY.tomasFight(); },
  async garethB() { await STORY.garethFight(); },
  async kingB() { await STORY.kingFight(); },
  async ela(e) {
    const El = (t, o = {}) => say('Эла', t, Object.assign({ p: 'ghost' }, o));
    if (!F('met_ela')) {
      setF('met_ela');
      await El('Я Эла! Ну, моя тень. Сама я сплю там, у колодца. Мне снится, что я гуляю.');
      await El('Когда пришла серая чума, король испугался и попросил Пустоту, чтобы мы не умирали. И мы уснули.');
      await El('Король больше не слышит нас. Совсем. Он сидит под озером и думает, что спасает нас.');
      await El('Спящие шепчут свои сны тем, кто слушает. Может, ты послушаешь — и передашь королю?');
      await El('Пекарь спит у своей лавки на западе. Мама Анна — на востоке, у большого дома. А я... у колодца.');
      await IV('Голоса спящих... Если король их услышит, может, его сердце оттает.', 0);
      return;
    }
    if (G.voices >= 3) await El('Ты услышал всех! Теперь иди к озеру. Скажи королю... скажи, что я хочу увидеть утро.', { m: 0 });
    else await El(`Ты услышал ${G.voices} из 3 снов. Пекарь — на западе, мама Анна — на востоке, я — у колодца!`);
  },
  async voice1() {
    if (F('voice1')) { await nar('Пекарь мирно посапывает. От него пахнет хлебом, которого нет.'); return; }
    await nar('Пекарь шевелит губами во сне. Ты наклоняешься ближе...');
    await say('Сон пекаря', '«...хлеб остывает. Целая печь хлеба. Кто его съест, если все спят?.. Я так хочу, чтобы кто-нибудь его съел...»', { p: 'sleeper', col: '#c8c8ff' });
    setF('voice1'); G.voices++; sfx('chime'); note(`Услышан сон (${G.voices}/3)`);
  },
  async voice2() {
    if (F('voice2')) { await nar('Анна прижимает руки к груди, будто качает кого-то.'); return; }
    await nar('Женщина стоит с протянутыми руками, словно держит младенца.');
    await say('Сон матери', '«...моя дочь так и не научилась ходить. Сто лет она спит в колыбели. Я хочу услышать, как она плачет. Хоть раз...»', { p: 'sleeper', col: '#c8c8ff' });
    setF('voice2'); G.voices++; sfx('chime'); note(`Услышан сон (${G.voices}/3)`);
  },
  async voice3() {
    if (F('voice3')) { await nar('Эла спит, улыбаясь. Ей снится прогулка.'); return; }
    await nar('Маленькая девочка спит, прислонившись к колодцу. Это настоящая Эла.');
    await say('Сон девочки', '«...я хочу увидеть утро. Хоть одно. Мама говорила, что утром небо розовое. Пожалуйста...»', { p: 'sleeper', col: '#c8c8ff' });
    setF('voice3'); G.voices++; sfx('chime'); note(`Услышан сон (${G.voices}/3)`);
  },
  async sleeper() { await nar(pick(['Спящий бормочет: «...ещё пять минуточек...»', 'Спящий улыбается. Ему снится что-то хорошее.', 'Спящий вздрагивает. Ему снится чума.', 'Спящий что-то шепчет о короле. Слов не разобрать.'])); },
};
