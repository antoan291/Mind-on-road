# Mind-on-road

How to start
frontend: npm run dev
backend: npm run start:dev

cd "c:\AD\software company\Mind-on-road\automation"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install --force-reinstall paddlepaddle==3.2.0
python -m pip install --force-reinstall paddleocr==3.3.3
python -m pip install -e .
Copy-Item .env.example .env
python -m document_intelligence.worker

automation: python -m document_intelligence.worker
