import re
def sentences(text):
 parts=[];start=0
 for match in re.finditer(r'(?<=[.!?])\s+(?=[A-Z“"\'])',text):
  before=text[:match.start()]
  if re.search(r'(?:\b(?:[A-Z]\.)+|\b(?:Mr|Ms|Mrs|Dr|Jr|Sr|Reg|Sec|No|Art|St|vs)\.|(?:^|\s)\d+\.)$',before):continue
  parts.append(text[start:match.start()]);start=match.end()
 parts.append(text[start:])
 return [s for s in parts if s.strip()]
