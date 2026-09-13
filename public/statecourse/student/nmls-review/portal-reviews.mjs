// Independent discovery: unavailable/missing NMLS migrations must never stop
// the existing student portal or manufacture enrollment-backed course cards.
import { postReview } from './review-client.mjs';
const section = document.getElementById('privateReviewsGroup');
const list = document.getElementById('privateReviews');
postReview({ kind: 'list' }).then(({ status, body }) => {
  if (status !== 200 || !Array.isArray(body.reviews) || !body.reviews.length) return;
  for (const review of body.reviews) {
    const paragraph = document.createElement('p');
    if (review.available) {
      const link = document.createElement('a');
      link.href = `/student/nmls-review/?grant_id=${encodeURIComponent(review.grantId)}`;
      link.textContent = review.title; paragraph.append(link);
    } else paragraph.textContent = `${review.title} — assigned version unavailable`;
    list.append(paragraph);
  }
  section.hidden = false;
}).catch(() => { /* NMLS availability is isolated from existing enrollments. */ });
