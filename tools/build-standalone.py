"""Build the self-contained, offline-playable HTML file from the native p5.js modules.

Python is the build/asset tool; the actual gameplay runs in JavaScript/p5.js.
Run: python3 tools/build-standalone.py
"""
from pathlib import Path
import re
import base64
import json
import mimetypes
root=Path(__file__).resolve().parent.parent
modules=[
 'js/data/content.js','js/game/config.js','js/game/logic.js','js/game/character.js',
 'js/game/collectable.js','js/game/scenery.js','js/ui/panels.js',
 'js/ui/controls.js','js/game/sketch.js'
]
parts=[]
for filename in modules:
    contents=(root/filename).read_text()
    contents=re.sub(r'^import .*?;\s*$', '', contents, flags=re.MULTILINE)
    contents=re.sub(r'\bexport\s+(?=(?:const|let|function|class)\b)', '',contents)
    parts.append(f'// {filename}\n'+contents)
parts.insert(5, 'const C=COLORS; // Former module import alias in scenery.js')
html=(root/'index.html').read_text()
html=html.replace('<link rel="stylesheet" href="./styles.css" />', '<style>\n'+(root/'styles.css').read_text()+'\n</style>')
html=re.sub(r'<script defer src="./assets/p5.min.js"></script>','',html)
html=re.sub(r'<script type="module" src="./js/main.js"></script>','',html)

# Store every credential's original PDF and optimized image for offline viewing.
assets={}
credential_dir=root/'assets/credentials'
for item in credential_dir.iterdir():
    if not item.is_file():continue
    mime=mimetypes.guess_type(item.name)[0] or 'application/octet-stream'
    assets[item.name]='data:'+mime+';base64,'+base64.b64encode(item.read_bytes()).decode('ascii')

script='window.__credentialAssets='+json.dumps(assets,ensure_ascii=False,separators=(',',':'))+';\n'
script+='\n'.join(parts)+'\nmountGame();\n'
# Badges are referenced with literal paths rather than using credentialAsset().
for item in credential_dir.glob('badge-*.png'):
    script=script.replace('./assets/credentials/'+item.name,assets[item.name])

p5=(root/'assets/p5.min.js').read_text()
html=html.replace('</body>',f'<script>\n{p5}\n</script>\n<script>\n{script}\n</script>\n</body>')
# Embed resume and optional SFX too.
for relative,mime in [
    ('assets/Jahvante_Tota_Resume.pdf','application/pdf'),
    ('assets/sounds/gameStart.wav','audio/wav'),
    ('assets/sounds/gameWin.wav','audio/wav'),
    ('assets/sounds/collectable.mp3','audio/mpeg'),
]:
    data='data:'+mime+';base64,'+base64.b64encode((root/relative).read_bytes()).decode('ascii')
    html=html.replace('./'+relative,data)
(root/'playable-preview.html').write_text(html)
print(f'Created {root/"playable-preview.html"} ({len(html):,} characters)')
