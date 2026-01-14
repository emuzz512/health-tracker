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
        
        // Checkboxes
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
    });
}

document.getElementById('addSnack').addEventListener('click', () => {
    const dateKey = getDateKey(currentDay);
    if (!entries[dateKey]) entries[dateKey] = {};
    if (!entries[dateKey].meals) entries[dateKey].meals = {};
    if (!entries[dateKey].meals.snacks) entries[dateKey].meals.snacks = [];
    
    entries[dateKey].meals.snacks.push({ plan: '', actual: '' });
    renderSnacks();
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
  let html = '<div class="report-section"><h2>🎯 Goals & Intentions</h2>';
  
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
  let html = '<div class="report-section"><h2>🍽️ Meals & Eating</h2>';
  
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
  let html = '<div class="report-section"><h2>💭 Daily Reflections</h2>';
  
  for (const dateKey of dates) {
    const entry = entries[dateKey];
    if (!entry.reflection) continue;

    const date = new Date(dateKey);
    const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    
    html += `<div class="report-day">`;
    html += `<div class="report-day-header">${formattedDate}</div>`;
    
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
