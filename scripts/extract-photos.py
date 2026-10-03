import json, io
from pathlib import Path
import fitz
from PIL import Image, ImageOps, ImageDraw
root = Path(__file__).resolve().parents[1]
out = root / 'tmp' / 'pdfs' / 'selected'
out.mkdir(parents=True, exist_ok=True)
reader = fitz.open(r'C:\Users\VICTUS\Downloads\Aseer Explore - Nasik Ahammed-reference.pdf')
records, tiles = [], []
for number, page in enumerate(reader, 1):
    photos = []
    for index, item in enumerate(page.get_image_info(xrefs=True)):
        if not item['xref']: continue
        raw = reader.extract_image(item['xref'])
        image = Image.open(io.BytesIO(raw['image'])).convert('RGB')
        if image.width < 150 or image.height < 100: continue
        name = f'page-{number:02d}-{index:02d}.jpg'
        image.save(out / name, quality=96)
        photos.append({'file':name,'width':image.width,'height':image.height,'bbox':item['bbox']})
        tile = Image.new('RGB',(280,210),'#faf7f2')
        thumb = ImageOps.contain(image,(280,178))
        tile.paste(thumb,((280-thumb.width)//2,0))
        ImageDraw.Draw(tile).text((8,186),f'{number:02d} / {index:02d}  {image.width} x {image.height}',fill='black')
        tiles.append(tile)
    records.append({'page':number,'text':page.get_text(),'links':[x['uri'] for x in page.get_links() if 'uri' in x],'images':photos})
    if number in [2,4,8,11,12,25,29]: page.get_pixmap(matrix=fitz.Matrix(1.3,1.3)).save(out / f'render-page-{number:02d}.png')
(out / 'reference.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
for batch in range(0,len(tiles),20):
    group=tiles[batch:batch+20]
    sheet=Image.new('RGB',(1120,((len(group)+3)//4)*210),'white')
    for i,tile in enumerate(group): sheet.paste(tile,((i%4)*280,(i//4)*210))
    sheet.save(out / f'contact-sheet-{batch//20+1}.jpg',quality=90)
print(json.dumps({'pages':len(records),'images':len(tiles),'records':[{'page':x['page'],'images':x['images']} for x in records]},ensure_ascii=True))
