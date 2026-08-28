const params=new URLSearchParams(location.search);
const courseId=params.get("course_id")||"ca-real-estate-principles-45-v1";
let assignment=Math.min(15,Math.max(1,Number(params.get("assignment")||1)));
const validCourses=new Set(["ca-real-estate-principles-45-v1","ca-real-estate-practice-45-v1","ca-mortgage-loan-brokering-lending-45-v1"]);
const $=(selector)=>document.querySelector(selector);
const escapeHtml=(value="")=>String(value).replace(/[&<>"']/g,(char)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const sentenceCase=(value)=>String(value??"").replace(/[A-Za-z]/,(letter)=>letter.toUpperCase());
function titleCaseHeading(value){
  const minor=new Set(["a","an","and","as","at","but","by","for","from","in","into","nor","of","on","or","over","per","the","to","via","with"]),known=new Map([["dre","DRE"],["mls","MLS"],["hoa","HOA"],["fha","FHA"],["va","VA"],["apr","APR"],["tila","TILA"],["respa","RESPA"],["cfpb","CFPB"]]);
  const source=String(value??""),words=source.match(/[A-Za-z][A-Za-z'’-]*/g)||[];let index=0;
  return source.replace(/[A-Za-z][A-Za-z'’-]*/g,(word)=>{const lower=word.toLowerCase(),position=index++;if(known.has(lower))return known.get(lower);if(/^[A-Z0-9]{2,}$/.test(word))return word;if(position>0&&position<words.length-1&&minor.has(lower))return lower;return lower.replace(/(^|[-'’])([a-z])/g,(_,prefix,letter)=>prefix+letter.toUpperCase());});
}

function inline(value){
  return escapeHtml(value)
    .replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g,"<em>$1</em>");
}
function renderMarkdown(markdown){
  const lines=String(markdown||"").replace(/\r/g,"").split("\n"),output=[];
  let paragraph=[],list=[],table=[],metadata=[],primaryHeadingSeen=false;
  const flushParagraph=()=>{if(paragraph.length){output.push("<p>"+inline(sentenceCase(paragraph.join(" ")))+"</p>");paragraph=[];}};
  const flushList=()=>{if(list.length){output.push("<ul>"+list.map((item)=>"<li>"+inline(sentenceCase(item))+"</li>").join("")+"</ul>");list=[];}};
  const flushTable=()=>{if(!table.length)return;const rows=table.filter((row)=>!row.every((cell)=>/^:?-+:?$/.test(cell)));if(rows.length)output.push('<div class="table-wrap"><table><thead><tr>'+rows[0].map((cell)=>"<th>"+inline(titleCaseHeading(cell))+"</th>").join("")+"</tr></thead><tbody>"+rows.slice(1).map((row)=>"<tr>"+row.map((cell)=>"<td>"+inline(sentenceCase(cell))+"</td>").join("")+"</tr>").join("")+"</tbody></table></div>");table=[];};
  const flushMetadata=()=>{if(metadata.length){output.push('<dl class="lesson-metadata">'+metadata.map(({label,value})=>`<div><dt>${inline(titleCaseHeading(label))}</dt><dd>${inline(sentenceCase(value))}</dd></div>`).join("")+"</dl>");metadata=[];}};
  const flush=()=>{flushParagraph();flushList();flushTable();flushMetadata();};
  for(const raw of lines){
    const line=raw.trim();
    if(line.startsWith("|")&&line.endsWith("|")){flushParagraph();flushList();table.push(line.slice(1,-1).split("|").map((cell)=>cell.trim()));continue;}
    if(table.length)flushTable();
    if(!line){flushParagraph();flushList();continue;}
    const metadataLine=line.match(/^\*\*([^:*]+):\*\*\s*(.+)$/);
    if(metadataLine){flushParagraph();flushList();metadata.push({label:metadataLine[1],value:metadataLine[2]});continue;}
    if(metadata.length)flushMetadata();
    const heading=line.match(/^(#{1,3})\s+(.+)$/);
    if(heading){flush();const level=heading[1].length;if(level===1)continue;if(level===2&&!primaryHeadingSeen){primaryHeadingSeen=true;continue;}output.push(`<h${level}>${inline(titleCaseHeading(heading[2]))}</h${level}>`);continue;}
    if(/^[-*]\s+/.test(line)){flushParagraph();list.push(line.replace(/^[-*]\s+/,""));continue;}
    paragraph.push(line);
  }
  flush();return output.join("");
}

async function load(){
  if(!validCourses.has(courseId)){location.replace("/real-estate/california/pre-license/");return;}
  const message=$("#previewMessage"),shell=$("#previewShell");
  try{
    const frameworkResponse=await fetch("/data/launch-course-frameworks.json",{cache:"no-store"});
    if(!frameworkResponse.ok)throw new Error("framework unavailable");
    const framework=(await frameworkResponse.json()).courses.find((item)=>item.course_id===courseId);
    if(!framework)throw new Error("course unavailable");
    const module=framework.modules[assignment-1];
    const contentPath=`/content/california/${courseId}/lesson-${String(assignment).padStart(2,"0")}.md`;
    const contentResponse=await fetch(contentPath,{headers:{accept:"text/markdown"},cache:"no-store"});
    if(!contentResponse.ok)throw new Error("lesson unavailable");
    $("#previewCourseTitle").textContent=framework.title;
    $("#previewAssignmentNumber").textContent=`Lesson assignment ${String(assignment).padStart(2,"0")} of 15`;
    $("#previewAssignmentTitle").textContent=titleCaseHeading(module.title);
    $("#previewAssignmentLabel").textContent=`Assignment ${String(assignment).padStart(2,"0")}`;
    $("#previewLessonBody").innerHTML=renderMarkdown(await contentResponse.text());
    $("#previewSampleVideo").hidden=courseId!=="ca-mortgage-loan-brokering-lending-45-v1";
    $("#previewAssignmentList").innerHTML=framework.modules.map((item,index)=>`<li><button class="assignment-link" type="button" data-assignment="${index+1}" aria-current="${index+1===assignment}"><span class="number">${String(index+1).padStart(2,"0")}</span><span><strong>${escapeHtml(titleCaseHeading(item.title))}</strong><small>Available for course review</small></span></button></li>`).join("");
    $("#previewPrevious").disabled=assignment===1;
    $("#previewNext").disabled=assignment===15;
    document.title=`${titleCaseHeading(module.title)} | ${framework.title} | StateCourse`;
    message.hidden=true;shell.hidden=false;
  }catch(error){console.error(error);message.textContent="This California lesson preview is temporarily unavailable.";message.classList.add("error");}
}
function closeAssignmentDrawer(restoreFocus=true){$("#previewAssignmentRail").hidden=true;$("#previewDrawerScrim").hidden=true;$("#previewAssignmentToggle").setAttribute("aria-expanded","false");document.body.classList.remove("drawer-open");if(restoreFocus)$("#previewAssignmentToggle").focus();}
function openAssignmentDrawer(){$("#previewAssignmentRail").hidden=false;$("#previewDrawerScrim").hidden=false;$("#previewAssignmentToggle").setAttribute("aria-expanded","true");document.body.classList.add("drawer-open");$("#previewAssignmentClose").focus();}
function go(next){closeAssignmentDrawer(false);assignment=Math.min(15,Math.max(1,next));const url=new URL(location.href);url.searchParams.set("course_id",courseId);url.searchParams.set("assignment",assignment);history.pushState({},"",url);window.scrollTo({top:0,behavior:"smooth"});load();}
$("#previewAssignmentToggle").addEventListener("click",openAssignmentDrawer);
$("#previewAssignmentClose").addEventListener("click",()=>closeAssignmentDrawer());
$("#previewDrawerScrim").addEventListener("click",()=>closeAssignmentDrawer());
$("#previewAssignmentList").addEventListener("click",(event)=>{const target=event.target.closest("[data-assignment]");if(target)go(Number(target.dataset.assignment));});
$("#previewPrevious").addEventListener("click",()=>go(assignment-1));
$("#previewNext").addEventListener("click",()=>go(assignment+1));
addEventListener("popstate",()=>{assignment=Math.min(15,Math.max(1,Number(new URLSearchParams(location.search).get("assignment")||1)));load();});
addEventListener("keydown",(event)=>{if(event.key==="Escape"&&!$("#previewDrawerScrim").hidden)closeAssignmentDrawer();});
load();
