// Sample Jobs Data
const jobsData = [
    {
        id: 101,
        title: "Software Developer",
        company: "TechCorp",
        location: "Bangalore",
        experience: "0-2 Years",
        description: "Develop and maintain web applications using modern technologies."
    },
    {
        id: 102,
        title: "Web Developer",
        company: "WebWorks",
        location: "Delhi",
        experience: "1-3 Years",
        description: "Create responsive and user-friendly web interfaces."
    },
    {
        id: 103,
        title: "Data Analyst",
        company: "DataSoft",
        location: "Pune",
        experience: "Freshers",
        description: "Analyze data and provide insights for business decisions."
    },
    {
        id: 104,
        title: "Frontend Engineer",
        company: "TechCorp",
        location: "Bangalore",
        experience: "1-3 Years",
        description: "Build beautiful and interactive user interfaces."
    },
    {
        id: 105,
        title: "Backend Developer",
        company: "CloudTech",
        location: "Delhi",
        experience: "0-2 Years",
        description: "Develop scalable backend systems and APIs."
    },
    {
        id: 106,
        title: "QA Engineer",
        company: "DataSoft",
        location: "Pune",
        experience: "1-3 Years",
        description: "Test and ensure quality of software products."
    }
];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    renderJobs(jobsData);
    setupEventListeners();
});

// Render Jobs to the DOM
function renderJobs(jobs) {
    const jobsContainer = document.getElementById('jobsContainer');
    
    if (jobs.length === 0) {
        jobsContainer.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #7f8c8d;">No jobs found. Try adjusting your filters.</p>';
        return;
    }

    jobsContainer.innerHTML = jobs.map(job => `
        <div class="job-card">
            <div class="job-header">
                <h3>${job.title}</h3>
                <span class="job-id">ID: ${job.id}</span>
            </div>
            <p class="company-name">🏢 ${job.company}</p>
            <div class="job-meta">
                <div class="meta-item">
                    <strong>📍 Location:</strong> ${job.location}
                </div>
                <div class="meta-item">
                    <strong>📚 Exp:</strong> ${job.experience}
                </div>
            </div>
            <p style="color: #555; margin: 15px 0;">${job.description}</p>
            <button class="apply-btn" onclick="scrollToApply(${job.id})">Apply Now</button>
        </div>
    `).join('');
}

// Setup Event Listeners
function setupEventListeners() {
    const locationFilter = document.getElementById('locationFilter');
    const experienceFilter = document.getElementById('experienceFilter');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-btn');

    locationFilter.addEventListener('change', applyFilters);
    experienceFilter.addEventListener('change', applyFilters);
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    // Form submissions
    document.getElementById('postJobForm')?.addEventListener('submit', handlePostJob);
    document.getElementById('applyForm')?.addEventListener('submit', handleApplyJob);
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
}

// Apply Filters
function applyFilters() {
    const location = document.getElementById('locationFilter').value;
    const experience = document.getElementById('experienceFilter').value;

    let filtered = jobsData;

    if (location) {
        filtered = filtered.filter(job => job.location === location);
    }

    if (experience) {
        filtered = filtered.filter(job => job.experience === experience);
    }

    renderJobs(filtered);
}

// Search Functionality
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    if (!searchTerm.trim()) {
        renderJobs(jobsData);
        return;
    }

    const filtered = jobsData.filter(job =>
        job.title.toLowerCase().includes(searchTerm) ||
        job.company.toLowerCase().includes(searchTerm) ||
        job.location.toLowerCase().includes(searchTerm)
    );

    renderJobs(filtered);
}

// Scroll to Apply Section and Pre-fill Job ID
function scrollToApply(jobId) {
    const applySection = document.getElementById('apply');
    applySection.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('job_id').value = jobId;
    document.getElementById('job_id').focus();
}

// Handle Post Job Form
function handlePostJob(e) {
    e.preventDefault();

    const formData = {
        title: document.getElementById('job_title').value,
        company: document.getElementById('company').value,
        location: document.getElementById('location').value,
        experience: document.getElementById('experience').value,
        description: document.getElementById('description').value
    };

    // Validation
    if (!formData.title || !formData.company || !formData.location || !formData.experience || !formData.description) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Create new job object
    const newJob = {
        id: Math.max(...jobsData.map(j => j.id)) + 1,
        ...formData
    };

    jobsData.unshift(newJob);
    renderJobs(jobsData);
    e.target.reset();
    showNotification('Job posted successfully! ✓', 'success');
    setTimeout(() => {
        document.getElementById('jobs').scrollIntoView({ behavior: 'smooth' });
    }, 1000);
}

// Handle Apply Job Form
function handleApplyJob(e) {
    e.preventDefault();

    const jobId = document.getElementById('job_id').value;
    const jobExists = jobsData.some(job => job.id == jobId);

    if (!jobExists) {
        showNotification('Invalid Job ID. Please check and try again.', 'error');
        return;
    }

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        jobId: jobId,
        resume: document.getElementById('resume').files[0]?.name || 'resume.pdf'
    };

    showNotification(`Application submitted for Job ID ${jobId}! We'll review your resume soon. ✓`, 'success');
    e.target.reset();
}

// Handle Registration Form
function handleRegister(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.querySelector('input[name="role"]:checked')?.value;

    if (!username || !password || !role) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }

    showNotification(`Welcome, ${username}! Registration successful as ${role}. ✓`, 'success');
    e.target.reset();
}

// Show Notification
function showNotification(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;

    // Find the appropriate section to insert message
    const mainContent = document.querySelector('.container');
    mainContent.insertBefore(messageDiv, mainContent.firstChild);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 4000);
}

// Active Navigation Link Update
window.addEventListener('scroll', updateActiveNavLink);

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section');
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}
