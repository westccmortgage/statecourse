import os,json,re,time,sys
os.environ['HF_HUB_OFFLINE']='1';os.environ['HF_HUB_DISABLE_IMPLICIT_TOKEN']='1'
from free_practice_sentences import sentences
import ctranslate2
from transformers import AutoTokenizer
# Authoring utility only; install ctranslate2/transformers in an isolated environment.
source=json.load(open(sys.argv[1]))
tokenizer=AutoTokenizer.from_pretrained(sys.argv[3],local_files_only=True)
engine=ctranslate2.Translator(sys.argv[4],device='cpu',compute_type='int8',inter_threads=2,intra_threads=4)
output=sys.argv[2]
done={json.loads(s)['id'] for s in open(output)} if os.path.exists(output) else set()
jobs=[];parents={}
for item in source:
 if item['id'] in done:continue
 text=item['text']; parts=sentences(text)
 pieces=[]
 for part in parts:
  if len(tokenizer.encode(part))<=120:
   pieces.append(part);continue
  words=part.split(' '); buf=[]
  for w in words:
   if len(tokenizer.encode(' '.join(buf+[w])))>120 and buf:pieces.append(' '.join(buf));buf=[]
   buf.append(w)
  if buf:pieces.append(' '.join(buf))
 parents[item['id']]={'pieces':[None]*len(pieces),'source':text}
 for i,p in enumerate(pieces):
  tokens=tokenizer.convert_ids_to_tokens(tokenizer.encode(p))
  jobs.append((item['id'],i,tokens))
# Short texts first for efficient padding; no content is sent to a remote service.
jobs.sort(key=lambda j:len(j[2]));print('jobs',len(jobs),flush=True)
out=open(output,'a');start=time.time();count=0
for offset in range(0,len(jobs),64):
 batch=jobs[offset:offset+64]
 results=engine.translate_batch([j[2] for j in batch],beam_size=4,max_decoding_length=511)
 for (parent,i,tokens),result in zip(batch,results):
  if len(result.hypotheses[0])>=510:
   print('REVIEW decoder limit',parent,flush=True);continue
  value=tokenizer.decode(tokenizer.convert_tokens_to_ids(result.hypotheses[0]),skip_special_tokens=True)
  if not value.strip():
   print('REVIEW empty segment',parent,flush=True);continue
  p=parents[parent];p['pieces'][i]=value
  if all(v is not None for v in p['pieces']):
   out.write(json.dumps({'id':parent,'text':' '.join(p['pieces']),'segmentation_version':2,'source_segments':len(p['pieces']),'translated_segments':len(p['pieces'])},ensure_ascii=False)+'\n');count+=1
 out.flush()
 if offset%640==0:print('completed',count,'seconds',round(time.time()-start,1),flush=True)
