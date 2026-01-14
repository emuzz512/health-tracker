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
        dayCard.className = 'day-card';
        
        const header = document.createElement('div');
        header.className = 'day-header-card';
        header.innerHTML = `
            <div class="day-name">${getDayName(date)}</div>
            <div class="day-date">${formatDate(date)}</div>
        `;
        dayCard.appendChild(header);
        
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'tracking-buttons';
        
        const goalsBtn = createTrackingButton(
            '🎯 Goals & Intention',
            getGoalsStatus(dayData),
            () => openGoalsModal(date),
            (dayData.goals && dayData.goals.length > 0) || dayData.centralThought
        );
        buttonsDiv.appendChild(goalsBtn);
        
        const mealsBtn = createTrackingButton(
            '🍽️ Meals',
            getMealsStatus(dayData),
            () => openMealsModal(date),
            dayData.meals && Object.keys(dayData.meals).length > 0
        );
        buttonsDiv.appendChild(mealsBtn);
        
        const urgesBtn = createTrackingButton(
            '💭 Urges',
            getUrgesStatus(dayData),
            () => openUrgesModal(date),
            dayData.urges && dayData.urges.length > 0
        );
        buttonsDiv.appendChild(urgesBtn);
        
        const reflectionBtn = createTrackingButton(
            '🧠 Reflection',
            getReflectionStatus(dayData),
            () => openReflectionModal(date),
            dayData.reflection && (dayData.reflection.daily || dayData.reflection.proud || dayData.reflection.learn)
        );
        buttonsDiv.appendChild(reflectionBtn);
        
        dayCard.appendChild(buttonsDiv);
        weekView.appendChild(dayCard);
    }
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
function openGoalsModal(date) {
    currentDay = date;
    const dateKey = getDateKey(date);
    const dayData = entries[dateKey] || {};
    
    document.getElementById('goalsModalTitle').textContent = 
        `🎯 Goals & Intention - ${getDayName(date)}, ${formatDate(date)}`;
    
    document.getElementById('centralThought').value = dayData.centralThought || '';
    renderGoals(dayData.goals || []);
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

function saveGoals() {
    const dateKey = getDateKey(currentDay);
    if (!entries[dateKey]) entries[dateKey] = {};
    
    entries[dateKey].centralThought = document.getElementById('centralThought').value;
    
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
    
    document.getElementById('mealsModalTitle').textContent = 
        `🍽️ Meals - ${getDayName(date)}, ${formatDate(date)}`;
    
    // Load breakfast
    document.getElementById('breakfastPlan').value = meals.breakfastPlan || '';
    document.getElementById('breakfastAsPlanned').checked = meals.breakfastAsPlanned || false;
    document.getElementById('breakfastDifferent').checked = meals.breakfastDifferent || false;
    document.getElementById('breakfastActual').value = meals.breakfastActual || '';
    document.getElementById('breakfastActual').style.display = meals.breakfastDifferent ? 'block' : 'none';
    
    // Load lunch
    document.getElementById('lunchPlan').value = meals.lunchPlan || '';
    document.getElementById('lunchAsPlanned').checked = meals.lunchAsPlanned || false;
    document.getElementById('lunchDifferent').checked = meals.lunchDifferent || false;
    document.getElementById('lunchActual').value = meals.lunchActual || '';
    document.getElementById('lunchActual').style.display = meals.lunchDifferent ? 'block' : 'none';
    
    // Load dinner
    document.getElementById('dinnerPlan').value = meals.dinnerPlan || '';
    document.getElementById('dinnerAsPlanned').checked = meals.dinnerAsPlanned || false;
    document.getElementById('dinnerDifferent').checked = meals.dinnerDifferent || false;
    document.getElementById('dinnerActual').value = meals.dinnerActual || '';
    document.getElementById('dinnerActual').style.display = meals.dinnerDifferent ? 'block' : 'none';
    
    // Load snacks
    renderSnacks(meals.snacks || []);
    
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

function renderSnacks(snacks) {
    const snacksList = document.getElementById('snacksList');
    snacksList.innerHTML = '';
    
    snacks.forEach((snack, index) => {
        const snackItem = document.createElement('div');
        snackItem.className = 'snack-item';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = snack;
        input.placeholder = `Snack ${index + 1}`;
        input.oninput = () => {
            snacks[index] = input.value;
        };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '✕';
        deleteBtn.onclick = () => {
            snacks.splice(index, 1);
            renderSnacks(snacks);
        };
        
        snackItem.appendChild(input);
        snackItem.appendChild(deleteBtn);
        snacksList.appendChild(snackItem);
    });
}

document.getElementById('addSnack').addEventListener('click', () => {
    const dateKey = getDateKey(currentDay);
    if (!entries[dateKey]) entries[dateKey] = {};
    if (!entries[dateKey].meals) entries[dateKey].meals = {};
    if (!entries[dateKey].meals.snacks) entries[dateKey].meals.snacks = [];
    
    entries[dateKey].meals.snacks.push('');
    renderSnacks(entries[dateKey].meals.snacks);
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
        
        lunchPlan: document.getElementById('lunchPlan').value,
        lunchAsPlanned: document.getElementById('lunchAsPlanned').checked,
        lunchDifferent: document.getElementById('lunchDifferent').checked,
        lunchActual: document.getElementById('lunchActual').value,
        
        dinnerPlan: document.getElementById('dinnerPlan').value,
        dinnerAsPlanned: document.getElementById('dinnerAsPlanned').checked,
        dinnerDifferent: document.getElementById('dinnerDifferent').checked,
        dinnerActual: document.getElementById('dinnerActual').value,
        
        snacks: snacks.filter(s => s.trim() !== ''),
        
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
function openUrgesModal(date) {
    currentDay = date;
    const dateKey = getDateKey(date);
    const dayData = entries[dateKey] || {};
    
    document.getElementById('urgesModalTitle').textContent = 
        `💭 Urges - ${getDayName(date)}, ${formatDate(date)}`;
    
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
    
    document.getElementById('reflectionModalTitle').textContent = 
        `🧠 Daily Reflection - ${getDayName(date)}, ${formatDate(date)}`;
    
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

// Initialize
loadData();
generateWeekView();
