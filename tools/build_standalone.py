"""Build a one-file, offline playable version of the public-safe p5.js village.

Used for preview/sharing. Vercel deployment uses the source folder directly.
"""
from pathlib import Path
import re
import json
import base64
import mimetypes

root=Path(__file__).resolve().parents[1]
modules = [
    'js/data/content.js',
    'js/data/npcs.js',
    'js/game/config.js',
    'js/game/npcCharacters.js',
    'js/game/logic.js',
    'js/game/navigation.js',
    'js/game/character.js',
    'js/game/curiosityDeck.js',
    'js/game/collectable.js',
    'js/game/scenery.js',
    'js/ui/panels.js',
    'js/ui/npcDialogue.js',
    'js/ui/controls.js',
    'js/game/sketch.js',
]
chunks=[]
for filename in modules:
    body=(root/filename).read_text(encoding='utf-8')
    body=re.sub(r'^import .*?;\s*$', '', body, flags=re.MULTILINE)
    body=re.sub(r'\bexport\s+(?=(?:const|let|function|class)\b)', '', body)
    chunks.append(f'// {filename}\n{body}')
chunks.insert(10,'const C=COLORS; // Scenery module alias')

html=(root/'index.html').read_text(encoding='utf-8')
html=html.replace('<link rel="stylesheet" href="./styles.css" />', '<style>\n'+(root/'styles.css').read_text(encoding='utf-8')+'\n</style>')
html=html.replace('<script defer src="./assets/p5.min.js"></script>', '')
html=html.replace('<script type="module" src="./js/main.js"></script>', '')

assets={}
for f in (root/'assets/credentials').iterdir():
    mime=mimetypes.guess_type(f.name)[0] or 'application/octet-stream'
    assets[f.name]='data:'+mime+';base64,'+base64.b64encode(f.read_bytes()).decode('ascii')

app='window.__credentialAssets='+json.dumps(assets,ensure_ascii=False,separators=(',',':'))+';\n'
app+='\n'.join(chunks)+'\nmountGame();\n'
# badges have literal paths in content.js, while credential PDFs use credentialAsset().
for f in (root/'assets/credentials').glob('badge-*.png'):
    app=app.replace('./assets/credentials/'+f.name,assets[f.name])

for relative,mime in [
    ('assets/Jahvante_Tota_Resume.pdf','application/pdf'),
    ('assets/sounds/gameStart.wav','audio/wav'),
    ('assets/sounds/gameWin.wav','audio/wav'),
    ('assets/sounds/collectable.mp3','audio/mpeg'),
]:
    resource='data:'+mime+';base64,'+base64.b64encode((root/relative).read_bytes()).decode('ascii')
    html=html.replace('./'+relative,resource)
    app=app.replace('./'+relative,resource)

p5=(root/'assets/p5.min.js').read_text(encoding='utf-8')
html=html.replace('</body>',f'<script>\n{p5}\n</script>\n<script>\n{app}\n</script>\n</body>')
output=root/'playable-npc-village.html'
output.write_text(html,encoding='utf-8')
print(f'Created {output} ({output.stat().st_size/1024/1024:.1f} MiB)')
