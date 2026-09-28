# happy-space.html 생성: python3 _src/build.py
import json, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
data = json.loads((root / '_src/recipes.json').read_text())
html = (root / '_src/happy-space.template.html').read_text()
payload = json.dumps(data, ensure_ascii=False).replace('</', '<\\/')
(root / 'happy-space.html').write_text(html.replace('__DATA__', payload))
print('happy-space.html built:', len(data['recipes']), 'recipes')
