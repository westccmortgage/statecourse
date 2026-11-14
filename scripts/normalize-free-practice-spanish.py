"""Restore equivalent numeric formatting; never silently change a numeric value.
Unresolved differences are retained for explicit review / protected retranslation.
"""
import json,re,sys
from pathlib import Path
overrides=json.load(open(Path(__file__).resolve().parent.parent/"locales/es/free-practice/editorial-overrides.json"))
source={x['id']:x['text'] for x in json.load(open(sys.argv[1]))}
rows={json.loads(line)['id']:json.loads(line) for line in open(sys.argv[2]) if line.strip()}
for id,original in source.items():
 if id not in rows and original in overrides:
  rows[id]={'id':id,'text':overrides[original],'segmentation_version':2,'source_segments':1,'translated_segments':1,'editorial_override':True}
number=r'\d+(?:[.,]\d+)*|[¼½¾⅓⅔⅛⅜⅝⅞⅙⅚²³¹⁰⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉π÷×=]'
cardinals={'zero':(0,'cero'),'one':(1,'uno'),'two':(2,'dos'),'three':(3,'tres'),'four':(4,'cuatro'),'five':(5,'cinco'),'six':(6,'seis'),'seven':(7,'siete'),'eight':(8,'ocho'),'nine':(9,'nueve'),'ten':(10,'diez'),'eleven':(11,'once'),'twelve':(12,'doce'),'thirteen':(13,'trece'),'fourteen':(14,'catorce'),'fifteen':(15,'quince'),'sixteen':(16,'dieciséis'),'seventeen':(17,'diecisiete'),'eighteen':(18,'dieciocho'),'nineteen':(19,'diecinueve'),'twenty':(20,'veinte'),'thirty':(30,'treinta'),'forty':(40,'cuarenta'),'fifty':(50,'cincuenta'),'sixty':(60,'sesenta'),'seventy':(70,'setenta'),'eighty':(80,'ochenta'),'ninety':(90,'noventa')}
def variants(s):
 result=set()
 for v in (s.replace(',',''),s.replace('.','').replace(',','.')):
  try:result.add(float(v))
  except ValueError:pass
 return result
reference=r'https?://[^\s<>)]+|(?:\b(?:AS|RCW|WAC|TAC|AAC|CFR|C\.F\.R\.|A\.R\.S\.|A\.A\.C\.|N\.C\.G\.S\.|G\.S\.|C\.R\.S\.|RSMo)|§{1,2})\s*(?:§\s*)?\d(?:[\dA-Za-z.()–—-]*[\dA-Za-z)])?'
unresolved=[];restored=0
with open(sys.argv[3],'w') as out:
 for id,row in rows.items():
  original=source[id];a=re.findall(number,original);target=row['text'];b=re.findall(number,target)
  if a!=b:
   if len(a)==len(b) and all(x==y or (re.fullmatch(r'\d+(?:\.\d+)?',x.replace(',','')) and float(x.replace(',','')) in variants(y)) for x,y in zip(a,b)):
    values=iter(a);target=re.sub(number,lambda m:next(values),target);restored+=1
   elif not a and b:
    available={str(n):es for word,(n,es) in cardinals.items() if re.search(r'\b'+word+r'\b',original,re.I)}
    if all(n in available for n in b):target=re.sub(number,lambda m:available[m.group(0)],target);restored+=1
  # Preserve legal citations and identifiers; their original notation is authoritative.
  if re.search(r'\d',original) and re.fullmatch(r'[A-Z0-9\s.,:;§()/_—–-]+',re.sub(r'\([a-z0-9]+\)','',original)):
   target=original
  target=overrides.get(original,target)
  row['text']=target
  if a!=re.findall(number,target) or re.findall(reference,original)!=re.findall(reference,target):unresolved.append({'id':id,'source':original,'target':target})
  out.write(json.dumps(row,ensure_ascii=False)+'\n')
json.dump(unresolved,open(sys.argv[3]+'.review.json','w'),ensure_ascii=False,indent=2)
print(json.dumps({'translated':len(rows),'equivalent_formats_restored':restored,'unresolved_numeric':len(unresolved)}))
