"""Retranslate flagged public strings sentence by sentence, protecting notation.
Only validated restorations are written; unresolved items stay blocked for review.
"""
import os,json,re,sys
os.environ['HF_HUB_OFFLINE']='1';os.environ['HF_HUB_DISABLE_IMPLICIT_TOKEN']='1'
from free_practice_sentences import sentences
import ctranslate2
from transformers import AutoTokenizer
rows=json.load(open(sys.argv[1]));tokenizer=AutoTokenizer.from_pretrained(sys.argv[3],local_files_only=True)
engine=ctranslate2.Translator(sys.argv[4],device='cpu',compute_type='int8',intra_threads=4)
number=r'\d+(?:[.,]\d+)*|[¼½¾⅓⅔⅛⅜⅝⅞⅙⅚²³¹⁰⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉π÷×=]'
reference=r'https?://[^\s<>)]+|(?:\b(?:AS|RCW|WAC|TAC|AAC|CFR|C\.F\.R\.|A\.R\.S\.|A\.A\.C\.|N\.C\.G\.S\.|G\.S\.|C\.R\.S\.|RSMo)|§{1,2})\s*(?:§\s*)?\d(?:[\dA-Za-z.()–—-]*[\dA-Za-z)])?'
protected_pattern=reference+'|'+number
prepared=[];parents={}
for row in rows:
 parts=sentences(row['source']);parents[row['id']]={'row':row,'parts':[None]*len(parts)}
 for index,part in enumerate(parts):
  spans=[]
  def protect(m):
   spans.append(m.group());return 'ZXQ'+str(9000+len(spans)-1)+'QXZ'
  protected=re.sub(protected_pattern,protect,part)
  tokens=tokenizer.convert_ids_to_tokens(tokenizer.encode(protected))
  if len(tokens)<=500:prepared.append((row['id'],index,spans,tokens))
for start in range(0,len(prepared),32):
 batch=prepared[start:start+32]
 results=engine.translate_batch([x[3] for x in batch],beam_size=4,max_decoding_length=511)
 for (id,index,spans,_),result in zip(batch,results):
  if len(result.hypotheses[0])>=510:continue
  target=tokenizer.decode(tokenizer.convert_tokens_to_ids(result.hypotheses[0]),skip_special_tokens=True);valid=True
  for i,span in enumerate(spans):
   marker=re.compile(r'ZXQ\s*'+str(9000+i)+r'\s*QXZ',re.I)
   if len(marker.findall(target))!=1:valid=False;break
   target=marker.sub(lambda m:span,target)
  if valid and target.strip():parents[id]['parts'][index]=target
ok=0;failed=[]
with open(sys.argv[2],'w') as out:
 for id,parent in parents.items():
  row=parent['row'];parts=parent['parts'];target=' '.join(p or '' for p in parts)
  if all(parts) and re.findall(number,row['source'])==re.findall(number,target) and re.findall(reference,row['source'])==re.findall(reference,target):
   out.write(json.dumps({'id':id,'text':target,'segmentation_version':2,'source_segments':len(parts),'translated_segments':len(parts)},ensure_ascii=False)+'\n');ok+=1
  else:failed.append(row)
json.dump(failed,open(sys.argv[2]+'.unresolved.json','w'),ensure_ascii=False,indent=2)
print(json.dumps({'repaired':ok,'unresolved':len(failed)}))
