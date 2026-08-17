import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile,stat } from "node:fs/promises";
import test from "node:test";

const read = (path,encoding="utf8") => readFile(new URL(`../${path}`,import.meta.url),encoding);

test("homepage keeps the licensing finder ahead of the introduction video",async()=>{
  const html=await read("public/statecourse/index.html");
  assert.ok(html.indexOf('id="licensing-finder"') < html.indexOf('id="statecourse-introduction"'));
  assert.match(html,/Real Estate Licensing,/);
  assert.match(html,/Choose Your State/);
  assert.match(html,/View My Licensing Path/);
  assert.match(html,/preload="none"/);
  assert.match(html,/playsinline/);
  assert.doesNotMatch(html,/<video[^>]+\ssrc=/);
  assert.match(html,/Read Transcript/);
  assert.match(html,/Explore State Requirements/);
  assert.match(html,/never counts toward regulated course time or completion/i);
});

test("production video is preserved and poster is lightweight",async()=>{
  const video=await read("public/statecourse/media/statecourse-intro.mp4",null);
  const posterInfo=await stat(new URL("../public/statecourse/media/statecourse-intro-poster.webp",import.meta.url));
  assert.equal(createHash("sha256").update(video).digest("hex"),"75d242b997a27037463eb21e8b4116db4e2dafc32ae5529bcbdc3d85984cd031");
  assert.ok(posterInfo.size < 150_000);
});

test("captions are clean WebVTT with short readable cue blocks",async()=>{
  const captions=await read("public/statecourse/media/statecourse-intro.vtt");
  assert.match(captions,/^WEBVTT/);
  assert.doesNotMatch(captions,/\*\*/);
  assert.doesNotMatch(captions,/\d\d:\d\d:\d\d,\d{3}/);
  for(const cue of captions.trim().split(/\n\n+/).slice(1)){
    const textLines=cue.split("\n").filter((line)=>line && !line.includes(" --> "));
    assert.ok(textLines.length <= 2,`Caption cue exceeds two lines: ${cue}`);
  }
});

test("video events are marketing-only and include required milestones",async()=>{
  const [client,configuration]=await Promise.all([
    read("public/statecourse/national.js"),
    read("public/statecourse/data/homepage-video.json")
  ]);
  for(const event of ["visible","play","25_percent","50_percent","75_percent","completed","choose_state_after_video","explore_requirements_after_video"]){
    assert.match(client,new RegExp(event));
  }
  assert.match(client,/marketing_only:\s*true/);
  assert.match(client,/regulated_progress:\s*false/);
  assert.equal(JSON.parse(configuration).regulatedInstruction,false);
});
