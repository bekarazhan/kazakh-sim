# WORK_LOG — Қазақ Симулятор

---

## 2026-06-19 — Инициализация проекта + v1.0 архитектура

### Что сделано
- Создан прототип (single HTML) — доказана концепция
- Инициализирован Vite + TypeScript + Three.js проект
- Написана полная модульная архитектура:
  - `Game.ts` — ядро (renderer, scene, loop)
  - `EventBus.ts` — pub/sub
  - `Lighting.ts` — все источники света + мерцание огня
  - `FirstPersonControls.ts` — pointer lock + WASD + анимация пробуждения
  - `Sky.ts` — градиентное небо, солнечный диск
  - `Steppe.ts` — степь, горы, трава
  - `Yurt.ts` — полная геометрия юрты
  - `items/Shyrdak.ts` — ковёр с казахскими орнаментами
  - `items/Furniture.ts` — сандык, дастархан, постель, кілем
  - `items/Weapons.ts` — лук, колчан, стрелы
  - `items/Instruments.ts` — домбыра
  - `items/Kitchen.ts` — казан, седло
  - `TextureFactory.ts` — процедурные текстуры (Canvas 2D)
  - `GeomUtils.ts` — хелперы
  - `Overlay.ts` — UI (заставка, HUD)
- Написана документация: `CLAUDE.md`, `GDD.md`, `WORK_LOG.md`
- Git репозиторий инициализирован

### Что работает
- Сцена рендерится, юрта со всеми предметами
- Первое лицо + мышь
- Анимация пробуждения (подъём с пола)
- Мерцающий огонь

### Что следующее (v1.1)
- Добавить Web Audio API — ветер, треск огня
- Tooltip при взгляде на предмет (raycasting)
- Оптимизация — InstancedMesh для травы
