console.log("auth.js is loaded");

const firebaseConfig = {
    apiKey: "AIzaSyAila4T-0bce7sYrPUPX2yFtd0spvWqCME",
    authDomain: "h4hlogin.firebaseapp.com",
    projectId: "h4hlogin",
    storageBucket: "h4hlogin.firebasestorage.app",
    messagingSenderId: "1033774314113",
    appId: "1:1033774314113:web:5d06628aefb0a811b6d380",
    measurementId: "G-D3EN36P3NX"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();


document.addEventListener('DOMContentLoaded', () => {
    // ------------------- AUTH LOGIC (SIGNUP, LOGIN) -------------------
    

      
    // Signup
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;

            try {
                await auth.createUserWithEmailAndPassword(email, password);
                console.log('Signed Up');
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error(error.message);
                alert(error.message);
            }
        });
    }

    // Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                await auth.signInWithEmailAndPassword(email, password);
                console.log('Logged In');
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error(error.message);
                alert(error.message);
            }
        });
    }

    // Logout
    console.log("auth.js is loaded");

window.addEventListener('load', function () {
    console.log('Window fully loaded');
    const logoutButton = document.getElementById('logout-button');

    if (logoutButton) {
        console.log('Logout Button Found:', logoutButton);
        logoutButton.addEventListener('click', function () {
            console.log('Logout button clicked');
            firebase.auth().signOut()
                .then(() => {
                    console.log('User signed out');
                    window.location.href = 'index.html'; // Redirect to home page
                })
                .catch((error) => {
                    console.error('Logout failed:', error);
                });
        });
    } else {
        console.warn('Logout button not found!');
    }
});
    

    // ------------------- MOOD SUBMISSION LOGIC -------------------
    // Only run this on dashboard.html
    if (window.location.pathname.includes('dashboard.html')) {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                console.log('User is logged in:', user.email);
                checkOrShowAffirmation();
    
                // Mood Submission Logic
                const submitMoodButton = document.getElementById('submit-mood');
                const moodMessage = document.getElementById('mood-message');
                const descriptionInput = document.getElementById('description');
    
                if (submitMoodButton && moodMessage && descriptionInput) {
                    submitMoodButton.addEventListener('click', async () => {
                        const selectedMoodButton = document.querySelector('.emoji-button.selected');
                        const selectedMood = selectedMoodButton?.getAttribute('data-mood');
    
                        if (!selectedMood) {
                            moodMessage.innerText = 'Please select a mood!';
                            moodMessage.style.color = 'red';
                            return;
                        }
    
                        const userMoodRef = db.collection('users').doc(user.uid).collection('moods');
    
                        const todayStart = new Date();
                        todayStart.setHours(0, 0, 0, 0);
                        const todayEnd = new Date();
                        todayEnd.setHours(23, 59, 59, 999);
    
                        const querySnapshot = await userMoodRef
                            .where('date', '>=', todayStart)
                            .where('date', '<=', todayEnd)
                            .get();
    
                        if (!querySnapshot.empty) {
                            moodMessage.innerText = 'You have already submitted a mood today!';
                            moodMessage.style.color = 'red';
                            return;
                        }
    

                        try {
                            await userMoodRef.add({
                                moodText: selectedMood,
                                description: descriptionInput.value.trim() || null,
                                date: firebase.firestore.Timestamp.fromDate(new Date()),
                            });
    
                            moodMessage.innerText = `You are feeling ${selectedMood} today.`;
                            moodMessage.style.color = '#28a745';
    
                            descriptionInput.value = '';
                            document.querySelectorAll('.emoji-button').forEach(button => button.classList.remove('selected'));
                        } catch (error) {
                            console.error('Error saving mood:', error);
                            moodMessage.innerText = 'Error saving mood. Try again later.';
                            moodMessage.style.color = 'red';
                        }
                    });
                }
    
                // Emoji Selection Logic
                const emojiButtons = document.querySelectorAll('.emoji-button');
                if (emojiButtons.length > 0) {
                    emojiButtons.forEach(button => {
                        button.addEventListener('click', () => {
                            emojiButtons.forEach(b => b.classList.remove('selected'));
                            button.classList.add('selected');
                        });
                    });
                }
            } else {
                console.log("No user logged in. Redirecting to index.");
                window.location.href = 'index.html';
            }
        });
    }
    
});




async function checkOrShowAffirmation() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const db = firebase.firestore();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const affirmationDocRef = db.collection('users').doc(user.uid).collection('affirmations').doc(today);

    const affirmationText = document.getElementById('affirmation-text');
    const affirmationButton = document.getElementById('affirmation-button');

    const affirmationsList = [
        "You are capable of amazing things, and every challenge you face is an opportunity to grow stronger, smarter, and more resilient.",
            "You are worthy of love and respect, not because of what you achieve or how you appear, but simply because you are you.",
            "You are strong and resilient, and no matter what obstacles come your way, you have the inner power to rise above them.",
            "You are enough just as you are, and you don’t need to prove your worth to anyone—your existence alone is valuable and meaningful.",
            "You are making progress every day, even when it feels slow or unseen, because growth happens in small, consistent steps.",
            "You are deserving of happiness, and you allow yourself to embrace joy, laughter, and fulfillment without guilt or hesitation.",
            "You are a unique and special person, with talents, ideas, and experiences that make you one of a kind in this world.",
            "You are brave and courageous, choosing to face your fears with determination and taking steps forward even when it feels uncomfortable.",
            "You are loved and appreciated more than you realize, and the kindness and light you bring to others make a difference in their lives.",
            "You are creating a bright future by showing up for yourself every day, learning, growing, and believing in your dreams.",
            "You are worthy of success, and you trust yourself to make the right choices to build the life you envision for yourself.",
            "You are in control of your thoughts and emotions, and you choose to focus on what empowers, uplifts, and motivates you.",
            "You are constantly evolving into the best version of yourself, and you embrace change as a natural and beautiful part of life.",
            "You are a source of light and positivity, and your presence brings warmth, encouragement, and inspiration to those around you.",
            "You are free to let go of past mistakes and embrace a fresh start, knowing that each new day is a new opportunity.",
            "You are deeply connected to your inner wisdom, and you trust yourself to navigate life’s journey with grace and confidence.",
            "You are surrounded by people who support and uplift you, and you attract love, kindness, and meaningful relationships.",
            "You are allowed to rest, recharge, and take care of yourself because your well-being is just as important as your achievements.",
            "You are open to new possibilities, and you welcome abundance, love, and happiness into your life with open arms.",
            "You are exactly where you are meant to be, and every experience—good or bad—is shaping you into the person you are destined to become."
        
    ];

    try {
        const docSnapshot = await affirmationDocRef.get();

        if (docSnapshot.exists) {
            // Show the saved affirmation and hide button
            affirmationText.innerText = docSnapshot.data().text;
            affirmationButton.style.display = 'none';
        } else {
            // If no affirmation is saved for today, show button
            affirmationButton.style.display = 'block';

            affirmationButton.addEventListener('click', async () => {
                const randomAffirmation = affirmationsList[Math.floor(Math.random() * affirmationsList.length)];

                await affirmationDocRef.set({
                    text: randomAffirmation,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });

                affirmationText.innerText = randomAffirmation;
                affirmationButton.style.display = 'none';
            }, { once: true }); // Prevent multiple listeners
        }
    } catch (error) {
        console.error('Error fetching affirmation:', error);
    }
}


async function renderMoodPieChart(user) {
    const userMoodRef = db.collection('users').doc(user.uid).collection('moods');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
        const snapshot = await userMoodRef
            .where('date', '>=', firebase.firestore.Timestamp.fromDate(thirtyDaysAgo))
            .get();

        const moodCounts = {};
        snapshot.forEach((doc) => {
            const mood = doc.data().moodText;
            moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        });

        const chartData = Object.entries(moodCounts).map(([mood, count]) => ({
            mood,
            count,
        }));

        const ctx = document.getElementById('moodPieChart').getContext('2d');

        if (!chartData.length) {
            console.log("No mood data found in the last 30 days.");
            ctx.font = '16px Arial';
            ctx.fillText('No mood data in the last 30 days', 10, 50);
            return;
        }

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: chartData.map((item) => item.mood),
                datasets: [{
                    data: chartData.map((item) => item.count),
                    backgroundColor: ['#ff9999', '#66b3ff', '#99ff99', '#ffcc99', '#c2c2f0'],
                }],
            },
        });
    } catch (error) {
        console.error('Error fetching mood data:', error);
    }
}






function startMoodChartListener(user) {
    const userMoodRef = db.collection('users').doc(user.uid).collection('moods');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Real-time listener
    userMoodRef
        .where('date', '>=', firebase.firestore.Timestamp.fromDate(thirtyDaysAgo))
        .onSnapshot((snapshot) => {
            const moodCounts = {};

            snapshot.forEach((doc) => {
                const mood = doc.data().moodText;
                moodCounts[mood] = (moodCounts[mood] || 0) + 1;
            });

            const chartData = Object.entries(moodCounts).map(([mood, count]) => ({
                mood,
                count,
            }));

            updatePieChart(chartData);
        }, (error) => {
            console.error('Error listening to mood updates:', error);
        });
}


const moodColors = {
    Happy: '#FFD700',    
    Sad: '#6495ED',      
    Anxious: '#FF4500',    
    Excited: '#32CD32', 
    Neutral: '#A9A9A9'   
};
let pieChart = null; // Store chart instance globally

function updatePieChart(chartData) {
    const ctx = document.getElementById('moodPieChart').getContext('2d');

    // Destroy existing chart if it exists
    if (pieChart) {
        pieChart.destroy();
    }

    // Calculate total entries
    const totalEntries = chartData.reduce((sum, item) => sum + item.count, 0);

    // Convert counts to percentages
    const percentages = chartData.map(item => ((item.count / totalEntries) * 100).toFixed(1));

    // Create a new chart
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: chartData.map((item) => item.mood),
            datasets: [{
                data: chartData.map((item) => item.count),
                backgroundColor: chartData.map((item) => moodColors[item.mood] || '#D3D3D3'),
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        font: {
                            size: 12,
                        },
                        generateLabels: function (chart) {
                            const dataset = chart.data.datasets[0];
                            const total = dataset.data.reduce((acc, value) => acc + value, 0);
                            return chart.data.labels.map((label, i) => {
                                const value = dataset.data[i];
                                const percentage = ((value / total) * 100).toFixed(1);
                                return {
                                    text: `${label} (${percentage}%)`,
                                    fillStyle: dataset.backgroundColor[i],
                                    strokeStyle: dataset.backgroundColor[i],
                                    hidden: isNaN(dataset.data[i]) || dataset.data[i] === 0,
                                    index: i,
                                };
                            });
                        },
                    },
                },
            },
        },
    });
}



async function getMoodDataForLast7Days(user) {
    const userMoodRef = db.collection('users').doc(user.uid).collection('moods');

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const snapshot = await userMoodRef
        .where('date', '>=', firebase.firestore.Timestamp.fromDate(sevenDaysAgo))
        .get();

    const moodCounts = {};
    snapshot.forEach((doc) => {
        const mood = doc.data().moodText;
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });

    return moodCounts;
}



function getMostFrequentMood(moodCounts) {
    let maxMood = null;
    let maxCount = 0;

    for (const [mood, count] of Object.entries(moodCounts)) {
        if (count > maxCount) {
            maxMood = mood;
            maxCount = count;
        }
    }

    return { maxMood, maxCount };
}



const moodResources = {
    Happy: "🌟 Happiness is worth savoring, so take a moment to fully embrace this feeling. Share your joy with someone—happiness grows when it’s shared! Consider writing down what made you happy today so you can reflect on it later. Even small moments of happiness can build resilience for tougher days.",
    Sad: "💙 It’s okay to feel sad—emotions come and go like waves. Try journaling or talking to a close friend to process your feelings. Engaging in a small act of self-care, like taking a warm shower or listening to soothing music, can provide comfort. Remember, sadness doesn’t define you; it’s just a temporary state.",
    Anxious: "😟 Take a deep breath—inhale for four seconds, hold for four, and exhale for four. Anxiety often comes from uncertainty, so grounding yourself in the present can help. Try listing five things you can see, four you can touch, three you can hear, two you can smell, and one you can taste. Remind yourself that you’ve faced challenges before, and you have the strength to handle this too.",
    Excited: "🎉 Excitement is energy—channel it into something meaningful! Whether it’s a new opportunity or an upcoming event, take a deep breath and enjoy the anticipation. If your excitement feels overwhelming, grounding techniques like stretching or mindful breathing can help. Let this energy motivate and inspire you!",
    Neutral: "🧘 Feeling neutral can be a great time for reflection. Take a moment to check in with yourself—what’s something small that could bring you joy right now? This is a good opportunity to practice mindfulness, go for a walk, or try something new. Even in stillness, there’s potential for growth and contentment."
};


async function displayMoodAnalysis(user) {
    const moodCounts = await getMoodDataForLast7Days(user);
    const { maxMood, maxCount } = getMostFrequentMood(moodCounts);

    const analysisText = document.getElementById('mood-analysis-text');
    const resourcesText = document.getElementById('mood-resources-text');
    const supportMessage = document.getElementById('support-message');

    const moodColors = {
        Happy: '#FFD700',    
        Sad: '#6495ED',      
        Anxious: '#FF4500',  
        Excited: '#32CD32',  
        Neutral: '#A9A9A9' 
    };

    

    if (maxMood) {
        const moodColor = moodColors[maxMood] || '#000';
        analysisText.innerHTML = `In the last 7 days, you have been feeling <strong style="color: ${moodColor};">${maxMood}</strong> ${maxCount} times.`;

        resourcesText.innerText = moodResources[maxMood] || "Keep listening to your emotions and practicing self-care!";
    } else {
        analysisText.innerText = "No mood data recorded in the last 7 days.";
        resourcesText.innerText = "Start logging your moods to receive personalized insights and support.";
    }

    // Always show support resources
    supportMessage.innerHTML = `
        1️⃣ Need someone to talk to? Try <a href="https://www.7cups.com" target="_blank">7 Cups</a> for free, confidential emotional support from trained listeners and therapists. 💙<br>
        2️⃣ Feeling overwhelmed? Reach out to <a href="https://www.warmline.org" target="_blank">Warmline</a>, a free peer-support service. 💬<br>
        🚨 In crisis? Call or text <strong>988</strong> (U.S. Suicide & Crisis Lifeline) for 24/7, free, and confidential support. 💙
    `;
}


firebase.auth().onAuthStateChanged(user => {
    if (user && window.location.pathname.includes('dashboard.html')) {
        console.log("User is logged in:", user.email);
        checkOrShowAffirmation();
        startMoodChartListener(user);
        displayMoodAnalysis(user); // NEW CALL HERE
    } else {
        console.log("No user logged in or not on dashboard.html");
    }
});


