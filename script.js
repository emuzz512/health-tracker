// Fixed syntax error - version 3 - weight tracking added
// SVG Icon Definitions
const icons = {
    target: '<svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    utensils: '<svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',
    brain: '<svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>',
    sparkles: '<svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>',
    activity: '<svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
    sunrise: '<svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/></svg>',
    sun: '<svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
    moon: '<svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>'
};

// Current week tracking
let currentWeekStart = getWeekStart(new Date());
let currentDay = null;
let entries = {};

// Load data from Firestore
async function loadData() {
    if (!window.currentUser || !window.firebaseDb) return;
    
    try {
        // Import Firestore functions
        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        const userDocRef = doc(window.firebaseDb, 'users', window.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
            const data = userDoc.data();
            entries = data.entries || {};
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// This function will be called when user logs in
window.loadUserData = async function() {
    await loadData();
    generateWeekView();
};

// Save data to Firestore
async function saveData() {
    if (!window.currentUser || !window.firebaseDb) return;
    
    try {
        // Import Firestore functions
        const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        const userDocRef = doc(window.firebaseDb, 'users', window.currentUser.uid);
        await setDoc(userDocRef, {
            entries: entries,
            lastUpdated: new Date()
        }, { merge: true });
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Error saving data. Please try again.');
    }
}

// Get Monday of the week for a given date
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

// Format date as key
function getDateKey(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

// Get week key for grounding focus storage (ISO week format)
function getWeekKey(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const weekStart = getWeekStart(d);
    const yearStart = new Date(year, 0, 1);
    const weekNum = Math.ceil((((weekStart - yearStart) / 86400000) + 1) / 7);
    return `${year}-W${String(weekNum).padStart(2, "0")}`;
}

// Format date for display
function formatDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
}

// Get day name
function getDayName(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
}

// Generate weekly view
function generateWeekView() {
    const weekView = document.getElementById('weekView');
    weekView.innerHTML = '';
    
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    document.getElementById('weekRange').textContent = 
        `Week of ${formatDate(currentWeekStart)} - ${formatDate(weekEnd)}, ${currentWeekStart.getFullYear()}`;
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekStart);
        date.setDate(date.getDate() + i);
        const dateKey = getDateKey(date);
        const dayData = entries[dateKey] || {};
        
        const dayCard = document.createElement('div');
        
        // Determine if day is past, today, or future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const cardDate = new Date(date);
        cardDate.setHours(0, 0, 0, 0);
        
        let dayClass = 'day-card collapsed';
        if (cardDate < today) {
            dayClass += ' past-day';
        } else if (cardDate.getTime() === today.getTime()) {
            dayClass += ' today';
        } else {
            dayClass += ' future-day';
        }
        
        dayCard.className = dayClass;
        
        // Expand icon
        const expandIcon = document.createElement('div');
        expandIcon.className = 'expand-icon';
        expandIcon.textContent = '▼';
        dayCard.appendChild(expandIcon);
        
        // Header
        const header = document.createElement('div');
        header.className = 'day-header-card';
        header.innerHTML = `
            <div class="day-name">${getDayName(date)}</div>
            <div class="day-date">${formatDate(date)}</div>
        `;
        dayCard.appendChild(header);
        
        // Status indicators (shown when collapsed)
        const statusDiv = document.createElement('div');
        statusDiv.className = 'status-indicators';
        
        const goalsStatus = getGoalsStatus(dayData);
        const mealsStatus = getMealsStatus(dayData);
        const urgesStatus = getUrgesStatus(dayData);
        const exerciseStatus = getExerciseStatus(dayData);
        const reflectionStatus = getReflectionStatus(dayData);
        
        if (goalsStatus !== 'Not set') {
            const indicator = document.createElement('span');
            indicator.className = 'status-indicator' + (goalsStatus.includes('complete') ? ' complete' : ' partial');
            indicator.innerHTML = `${icons.target} ${goalsStatus}`;
            statusDiv.appendChild(indicator);
        }
        
        if (mealsStatus !== 'Not tracked') {
            const indicator = document.createElement('span');
            indicator.className = 'status-indicator' + (mealsStatus.includes('3/3') ? ' complete' : ' partial');
            indicator.innerHTML = `${icons.utensils} ${mealsStatus}`;
            statusDiv.appendChild(indicator);
        }
        
        if (exerciseStatus !== "Not tracked") {
            const indicator = document.createElement("span");
            const isComplete = exerciseStatus.includes("/") && exerciseStatus.split("/")[0] === exerciseStatus.split("/")[1].split(" ")[0];
            indicator.className = "status-indicator" + (isComplete ? " complete" : " partial");
            indicator.innerHTML = `${icons.activity} ${exerciseStatus}`;
            statusDiv.appendChild(indicator);
        }
        
        if (urgesStatus !== 'No urges tracked') {
            const indicator = document.createElement('span');
            indicator.className = 'status-indicator partial';
            indicator.innerHTML = `${icons.sparkles} ${urgesStatus}`;
            statusDiv.appendChild(indicator);
        }
        
        if (reflectionStatus !== 'Not filled') {
            const indicator = document.createElement('span');
            indicator.className = 'status-indicator complete';
            indicator.innerHTML = `${icons.brain} ${reflectionStatus}`;
            statusDiv.appendChild(indicator);
        }
        
        dayCard.appendChild(statusDiv);
        
        // Buttons (shown when expanded)
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'day-buttons';
        
        const goalsBtn = createTrackingButton(
            `${icons.target} Goals & Intention`,
            goalsStatus,
            () => openGoalsModal(date),
            (dayData.goals && dayData.goals.length > 0) || dayData.centralThought
        );
        buttonsDiv.appendChild(goalsBtn);
        
        const mealsBtn = createTrackingButton(
            `${icons.utensils} Meals`,
            mealsStatus,
            () => openMealsModal(date),
            dayData.meals && Object.keys(dayData.meals).length > 0
        );
        buttonsDiv.appendChild(mealsBtn);
        
        const exerciseBtn = createTrackingButton(
            `${icons.activity} Exercise`,
            "Not tracked",
            () => openExerciseModal(date),
            false
        );
        buttonsDiv.appendChild(exerciseBtn);
        
        const urgesBtn = createTrackingButton(
            `${icons.sparkles} Urges`,
            urgesStatus,
            () => openUrgesModal(date),
            dayData.urges && dayData.urges.length > 0
        );
        buttonsDiv.appendChild(urgesBtn);
        
        const reflectionBtn = createTrackingButton(
            `${icons.brain} Reflection`,
            reflectionStatus,
            () => openReflectionModal(date),
            dayData.reflection && (dayData.reflection.daily || dayData.reflection.proud || dayData.reflection.learn)
        );
        buttonsDiv.appendChild(reflectionBtn);
        
        dayCard.appendChild(buttonsDiv);
        
        // Toggle collapse/expand on click
        dayCard.addEventListener('click', (e) => {
            console.log('Card clicked!', e.target);
            // Don't toggle if clicking a button
            if (e.target.closest('.track-btn')) {
                console.log('Button clicked, not toggling');
                return;
            }
            
            console.log('Toggling collapse/expand');
            dayCard.classList.toggle('collapsed');
            dayCard.classList.toggle('expanded');
        });
        
        weekView.appendChild(dayCard);
    }

    // Load grounding focus data for current week
    loadGroundingFocus();
    loadWeightGoals();
}
function createTrackingButton(label, status, onClick, hasData) {
    const btn = document.createElement('button');
    btn.className = 'track-btn' + (hasData ? ' has-data' : '');
    btn.innerHTML = `
        <span class="btn-label">${label}</span>
        <span class="btn-status">${status}</span>
    `;
    btn.onclick = onClick;
    return btn;
}

function getGoalsStatus(dayData) {
    if (!dayData.goals || dayData.goals.length === 0) {
        return dayData.centralThought ? 'Intention set' : 'Not set';
    }
    const completed = dayData.goals.filter(g => g.completed).length;
    return `${completed}/${dayData.goals.length} complete`;
}

function getMealsStatus(dayData) {
    if (!dayData.meals) return 'Not tracked';
    let count = 0;
    if (dayData.meals.breakfastPlan) count++;
    if (dayData.meals.lunchPlan) count++;
    if (dayData.meals.dinnerPlan) count++;
    return count > 0 ? `${count}/3 meals logged` : 'Not tracked';
}

function getUrgesStatus(dayData) {
    if (!dayData.urges || dayData.urges.length === 0) return 'No urges tracked';
    return `${dayData.urges.length} urge${dayData.urges.length > 1 ? 's' : ''} tracked`;
}

function getReflectionStatus(dayData) {
    if (!dayData.reflection) return 'Not filled';
    const parts = [];
    if (dayData.reflection.daily) parts.push('reflection');
    if (dayData.reflection.proud) parts.push('proud');
    if (dayData.reflection.learn) parts.push('lessons');
    return parts.length > 0 ? '✓ ' + parts.join(', ') : 'Not filled';
}

function getExerciseStatus(dayData) {
    if (!dayData.exercise || !dayData.exercise.planned || dayData.exercise.planned.length === 0) {
        return 'Not tracked';
    }
    const completed = dayData.exercise.planned.filter(e => e.completed).length;
    const total = dayData.exercise.planned.length;
    return `${completed}/${total} completed`;
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

document.getElementById('prevWeek').addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    generateWeekView();
});

document.getElementById('nextWeek').addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    generateWeekView();
});

// ========== GOALS & INTENTION MODAL ==========

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function formatDayName(dateInput) {
  // Handle both string and Date object inputs
  let date;
  if (typeof dateInput === 'string') {
    date = new Date(dateInput + 'T00:00:00');
  } else {
    date = new Date(dateInput);
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  const diffTime = date - today;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  if (diffDays === 0) return `Today, ${monthDay}`;
  if (diffDays === 1) return `Tomorrow, ${monthDay}`;
  if (diffDays === -1) return `Yesterday, ${monthDay}`;
  
  return `${dayName}, ${monthDay}`;
}

function openGoalsModal(date) {
    currentDay = date;
    const dateKey = getDateKey(date);
    const dayData = entries[dateKey] || {};
    
    document.getElementById('goalsModalTitle').innerHTML = icons.target + ' Goals & Intention - ' + formatDayName(date);
        `${icons.target} Goals & Intention - ${getDayName(date)}, ${formatDate(date)}`;
    
    document.getElementById('centralThought').value = dayData.centralThought || '';
    
    // Load today's weight (specific to this day, does NOT carry over)
    const todayWeightValue = dayData.todayWeight || '';
    if (document.getElementById('todayWeightGoals')) {
        document.getElementById('todayWeightGoals').value = todayWeightValue;
    }
    
    // Show comparison to this week's weight goal
    updateWeeklyWeightComparison(todayWeightValue);
    document.getElementById('goalsModal').classList.add('show');
}

function renderGoals(goals) {
    const goalsList = document.getElementById('goalsList');
    goalsList.innerHTML = '';
    
    goals.forEach((goal, index) => {
        const goalItem = document.createElement('div');
        goalItem.className = 'goal-item' + (goal.completed ? ' completed' : '');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = goal.completed;
        checkbox.onchange = () => {
            goal.completed = checkbox.checked;
            goalItem.classList.toggle('completed');
        };
        
        const label = document.createElement('label');
        label.textContent = goal.text;
        label.onclick = () => {
            checkbox.checked = !checkbox.checked;
            goal.completed = checkbox.checked;
            goalItem.classList.toggle('completed');
        };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '✕';
        deleteBtn.onclick = () => {
            goals.splice(index, 1);
            renderGoals(goals);
        };
        
        goalItem.appendChild(checkbox);
        goalItem.appendChild(label);
        goalItem.appendChild(deleteBtn);
        goalsList.appendChild(goalItem);
    });
}

document.getElementById('addGoal').addEventListener('click', () => {
    const input = document.getElementById('newGoal');
    const goalText = input.value.trim();
    
    if (goalText) {
        const dateKey = getDateKey(currentDay);
        if (!entries[dateKey]) entries[dateKey] = {};
        if (!entries[dateKey].goals) entries[dateKey].goals = [];
        
        entries[dateKey].goals.push({
            text: goalText,
            completed: false
        });
        
        renderGoals(entries[dateKey].goals);
        input.value = '';
    }
});

document.getElementById('newGoal').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('addGoal').click();
    }
});

// Exercise Event Listener
const addPlannedBtn = document.getElementById('addPlannedExercise');
if (addPlannedBtn) {
    addPlannedBtn.addEventListener('click', () => addPlannedExerciseForm());
}

function addPlannedExerciseForm() {
    const list = document.getElementById('plannedExerciseList');
    const form = document.createElement('div');
    form.className = 'exercise-form';
    form.innerHTML = `<input type="text" class="exercise-type-input" placeholder="Exercise type"/>
<input type="number" class="exercise-duration-input" placeholder="Duration (min)" min="0"/>
<div class="intensity-buttons">
<button type="button" class="intensity-btn" data-intensity="Low">Low</button>
<button type="button" class="intensity-btn" data-intensity="Medium">Medium</button>
<button type="button" class="intensity-btn" data-intensity="High">High</button>
</div>
<textarea class="exercise-notes-input" placeholder="Notes" rows="2"></textarea>
<div class="form-actions">
<button type="button" class="save-exercise-btn">Save</button>
<button type="button" class="cancel-exercise-btn">Cancel</button>
</div>`;
    list.appendChild(form);
    const btns = form.querySelectorAll('.intensity-btn');
    btns.forEach(b => b.addEventListener('click', () => { btns.forEach(x => x.classList.remove('selected')); b.classList.add('selected'); }));
    form.querySelector('[data-intensity="Medium"]').classList.add('selected');
    form.querySelector('.save-exercise-btn').addEventListener('click', () => {
        const type = form.querySelector('.exercise-type-input').value.trim();
        const dur = form.querySelector('.exercise-duration-input').value;
        const int = form.querySelector('.intensity-btn.selected')?.dataset.intensity || 'Medium';
        const notes = form.querySelector('.exercise-notes-input').value.trim();
        if (type && dur) {
            const k = getDateKey(currentDay);
            if (!entries[k]) entries[k] = {};
            if (!entries[k].plannedExercise) entries[k].plannedExercise = [];
            entries[k].plannedExercise.push({ type, duration: dur, intensity: int, notes, completed: false });
            loadPlannedExercises(entries[k].plannedExercise);
        }
    });
    form.querySelector('.cancel-exercise-btn').addEventListener('click', () => form.remove());
}

// Skip Today's Weight
function skipTodayWeight() {
    const todayWeightInput = document.getElementById('todayWeightGoals');
    const progressDiv = document.getElementById('weeklyWeightProgress');
    
    // Clear the input
    todayWeightInput.value = '';
    
    // Hide the progress display
    progressDiv.style.display = 'none';
    
    // Show a brief confirmation
    const skipBtn = document.getElementById('skipWeightBtn');
    const originalText = skipBtn.textContent;
    skipBtn.textContent = '✓ Skipped';
    skipBtn.style.background = '#e8f0ec';
    
    setTimeout(() => {
        skipBtn.textContent = originalText;
        skipBtn.style.background = '#e8ddd5';
    }, 2000);
}

function saveGoals() {
    const dateKey = getDateKey(currentDay);
    if (!entries[dateKey]) entries[dateKey] = {};
    
    entries[dateKey].centralThought = document.getElementById('centralThought').value;
    
    // Save today's weight
    if (document.getElementById('todayWeightGoals')) {
        entries[dateKey].todayWeight = document.getElementById('todayWeightGoals').value;
    }
    saveData();
    closeModal('goalsModal');
    generateWeekView();
}


// ========== MEALS MODAL ==========
function openMealsModal(date) {
    currentDay = date;
    const dateKey = getDateKey(date);
    const dayData = entries[dateKey] || {};
    const meals = dayData.meals || {};
    
    document.getElementById('mealsModalTitle').innerHTML = icons.utensils + ' Meals - ' + formatDayName(date);
        `${icons.utensils} Meals - ${getDayName(date)}, ${formatDate(date)}`;
    
    // Load breakfast
    document.getElementById('breakfastPlan').value = meals.breakfastPlan || '';
    document.getElementById('breakfastAsPlanned').checked = meals.breakfastAsPlanned || false;
    document.getElementById('breakfastDifferent').checked = meals.breakfastDifferent || false;
    document.getElementById('breakfastActual').value = meals.breakfastActual || '';
    document.getElementById('breakfastActual').style.display = meals.breakfastDifferent ? 'block' : 'none';
    document.getElementById('breakfastTime').value = meals.breakfastTime || '';
    document.getElementById('breakfastOnTime').checked = meals.breakfastOnTime || false;
    document.getElementById('breakfastEarly').checked = meals.breakfastEarly || false;
    document.getElementById('breakfastLate').checked = meals.breakfastLate || false;
    
    // Load lunch
    document.getElementById('lunchPlan').value = meals.lunchPlan || '';
    document.getElementById('lunchAsPlanned').checked = meals.lunchAsPlanned || false;
    document.getElementById('lunchTime').value = meals.lunchTime || '';
    document.getElementById('lunchOnTime').checked = meals.lunchOnTime || false;
    document.getElementById('lunchEarly').checked = meals.lunchEarly || false;
    document.getElementById('lunchLate').checked = meals.lunchLate || false;
    document.getElementById('lunchDifferent').checked = meals.lunchDifferent || false;
    document.getElementById('lunchActual').value = meals.lunchActual || '';
    document.getElementById('lunchActual').style.display = meals.lunchDifferent ? 'block' : 'none';
    
    document.getElementById('dinnerTime').value = meals.dinnerTime || '';
    document.getElementById('dinnerOnTime').checked = meals.dinnerOnTime || false;
    document.getElementById('dinnerEarly').checked = meals.dinnerEarly || false;
    document.getElementById('dinnerLate').checked = meals.dinnerLate || false;
    // Load dinner
    document.getElementById('dinnerPlan').value = meals.dinnerPlan || '';
    document.getElementById('dinnerAsPlanned').checked = meals.dinnerAsPlanned || false;
    document.getElementById('dinnerDifferent').checked = meals.dinnerDifferent || false;
    document.getElementById('dinnerActual').value = meals.dinnerActual || '';
    document.getElementById('dinnerActual').style.display = meals.dinnerDifferent ? 'block' : 'none';
    
    // Load snacks
    renderSnacks();
    
    // Load overeating
    document.getElementById('didOvereat').checked = meals.didOvereat || false;
    document.getElementById('overeatSection').style.display = meals.didOvereat ? 'block' : 'none';
    renderOvereatEntries(meals.overeatEntries || []);
    
    // Load binge
    document.getElementById('didBinge').checked = meals.didBinge || false;
    document.getElementById('bingeSection').style.display = meals.didBinge ? 'block' : 'none';
    renderBingeEntries(meals.bingeEntries || []);
    
    document.getElementById('mealsModal').classList.add('show');
}

// Toggle actual food textarea visibility
['breakfast', 'lunch', 'dinner'].forEach(meal => {
    document.getElementById(`${meal}Different`).addEventListener('change', function() {
        const textarea = document.getElementById(`${meal}Actual`);
        textarea.style.display = this.checked ? 'block' : 'none';
        
        if (this.checked) {
            document.getElementById(`${meal}AsPlanned`).checked = false;
        }
    });
    
    document.getElementById(`${meal}AsPlanned`).addEventListener('change', function() {
        if (this.checked) {
            document.getElementById(`${meal}Different`).checked = false;
            document.getElementById(`${meal}Actual`).style.display = 'none';
        }
    });
});

// Toggle overeating section
document.getElementById('didOvereat').addEventListener('change', function() {
    document.getElementById('overeatSection').style.display = this.checked ? 'block' : 'none';
});

// Toggle binge section
document.getElementById('didBinge').addEventListener('change', function() {
    document.getElementById('bingeSection').style.display = this.checked ? 'block' : 'none';
});

function renderSnacks() {
    const dateKey = getDateKey(currentDay);
    const entry = entries[dateKey] || {};
    const snacks = entry.meals?.snacks || [];
    
    const container = document.getElementById('snacksList');
    container.innerHTML = '';
    
    snacks.forEach((snack, index) => {
        renderSingleSnack(index);
    });
}

function renderSingleSnack(index) {
    const dateKey = getDateKey(currentDay);
    const entry = entries[dateKey] || {};
    const snacks = entry.meals?.snacks || [];
    const snack = snacks[index];
    
    if (!snack) return;
    
    const container = document.getElementById('snacksList');
    
    const snackDiv = document.createElement('div');
    snackDiv.style.marginBottom = '20px';
    snackDiv.style.padding = '15px';
    snackDiv.style.background = '#f9f9f9';
    snackDiv.style.borderRadius = '8px';
    
    // Header with snack number and delete button
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '15px';
    header.innerHTML = `<strong style="font-size: 16px;">Snack ${index + 1}</strong>`;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.style.padding = '5px 15px';
    deleteBtn.style.background = '#f44336';
    deleteBtn.style.color = 'white';
    deleteBtn.style.border = 'none';
    deleteBtn.style.borderRadius = '4px';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.fontSize = '14px';
    deleteBtn.onclick = () => {
        if (!entries[dateKey].meals.snacks) return;
        entries[dateKey].meals.snacks.splice(index, 1);
        renderSnacks();
    };
    header.appendChild(deleteBtn);
    snackDiv.appendChild(header);
    
    // Plan input
    const planInput = document.createElement('input');
    planInput.type = 'text';
    planInput.placeholder = "What's the plan?";
    planInput.value = snack.plan || '';
    planInput.style.width = '100%';
    planInput.style.padding = '10px';
    planInput.style.marginBottom = '10px';
    planInput.style.border = '1px solid #ddd';
    planInput.style.borderRadius = '4px';
    planInput.style.fontSize = '14px';
    planInput.oninput = (e) => {
        if (!entries[dateKey].meals.snacks[index]) return;
        entries[dateKey].meals.snacks[index].plan = e.target.value;
    };
    snackDiv.appendChild(planInput);
    
    // Time input
    const timeInput = document.createElement('input');
    timeInput.type = 'time';
    timeInput.value = snack.time || '';
    timeInput.style.width = '100%';
    timeInput.style.padding = '8px';
    timeInput.style.marginBottom = '10px';
    timeInput.style.border = '1px solid #ddd';
    timeInput.style.borderRadius = '4px';
    timeInput.oninput = (e) => {
        if (!entries[dateKey].meals.snacks[index]) return;
        entries[dateKey].meals.snacks[index].time = e.target.value;
    };
    snackDiv.appendChild(timeInput);
    
    // Checkboxes for ate as planned / different
    const optionsDiv = document.createElement('div');
    optionsDiv.style.marginBottom = '10px';
    
    const asPlannedLabel = document.createElement('label');
    asPlannedLabel.style.marginRight = '15px';
    const asPlannedCheck = document.createElement('input');
    asPlannedCheck.type = 'checkbox';
    asPlannedCheck.checked = snack.asPlanned || false;
    asPlannedCheck.onchange = (e) => {
        if (!entries[dateKey].meals.snacks[index]) return;
        entries[dateKey].meals.snacks[index].asPlanned = e.target.checked;
        if (e.target.checked) {
            entries[dateKey].meals.snacks[index].different = false;
            differentCheck.checked = false;
            actualInput.style.display = 'none';
        }
    };
    asPlannedLabel.appendChild(asPlannedCheck);
    asPlannedLabel.appendChild(document.createTextNode(' Ate as planned'));
    
    const differentLabel = document.createElement('label');
    const differentCheck = document.createElement('input');
    differentCheck.type = 'checkbox';
    differentCheck.checked = snack.different || false;
    differentCheck.onchange = (e) => {
        if (!entries[dateKey].meals.snacks[index]) return;
        entries[dateKey].meals.snacks[index].different = e.target.checked;
        if (e.target.checked) {
            entries[dateKey].meals.snacks[index].asPlanned = false;
            asPlannedCheck.checked = false;
            actualInput.style.display = 'block';
        } else {
            actualInput.style.display = 'none';
        }
    };
    differentLabel.appendChild(differentCheck);
    differentLabel.appendChild(document.createTextNode(' Ate something different'));
    
    optionsDiv.appendChild(asPlannedLabel);
    optionsDiv.appendChild(differentLabel);
    snackDiv.appendChild(optionsDiv);
    
    // Timing checkboxes (on time / early / late)
    const timingDiv = document.createElement('div');
    timingDiv.style.marginTop = '5px';
    timingDiv.style.marginBottom = '10px';
    
    const onTimeLabel = document.createElement('label');
    onTimeLabel.style.marginRight = '15px';
    const onTimeCheck = document.createElement('input');
    onTimeCheck.type = 'checkbox';
    onTimeCheck.checked = snack.onTime || false;
    onTimeCheck.onchange = (e) => {
        if (!entries[dateKey].meals.snacks[index]) return;
        entries[dateKey].meals.snacks[index].onTime = e.target.checked;
        if (e.target.checked) {
            entries[dateKey].meals.snacks[index].early = false;
            entries[dateKey].meals.snacks[index].late = false;
            earlyCheck.checked = false;
            lateCheck.checked = false;
        }
    };
    onTimeLabel.appendChild(onTimeCheck);
    onTimeLabel.appendChild(document.createTextNode(' Ate on time'));
    
    const earlyLabel = document.createElement('label');
    earlyLabel.style.marginRight = '15px';
    const earlyCheck = document.createElement('input');
    earlyCheck.type = 'checkbox';
    earlyCheck.checked = snack.early || false;
    earlyCheck.onchange = (e) => {
        if (!entries[dateKey].meals.snacks[index]) return;
        entries[dateKey].meals.snacks[index].early = e.target.checked;
        if (e.target.checked) {
            entries[dateKey].meals.snacks[index].onTime = false;
            entries[dateKey].meals.snacks[index].late = false;
            onTimeCheck.checked = false;
            lateCheck.checked = false;
        }
    };
    earlyLabel.appendChild(earlyCheck);
    earlyLabel.appendChild(document.createTextNode(' Ate early'));
    
    const lateLabel = document.createElement('label');
    const lateCheck = document.createElement('input');
    lateCheck.type = 'checkbox';
    lateCheck.checked = snack.late || false;
    lateCheck.onchange = (e) => {
        if (!entries[dateKey].meals.snacks[index]) return;
        entries[dateKey].meals.snacks[index].late = e.target.checked;
        if (e.target.checked) {
            entries[dateKey].meals.snacks[index].onTime = false;
            entries[dateKey].meals.snacks[index].early = false;
            onTimeCheck.checked = false;
            earlyCheck.checked = false;
        }
    };
    lateLabel.appendChild(lateCheck);
    lateLabel.appendChild(document.createTextNode(' Ate late'));
    
    timingDiv.appendChild(onTimeLabel);
    timingDiv.appendChild(earlyLabel);
    timingDiv.appendChild(lateLabel);
    snackDiv.appendChild(timingDiv);
    
    // Actual input (hidden by default)
    const actualInput = document.createElement('textarea');
    actualInput.placeholder = 'What did you actually eat?';
    actualInput.value = snack.actual || '';
    actualInput.rows = 2;
    actualInput.style.width = '100%';
    actualInput.style.padding = '10px';
    actualInput.style.border = '1px solid #ddd';
    actualInput.style.borderRadius = '4px';
    actualInput.style.fontSize = '14px';
    actualInput.style.display = snack.different ? 'block' : 'none';
    actualInput.oninput = (e) => {
        if (!entries[dateKey].meals.snacks[index]) return;
        entries[dateKey].meals.snacks[index].actual = e.target.value;
    };
    snackDiv.appendChild(actualInput);
    
    container.appendChild(snackDiv);
}

document.getElementById('addSnack').addEventListener('click', () => {
    const dateKey = getDateKey(currentDay);
    if (!entries[dateKey]) entries[dateKey] = {};
    if (!entries[dateKey].meals) entries[dateKey].meals = {};
    if (!entries[dateKey].meals.snacks) entries[dateKey].meals.snacks = [];
    
    const newIndex = entries[dateKey].meals.snacks.length;
    entries[dateKey].meals.snacks.push({ plan: '', asPlanned: false, different: false, actual: '' });
    
    // Render just the new snack instead of all snacks
    renderSingleSnack(newIndex);
});

// Render overeating entries
function renderOvereatEntries(entries) {
    const overeatList = document.getElementById('overeatList');
    overeatList.innerHTML = '';
    
    entries.forEach((entry, index) => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'overeat-entry';
        
        entryDiv.innerHTML = `
            <div class="entry-header">
                <h4>Entry #${index + 1}</h4>
                <button class="delete-btn" onclick="deleteOvereatEntry(${index})">Delete</button>
            </div>
            <div class="entry-field">
                <label>What did you eat?</label>
                <textarea onchange="updateOvereatEntry(${index}, 'what', this.value)">${entry.what || ''}</textarea>
            </div>
            <div class="entry-field">
                <label>How do you feel about it?</label>
                <textarea onchange="updateOvereatEntry(${index}, 'feeling', this.value)">${entry.feeling || ''}</textarea>
            </div>
        `;
        
        overeatList.appendChild(entryDiv);
    });
}

// Render binge entries
function renderBingeEntries(entries) {
    const bingeList = document.getElementById('bingeList');
    bingeList.innerHTML = '';
    
    entries.forEach((entry, index) => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'binge-entry';
        
        entryDiv.innerHTML = `
            <div class="entry-header">
                <h4>Entry #${index + 1}</h4>
                <button class="delete-btn" onclick="deleteBingeEntry(${index})">Delete</button>
            </div>
            <div class="entry-field">
                <label>What did you eat?</label>
                <textarea onchange="updateBingeEntry(${index}, 'what', this.value)">${entry.what || ''}</textarea>
            </div>
            <div class="entry-field">
                <label>How do you feel about it?</label>
                <textarea onchange="updateBingeEntry(${index}, 'feeling', this.value)">${entry.feeling || ''}</textarea>
            </div>
        `;
        
        bingeList.appendChild(entryDiv);
    });
}

// Add overeating entry
document.getElementById('addOvereat').addEventListener('click', () => {
    const dateKey = getDateKey(currentDay);
    if (!entries[dateKey]) entries[dateKey] = {};
    if (!entries[dateKey].meals) entries[dateKey].meals = {};
    if (!entries[dateKey].meals.overeatEntries) entries[dateKey].meals.overeatEntries = [];
    
    entries[dateKey].meals.overeatEntries.push({
        what: '',
        feeling: ''
    });
    
    renderOvereatEntries(entries[dateKey].meals.overeatEntries);
});

// Add binge entry
document.getElementById('addBinge').addEventListener('click', () => {
    const dateKey = getDateKey(currentDay);
    if (!entries[dateKey]) entries[dateKey] = {};
    if (!entries[dateKey].meals) entries[dateKey].meals = {};
    if (!entries[dateKey].meals.bingeEntries) entries[dateKey].meals.bingeEntries = [];
    
    entries[dateKey].meals.bingeEntries.push({
        what: '',
        feeling: ''
    });
    
    renderBingeEntries(entries[dateKey].meals.bingeEntries);
});

// Update functions
function updateOvereatEntry(index, field, value) {
    const dateKey = getDateKey(currentDay);
    if (entries[dateKey] && entries[dateKey].meals && entries[dateKey].meals.overeatEntries) {
        entries[dateKey].meals.overeatEntries[index][field] = value;
    }
}

function updateBingeEntry(index, field, value) {
    const dateKey = getDateKey(currentDay);
    if (entries[dateKey] && entries[dateKey].meals && entries[dateKey].meals.bingeEntries) {
        entries[dateKey].meals.bingeEntries[index][field] = value;
    }
}

// Delete functions
function deleteOvereatEntry(index) {
    const dateKey = getDateKey(currentDay);
    if (entries[dateKey] && entries[dateKey].meals && entries[dateKey].meals.overeatEntries) {
        entries[dateKey].meals.overeatEntries.splice(index, 1);
        renderOvereatEntries(entries[dateKey].meals.overeatEntries);
    }
}

function deleteBingeEntry(index) {
    const dateKey = getDateKey(currentDay);
    if (entries[dateKey] && entries[dateKey].meals && entries[dateKey].meals.bingeEntries) {
        entries[dateKey].meals.bingeEntries.splice(index, 1);
        renderBingeEntries(entries[dateKey].meals.bingeEntries);
    }
}

function saveMeals() {
    const dateKey = getDateKey(currentDay);
    if (!entries[dateKey]) entries[dateKey] = {};
    
    const snacks = entries[dateKey].meals?.snacks || [];
    const overeatEntries = entries[dateKey].meals?.overeatEntries || [];
    const bingeEntries = entries[dateKey].meals?.bingeEntries || [];
    
    entries[dateKey].meals = {
        breakfastPlan: document.getElementById('breakfastPlan').value,
        breakfastAsPlanned: document.getElementById('breakfastAsPlanned').checked,
        breakfastDifferent: document.getElementById('breakfastDifferent').checked,
        breakfastActual: document.getElementById('breakfastActual').value,
        
        breakfastTime: document.getElementById('breakfastTime').value,
        breakfastOnTime: document.getElementById('breakfastOnTime').checked,
        breakfastEarly: document.getElementById('breakfastEarly').checked,
        breakfastLate: document.getElementById('breakfastLate').checked,
        lunchPlan: document.getElementById('lunchPlan').value,
        lunchAsPlanned: document.getElementById('lunchAsPlanned').checked,
        lunchDifferent: document.getElementById('lunchDifferent').checked,
        lunchActual: document.getElementById('lunchActual').value,
        lunchTime: document.getElementById('lunchTime').value,
        lunchOnTime: document.getElementById('lunchOnTime').checked,
        lunchEarly: document.getElementById('lunchEarly').checked,
        lunchLate: document.getElementById('lunchLate').checked,
        
        dinnerPlan: document.getElementById('dinnerPlan').value,
        dinnerAsPlanned: document.getElementById('dinnerAsPlanned').checked,
        dinnerDifferent: document.getElementById('dinnerDifferent').checked,
        dinnerTime: document.getElementById('dinnerTime').value,
        dinnerOnTime: document.getElementById('dinnerOnTime').checked,
        dinnerEarly: document.getElementById('dinnerEarly').checked,
        dinnerLate: document.getElementById('dinnerLate').checked,
        dinnerActual: document.getElementById('dinnerActual').value,
        
        snacks: snacks.filter(s => s.plan || s.actual),
        
        didOvereat: document.getElementById('didOvereat').checked,
        overeatEntries: overeatEntries.filter(e => e.what.trim() !== '' || e.feeling.trim() !== ''),
        
        didBinge: document.getElementById('didBinge').checked,
        bingeEntries: bingeEntries.filter(e => e.what.trim() !== '' || e.feeling.trim() !== '')
    };
    
    saveData();
    closeModal('mealsModal');
    generateWeekView();
}


// ========== URGES MODAL ==========
function openExerciseModal(date) {
    currentDay = date;
    const k = getDateKey(date);
    const d = entries[k] || {};
    document.getElementById('exerciseModalTitle').innerHTML = `${icons.activity} Exercise - ${formatDayName(date)}`;
    loadPlannedExercises(d.plannedExercise || []);
    document.getElementById('exerciseModal').classList.add('show');
}

function loadPlannedExercises(exs) {
    const list = document.getElementById('plannedExerciseList');
    list.innerHTML = '';
    exs.forEach((e, i) => {
        const div = document.createElement('div');
        div.className = 'exercise-item' + (e.completed ? ' completed' : '');
        div.innerHTML = `
            <div class="exercise-header">
                <strong>${e.type || 'Exercise'}</strong>
                <button onclick="removePlannedExercise(${i})" class="remove-btn">×</button>
            </div>
            <div class="exercise-details">
                <span>Duration: ${e.duration || 0} min</span>
                <span>Intensity: ${e.intensity || 'Medium'}</span>
            </div>
            ${e.notes ? `<div class="exercise-notes">${e.notes}</div>` : ''}
            <div class="exercise-complete-section">
                <label class="exercise-complete-label">
                    <input type="checkbox" onchange="toggleExerciseComplete(${i})" ${e.completed ? 'checked' : ''}/>
                    <span>Mark as completed</span>
                </label>
            </div>
        `;
        list.appendChild(div);
    });
}

function saveExercise() {
    const k = getDateKey(currentDay);
    if (!entries[k]) entries[k] = {};
    entries[k].plannedExercise = getCurrentPlannedExercises();
    saveData();
    closeModal('exerciseModal');
    generateWeekView();
}

function getCurrentPlannedExercises() { return entries[getDateKey(currentDay)]?.plannedExercise || []; }

function removePlannedExercise(i) {
    const k = getDateKey(currentDay);
    if (entries[k]?.plannedExercise) {
        entries[k].plannedExercise.splice(i, 1);
        loadPlannedExercises(entries[k].plannedExercise);
    }
}

function toggleExerciseComplete(i) {
    const k = getDateKey(currentDay);
    if (entries[k]?.plannedExercise?.[i]) {
        entries[k].plannedExercise[i].completed = !entries[k].plannedExercise[i].completed;
        loadPlannedExercises(entries[k].plannedExercise);
    }
}

function openUrgesModal(date) {
    currentDay = date;
    const dateKey = getDateKey(date);
    const dayData = entries[dateKey] || {};
    
    document.getElementById('urgesModalTitle').innerHTML = icons.brain + ' Urges - ' + formatDayName(date);
        `${icons.sparkles} Urges - ${getDayName(date)}, ${formatDate(date)}`;
    
    renderUrges(dayData.urges || []);
    document.getElementById('urgesModal').classList.add('show');
}

function renderUrges(urges) {
    const urgesList = document.getElementById('urgesList');
    urgesList.innerHTML = '';
    
    urges.forEach((urge, index) => {
        const urgeEntry = document.createElement('div');
        urgeEntry.className = 'urge-entry';
        
        // Build distraction activities checkboxes
        const activities = [
            'Go for a walk',
            'Call a friend',
            'Read a book',
            'Listen to music',
            'Dot art',
            'Crochet',
            'Embroidery',
            'Nonprofit work',
            'Monthly shopping',
            'Journal',
            'Meditate',
            'Take a shower/bath',
            'Watch a show/movie',
            'Play a game',
            'Clean/organize',
            'Exercise/yoga'
        ];
        
        const selectedActivities = urge.distractionActivities || [];
        const otherActivity = urge.otherActivity || '';
        
        let activitiesHTML = '<div class="activities-grid">';
        activities.forEach(activity => {
            const checked = selectedActivities.includes(activity) ? 'checked' : '';
            activitiesHTML += `
                <label class="activity-checkbox">
                    <input type="checkbox" value="${activity}" ${checked}
                           onchange="updateUrgeActivity(${index}, '${activity}', this.checked)">
                    ${activity}
                </label>
            `;
        });
        activitiesHTML += '</div>';
        
        urgeEntry.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h4>Urge #${index + 1}</h4>
                <button class="delete-btn" onclick="deleteUrge(${index})">Delete</button>
            </div>
            
            <div class="form-group">
                <label>Time</label>
                <input type="time" value="${urge.time || ''}" onchange="updateUrge(${index}, 'time', this.value)">
            </div>
            
            <div class="form-group">
                <label>Hunger Scale (1 = very hungry, 10 = very full)</label>
                <input type="range" min="1" max="10" value="${urge.hungerScale || 5}" 
                       class="hunger-slider" onchange="updateUrge(${index}, 'hungerScale', this.value); this.nextElementSibling.textContent = this.value">
                <div class="slider-labels">
                    <span>Very Hungry (1)</span>
                    <span style="font-weight: bold; color: #667eea;">${urge.hungerScale || 5}</span>
                    <span>Very Full (10)</span>
                </div>
            </div>
            
            <div class="form-group">
                <label>Am I really hungry?</label>
                <div class="radio-group">
                    <label>
                        <input type="radio" name="hungry${index}" value="yes" ${urge.reallyHungry === 'yes' ? 'checked' : ''}
                               onchange="updateUrge(${index}, 'reallyHungry', 'yes')"> Yes
                    </label>
                    <label>
                        <input type="radio" name="hungry${index}" value="no" ${urge.reallyHungry === 'no' ? 'checked' : ''}
                               onchange="updateUrge(${index}, 'reallyHungry', 'no')"> No
                    </label>
                </div>
            </div>
            
            <div class="form-group">
                <label>If not hungry - what am I feeling? (What is the food for?)</label>
                <textarea onchange="updateUrge(${index}, 'feeling', this.value)">${urge.feeling || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label>Describe the feeling (color, location, hot/cold, fast/slow, etc)</label>
                <textarea onchange="updateUrge(${index}, 'feelingDescription', this.value)">${urge.feelingDescription || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label>
                    Distraction activities I could try 
                    <a href="https://res.cloudinary.com/insideout-institute/image/upload/v1662003519/fyzjnvjfruvlz5ivm2va.pdf" 
                       target="_blank" class="distraction-link">📄 View full list</a>
                </label>
                ${activitiesHTML}
                
                <div style="margin-top: 12px;">
                    <label class="activity-checkbox">
                        <input type="checkbox" id="otherCheck${index}" 
                               ${otherActivity ? 'checked' : ''}
                               onchange="toggleOtherActivity(${index}, this.checked)">
                        Other:
                    </label>
                    <input type="text" id="otherActivity${index}" 
                           value="${otherActivity}" 
                           placeholder="Describe other activity..."
                           style="width: 100%; margin-top: 8px; padding: 8px; border: 2px solid #e9ecef; border-radius: 6px; display: ${otherActivity ? 'block' : 'none'};"
                           onchange="updateUrge(${index}, 'otherActivity', this.value)">
                </div>
            </div>
            
            <div class="form-group">
                <label>
                    <input type="checkbox" ${urge.setTimer ? 'checked' : ''}
                           onchange="updateUrge(${index}, 'setTimer', this.checked)">
                    Set 30 min timer for alternative activity
                </label>
            </div>
            
            <div class="form-group">
                <label>Did I act on urge?</label>
                <div class="radio-group">
                    <label>
                        <input type="radio" name="acted${index}" value="yes" ${urge.actedOnUrge === 'yes' ? 'checked' : ''}
                               onchange="updateUrge(${index}, 'actedOnUrge', 'yes'); toggleUrgeHow(${index}, true)"> Yes
                    </label>
                    <label>
                        <input type="radio" name="acted${index}" value="no" ${urge.actedOnUrge === 'no' ? 'checked' : ''}
                               onchange="updateUrge(${index}, 'actedOnUrge', 'no'); toggleUrgeHow(${index}, false)"> No
                    </label>
                </div>
            </div>
            
            <div class="form-group" id="urgeHow${index}" style="display: ${urge.actedOnUrge === 'yes' ? 'block' : 'none'}">
                <label>How?</label>
                <textarea onchange="updateUrge(${index}, 'how', this.value)">${urge.how || ''}</textarea>
            </div>
        `;
        
        urgesList.appendChild(urgeEntry);
    });
}

function updateUrge(index, field, value) {
    const dateKey = getDateKey(currentDay);
    if (!entries[dateKey]) entries[dateKey] = {};
    if (!entries[dateKey].urges) entries[dateKey].urges = [];
    
    entries[dateKey].urges[index][field] = value;
}

function updateUrgeActivity(index, activity, checked) {
    const dateKey = getDateKey(currentDay);
    if (!entries[dateKey]) entries[dateKey] = {};
    if (!entries[dateKey].urges) entries[dateKey].urges = [];
    
    if (!entries[dateKey].urges[index].distractionActivities) {
        entries[dateKey].urges[index].distractionActivities = [];
    }
    
    const activities = entries[dateKey].urges[index].distractionActivities;
    
    if (checked && !activities.includes(activity)) {
        activities.push(activity);
    } else if (!checked) {
        const idx = activities.indexOf(activity);
        if (idx > -1) {
            activities.splice(idx, 1);
        }
    }
}

function toggleOtherActivity(index, show) {
    const input = document.getElementById(`otherActivity${index}`);
    input.style.display = show ? 'block' : 'none';
    if (!show) {
        input.value = '';
        updateUrge(index, 'otherActivity', '');
    }
}

function toggleUrgeHow(index, show) {
    document.getElementById(`urgeHow${index}`).style.display = show ? 'block' : 'none';
}

function deleteUrge(index) {
    const dateKey = getDateKey(currentDay);
    if (entries[dateKey] && entries[dateKey].urges) {
        entries[dateKey].urges.splice(index, 1);
        renderUrges(entries[dateKey].urges);
    }
}

document.getElementById('addUrge').addEventListener('click', () => {
    const dateKey = getDateKey(currentDay);
    if (!entries[dateKey]) entries[dateKey] = {};
    if (!entries[dateKey].urges) entries[dateKey].urges = [];
    
    const now = new Date();
    const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0');
    
    entries[dateKey].urges.push({
        time: timeString,
        hungerScale: 5,
        reallyHungry: '',
        feeling: '',
        feelingDescription: '',
        distractionActivities: [],
        otherActivity: '',
        setTimer: false,
        actedOnUrge: '',
        how: ''
    });
    
    renderUrges(entries[dateKey].urges);
});

function saveUrges() {
    saveData();
    closeModal('urgesModal');
    generateWeekView();
}


// ========== REFLECTION MODAL ==========
function openReflectionModal(date) {
    currentDay = date;
    const dateKey = getDateKey(date);
    const dayData = entries[dateKey] || {};
    const reflection = dayData.reflection || {};
    
    document.getElementById('reflectionModalTitle').innerHTML = icons.sparkles + ' Daily Reflection - ' + formatDayName(date);
        `${icons.brain} Daily Reflection - ${getDayName(date)}, ${formatDate(date)}`;
    
    document.getElementById('dailyReflection').value = reflection.daily || '';
    document.getElementById('proudExplanation').value = reflection.proudExplanation || '';
    document.getElementById('learnTomorrow').value = reflection.learn || '';
    
    // Set radio buttons
    if (reflection.proud === 'yes') {
        document.getElementById('proudYes').checked = true;
    } else if (reflection.proud === 'no') {
        document.getElementById('proudNo').checked = true;
    } else if (reflection.proud === 'somewhat') {
        document.getElementById('proudSomewhat').checked = true;
    } else {
        document.querySelectorAll('input[name="proudDecisions"]').forEach(radio => {
            radio.checked = false;
        });
    }
    
    document.getElementById('reflectionModal').classList.add('show');
}

function saveReflection() {
    const dateKey = getDateKey(currentDay);
    if (!entries[dateKey]) entries[dateKey] = {};
    
    let proudValue = '';
    const proudRadios = document.querySelectorAll('input[name="proudDecisions"]');
    proudRadios.forEach(radio => {
        if (radio.checked) {
            proudValue = radio.value;
        }
    });
    
    entries[dateKey].reflection = {
        daily: document.getElementById('dailyReflection').value,
        proud: proudValue,
        proudExplanation: document.getElementById('proudExplanation').value,
        learn: document.getElementById('learnTomorrow').value
    };
    
    saveData();
    closeModal('reflectionModal');
    generateWeekView();
}

// Close modals when clicking outside
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.id);
        }
    });
});


// ========== EXPORT/IMPORT DATA ==========

// Export data as JSON file
document.getElementById('exportBtn').addEventListener('click', () => {
    if (!window.currentUser) {
        alert('Please log in first');
        return;
    }
    
    // Create export object with metadata
    const exportData = {
        exportDate: new Date().toISOString(),
        userEmail: window.currentUser.email,
        entries: entries,
        version: '1.0'
    };
    
    // Convert to JSON
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create download link
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    
    // Filename with date
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `health-tracker-export-${dateStr}.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('✅ Data exported successfully!');
});

// Import data from JSON file
document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!window.currentUser) {
        alert('Please log in first');
        return;
    }
    
    try {
        const text = await file.text();
        const importData = JSON.parse(text);
        
        // Validate the data
        if (!importData.entries) {
            alert('Invalid data file');
            return;
        }
        
        // Confirm before importing
        const confirmed = confirm(
            `Import data from ${importData.exportDate || 'unknown date'}?\n\n` +
            `This will MERGE with your existing data.\n` +
            `Existing entries for the same dates will be overwritten.\n\n` +
            `Continue?`
        );
        
        if (!confirmed) return;
        
        // Merge imported data with existing data
        Object.keys(importData.entries).forEach(dateKey => {
            entries[dateKey] = importData.entries[dateKey];
        });
        
        // Save to Firebase
        await saveData();
        
        // Refresh view
        generateWeekView();
        
        alert('✅ Data imported successfully!');
        
    } catch (error) {
        console.error('Import error:', error);
        alert('❌ Error importing data. Please check the file format.');
    }
    
    // Reset file input
    e.target.value = '';
});

// Initialize
loadData();
generateWeekView();

// Google Sheets Export
document.getElementById('exportSheetsBtn').addEventListener('click', exportToSheets);

function exportToSheets() {
  if (!entries || Object.keys(entries).length === 0) {
    alert('No data to export yet!');
    return;
  }

  // Create CSV content for each tab
  const sheets = {
    goals: createGoalsCSV(),
    meals: createMealsCSV(),
    urges: createUrgesCSV(),
    reflections: createReflectionsCSV()
  };

  // Create a combined CSV with instructions
  let csvContent = 'HEALTH TRACKER DATA EXPORT\n';
  csvContent += 'Instructions: Copy each section below into separate tabs in Google Sheets\n';
  csvContent += '='.repeat(80) + '\n\n';

  csvContent += 'TAB 1: GOALS & INTENTIONS\n';
  csvContent += '='.repeat(80) + '\n';
  csvContent += sheets.goals + '\n\n\n';

  csvContent += 'TAB 2: MEALS\n';
  csvContent += '='.repeat(80) + '\n';
  csvContent += sheets.meals + '\n\n\n';

  csvContent += 'TAB 3: URGES\n';
  csvContent += '='.repeat(80) + '\n';
  csvContent += sheets.urges + '\n\n\n';

  csvContent += 'TAB 4: REFLECTIONS\n';
  csvContent += '='.repeat(80) + '\n';
  csvContent += sheets.reflections;

  // Download as CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `health-tracker-sheets-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);

  alert('📊 Export complete!\n\nTo import to Google Sheets:\n1. Open Google Sheets\n2. Create a new spreadsheet\n3. File → Import → Upload\n4. Select the downloaded CSV file\n5. Follow the instructions in the file to organize into tabs');
}

function createGoalsCSV() {
  let csv = 'Date,Day,Goals,Central Thought,Goals Completed\n';
  
  const sortedDates = Object.keys(entries).sort();
  
  for (const dateKey of sortedDates) {
    const entry = entries[dateKey];
    if (!entry.goals) continue;

    const date = new Date(dateKey);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = date.toLocaleDateString('en-US');
    
    const goals = entry.goals.goals || [];
    const goalsText = goals.map(g => `${g.completed ? '✓' : '○'} ${g.text}`).join('; ');
    const centralThought = (entry.goals.centralThought || '').replace(/"/g, '""');
    const completedCount = goals.filter(g => g.completed).length;
    const totalCount = goals.length;
    const completionStatus = totalCount > 0 ? `${completedCount}/${totalCount}` : 'No goals';

    csv += `"${formattedDate}","${dayName}","${goalsText}","${centralThought}","${completionStatus}"\n`;
  }
  
  return csv;
}

function createMealsCSV() {
  let csv = 'Date,Day,Meal,Planned,Actual,Snacks,Overeating Episodes,Binge Episodes\n';
  
  const sortedDates = Object.keys(entries).sort();
  
  for (const dateKey of sortedDates) {
    const entry = entries[dateKey];
    if (!entry.meals) continue;

    const date = new Date(dateKey);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = date.toLocaleDateString('en-US');
    
    const meals = entry.meals;
    
    // Breakfast
    if (meals.breakfast?.plan || meals.breakfast?.actual) {
      csv += `"${formattedDate}","${dayName}","Breakfast","${meals.breakfast.plan || ''}","${meals.breakfast.actual || ''}","","",""\n`;
    }
    
    // Lunch
    if (meals.lunch?.plan || meals.lunch?.actual) {
      csv += `"${formattedDate}","${dayName}","Lunch","${meals.lunch.plan || ''}","${meals.lunch.actual || ''}","","",""\n`;
    }
    
    // Dinner
    if (meals.dinner?.plan || meals.dinner?.actual) {
      csv += `"${formattedDate}","${dayName}","Dinner","${meals.dinner.plan || ''}","${meals.dinner.actual || ''}","","",""\n`;
    }
    
    // Snacks
    if (meals.snacks && meals.snacks.length > 0) {
      const snacksText = meals.snacks.join('; ');
      csv += `"${formattedDate}","${dayName}","Snacks","","","${snacksText}","",""\n`;
    }
    
    // Overeating
    if (meals.overeating && meals.overeating.length > 0) {
      const overeatText = meals.overeating.map(o => `${o.time}: ${o.description}`).join('; ');
      csv += `"${formattedDate}","${dayName}","Overeating","","","","${overeatText}",""\n`;
    }
    
    // Binge
    if (meals.binge && meals.binge.length > 0) {
      const bingeText = meals.binge.map(b => `${b.time}: ${b.description}`).join('; ');
      csv += `"${formattedDate}","${dayName}","Binge","","","","","${bingeText}"\n`;
    }
  }
  
  return csv;
}

function createUrgesCSV() {
  let csv = 'Date,Day,Time,Hunger Scale,Really Hungry?,Feeling,Feeling Description,Activities Tried,Set Timer?,Acted On?,How Acted\n';
  
  const sortedDates = Object.keys(entries).sort();
  
  for (const dateKey of sortedDates) {
    const entry = entries[dateKey];
    if (!entry.urges || entry.urges.length === 0) continue;

    const date = new Date(dateKey);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = date.toLocaleDateString('en-US');
    
    for (const urge of entry.urges) {
      const activities = [];
      if (urge.activities) {
        for (const [key, value] of Object.entries(urge.activities)) {
          if (value && key !== 'other') activities.push(key.replace(/([A-Z])/g, ' $1').trim());
        }
        if (urge.activities.other && urge.otherActivity) {
          activities.push(urge.otherActivity);
        }
      }
      const activitiesText = activities.join('; ');
      
      csv += `"${formattedDate}","${dayName}","${urge.time || ''}","${urge.hungerScale || ''}","${urge.reallyHungry || ''}","${urge.feeling || ''}","${(urge.feelingDescription || '').replace(/"/g, '""')}","${activitiesText}","${urge.setTimer ? 'Yes' : 'No'}","${urge.actedOn || ''}","${(urge.howActed || '').replace(/"/g, '""')}"\n`;
    }
  }
  
  return csv;
}

function createReflectionsCSV() {
  let csv = 'Date,Day,Proud of Decisions?,Proud Explanation,What Can You Learn for Tomorrow?,Daily Reflection\n';
  
  const sortedDates = Object.keys(entries).sort();
  
  for (const dateKey of sortedDates) {
    const entry = entries[dateKey];
    if (!entry.reflection) continue;

    const date = new Date(dateKey);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = date.toLocaleDateString('en-US');
    
    const ref = entry.reflection;
    csv += `"${formattedDate}","${dayName}","${ref.proud || ''}","${(ref.proudExplanation || '').replace(/"/g, '""')}","${(ref.learnTomorrow || '').replace(/"/g, '""')}","${(ref.dailyReflection || '').replace(/"/g, '""')}"\n`;
  }
  
  return csv;
}

// PDF Report Generation
document.getElementById('exportPdfBtn').addEventListener('click', generateReport);

function generateReport() {
  if (!entries || Object.keys(entries).length === 0) {
    alert('No data to generate report yet!');
    return;
  }

  const sortedDates = Object.keys(entries).sort();
  const startDate = new Date(sortedDates[0]).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const endDate = new Date(sortedDates[sortedDates.length - 1]).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  let html = `
    <div class="report-header">
      <h1>🌟 Health Tracker Report</h1>
      <div class="date-range">${startDate} - ${endDate}</div>
    </div>
  `;

  // Summary Section
  html += generateSummary(sortedDates);

  // Goals Section
  html += generateGoalsSection(sortedDates);

  // Meals Section
  html += generateMealsSection(sortedDates);

  // Urges Section
  html += generateUrgesSection(sortedDates);

  // Reflections Section
  html += generateReflectionsSection(sortedDates);

  document.getElementById('reportContent').innerHTML = html;
  document.getElementById('reportContainer').classList.add('active');
}

function closeReport() {
  document.getElementById('reportContainer').classList.remove('active');
}

function generateSummary(dates) {
  let totalGoals = 0;
  let completedGoals = 0;
  let totalUrges = 0;
  let urgesActedOn = 0;
  let daysWithReflection = 0;

  for (const dateKey of dates) {
    const entry = entries[dateKey];
    
    if (entry.goals?.goals) {
      totalGoals += entry.goals.goals.length;
      completedGoals += entry.goals.goals.filter(g => g.completed).length;
    }
    
    if (entry.urges) {
      totalUrges += entry.urges.length;
      urgesActedOn += entry.urges.filter(u => u.actedOn === 'Yes').length;
    }
    
    if (entry.reflection?.dailyReflection) {
      daysWithReflection++;
    }
  }

  const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
  const urgeResistanceRate = totalUrges > 0 ? Math.round(((totalUrges - urgesActedOn) / totalUrges) * 100) : 0;

  return `
    <div class="report-summary">
      <h3>📊 Summary</h3>
      <div class="report-item"><strong>Days Tracked:</strong> ${dates.length}</div>
      <div class="report-item"><strong>Goal Completion Rate:</strong> ${goalCompletionRate}% (${completedGoals}/${totalGoals} goals)</div>
      <div class="report-item"><strong>Urge Resistance Rate:</strong> ${urgeResistanceRate}% (resisted ${totalUrges - urgesActedOn}/${totalUrges} urges)</div>
      <div class="report-item"><strong>Days with Reflection:</strong> ${daysWithReflection}</div>
    </div>
  `;
}

function generateGoalsSection(dates) {
  let html = '<div class="report-section"><h2>${icons.target} Goals & Intentions</h2>';
  
  for (const dateKey of dates) {
    const entry = entries[dateKey];
    if (!entry.goals) continue;

    const date = new Date(dateKey);
    const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    
    html += `<div class="report-day">`;
    html += `<div class="report-day-header">${formattedDate}</div>`;
    
    if (entry.goals.centralThought) {
      html += `<div class="report-item"><strong>Central Thought:</strong> ${entry.goals.centralThought}</div>`;
    }
    
    if (entry.goals.goals && entry.goals.goals.length > 0) {
      html += `<div class="report-item"><strong>Goals:</strong><ul style="margin: 5px 0;">`;
      entry.goals.goals.forEach(goal => {
        html += `<li>${goal.completed ? '✅' : '⭕'} ${goal.text}</li>`;
      });
      html += `</ul></div>`;
    }
    
    html += `</div>`;
  }
  
  html += '</div>';
  return html;
}

function generateMealsSection(dates) {
  let html = '<div class="report-section"><h2>${icons.utensils} Meals & Eating</h2>';
  
  for (const dateKey of dates) {
    const entry = entries[dateKey];
    if (!entry.meals) continue;

    const date = new Date(dateKey);
    const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    
    html += `<div class="report-day">`;
    html += `<div class="report-day-header">${formattedDate}</div>`;
    
    const meals = entry.meals;
    
    if (meals.breakfast?.plan || meals.breakfast?.actual) {
      html += `<div class="report-item"><strong>Breakfast:</strong> `;
      if (meals.breakfast.plan) html += `Planned: ${meals.breakfast.plan}`;
      if (meals.breakfast.actual) html += ` | Actual: ${meals.breakfast.actual}`;
      html += `</div>`;
    }
    
    if (meals.lunch?.plan || meals.lunch?.actual) {
      html += `<div class="report-item"><strong>Lunch:</strong> `;
      if (meals.lunch.plan) html += `Planned: ${meals.lunch.plan}`;
      if (meals.lunch.actual) html += ` | Actual: ${meals.lunch.actual}`;
      html += `</div>`;
    }
    
    if (meals.dinner?.plan || meals.dinner?.actual) {
      html += `<div class="report-item"><strong>Dinner:</strong> `;
      if (meals.dinner.plan) html += `Planned: ${meals.dinner.plan}`;
      if (meals.dinner.actual) html += ` | Actual: ${meals.dinner.actual}`;
      html += `</div>`;
    }
    
    if (meals.snacks && meals.snacks.length > 0) {
      html += `<div class="report-item"><strong>Snacks:</strong> ${meals.snacks.join(', ')}</div>`;
    }
    
    if (meals.overeating && meals.overeating.length > 0) {
      html += `<div class="report-item"><strong>⚠️ Overeating:</strong><ul style="margin: 5px 0;">`;
      meals.overeating.forEach(o => {
        html += `<li>${o.time}: ${o.description}</li>`;
      });
      html += `</ul></div>`;
    }
    
    if (meals.binge && meals.binge.length > 0) {
      html += `<div class="report-item"><strong>🚨 Binge:</strong><ul style="margin: 5px 0;">`;
      meals.binge.forEach(b => {
        html += `<li>${b.time}: ${b.description}</li>`;
      });
      html += `</ul></div>`;
    }
    
    html += `</div>`;
  }
  
  html += '</div>';
  return html;
}

function generateUrgesSection(dates) {
  let html = '<div class="report-section"><h2>😰 Urges & Coping</h2>';
  
  for (const dateKey of dates) {
    const entry = entries[dateKey];
    if (!entry.urges || entry.urges.length === 0) continue;

    const date = new Date(dateKey);
    const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    
    html += `<div class="report-day">`;
    html += `<div class="report-day-header">${formattedDate}</div>`;
    
    entry.urges.forEach((urge, index) => {
      html += `<div style="margin-left: 15px; margin-bottom: 15px; padding: 10px; background: white; border-radius: 5px;">`;
      html += `<div style="font-weight: bold; color: #4CAF50;">Urge #${index + 1} - ${urge.time || 'No time recorded'}</div>`;
      
      if (urge.hungerScale) html += `<div class="report-item"><strong>Hunger Scale:</strong> ${urge.hungerScale}/10</div>`;
      if (urge.reallyHungry) html += `<div class="report-item"><strong>Really Hungry?</strong> ${urge.reallyHungry}</div>`;
      if (urge.feeling) html += `<div class="report-item"><strong>Feeling:</strong> ${urge.feeling}</div>`;
      if (urge.feelingDescription) html += `<div class="report-item"><strong>Description:</strong> ${urge.feelingDescription}</div>`;
      
      if (urge.activities) {
        const activities = [];
        for (const [key, value] of Object.entries(urge.activities)) {
          if (value && key !== 'other') activities.push(key.replace(/([A-Z])/g, ' $1').trim());
        }
        if (urge.activities.other && urge.otherActivity) activities.push(urge.otherActivity);
        if (activities.length > 0) {
          html += `<div class="report-item"><strong>Activities Tried:</strong> ${activities.join(', ')}</div>`;
        }
      }
      
      html += `<div class="report-item"><strong>Acted On?</strong> ${urge.actedOn || 'Not specified'}</div>`;
      if (urge.howActed) html += `<div class="report-item"><strong>How:</strong> ${urge.howActed}</div>`;
      
      html += `</div>`;
    });
    
    html += `</div>`;
  }
  
  html += '</div>';
  return html;
}

function generateReflectionsSection(dates) {
  let html = '<div class="report-section"><h2>${icons.sparkles} Daily Reflections</h2>';
  
  for (const dateKey of dates) {
    const entry = entries[dateKey];
    if (!entry.reflection) continue;

    const date = new Date(dateKey);
    const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    
    html += `<div class="report-day">`;
    html += `<div class="report-day-header">${formattedDate}</div>`;
    

// Timing checkbox handlers - only one timing option can be selected
['breakfast', 'lunch', 'dinner'].forEach(meal => {
    ['OnTime', 'Early', 'Late'].forEach(timing => {
        const checkbox = document.getElementById(`${meal}${timing}`);
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    ['OnTime', 'Early', 'Late'].forEach(other => {
                        if (other !== timing) {
                            const otherCheckbox = document.getElementById(`${meal}${other}`);
                            if (otherCheckbox) otherCheckbox.checked = false;
                        }
                    });
                }
            });
        }
    });
});
    const ref = entry.reflection;
    
    if (ref.proud) {
      html += `<div class="report-item"><strong>Proud of decisions?</strong> ${ref.proud}`;
      if (ref.proudExplanation) html += ` - ${ref.proudExplanation}`;
      html += `</div>`;
    }
    
    if (ref.learnTomorrow) {
      html += `<div class="report-item"><strong>Learning for tomorrow:</strong> ${ref.learnTomorrow}</div>`;
    }
    
    if (ref.dailyReflection) {
      html += `<div class="report-item"><strong>Reflection:</strong> ${ref.dailyReflection}</div>`;
    }
    
    html += `</div>`;
  }
  
  html += '</div>';
  return html;
}

// Weight Tracking Functions



// Hamburger menu toggle
document.getElementById('menuToggle').addEventListener('click', (e) => {
    e.stopPropagation();
    const menu = document.getElementById('dropdownMenu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const menu = document.getElementById('dropdownMenu');
    const toggle = document.getElementById('menuToggle');
    if (!menu.contains(e.target) && e.target !== toggle) {
        menu.style.display = 'none';
    }
});

// Close menu after clicking a menu item
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
        document.getElementById('dropdownMenu').style.display = 'none';
    });
});

// ===== COLLAPSIBLE GOALS SECTION TOGGLE =====
function toggleGoalsSection() {
    const section = document.querySelector('.collapsible-goals');
    if (section) {
        section.classList.toggle('collapsed');
    }
}

// Toggle Weight Goals section
function toggleWeightSection() {
    const content = document.querySelector('.weight-content');
    const icon = document.querySelector('.weight-header .toggle-icon');
    
    if (content && icon) {
        content.classList.toggle('collapsed');
        icon.textContent = content.classList.contains('collapsed') ? '▶' : '▼';
    }
}

// Placeholder functions for edit buttons
function openOverallGoalModal() {
    alert('Overall Goal editor coming soon!');
}

function openWeeklyWeightModal() {
    alert('Weekly Weight editor coming soon!');
}

function openWeeklyThoughtModal() {
    alert('Weekly Thought editor coming soon!');
}

// Save Grounding Focus data

// ===== TODO: GROUNDING FOCUS - FIREBASE INTEGRATION NEEDED =====
// Save Grounding Focus data
// TODO: Connect to Firebase to persist data
// - Overall Goal: Save permanently, carries over forever
// - This Week's Weight: Save with week date, resets each Monday
// - Grounding Thought: Save with week date, resets each Monday
async function saveGroundingFocus() {
    if (!window.currentUser || !window.firebaseDb) {
        alert("Please log in to save your goals.");
        return;
    }

    const anchorGoal = document.getElementById("overallGoalInput").value;
    const weeklyThought = document.getElementById("weeklyThoughtInput").value;

    const weekKey = getWeekKey(currentWeekStart);

    try {
        // Import Firestore functions
        const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

        const userDocRef = doc(window.firebaseDb, "users", window.currentUser.uid);

        // Prepare weekly goals object
        const weeklyGoalsUpdate = {};
        weeklyGoalsUpdate[weekKey] = {
            thought: weeklyThought
        };

        // Save to Firebase
        await setDoc(userDocRef, {
            anchorGoal: anchorGoal,
            weeklyGoals: weeklyGoalsUpdate
        }, { merge: true });

        console.log("✅ Grounding Focus saved successfully!");
        
        // Show success message
        const saveBtn = document.querySelector(".save-goals-btn");
        const successMsg = document.createElement("span");
        successMsg.textContent = "✓ Saved!";
        successMsg.style.cssText = "color: #5d7d6e; font-weight: 500; margin-left: 10px; opacity: 0; transition: opacity 0.3s ease;";
        saveBtn.parentNode.appendChild(successMsg);
        
        // Fade in
        setTimeout(() => { successMsg.style.opacity = "1"; }, 10);
        
        // Fade out and remove after 2 seconds
        setTimeout(() => {
            successMsg.style.opacity = "0";
            setTimeout(() => successMsg.remove(), 300);
        }, 2000);
    } catch (error) {
        console.error("Error saving grounding focus:", error);
        alert("Error saving. Please try again.");
    }
}

// Load Grounding Focus data
async function loadGroundingFocus() {
    if (!window.currentUser || !window.firebaseDb) return;

    try {
        // Import Firestore functions
        const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

        const userDocRef = doc(window.firebaseDb, "users", window.currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const data = userDoc.data();

            // Load anchor goal (global)
            const anchorGoal = data.anchorGoal || "";
            document.getElementById("overallGoalInput").value = anchorGoal;

            // Load weekly goals for current week
            const weekKey = getWeekKey(currentWeekStart);
            const weeklyGoals = data.weeklyGoals || {};
            const thisWeekGoals = weeklyGoals[weekKey] || {};

            document.getElementById("weeklyThoughtInput").value = thisWeekGoals.thought || "";
        }
    } catch (error) {
        console.error("Error loading grounding focus:", error);
    }
}

// ========== WEIGHT GOALS SAVE/LOAD ==========
async function saveWeightGoals() {
    if (!window.currentUser || !window.firebaseDb) {
        alert("Please log in to save your weight goals.");
        return;
    }

    const longTermWeight = document.getElementById("longTermWeightInput").value;
    const milestoneWeight = document.getElementById("milestoneWeightInput").value;
    const weeklyWeight = document.getElementById("weeklyWeightInput").value;

    const weekKey = getWeekKey(currentWeekStart);

    try {
        const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

        const userDocRef = doc(window.firebaseDb, "users", window.currentUser.uid);

        // Prepare weekly weight goals object
        const weeklyWeightGoalsUpdate = {};
        weeklyWeightGoalsUpdate[weekKey] = weeklyWeight;

        // Save to Firebase
        await setDoc(userDocRef, {
            longTermWeightGoal: longTermWeight,
            milestoneWeightGoal: milestoneWeight,
            weeklyWeightGoals: weeklyWeightGoalsUpdate
        }, { merge: true });

        console.log("✅ Weight Goals saved successfully!");

        // Show success message
        const saveBtn = document.querySelector(".collapsible-weight .save-goals-btn");
        const successMsg = document.createElement("span");
        successMsg.textContent = "✓ Saved!";
        successMsg.style.cssText = "color: #5d7d6e; font-weight: 500; margin-left: 10px; opacity: 0; transition: opacity 0.3s ease;";
        saveBtn.parentNode.appendChild(successMsg);

        setTimeout(() => { successMsg.style.opacity = "1"; }, 10);
        setTimeout(() => {
            successMsg.style.opacity = "0";
            setTimeout(() => successMsg.remove(), 300);
        }, 2000);
    } catch (error) {
        console.error("Error saving weight goals:", error);
        alert("Error saving. Please try again.");
    }
}

async function loadWeightGoals() {
    if (!window.currentUser || !window.firebaseDb) return;

    try {
        const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

        const userDocRef = doc(window.firebaseDb, "users", window.currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const data = userDoc.data();

            // Load long-term and milestone goals
            document.getElementById("longTermWeightInput").value = data.longTermWeightGoal || "";
            document.getElementById("milestoneWeightInput").value = data.milestoneWeightGoal || "";

            // Load weekly weight goal for current week
            const weekKey = getWeekKey(currentWeekStart);
            const weeklyWeightGoals = data.weeklyWeightGoals || {};
            document.getElementById("weeklyWeightInput").value = weeklyWeightGoals[weekKey] || "";
        }
    } catch (error) {
        console.error("Error loading weight goals:", error);
    }
}

// Update weekly weight comparison with supportive language
async function updateWeeklyWeightComparison(todayWeight) {
    const progressDiv = document.getElementById("weeklyWeightProgress");
    const progressText = document.getElementById("weeklyWeightProgressText");
    
    if (!todayWeight || !progressDiv || !progressText) {
        if (progressDiv) progressDiv.style.display = "none";
        return;
    }
    
    // Get this week's weight goal from the Weight Goals section
    try {
        const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        if (!window.currentUser || !window.firebaseDb) {
            progressDiv.style.display = "none";
            return;
        }
        
        const userDocRef = doc(window.firebaseDb, "users", window.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
            const data = userDoc.data();
            const weekKey = getWeekKey(currentWeekStart);
            const weeklyWeightGoals = data.weeklyWeightGoals || {};
            const weeklyGoal = weeklyWeightGoals[weekKey];
            
            if (!weeklyGoal) {
                progressDiv.style.display = "none";
                return;
            }
            
            const today = parseFloat(todayWeight);
            const goal = parseFloat(weeklyGoal);
            const difference = Math.abs(today - goal);
            
            if (Math.abs(today - goal) < 0.1) {
                // At goal (within 0.1 lbs)
                progressText.textContent = "🎯 Right on track with this week's goal!";
                progressDiv.style.background = "#e8f0ec";
                progressDiv.style.color = "#4a6b5c";
            } else if (today < goal) {
                // Below goal weight = SUCCESS!
                progressText.textContent = `🌟 Amazing! You're ${difference.toFixed(1)} lbs below your goal`;
                progressDiv.style.background = "#e8f0ec";
                progressDiv.style.color = "#4a6b5c";
            } else {
                // Above goal - supportive, encouraging
                progressText.textContent = `${difference.toFixed(1)} lbs to go - you've got this! 💪`;
                progressDiv.style.background = "#f9ede5";
                progressDiv.style.color = "#8b6f47";
            }
            progressDiv.style.display = "block";
        } else {
            progressDiv.style.display = "none";
        }
    } catch (error) {
        console.error("Error loading weekly weight goal:", error);
        progressDiv.style.display = "none";
    }
}

// Add event listener for real-time weight comparison
document.addEventListener('DOMContentLoaded', function() {
    const todayWeightInput = document.getElementById('todayWeightGoals');
    
    if (todayWeightInput) {
        todayWeightInput.addEventListener('input', function() {
            updateWeeklyWeightComparison(this.value);
        });
    }
});
