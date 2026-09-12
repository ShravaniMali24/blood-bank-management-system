/**
 * Blood Bank Management System - Main Shared JavaScript
 * Plain vanilla JS, no frameworks, mock interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    initToasts();
    initLoginTabs();
    initBloodFilters();
    initCampRegistration();
    initDonorProfileEdit();
    initDonorRegister();
    initHospitalRegister();
    initHospitalRequest();
    initAdminDashboard();
});

/* ==========================================================================
   Toast Notification System
   ========================================================================== */
function initToasts() {
    if (!document.querySelector('.toast-container')) {
        const container = document.createElement('div');
        container.className = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        document.body.appendChild(container);
    }
}

function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        initToasts();
        container = document.querySelector('.toast-container');
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close" aria-label="Close message">&times;</button>
    `;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    const closeBtn = toast.querySelector('.toast-close');
    const dismiss = () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    };

    closeBtn.addEventListener('click', dismiss);
    setTimeout(dismiss, 3500);
}

/* ==========================================================================
   Login Page Interactions (login.html)
   ========================================================================== */
function initLoginTabs() {
    const tabs = document.querySelectorAll('.login-card .tab');
    const loginForm = document.querySelector('.login-card form');
    const loginLinks = document.querySelector('.login-links');

    if (!tabs.length || !loginForm) return;

    let currentRole = 'Donor';

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentRole = tab.textContent.trim();

            if (loginLinks) {
                if (currentRole === 'Donor') {
                    loginLinks.innerHTML = 'New donor? <a href="donor/register.html">Register here</a>';
                } else if (currentRole === 'Hospital') {
                    loginLinks.innerHTML = 'New hospital? <a href="hospital/register.html">Register here</a>';
                } else if (currentRole === 'Admin') {
                    loginLinks.innerHTML = '<span style="color:#888;">Administrative Portal &bull; Authorized Personnel Only</span>';
                }
            }
        });
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast(`Logging in as ${currentRole}...`, 'info');

        setTimeout(() => {
            if (currentRole === 'Donor') {
                window.location.href = 'donor/dashboard.html';
            } else if (currentRole === 'Hospital') {
                window.location.href = 'hospital/dashboard.html';
            } else if (currentRole === 'Admin') {
                window.location.href = 'admin/dashboard.html';
            }
        }, 600);
    });
}

/* ==========================================================================
   Available Blood Page Filtering (available-blood.html)
   ========================================================================== */
function initBloodFilters() {
    const filtersSection = document.querySelector('.filters');
    const bloodGrid = document.querySelector('.blood-grid');
    if (!filtersSection || !bloodGrid) return;

    const selects = filtersSection.querySelectorAll('select');
    const groupSelect = selects[0];
    const citySelect = selects[1];
    const searchBtn = filtersSection.querySelector('.btn');

    const applyFilter = () => {
        const selectedGroup = groupSelect ? groupSelect.value.trim() : '';
        const selectedCity = citySelect ? citySelect.value.trim().toLowerCase() : '';

        const cards = bloodGrid.querySelectorAll('.blood-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const heading = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const rows = card.querySelectorAll('.blood-row');
            
            // City filter
            const matchesCity = !selectedCity || heading.includes(selectedCity);

            // Group filter
            let matchesGroup = !selectedGroup;
            let groupAvailableInCard = false;

            rows.forEach(row => {
                const groupText = row.querySelector('span:first-child')?.textContent.trim();
                if (selectedGroup) {
                    if (groupText === selectedGroup) {
                        row.style.fontWeight = 'bold';
                        row.style.background = '#fff8e1';
                        groupAvailableInCard = true;
                    } else {
                        row.style.fontWeight = 'normal';
                        row.style.background = 'transparent';
                    }
                } else {
                    row.style.fontWeight = 'normal';
                    row.style.background = 'transparent';
                }
            });

            if (selectedGroup) {
                matchesGroup = groupAvailableInCard;
            }

            if (matchesCity && matchesGroup) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Feedback message
        let feedback = bloodGrid.querySelector('.filter-empty-msg');
        if (visibleCount === 0) {
            if (!feedback) {
                feedback = document.createElement('div');
                feedback.className = 'filter-empty-msg';
                feedback.style.gridColumn = '1 / -1';
                feedback.style.textAlign = 'center';
                feedback.style.padding = '40px';
                feedback.style.color = '#777';
                feedback.innerHTML = '<p>No blood banks found matching the selected group and city.</p><button class="btn btn-outline" style="margin-top:10px;">Reset Filters</button>';
                feedback.querySelector('button').addEventListener('click', () => {
                    if (groupSelect) groupSelect.value = '';
                    if (citySelect) citySelect.value = '';
                    applyFilter();
                });
                bloodGrid.appendChild(feedback);
            }
        } else if (feedback) {
            feedback.remove();
        }
    };

    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            applyFilter();
            showToast('Blood availability filters applied', 'info');
        });
    }

    if (groupSelect) groupSelect.addEventListener('change', applyFilter);
    if (citySelect) citySelect.addEventListener('change', applyFilter);
}

/* ==========================================================================
   Camp Registration Confirmation (donor/camp-register.html)
   ========================================================================== */
function initCampRegistration() {
    const confirmBtn = document.querySelector('.confirm-btn');
    const myCampsSection = document.querySelector('.my-camps');

    if (!confirmBtn || !myCampsSection) return;

    confirmBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirmBtn.disabled) return;

        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Registration Confirmed';
        confirmBtn.style.background = '#27ae60';
        confirmBtn.style.cursor = 'default';

        const campTitle = document.querySelector('.camp-detail-box h3')?.textContent || 'Blood Donation Camp 1-1';

        // Check if camp is already listed in registered camps
        const existingRows = myCampsSection.querySelectorAll('.camp-row');
        let alreadyPresent = false;
        existingRows.forEach(row => {
            if (row.textContent.includes('Camp 1-1')) {
                alreadyPresent = true;
            }
        });

        if (!alreadyPresent) {
            const newRow = document.createElement('div');
            newRow.className = 'camp-row';
            newRow.innerHTML = `
                <span>${campTitle} - Pune</span>
                <span class="status registered">Registered</span>
            `;
            myCampsSection.appendChild(newRow);
        }

        showToast(`Successfully registered for ${campTitle}!`, 'success');
    });
}

/* ==========================================================================
   Donor Profile Edit & Save (donor/profile.html)
   ========================================================================== */
function initDonorProfileEdit() {
    const editBtn = document.querySelector('.edit-btn');
    const profileGrid = document.querySelector('.profile-grid');

    if (!editBtn || !profileGrid) return;

    let isEditing = false;
    const editableFields = profileGrid.querySelectorAll('.profile-field:not(.readonly)');

    editBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (!isEditing) {
            // Switch to editable
            isEditing = true;
            editBtn.textContent = 'Save Changes';
            editBtn.classList.remove('btn-outline');

            editableFields.forEach(field => {
                const h4 = field.querySelector('h4');
                if (h4) {
                    const currentVal = h4.textContent.trim();
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = currentVal;
                    input.style.width = '100%';
                    input.style.padding = '8px';
                    input.style.marginTop = '4px';
                    input.style.border = '1px solid #ccc';
                    input.style.borderRadius = '4px';
                    h4.style.display = 'none';
                    field.appendChild(input);
                }
            });

            showToast('Editing profile. Modify fields and click Save.', 'info');
        } else {
            // Save changes
            isEditing = false;
            editBtn.textContent = 'Edit Profile';

            editableFields.forEach(field => {
                const h4 = field.querySelector('h4');
                const input = field.querySelector('input');
                if (h4 && input) {
                    h4.textContent = input.value.trim() || h4.textContent;
                    h4.style.display = '';
                    input.remove();
                }
            });

            showToast('Profile changes saved successfully!', 'success');
        }
    });
}

/* ==========================================================================
   Donor Registration Form (donor/register.html)
   ========================================================================== */
function initDonorRegister() {
    const form = document.querySelector('.donor-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const firstName = document.getElementById('firstName')?.value || 'Donor';
        showToast(`Registration complete! Welcome, ${firstName}. Redirecting to login...`, 'success');

        setTimeout(() => {
            window.location.href = '../login.html';
        }, 1200);
    });
}

/* ==========================================================================
   Hospital Registration Form (hospital/register.html)
   ========================================================================== */
function initHospitalRegister() {
    const form = document.querySelector('.hospital-register-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const hospName = document.getElementById('hospitalName')?.value || 'Hospital';
        showToast(`Registration submitted for ${hospName}! Redirecting to login...`, 'success');

        setTimeout(() => {
            window.location.href = '../login.html';
        }, 1200);
    });
}

/* ==========================================================================
   Hospital Blood Request Form (hospital/request.html)
   ========================================================================== */
function initHospitalRequest() {
    const form = document.querySelector('.blood-request-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const group = document.getElementById('reqBloodGroup')?.value || 'O+';
        const units = document.getElementById('reqUnits')?.value || '1';
        const priority = document.getElementById('reqPriority')?.value || 'Normal';

        const reqId = 'REQ-' + Math.floor(1000 + Math.random() * 9000);
        showToast(`Request ${reqId} created for ${units} units of ${group} (${priority} priority)!`, 'success');

        form.reset();

        setTimeout(() => {
            showToast('Redirecting to Request Status...', 'info');
            setTimeout(() => {
                window.location.href = 'status.html';
            }, 800);
        }, 1200);
    });
}

/* ==========================================================================
   Admin Dashboard Navigation & Actions (admin/dashboard.html)
   ========================================================================== */
function initAdminDashboard() {
    const adminSidebar = document.querySelector('.admin-sidebar');
    const sections = document.querySelectorAll('.admin-section');

    if (!adminSidebar || !sections.length) return;

    const navLinks = adminSidebar.querySelectorAll('a[data-section]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSectionId = link.getAttribute('data-section');

            // Switch active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Switch active section
            sections.forEach(sec => {
                if (sec.id === targetSectionId) {
                    sec.classList.add('active');
                } else {
                    sec.classList.remove('active');
                }
            });
        });
    });

    // Quick Search filter inside tables
    const searchInputs = document.querySelectorAll('.table-search-input');
    searchInputs.forEach(input => {
        input.addEventListener('input', () => {
            const tableId = input.getAttribute('data-table');
            const table = document.getElementById(tableId);
            if (!table) return;

            const query = input.value.trim().toLowerCase();
            const rows = table.querySelectorAll('tbody tr');

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (!query || text.includes(query)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    });

    // Request Approval / Rejection in Admin
    const requestActions = document.querySelectorAll('.admin-request-action');
    requestActions.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const action = btn.getAttribute('data-action');
            const row = btn.closest('tr');
            if (!row) return;

            const statusCell = row.querySelector('.status-cell');
            const reqId = row.querySelector('td:first-child')?.textContent || 'Request';

            if (action === 'approve') {
                if (statusCell) {
                    statusCell.innerHTML = '<span class="badge badge-approved">Approved</span>';
                }
                btn.parentElement.innerHTML = '<span style="color:#27ae60;font-size:12px;font-weight:bold;">Approved</span>';
                showToast(`${reqId} marked as Approved!`, 'success');
            } else if (action === 'reject') {
                if (statusCell) {
                    statusCell.innerHTML = '<span class="badge badge-rejected">Rejected</span>';
                }
                btn.parentElement.innerHTML = '<span style="color:#c0392b;font-size:12px;font-weight:bold;">Rejected</span>';
                showToast(`${reqId} rejected.`, 'danger');
            }
        });
    });
}
