// Supabase Auth Integration for SignUp_LogIn_Form.js

// Paste your Supabase project credentials here
const SUPABASE_URL = "https://uipjgsthdtclfxmahxsa.supabase.co"; // Replace with your actual Supabase URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpcGpnc3RoZHRjbGZ4bWFoeHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNTc1MDMsImV4cCI6MjA2NDczMzUwM30.408LIhibOoLXoMzZFRIQEFLIpu21wqjTYhWlU1ZM65o"; // Replace with your actual Supabase Anon Key

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

// Simple alert function (you can replace this with a custom modal if you prefer)
function showAlert(message, callback) {
    alert(message);
    if (callback) callback();
}

// Toggle between login and register forms
registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

// Handle Registration
const registerForm = document.querySelector('.form-box.register form');
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const inputs = registerForm.querySelectorAll('input');
    const username = inputs[0].value; // First input is username
    const email = inputs[1].value;    // Second input is email
    const password = inputs[2].value; // Third input is password

    console.log('Attempting registration with:', { username, email, password: '***' });
    console.log('Supabase URL:', SUPABASE_URL);
    console.log('Supabase client:', supabaseClient);

    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: { username: username } // Pass username to user_metadata
            }
        });

        console.log('Registration response:', { data, error });

        if (error) {
            console.error('Registration error:', error);
            showAlert(`Registration Error: ${error.message}`);
        } else {
            console.log('Registration successful:', data);
            showAlert("Registration successful! You can now log in.", () => {
                // Clear form
                registerForm.reset();
                // Switch to login form
                container.classList.remove('active');
            });
        }
    } catch (err) {
        console.error('Registration catch error:', err);
        showAlert(`Registration failed: ${err.message}. Check console for details.`);
    }
});

// Handle Login
const loginForm = document.querySelector('.form-box.login form');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const inputs = loginForm.querySelectorAll('input');
    const usernameOrEmail = inputs[0].value; // First input (can be username or email)
    const password = inputs[1].value;        // Second input is password

    try {
        // Try to login with email first (assuming it's an email format)
        // If it doesn't contain @, we'll need to look up the email by username
        let loginEmail = usernameOrEmail;
        
        if (!usernameOrEmail.includes('@')) {
            // If it's a username, we need to get the email from the user profile
            // For now, let's assume users login with email. You can enhance this later.
            showAlert("Please login with your email address.");
            return;
        }

        const { data, error } = await supabaseClient.auth.signInWithPassword({ 
            email: loginEmail, 
            password 
        });

        if (error) {
            showAlert(`Login failed: ${error.message}`);
        } else {
            showAlert("Login successful! Redirecting to game hub...", () => {
                // FIXED: Go up one directory level to reach index.html
                window.location.href = '../index.html';
            });
        }
    } catch (err) {
        showAlert(`Login failed: ${err.message}`);
    }
});

// Check if user is already logged in when page loads
window.addEventListener('load', async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        // User is already logged in, redirect to game hub
        showAlert("You are already logged in. Redirecting to game hub...", () => {
            // FIXED: Go up one directory level to reach index.html
            window.location.href = '../index.html';
        });
    }
});

// Optional: Handle auth state changes
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        console.log('User signed in:', session.user);
    } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
    }
});