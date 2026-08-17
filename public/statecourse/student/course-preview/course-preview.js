const params=new URLSearchParams(location.search);
const courseId=params.get("course_id")||"ca-real-estate-principles-45-v1";
let assignment=Math.min(15,Math.max(1,Number(params.get("assignment")||1)));
const validCourses=new Set(["ca-real-estate-principles-45-v1","ca-real-estate-practice-45-v1","ca-mortgage-loan-brokering-lending-45-v1"]);
const $=(selector)=>document.querySelector(selector);
const escapeHtml=(value="")=>String(value).replace(/[&<>"']/g,(char)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));

function inline(value){
  return escapeHtml(value)
    .replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g,"<em>$1</em>");
}
function renderMarkdown(markdown){
  const lines=String(markdown||"").replace(/\r/g,"").split("\n"),output=[];
  let paragraph=[],list=[],table=[];
  const flushParagraph=()=>{if(paragraph.length){output.push("<p>"+inline(paragraph.join(" "))+"</p>");paragraph=[];}};
  const flushList=()=>{if(list.length){output.push("<ul>"+list.map((item)=>"<li>"+inline(item)+"</li>").join("")+"</ul>");list=[];}};
  const flushTable=()=>{if(!table.length)return;const rows=table.filter((row)=>!row.every((cell)=>/^:?-+:?$/.test(cell)));if(rows.length)output.push("<div class=\"preview-table-wrap\"><table><thead><tr>"+rows[0].map((cell)=>"<th>"+inline(cell)+"</th>").join("")+"</tr></thead><tbody>"+rows.slice(1).map((row)=>"<tr>"+row.map((cell)=>"<td>"+inline(cell)+"</td>").join("")+"</tr>").join("")+"</tbody></table></div>");table=[];};
  const flush=()=>{flushParagraph();flushList();flushTable();};
  for(const raw of lines){
    const line=raw.trim();
    if(line.startsWith("|")&&line.endsWith("|")){flushParagraph();flushList();table.push(line.slice(1,-1).split("|").map((cell)=>cell.trim()));continue;}
    if(table.length)flushTable();
    if(!line){flushParagraph();flushList();continue;}
    const heading=line.match(/^(#{1,3})\s+(.+)$/);
    if(heading){flush();const level=heading[1].length;output.push(`<h${level}>${inline(heading[2])}</h${level}>`);continue;}
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
    $("#previewAssignmentTitle").textContent=module.title;
    $("#previewLessonBody").innerHTML=renderMarkdown(await contentResponse.text());
    $("#previewAssignmentList").innerHTML=framework.modules.map((item,index)=>`<li><button class="assignment-link" type="button" data-assignment="${index+1}" aria-current="${index+1===assignment}"><span class="number">${String(index+1).padStart(2,"0")}</span><span><strong>${escapeHtml(item.title)}</strong><small>Available for course review</small></span></button></li>`).join("");
    $("#previewPrevious").disabled=assignment===1;
    $("#previewNext").disabled=assignment===15;
    document.title=`${module.title} | ${framework.title} | StateCourse`;
    message.hidden=true;shell.hidden=false;
  }catch(error){console.error(error);message.textContent="This California lesson preview is temporarily unavailable.";message.classList.add("error");}
}
function go(next){assignment=Math.min(15,Math.max(1,next));const url=new URL(location.href);url.searchParams.set("course_id",courseId);url.searchParams.set("assignment",assignment);history.pushState({},"",url);window.scrollTo({top:0,behavior:"smooth"});load();}
$("#previewAssignmentList").addEventListener("click",(event)=>{const target=event.target.closest("[data-assignment]");if(target)go(Number(target.dataset.assignment));});
$("#previewPrevious").addEventListener("click",()=>go(assignment-1));
$("#previewNext").addEventListener("click",()=>go(assignment+1));
addEventListener("popstate",()=>{assignment=Math.min(15,Math.max(1,Number(new URLSearchParams(location.search).get("assignment")||1)));load();});
load();
