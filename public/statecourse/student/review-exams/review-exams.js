const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let latest = 0;
let current = null;
const requestedCourse = new URLSearchParams(location.search).get('course_id') || '';

function renderQuestions() {
  if (!current) return;
  const showKey = $('reviewKey').checked;
  $('reviewQuestions').innerHTML = current.exam.items.map(item => `<li>
    <h3>${esc(item.prompt)}</h3>
    <ol class="choices">${item.choices.map(choice => `<li>${esc(choice)}</li>`).join('')}</ol>
    ${showKey ? `<div class="answer"><strong>Answer: ${esc(String.fromCharCode(65 + item.correctChoice))}</strong>
      <p>${esc(item.rationale)}</p><p>Source: ${esc(item.source)}</p></div>` : ''}
  </li>`).join('');
}

async function loadReview() {
  const version = ++latest;
  $('reviewMessage').textContent = 'Loading examination review…';
  $('reviewContent').hidden = true;
  $('reviewSignIn').hidden = true;
  current = null;
  $('reviewQuestions').replaceChildren();
  try {
    const params = new URLSearchParams({ form: $('reviewForm').value });
    const courseId = $('reviewCourse').value || requestedCourse;
    if (courseId) params.set('course_id', courseId);
    const response = await fetch(`/api/student/review-exams?${params}`, { credentials:'same-origin', cache:'no-store' });
    const data = await response.json().catch(() => ({}));
    if (version !== latest) return;
    if (!response.ok) {
      $('reviewSignIn').hidden = response.status !== 401;
      throw new Error(response.status === 401 ? 'Sign in with your Regulator/Reviewer account.'
        : response.status === 403 ? 'This account has no active regulator review access. The Sample Student account uses the normal course and examination controls.'
        : 'Examination review is temporarily unavailable. Please try again.');
    }
    current = data;
    $('reviewCourse').innerHTML = data.courses.map(course => `<option value="${esc(course.courseId)}">${esc(course.title)}</option>`).join('');
    $('reviewCourse').value = data.course.courseId;
    $('reviewForm').value = data.exam.form;
    $('reviewTitle').textContent = `${data.course.title} — Form ${data.exam.form}`;
    $('reviewFacts').textContent = `${data.exam.questionCount} questions · Passing score ${data.exam.passingPercent}% · Student time limit ${data.exam.minutes} minutes. No timer applies to this review.`;
    renderQuestions();
    $('reviewMessage').textContent = data.notice;
    $('reviewContent').hidden = false;
  } catch (error) {
    if (version === latest) $('reviewMessage').textContent = error.message;
  }
}
$('reviewCourse').addEventListener('change', loadReview);
$('reviewForm').addEventListener('change', loadReview);
$('reviewKey').addEventListener('change', renderQuestions);
loadReview();
