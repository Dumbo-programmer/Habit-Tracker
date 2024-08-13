// Sample data structure
let habits = [];
let theme = 'light';
let reminderInterval;

// Helper function to load content
function loadContent(content) {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = content;
}

// Dashboard content
function loadDashboard() {
    const totalHabits = habits.length;
    const totalCompleted = habits.reduce((sum, habit) => sum + habit.completed, 0);
    const dashboardContent = `
        <div class="card">
            <h2>Dashboard</h2>
            <p>Total Habits: ${totalHabits}</p>
            <p>Total Completed: ${totalCompleted}</p>
            <div class="progress-bar">
                <div class="progress-bar-fill" style="width: ${totalHabits ? (totalCompleted / totalHabits) * 100 : 0}%;"></div>
            </div>
        </div>
    `;
    loadContent(dashboardContent);
}

// Habits management content
function loadHabits() {
    const categories = ['Health', 'Productivity', 'Learning', 'Personal'];
    const habitsContent = `
        <div class="card">
            <h2>Manage Habits</h2>
            <input type="text" id="habitInput" placeholder="Add a new habit">
            <select id="categorySelect">
                ${categories.map(category => `<option value="${category}">${category}</option>`).join('')}
            </select>
            <button onclick="addHabit()">Add Habit</button>
            <ul id="habitList" class="sortable"></ul>
        </div>
    `;
    loadContent(habitsContent);
    displayHabits();
    makeSortable();
}

// Function to add a habit
function addHabit() {
    const habitInput = document.getElementById('habitInput');
    const categorySelect = document.getElementById('categorySelect');
    const newHabit = habitInput.value.trim();
    const category = categorySelect.value;

    if (newHabit) {
        habits.push({
            name: newHabit,
            category: category,
            completed: 0,
            streak: 0,
            lastCompleted: null
        });
        habitInput.value = '';
        displayHabits();
        saveHabits();
    }
}

// Function to display habits
function displayHabits() {
    const habitList = document.getElementById('habitList');
    habitList.innerHTML = habits.map((habit, index) => `
        <li class="habit-item" data-index="${index}">
            <div class="habit-info">
                <strong>${habit.name}</strong> (${habit.category})
                <p>Streak: ${habit.streak} days</p>
                <p>Completed: ${habit.completed} times</p>
                <p>Last Completed: ${habit.lastCompleted ? new Date(habit.lastCompleted).toLocaleDateString() : 'Never'}</p>
            </div>
            <div class="habit-actions">
                <button onclick="completeHabit(${index})">Complete</button>
                <button onclick="editHabit(${index})">Edit</button>
                <button onclick="removeHabit(${index})">Remove</button>
            </div>
        </li>
    `).join('');
}

// Function to complete a habit
function completeHabit(index) {
    const today = new Date().toDateString();
    const habit = habits[index];

    if (habit.lastCompleted === today) {
        alert('You have already completed this habit today.');
        return;
    }

    habit.completed++;
    habit.streak = habit.lastCompleted === new Date(today).setDate(new Date(today).getDate() - 1).toDateString() ? habit.streak + 1 : 1;
    habit.lastCompleted = today;
    displayHabits();
    saveHabits();
}

// Function to edit a habit
function editHabit(index) {
    const newHabitName = prompt('Edit habit name:', habits[index].name);
    if (newHabitName) {
        habits[index].name = newHabitName.trim();
        displayHabits();
        saveHabits();
    }
}

// Function to remove a habit
function removeHabit(index) {
    if (confirm("Are you sure you want to remove this habit?")) {
        habits.splice(index, 1);
        displayHabits();
        saveHabits();
    }
}

// Function to save habits to localStorage
function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

// Function to load habits from localStorage
function loadHabitsFromStorage() {
    const storedHabits = localStorage.getItem('habits');
    if (storedHabits) {
        habits = JSON.parse(storedHabits);
    }
}

// Function to change the theme
function changeTheme(newTheme) {
    document.body.className = newTheme;
    theme = newTheme;
    localStorage.setItem('theme', theme);
}

// Function to load theme from localStorage
function loadThemeFromStorage() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
        changeTheme(storedTheme);
    } else {
        changeTheme(theme);
    }
}

// Analytics content
function loadAnalytics() {
    const totalCompleted = habits.reduce((sum, habit) => sum + habit.completed, 0);
    const analyticsContent = `
        <div class="card">
            <h2>Analytics</h2>
            <p>Total Completed Habits: ${totalCompleted}</p>
            <ul>
                ${habits.map(habit => `
                    <li>${habit.name}: ${habit.completed} times</li>
                `).join('')}
            </ul>
        </div>
    `;
    loadContent(analyticsContent);
}

// Settings content
function loadSettings() {
    const settingsContent = `
        <div class="card">
            <h2>Settings</h2>
            <p>Customize your tracker settings here.</p>
            <button onclick="resetHabits()">Reset All Habits</button>
            <button onclick="setReminders()">Set Daily Reminders</button>
        </div>
    `;
    loadContent(settingsContent);
}

// Function to reset all habits
function resetHabits() {
    if (confirm("Are you sure you want to reset all habits? This cannot be undone.")) {
        habits = [];
        saveHabits();
        loadHabits();
    }
}

// Function to set daily reminders
function setReminders() {
    const reminderTime = prompt("Enter the time for daily reminders (e.g., 18:00):");
    if (reminderTime) {
        const [hours, minutes] = reminderTime.split(':').map(Number);
        const now = new Date();
        let firstReminder = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);

        if (firstReminder < now) {
            firstReminder.setDate(firstReminder.getDate() + 1);
        }

        const timeUntilFirstReminder = firstReminder - now;

        clearTimeout(reminderInterval);
        reminderInterval = setTimeout(() => {
            alert("It's time to review your habits!");
            reminderInterval = setInterval(() => {
                alert("It's time to review your habits!");
            }, 24 * 60 * 60 * 1000);
        }, timeUntilFirstReminder);
    }
}

// Function to make the habits list sortable
function makeSortable() {
    const sortableList = document.querySelector('.sortable');
    let draggedItem;

    sortableList.addEventListener('dragstart', function (e) {
        draggedItem = e.target;
        setTimeout(() => {
            draggedItem.style.display = 'none';
        }, 0);
    });

    sortableList.addEventListener('dragend', function (e) {
        setTimeout(() => {
            draggedItem.style.display = 'block';
            draggedItem = null;
        }, 0);
    });

    sortableList.addEventListener('dragover', function (e) {
        e.preventDefault();
    });

    sortableList.addEventListener('dragenter', function (e) {
        e.preventDefault();
        if (e.target.className === 'habit-item') {
            e.target.style.borderBottom = '2px solid #4CAF50';
        }
    });

    sortableList.addEventListener('dragleave', function (e) {
        if (e.target.className === 'habit-item') {
            e.target.style.borderBottom = '';
        }
    });

    sortableList.addEventListener('drop', function (e) {
        if (e.target.className === 'habit-item') {
            e.target.style.borderBottom = '';
            sortableList.insertBefore(draggedItem, e.target.nextSibling);
            reorderHabits();
            saveHabits();
        }
    });
}

// Function to reorder habits in the array
function reorderHabits() {
    const habitItems = document.querySelectorAll('.habit-item');
    habits = Array.from(habitItems).map(item => {
        const index = item.getAttribute('data-index');
        return habits[index];
    });
}

// Initialize app
function init() {
    loadHabitsFromStorage();
    loadThemeFromStorage();
    loadDashboard();

    document.getElementById('dashboardLink').addEventListener('click', () => loadDashboard());
    document.getElementById('habitsLink').addEventListener('click', () => loadHabits());
    document.getElementById('analyticsLink').addEventListener('click', () => loadAnalytics());
    document.getElementById('settingsLink').addEventListener('click', () => loadSettings());

    document.getElementById('theme').addEventListener('change', (event) => changeTheme(event.target.value));
}

init();
