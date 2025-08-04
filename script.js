document.addEventListener('DOMContentLoaded', function() {
    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');
    
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
        icon.classList.replace('fa-moon', 'fa-sun');
    }
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light');
        }
    });

    // User Authentication System
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // DOM Elements for Auth
    const loginBtn = document.querySelector('.login-btn');
    const registerBtn = document.querySelector('.register-btn');
    
    // Check authentication state
    function checkAuthState() {
        if (currentUser) {
            // Change buttons to show profile
            loginBtn.textContent = currentUser.name.split(' ')[0];
            loginBtn.classList.remove('login-btn');
            loginBtn.classList.add('profile-btn');
            registerBtn.textContent = 'Logout';
            registerBtn.classList.remove('register-btn');
            registerBtn.classList.add('logout-btn');
        } else {
            // Reset to default
            loginBtn.textContent = 'Login';
            loginBtn.classList.add('login-btn');
            loginBtn.classList.remove('profile-btn');
            registerBtn.textContent = 'Register';
            registerBtn.classList.add('register-btn');
            registerBtn.classList.remove('logout-btn');
        }
    }
    
    // Initialize auth state
    checkAuthState();
    
    // Auth Modal Elements
    const authModal = document.createElement('div');
    authModal.className = 'auth-modal';
    authModal.style.display = 'none';
    authModal.innerHTML = `
        <div class="auth-modal-content">
            <span class="close-auth-modal">&times;</span>
            <div class="auth-tabs">
                <button class="auth-tab active" data-tab="login">Login</button>
                <button class="auth-tab" data-tab="register">Register</button>
            </div>
            <div class="auth-forms">
                <form id="loginForm" class="auth-form active" data-form="login">
                    <div class="form-group">
                        <label for="loginEmail">Email</label>
                        <input type="email" id="loginEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">Password</label>
                        <input type="password" id="loginPassword" required>
                    </div>
                    <button type="submit" class="auth-submit-btn">Login</button>
                </form>
                <form id="registerForm" class="auth-form" data-form="register">
                    <div class="form-group">
                        <label for="registerName">Full Name</label>
                        <input type="text" id="registerName" required>
                    </div>
                    <div class="form-group">
                        <label for="registerEmail">Email</label>
                        <input type="email" id="registerEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="registerPassword">Password</label>
                        <input type="password" id="registerPassword" required>
                    </div>
                    <div class="form-group">
                        <label for="registerTempPassword">Temporary Password</label>
                        <input type="password" id="registerTempPassword" required>
                        <small>Create a temporary password for this website</small>
                    </div>
                    <button type="submit" class="auth-submit-btn">Register</button>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(authModal);
    
    // Style the auth modal (dynamically added since we're not modifying HTML/CSS)
    const authModalStyle = document.createElement('style');
    authModalStyle.textContent = `
        .auth-modal {
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .auth-modal-content {
            background: var(--card-bg);
            padding: 2rem;
            border-radius: 0.75rem;
            width: 100%;
            max-width: 400px;
            position: relative;
            color: var(--text);
        }
        
        .close-auth-modal {
            position: absolute;
            top: 1rem;
            right: 1rem;
            font-size: 1.5rem;
            cursor: pointer;
        }
        
        .auth-tabs {
            display: flex;
            margin-bottom: 1.5rem;
            border-bottom: 1px solid var(--text-light);
        }
        
        .auth-tab {
            padding: 0.5rem 1rem;
            background: none;
            border: none;
            cursor: pointer;
            font-weight: 500;
            color: var(--text-light);
            position: relative;
        }
        
        .auth-tab.active {
            color: var(--primary);
        }
        
        .auth-tab.active::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 100%;
            height: 2px;
            background: var(--primary);
        }
        
        .auth-form {
            display: none;
        }
        
        .auth-form.active {
            display: block;
        }
        
        .form-group {
            margin-bottom: 1rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }
        
        .form-group input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid var(--text-light);
            border-radius: 0.5rem;
            background: var(--bg);
            color: var(--text);
        }
        
        .form-group small {
            color: var(--text-light);
            font-size: 0.75rem;
        }
        
        .auth-submit-btn {
            width: 100%;
            padding: 0.75rem;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 0.5rem;
            font-weight: 500;
            cursor: pointer;
            margin-top: 1rem;
        }
        
        .auth-submit-btn:hover {
            background: var(--primary-dark);
        }
    `;
    document.head.appendChild(authModalStyle);
    
    // Modal functionality
    function openAuthModal(tab = 'login') {
        authModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Set active tab
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`.auth-tab[data-tab="${tab}"]`).classList.add('active');
        
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        document.querySelector(`.auth-form[data-form="${tab}"]`).classList.add('active');
    }
    
    function closeAuthModal() {
        authModal.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    // Event listeners for auth buttons
    loginBtn.addEventListener('click', function() {
        if (currentUser) {
            // If user is logged in, this button shows profile (do nothing or show profile)
            return;
        }
        openAuthModal('login');
    });
    
    registerBtn.addEventListener('click', function() {
        if (currentUser) {
            // Logout functionality
            localStorage.removeItem('currentUser');
            currentUser = null;
            checkAuthState();
            showToast('Logged out successfully');
            return;
        }
        openAuthModal('register');
    });
    
    // Close modal when clicking X or outside
    authModal.querySelector('.close-auth-modal').addEventListener('click', closeAuthModal);
    authModal.addEventListener('click', function(e) {
        if (e.target === authModal) {
            closeAuthModal();
        }
    });
    
    // Tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            document.querySelector(`.auth-form[data-form="${tabName}"]`).classList.add('active');
            setupShowPasswordIcons(); // Also call after switching tabs (in case forms are re-rendered)
        });
    });
    
    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Find user by email and password (using temporary password)
        const user = users.find(u => u.email === email && u.tempPassword === password);
        
        if (user) {
            currentUser = {
                name: user.name,
                email: user.email
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            checkAuthState();
            closeAuthModal();
            showToast('Login successful!');
        } else {
            showToast('Invalid email or password', 'error');
        }
    });
    
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const tempPassword = document.getElementById('registerTempPassword').value;
        
        // Basic validation
        if (!name || !email || !password || !tempPassword) {
            showToast('Please fill all fields', 'error');
            return;
        }
        
        // Email validation
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            showToast('Please enter a valid email', 'error');
            return;
        }
        
        // Get existing users
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if email already exists
        if (users.some(u => u.email === email)) {
            showToast('Email already registered', 'error');
            return;
        }
        
        // Add new user
        users.push({
            name,
            email,
            password, // This would be their main password (not used for login in this demo)
            tempPassword // This is what they'll use to login to this site
        });
        
        localStorage.setItem('users', JSON.stringify(users));
        
        // Auto-login the new user
        currentUser = { name, email };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        checkAuthState();
        closeAuthModal();
        showToast('Registration successful!');
    });
    
    // Toast notification system
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Add toast styles if not already added
        if (!document.getElementById('toast-styles')) {
            const toastStyle = document.createElement('style');
            toastStyle.id = 'toast-styles';
            toastStyle.textContent = `
                .toast {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--card-bg);
                    color: var(--text);
                    padding: 12px 24px;
                    border-radius: 4px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 1000;
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                
                .toast.show {
                    opacity: 1;
                }
                
                .toast-error {
                    border-left: 4px solid #ff4757;
                }
                
                .toast-success {
                    border-left: 4px solid #2ed573;
                }
            `;
            document.head.appendChild(toastStyle);
        }
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // --- Show/Hide Password Icon Functionality ---
    function addShowPasswordIcon(input) {
        // Prevent duplicate icons by checking if already wrapped
        if (input.parentNode.classList.contains('show-password-wrapper')) return;

        // Create icon element
        const icon = document.createElement('span');
        icon.className = 'show-password-icon';
        icon.style.position = 'absolute';
        icon.style.right = '16px';
        icon.style.top = '50%';
        icon.style.transform = 'translateY(-50%)';
        icon.style.cursor = 'pointer';
        icon.style.fontSize = '1.1rem';
        icon.style.color = 'var(--text-light)';
        icon.style.userSelect = 'none';
        icon.innerHTML = '\u{1F441}'; // eye unicode

        // Container for positioning
        const wrapper = document.createElement('div');
        wrapper.className = 'show-password-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.width = '100%';
        // Increase width of parent .form-group
        if (input.parentNode.classList.contains('form-group')) {
            input.parentNode.style.width = '115%'; // Increase as needed
            input.parentNode.style.maxWidth = '420px';
        }

        // Insert wrapper before input, then move input inside wrapper
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        wrapper.appendChild(icon);

        // Toggle logic
        icon.addEventListener('click', function() {
            if (input.type === 'password') {
                input.type = 'text';
                icon.innerHTML = '\u{1F441}\u{200D}\u{1F5E8}'; // eye with slash
            } else {
                input.type = 'password';
                icon.innerHTML = '\u{1F441}'; // eye
            }
        });
    }

    // Add show/hide icon to all password fields in auth modal
    function setupShowPasswordIcons() {
        const passwordFields = [
            document.getElementById('loginPassword'),
            document.getElementById('registerPassword'),
            document.getElementById('registerTempPassword')
        ];
        passwordFields.forEach(input => {
            if (input && !input.parentNode.classList.contains('show-password-wrapper')) {
                addShowPasswordIcon(input);
            }
        });
    }

    // Call after modal is added to DOM
    setupShowPasswordIcons();

    // --- Forget Password Feature ---
    function createForgetPasswordModal() {
        // Remove if already exists
        const existing = document.getElementById('forget-password-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'forget-password-modal';
        modal.className = 'auth-modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="auth-modal-content">
                <span class="close-auth-modal" id="closeForgetModal">&times;</span>
                <h3 style="margin-bottom:1.5rem;">Reset Temporary Password</h3>
                <form id="forgetStep1" class="forget-step">
                    <div class="form-group">
                        <label for="forgetEmail">Registered Email</label>
                        <input type="email" id="forgetEmail" required>
                    </div>
                    <button type="submit" class="auth-submit-btn">Send OTP</button>
                </form>
                <form id="forgetStep2" class="forget-step" style="display:none;">
                    <div class="form-group">
                        <label for="forgetOtp">Enter OTP</label>
                        <input type="text" id="forgetOtp" required maxlength="6">
                    </div>
                    <button type="submit" class="auth-submit-btn">Verify OTP</button>
                </form>
                <form id="forgetStep3" class="forget-step" style="display:none;">
                    <div class="form-group">
                        <label for="forgetNewTempPassword">New Temporary Password</label>
                        <input type="password" id="forgetNewTempPassword" required>
                    </div>
                    <button type="submit" class="auth-submit-btn">Reset Password</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        // Reuse modal styles
        // Add show/hide password icon to new password field
        setTimeout(() => {
            const input = document.getElementById('forgetNewTempPassword');
            if (input) addShowPasswordIcon(input);
        }, 100);
        // Close modal logic
        modal.querySelector('#closeForgetModal').onclick = () => { modal.remove(); document.body.style.overflow = ''; };
        modal.onclick = e => { if (e.target === modal) { modal.remove(); document.body.style.overflow = ''; } };
        return modal;
    }

    // Add 'Forget Password?' link to login form (JS only)
    function addForgetPasswordLink() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;
        if (loginForm.querySelector('.forget-password-link')) return;
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = 'Forgot password?';
        link.className = 'forget-password-link';
        link.style.display = 'block';
        link.style.margin = '0.5rem 0 0.5rem auto';
        link.style.fontSize = '0.95rem';
        link.style.color = 'var(--primary)';
        link.style.textAlign = 'right';
        link.onclick = function(e) {
            e.preventDefault();
            openForgetPasswordFlow();
        };
        // Insert after password field
        const pwdGroup = loginForm.querySelector('#loginPassword').parentNode;
        pwdGroup.parentNode.insertBefore(link, pwdGroup.nextSibling);
    }

    // Open forget password modal and handle flow
    function openForgetPasswordFlow() {
        const modal = createForgetPasswordModal();
        document.body.style.overflow = 'hidden';
        let sentOtp = null;
        let targetEmail = null;
        // Step 1: Send OTP
        modal.querySelector('#forgetStep1').onsubmit = function(e) {
            e.preventDefault();
            const email = modal.querySelector('#forgetEmail').value.trim();
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email);
            if (!user) {
                showToast('Email not registered', 'error');
                return;
            }
            // Generate OTP
            sentOtp = (Math.floor(100000 + Math.random() * 900000)).toString();
            targetEmail = email;
            // Simulate sending email
            showToast(`OTP sent to ${email} (demo: ${sentOtp})`, 'success');
            // Next step
            modal.querySelector('#forgetStep1').style.display = 'none';
            modal.querySelector('#forgetStep2').style.display = 'block';
        };
        // Step 2: Verify OTP
        modal.querySelector('#forgetStep2').onsubmit = function(e) {
            e.preventDefault();
            const otp = modal.querySelector('#forgetOtp').value.trim();
            if (otp !== sentOtp) {
                showToast('Invalid OTP', 'error');
                return;
            }
            // Next step
            modal.querySelector('#forgetStep2').style.display = 'none';
            modal.querySelector('#forgetStep3').style.display = 'block';
        };
        // Step 3: Set new temp password
        modal.querySelector('#forgetStep3').onsubmit = function(e) {
            e.preventDefault();
            const newPwd = modal.querySelector('#forgetNewTempPassword').value.trim();
            if (!newPwd) {
                showToast('Please enter a new temporary password', 'error');
                return;
            }
            // Update user in localStorage
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const idx = users.findIndex(u => u.email === targetEmail);
            if (idx === -1) {
                showToast('Unexpected error. Try again.', 'error');
                modal.remove();
                return;
            }
            users[idx].tempPassword = newPwd;
            localStorage.setItem('users', JSON.stringify(users));
            showToast('Temporary password reset! You can now login.', 'success');
            modal.remove();
        };
    }

    // Add forget password link after modal is created and after tab switch
    addForgetPasswordLink();
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            setupShowPasswordIcons();
            addForgetPasswordLink();
        });
    });

    // Event data with real posters and details
    const events = [
        {
            title: "Boat Party by Vibe Tribe",
            category: "Music",
            location: "Akshar River Cruise, Mumbai",
            interested: "56 interested",
            img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=300&q=80"
        },
        {
            title: "Tech Summit India 2024",
            category: "Tech",
            location: "Bangalore International Exhibition Centre",
            interested: "3.1k interested",
            img: "https://images.unsplash.com/photo-1495592822108-9e6261896da8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=300&q=80"
        },
        {
            title: "Delhi Half Marathon",
            category: "Sports",
            location: "Jawaharlal Nehru Stadium, Delhi",
            interested: "970 interested",
            img: "https://images.unsplash.com/photo-1543351611-58f69d7c1781?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=300&q=80"
        },
        {
            title: "CodeFest 2024",
            category: "Coding",
            location: "IIT Bombay",
            interested: "1.2k interested",
            img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=300&q=80"
        },
        {
            title: "HackTheFuture Hackathon",
            category: "Hackathon",
            location: "IIIT Hyderabad",
            interested: "850 interested",
            img: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=300&q=80"
        },
        {
            title: "Startup Conclave",
            category: "Business",
            location: "Mumbai Convention Center",
            interested: "1.8k interested",
            img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=300&q=80"
        }
    ];

    // Render events in the scrollable section
    function renderEvents(filteredEvents = events) {
        const container = document.getElementById('events-scroll');
        container.innerHTML = '';
        
        filteredEvents.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            
            eventCard.innerHTML = `
                <img src="${event.img}" alt="${event.title}" class="event-poster">
                <div class="event-details">
                    <h3 class="event-title">${event.title}</h3>
                    <p class="event-interested">${event.interested}</p>
                    <button class="explore-btn">Explore Event</button>
                </div>
            `;
            
            container.appendChild(eventCard);
        });
    }

    // Filter by category
    function filterByCategory(category) {
        const filteredEvents = events.filter(event => event.category === category);
        renderEvents(filteredEvents.length ? filteredEvents : events);
    }

    // Initialize the events
    renderEvents();
    
    // Search functionality
    document.getElementById('event-search-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const category = document.getElementById('category').value;
        const location = document.getElementById('location').value.toLowerCase();
        
        const filteredEvents = events.filter(event => {
            const matchesCategory = !category || event.category === category;
            const matchesLocation = !location || event.location.toLowerCase().includes(location);
            return matchesCategory && matchesLocation;
        });
        
        renderEvents(filteredEvents.length ? filteredEvents : events);
    });

    // Explore button functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('explore-btn')) {
            if (currentUser) {
                showToast('Event details would show here', 'success');
            } else {
                showToast('Please login to view event details', 'error');
                openAuthModal('login');
            }
        }
    });
});