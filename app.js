import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const $=id=>document.getElementById(id);const c=window.PEERLOOP_CONFIG||{};
const configured=c.SUPABASE_URL?.startsWith("https://")&&!c.SUPABASE_URL.includes("PASTE_YOUR")&&c.SUPABASE_ANON_KEY&&!c.SUPABASE_ANON_KEY.includes("PASTE_YOUR");
const db=configured?createClient(c.SUPABASE_URL,c.SUPABASE_ANON_KEY):null;
let session=null,name="Student",assignments=[],reviews=[],mode="login",isAdmin=false;
const esc=s=>String(s??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
function msg(id,t,error=false){$(id).textContent=t;$(id).classList.toggle("error",error)}
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2800)}
function setMode(m){mode=m;$("loginTab").classList.toggle("chosen",m==="login");$("signupTab").classList.toggle("chosen",m==="signup");$("nameField").classList.toggle("hide",m!=="signup");$("authTitle").textContent=m==="login"?"Welcome back":"Create your account";$("authSub").textContent=m==="login"?"Log in to continue to your learning space.":"Join your class learning community.";$("authSubmit").textContent=m==="login"?"Log in →":"Create account →";msg("authMsg","")}
$("loginTab").onclick=()=>setMode("login");$("signupTab").onclick=()=>setMode("signup");
if(!db){msg("authMsg","Setup needed: add your Supabase URL and anon key in config.js, then upload it.",true);$("authSubmit").disabled=true}
$("authForm").addEventListener("submit",async e=>{e.preventDefault();if(!db)return;$("authSubmit").disabled=true;try{let email=$("email").value.trim(),password=$("password").value,r;if(mode==="signup"){let display=$("name").value.trim();if(display.length<2)throw Error("Please enter your name.");r=await db.auth.signUp({email,password,options:{data:{display_name:display}}});if(r.error)throw r.error;if(!r.data.session){setMode("login");msg("authMsg","Account created. Check your email to confirm it, then log in.");return}}else{r=await db.auth.signInWithPassword({email,password});if(r.error)throw r.error}await sessionRefresh()}catch(err){msg("authMsg",err.message||"Could not sign in.",true)}finally{$("authSubmit").disabled=false}});
$("logout").onclick=async()=>{let r=await db.auth.signOut();if(r.error)toast(r.error.message);else{session=null;showAuth()}};
function showAuth(){$("authScreen").classList.remove("hide");$("appScreen").classList.add("hide");$("nav").classList.add("hide");$("userArea").classList.add("hide")}

function showApp(){
    $("authScreen").classList.add("hide");
    $("appScreen").classList.remove("hide");
    $("nav").classList.remove("hide");
    $("userArea").classList.remove("hide");
    $("userName").textContent=name;
    $("avatar").textContent=name[0].toUpperCase();
    $("welcome").textContent="Welcome back, "+name.split(" ")[0]+"!";

    $("adminNav").classList.toggle("hide", !isAdmin);
}
async function sessionRefresh() {
    if (!db) return;

    let r = await db.auth.getSession();
    session = r.data.session;

    if (session) {
        name = session.user.user_metadata?.display_name ||
               session.user.email.split("@")[0];

        let adminCheck = await db
            .from("admin_users")
            .select("user_id")
            .eq("user_id", session.user.id)
            .maybeSingle();

      if (adminCheck.error) {
    console.error("Admin check failed:", adminCheck.error);
    isAdmin = false;
} else {
    isAdmin = Boolean(adminCheck.data);
}

        showApp();
        await load();
    } else {
        session = null;
        isAdmin = false;
        showAuth();
    }
}

async function load() {
    if (!session) return;

    try {
        let [a, r] = await Promise.all([
            db.from("assignments")
                .select("*")
                .order("created_at", { ascending: false }),

            db.from("reviews")
                .select("*")
        ]);

        console.log("ADMIN STATUS:", isAdmin);
        console.log("ASSIGNMENTS ERROR:", a.error);
        console.log("ASSIGNMENTS DATA:", a.data);
        console.log("REVIEWS ERROR:", r.error);
        console.log("REVIEWS DATA:", r.data);

        if (a.error) throw a.error;
        if (r.error) throw r.error;

        assignments = a.data || [];
        reviews = r.data || [];

        console.log("LOADED ASSIGNMENTS:", assignments.length);
        console.log("LOADED REVIEWS:", reviews.length);

        render();

    } catch (e) {
        console.error("LOAD FAILED:", e);
        toast("Database error: " + e.message);
    }
}
function go(v){document.querySelectorAll(".view").forEach(x=>x.classList.toggle("active",x.id===v));document.querySelectorAll("[data-view]").forEach(x=>x.classList.toggle("active",x.dataset.view===v));window.scrollTo({top:0,behavior:"smooth"})}
document.querySelectorAll("[data-view]").forEach(x=>x.onclick=()=>go(x.dataset.view));document.querySelectorAll("[data-go]").forEach(x=>x.onclick=()=>go(x.dataset.go));
$("subForm").addEventListener("submit",async e=>{e.preventDefault();let b=e.submitter;b.disabled=true;try{let r=await db.from("assignments").insert({owner_id:session.user.id,owner_name:name,title:$("title").value.trim(),subject:$("subject").value,body:$("body").value.trim()});if(r.error)throw r.error;e.target.reset();msg("subMsg","Published! Signed-in classmates can now see your assignment.");await load();toast("Assignment published.")}catch(err){msg("subMsg",err.message,true)}finally{b.disabled=false}});
function row(s,button=false){return `<div class="row"><span class="letter">${esc(s.title[0].toUpperCase())}</span><div class="rowtext"><b>${esc(s.title)}</b><small>${esc(s.owner_name)} · ${esc(s.subject)} · ${new Date(s.created_at).toLocaleDateString()}</small></div>${button?`<button class="mini" data-review="${s.id}">Review</button>`:""}</div>`}
function empty(t){return `<div class="empty">${esc(t)}</div>`}
function renderQueue(){let q=assignments.filter(s=>s.owner_id!==session.user.id&&!reviews.some(r=>r.assignment_id===s.id&&r.reviewer_id===session.user.id));$("queue").innerHTML=q.length?q.map(s=>row(s,true)).join(""):empty("No new assignments to review right now.");$("dashQueue").innerHTML=q.slice(0,3).length?q.slice(0,3).map(s=>row(s,true)).join(""):empty("No reviews waiting. Check back later.")}

function renderAdmin() {
    const adminSection = $("admin");
    if (!adminSection) return;

    if (!isAdmin) {
        adminSection.classList.add("hide");
        return;
    }

    adminSection.classList.remove("hide");

    $("adminAssignments").textContent = assignments.length;
    $("adminReviews").textContent = reviews.length;

    $("adminAssignmentList").innerHTML = assignments.length
        ? assignments.map(s => `
            <div class="row">
                <div class="rowtext">
                    <b>${esc(s.title)}</b>
                    <small>${esc(s.owner_name)} · ${esc(s.subject)}</small>
                </div>
            </div>
        `).join("")
        : empty("No assignments found.");

    $("adminReviewList").innerHTML = reviews.length
        ? reviews.map(r => `
            <div class="row">
                <div class="rowtext">
                    <b>${esc(r.reviewer_name)} · ${r.rating}/5</b>
                    <small>${esc(r.strengths || "No strengths provided")}</small>
                    <small>${esc(r.suggestion || "No suggestion provided")}</small>
                </div>
            </div>
        `).join("")
        : empty("No reviews found.");
}
function render() {
    console.log("PEERLOOP: render called");
    console.log("PEERLOOP: renderAdmin type:", typeof renderAdmin);

    renderAssignments();
    renderAdmin();
}
function renderAssignments() {
    let search = $("searchAssignments").value.toLowerCase().trim();
    let subject = $("filterSubject").value;

    let filtered = assignments.filter(s => {
        let matchesSearch = s.title.toLowerCase().includes(search);
        let matchesSubject = subject === "All" || s.subject === subject;

        return matchesSearch && matchesSubject;
    });

    $("subList").innerHTML = filtered.map(s => `
        <div class="row">
            <span class="letter">${esc(s.title[0].toUpperCase())}</span>
            <div class="rowtext">
                <b>${esc(s.title)}</b>
                <small>
                    ${esc(s.owner_name)} · ${esc(s.subject)}
                    · ${reviews.filter(r => r.assignment_id === s.id).length} review(s)
                </small>
            </div>
            <span class="chip">
                ${s.owner_id === session.user.id ? "Yours" : "Shared"}
            </span>
        </div>
    `).join("") || empty("No matching assignments found.");
}

function startReview(id){let s=assignments.find(x=>x.id===id);if(!s)return;if(s.owner_id===session.user.id)return toast("You can't review your own assignment.");if(reviews.some(r=>r.assignment_id===id&&r.reviewer_id===session.user.id))return toast("You've already reviewed this assignment.");$("reviewId").value=id;$("reviewTitle").textContent=s.title;$("reviewPrompt").classList.add("hide");$("reviewForm").classList.remove("hide");$("work").innerHTML=`<b>${esc(s.owner_name)} · ${esc(s.subject)}</b><p>${esc(s.body)}</p>`;$("rating").value="";$("strengths").value="";$("suggestion").value="";go("reviews")}
document.addEventListener("click",e=>{let b=e.target.closest("[data-review]");if(b)startReview(b.dataset.review)});
$("reviewForm").addEventListener("submit",async e=>{e.preventDefault();let id=$("reviewId").value,b=e.submitter;b.disabled=true;try{let r=await db.from("reviews").insert({assignment_id:id,reviewer_id:session.user.id,reviewer_name:name,rating:Number($("rating").value),strengths:$("strengths").value.trim(),suggestion:$("suggestion").value.trim()});if(r.error){if(r.error.code==="23505")throw Error("You already reviewed this assignment.");throw r.error}e.target.classList.add("hide");$("reviewPrompt").classList.remove("hide");$("reviewTitle").textContent="Write a review";await load();toast("Your review has been shared.")}catch(err){msg("reviewMsg",err.message,true)}finally{b.disabled=false}});// Open the profile page
$("profileBtn").onclick = () => {
    $("profileEmail").value = session.user.email;
    $("profileName").value = name;
    msg("profileMsg", "");
    go("profile");
};

// Save profile changes
$("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    let newName = $("profileName").value.trim();
    let button = e.submitter;

    if (newName.length < 2) {
        msg("profileMsg", "Name must contain at least 2 characters.", true);
        return;
    }

    button.disabled = true;

    try {
        let result = await db.auth.updateUser({
            data: {
                display_name: newName
            }
        });

        if (result.error) throw result.error;

        name = newName;
        showApp();

        msg("profileMsg", "Profile updated successfully!");
        toast("Profile saved.");

    } catch (error) {
        msg("profileMsg", error.message, true);
    } finally {
        button.disabled = false;
    }
});
if(db){db.auth.onAuthStateChange((_event,s)=>{session=s;if(s){name=s.user.user_metadata?.display_name||s.user.email.split("@")[0];showApp();setTimeout(load,0)}else showAuth()});sessionRefresh()}
$("searchAssignments").addEventListener("input", renderAssignments);

$("filterSubject").addEventListener("change", renderAssignments);
