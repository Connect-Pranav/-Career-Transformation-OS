/* =============================================
   PRANAV AI ACADEMY — Shared JavaScript
   ============================================= */

// ---- NAVBAR TOGGLE ----
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('navMenu');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  // Active nav link
  var links = document.querySelectorAll('.navbar-nav a');
  var current = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(function (l) {
    if (l.getAttribute('href') === current) l.classList.add('active');
  });

  // Animate numbers on scroll
  animateNumbers();

  // Init tracker if on tracker page
  if (document.getElementById('trackerApp')) initTracker();

  // Init course filters if present
  if (document.getElementById('courseGrid')) initCourseFilter();

  // Init progress bars animation
  setTimeout(function () {
    document.querySelectorAll('.progress-fill, .master-fill, .skill-bar-now, .skill-bar-target').forEach(function (el) {
      var w = el.getAttribute('data-width');
      if (w) el.style.width = w;
    });
  }, 300);
});

// ---- COUNTER ANIMATION ----
function animateNumbers() {
  var counters = document.querySelectorAll('[data-count]');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'));
        var duration = 1200;
        var start = 0;
        var step = target / (duration / 16);
        var timer = setInterval(function () {
          start += step;
          if (start >= target) { start = target; clearInterval(timer); }
          el.textContent = Math.floor(start) + (el.getAttribute('data-suffix') || '');
        }, 16);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(function (c) { observer.observe(c); });
}

// ---- TOAST ----
function showToast(msg, type) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast ' + (type || '') + ' show';
  setTimeout(function () { t.classList.remove('show'); }, 3000);
}

// ---- COURSE FILTER ----
function initCourseFilter() {
  var tabs = document.querySelectorAll('.filter-tab');
  var cards = document.querySelectorAll('.course-card[data-phase]');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var phase = tab.getAttribute('data-filter');
      cards.forEach(function (c) {
        if (phase === 'all' || c.getAttribute('data-phase') === phase) {
          c.style.display = '';
        } else {
          c.style.display = 'none';
        }
      });
    });
  });
}

// ---- TRACKER ----
var TRACKER_KEY = 'nexus_tracker_v1';

function initTracker() {
  var saved = JSON.parse(localStorage.getItem(TRACKER_KEY) || '{}');

  // Restore checkboxes
  document.querySelectorAll('.week-tasks input[type=checkbox]').forEach(function (cb) {
    var key = cb.getAttribute('data-key');
    if (key && saved[key]) {
      cb.checked = true;
      cb.closest('li').classList.add('checked');
    }
    cb.addEventListener('change', function () {
      saved[key] = cb.checked;
      localStorage.setItem(TRACKER_KEY, JSON.stringify(saved));
      cb.closest('li').classList.toggle('checked', cb.checked);
      updateTrackerStats();
      showToast(cb.checked ? '✓ Task marked complete!' : 'Task unchecked', cb.checked ? 'success' : '');
    });
  });

  updateTrackerStats();
}

function updateTrackerStats() {
  var all = document.querySelectorAll('.week-tasks input[type=checkbox]');
  var done = document.querySelectorAll('.week-tasks input[type=checkbox]:checked');
  var pct = all.length ? Math.round((done.length / all.length) * 100) : 0;

  var el = document.getElementById('overallPct');
  if (el) el.textContent = pct + '%';
  var bar = document.getElementById('masterBar');
  if (bar) bar.style.width = pct + '%';
  var doneEl = document.getElementById('tasksDone');
  if (doneEl) doneEl.textContent = done.length;
  var totalEl = document.getElementById('tasksTotal');
  if (totalEl) totalEl.textContent = all.length;

  // Phase progress
  document.querySelectorAll('.phase-progress-fill[data-phase]').forEach(function (pb) {
    var p = pb.getAttribute('data-phase');
    var phAll = document.querySelectorAll('.week-tasks input[data-phase="' + p + '"]');
    var phDone = document.querySelectorAll('.week-tasks input[data-phase="' + p + '"]:checked');
    var phPct = phAll.length ? Math.round((phDone.length / phAll.length) * 100) : 0;
    pb.style.width = phPct + '%';
    var lbl = pb.closest('.phase-card').querySelector('.phase-pct');
    if (lbl) lbl.textContent = phPct + '%';
  });
}

function resetTracker() {
  if (!confirm('Reset all progress? This cannot be undone.')) return;
  localStorage.removeItem(TRACKER_KEY);
  document.querySelectorAll('.week-tasks input[type=checkbox]').forEach(function (cb) { cb.checked = false; cb.closest('li').classList.remove('checked'); });
  updateTrackerStats();
  showToast('Progress reset.');
}
