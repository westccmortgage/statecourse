"""Local fallback: translate prose between immutable numeric/citation anchors.
All source pieces must produce output; no missing piece is accepted.
"""
import os,json,re,sys
os.environ['HF_HUB_OFFLINE']='1'
from transformers import AutoTokenizer
import ctranslate2
from free_practice_sentences import sentences
rows=json.load(open(sys.argv[1]));tokenizer=AutoTokenizer.from_pretrained(sys.argv[3],local_files_only=True)
engine=ctranslate2.Translator(sys.argv[4],device='cpu',compute_type='int8',intra_threads=4)
number=r'\d+(?:[.,]\d+)*|[¼½¾⅓⅔⅛⅜⅝⅞⅙⅚²³¹⁰⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉π÷×=]'
reference=r'https?://[^\s<>)]+|(?:\b(?:AS|RCW|WAC|TAC|AAC|CFR|C\.F\.R\.|A\.R\.S\.|A\.A\.C\.|N\.C\.G\.S\.|G\.S\.|C\.R\.S\.|RSMo)|§{1,2})\s*(?:§\s*)?\d(?:[\dA-Za-z.()–—-]*[\dA-Za-z)])?'
pattern=re.compile(reference+'|'+number)
parents={};jobs=[]
for row in rows:
 parts=[];last=0
 for m in pattern.finditer(row['source']):
  if m.start()>last:parts.append((False,row['source'][last:m.start()]))
  parts.append((True,m.group()));last=m.end()
 if last<len(row['source']):parts.append((False,row['source'][last:]))
 expanded=[]
 for protected,part in parts:
  if protected or not re.search('[A-Za-z]',part):expanded.append((True,part));continue
  # Preserve source whitespace around protected anchors.
  leading=re.match(r'^\s*',part).group();trailing=re.search(r'\s*$',part).group()
  pieces=[]
  for sentence in sentences(part.strip()):
   buf=[]
   for word in sentence.split(' '):
    if len(tokenizer.encode(' '.join(buf+[word])))>100 and buf:pieces.append(' '.join(buf));buf=[]
    buf.append(word)
   if buf:pieces.append(' '.join(buf))
  for i,piece in enumerate(pieces):expanded.append((False,(leading if i==0 else ' ')+piece+(trailing if i==len(pieces)-1 else '')))
 parents[row['id']]={'row':row,'parts':[v if fixed else None for fixed,v in expanded]}
 for index,(fixed,part) in enumerate(expanded):
  if not fixed:jobs.append((row['id'],index,part,tokenizer.convert_ids_to_tokens(tokenizer.encode(part.strip()))))
for start in range(0,len(jobs),64):
 batch=jobs[start:start+64];results=engine.translate_batch([x[3] for x in batch],beam_size=4,max_decoding_length=511)
 for (id,index,part,_),result in zip(batch,results):
  if len(result.hypotheses[0])>=510:continue
  text=tokenizer.decode(tokenizer.convert_tokens_to_ids(result.hypotheses[0]),skip_special_tokens=True).strip()
  if text:parents[id]['parts'][index]=re.match(r'^\s*',part).group()+text+re.search(r'\s*$',part).group()
failed=[];count=0
with open(sys.argv[2],'w') as out:
 for id,parent in parents.items():
  parts=parent['parts'];row=parent['row'];target=''.join(p or '' for p in parts)
  if all(p is not None for p in parts):
   out.write(json.dumps({'id':id,'text':target,'segmentation_version':2,'source_segments':len(parts),'translated_segments':len(parts)},ensure_ascii=False)+'\n');count+=1
  else:failed.append(row)
json.dump(failed,open(sys.argv[2]+'.unresolved.json','w'),ensure_ascii=False,indent=2)
print(json.dumps({'translated':count,'incomplete':len(failed)}))
