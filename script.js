// PeerLoop: beginner-friendly front-end demo.
// Data is stored in this browser only. This is not secure authentication or a shared online database.
const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "peerloop-demo-v1";
const starterData = {
  users: ["Sam", "Alex", "Jordan"],
  submissions: [
    {id:"seed1", owner:"Alex", title:"Basics of HTML", subject:"Web Development", text:"HTML gives a web page its structure. Headings, paragraphs, links and forms are common elements.", created:"Sample"},
    {id:"seed2", owner:"Jordan", title:"Python loops explained", subject:"Python Programming", text:"A loop repeats a block of code. A for loop is useful when going through a sequence, while a while loop runs as long as a condition is true.", created:"Sample"}
  ],
  reviews: [
    {id:"rseed1", submissionId:"seed2", reviewer:"Alex", rating:4, strengths:"The difference between for and while loops is explained clearly.", suggestion:"Adding a tiny code example would make the explanation even easier to follow.", created:"Sample"}
  ],
  activity: [{text:"Welcome to PeerLoop. Explore a sample assignment or submit your own.", when:"Just now"}]
};
let data = loadData();
let currentUser = data.users[0];
let selectedSubmission = null;
let toastTimer;

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : structuredClone(starterData);
  } catch (error) {
    return JSON.parse(JSON.stringify(starterData));
  }
}
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function showToast(message) {
  const toast = $("toast"); toast.textContent = message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function addActivity(text) { data.activity.unshift({text, when:"Just now"}); data.activity = data.activity.slice(0,8); }
function switchView(view) {
  document.querySelectorAll(".view").forEach(section => section.classList.toggle("active", section.id === view));
  document.querySelectorAll(".nav-link").forEach(button => button.classList.toggle("active", button.dataset.view === view));
  if (view === "reviews" && selectedSubmission) renderReviewQueue();
  window.scrollTo({top:0, behavior:"smooth"});
}
document.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click", () => switchView(button.dataset.view)));
document.querySelectorAll("[data-go]").forEach(button => button.addEventListener("click", () => switchView(button.dataset.go)));

$("switchUser").addEventListener("click", () => {
  const names = ["Sam", "Alex", "Jordan", "Taylor"];
  const next = names[(names.indexOf(currentUser) + 1) % names.length];
  currentUser = next;
  if (!data.users.includes(next)) data.users.push(next);
  renderAll(); showToast("Demo view switched to " + currentUser + ".");
});

$("submissionForm").addEventListener("submit", event => {
  event.preventDefault();
  const title = $("assignmentTitle").value.trim();
  const text = $("assignmentText").value.trim();
  if (title.length < 3 || text.length < 10) { showToast("Add a title and at least 10 characters of work."); return; }
  data.submissions.unshift({
    id:"s" + Date.now(), owner:currentUser, title, subject:$("assignmentSubject").value,
    text, created:new Date().toLocaleDateString()
  });
  addActivity("You submitted “" + title + "” for peer review.");
  saveData(); event.target.reset(); renderAll(); showToast("Assignment submitted successfully.");
});

function beginReview(id) {
  const submission = data.submissions.find(item => item.id === id);
  if (!submission) return;
  if (submission.owner === currentUser) { showToast("You cannot review your own submission."); return; }
  if (data.reviews.some(review => review.submissionId === id && review.reviewer === currentUser)) {
    showToast("You have already reviewed this submission."); return;
  }
  selectedSubmission = id;
  $("reviewSubmissionId").value = id;
  $("reviewFormTitle").textContent = submission.title;
  $("reviewPrompt").classList.add("hidden");
  $("reviewForm").classList.remove("hidden");
  $("selectedWork").innerHTML = `<strong>${escapeHTML(submission.owner)} · ${escapeHTML(submission.subject)}</strong><p>${escapeHTML(submission.text)}</p>`;
  $("rating").value = ""; $("strengths").value = ""; $("suggestion").value = "";
  renderReviewQueue();
  $("reviewPanel").scrollIntoView({behavior:"smooth", block:"start"});
}
$("reviewForm").addEventListener("submit", event => {
  event.preventDefault();
  const submissionId = $("reviewSubmissionId").value;
  const submission = data.submissions.find(item => item.id === submissionId);
  if (!submission || submission.owner === currentUser) { showToast("Choose another student's submission."); return; }
  if (data.reviews.some(review => review.submissionId === submissionId && review.reviewer === currentUser)) { showToast("You have already reviewed this submission."); return; }
  data.reviews.unshift({
    id:"r" + Date.now(), submissionId, reviewer:currentUser, rating:Number($("rating").value),
    strengths:$("strengths").value.trim(), suggestion:$("suggestion").value.trim(),
    created:new Date().toLocaleDateString()
  });
  addActivity("You reviewed “" + submission.title + "”.");
  saveData(); selectedSubmission = null;
  $("reviewForm").classList.add("hidden"); $("reviewPrompt").classList.remove("hidden");
  $("reviewFormTitle").textContent = "Review a submission";
  renderAll(); showToast("Thanks! Your peer review has been saved.");
});

function renderDashboard() {
  const mine = data.submissions.filter(item => item.owner === currentUser);
  const completed = data.reviews.filter(item => item.reviewer === currentUser);
  const received = data.reviews.filter(review => data.submissions.some(sub => sub.id === review.submissionId && sub.owner === currentUser));
  $("submittedCount").textContent = mine.length;
  $("reviewsCount").textContent = completed.length;
  $("feedbackCount").textContent = received.length;
  $("todayLabel").textContent = new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
  const queue = data.submissions.filter(sub => sub.owner !== currentUser && !data.reviews.some(r => r.submissionId === sub.id && r.reviewer === currentUser)).slice(0,3);
  $("dashboardReviews").innerHTML = queue.length ? queue.map(sub => itemRow(sub, "Review", `data-review="${sub.id}"`)).join("") : emptyState("You're all caught up. New classmate submissions will appear here.");
  $("activityList").innerHTML = data.activity.slice(0,5).map(item => `<div class="activity"><span class="activity-dot"></span><div><p>${escapeHTML(item.text)}</p><small>${escapeHTML(item.when)}</small></div></div>`).join("");
}
function itemRow(sub, action, attr="") {
  return `<div class="item-row"><span class="item-symbol">${escapeHTML(sub.title.slice(0,1).toUpperCase())}</span><div class="item-main"><strong>${escapeHTML(sub.title)}</strong><small>${escapeHTML(sub.owner)} · ${escapeHTML(sub.subject)}</small></div>${action ? `<button ${attr}>${action}</button>` : ""}</div>`;
}
function emptyState(text) { return `<div class="empty-state">${escapeHTML(text)}</div>`; }
function renderSubmissions() {
  $("submissionList").innerHTML = data.submissions.length ? data.submissions.map(sub => `<div class="item-row"><span class="item-symbol">▤</span><div class="item-main"><strong>${escapeHTML(sub.title)}</strong><small>${escapeHTML(sub.owner)} · ${escapeHTML(sub.subject)} · ${escapeHTML(sub.created)}</small></div><span class="status">${sub.owner === currentUser ? "Yours" : "Shared"}</span></div>`).join("") : emptyState("No assignments yet. Submit the first one.");
}
function renderReviewQueue() {
  const queue = data.submissions.filter(sub => sub.owner !== currentUser && !data.reviews.some(r => r.submissionId === sub.id && r.reviewer === currentUser));
  $("reviewQueue").innerHTML = queue.length ? queue.map(sub => itemRow(sub, "Review", `data-review="${sub.id}"`)).join("") : emptyState("No new work to review right now. Switch demo users or add another sample submission.");
}
function renderFeedback() {
  const mine = data.submissions.filter(sub => sub.owner === currentUser);
  const reviews = data.reviews.filter(review => mine.some(sub => sub.id === review.submissionId));
  $("feedbackList").innerHTML = reviews.length ? reviews.map(review => {
    const sub = mine.find(item => item.id === review.submissionId);
    return `<article class="feedback-card"><h3>${escapeHTML(sub.title)}</h3><small>Review from ${escapeHTML(review.reviewer)} · ${escapeHTML(review.created)}</small><div class="rating">★ ${review.rating}/5</div><p><strong>What went well</strong><br>${escapeHTML(review.strengths)}</p><p><strong>Suggestion</strong><br>${escapeHTML(review.suggestion)}</p></article>`;
  }).join("") : emptyState("No feedback received yet. Submit an assignment, then switch to another demo user to review it.");
}
function renderAll() {
  $("userLabel").textContent = currentUser;
  $("avatar").textContent = currentUser.charAt(0).toUpperCase();
  renderDashboard(); renderSubmissions(); renderReviewQueue(); renderFeedback();
}
document.addEventListener("click", event => {
  const button = event.target.closest("[data-review]");
  if (button) beginReview(button.dataset.review);
});
$("todayLabel").textContent = new Date().toLocaleDateString();
renderAll();
