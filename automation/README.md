# Automation

Тази папка съдържа automation и document-intelligence слоя на проекта.

Първият модул е offline OCR pipeline и HTTP service за български документи:

- българска лична карта
- българска шофьорска книжка

## Защо името е `automation`

Името е по-широко, за да побира и бъдещи автоматизации:

- document intelligence
- OCR и extraction pipelines
- scheduled administrative jobs
- messaging automations
- background processing

## Текущ модул

- `src/document_intelligence` — reusable Python package за PDF/image rendering, PaddleOCR и rule-based extraction
- `scripts/extract_bg_document.py` — CLI script за локално изпълнение
- `output/` — JSON резултати
- `samples/` — примерни входни файлове
- `tmp/` — временни файлове за debug и OCR inspection
- `tests/` — тестове за parser и upload worker API

## Архитектурна позиция

Този pipeline е изцяло offline и не зависи от OpenAI или друг онлайн AI доставчик.

Моделът е:

- PDF или image input
- render/normalize до изображения
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
- Категории и дати при шофьорска книжка

Резултатът се записва с български ключове в UTF-8 JSON и се връща и като HTTP response.

## Изисквания

- `Python 3.11+`
- `PaddlePaddle 3.2.0`
- `PaddleOCR 3.3.3`
- `Pillow`

## Инсталация

От папка `automation`:

1. Инсталирай `PaddlePaddle 3.2.0`:

```bash
python -m pip install --force-reinstall paddlepaddle==3.2.0
```

2. Инсталирай `PaddleOCR 3.3.3`:

```bash
python -m pip install --force-reinstall paddleocr==3.3.3
```

Официална документация за Windows:
[PaddlePaddle Windows installation](https://www.paddlepaddle.org.cn/documentation/docs/en/2.6/install/pip/windows-pip_en.html)

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
- `DOCUMENT_OCR_OUTPUT_DIR=./output`
- `DOCUMENT_OCR_WORKER_PORT=8080`

## Изпълнение

От папка `automation`:

```bash
python -m document_intelligence.cli "C:\path\to\document.pdf"
```

или:

```bash
python scripts\extract_bg_document.py "C:\path\to\document.pdf"
```

Поддържат се и изображения:

```bash
python -m document_intelligence.cli "C:\path\to\id-card.jpg"
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

### Тест с шофьорска книжка

```bash
python -m document_intelligence.cli "C:\AD\work\My company\school\test-docs\car-card.pdf" --output "C:\AD\work\My company\school\automation\output\car-card.json"
```

## Output

По подразбиране output файлът се записва в:

```text
automation/output/<име-на-файла>.json
```

Може и изрично да подадеш къде да се запише JSON:

```bash
python -m document_intelligence.cli "C:\path\to\license.png" --output "D:\exports\license-data.json"
```

## HTTP Service

Стартиране:

```bash
python -m document_intelligence.worker
```

Health check:

```bash
GET /health
```

Upload endpoint:

```bash
POST /ocr/extract-upload
Content-Type: multipart/form-data
```

Формата е:

- `file` — PDF, PNG, JPG, JPEG, WEBP, BMP, TIF, TIFF
- `outputFileName` — по избор, например `student-123.json`

Пример с `curl`:

```bash
curl -X POST "http://127.0.0.1:8080/ocr/extract-upload" \
  -F "file=@C:\docs\id-card.jpg" \
  -F "outputFileName=student-id.json"
```

Service-ът:

- приема директен upload от твоята програма;
- връща extracted JSON в response;
- записва JSON и във `DOCUMENT_OCR_OUTPUT_DIR`;
- отказва непознати типове документи вместо да ги третира като лична карта.

## Ограничения

- Това е OCR + parser pipeline, не магическо разпознаване.
- При първо пускане PaddleOCR може да изтегли локално официалните OCR модели и след това да ги кешира.
- Качеството зависи от скана, осветлението, изрязването и резолюцията.
- При шофьорска книжка някои полета може да липсват по самия документ и ще бъдат `null`.
- Ако документът не бъде разпознат сигурно като лична карта или шофьорска книжка, service-ът връща `неразпознат документ`.
- `нужен_ръчен_преглед` остава `true` по подразбиране.

## Security note

- Тези документи са чувствителни.
- Резултатът е предложение за попълване.
- Данните не трябва да се записват автоматично като официални без човешко потвърждение.
