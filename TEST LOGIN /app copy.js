// Replace with your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAila4T-0bce7sYrPUPX2yFtd0spvWqCME",
    authDomain: "h4hlogin.firebaseapp.com",
    projectId: "h4hlogin",
    storageBucket: "h4hlogin.firebasestorage.app",
    messagingSenderId: "1033774314113",
    appId: "1:1033774314113:web:5d06628aefb0a811b6d380",
    measurementId: "G-D3EN36P3NX"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Sign Up Logic
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                alert('Sign Up Successful!');
                window.location.href = 'index.html';
            })
            .catch((error) => {
                document.getElementById('signup-error').innerText = error.message;
            });
    });
}

// Login Logic
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                document.getElementById('login-error').innerText = error.message;
            });
    });
}

// Initialize Firestore (add this after firebaseConfig and auth setup)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const moodForm = document.getElementById('mood-form');
if (moodForm) {
    moodForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const moodValue = document.getElementById('mood').value;
        const description = document.getElementById('description').value.trim();

        const [moodNumber, moodText] = moodValue.split(':');
        const user = firebase.auth().currentUser;

        if (!user) {
            alert('You are not logged in!');
            return;
        }

        const userMoodRef = db.collection('users').doc(user.uid).collection('moods');

        // Check if there's already a mood entry for today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const querySnapshot = await userMoodRef
            .where('date', '>=', todayStart)
            .where('date', '<=', todayEnd)
            .get();

        if (!querySnapshot.empty) {
            document.getElementById('mood-message').innerText = 'You have already submitted a mood today!';
            return;
        }

        // Save the mood if it's the first submission of the day
        userMoodRef.add({
            moodNumber: parseInt(moodNumber),
            moodText: moodText,
            description: description || null,
            date: new Date(),
        })
        .then(() => {
            document.getElementById('mood-message').innerText = 'Mood recorded successfully!';
            moodForm.reset();
        })
        .catch((error) => {
            console.error('Error saving mood:', error);
        });
    });
}





// MOOD DATA FINDING FUNCTIONS




function listenForMoodUpdates() {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.error('User not logged in');
        return;
    }

    const db = firebase.firestore();
    const userMoodRef = db.collection('users').doc(user.uid).collection('moods');

    const today = new Date();
    const past30Days = new Date();
    past30Days.setDate(today.getDate() - 30);

    // Real-time listener for the last 30 days of moods
    userMoodRef
        .where('date', '>=', past30Days) // Only moods from last 30 days
        .onSnapshot((snapshot) => {
            const moodCounts = {};

            snapshot.forEach((doc) => {
                const data = doc.data();
                const mood = data.moodText;

                // Count each mood (e.g., Happy: 2, Sad: 1)
                moodCounts[mood] = (moodCounts[mood] || 0) + 1;
            });

            console.log('Real-time Mood Counts:', moodCounts);

            // Update the chart with new data
            updateMoodPieChart(moodCounts);
        }, (error) => {
            console.error('Error listening for mood updates:', error);
        });
}


//30 day chart functions 



async function getMoodCountsForLast30Days() {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.error('User not logged in');
        return null;
    }

    const db = firebase.firestore();
    const userMoodRef = db.collection('users').doc(user.uid).collection('moods');

    const today = new Date();
    const past30Days = new Date();
    past30Days.setDate(today.getDate() - 30);

    try {
        const snapshot = await userMoodRef
            .where('date', '>=', past30Days)
            .get();

        const moodCounts = {};

        snapshot.forEach((doc) => {
            const data = doc.data();
            const mood = data.moodText;
            moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        });

        console.log('Mood Counts for Last 30 Days:', moodCounts);
        return moodCounts;

    } catch (error) {
        console.error('Error fetching mood data:', error);
        return null;
    }
}




const moodColors = {
    Happy: '#FFD700',    // Yellow
    Sad: '#3498db',      // Blue
    Stressed: '#e74c3c', // Red
    Excited: '#2ecc71',  // Green
    Neutral: '#95a5a6',  // Gray
};


function drawMoodPieChart(moodCounts) {
    const ctx = document.getElementById('moodPieChart').getContext('2d');

    const labels = Object.keys(moodCounts);
    const data = Object.values(moodCounts);

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#FF6384', // Red
                    '#36A2EB', // Blue
                    '#FFCE56', // Yellow
                    '#66BB6A', // Green
                    '#AB47BC', // Purple
                ],
            }]
        },
    });
}


let moodChart = null; // Chart instance

function updateMoodPieChart(moodCounts) {
    const canvas = document.getElementById('moodPieChart');
    const ctx = canvas.getContext('2d');

    // Destroy old chart properly
    if (moodChart) {
        moodChart.destroy();
        moodChart = null; // Clear reference after destroying
    }


    const labels = Object.keys(moodCounts);
    const data = Object.values(moodCounts);

    // Assign colors based on mood text
    const backgroundColors = labels.map(mood => moodColors[mood] || '#d3d3d3'); // Default to light gray if mood not mapped
     

    // Create a new chart instance
    moodChart = new Chart(ctx, {
        type: 'pie',
         data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Mood Breakdown (Last 30 Days)',
                    font: { size: 18 }
                },
                legend: {
                    position: 'bottom',
                    labels: { font: { size: 14 }, boxWidth: 20 }
                },
                datalabels: {
                    color: '#000',
                    font: { weight: 'bold' },
                    formatter: (value, context) => {
                        const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${percentage}%`;
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}


// Past 7 days functions 


async function getMoodCountsForLast7Days() {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.error('User not logged in');
        return null;
    }

    const db = firebase.firestore();
    const userMoodRef = db.collection('users').doc(user.uid).collection('moods');

    const today = new Date();
    const past7Days = new Date();
    past7Days.setDate(today.getDate() - 7);

    try {
        const snapshot = await userMoodRef
            .where('date', '>=', past7Days)
            .get();

        const moodCounts = {};

        snapshot.forEach((doc) => {
            const data = doc.data();
            const mood = data.moodText;
            moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        });

        console.log('Mood Counts for Last 7 Days:', moodCounts);
        return moodCounts;
    } catch (error) {
        console.error('Error fetching mood data:', error);
        return null;
    }
}


function display7DayMoodSummary(moodCounts) {
    const summaryDiv = document.getElementById('moodSummary');

    if (!moodCounts || Object.keys(moodCounts).length === 0) {
        summaryDiv.innerText = 'No mood data for the last 7 days.';
        return;
    }

    // Find the most frequent mood
    let mostFrequentMood = null;
    let mostFrequentDays = 0;

    for (const mood in moodCounts) {
        if (moodCounts[mood] > mostFrequentDays) {
            mostFrequentMood = mood;
            mostFrequentDays = moodCounts[mood];
        }
    }

    // Show summary
    summaryDiv.innerText = `In the last 7 days, you have been feeling ${mostFrequentMood} for ${mostFrequentDays} days.`;
}



// View Data & Analytics
const viewDataButton = document.getElementById('view-data');
if (viewDataButton) {
    viewDataButton.addEventListener('click', () => {
        const user = firebase.auth().currentUser;

        if (user) {
            db.collection('moods')
                .where('userId', '==', user.uid)
                .orderBy('date', 'desc')
                .get()
                .then((snapshot) => {
                    const moodDataDiv = document.getElementById('mood-data');
                    moodDataDiv.innerHTML = '';

                    const moodCount = {};

                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        const mood = data.mood;
                        const date = data.date.toDate();

                        moodDataDiv.innerHTML += `<p>${mood} - ${date.toDateString()}</p>`;

                        // Count moods for analytics
                        moodCount[mood] = (moodCount[mood] || 0) + 1;
                    });

                    // Display simple analytics
                    moodDataDiv.innerHTML += `<h3>Analytics:</h3>`;
                    for (const mood in moodCount) {
                        moodDataDiv.innerHTML += `<p>${mood}: ${moodCount[mood]} times</p>`;
                    }
                })
                .catch((error) => {
                    console.error('Error fetching mood data:', error);
                });
        } else {
            alert('You are not logged in!');
        }
    });
}

// Add some sample data 
async function addSampleMoodData() {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.error('User not logged in');
        return;
    }

    const db = firebase.firestore();
    const moods = ['Happy', 'Sad', 'Stressed', 'Excited', 'Neutral'];

    const userMoodRef = db.collection('users').doc(user.uid).collection('moods');

    for (let i = 0; i < 10; i++) {
        const randomMood = moods[Math.floor(Math.random() * moods.length)];
        const randomDaysAgo = Math.floor(Math.random() * 30); // Any day in the last 30 days

        const date = new Date();
        date.setDate(date.getDate() - randomDaysAgo);

        await userMoodRef.add({
            moodText: randomMood,
            date: date,
            description: `Sample data feeling ${randomMood}`
        });

        console.log(`Added sample mood: ${randomMood} (${date.toDateString()})`);
    }

    console.log('Sample data added!');


}






firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        //await addSampleMoodData(); Adds sample data 
        listenForMoodUpdates();    // Keep this for your real-time chart updates
        const moodCounts7Days = await getMoodCountsForLast7Days();
        display7DayMoodSummary(moodCounts7Days);
    }
});






// Logout
const logoutButton = document.getElementById('logout');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        firebase.auth().signOut().then(() => {
            window.location.href = 'index.html';
        });
    });
}

