# CLAUDE.md — Қазақ Симулятор

Инструкции для AI-агентов. Читать перед любым изменением кода.

---

## Проект

Браузерный 3D атмосферный симулятор на **Vite + TypeScript + Three.js**.
Концепция и роадмап — в [GDD.md](./GDD.md).
История изменений — в [WORK_LOG.md](./WORK_LOG.md).

---

## Команды

```bash
npm run dev      # dev-сервер с HMR (порт 5173)
npm run build    # production сборка в dist/
npm run preview  # превью собранной версии
```

---

## Структура

```
src/
├── main.ts                   # точка входа — создаёт Game
├── core/
│   ├── Game.ts               # renderer, scene, camera, game loop
│   └── EventBus.ts           # pub/sub (bus.on / bus.emit)
├── world/
│   ├── World.ts              # собирает всё в сцену
│   ├── Sky.ts                # небо, солнце
│   ├── Steppe.ts             # земля, горы, трава
│   ├── Yurt.ts               # юрта: стены, купол, дверь, шанырак
│   └── items/
│       ├── Shyrdak.ts        # ковёр
│       ├── Furniture.ts      # сандык, дастархан, постель, кілем
│       ├── Weapons.ts        # лук, колчан
│       ├── Instruments.ts    # домбыра
│       └── Kitchen.ts        # казан, седло
├── systems/
│   └── Lighting.ts           # все источники света + мерцание
├── controls/
│   └── FirstPersonControls.ts # pointer lock, WASD, пробуждение
├── ui/
│   ├── Overlay.ts            # экран загрузки, HUD
│   └── style.css
└── utils/
    ├── TextureFactory.ts     # процедурные текстуры (Canvas 2D)
    └── GeomUtils.ts          # addTo(), lmat(), box()
```

---

## Как добавить новый объект

1. Создай файл в `src/world/items/NazvanieObekta.ts`
2. Экспортируй класс: `export class NazvanieObekta { constructor(scene: THREE.Scene) { ... } }`
3. Импортируй и добавь в `World.ts`
4. Используй `lmat()` и `box()` из `GeomUtils.ts` для простых форм
5. Процедурные текстуры — в `TextureFactory.ts`

---

## Конвенции

- Все предметы эпохи I в. н.э. — казахские, гуннские, сарматские
- Цветовая схема: тёплые оранжевые (#b06030, #d4a020), тёмно-красные (#7a1010), золото (#d4a020)
- Размеры в метрах. Игрок — 1.65 м. Юрта — радиус 5.2 м
- `castShadow = true` для всех значимых объектов, `receiveShadow = true` для полов и стен
- Никакого `any` в TypeScript

---

## Коммит-конвенции

```
feat: добавить новый объект или функцию
fix: исправить баг
refactor: реструктурировать без изменения поведения  
docs: обновить GDD, CLAUDE, WORK_LOG
chore: обновить зависимости, конфиги
```

---

## Правило сессии

После каждой рабочей сессии — дописать запись в **WORK_LOG.md**:

```markdown
## YYYY-MM-DD — [краткое описание]
- Что сделано
- Что работает / что сломано
- Что следующее
```

Коммитить WORK_LOG вместе с кодом.

---

## EventBus

```ts
import { bus } from '../core/EventBus';
bus.emit('lockchange', true);  // pointer lock изменился
bus.emit('awake');             // игрок встал
bus.on('awake', () => { ... });
```

---

## Константы юрты (Yurt.ts)

```ts
export const YURT_R = 5.2;   // радиус
const WALL_H = 2.3;           // высота стен
const DOME_H = 2.6;           // высота купола
const SHANYRAK_R = 0.72;      // радиус шанырака
```
