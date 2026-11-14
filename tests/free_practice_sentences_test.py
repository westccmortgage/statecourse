import unittest,sys,re
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent.parent/'scripts'))
from free_practice_sentences import sentences
class SentenceCoverage(unittest.TestCase):
 def test_preserves_citations_and_last_sentence(self):
  source='Four requirements. A.A.C. R4-28-803(C) covers the deposit. A.R.S. § 32-2124(L) applies. And the financing condition must also be completed.'
  parts=sentences(source)
  self.assertEqual(len(parts),4)
  self.assertEqual(parts[-1],'And the financing condition must also be completed.')
  self.assertEqual(' '.join(parts),source)
 def test_heading_and_abbreviation_are_not_sentences(self):
  self.assertEqual(sentences('1. The first step'),['1. The first step'])
  self.assertEqual(sentences('See U.S. law and Reg. B. Another sentence.'),['See U.S. law and Reg. B. Another sentence.'])
 def test_no_source_words_lost(self):
  for source in ['First sentence.  Second sentence! Third?', 'A claim.\nAnother claim.', 'An unfinished clause, with no final punctuation']:
   self.assertEqual(re.sub(r'\s+',' ',source).strip(),re.sub(r'\s+',' ',' '.join(sentences(source))).strip())
if __name__=='__main__':unittest.main()
