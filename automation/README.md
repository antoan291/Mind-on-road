# Automation

Тази папка събира automation и document-intelligence слоевете на проекта.

Първият automation модул е offline OCR pipeline за български лични документи:

- българска лична карта
- българска шофьорска книжка

## Защо името е `automation`

Името е избрано по-широко, за да побере и бъдещи автоматизации:

- document intelligence
- OCR и extraction pipelines
- scheduled administrative jobs
- messaging automations
- background processing

## Текущ модул

- `src/document_intelligence` - reusable Python package за PDF rendering, PaddleOCR и rule-based extraction
- `scripts/extract_bg_document.py` - CLI script за локално изпълнение
- `output/` - JSON резултати
- `samples/` - sample input placeholders
- `tmp/` - временни файлове при бъдещи разширения

## Архитектурна позиция

Този pipeline е изцяло offline и не зависи от OpenAI или друг онлайн AI доставчик.

Моделът е:

- PDF render до изображения
- локален OCR чрез PaddleOCR
- rule-based parser за българските полета
- human review преди официално записване

Това намалява vendor lock-in и е по-подходящо за чувствителни документи.

## Какво извлича

- Име
- Презиме
- Фамилия
- ЕГН
- Номер на документа
- Място на раждане
- Постоянен адрес

Резултатът се записва с български ключове в UTF-8 JSON.

## Изисквания

- `Python 3.11+`
- `PaddlePaddle 3.2.0`
- `PaddleOCR 3.3.3`

## Инсталация

От папка `automation`:

1. Инсталирай `PaddlePaddle 3.2.0`:
```bash
python -m pip install --force-reinstall paddlepaddle==3.2.0
```

2. Инсталирай `paddleocr 3.3.3`:
```bash
python -m pip install --force-reinstall paddleocr==3.3.3
```

Ако предпочиташ да свериш инсталацията с официалната документация за Windows:  
Източник: [PaddlePaddle Windows installation](https://www.paddlepaddle.org.cn/documentation/docs/en/2.6/install/pip/windows-pip_en.html)

3. Инсталирай локалния пакет:

```bash
python -m pip install -e .
```

## Конфигурация

Копирай `.env.example` като `.env`.

Поддържаните настройки са:

- `PADDLEOCR_LANGUAGE=bg`
- `PADDLEOCR_VERSION=PP-OCRv5`
- `PADDLEOCR_USE_GPU=false`
- `PADDLEOCR_MIN_TEXT_CONFIDENCE=0.35`

## Изпълнение

От папка `automation`:

```bash
python -m document_intelligence.cli "C:\path\to\document.pdf"
```

или:

```bash
python scripts\extract_bg_document.py "C:\path\to\document.pdf"
```

### Конкретен пример с твоя файл

Ако PDF-ът е тук:

```text
C:\AD\work\My company\school\test-docs\id-card.pdf
```

и си в папка:

```text
C:\AD\work\My company\school\automation
```

изпълни:

```bash
python -m document_intelligence.cli "C:\AD\work\My company\school\test-docs\id-card.pdf"
```

или:

```bash
python scripts\extract_bg_document.py "C:\AD\work\My company\school\test-docs\id-card.pdf"
```

Ако искаш изричен output файл:

```bash
python -m document_intelligence.cli "C:\AD\work\My company\school\test-docs\id-card.pdf" --output "C:\AD\work\My company\school\automation\output\id-card.json"
```

## Output

По подразбиране output файлът се записва в:

```text
automation/output/<име-на-pdf>.json
```

## Ограничения

- Това е OCR + parser pipeline, не магическо разпознаване.
- При първо пускане PaddleOCR може да изтегли локално официалните OCR модели и след това да ги кешира.
- Качеството зависи от скана, осветлението, изрязването и резолюцията.
- При шофьорска книжка някои полета може да липсват по самия документ и ще бъдат `null`.
- `нужен_ръчен_преглед` остава `true` по подразбиране.

## Security note

- Тези документи са чувствителни.
- Резултатът е предложение за попълване.
- Данните не трябва да се записват автоматично като официални без човешко потвърждение.
