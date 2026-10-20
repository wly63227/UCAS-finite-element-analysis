"""Read-only source inventory. Physical PDF pages are one-based."""
from pathlib import Path
from hashlib import sha256
import json
from pypdf import PdfReader

root = Path(__file__).resolve().parent.parent
out = root / '.work'
out.mkdir(exist_ok=True)
records = []
for path in sorted([*root.glob('*.pdf'), *(root/'笔记整理'/'原图').rglob('*.jpg')]):
    digest = sha256(path.read_bytes()).hexdigest()
    record = dict(path=path.relative_to(root).as_posix(), bytes=path.stat().st_size, sha256=digest)
    if path.suffix.lower() == '.pdf':
        reader = PdfReader(path)
        record['pages'] = len(reader.pages)
        texts = []
        for i, page in enumerate(reader.pages):
            try:
                text = page.extract_text() or ''
            except Exception as error:
                text = 'EXTRACTION_ERROR: ' + str(error)
            texts.append(text)
        record['text_pages'] = sum(len(t.strip()) > 50 for t in texts)
        record['review'] = 'inventory-only'
        (out/(path.stem+'.txt')).write_text('\n'.join(f'\n--- PHYSICAL PAGE {i+1} ---\n{t}' for i,t in enumerate(texts)), encoding='utf-8')
    records.append(record)
    print(json.dumps(record, ensure_ascii=False), flush=True)
target = root/'sources.json'
if target.exists():
    # Preserve the reviewed manifest; a fresh scan is a comparison candidate.
    target = out/'inventory-current.json'
target.write_text(json.dumps(records, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print('Inventory candidate: '+str(target), flush=True)
