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


const viewMoodsButton = document.getElementById('view-moods');
const moodHistoryDiv = document.getElementById('mood-history');

if (viewMoodsButton) {
    viewMoodsButton.addEventListener('click', () => {
        const user = firebase.auth().currentUser;

        if (!user) {
            alert('You are not logged in!');
            return;
        }

        const userMoodRef = db.collection('users').doc(user.uid).collection('moods');

        userMoodRef
            .orderBy('date', 'desc')
            .get()
            .then((snapshot) => {
                moodHistoryDiv.innerHTML = '';

                snapshot.forEach((doc) => {
                    const data = doc.data();
                    const date = data.date.toDate().toDateString();

                    moodHistoryDiv.innerHTML += `
                        <p><strong>${date}</strong> - Mood: ${data.moodText} (${data.moodNumber})<br>
                        Description: ${data.description || 'No description'}</p>
                        <hr>
                    `;
                });
            })
            .catch((error) => {
                console.error('Error fetching mood data:', error);
            });
    });
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

// Logout
const logoutButton = document.getElementById('logout');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        firebase.auth().signOut().then(() => {
            window.location.href = 'index.html';
        });
    });
}

