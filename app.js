// ==================================================================
// APP.JS - PHIÊN B?N TÍCH H?P Ð?Y Ð? (HARDCODED TEMPLATES)
// ==================================================================

const { jsPDF } = window.jspdf;
const { PDFDocument, rgb, degrees } = window.PDFLib;

const API_KEY = ""; // Ð? tr?ng
const CLIENT_ID = "537125658544-f5j4rh872q8412rkfoffrs7nt7fahjun.apps.googleusercontent.com";

// --- C?U HÌNH ID M?U (HARDCODED) ---
const TEMPLATE_FORM_ID = "1I9u9P3MlP4623JPnRpjuiySHxGl0z6mSOOGCxbCI3Pg";
const TEMPLATE_SHEET_ID = "1J18DezSL6Y-doQw7NMox8o14qzQeixsTM1AI1-9LnQg";

// --- C?U HÌNH AUTO-UPDATE ---
const CURRENT_VERSION = "1.1.1"; // Phiên b?n hi?n t?i
const VERSION_CHECK_URL = ""; // Disabled - CORS issue with GitHub Pages

let activeAssignment = null;
let classProfiles = [];
let LOGIN_HINT = null;
let selectedItems = new Set();

let autoRefreshTimer = null;
let isAutoRefreshOn = false;
const REFRESH_INTERVAL = 300000;

const iconPlayPath = "M8 5v14l11-7z";
const iconPausePath = "M6 19h4V5H6v14zm8-14v14h4V5h-4z";

let customFontBuffer = null;

const DISCOVERY_DOCS = [
    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
    "https://sheets.googleapis.com/$discovery/rest?version=v4"
];
const SCOPES = "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/forms https://www.googleapis.com/auth/userinfo.email";

let tokenClient;
let gapiInited = false;
let gisInited = false;

// --- DOM Elements Cu ---
const authButton = document.getElementById('authorize_button');
const signoutButton = document.getElementById('signout_button');
const processButton = document.getElementById('process_button');
const openSettingsButton = document.getElementById('open_settings_button');
// Auto refresh button removed - now always enabled
// const autoRefreshButton = document.getElementById('auto_refresh_button');
// const autoRefreshIcon = document.getElementById('auto_refresh_icon');
// const autoRefreshText = document.getElementById('auto_refresh_text');

const classProfileSelect = document.getElementById('class_profile_select');
const editClassButton = document.getElementById('edit_class_button');
const addClassButton = document.getElementById('add_class_button');

const formClassId = document.getElementById('form_class_id');
const formClassName = document.getElementById('form_class_name');
const assignmentTypesContainer = document.getElementById('assignment_types_container');
const addAssignmentTypeButton = document.getElementById('add_assignment_type_button');

const saveClassProfileButton = document.getElementById('save_class_profile');
const clearClassFormButton = document.getElementById('clear_class_form');
const deleteClassProfileButton = document.getElementById('delete_class_profile');

const settingsModal = document.getElementById('settings_modal');
const closeSettingsButton = document.getElementById('close_settings_button');
const classFormModal = document.getElementById('class_form_modal');
const closeClassFormModalButton = document.getElementById('close_class_form_modal_button');
const classModalTitle = document.getElementById('class_modal_title');

const statusLog = document.getElementById('status-log');
const clearLogButton = document.getElementById('clear_log');
const submissionStatusList = document.getElementById('submission-status-list');
const submissionStatusPlaceholder = document.getElementById('submission-status-placeholder');
const assignmentButtonsContainer = document.getElementById('assignment-buttons-container');

// --- [NEW] DOM Elements M?i ---
const btnOpenDrive = document.getElementById('btn_open_drive');
const btnOpenSheet = document.getElementById('btn_open_sheet');
const btnOpenForm = document.getElementById('btn_open_form');
const inpRootFolderId = document.getElementById('root_folder_id');
const btnSaveSystemConfig = document.getElementById('save_system_config');
const divAutoCreateSection = document.getElementById('auto_create_section');

// --- [NEW] Custom Dropdown Elements ---
const classProfileDropdown = document.getElementById('class_profile_dropdown');
const classProfileTrigger = document.getElementById('class_profile_trigger');
const classProfileText = document.getElementById('class_profile_text');
const classProfileMenu = document.getElementById('class_profile_menu');
const classProfileList = document.getElementById('class_profile_list');
const classProfileSelectValue = document.getElementById('class_profile_select_value'); // Hidden input replacement for select

// --- [NEW] Custom Dropdown Logic ---
function toggleDropdown() {
    const isHidden = classProfileMenu.classList.contains('hidden');
    if (isHidden) {
        openDropdown();
    } else {
        closeDropdown();
    }
}

function openDropdown() {
    classProfileMenu.classList.remove('hidden');
    // Small delay to allow display:block to apply before opacity transition
    requestAnimationFrame(() => {
        classProfileMenu.classList.remove('opacity-0', '-translate-y-2');
        classProfileTrigger.setAttribute('aria-expanded', 'true');
        classProfileTrigger.querySelector('svg').style.transform = 'rotate(180deg)';
    });
}

function closeDropdown() {
    classProfileMenu.classList.add('opacity-0', '-translate-y-2');
    classProfileTrigger.setAttribute('aria-expanded', 'false');
    classProfileTrigger.querySelector('svg').style.transform = 'rotate(0deg)';
    setTimeout(() => {
        classProfileMenu.classList.add('hidden');
    }, 200); // Match transition duration
}

function selectClass(id, name) {
    classProfileSelectValue.value = id;
    classProfileSelect.value = id; // Sync old select
    classProfileText.textContent = name || '-- Ch?n l?p --';

    // Update selection state in dropdown items
    updateDropdownSelection(id);
    
    // Update UI based on selection
    handleClassSelectChange();
    closeDropdown();
}

// Event Listeners for Dropdown
if (classProfileTrigger) {
    classProfileTrigger.onclick = (e) => {
        e.stopPropagation();
        toggleDropdown();
    };
}

document.addEventListener('click', (e) => {
    if (classProfileDropdown && !classProfileDropdown.contains(e.target)) {
        closeDropdown();
    }
});

clearLogButton.onclick = () => {
    statusLog.innerHTML = '<div class="log-entry text-outline">Ðã xóa nh?t ký.</div>';
};

window.onload = function () {
    initApp();
};

function initApp() {
    statusLog.innerHTML = '<div class="log-entry text-outline">Kh?i t?o ?ng d?ng...</div>';

    initTheme();
    initMobileView(); // Initialize mobile view
    loadClassProfiles();
    loadActiveClass();
    loadSubmissionStatusFromCache();
    loadLoginHint();

    // [NEW] Load System Config (Ch? load Root Folder)
    if (localStorage.getItem('root_folder_id') && inpRootFolderId) inpRootFolderId.value = localStorage.getItem('root_folder_id');

    bindModalEvents();
    bindSettingsTabs();
    bindClassManagementEvents();
    bindControlButtons();

    // [NEW] Bind Quick Actions
    bindQuickActions();

    // [NEW] Bind keyboard shortcuts for deletion
    document.addEventListener('keydown', (e) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && !e.target.matches('input, textarea')) {
            const selectedItems = document.querySelectorAll('#submission-status-list li[data-selected="true"]');
            if (selectedItems.length > 0) {
                e.preventDefault();
                deleteSelectedSubmissions();
            }
        }
    });

    loadExternalAPIs();

    // [DISABLED] Auto-update check - CORS issue on GitHub Pages
    // setTimeout(checkForUpdates, 3000);

    updateStatus("? S?n sàng. Ch?n L?p & Ðang nh?p.");
    checkSystemReady();
}

function loadLoginHint() {
    const savedEmail = localStorage.getItem('login_hint_email');
    if (savedEmail) {
        LOGIN_HINT = savedEmail;
        updateStatus(`? G?i ý dang nh?p: ${savedEmail}`);
    }
}

function loadExternalAPIs() {
    document.querySelector('script[src="https://apis.google.com/js/api.js"]')?.remove();
    document.querySelector('script[src="https://accounts.google.com/gsi/client"]')?.remove();

    const gapiScript = document.createElement('script');
    gapiScript.src = "https://apis.google.com/js/api.js";
    gapiScript.onload = gapiLoaded;
    document.body.appendChild(gapiScript);

    const gisScript = document.createElement('script');
    gisScript.src = "https://accounts.google.com/gsi/client";
    gisScript.onload = gisLoaded;
    document.body.appendChild(gisScript);
}

// [NEW] Logic Toolbar & Automation
function bindQuickActions() {
    if (btnOpenDrive) btnOpenDrive.onclick = () => {
        const profile = getClassProfile(classProfileSelect.value);
        if (profile) {
            if (profile.folderLink) window.open(profile.folderLink, '_blank');
            else if (profile.id && !profile.id.includes('-')) window.open(`https://drive.google.com/drive/folders/${profile.id}`, '_blank');
        }
    };

    if (btnOpenSheet) btnOpenSheet.onclick = async () => {
        const profile = getClassProfile(classProfileSelect.value);
        if (!profile) {
            updateStatus("? Vui lòng ch?n m?t l?p.", true);
            return;
        }
        
        // Luôn tìm ki?m d?ng trong folder (không dùng link cu)
        updateStatus("?? Ðang tìm ki?m Sheet...");
        const classFolderId = profile.classFolderId || profile.id;
        const sheet = await findSheetInFolder(classFolderId);
        if (sheet && sheet.webViewLink) {
            window.open(sheet.webViewLink, '_blank');
            updateStatus("? M? Sheet thành công.");
        } else {
            updateStatus("? Không tìm th?y Sheet trong folder l?p. Vui lòng ki?m tra l?i.", true);
        }
    };

    if (btnOpenForm) {
        btnOpenForm.onclick = async () => {
            const profile = getClassProfile(classProfileSelect.value);
            if (!profile) {
                updateStatus("? Vui lòng ch?n m?t l?p.", true);
                return;
            }
            
            // Luôn tìm ki?m d?ng trong folder (không dùng link cu)
            updateStatus("?? Ðang tìm ki?m Form...");
            const classFolderId = profile.classFolderId || profile.id;
            const form = await findFormInFolder(classFolderId);
            if (form && form.shortLink) {
                window.open(form.shortLink, '_blank');
                updateStatus("? M? Form thành công.");
            } else {
                updateStatus("? Không tìm th?y Form trong folder l?p. Vui lòng ki?m tra l?i.", true);
            }
        };
        
        btnOpenForm.oncontextmenu = async (e) => {
            e.preventDefault();
            const profile = getClassProfile(classProfileSelect.value);
            if (!profile) {
                updateStatus("? Vui lòng ch?n m?t l?p.", true);
                return;
            }
            
            // Luôn tìm ki?m d?ng trong folder
            updateStatus("?? Ðang tìm ki?m Form...");
            const classFolderId = profile.classFolderId || profile.id;
            const form = await findFormInFolder(classFolderId);
            if (!form) {
                updateStatus("? Không tìm th?y Form trong folder l?p. Vui lòng ki?m tra l?i.", true);
                return;
            }
            
            handleFormContextMenu({ ...profile, formId: form.id });
        };
    }

    if (btnSaveSystemConfig) btnSaveSystemConfig.onclick = () => {
        localStorage.setItem('root_folder_id', inpRootFolderId.value);
        updateStatus("? Ðã luu ID Thu m?c cha.");
    }
    
    // [NEW] Sync & Link button
    const btnSyncLink = document.getElementById('btn_sync_link');
    if (btnSyncLink) btnSyncLink.onclick = syncAndLinkClassSystem;
}

function updateQuickActionsState() {
    const profile = getClassProfile(classProfileSelect.value);
    const statusText = document.getElementById('system_status_text');
    const btnSyncLink = document.getElementById('btn_sync_link');
    
    if (profile) {
        btnOpenDrive.disabled = !(profile.id || profile.folderLink);
        btnOpenSheet.disabled = false; // Luôn enable vì có tìm ki?m d?ng
        btnOpenForm.disabled = false; // Luôn enable vì có tìm ki?m d?ng
        
        // ?n text "S?n sàng", hi?n nút "Ð?ng b?"
        if (statusText) statusText.classList.add('hidden');
        if (btnSyncLink) btnSyncLink.classList.remove('hidden');
    } else {
        btnOpenDrive.disabled = true;
        btnOpenSheet.disabled = true;
        btnOpenForm.disabled = true;
        
        // Hi?n text "Chua ch?n l?p", ?n nút "Ð?ng b?"
        if (statusText) {
            statusText.textContent = "Ch? ch?n l?p...";
            statusText.classList.remove('hidden');
        }
        if (btnSyncLink) btnSyncLink.classList.add('hidden');
    }
}

function getClassProfile(id) {
    return classProfiles.find(p => p.id === id);
}

// ==================================================================
// PH?N QU?N LÝ CÀI Ð?T CHUNG & MODAL
// ==================================================================

function bindClassManagementEvents() {
    classProfileSelect.onchange = handleClassSelectChange;

    addClassButton.onclick = () => {
        clearClassForm();
        classModalTitle.textContent = "T?o L?p M?i";
        classFormModal.setAttribute('aria-hidden', 'false');
        // [NEW] Show Auto Create option
        if (divAutoCreateSection) divAutoCreateSection.classList.remove('hidden');
        formClassName.focus();
    };

    editClassButton.onclick = () => {
        const selectedValue = classProfileSelectValue ? classProfileSelectValue.value : (classProfileSelect ? classProfileSelect.value : '');
        if (selectedValue) {
            displaySelectedClassForEdit();
            classFormModal.setAttribute('aria-hidden', 'false');
            // [NEW] Hide Auto Create option when editing
            if (divAutoCreateSection) divAutoCreateSection.classList.add('hidden');
        }
    };

    // [UPDATE] Handle Save
    saveClassProfileButton.onclick = handleSaveClassProfile;

    clearClassFormButton.onclick = () => {
        clearClassForm();
        formClassName.focus();
    };

    deleteClassProfileButton.onclick = () => {
        const className = formClassName.value;
        if (confirm(`B?n có ch?c ch?n mu?n xóa l?p "${className}" không? Hành d?ng này không th? hoàn tác.`)) {
            deleteClassProfile();
        }
    };

    addAssignmentTypeButton.onclick = () => createAssignmentInputRow();
}

function bindModalEvents() {
    // Guide Modal
    const guideModal = document.getElementById('guide_modal');
    const openGuideButton = document.getElementById('open_guide_button');
    const closeGuideButton = document.getElementById('close_guide_button');
    
    openGuideButton.onclick = () => guideModal.setAttribute('aria-hidden', 'false');
    closeGuideButton.onclick = () => guideModal.setAttribute('aria-hidden', 'true');
    guideModal.onclick = (e) => {
        if (e.target === guideModal) {
            guideModal.setAttribute('aria-hidden', 'true');
        }
    };
    
    // Settings Modal
    openSettingsButton.onclick = () => settingsModal.setAttribute('aria-hidden', 'false');
    closeSettingsButton.onclick = () => settingsModal.setAttribute('aria-hidden', 'true');
    settingsModal.onclick = (e) => {
        if (e.target === settingsModal) {
            settingsModal.setAttribute('aria-hidden', 'true');
        }
    };

    // Class Form Modal
    closeClassFormModalButton.onclick = () => classFormModal.setAttribute('aria-hidden', 'true');
    classFormModal.onclick = (e) => {
        if (e.target === classFormModal) {
            classFormModal.setAttribute('aria-hidden', 'true');
        }
    };

    submissionStatusList.addEventListener('click', handleStatusItemClick);
    submissionStatusList.addEventListener('dblclick', handleStatusItemDblClick);
    submissionStatusList.addEventListener('contextmenu', handleStatusItemContextMenu);
}

function bindSettingsTabs() {
    const navButtons = document.querySelectorAll('.m3-settings-nav-button');
    const panels = document.querySelectorAll('.m3-settings-panel');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            navButtons.forEach(btn => btn.dataset.active = (btn === button));

            // Visual feedback for tabs
            navButtons.forEach(btn => {
                if (btn === button) {
                    btn.classList.add('bg-primary-container', 'text-on-primary-container');
                    btn.classList.remove('text-on-surface-variant');
                } else {
                    btn.classList.remove('bg-primary-container', 'text-on-primary-container');
                    btn.classList.add('text-on-surface-variant');
                }
            });

            panels.forEach(panel => {
                if (panel.id === targetId) {
                    panel.classList.remove('hidden');
                    panel.dataset.active = 'true';
                } else {
                    panel.classList.add('hidden');
                    panel.dataset.active = 'false';
                }
            });
        });
    });
    // Init first tab style
    if (navButtons.length > 0) navButtons[0].click();
}

function handleAssignmentTypeChange(name, folderId) {
    if (activeAssignment && activeAssignment.folderId === folderId) return;
    activeAssignment = { name, folderId, sheetName: name }; // sheetName = name c?a assignment
    updateAssignmentSelectionUI();
    updateStatus(`? Ð?i sang lo?i bài t?p: ${name}`);
    loadSubmissionStatusFromCache();
    // C?p nh?t th?ng kê s? lu?ng n?p bài
    updateSubmissionStats();
    // Removed runAutoScan() - no longer scan on assignment change
    if (isAutoRefreshOn) stopAutoRefresh();
    checkSystemReady();
}

function updateAssignmentSelectionUI() {
    assignmentButtonsContainer.innerHTML = '';
    const selectedId = classProfileSelectValue ? classProfileSelectValue.value : (classProfileSelect ? classProfileSelect.value : '');

    // [FIX] Hide if not logged in or no class selected
    // Check if gapi is loaded to avoid ReferenceError
    const isGapiLoaded = typeof gapi !== 'undefined' && gapi.client && gapi.client.getToken;
    if (!isGapiLoaded || !gapi.client.getToken() || !selectedId) {
        assignmentButtonsContainer.innerHTML = '';
        return;
    }

    const currentProfile = classProfiles.find(p => p.id === selectedId);

    if (!currentProfile || !currentProfile.assignments || currentProfile.assignments.length === 0) {
        assignmentButtonsContainer.innerHTML = '<p class="text-sm text-outline px-2">L?p này chua có lo?i bài t?p nào du?c c?u hình.</p>';
        return;
    }

    // Filter out "File responses" folders
    const validAssignments = currentProfile.assignments.filter(a => 
        !a.name.toLowerCase().includes('file responses')
    );

    if (validAssignments.length === 0) {
        assignmentButtonsContainer.innerHTML = '<p class="text-sm text-outline px-2">L?p này chua có lo?i bài t?p h?p l?.</p>';
        return;
    }

    validAssignments.forEach(assignment => {
        const btn = document.createElement('button');
        btn.className = 'assignment-type-btn m3-button m3-button-outlined text-sm py-2 px-4 smooth-transition flex-1 rounded-full';
        btn.textContent = assignment.name;
        btn.dataset.name = assignment.name;
        btn.dataset.folderId = assignment.folderId;

        if (activeAssignment && activeAssignment.folderId === assignment.folderId) {
            btn.dataset.active = "true";
        }

        btn.onclick = () => handleAssignmentTypeChange(assignment.name, assignment.folderId);
        btn.addEventListener('dragover', handleDragOver);
        btn.addEventListener('dragleave', handleDragLeave);
        btn.addEventListener('drop', handleDrop);
        btn.addEventListener('contextmenu', (e) => handleAssignmentContextMenu(e, assignment.folderId, assignment.name));
        assignmentButtonsContainer.appendChild(btn);
    });
}

function handleStatusItemClick(e) {
    const item = e.target.closest('.submission-item-reprocessable');
    if (!item) return;
    const folderId = item.dataset.folderId;
    if (!folderId) return;

    if (!e.ctrlKey) {
        document.querySelectorAll('.submission-item-reprocessable[data-selected="true"]').forEach(el => {
            if (el !== item) {
                el.dataset.selected = "false";
                selectedItems.delete(el.dataset.folderId);
            }
        });
    }

    if (item.dataset.selected === "true") {
        item.dataset.selected = "false";
        selectedItems.delete(folderId);
    } else {
        item.dataset.selected = "true";
        selectedItems.add(folderId);
    }
}

function handleStatusItemDblClick(e) {
    const item = e.target.closest('.submission-item-reprocessable');
    if (item) {
        const folderId = item.dataset.folderId;
        const folderName = item.dataset.folderName;
        if (folderId && folderName) {
            reprocessAndDownload(folderId, folderName);
        }
    }
}

function handleStatusItemContextMenu(e) {
    e.preventDefault();
    const item = e.target.closest('li[data-folder-id]');
    if (item) {
        const folderId = item.dataset.folderId;
        const folderName = item.dataset.folderName;
        if (folderId) {
            const driveUrl = `https://drive.google.com/drive/folders/${folderId}`;
            updateStatus(`? M? thu m?c: "${folderName || folderId}"`);
            window.open(driveUrl, '_blank');
        }
    }
}

function handleAssignmentContextMenu(e, folderId, folderName) {
    e.preventDefault();
    if (folderId) {
        const driveUrl = `https://drive.google.com/drive/folders/${folderId}`;
        updateStatus(`? M? thu m?c bài t?p: "${folderName}"`);
        window.open(driveUrl, '_blank');
    }
}

async function reprocessAndDownload(folderId, folderName) {
    updateStatus(`? T?i l?i: "${folderName}"`);
    processButton.disabled = true;

    const sanitizedName = folderName.replace(/[^a-zA-Z0-9]/g, '-');
    const statusElement = document.getElementById(`status-${sanitizedName}`);
    let originalText = '';

    if (statusElement) {
        originalText = statusElement.querySelector('span:last-child').textContent;
        statusElement.classList.remove('bg-primary-container', 'text-on-primary-container', 'bg-purple-100', 'text-purple-900', 'dark:bg-purple-900/30', 'dark:text-purple-200', 'submission-item-processed');
        statusElement.classList.add('bg-secondary-container', 'text-on-secondary-container', 'animate-pulse');
        statusElement.querySelector('span:last-child').textContent = 'Ðang t?i l?i...';
    }

    try {
        const folderTypeName = activeAssignment ? activeAssignment.name : "Bài t?p";
        const wasSuccessful = await processSingleFolder(folderId, folderName, folderTypeName);

        if (wasSuccessful) {
            updateStatus(`? T?i l?i thành công: "${folderName}"`);
        } else {
            updateStatus(`? T?i l?i th?t b?i: "${folderName}".`, true);
        }
    } catch (error) {
        const errorMessage = error.message || (error.result ? error.result.error.message : 'L?i không xác d?nh');
        updateStatus(`? L?i nghiêm tr?ng khi t?i l?i "${folderName}": ${errorMessage}`, true);
    } finally {
        if (statusElement) {
            statusElement.classList.remove('bg-secondary-container', 'text-on-secondary-container', 'animate-pulse');
            statusElement.classList.add('bg-purple-100', 'text-purple-900', 'dark:bg-purple-900/30', 'dark:text-purple-200', 'submission-item-reprocessable');
            statusElement.querySelector('span:last-child').textContent = originalText;
        }
        processButton.disabled = false;
    }
}

function bindControlButtons() {
    authButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
    processButton.onclick = handleProcessClick;
    // autoRefreshButton removed - auto refresh always enabled
}

function loadClassProfiles() {
    // Save current selection
    const currentSelection = classProfileSelect ? classProfileSelect.value : classProfileSelectValue.value;

    classProfiles = JSON.parse(localStorage.getItem('classProfiles')) || [];
    
    // [FIX] Migrate old profiles: ensure classFolderId is set
    classProfiles.forEach(profile => {
        if (!profile.classFolderId) {
            profile.classFolderId = profile.id; // Use profile.id as fallback
            console.log(`[MIGRATE] Profile "${profile.name}": Set classFolderId = ${profile.id}`);
        }
    });
    
    // Update old select (hidden fallback)
    if (classProfileSelect) {
        classProfileSelect.innerHTML = '';
    }
    
    // Update custom dropdown
    if (classProfileList) {
        classProfileList.innerHTML = '';
    }

    if (classProfiles.length === 0) {
        if (classProfileSelect) {
            classProfileSelect.innerHTML = '<option value="">-- Chua có l?p nào --</option>';
        }
        if (classProfileList) {
            const li = document.createElement('li');
            li.className = 'custom-dropdown-item';
            li.dataset.value = '';
            li.textContent = '-- Chua có l?p nào --';
            li.onclick = () => selectClass('', '-- Chua có l?p nào --');
            classProfileList.appendChild(li);
        }
        if (classProfileText) {
            classProfileText.textContent = '-- Chua có l?p nào --';
        }
        return;
    }
    
    // Add default option
    if (classProfileSelect) {
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "-- Ch?n m?t l?p --";
        classProfileSelect.appendChild(defaultOption);
    }

    classProfiles.forEach(profile => {
        // Old select
        if (classProfileSelect) {
            const option = document.createElement('option');
            option.value = profile.id;
            option.textContent = profile.name;
            classProfileSelect.appendChild(option);
        }
        
        // Custom dropdown
        if (classProfileList) {
            const li = document.createElement('li');
            li.className = 'custom-dropdown-item';
            li.dataset.value = profile.id;
            li.textContent = profile.name;
            li.onclick = () => selectClass(profile.id, profile.name);
            classProfileList.appendChild(li);
        }
    });
    
    // Restore previous selection if it still exists
    if (currentSelection && classProfiles.find(p => p.id === currentSelection)) {
        if (classProfileSelect) classProfileSelect.value = currentSelection;
        if (classProfileSelectValue) classProfileSelectValue.value = currentSelection;
        const selectedProfile = classProfiles.find(p => p.id === currentSelection);
        if (classProfileText && selectedProfile) {
            classProfileText.textContent = selectedProfile.name;
        }
        updateDropdownSelection(currentSelection);
    } else if (classProfiles.length === 1) {
        // Auto-select if only one class exists
        if (classProfileSelect) classProfileSelect.value = classProfiles[0].id;
        if (classProfileSelectValue) classProfileSelectValue.value = classProfiles[0].id;
        if (classProfileText) classProfileText.textContent = classProfiles[0].name;
        updateDropdownSelection(classProfiles[0].id);
        handleClassSelectChange();
    }
}

function updateDropdownSelection(selectedId) {
    if (!classProfileList) return;
    const items = classProfileList.querySelectorAll('.custom-dropdown-item');
    items.forEach(item => {
        if (item.dataset.value === selectedId) {
            item.dataset.selected = 'true';
        } else {
            item.dataset.selected = 'false';
        }
    });
}

function handleClassSelectChange() {
    const selectedId = classProfileSelect ? classProfileSelect.value : classProfileSelectValue.value;

    if (!selectedId) {
        localStorage.removeItem('activeClassProfileId');
        updateStatus("? Vui lòng ch?n m?t l?p.");
        clearClassForm();
        editClassButton.disabled = true;
        submissionStatusList.innerHTML = '<div class="text-outline">Ch?n l?p và b?t d?u x? lý d? xem tình tr?ng...</div>';
        activeAssignment = null;
        updateAssignmentSelectionUI();
        if (isAutoRefreshOn) stopAutoRefresh();
        checkSystemReady();
        updateQuickActionsState(); // [NEW]
        return;
    }

    localStorage.setItem('activeClassProfileId', selectedId);
    const selectedProfile = classProfiles.find(p => p.id === selectedId);
    
    // [FIX] Ensure classFolderId is set (migrate from old format)
    if (!selectedProfile.classFolderId) {
        selectedProfile.classFolderId = selectedProfile.id;
        // Save migrated data
        const idx = classProfiles.findIndex(p => p.id === selectedId);
        if (idx !== -1) {
            classProfiles[idx] = selectedProfile;
            localStorage.setItem('classProfiles', JSON.stringify(classProfiles));
        }
    }
    
    updateStatus(`? L?p dang ho?t d?ng: ${selectedProfile.name}`);

    if (selectedProfile.assignments && selectedProfile.assignments.length > 0) {
        activeAssignment = selectedProfile.assignments[0];
    } else {
        activeAssignment = null;
    }

    updateAssignmentSelectionUI();
    loadSubmissionStatusFromCache();
    displaySelectedClassForEdit();
    editClassButton.disabled = false;
    if (isAutoRefreshOn) stopAutoRefresh();
    checkSystemReady();
    updateQuickActionsState(); // [NEW]
}

function loadActiveClass() {
    const activeId = localStorage.getItem('activeClassProfileId');
    if (!activeId) {
        editClassButton.disabled = true;
        updateQuickActionsState();
        return;
    }
    const profile = classProfiles.find(p => p.id === activeId);
    if (profile) {
        // [FIX] Ensure classFolderId is set (migrate from old format)
        if (!profile.classFolderId) {
            profile.classFolderId = profile.id;
            const idx = classProfiles.findIndex(p => p.id === activeId);
            if (idx !== -1) {
                classProfiles[idx] = profile;
                localStorage.setItem('classProfiles', JSON.stringify(classProfiles));
            }
        }
        
        classProfileSelect.value = activeId;
        updateStatus(`? L?p dang ho?t d?ng: ${profile.name}`);
        if (profile.assignments && profile.assignments.length > 0) {
            activeAssignment = profile.assignments[0];
        } else {
            activeAssignment = null;
        }
        updateAssignmentSelectionUI();
        loadSubmissionStatusFromCache();
        editClassButton.disabled = false;
        updateQuickActionsState();
    } else {
        localStorage.removeItem('activeClassProfileId');
        editClassButton.disabled = true;
        updateQuickActionsState();
    }
}

function displaySelectedClassForEdit() {
    const selectedId = classProfileSelectValue ? classProfileSelectValue.value : (classProfileSelect ? classProfileSelect.value : '');
    if (!selectedId) { clearClassForm(); return; }
    const profile = classProfiles.find(p => p.id === selectedId);
    if (!profile) return;

    classModalTitle.textContent = "S?a L?p: " + profile.name;
    formClassId.value = profile.id;
    formClassName.value = profile.name;

    assignmentTypesContainer.innerHTML = '';
    if (profile.assignments) {
        profile.assignments.forEach(assignment => createAssignmentChip(assignment));
    }
    deleteClassProfileButton.style.display = 'inline-flex';
}

function extractFolderIdFromUrl(input) {
    if (!input) return '';
    const trimmedInput = input.trim();
    const regex = /folders\/([a-zA-Z0-9-_]+)/;
    const match = trimmedInput.match(regex);
    if (match && match[1]) return match[1];
    if (trimmedInput.length > 20 && !trimmedInput.includes(' ') && !trimmedInput.includes('/')) return trimmedInput;
    return '';
}

function createAssignmentChip(assignment = { name: '', folderId: '' }) {
    const chip = document.createElement('div');
    chip.className = 'assignment-chip';
    chip.dataset.folderId = assignment.folderId || '';
    chip.dataset.name = assignment.name;
    chip.dataset.isNew = !assignment.folderId;

    // Icon cho chip
    const icon = document.createElement('span');
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`;
    icon.className = 'opacity-70 flex items-center justify-center';
    icon.style.display = 'flex';

    // Text label
    const label = document.createElement('span');
    label.textContent = assignment.name;
    label.className = 'flex-1';

    chip.appendChild(icon);
    chip.appendChild(label);

    // Nút t?o l?i Sheet và Form (ch? hi?n th? n?u bài t?p dã t?n t?i)
    if (assignment.folderId) {
        const recreateSheetBtn = document.createElement('button');
        recreateSheetBtn.type = 'button';
        recreateSheetBtn.className = 'm3-button m3-button-icon p-1 w-7 h-7 flex items-center justify-center rounded-full hover:bg-secondary-container/20';
        recreateSheetBtn.title = 'T?o l?i Sheet';
        recreateSheetBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`;
        recreateSheetBtn.onclick = async (e) => {
            e.stopPropagation();
            const confirmMsg = `B?n có ch?c mu?n t?o l?i Sheet cho bài t?p "${assignment.name}" không?\n\nSheet cu s? b? xóa.`;
            if (confirm(confirmMsg)) {
                await recreateAssignmentSheet(assignment.folderId, assignment.name);
            }
        };
        chip.appendChild(recreateSheetBtn);

        // Nút t?o l?i Form (ch? hi?n th? n?u bài t?p dã t?n t?i)
        const recreateFormBtn = document.createElement('button');
        recreateFormBtn.type = 'button';
        recreateFormBtn.className = 'm3-button m3-button-icon p-1 w-7 h-7 flex items-center justify-center rounded-full hover:bg-tertiary-container/20';
        recreateFormBtn.title = 'T?o l?i Form';
        recreateFormBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
        recreateFormBtn.onclick = async (e) => {
            e.stopPropagation();
            const confirmMsg = `B?n có ch?c mu?n t?o l?i Form cho bài t?p "${assignment.name}" không?\n\nForm cu s? b? xóa.`;
            if (confirm(confirmMsg)) {
                await recreateAssignmentForm(assignment.folderId, assignment.name);
            }
        };
        chip.appendChild(recreateFormBtn);
    }

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'm3-button m3-button-icon remove-chip-btn p-1 w-7 h-7 flex items-center justify-center rounded-full hover:bg-error/10';
    removeBtn.title = 'Xóa';
    removeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-error"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    removeBtn.onclick = () => chip.remove();
    chip.appendChild(removeBtn);

    assignmentTypesContainer.appendChild(chip);
}

function createAssignmentInputRow() {
    const chip = document.createElement('div');
    chip.className = 'assignment-chip';
    chip.dataset.isNew = "true";

    // Icon cho chip m?i
    const icon = document.createElement('span');
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
    icon.className = 'opacity-70 flex items-center justify-center';
    icon.style.display = 'flex';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'm3-input flex-1';
    input.placeholder = 'Nh?p tên bài t?p...';
    input.dataset.name = '';

    // Handle input changes
    input.oninput = () => {
        chip.dataset.name = input.value.trim();
    };

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'm3-button m3-button-icon remove-chip-btn p-1 w-7 h-7 flex items-center justify-center rounded-full hover:bg-error/10';
    removeBtn.title = 'Xóa';
    removeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-error"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    removeBtn.onclick = () => chip.remove();

    chip.appendChild(icon);
    chip.appendChild(input);
    chip.appendChild(removeBtn);
    assignmentTypesContainer.appendChild(chip);
    input.focus();
}



// [NEW] Logic Save (Always Auto)
async function handleSaveClassProfile() {
    await createClassSystemAutomatic();
}

async function saveClassProfileManual() {
    const name = formClassName.value.trim();
    if (!name) {
        updateStatus("? L?i: Tên L?p là b?t bu?c.", true);
        formClassName.focus();
        return;
    }

    saveClassProfileButton.disabled = true;

    try {
        const originalClassId = formClassId.value; // Can be UUID, folderId, or empty
        let classFolderId = originalClassId;
        const isNewClass = !originalClassId;
        let folderLink = null;
        let existingProfile = classProfiles.find(p => p.id === originalClassId);

        // A class needs a folder. Create one if it's a new class, or an old one with a UUID.
        const needsFolder = isNewClass || (originalClassId && originalClassId.includes('-'));
        if (needsFolder) {
            const rootId = inpRootFolderId.value.trim();
            if (!rootId) {
                updateStatus("? L?i: C?n ID Thu m?c cha d? t?o l?p m?i. Vui lòng vào Cài d?t > T? d?ng hóa.", true);
                alert("Vui lòng vào Cài d?t -> T? d?ng hóa d? nh?p ID Thu m?c cha (Root) tru?c.");
                throw new Error("Missing Root Folder ID");
            }
            const folder = await apiCreateFolder(name, rootId);
            classFolderId = folder.id;
            folderLink = folder.webViewLink;
        } else if (existingProfile) {
            folderLink = existingProfile.folderLink;
        }


        const assignments = [];
        const chips = Array.from(assignmentTypesContainer.querySelectorAll('.assignment-chip'));

        for (const chip of chips) {
            const assignmentName = chip.dataset.name;
            let folderId = chip.dataset.folderId;

            if (assignmentName) {
                if (folderId) {
                    assignments.push({
                        name: assignmentName,
                        folderId: folderId
                    });
                } else {
                    const assignmentFolder = await apiCreateFolder(assignmentName, classFolderId);
                    folderId = assignmentFolder.id;
                    assignments.push({
                        name: assignmentName,
                        folderId: folderId
                    });
                }
            } else {
                updateStatus(`? C?nh báo: B? qua lo?i bài t?p không có tên.`, true);
            }
        }

        const newProfile = {
            id: classFolderId,
            name,
            assignments,
            sheetLink: existingProfile ? existingProfile.sheetLink : null,
            formLink: existingProfile ? existingProfile.formLink : null,
            formShortLink: existingProfile ? existingProfile.formShortLink : null,
            folderLink: folderLink,
            sheetId: existingProfile ? existingProfile.sheetId : null,
            formId: existingProfile ? existingProfile.formId : null
        };

        if (isNewClass || needsFolder) { // If it was a new class or one that needed a folder
            if (!isNewClass) { // it was an old class with UUID, so we replace it
                const profileIndex = classProfiles.findIndex(p => p.id === originalClassId);
                if (profileIndex > -1) {
                    classProfiles[profileIndex] = newProfile;
                }
            } else { // it was a completely new class
                classProfiles.push(newProfile);
            }
        } else { // Just a normal update
            const profileIndex = classProfiles.findIndex(p => p.id === originalClassId);
            if (profileIndex > -1) classProfiles[profileIndex] = newProfile;
        }

        // [NEW] N?u có sheetId và có assignments, ghi vào config và t?o sheets
        if (newProfile.sheetId && assignments.length > 0) {
            try {
                // 1. T?o folder cho assignments m?i (n?u chua có)
                for (const assignment of assignments) {
                    if (!assignment.folderId) {
                        const assignmentFolder = await apiCreateFolder(assignment.name, newProfile.id);
                        assignment.folderId = assignmentFolder.id;
                    }
                }
                
                // 2. Ghi vào Config sheet
                await apiWriteAssignmentsToConfig(newProfile.sheetId, assignments);
                
                // 3. Update Form choices
                if (newProfile.formId) {
                    await apiUpdateFormChoices(newProfile.formId, assignments);
                }
            } catch (error) {
                console.error('L?i khi ghi config:', error);
                updateStatus(`? L?i khi luu l?p: ${error.message}`, true);
            }
        }

        localStorage.setItem('classProfiles', JSON.stringify(classProfiles));
        loadClassProfiles();
        classProfileSelect.value = classFolderId;
        handleClassSelectChange();
        classFormModal.setAttribute('aria-hidden', 'true');
        
        // Scroll to status log
        setTimeout(() => {
            const statusLog = document.getElementById('status-log');
            if (statusLog) {
                statusLog.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 300);
        
        editClassButton.disabled = false;
    } catch (error) {
        const errorMessage = error.message || (error.result ? error.result.error.message : 'L?i không xác d?nh');
        updateStatus(`? L?i nghiêm tr?ng khi luu l?p: ${errorMessage}`, true);
        console.error(error);
    } finally {
        saveClassProfileButton.disabled = false;
    }
}

// [NEW] Auto Create Function (using Hardcoded Templates)
async function createClassSystemAutomatic() {
    const name = formClassName.value.trim();
    const rootId = inpRootFolderId.value.trim();

    // S? d?ng h?ng s? thay vì l?y t? input
    const tmplSheetId = TEMPLATE_SHEET_ID;
    const tmplFormId = TEMPLATE_FORM_ID;

    if (!name || !rootId) {
        updateStatus("? L?i: Thi?u tên l?p ho?c c?u hình Thu m?c cha.", true);
        if (!rootId) {
            alert("Vui lòng vào Cài d?t -> T? d?ng hóa d? nh?p ID Thu m?c cha (Root) tru?c.");
        }
        return;
    }

    updateStatus(`?? Ðang t?o h? th?ng cho "${name}"... Vui lòng ch?.`);
    saveClassProfileButton.disabled = true;
    
    // Ðóng modal ngay khi b?t d?u t?o
    classFormModal.setAttribute('aria-hidden', 'true');
    
    // Scroll to status log d? user theo dõi ti?n trình
    setTimeout(() => {
        const statusLog = document.getElementById('status-log');
        if (statusLog) {
            statusLog.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 300);

    try {
        // 1. T?o Folder L?p
        const folder = await apiCreateFolder(name, rootId);

        // 2. Copy Form
        const form = await apiCopyFile(tmplFormId, `Bi?u m?u n?p bài - ${name}`, folder.id);
        
        // 2.0. LUU Ý: FORM C?N PUBLISH TH? CÔNG
        // Forms API không h? tr? publish form t? client-side
        // Form m?i t?o luôn ? tr?ng thái DRAFT (chua xu?t b?n)
        updateStatus("? Form c?n PUBLISH TH? CÔNG: https://docs.google.com/forms/d/" + form.id + "/edit");
        
        // 2.1. [DISABLED] Rename Form's script project - use quickSetupForm() instead

        // 3. Copy Sheet
        const sheet = await apiCopyFile(tmplSheetId, `B?ng nh?n xét - ${name}`, folder.id);
        
        // 3.1. [DISABLED] Rename Sheet's script project - use quickSetupSheet() instead

        // 4. Ghi Config vào Sheet
        await apiUpdateSheetConfig(sheet.id, name, folder.id, form.id);
        
        // 4.1. Ghi email ngu?i dùng vào config
        const userEmail = LOGIN_HINT || (gapi.client.getToken() ? await getUserEmail() : null);
        if (userEmail) {
            await apiWriteUserEmailToConfig(sheet.id, userEmail);
        }

        // 5. Write Assignments to Config sheet
        const chips = Array.from(assignmentTypesContainer.querySelectorAll('.assignment-chip'));
        const assignments = [];
        
        if (chips.length > 0) {
            for (const chip of chips) {
                const assignmentName = chip.dataset.name;
                if (assignmentName) {
                    const assignmentFolder = await apiCreateFolder(assignmentName, folder.id);
                    assignments.push({
                        name: assignmentName,
                        folderId: assignmentFolder.id
                    });
                }
            }
            
            // Ghi vào sheet C?u Hình
            if (assignments.length > 0) {
                await apiWriteAssignmentsToConfig(sheet.id, assignments);
                
                // Update Form choices
                await apiUpdateFormChoices(form.id, assignments);
            }
            
            // Create assignment sheets automatically
            if (assignments.length > 0) {
                await apiCreateAssignmentSheets(sheet.id, assignments);
            }
        }

        // Build form links (responder link from form ID)
        const formEditLink = `https://docs.google.com/forms/d/${form.id}/edit`;
        const formShortLink = `https://docs.google.com/forms/d/${form.id}/viewform`;
        
        // Open form and sheet in new tabs
        window.open(formEditLink, '_blank');
        window.open(sheet.webViewLink, '_blank');
        
        updateStatus(`?? Liên k?t Form v?i Sheet th? công: Form ? Responses ? Select response destination ? Ch?n sheet`);

        // 11. Save Profile
        const newProfile = {
            id: folder.id,
            name: name,
            assignments: assignments,
            sheetLink: sheet.webViewLink,
            formLink: formShortLink,
            formShortLink: formShortLink,
            folderLink: folder.webViewLink,
            sheetId: sheet.id,
            formId: form.id
        };

        classProfiles.push(newProfile);
        localStorage.setItem('classProfiles', JSON.stringify(classProfiles));

        // Close modal and scroll to status log
        classFormModal.setAttribute('aria-hidden', 'true');
        
        // Scroll to status log to see results
        setTimeout(() => {
            const statusLog = document.getElementById('status-log');
            if (statusLog) {
                statusLog.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 300);
        
        // Then update UI
        loadClassProfiles();
        
        // Sync both native select and custom dropdown
        if (classProfileSelect) classProfileSelect.value = folder.id;
        if (classProfileSelectValue) classProfileSelectValue.value = folder.id;
        if (classProfileText) classProfileText.textContent = name;
        updateDropdownSelection(folder.id);
        
        handleClassSelectChange();

        updateStatus(`?? Hoàn t?t! Ðã t?o l?p "${name}" v?i ${assignments.length} lo?i bài t?p.`);
        updateStatus(`\n?? SETUP QUY TRÌNH (3 bu?c du?i dây):`);
        updateStatus(`\n?? STEP 1: Setup Form Script`);
        
        // Auto-open Form Apps Script editor with instructions
        const formScriptUrl = `https://script.google.com/home/projects/${form.id}/edit`;
        updateStatus(`?? Ðang m? Apps Script editor...`);
        
        // Wait a bit then show confirmation
        setTimeout(() => {
            const shouldOpen = confirm(
                `? L?p "${name}" dã du?c t?o!\n\n` +
                `?? STEP 1: Setup Form Script (t? d?ng - 1 phút)\n\n` +
                `Bu?c 1: Click OK d? m? Form Apps Script editor\n` +
                `Bu?c 2: Ch?n Run ? quickSetupForm\n` +
                `Bu?c 3: Click Run ?? và authorize\n` +
                `Bu?c 4: Ch? xong, close tab này\n\n` +
                `Form s? t? d?ng:\n` +
                `? Ð?i tên Project\n` +
                `? Kích ho?t triggers\n` +
                `? S?n sàng nh?n bài n?p!`
            );
            
            if (shouldOpen) {
                window.open(formScriptUrl, '_blank');
                updateStatus(`?? Ðã m? Form Apps Script. Run ? quickSetupForm ? ?? Authorize`);
                updateStatus(`?? Sau khi xong: Quay l?i tab này d? làm STEP 2`);
            } else {
                updateStatus(`?? Nh? setup Form script sau: ${formScriptUrl}`);
            }
        }, 500);
        
    } catch (e) {
        updateStatus(`? L?i t?o t? d?ng: ${e.message || e.result?.error?.message}`, true);
        console.error(e);
    } finally {
        saveClassProfileButton.disabled = false;
    }
}

// [NEW] API Helpers
async function apiCreateFolder(name, parentId) {
    return gapi.client.drive.files.create({
        resource: { name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] },
        fields: 'id, webViewLink'
    }).then(res => res.result);
}

async function apiCopyFile(fileId, name, parentId) {
    return gapi.client.drive.files.copy({
        fileId,
        resource: { name, parents: [parentId] },
        fields: 'id, webViewLink'
    }).then(res => res.result);
}

async function apiUpdateSheetConfig(spreadsheetId, className, folderId, formId) {
    // Ghi vào c?t I:
    // I1: Tên l?p
    // I3: Folder ID
    // I4: Sheet ID
    // I5: Form ID
    const updates = [
        {
            range: 'C?u Hình!I1',
            values: [[className]]
        },
        {
            range: 'C?u Hình!I3',
            values: [[folderId]]
        },
        {
            range: 'C?u Hình!I4',
            values: [[spreadsheetId]]
        },
        {
            range: 'C?u Hình!I5',
            values: [[formId]]
        }
    ];
    
    await gapi.client.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        resource: {
            valueInputOption: 'RAW',
            data: updates
        }
    });
}

async function apiLinkFormToSheet(formId, sheetId) {
    // Google Forms API không h? tr? set destination sau khi form dã du?c t?o
    // Phuong pháp duy nh?t: Dùng responderUri d? form t? d?ng link khi có response d?u tiên
    // HO?C user ph?i link th? công trong Form UI
    
    try {
        console.log('[FORM-SHEET] Ðang c? g?ng link form v?i sheet...');
        
        // Th? dùng Forms API d? update linkedSheetId
        const updateResponse = await gapi.client.request({
            path: `https://forms.googleapis.com/v1/forms/${formId}`,
            method: 'PATCH',
            body: {
                linkedSheetId: sheetId
            },
            params: {
                updateMask: 'linkedSheetId'
            }
        });
        
        console.log('[FORM-SHEET] ? Ðã link form v?i sheet qua API!');
        return updateResponse;
        
    } catch (e) {
        console.warn('[FORM-SHEET] API không cho phép link:', e);
        console.log('[FORM-SHEET] ? Hu?ng d?n link th? công: Form ? Responses ? Select response destination ? Ch?n sheet dã t?o');
        
        // Return null d? caller bi?t c?n hu?ng d?n user
        return null;
    }
}

async function apiUpdateFormChoices(formId, assignments) {
    try {
        console.log('[FORM] B?t d?u c?p nh?t form choices:', formId);
        console.log('[FORM] Assignments:', assignments);
        
        // 1. Get form structure to find the question item
        const formResponse = await gapi.client.request({
            path: `https://forms.googleapis.com/v1/forms/${formId}`,
            method: 'GET'
        });
        
        console.log('[FORM] Form structure:', formResponse.result);
        const form = formResponse.result;
        
        // 2. Find the question with title containing assignment/homework keywords
        let questionItemId = null;
        const keywords = ['lo?i bài t?p', 'bài t?p', 'ch?n bài', 'assignment', 'homework'];
        
        if (form.items) {
            for (const item of form.items) {
                if (item.title) {
                    const titleLower = item.title.toLowerCase();
                    for (const keyword of keywords) {
                        if (titleLower.includes(keyword)) {
                            questionItemId = item.itemId;
                            console.log(`[FORM] Tìm th?y câu h?i: "${item.title}" (ID: ${questionItemId})`);
                            break;
                        }
                    }
                    if (questionItemId) break;
                }
            }
        }
        
        if (!questionItemId) {
            console.warn('[FORM] Không tìm th?y câu h?i lo?i bài t?p trong form');
            console.log('[FORM] Danh sách câu h?i:', form.items?.map(i => i.title));
            updateStatus(`?? Không tìm th?y câu h?i "Lo?i bài t?p" - c?n update th? công`);
            return;
        }
        
        // 3. Create choices from assignments
        const choices = assignments.map(a => ({ value: a.name }));
        
        // 4. Update the question with new choices
        console.log('[FORM] Updating question with choices:', choices);
        
        // Get current item location first
        const currentItem = form.items.find(item => item.itemId === questionItemId);
        if (!currentItem) {
            throw new Error('Cannot find item in form structure');
        }
        
        const updateResponse = await gapi.client.request({
            path: `https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`,
            method: 'POST',
            body: {
                requests: [{
                    updateItem: {
                        item: {
                            itemId: questionItemId,
                            questionItem: {
                                question: {
                                    required: true,
                                    choiceQuestion: {
                                        type: 'RADIO',
                                        options: choices
                                    }
                                }
                            }
                        },
                        location: {
                            index: form.items.indexOf(currentItem)
                        },
                        updateMask: 'questionItem.question.choiceQuestion.options'
                    }
                }],
                includeFormInResponse: false
            }
        });
        
        console.log('[FORM] Update response:', updateResponse);
        console.log(`[FORM] ? Ðã c?p nh?t ${choices.length} l?a ch?n cho câu h?i`);
    } catch (e) {
        console.error('[FORM] L?i c?p nh?t form choices:', e);
        updateStatus(`?? L?i c?p nh?t Form: ${e.result?.error?.message || e.message}`);
        // Don't throw - form still usable, just needs manual update
    }
}

async function apiSetFormScriptProperty(formId, recipientEmail) {
    // S? d?ng Apps Script API d? set Script Properties cho Form
    // C?n Script ID t? Form, nhung không có API tr?c ti?p
    // Gi?i pháp: Ghi email vào Sheet Config thay vì Form Script Properties
    console.log(`[CONFIG] S? ghi email ${recipientEmail} vào Sheet config`);
}

async function getUserEmail() {
    try {
        const token = gapi.client.getToken();
        if (!token) return null;
        
        const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
            headers: { Authorization: `Bearer ${token.access_token}` }
        });
        const userInfo = await response.json();
        return userInfo.email || null;
    } catch (e) {
        console.error('[EMAIL] Không th? l?y email:', e);
        return null;
    }
}

async function apiWriteUserEmailToConfig(spreadsheetId, email) {
    // Ghi email vào cell H6 c?a sheet C?u Hình
    return gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'C?u Hình!I6',
        valueInputOption: 'RAW',
        resource: { values: [[email]] }
    });
}

async function apiCreateAssignmentSheets(spreadsheetId, assignments) {
    try {
        // 1. Get template sheet "(M?u) B?ng nh?n xét"
        const sheetData = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: spreadsheetId
        });
        
        const sheets = sheetData.result.sheets;
        const templateSheet = sheets.find(s => s.properties.title === '(M?u) B?ng nh?n xét');
        
        if (!templateSheet) {
            console.warn('[SHEETS] Không tìm th?y sheet template');
            return;
        }
        
        const templateSheetId = templateSheet.properties.sheetId;
        
        // 2. Duplicate template for each assignment
        // [FIX] Tên sheet du?c t?o theo format "B?ng nh?n xét (Tên bài t?p)" d? kh?p v?i config
        const requests = [];
        for (const assignment of assignments) {
            const sheetName = `B?ng nh?n xét (${assignment.name})`;
            requests.push({
                duplicateSheet: {
                    sourceSheetId: templateSheetId,
                    newSheetName: sheetName,
                    insertSheetIndex: sheets.length
                }
            });
            console.log(`[SHEETS] T?o sheet: "${sheetName}"`);
        }
        
        await gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheetId,
            resource: { requests: requests }
        });
        
        console.log(`[SHEETS] ? Ðã t?o ${assignments.length} sheet t? template`);
        
    } catch (error) {
        console.error('[SHEETS] L?i t?o assignment sheets:', error);
        updateStatus(`?? L?i t?o sheet: ${error.result?.error?.message || error.message}`);
    }
}

async function apiWriteAssignmentsToConfig(spreadsheetId, assignments) {
    if (!assignments || assignments.length === 0) {
        console.log('[CONFIG] Không có assignment nào d? ghi.');
        return;
    }
    
    // 1. Ð?c d? li?u hi?n có t? hàng 3 tr? di (hàng 2 dành riêng cho Ði?m danh)
    let existingAssignments = [];
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'C?u Hình!A3:F1000'
        });
        existingAssignments = response.result.values || [];
    } catch (e) {
        console.log('[CONFIG] Chua có d? li?u cu, t?o m?i.');
    }
    
    // 2. T?o map tên bài t?p hi?n có d? check trùng
    const existingNames = new Set(existingAssignments.map(row => row[0])); // C?t A
    
    // 3. HÀNG 2: Luôn là "Ði?m danh"
    const attendanceRow = [
        'Ði?m danh',                     // A: Tên bài t?p
        '',                              // B: L?ch h?c (b? tr?ng - user t? di?n)
        '',                              // C: Th?i gian m? (không có cho Ði?m danh)
        '',                              // D: Deadline (không có cho Ði?m danh)
        true,                            // E: T? d?ng d?n (TRUE - d?n sheet di?m danh tru?c gi? h?c)
        'Ði?m danh'                      // F: Tên sheet
    ];
    
    // 4. HÀNG 3+: Gi? l?i d? li?u cu + thêm assignments m?i
    const assignmentRows = [];
    
    // 4.1. Gi? l?i d? li?u cu
    existingAssignments.forEach(row => {
        // Ð?m b?o có d? 6 c?t
        while (row.length < 6) row.push('');
        assignmentRows.push(row);
    });
    
    // 4.2. Thêm assignments m?i (chua t?n t?i)
    assignments.forEach(a => {
        const assignmentName = a.name;
        if (!existingNames.has(assignmentName) && assignmentName !== 'Ði?m danh') {
            assignmentRows.push([
                assignmentName,                      // A: Tên bài t?p
                '',                                  // B: L?ch h?c (b? tr?ng - user t? di?n)
                '',                                  // C: Th?i gian m? (b? tr?ng)
                '',                                  // D: Deadline (b? tr?ng)
                false,                               // E: T? d?ng d?n (FALSE - user t? b?t n?u c?n)
                `B?ng nh?n xét (${assignmentName})`, // F: Tên sheet
                a.folderId || ''                     // G: Folder ID (M?I - d? Library d?c)
            ]);
            console.log(`[CONFIG] Thêm assignment m?i: ${assignmentName} (Folder: ${a.folderId})`);
        }
    });
    
    console.log(`[CONFIG] Hàng 2: Ði?m danh`);
    console.log(`[CONFIG] Hàng 3+: ${assignmentRows.length} bài t?p`);
    
    // 5. Ghi hàng 2 (Ði?m danh)
    await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'C?u Hình!A2:G2',
        valueInputOption: 'USER_ENTERED',
        resource: { values: [attendanceRow] }
    });
    
    // 6. Ghi các assignments vào hàng 3-10 (gi? nguyên format checkbox)
    // Template có s?n 8 hàng tr?ng (3-10) v?i checkbox ? c?t E
    const maxTemplateRows = 8; // Hàng 3-10
    const rowsToWrite = assignmentRows.slice(0, maxTemplateRows);
    
    if (rowsToWrite.length > 0) {
        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `C?u Hình!A3:G${2 + rowsToWrite.length}`,
            valueInputOption: 'USER_ENTERED',
            resource: { values: rowsToWrite }
        });
    }
    
    // 7. Xóa n?i dung các hàng template còn tr?ng (gi? format)
    if (rowsToWrite.length < maxTemplateRows) {
        const emptyStartRow = 3 + rowsToWrite.length;
        const emptyEndRow = 10;
        await gapi.client.sheets.spreadsheets.values.clear({
            spreadsheetId,
            range: `C?u Hình!A${emptyStartRow}:G${emptyEndRow}`
        });
    }
    
    // 8. N?u có nhi?u hon 8 assignments, append thêm (vu?t quá template)
    if (assignmentRows.length > maxTemplateRows) {
        const extraRows = assignmentRows.slice(maxTemplateRows);
        await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'C?u Hình!A11:G11',
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: { values: extraRows }
        });
        console.log(`[CONFIG] ? Có ${extraRows.length} bài t?p vu?t quá template (hàng 11+)`);
    }
    
    console.log(`[CONFIG] ? Ðã c?p nh?t b?ng config: Hàng 2 (Ði?m danh) + ${assignmentRows.length} hàng assignments`);
    
    // T?o các sheet bài t?p t? template "(M?u) B?ng nh?n xét"
    console.log('[SHEETS] B?t d?u t?o sheets bài t?p t? template...');
    await apiCreateAssignmentSheets(spreadsheetId, assignments);
}

/**
 * T?o các sheet bài t?p b?ng cách duplicate sheet template
 * @param {string} spreadsheetId - ID c?a spreadsheet
 * @param {Array} assignments - Danh sách bài t?p [{name: ..., folderId: ...}]
 */
async function apiCreateAssignmentSheets(spreadsheetId, assignments) {
    try {
        // 1. L?y thông tin spreadsheet d? tìm template sheet
        const spreadsheet = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId
        }).then(res => res.result);
        
        // 2. Tìm sheet có tên "(M?u) B?ng nh?n xét"
        const templateSheet = spreadsheet.sheets.find(s => 
            s.properties.title === '(M?u) B?ng nh?n xét'
        );
        
        if (!templateSheet) {
            console.warn('[SHEETS] Không tìm th?y sheet template "(M?u) B?ng nh?n xét". B? qua t?o sheets.');
            return;
        }
        
        const templateSheetId = templateSheet.properties.sheetId;
        const isTemplateHidden = templateSheet.properties.hidden || false;
        console.log(`[SHEETS] Tìm th?y template sheet ID: ${templateSheetId}, hidden: ${isTemplateHidden}`);
        
        // 3. Ki?m tra sheets hi?n có d? ch? t?o nh?ng sheet m?i
        const existingSheetNames = new Set(
            spreadsheet.sheets.map(s => s.properties.title)
        );
        
        const newAssignments = assignments.filter(assignment => {
            const sheetName = `B?ng nh?n xét (${assignment.name})`;
            return !existingSheetNames.has(sheetName);
        });
        
        if (newAssignments.length === 0) {
            console.log('[SHEETS] T?t c? sheets bài t?p dã t?n t?i, b? qua.');
            return;
        }
        
        console.log(`[SHEETS] C?n t?o ${newAssignments.length}/${assignments.length} sheets m?i`);
        
        // 4. Duplicate template cho m?i assignment m?i
        const requests = [];
        newAssignments.forEach((assignment, index) => {
            const newSheetName = `B?ng nh?n xét (${assignment.name})`;
            
            // Request duplicate
            requests.push({
                duplicateSheet: {
                    sourceSheetId: templateSheetId,
                    insertSheetIndex: spreadsheet.sheets.length + index,
                    newSheetName: newSheetName
                }
            });
        });
        
        // 5. Th?c hi?n batch update d? duplicate
        const batchResponse = await gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            resource: { requests }
        }).then(res => res.result);
        
        // 6. N?u template b? ?n, ?n các sheets m?i t?o
        if (isTemplateHidden && batchResponse.replies) {
            const hideRequests = batchResponse.replies
                .filter(reply => reply.duplicateSheet)
                .map(reply => ({
                    updateSheetProperties: {
                        properties: {
                            sheetId: reply.duplicateSheet.properties.sheetId,
                            hidden: true
                        },
                        fields: 'hidden'
                    }
                }));
            
            if (hideRequests.length > 0) {
                await gapi.client.sheets.spreadsheets.batchUpdate({
                    spreadsheetId,
                    resource: { requests: hideRequests }
                });
                console.log(`[SHEETS] ? Ðã ?n ${hideRequests.length} sheets theo template`);
            }
        }
        
        console.log(`[SHEETS] ? Ðã t?o ${newAssignments.length} sheets bài t?p t? template`);
    } catch (e) {
        console.error('[SHEETS] L?i khi t?o sheets t? template:', e);
        // Không throw d? không làm gián do?n quá trình t?o l?p
    }
}

function clearClassForm() {
    classModalTitle.textContent = "T?o L?p M?i";
    formClassId.value = "";
    formClassName.value = "";
    assignmentTypesContainer.innerHTML = '';

    deleteClassProfileButton.style.display = 'none';
}

function deleteClassProfile() {
    const idToDelete = formClassId.value;
    if (!idToDelete) return;
    
    const profile = classProfiles.find(p => p.id === idToDelete);
    if (!profile) return;

    if (!confirm(`Xác nh?n xóa l?p "${profile.name}"?\n\nS? xóa:\n- Folder l?p\n- Form n?p bài\n- Sheet nh?n xét\n- Script projects\n- T?t c? thu m?c bài t?p\n\nHành d?ng này KHÔNG TH? hoàn tác!`)) {
        return;
    }

    // Delete ALL files in folder (including form, sheet, scripts) then folder
    deleteClassFolderFromDrive(idToDelete, profile).catch(err => {
        console.error('L?i khi xóa folder trên Drive:', err);
        updateStatus(`? Xóa l?p trên Drive th?t b?i. B?n có th? xóa th? công.`, true);
    });

    classProfiles = classProfiles.filter(p => p.id !== idToDelete);
    localStorage.setItem('classProfiles', JSON.stringify(classProfiles));
    updateStatus(`? Ðã xóa l?p "${profile.name}"`);

    const activeId = localStorage.getItem('activeClassProfileId');
    if (activeId === idToDelete) {
        localStorage.removeItem('activeClassProfileId');
        Object.keys(localStorage).filter(key => key.startsWith(`submissionStatus_${idToDelete}_`)).forEach(key => localStorage.removeItem(key));
        checkSystemReady();
    }
    loadClassProfiles();
    clearClassForm();
    classFormModal.setAttribute('aria-hidden', 'true');
    editClassButton.disabled = true;
    updateQuickActionsState();
}

async function deleteClassFolderFromDrive(folderId, profile) {
    try {
        // Step 1: Delete form's bound script first (if we know form ID)
        if (profile && profile.formId) {
            try {
                const scriptSearch = await gapi.client.drive.files.list({
                    q: `'${profile.formId}' in parents and mimeType='application/vnd.google-apps.script' and trashed=false`,
                    fields: 'files(id, name)'
                });
                
                const scripts = scriptSearch.result.files || [];
                for (const script of scripts) {
                    await gapi.client.drive.files.update({
                        fileId: script.id,
                        resource: { trashed: true }
                    });
                }
            } catch (err) {
                console.warn('Could not delete form scripts:', err);
            }
        }
        
        // Step 2: Move form to trash
        if (profile && profile.formId) {
            try {
                await gapi.client.drive.files.update({
                    fileId: profile.formId,
                    resource: { trashed: true }
                });
            } catch (err) {
                console.warn('Could not trash form:', err);
            }
        }
        
        // Step 3: Move sheet to trash
        if (profile && profile.sheetId) {
            try {
                await gapi.client.drive.files.update({
                    fileId: profile.sheetId,
                    resource: { trashed: true }
                });
            } catch (err) {
                console.warn('Could not trash sheet:', err);
            }
        }
        
        // Step 4: List and delete all remaining files in folder
        try {
            const filesInFolder = await gapi.client.drive.files.list({
                q: `'${folderId}' in parents and trashed=false`,
                fields: 'files(id, name, mimeType)',
                pageSize: 100
            });
            
            const files = filesInFolder.result.files || [];
            
            for (const file of files) {
                try {
                    // Move subfolders and files to trash
                    if (file.mimeType === 'application/vnd.google-apps.folder') {
                        await deleteClassFolderFromDrive(file.id, null);
                    } else {
                        await gapi.client.drive.files.update({
                            fileId: file.id,
                            resource: { trashed: true }
                        });
                    }
                } catch (err) {
                    console.warn(`Could not delete file ${file.name}:`, err);
                }
            }
        } catch (err) {
            console.warn('Could not list folder contents:', err);
        }
        
        // Step 5: Finally move the folder itself to trash
        await gapi.client.drive.files.update({
            fileId: folderId,
            resource: { trashed: true }
        });
        
    } catch (error) {
        console.error('Drive deletion error:', error);
        throw error;
    }
}

function updateStatus(message, isError = false) {
    console.log(message);
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry mb-1';
    logEntry.innerHTML = `<span class="${isError ? 'text-error' : 'text-on-surface'}">${message}</span>`;
    statusLog.appendChild(logEntry);
    statusLog.scrollTop = statusLog.scrollHeight;
}

/**
 * X? lý chu?t ph?i vào nút Form
 * Ki?m tra form dã xu?t b?n chua
 * - N?u dã xu?t b?n ? copy link rút g?n
 * - N?u chua xu?t b?n ? m? form editor
 */
async function handleFormContextMenu(profile) {
    if (!profile || !profile.formId) {
        updateStatus("? Không tìm th?y Form ID.", true);
        return;
    }
    
    try {
        updateStatus("? Ðang ki?m tra tr?ng thái Form...");
        
        // G?i Forms API d? l?y thông tin form
        const formResponse = await gapi.client.request({
            path: `https://forms.googleapis.com/v1/forms/${profile.formId}`,
            method: 'GET'
        });
        
        const form = formResponse.result;
        
        // Ki?m tra responderUri - n?u có thì form dã published
        if (form.responderUri) {
            // Form dã published - l?y link viewform
            const formShortLink = `https://docs.google.com/forms/d/${profile.formId}/viewform`;
            
            // C?p nh?t profile
            profile.formShortLink = formShortLink;
            profile.formLink = formShortLink;
            
            // Luu vào localStorage
            const profileIndex = classProfiles.findIndex(p => p.id === profile.id);
            if (profileIndex > -1) {
                classProfiles[profileIndex] = profile;
                localStorage.setItem('classProfiles', JSON.stringify(classProfiles));
            }
            
            // Copy link vào clipboard
            navigator.clipboard.writeText(formShortLink).then(() => {
                updateStatus(`? Ðã copy link Form rút g?n: ${formShortLink}`);
            }).catch(err => {
                console.error('L?i copy:', err);
                updateStatus("? Không th? copy link.", true);
            });
            
        } else {
            // Form chua published - m? editor
            updateStatus("? Form chua xu?t b?n, dang m? editor...");
            const formEditLink = `https://docs.google.com/forms/d/${profile.formId}/edit`;
            window.open(formEditLink, '_blank');
            updateStatus("?? Vui lòng publish form r?i chu?t ph?i l?i d? copy link");
        }
        
    } catch (err) {
        console.error('L?i ki?m tra form:', err);
        updateStatus(`? L?i: ${err.message || 'Không th? ki?m tra form'}`, true);
        // Fallback: m? editor
        const formEditLink = `https://docs.google.com/forms/d/${profile.formId}/edit`;
        window.open(formEditLink, '_blank');
    }
}

/**
 * Ki?m tra xem form dã xu?t b?n chua
 * N?u dã xu?t b?n ? l?y link viewform rút g?n
 * N?u chua xu?t b?n ? hu?ng d?n user xu?t b?n
 */
async function checkFormPublishedAndSaveLink(profile) {
    if (!profile || !profile.formId) {
        updateStatus("? Không tìm th?y Form ID.", true);
        return;
    }
    
    try {
        updateStatus("? Ðang ki?m tra tr?ng thái Form...");
        
        // G?i Forms API d? l?y thông tin form
        const formResponse = await gapi.client.request({
            path: `https://forms.googleapis.com/v1/forms/${profile.formId}`,
            method: 'GET'
        });
        
        const form = formResponse.result;
        
        // Ki?m tra responderUri - n?u có thì form dã published
        if (form.responderUri) {
            // Form dã published - l?y link viewform
            const formShortLink = `https://docs.google.com/forms/d/${profile.formId}/viewform`;
            
            // C?p nh?t profile
            profile.formShortLink = formShortLink;
            profile.formLink = formShortLink; // Thay edit link b?ng short link
            
            // Luu vào localStorage
            const profileIndex = classProfiles.findIndex(p => p.id === profile.id);
            if (profileIndex > -1) {
                classProfiles[profileIndex] = profile;
                localStorage.setItem('classProfiles', JSON.stringify(classProfiles));
            }
            
            updateStatus("? Form dã xu?t b?n! Link dã du?c luu.");
            updateStatus(`?? Link rút g?n: ${formShortLink}`);
            
            // Copy link vào clipboard t? d?ng
            navigator.clipboard.writeText(formShortLink).then(() => {
                updateStatus("? Link dã du?c copy vào clipboard");
            });
            
        } else {
            // Form chua published
            updateStatus("? Form chua du?c xu?t b?n!", true);
            updateStatus("?? Hãy:");
            updateStatus("   1. M? form: " + `https://docs.google.com/forms/d/${profile.formId}/edit`);
            updateStatus("   2. Click nút 'Send' ? góc trên bên ph?i");
            updateStatus("   3. Copy link 'Responder link'");
            updateStatus("   4. R?i click 'Ki?m tra' l?i");
        }
        
    } catch (err) {
        console.error('L?i ki?m tra form:', err);
        updateStatus(`? L?i: ${err.message || 'Không th? ki?m tra form'}`, true);
    }
}

function checkSystemReady() {
    if (!gapiInited || !gisInited) return;
    const token = gapi.client.getToken();
    if (token) {
        authButton.style.display = 'none';
        signoutButton.style.display = 'block';
        processButton.style.display = 'block';

        // [FIX] Show list, hide placeholder
        submissionStatusList.classList.remove('hidden');
        submissionStatusList.style.display = ''; // Xóa inline style display:none
        submissionStatusPlaceholder.style.setProperty('display', 'none', 'important');
        submissionStatusPlaceholder.classList.add('hidden'); // Ð?m b?o hoàn toàn ?n

        // Load submission status from cache when logged in
        loadSubmissionStatusFromCache(true);

        // Auto-scan classes from Drive after login (silent mode)
        if (inpRootFolderId && inpRootFolderId.value.trim()) {
            scanAndSyncClasses(true).catch(err => {
                console.error("[AUTO-SCAN] L?i khi quét t? d?ng:", err);
            });
        }

        // [FIX] Update assignment UI after login (to show buttons if class selected)
        updateAssignmentSelectionUI();

        if (!classProfileSelect.value) {
            processButton.disabled = true;
            processButton.querySelector('span').textContent = "Vui lòng ch?n L?p";
        } else if (!activeAssignment) {
            processButton.disabled = true;
            processButton.querySelector('span').textContent = "Ch?n lo?i bài t?p";
        } else {
            if (processButton.querySelector('span').textContent !== "Ðang x? lý...") {
                processButton.disabled = false;
                processButton.querySelector('span').textContent = "B?t d?u X? lý";
            }
        }
    } else {
        authButton.style.display = 'block';
        authButton.disabled = false;
        authButton.querySelector('span').textContent = "Ðang nh?p";
        signoutButton.style.display = 'none';
        processButton.style.display = 'block';
        processButton.disabled = true;

        // [FIX] Hide list, show placeholder
        submissionStatusList.style.display = 'none';
        submissionStatusList.classList.add('hidden'); // Ð?m b?o hoàn toàn ?n
        submissionStatusPlaceholder.style.display = 'block';
        submissionStatusPlaceholder.classList.remove('hidden'); // Hi?n th? placeholder

        if (!classProfileSelect.value) processButton.querySelector('span').textContent = "Vui lòng ch?n L?p";
        else processButton.querySelector('span').textContent = "Vui lòng Ðang nh?p";
    }
}

function gapiLoaded() {
    gapi.load('client', async () => {
        try {
            await gapi.client.init({ apiKey: API_KEY, discoveryDocs: DISCOVERY_DOCS });
            gapiInited = true;
            updateStatus("? GAPI s?n sàng.");
            checkInitStatus();
        } catch (error) { updateStatus(`? L?i GAPI init: ${error.message}. Ki?m tra API Key.`, true); console.error(error); }
    });
}

function gisLoaded() {
    try {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: async (tokenResponse) => {
                if (tokenResponse.error) {
                    updateStatus(`? L?i Token: ${tokenResponse.error_description || tokenResponse.error}`, true);
                } else {
                    // Critical fix: Set the token for the GAPI client
                    gapi.client.setToken(tokenResponse);
                    updateStatus("? Ðã dang nh?p.");
                    
                    // Ð?i 500ms d? token du?c apply hoàn toàn
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // Luôn luu email hint m?i l?n dang nh?p thành công
                    await fetchAndSaveEmailHint();
                    
                    const savedAutoRefreshState = localStorage.getItem('autoRefreshState');
                    if (savedAutoRefreshState === 'on') startAutoRefresh();
                }
                // Always update UI after attempting to get a token
                checkSystemReady();
            },
            error_callback: (error) => {
                updateStatus(`? L?i yêu c?u token: ${error.type} - ${error.error}`, true);
                checkSystemReady();
            }
        });
        gisInited = true;
        updateStatus("? GIS s?n sàng.");
        
        // Check if returning from OAuth redirect
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('code') || urlParams.has('state')) {
            updateStatus("? X? lý OAuth redirect...");
            // Clean URL without reloading
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        checkInitStatus();
    } catch (error) { updateStatus(`? L?i GIS init: ${error.message}. Ki?m tra Client ID.`, true); console.error(error); }
}

async function fetchAndSaveEmailHint() {
    try {
        const token = gapi.client.getToken();
        if (!token || !token.access_token) {
            console.warn('[EMAIL] Chua có access token');
            return;
        }
        
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { 'Authorization': `Bearer ${token.access_token}` }
        });
        
        if (!userInfoResponse.ok) {
            const errorText = await userInfoResponse.text();
            throw new Error(`HTTP ${userInfoResponse.status}: ${errorText}`);
        }
        
        const userInfo = await userInfoResponse.json();
        
        if (userInfo.email) {
            LOGIN_HINT = userInfo.email;
            localStorage.setItem('login_hint_email', userInfo.email);
            console.log(`[EMAIL] ? Ðã luu: ${userInfo.email}`);
            updateStatus(`? Ðã luu g?i ý dang nh?p: ${userInfo.email}`);
        } else {
            console.warn('[EMAIL] Không tìm th?y email trong userInfo:', userInfo);
        }
    } catch (error) { 
        console.error('[EMAIL] L?i:', error);
        updateStatus(`? Không th? luu email hint: ${error.message}`, true); 
    }
}

function checkInitStatus() {
    checkSystemReady();
    if (gapiInited && gisInited) {
        // Start auto refresh now that gapi is ready
        startAutoRefresh();
        
        if (LOGIN_HINT) {
            updateStatus("? Ðang nh?p t? d?ng...");
            // Try silent login immediately
            tokenClient.requestAccessToken({
                prompt: 'none',
                hint: LOGIN_HINT
            });
        } else {
            updateStatus("? S?n sàng. Vui lòng dang nh?p.");
        }
    }
}

function handleAuthClick() {
    if (tokenClient) tokenClient.requestAccessToken({ prompt: '' });
    else updateStatus("? L?i: H? th?ng Ðang nh?p (GIS) chua s?n sàng.", true);
}

function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        LOGIN_HINT = null;
        localStorage.removeItem('login_hint_email');
        updateStatus("? Ðã dang xu?t & xóa g?i ý.");
        authButton.style.display = 'block';
        signoutButton.style.display = 'none';
        processButton.disabled = true;
        submissionStatusList.classList.add('hidden');
        submissionStatusPlaceholder.classList.remove('hidden');
    }
}

async function processFormFileUploads(classFolderId, sheetId) {
    try {
        // 1. Find "File responses" folder
        const { folders } = await listFilesInFolder(classFolderId);
        const fileResponsesFolder = folders.find(f => 
            f.name.includes('File responses') || 
            f.name.includes('N?p bài t?p v? nhà') ||
            f.name.includes('responses')
        );
        
        if (!fileResponsesFolder) {
            updateStatus('   ?? Không tìm th?y folder File responses');
            return;
        }
        
        updateStatus(`   ? Tìm th?y folder: ${fileResponsesFolder.name}`);
        
        // 2. Get form responses from Sheet
        const responsesData = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Form Responses 1!A2:Z1000' // Adjust range as needed
        });
        
        const responses = responsesData.result.values || [];
        if (responses.length === 0) {
            updateStatus('   ?? Chua có responses nào trong sheet');
            return;
        }
        
        // 3. Find column indices (assuming: Timestamp, Email, Name, Assignment Type, File Upload)
        const headerData = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Form Responses 1!A1:Z1'
        });
        
        const headers = headerData.result.values?.[0] || [];
        const nameColIdx = headers.findIndex(h => h && (
            h.toLowerCase().includes('tên h?c sinh') || 
            h.toLowerCase().includes('h? và tên') ||
            h.toLowerCase().includes('h? tên')
        ));
        const assignmentColIdx = headers.findIndex(h => h && (
            h.toLowerCase().includes('ch?n bài') || 
            h.toLowerCase().includes('lo?i bài') ||
            h.toLowerCase().includes('bài t?p')
        ));
        const fileColIdx = headers.findIndex(h => h && (
            h.toLowerCase().includes('n?p bài') ||
            h.toLowerCase().includes('t?i lên') ||
            h.toLowerCase().includes('file')
        ));
        
        if (nameColIdx === -1 || assignmentColIdx === -1 || fileColIdx === -1) {
            updateStatus('   ?? Không tìm th?y c?t c?n thi?t trong sheet');
            return;
        }
        
        updateStatus(`   ? X? lý ${responses.length} responses...`);
        
        // 4. Get all files from file responses folder
        const fileResponsesList = await listFilesInFolder(fileResponsesFolder.id);
        const uploadedFiles = fileResponsesList.files || [];
        
        // 5. Process each response
        let movedCount = 0;
        for (const response of responses) {
            const studentName = response[nameColIdx];
            const assignmentType = response[assignmentColIdx];
            const fileUrls = response[fileColIdx];
            
            if (!studentName || !assignmentType || !fileUrls) continue;
            
            // Find student's assignment folder
            const profile = classProfiles.find(p => p.id === classFolderId);
            const assignment = profile?.assignments?.find(a => a.name === assignmentType);
            
            if (!assignment) continue;
            
            // Find or create student folder
            const studentFolderName = studentName.trim();
            const { folders: assignmentSubfolders } = await listFilesInFolder(assignment.folderId);
            let studentFolder = assignmentSubfolders.find(f => f.name === studentFolderName);
            
            if (!studentFolder) {
                studentFolder = await apiCreateFolder(studentFolderName, assignment.folderId);
                updateStatus(`   ? T?o folder: ${studentFolderName}`);
            }
            
            // Move files from file responses to student folder
            const fileUrlsList = fileUrls.split(',').map(u => u.trim());
            for (const fileUrl of fileUrlsList) {
                // Extract file ID from URL
                const fileIdMatch = fileUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
                if (!fileIdMatch) continue;
                
                const fileId = fileIdMatch[1];
                
                try {
                    // Move file to student folder
                    await gapi.client.drive.files.update({
                        fileId: fileId,
                        addParents: studentFolder.id,
                        removeParents: fileResponsesFolder.id
                    });
                    movedCount++;
                } catch (err) {
                    console.error(`L?i move file ${fileId}:`, err);
                }
            }
        }
        
        updateStatus(`   ? Ðã phân lo?i ${movedCount} file vào folder bài t?p`);
        
    } catch (error) {
        console.error('L?i processFormFileUploads:', error);
        updateStatus(`   ?? L?i phân lo?i file: ${error.message}`);
    }
}

async function handleProcessClick() {
    if (!activeAssignment) { updateStatus("? L?I: B?n chua ch?n lo?i bài t?p d? x? lý.", true); return; }
    const parentFolderIdToProcess = activeAssignment.folderId;
    const folderTypeName = activeAssignment.name;
    updateStatus(`? B?t d?u x? lý l?p [${folderTypeName}]...`);
    processButton.disabled = true;
    processButton.querySelector('span').textContent = "Ðang x? lý...";

    try {
        // Step 0: Process file uploads from Form responses folder
        const selectedProfile = classProfiles.find(p => p.id === classProfileSelectValue.value);
        if (selectedProfile && selectedProfile.sheetId && selectedProfile.formId) {
            updateStatus("? Ðang phân lo?i file uploads t? Form...");
            await processFormFileUploads(selectedProfile.id, selectedProfile.sheetId);
        }
        
        updateStatus("? Ðang quét thu m?c con...");
        const allFoldersFromDrive = await findAllSubfolders([{ id: parentFolderIdToProcess, name: 'root' }]);
        
        // Filter out "File responses" folder (case-insensitive)
        const filteredFolders = allFoldersFromDrive.filter(folder => 
            !folder.name.toLowerCase().includes('file responses')
        );
        
        updateStatus(`? Quét xong: ${filteredFolders.length} thu m?c con (b? qua ${allFoldersFromDrive.length - filteredFolders.length} folder File responses).`);

        const key = getStatusCacheKey();
        const cachedData = localStorage.getItem(key);
        const masterStatusList = cachedData ? JSON.parse(cachedData) : [];
        const statusMap = new Map(masterStatusList.map(item => [item.name, item]));

        const syncedStatusList = [];
        filteredFolders.forEach(folder => {
            const isProcessed = folder.name.includes('[Ðã x? lý]');
            const isOverdue = !isProcessed && folder.name.toLowerCase().includes('quá h?n');
            const cleanName = sanitizeFolderDisplayName(folder.name);
            const existingItem = statusMap.get(cleanName);
            let currentStatus;

            if (isProcessed) currentStatus = 'processed';
            else if (isOverdue) currentStatus = 'overdue';
            else if (existingItem && existingItem.status === 'error' && !isProcessed) currentStatus = 'submitted';
            else currentStatus = 'submitted';

            syncedStatusList.push({ id: folder.id, name: cleanName, status: currentStatus });
        });

        updateStatus("? Ð?ng b? hóa danh sách...");
        syncedStatusList.sort((a, b) => a.name.localeCompare(b.name));
        saveSubmissionStatusToCache(syncedStatusList);
        displaySubmissionStatus(syncedStatusList);

        const foldersToActuallyProcess = filteredFolders.filter(f => !f.name.includes('[Ðã x? lý]') && !f.name.toLowerCase().includes('quá h?n'));
        updateStatus(`? ${foldersToActuallyProcess.length} thu m?c m?i c?n x? lý.`);

        if (foldersToActuallyProcess.length > 0) {
            await processFoldersConcurrently(foldersToActuallyProcess, folderTypeName);
        } else {
            updateStatus("? Không có thu m?c m?i. Hoàn t?t.");
            processButton.disabled = false;
            processButton.querySelector('span').textContent = "B?t d?u X? lý";
        }
    } catch (error) {
        updateStatus(`? L?i trong quá trình x? lý chính: ${error.message}`, true);
        processButton.disabled = false;
        processButton.querySelector('span').textContent = "B?t d?u X? lý";
    }
}

// Helper: L?y class màu d?a trên status và current design/theme
function getStatusClasses(status) {
    const currentDesign = localStorage.getItem('design-system') || 'material3';
    
    // Liquid Glass: CSS handles all styling via data-status selector
    // Material 3: Apply Tailwind classes
    if (currentDesign === 'liquid-glass') {
        return []; // CSS handles styling via data-status attribute
    }
    
    switch (status) {
        case 'processed':
            return ['bg-primary-container', 'text-on-primary-container', 'dark:bg-primary-container/40', 'dark:text-primary'];
        case 'overdue':
            return ['bg-orange-100', 'text-orange-900', 'dark:bg-orange-900/30', 'dark:text-orange-200'];
        case 'processing':
            return ['bg-secondary-container', 'text-on-secondary-container', 'animate-pulse'];
        case 'error':
            return ['bg-red-100', 'text-red-900', 'dark:bg-red-900/30', 'dark:text-red-200'];
        default:
            return ['bg-surface-container', 'text-on-surface'];
    }
}

// Helper: L?y t?t c? class có th? có d? remove
function getAllStatusClasses() {
    return [
        'bg-primary-container', 'text-on-primary-container', 'dark:bg-primary-container/40', 'dark:text-primary',
        'bg-orange-100', 'text-orange-900', 'dark:bg-orange-900/30', 'dark:text-orange-200',
        'bg-secondary-container', 'text-on-secondary-container', 'animate-pulse',
        'bg-red-100', 'text-red-900', 'dark:bg-red-900/30', 'dark:text-red-200',
        'bg-surface-container', 'text-on-surface'
    ];
}

function displaySubmissionStatus(statusList) {
    submissionStatusList.innerHTML = '';
    if (!statusList || statusList.length === 0) {
        submissionStatusList.innerHTML = '<div class="text-outline">Chua có d? li?u cho l?p này. B?t d?u x? lý d? quét...</div>';
        return;
    }

    const list = document.createElement('ul');
    list.className = 'space-y-2';

    statusList.forEach(itemData => {
        const item = document.createElement('li');
        const sanitizedName = itemData.name.replace(/[^a-zA-Z0-9]/g, '-');
        item.id = `status-${sanitizedName}`;
        item.dataset.folderId = itemData.id;
        item.dataset.folderName = itemData.name;
        item.dataset.status = itemData.status;
        item.className = 'flex items-center justify-between py-1 px-2 rounded-xl smooth-transition';

        let statusText = '';
        let extraItemClass = '';

        switch (itemData.status) {
            case 'processed': 
                statusText = 'Ðã x? lý'; 
                extraItemClass = 'submission-item-reprocessable'; 
                break;
            case 'overdue': 
                statusText = 'Quá h?n'; 
                extraItemClass = 'submission-item-reprocessable'; 
                break;
            case 'processing': 
                statusText = 'Ðang x? lý...'; 
                break;
            case 'error': 
                statusText = 'L?i'; 
                break;
            default: 
                statusText = 'Chua x? lý'; 
                break;
        }

        item.setAttribute('draggable', 'true');
        item.dataset.selected = "false";
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        
        // Áp d?ng class màu d?a trên status
        const statusClasses = getStatusClasses(itemData.status);
        item.classList.add(...statusClasses);
        
        if (extraItemClass) item.classList.add(extraItemClass);
        
        // [NEW] Nút thay d?i tr?ng thái
        const statusBtn = document.createElement('button');
        statusBtn.className = 'm3-button m3-button-icon-text p-1 px-2 text-xs rounded-lg hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-1';
        statusBtn.title = 'Thay d?i tr?ng thái';
        statusBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2-8.83"></path></svg>`;
        statusBtn.onclick = (e) => {
            e.stopPropagation();
            showStatusChangeMenu(statusBtn, itemData.id, itemData.name, itemData.status);
        };
        
        item.innerHTML = `<span class="font-medium text-sm flex-1 truncate pr-2">${itemData.name}</span><div class="flex items-center gap-2"><span class="text-sm font-medium flex-shrink-0">${statusText}</span></div>`;
        item.appendChild(statusBtn);
        list.appendChild(item);
    });
    submissionStatusList.appendChild(list);
    
    // C?p nh?t th?ng kê sau khi render b?ng tình tr?ng
    if (typeof updateSubmissionStats === 'function') {
        updateSubmissionStats();
    }
}

// [NEW] Hi?n th? menu thay d?i tr?ng thái
function showStatusChangeMenu(button, folderId, folderName, currentStatus) {
    // T?o menu popup
    const menu = document.createElement('div');
    menu.className = 'absolute z-50 bg-surface rounded-2xl shadow-lg border border-outline-variant mt-1 min-w-48';
    menu.style.position = 'fixed';
    menu.style.top = (button.getBoundingClientRect().bottom + 5) + 'px';
    menu.style.left = (button.getBoundingClientRect().left) + 'px';
    
    const statusOptions = [
        { value: 'submitted', label: '?? Chua x? lý', icon: '??' },
        { value: 'processed', label: '? Ðã x? lý', icon: '?' },
        { value: 'overdue', label: '? Quá h?n', icon: '?' },
        { value: 'error', label: '? L?i', icon: '?' }
    ];
    
    statusOptions.forEach(option => {
        const item = document.createElement('button');
        item.className = `w-full text-left px-4 py-3 hover:bg-primary-container hover:text-on-primary-container transition-colors flex items-center gap-2 ${currentStatus === option.value ? 'bg-primary/10 text-primary font-semibold' : ''}`;
        item.textContent = option.label;
        item.onclick = async () => {
            await changeSubmissionStatus(folderId, folderName, option.value);
            menu.remove();
        };
        menu.appendChild(item);
    });
    
    document.body.appendChild(menu);
    
    // Ðóng menu khi click bên ngoài
    const closeMenu = () => {
        menu.remove();
        document.removeEventListener('click', closeMenu);
    };
    setTimeout(() => {
        document.addEventListener('click', closeMenu);
    }, 10);
}

// [NEW] Thay d?i tr?ng thái và c?p nh?t local
async function changeSubmissionStatus(folderId, folderName, newStatus) {
    const key = getStatusCacheKey();
    if (!key) return;
    
    try {
        // Bu?c 1: Xác d?nh status prefix cu và m?i
        const statusPrefixMap = {
            'processed': '[Ðã x? lý]',
            'overdue': '[Quá h?n]',
            'submitted': '',  // Không có prefix cho "Chua x? lý"
            'processing': '[Ðang x? lý]',
            'error': '[L?i]'
        };
        
        const oldPrefix = Array.from(Object.entries(statusPrefixMap))
            .find(([_, prefix]) => prefix && folderName.startsWith(prefix))
            ?.[1] || '';
        const newPrefix = statusPrefixMap[newStatus] || '';
        
        // Bu?c 2: Xóa prefix cu kh?i tên folder
        let cleanName = folderName;
        if (oldPrefix) {
            cleanName = folderName.substring(oldPrefix.length).trim();
        }
        
        // Bu?c 3: Thêm prefix m?i (n?u có)
        const newFolderName = newPrefix ? `${newPrefix} ${cleanName}` : cleanName;
        
        // Bu?c 4: Rename folder trên Google Drive
        await gapi.client.drive.files.update({
            fileId: folderId,
            resource: { name: newFolderName }
        });
        
        // Bu?c 5: C?p nh?t localStorage
        let statusList = JSON.parse(localStorage.getItem(key) || '[]');
        const itemIndex = statusList.findIndex(item => item.id === folderId);
        
        if (itemIndex !== -1) {
            const oldStatus = statusList[itemIndex].status;
            statusList[itemIndex].name = cleanName;  // C?p nh?t tên không có prefix
            statusList[itemIndex].status = newStatus;
            localStorage.setItem(key, JSON.stringify(statusList));
        }
        
        // Bu?c 6: C?p nh?t UI
        loadSubmissionStatusFromCache(true);
        updateStatus(`? Ðã c?p nh?t "${folderName}" ? "${newFolderName}"`);
        
    } catch (error) {
        const errorMsg = error?.message || (error?.result?.error?.message || 'L?i không xác d?nh');
        updateStatus(`? L?i khi thay d?i tr?ng thái: ${errorMsg}`, true);
    }
}

// [OLD] Xóa tr?ng thái (gi? l?i nhung d?i tên hàm)
async function deleteSubmissionStatus(folderId, folderName) {
    if (!confirm(`Xóa tr?ng thái c?a "${folderName}" không?\n\n(Folder s? du?c gi? nguyên trên Google Drive)`)) {
        return;
    }
    
    const key = getStatusCacheKey();
    if (!key) return;
    
    let statusList = JSON.parse(localStorage.getItem(key) || '[]');
    statusList = statusList.filter(item => item.id !== folderId);
    localStorage.setItem(key, JSON.stringify(statusList));
    
    // C?p nh?t UI
    loadSubmissionStatusFromCache();
    updateStatus(`? Ðã xóa tr?ng thái c?a "${folderName}" kh?i b?ng`);
}

async function deleteSelectedSubmissions() {
    const selectedItems = document.querySelectorAll('#submission-status-list li[data-selected="true"]');
    if (selectedItems.length === 0) {
        updateStatus('? Vui lòng ch?n h?c sinh d? xóa.');
        return;
    }
    
    const confirmMsg = `B?n có ch?c mu?n xóa ${selectedItems.length} h?c sinh và folder tuong ?ng không?\n\nLuu ý: Folder s? b? xóa vinh vi?n trên Google Drive!`;
    if (!confirm(confirmMsg)) return;
    
    updateStatus(`? Ðang xóa ${selectedItems.length} h?c sinh...`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const item of selectedItems) {
        const folderId = item.dataset.folderId;
        const folderName = item.dataset.folderName;
        
        try {
            // Move folder to trash on Google Drive
            await gapi.client.drive.files.update({
                fileId: folderId,
                resource: { trashed: true }
            });
            
            // Remove from UI
            item.remove();
            successCount++;
            updateStatus(`? Xóa thành công: "${folderName}"`);
        } catch (error) {
            failCount++;
            updateStatus(`? L?i khi xóa "${folderName}": ${error.message}`, true);
        }
    }
    
    // Update cache after deletion
    const key = getStatusCacheKey();
    if (key) {
        const cachedData = localStorage.getItem(key);
        if (cachedData) {
            try {
                let statusList = JSON.parse(cachedData);
                const remainingFolderIds = Array.from(document.querySelectorAll('#submission-status-list li[data-folder-id]'))
                    .map(el => el.dataset.folderId);
                statusList = statusList.filter(item => remainingFolderIds.includes(item.id));
                saveSubmissionStatusToCache(statusList);
            } catch (e) { }
        }
    }
    
    updateStatus(`? Hoàn t?t xóa: ${successCount} thành công, ${failCount} th?t b?i.`);
}

async function processFoldersConcurrently(folders, folderTypeName) {
    const CONCURRENCY_LIMIT = 2;
    let processedCount = 0;

    const processSingleFolderAndUpdateUI = async (folder) => {
        processedCount++;
        const displayName = sanitizeFolderDisplayName(folder.name);
        updateStatus(`? X? lý ${processedCount}/${folders.length}: "${displayName}"`);

        let wasSuccessful = false;
        const sanitizedName = displayName.replace(/[^a-zA-Z0-9]/g, '-');
        const statusElement = document.getElementById(`status-${sanitizedName}`);

        try {
            updateSingleStatusInCache(displayName, 'processing');
            if (statusElement) {
                statusElement.dataset.status = 'processing';
                statusElement.querySelector('span:last-child').textContent = 'Ðang x? lý...';
                // Remove all status classes before adding new ones
                statusElement.classList.remove(...getAllStatusClasses());
                statusElement.classList.add(...getStatusClasses('processing'));
            }

            wasSuccessful = await processSingleFolder(folder.id, folder.name, folderTypeName);

            if (wasSuccessful) {
                await markFolderAsProcessed(folder.id, folder.name);
                updateStatus(`? Hoàn thành: "${folder.name}"`);
                updateSingleStatusInCache(displayName, 'processed');
                if (statusElement) {
                    statusElement.dataset.status = 'processed';
                    statusElement.querySelector('span:last-child').textContent = 'Ðã x? lý';
                    // Remove all status classes before adding new ones
                    statusElement.classList.remove(...getAllStatusClasses());
                    statusElement.classList.add(...getStatusClasses('processed'), 'submission-item-reprocessable');
                }
            } else {
                updateStatus(`? T?m d?ng "${folder.name}" do l?i.`, true);
                updateSingleStatusInCache(displayName, 'error');
                if (statusElement) {
                    statusElement.dataset.status = 'error';
                    statusElement.querySelector('span:last-child').textContent = 'L?i';
                    // Remove all status classes before adding new ones
                    statusElement.classList.remove(...getAllStatusClasses());
                    statusElement.classList.add(...getStatusClasses('error'));
                }
            }
        } catch (error) {
            const errorMessage = error.message || (error.result ? error.result.error.message : 'L?i không xác d?nh');
            updateStatus(`? L?i nghiêm tr?ng khi x? lý "${folder.name}": ${errorMessage}`, true);
        }
    };

    let taskIndex = -1;
    const getNextTask = () => { taskIndex++; return taskIndex < folders.length ? folders[taskIndex] : null; };
    const worker = async () => { while (true) { const task = getNextTask(); if (!task) break; await processSingleFolderAndUpdateUI(task); } };
    const workerPromises = Array(CONCURRENCY_LIMIT).fill(null).map(worker);
    await Promise.all(workerPromises);

    updateStatus("? HOÀN T?T T?T C?!");
    processButton.disabled = false;
    processButton.querySelector('span').textContent = "B?t d?u X? lý";
}

async function processSingleFolder(folderId, folderName, folderTypeName) {
    let hasEncounteredError = false;
    let embeddedFont = null;
    if (!customFontBuffer) {
        try {
            const fontUrl = 'https://cdn.jsdelivr.net/npm/roboto-font@0.1.0/fonts/Roboto/roboto-regular-webfont.ttf';
            customFontBuffer = await fetch(fontUrl).then(res => res.arrayBuffer());
        } catch (fontError) { updateStatus(`  ? L?i t?i font: ${fontError.message}.`, true); }
    }

    const files = await fetchFiles(folderId);
    if (files.length === 0) { updateStatus(`? Không tìm th?y t?p trong "${folderName}".`, true); return false; }

    const gdocIds = files.filter(f => f.mimeType === 'application/vnd.google-apps.document').map(f => f.id);
    const docxFiles = files.filter(f => f.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    const imageFiles = files.filter(f => f.mimeType.startsWith('image/'));
    if (imageFiles.length > 0) {
        const getZaloTimestamp = (name) => {
            if (typeof name !== 'string' || !name.toLowerCase().startsWith('z')) return null;
            const match = name.match(/^z(\d+)/i);
            return match && match[1] ? parseInt(match[1], 10) : null;
        };
        imageFiles.sort((a, b) => {
            const tsA = getZaloTimestamp(a.name);
            const tsB = getZaloTimestamp(b.name);
            const isZaloA = tsA !== null;
            const isZaloB = tsB !== null;
            if (isZaloA && !isZaloB) return -1;
            if (!isZaloA && isZaloB) return 1;
            if (isZaloA && isZaloB) return tsA - tsB;
            return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
        });
    }
    const pdfFiles = files.filter(f => f.mimeType === 'application/pdf');
    let pdfBuffers = [];

    if (gdocIds.length > 0) {
        const gdocPdfs = await convertGDocsToPdf(gdocIds);
        if (gdocPdfs.length < gdocIds.length) hasEncounteredError = true;
        pdfBuffers = pdfBuffers.concat(gdocPdfs);
    }
    if (docxFiles.length > 0) {
        const docxPdfs = await convertDocxToPdf(docxFiles);
        if (docxPdfs.length < docxFiles.length) hasEncounteredError = true;
        pdfBuffers = pdfBuffers.concat(docxPdfs);
    }
    if (imageFiles.length > 0) {
        try {
            const imagePdfBuffer = await createPdfFromImages(imageFiles, folderName);
            pdfBuffers.push(imagePdfBuffer);
        } catch (error) { updateStatus(`? L?i khi g?p ?nh: ${error.message}`, true); hasEncounteredError = true; }
    }
    if (pdfFiles.length > 0) {
        const existingPdfs = await fetchPdfBlobs(pdfFiles.map(f => f.id));
        pdfBuffers = pdfBuffers.concat(existingPdfs);
    }

    if (pdfBuffers.length > 0) {
        try {
            const mergedPdfBytes = await mergePdfs(pdfBuffers, folderName);
            const assignmentName = folderTypeName || "BàiT?p";
            const fileName = `${folderName} (${assignmentName}).pdf`;
            download(mergedPdfBytes, fileName, "application/pdf");
            updateStatus(`? ÐÃ T?I V?: ${fileName}`);
        } catch (error) { updateStatus(`? L?i khi n?i PDF: ${error.message}`, true); hasEncounteredError = true; }
    } else { updateStatus(`? Không có t?p h?p l? trong "${folderName}".`, true); return false; }

    return !hasEncounteredError;
}

async function markFolderAsProcessed(folderId, folderName) {
    try { await gapi.client.drive.files.update({ fileId: folderId, resource: { name: `[Ðã x? lý] ${folderName}` } }); updateStatus(`? Ð?i tên: "[Ðã x? lý] ${folderName}"`); } catch (err) { updateStatus(`? L?i d?i tên: ${err.message}`, true); }
}

async function findAllSubfolders(parentFolders) {
    let allSubfolders = [];
    const folderMimeType = "application/vnd.google-apps.folder";
    for (const parent of parentFolders) {
        let pageToken = null;
        try {
            do {
                const response = await gapi.client.drive.files.list({ q: `'${parent.id}' in parents and mimeType='${folderMimeType}' and trashed=false`, fields: 'nextPageToken, files(id, name)', pageSize: 100, pageToken: pageToken });
                if (response.result.files) allSubfolders = allSubfolders.concat(response.result.files);
                pageToken = response.result.nextPageToken;
            } while (pageToken);
        } catch (err) { updateStatus(`? L?i quét thu m?c "${parent.name}": ${err.message}`, true); }
    }
    return allSubfolders;
}

function sanitizeFolderDisplayName(name) {
    if (!name) return '';
    return name.replace(/\s*[\[\(][^\]\)]*[\]\)]\s*/g, '').trim();
}

// --- [NEW] Auto-Detection Functions ---
async function listFilesInFolder(folderId) {
    const files = [];
    const folders = [];
    let pageToken = null;

    try {
        do {
            const response = await gapi.client.drive.files.list({
                q: `'${folderId}' in parents and trashed=false`,
                fields: 'nextPageToken, files(id, name, mimeType, webViewLink)',
                pageSize: 100,
                pageToken: pageToken
            });

            if (response.result.files) {
                response.result.files.forEach(file => {
                    if (file.mimeType === 'application/vnd.google-apps.folder') {
                        folders.push(file);
                    } else {
                        files.push(file);
                    }
                });
            }
            pageToken = response.result.nextPageToken;
        } while (pageToken);
    } catch (err) {
        updateStatus(`? L?i list files trong folder: ${err.message}`, true);
    }

    return { files, folders };
}

async function getFolderMetadata(folderId) {
    try {
        const response = await gapi.client.drive.files.get({
            fileId: folderId,
            fields: 'appProperties'
        });
        return response.result;
    } catch (err) {
        console.error(`[METADATA] L?i l?y metadata folder ${folderId}:`, err);
        return { appProperties: {} };
    }
}

async function markFolderAsScanned(folderId, formFile, sheetFile) {
    try {
        await gapi.client.drive.files.update({
            fileId: folderId,
            resource: {
                appProperties: {
                    scanned: 'true',
                    formId: formFile.id,
                    formLink: formFile.webViewLink,
                    sheetId: sheetFile.id,
                    sheetLink: sheetFile.webViewLink
                }
            }
        });
        console.log(`[METADATA] Ðã dánh d?u folder ${folderId} là dã quét`);
    } catch (err) {
        console.error(`[METADATA] L?i dánh d?u folder ${folderId}:`, err);
    }
}

async function listAssignmentFolders(classFolderId) {
    try {
        const { folders } = await listFilesInFolder(classFolderId);
        // Filter out "File responses" folders (case-insensitive)
        return folders
            .filter(f => !f.name.toLowerCase().includes('file responses'))
            .map(f => ({ name: f.name, folderId: f.id }));
    } catch (err) {
        console.error(`[METADATA] L?i list assignment folders:`, err);
        return [];
    }
}

/**
 * Quét folder l?p d? tìm Form và Sheet hi?n có
 * @param {string} classFolderId - ID c?a folder l?p
 * @returns {object} - {formFile: {...}, sheetFile: {...}, assignmentFolders: [...]}
 */
async function scanClassFolder(classFolderId) {
    try {
        const response = await gapi.client.drive.files.list({
            q: `'${classFolderId}' in parents and trashed=false`,
            fields: 'files(id, name, mimeType, webViewLink)',
            pageSize: 100
        });
        
        const files = response.result.files || [];
        let formFile = null;
        let sheetFile = null;
        const assignmentFolders = [];
        
        for (const file of files) {
            if (file.mimeType === 'application/vnd.google-apps.form') {
                formFile = file;
            } else if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
                sheetFile = file;
            } else if (file.mimeType === 'application/vnd.google-apps.folder') {
                // B? qua folder "File responses"
                if (!file.name.toLowerCase().includes('file responses')) {
                    assignmentFolders.push(file);
                }
            }
        }
        
        return { formFile, sheetFile, assignmentFolders };
    } catch (e) {
        console.error('L?i quét folder l?p:', e);
        return { formFile: null, sheetFile: null, assignmentFolders: [] };
    }
}

/**
 * Ki?m tra xem Form có t?n t?i không
 */
async function checkFormExists(formId) {
    if (!formId) return false;
    try {
        const response = await gapi.client.drive.files.get({
            fileId: formId,
            fields: 'id, name'
        });
        return response && response.result;
    } catch (e) {
        console.log(`Form ${formId} không t?n t?i ho?c không có quy?n truy c?p:`, e);
        return false;
    }
}

/**
 * Ki?m tra xem Sheet có t?n t?i không
 */
async function checkSheetExists(sheetId) {
    if (!sheetId) return false;
    try {
        const response = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: sheetId
        });
        return response && response.result;
    } catch (e) {
        console.log(`Sheet ${sheetId} không t?n t?i ho?c không có quy?n truy c?p:`, e);
        return false;
    }
}

/**
 * T?o l?i Sheet cho class (khi Sheet b? xóa)
 * @param {object} profile - Class profile
 * @returns {string} - Sheet ID m?i
 */
async function recreateClassSheet(profile) {
    updateStatus(`?? Phát hi?n Sheet b? xóa. Ðang t?o l?i Sheet cho "${profile.name}"...`);
    
    const rootId = inpRootFolderId.value.trim();
    const tmplSheetId = TEMPLATE_SHEET_ID;
    
    if (!rootId || !profile.classFolderId) {
        updateStatus('? Thi?u Root Folder ID ho?c Class Folder ID', true);
        throw new Error('Missing Root/Class Folder ID');
    }
    
    try {
        // 1. Copy Sheet template
        updateStatus(`?? Ðang copy Sheet template...`);
        const newSheet = await apiCopyFile(
            tmplSheetId,
            `?? ${profile.name}`,
            profile.classFolderId
        );
        const newSheetId = newSheet.id;
        updateStatus(`? Ðã t?o Sheet m?i: ${newSheetId}`);
        
        // 2. Ghi config vào Sheet (I1, I3, I4, I5)
        updateStatus(`?? Ðang ghi c?u hình vào Sheet...`);
        await apiUpdateSheetConfig(newSheetId, profile.name, profile.classFolderId, profile.formId || '');
        
        // 3. T?o các sheet bài t?p (duplicate t? template)
        if (profile.assignments && profile.assignments.length > 0) {
            updateStatus(`?? Ðang t?o ${profile.assignments.length} sheet bài t?p...`);
            await apiCreateAssignmentSheets(newSheetId, profile.assignments);
        }
        
        // 4. Ghi danh sách bài t?p vào tab C?u Hình
        if (profile.assignments && profile.assignments.length > 0) {
            updateStatus(`?? Ðang di?n danh sách bài t?p vào Sheet...`);
            await apiWriteAssignmentsToConfig(newSheetId, profile.assignments);
        }
        
        // 5. Liên k?t Form v?i Sheet m?i (n?u có Form)
        if (profile.formId) {
            updateStatus(`?? Ðang liên k?t Form v?i Sheet m?i...`);
            await apiLinkFormToSheet(profile.formId, newSheetId);
        }
        
        // 6. Ghi email vào config (cell H6)
        const userEmail = await getUserEmail();
        if (userEmail) {
            await apiWriteUserEmailToConfig(newSheetId, userEmail);
        }
        
        // 7. C?p nh?t profile v?i Sheet ID m?i
        profile.sheetId = newSheetId;
        profile.sheetUrl = newSheet.webViewLink;
        
        // 8. Luu vào localStorage
        const idx = classProfiles.findIndex(p => p.id === profile.id);
        if (idx !== -1) {
            classProfiles[idx] = profile;
            localStorage.setItem('classProfiles', JSON.stringify(classProfiles));
        }
        
        updateStatus(`? Ðã t?o l?i Sheet thành công!`);
        return newSheetId;
        
    } catch (e) {
        updateStatus(`? L?i t?o l?i Sheet: ${e.message}`, true);
        throw e;
    }
}

/**
 * Ð?ng b? và liên k?t l?i class system - NÂNG C?P
 * Quét folder l?p, phát hi?n Form/Sheet b? m?t, t? d?ng t?o l?i và liên k?t
 */
async function syncAndLinkClassSystem() {
    const selectedId = classProfileSelectValue ? classProfileSelectValue.value : (classProfileSelect ? classProfileSelect.value : '');
    
    if (!selectedId) {
        updateStatus("? Vui lòng ch?n l?p c?n d?ng b?.", true);
        return;
    }
    
    const profile = getClassProfile(selectedId);
    if (!profile) {
        updateStatus("? Không tìm th?y thông tin l?p.", true);
        return;
    }
    
    // T? d?ng nh?n di?n Class Folder ID (chính là profile.id)
    const classFolderId = profile.classFolderId || profile.id;
    if (!classFolderId) {
        updateStatus("? L?i: Không xác d?nh du?c Class Folder ID.", true);
        return;
    }
    
    updateStatus(`?? Ðang quét folder l?p "${profile.name}"...`);
    
    try {
        // BU?C 1: Quét folder l?p d? tìm Form và Sheet hi?n có
        const { formFile, sheetFile, assignmentFolders } = await scanClassFolder(classFolderId);
        
        console.log('[SYNC] K?t qu? quét:', { formFile, sheetFile, assignmentFolders: assignmentFolders.length });
        
        let needFormLink = false;
        let needSheetLink = false;
        let currentFormId = formFile ? formFile.id : null;
        let currentSheetId = sheetFile ? sheetFile.id : null;
        
        // BU?C 2: Ki?m tra Form
        if (!formFile) {
            updateStatus(`?? Không tìm th?y Form trong folder. Ðang t?o Form m?i...`);
            
            // T?o Form m?i t? template
            const newForm = await apiCopyFile(
                TEMPLATE_FORM_ID,
                `?? ${profile.name}`,
                classFolderId
            );
            currentFormId = newForm.id;
            updateStatus(`? Ðã t?o Form m?i: ${currentFormId}`);
            needFormLink = true;
        } else {
            updateStatus(`? Tìm th?y Form: "${formFile.name}"`);
            currentFormId = formFile.id;
            
            // Ki?m tra Form có còn t?n t?i không (có th? b? xóa nhung chua vào thùng rác)
            const formExists = await checkFormExists(currentFormId);
            if (!formExists) {
                updateStatus(`?? Form b? l?i. Ðang t?o Form m?i...`);
                const newForm = await apiCopyFile(
                    TEMPLATE_FORM_ID,
                    `?? ${profile.name}`,
                    classFolderId
                );
                currentFormId = newForm.id;
                updateStatus(`? Ðã t?o Form m?i: ${currentFormId}`);
                needFormLink = true;
            }
        }
        
        // BU?C 3: Ki?m tra Sheet
        if (!sheetFile) {
            updateStatus(`?? Không tìm th?y Sheet trong folder. Ðang t?o Sheet m?i...`);
            
            // T?o Sheet m?i t? template
            const newSheet = await apiCopyFile(
                TEMPLATE_SHEET_ID,
                `?? ${profile.name}`,
                classFolderId
            );
            currentSheetId = newSheet.id;
            updateStatus(`? Ðã t?o Sheet m?i: ${currentSheetId}`);
            
            // Ghi config vào Sheet m?i
            await apiUpdateSheetConfig(currentSheetId, profile.name, classFolderId, currentFormId);
            
            // T?o các assignment sheets
            if (assignmentFolders.length > 0) {
                const assignments = assignmentFolders.map(f => ({ name: f.name, folderId: f.id }));
                await apiCreateAssignmentSheets(currentSheetId, assignments);
                await apiWriteAssignmentsToConfig(currentSheetId, assignments);
            }
            
            needSheetLink = true;
        } else {
            updateStatus(`? Tìm th?y Sheet: "${sheetFile.name}"`);
            currentSheetId = sheetFile.id;
            
            // Ki?m tra Sheet có còn t?n t?i không
            const sheetExists = await checkSheetExists(currentSheetId);
            if (!sheetExists) {
                updateStatus(`?? Sheet b? l?i. Ðang t?o Sheet m?i...`);
                const newSheet = await apiCopyFile(
                    TEMPLATE_SHEET_ID,
                    `?? ${profile.name}`,
                    classFolderId
                );
                currentSheetId = newSheet.id;
                updateStatus(`? Ðã t?o Sheet m?i: ${currentSheetId}`);
                
                // Ghi config vào Sheet m?i
                await apiUpdateSheetConfig(currentSheetId, profile.name, classFolderId, currentFormId);
                
                // T?o các assignment sheets
                if (assignmentFolders.length > 0) {
                    const assignments = assignmentFolders.map(f => ({ name: f.name, folderId: f.id }));
                    await apiCreateAssignmentSheets(currentSheetId, assignments);
                    await apiWriteAssignmentsToConfig(currentSheetId, assignments);
                }
                
                needSheetLink = true;
            }
        }
        
        // BU?C 4: C?p nh?t profile v?i ID m?i
        profile.formId = currentFormId;
        profile.sheetId = currentSheetId;
        profile.formUrl = `https://docs.google.com/forms/d/${currentFormId}/edit`;
        profile.sheetUrl = `https://docs.google.com/spreadsheets/d/${currentSheetId}/edit`;
        
        // C?p nh?t assignments t? folder
        if (assignmentFolders.length > 0) {
            profile.assignments = assignmentFolders.map(f => ({
                name: f.name,
                folderId: f.id
            }));
        }
        
        // Luu vào localStorage
        const idx = classProfiles.findIndex(p => p.id === selectedId);
        if (idx !== -1) {
            classProfiles[idx] = profile;
            localStorage.setItem('classProfiles', JSON.stringify(classProfiles));
        }
        
        // BU?C 5: Ghi l?i config vào Sheet (d?m b?o d?ng b?)
        updateStatus(`?? Ðang c?p nh?t config vào Sheet...`);
        await apiUpdateSheetConfig(currentSheetId, profile.name, classFolderId, currentFormId);
        
        // Ghi danh sách assignments
        if (profile.assignments && profile.assignments.length > 0) {
            await apiWriteAssignmentsToConfig(currentSheetId, profile.assignments);
        }
        
        // Ghi email user
        const userEmail = await getUserEmail();
        if (userEmail) {
            await apiWriteUserEmailToConfig(currentSheetId, userEmail);
        }
        
        // BU?C 6: C?p nh?t l?a ch?n trong Form (danh sách bài t?p)
        updateStatus(`?? Ðang c?p nh?t l?a ch?n bài t?p trong Form...`);
        await apiUpdateFormChoices(currentFormId, profile.assignments || []);
        
        // BU?C 6.5: C?nh báo v? email notification
        if (needFormLink || needSheetLink) {
            updateStatus(`?? LUU Ý: Sau khi liên k?t Form-Sheet xong, c?n setup email trong Apps Script:`);
            updateStatus(`   1. M? Form ? Apps Script (3 ch?m ? Script editor)`);
            updateStatus(`   2. Ch?y function: FormLib.quickSetupForm()`);
            updateStatus(`   3. Authorize các quy?n c?n thi?t`);
            updateStatus(`   ? Email notification s? ho?t d?ng sau khi setup!`);
        }
        
        // BU?C 7: Yêu c?u user liên k?t th? công n?u c?n
        if (needFormLink || needSheetLink) {
            let linkInstructions = '\n\n?? C?N LIÊN K?T TH? CÔNG:\n';
            
            if (needFormLink && needSheetLink) {
                linkInstructions += `\n1?? M? Form (dã t? d?ng m? tab m?i)\n`;
                linkInstructions += `2?? Click "Responses" ? "Select response destination"\n`;
                linkInstructions += `3?? Ch?n "Select existing spreadsheet"\n`;
                linkInstructions += `4?? Dán Sheet URL và ch?n sheet dúng\n`;
                linkInstructions += `\n?? SETUP EMAIL NOTIFICATION:\n`;
                linkInstructions += `5?? Trong Form, click d?u 3 ch?m ? "Script editor"\n`;
                linkInstructions += `6?? Ch?y function: FormLib.quickSetupForm()\n`;
                linkInstructions += `7?? Authorize các quy?n c?n thi?t\n`;
                linkInstructions += `\n? Sau khi hoàn t?t, email s? báo khi có ngu?i n?p bài!`;
                
                // M? Form d? user liên k?t
                window.open(`https://docs.google.com/forms/d/${currentFormId}/edit`, '_blank');
            } else if (needFormLink) {
                linkInstructions += `\n?? Form m?i c?n liên k?t v?i Sheet hi?n có.\n`;
                linkInstructions += `\n?? Và c?n setup email notification:\n`;
                linkInstructions += `1?? M? Form ? Script editor (3 ch?m)\n`;
                linkInstructions += `2?? Ch?y: FormLib.quickSetupForm()\n`;
                linkInstructions += `\nÐã t? d?ng m? Form. Hãy làm theo hu?ng d?n!`;
                window.open(`https://docs.google.com/forms/d/${currentFormId}/edit`, '_blank');
            } else if (needSheetLink) {
                linkInstructions += `\n?? Sheet m?i dã du?c t?o.\n`;
                linkInstructions += `Form hi?n t?i c?n du?c link l?i v?i Sheet m?i.\n`;
                linkInstructions += `\n?? Và c?n setup l?i email notification:\n`;
                linkInstructions += `1?? M? Form ? Script editor (3 ch?m)\n`;
                linkInstructions += `2?? Ch?y: FormLib.quickSetupForm()\n`;
                linkInstructions += `\nÐã t? d?ng m? Form. Hãy link v?i Sheet m?i!`;
                window.open(`https://docs.google.com/forms/d/${currentFormId}/edit`, '_blank');
            }
            
            updateStatus(`? Ð?ng b? hoàn t?t!${linkInstructions}`);
            alert(`Ð?ng b? thành công!${linkInstructions}`);
        } else {
            updateStatus(`? Ð?ng b? hoàn t?t! T?t c? thành ph?n dã liên k?t dúng.`);
        }
        
        // Reload UI
        loadClassProfiles();
        updateAssignmentSelectionUI();
        
    } catch (e) {
        console.error('[SYNC] L?i:', e);
        updateStatus(`? L?i d?ng b?: ${e.message}`, true);
    }
}

async function scanAndSyncClasses(silent = false) {
    const rootId = inpRootFolderId.value.trim();
    if (!rootId) {
        if (!silent) {
            updateStatus("? L?i: C?n ID Thu m?c cha. Vui lòng vào Cài d?t > T? d?ng hóa.", true);
            alert("Vui lòng vào Cài d?t -> T? d?ng hóa d? nh?p ID Thu m?c cha (Root) tru?c.");
        }
        return;
    }

    // [NEW] Ki?m tra và t?o l?i Sheet n?u thi?u
    const selectedId = classProfileSelectValue ? classProfileSelectValue.value : classProfileSelect.value;
    if (selectedId) {
        const currentProfile = classProfiles.find(p => p.id === selectedId);
        if (currentProfile && currentProfile.sheetId) {
            const sheetExists = await checkSheetExists(currentProfile.sheetId);
            if (!sheetExists) {
                try {
                    if (!silent) updateStatus(`?? Phát hi?n Sheet b? xóa cho l?p "${currentProfile.name}"`);
                    await recreateClassSheet(currentProfile);
                    if (!silent) updateStatus('? Ðã t?o l?i Sheet thành công!');
                    // Reload d? c?p nh?t UI
                    loadClassProfiles();
                } catch (e) {
                    updateStatus(`? L?i t?o l?i Sheet: ${e.message}`, true);
                    return;
                }
            }
        }
    }

    console.log("[SCAN] B?t d?u quét Root Folder ID:", rootId, silent ? "(silent mode)" : "");
    if (!silent) {
        updateStatus("?? Ðang quét Root Folder d? tìm các l?p...");
    }

    try {
        // Get all folders in root
        const { folders: classFolderCandidates, files: rootFiles } = await listFilesInFolder(rootId);
        console.log("[SCAN] Tìm th?y trong Root:", {
            folders: classFolderCandidates.length,
            files: rootFiles.length
        });
        console.log("[SCAN] Danh sách folders:", classFolderCandidates.map(f => f.name));

        if (!silent) updateStatus(`? Tìm th?y ${classFolderCandidates.length} folder trong Root.`);

        const detectedClasses = [];

        for (const classFolder of classFolderCandidates) {
            console.log(`[SCAN] Ðang ki?m tra folder: "${classFolder.name}" (ID: ${classFolder.id})`);
            if (!silent) updateStatus(`? Ðang ki?m tra folder: "${classFolder.name}"...`);

            // Check if folder has been scanned before (using appProperties)
            const metadata = await getFolderMetadata(classFolder.id);
            const props = metadata.appProperties || {};

            if (props.scanned === 'true' && props.formId && props.sheetId) {
                // Folder already scanned - use cached metadata
                console.log(`[SCAN] ? S? d?ng metadata dã luu cho "${classFolder.name}"`);
                if (!silent) updateStatus(`  ? Dùng cache: "${classFolder.name}"`);

                const assignments = await listAssignmentFolders(classFolder.id);

                detectedClasses.push({
                    id: classFolder.id,
                    name: classFolder.name,
                    folderLink: classFolder.webViewLink,
                    formId: props.formId,
                    formLink: props.formLink,
                    sheetId: props.sheetId,
                    sheetLink: props.sheetLink,
                    assignments: assignments
                });

                if (!silent) updateStatus(`  ? Tìm th?y ${assignments.length} lo?i bài t?p.`);
            } else {
                // First time scan - do full check
                console.log(`[SCAN] ?? Quét chi ti?t folder "${classFolder.name}" (l?n d?u)`);

                const { files, folders: assignmentFolderCandidates } = await listFilesInFolder(classFolder.id);

                console.log(`[SCAN] N?i dung folder "${classFolder.name}":`, {
                    files: files.length,
                    folders: assignmentFolderCandidates.length
                });
                console.log(`[SCAN] Files:`, files.map(f => ({ name: f.name, mimeType: f.mimeType })));
                console.log(`[SCAN] Sub-folders:`, assignmentFolderCandidates.map(f => f.name));

                // Find Form and Sheet
                const formFile = files.find(f => f.mimeType === 'application/vnd.google-apps.form');
                const sheetFile = files.find(f => f.mimeType === 'application/vnd.google-apps.spreadsheet');

                console.log(`[SCAN] Tìm th?y:`, {
                    form: formFile ? formFile.name : 'KHÔNG CÓ',
                    sheet: sheetFile ? sheetFile.name : 'KHÔNG CÓ'
                });

                if (formFile && sheetFile) {
                    // Valid class folder!
                    console.log(`[SCAN] ? "${classFolder.name}" là l?p h?p l?!`);
                    if (!silent) updateStatus(`? Nh?n di?n l?p: "${classFolder.name}" (Form + Sheet)`);

                    // Mark folder for faster future scans
                    await markFolderAsScanned(classFolder.id, formFile, sheetFile);

                    // Filter out "File responses" folders
                    const assignments = assignmentFolderCandidates
                        .filter(folder => !folder.name.toLowerCase().includes('file responses'))
                        .map(folder => ({
                            name: folder.name,
                            folderId: folder.id
                        }));

                    detectedClasses.push({
                        id: classFolder.id,
                        name: classFolder.name,
                        folderLink: classFolder.webViewLink,
                        formId: formFile.id,
                        formLink: formFile.webViewLink,
                        sheetId: sheetFile.id,
                        sheetLink: sheetFile.webViewLink,
                        assignments: assignments
                    });

                    if (!silent) updateStatus(`  ? Tìm th?y ${assignments.length} lo?i bài t?p.`);
                } else {
                    console.log(`[SCAN] ? B? qua "${classFolder.name}" - thi?u ${!formFile ? 'Form' : ''} ${!sheetFile ? 'Sheet' : ''}`);
                    if (!silent) updateStatus(`  ? B? qua: "${classFolder.name}" (thi?u ${!formFile ? 'Form' : ''} ${!sheetFile ? 'Sheet' : ''})`);
                }
            }
        }

        console.log(`[SCAN] T?ng s? l?p phát hi?n du?c: ${detectedClasses.length}`);

        if (detectedClasses.length === 0) {
            if (!silent) updateStatus("? Không tìm th?y l?p nào. Ð?m b?o m?i folder có Form + Sheet.", true);
            console.log("[SCAN] KHÔNG TÌM TH?Y L?P NÀO - Ki?m tra:");
            console.log("1. Folder có ch?a Google Form?");
            console.log("2. Folder có ch?a Google Spreadsheet?");
            console.log("3. Root Folder ID dúng chua?");
            return;
        }

        // Replace classProfiles with detected classes
        classProfiles = detectedClasses;
        localStorage.setItem('classProfiles', JSON.stringify(classProfiles));
        console.log("[SCAN] Ðã c?p nh?t classProfiles và luu vào localStorage:", classProfiles);

        // Reload dropdown
        loadClassProfiles();

        if (!silent) updateStatus(`?? Hoàn t?t! Ðã quét và d?ng b? ${detectedClasses.length} l?p.`);
    } catch (error) {
        if (!silent) updateStatus(`? L?i khi quét: ${error.message}`, true);
        console.error("[SCAN] L?I:", error);
        console.error("[SCAN] Chi ti?t l?i:", {
            message: error.message,
            result: error.result,
            stack: error.stack
        });
    }
}

// --- Drag & Drop Functions ---
function handleDragStart(e) {
    const draggedItem = e.target.closest('li');
    const draggedId = draggedItem.dataset.folderId;
    if (!selectedItems.has(draggedId)) {
        selectedItems.clear();
        document.querySelectorAll('.submission-item-reprocessable[data-selected="true"]').forEach(el => el.dataset.selected = "false");
        selectedItems.add(draggedId);
        draggedItem.dataset.selected = "true";
    }
    const itemsToMove = [];
    const key = getStatusCacheKey();
    const statusList = JSON.parse(localStorage.getItem(key) || '[]');
    selectedItems.forEach(id => {
        const itemData = statusList.find(item => item.id === id);
        if (itemData) {
            itemsToMove.push(itemData);
            document.querySelector(`li[data-folder-id="${id}"]`)?.classList.add('dragging');
        }
    });
    if (itemsToMove.length > 0) {
        e.dataTransfer.setData('application/json', JSON.stringify(itemsToMove));
        e.dataTransfer.effectAllowed = 'move';
    } else e.preventDefault();
}

function handleDragEnd(e) { document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging')); }

function handleDragOver(e) {
    e.preventDefault();
    const targetButton = e.target.closest('.assignment-type-btn');
    if (targetButton && targetButton.dataset.folderId !== activeAssignment.folderId) {
        targetButton.classList.add('drag-over');
        e.dataTransfer.dropEffect = 'move';
    } else e.dataTransfer.dropEffect = 'none';
}

function handleDragLeave(e) {
    const targetButton = e.target.closest('.assignment-type-btn');
    if (targetButton) targetButton.classList.remove('drag-over');
}

async function handleDrop(e) {
    e.preventDefault();
    const targetButton = e.target.closest('.assignment-type-btn');
    if (!targetButton) return;
    targetButton.classList.remove('drag-over');
    const newParentId = targetButton.dataset.folderId;
    const newParentName = targetButton.dataset.name;
    const oldParentId = activeAssignment.folderId;
    if (newParentId === oldParentId) return;
    const itemsToMoveJSON = e.dataTransfer.getData('application/json');
    if (!itemsToMoveJSON) return;
    const itemsToMove = JSON.parse(itemsToMoveJSON);
    if (itemsToMove.length === 0) return;
    await moveFolders(itemsToMove, oldParentId, newParentId, newParentName);
}

async function moveFolders(items, oldParentId, newParentId, newParentName) {
    updateStatus(`? B?t d?u di chuy?n ${items.length} h?c sinh sang "${newParentName}"...`);
    processButton.disabled = true;
    const movePromises = items.map(item => {
        return gapi.client.drive.files.update({ fileId: item.id, addParents: newParentId, removeParents: oldParentId, fields: 'id, parents' }).then(res => ({ status: 'fulfilled', item })).catch(err => ({ status: 'rejected', item, reason: err }));
    });
    const results = await Promise.all(movePromises);
    const successfulMoves = results.filter(r => r.status === 'fulfilled').map(r => r.item);
    const failedMoves = results.filter(r => r.status === 'rejected');
    if (failedMoves.length > 0) failedMoves.forEach(fail => updateStatus(`? L?i di chuy?n "${fail.item.name}": ${fail.reason?.result?.error?.message}`, true));
    if (successfulMoves.length > 0) {
        updateStatus(`? Ðã di chuy?n thành công ${successfulMoves.length} h?c sinh.`);
        const activeClassId = classProfileSelect.value;
        const oldKey = getStatusCacheKey(activeClassId, oldParentId);
        const newKey = getStatusCacheKey(activeClassId, newParentId);

        const oldCacheData = JSON.parse(localStorage.getItem(oldKey) || '[]');
        const movedIds = new Set(successfulMoves.map(i => i.id));
        const updatedOldCache = oldCacheData.filter(i => !movedIds.has(i.id));
        saveSubmissionStatusToCache(updatedOldCache, oldKey);

        const newCacheData = JSON.parse(localStorage.getItem(newKey) || '[]');
        const itemsToAdd = successfulMoves.map(item => ({ ...item, status: 'submitted' }));
        const updatedNewCache = [...newCacheData, ...itemsToAdd].sort((a, b) => a.name.localeCompare(b.name));
        saveSubmissionStatusToCache(updatedNewCache, newKey);
        loadSubmissionStatusFromCache();
    }
    selectedItems.clear();
    processButton.disabled = false;
}

// --- Auto Refresh (Always Enabled) ---
// Toggle function removed - auto refresh always runs once a class/assignment is selected

function startAutoRefresh() {
    if (isAutoRefreshOn && autoRefreshTimer) return;
    
    // Check if gapi is available and initialized
    if (typeof gapi === 'undefined' || !gapi.client || !gapi.client.getToken) {
        // Gapi not ready yet, skip for now (will retry on next opportunity)
        return;
    }
    
    if (!classProfileSelect.value || !gapi.client.getToken() || !activeAssignment) {
        // Not fully ready yet - silently skip
        return;
    }
    
    isAutoRefreshOn = true;
    updateStatus("? Quét n?n t? d?ng du?c b?t (m?i 5 phút).");

    runAutoScan();
    autoRefreshTimer = setInterval(runAutoScan, REFRESH_INTERVAL);
}

function stopAutoRefresh() {
    if (!isAutoRefreshOn) return;
    isAutoRefreshOn = false;
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
    }
    updateStatus("? Quét n?n t? d?ng d?ng.");
}

// updateAutoRefreshUI removed - not needed anymore

async function runAutoScan() {
    if (!isAutoRefreshOn) return;
    if (!classProfileSelect.value || !gapi.client.getToken() || !activeAssignment) {
        stopAutoRefresh();
        return;
    }
    updateStatus("? T? d?ng quét n?n dang ch?y...");
    const parentFolderIdToProcess = activeAssignment.folderId;
    try {
        const allFoldersFromDrive = await findAllSubfolders([{
            id: parentFolderIdToProcess,
            name: 'root'
        }]);
        const key = getStatusCacheKey();
        const cachedData = localStorage.getItem(key);
        const masterStatusList = cachedData ? JSON.parse(cachedData) : [];
        const statusMap = new Map(masterStatusList.map(item => [item.name, item]));
        const syncedStatusList = [];
        allFoldersFromDrive.forEach(folder => {
            const isProcessed = folder.name.includes('[Ðã x? lý]');
            const isOverdue = !isProcessed && folder.name.toLowerCase().includes('quá h?n');
            const cleanName = sanitizeFolderDisplayName(folder.name);
            const existingItem = statusMap.get(cleanName);
            let currentStatus;
            if (isProcessed) currentStatus = 'processed';
            else if (isOverdue) currentStatus = 'overdue';
            else if (existingItem && existingItem.status === 'error' && !isProcessed) currentStatus = 'submitted';
            else currentStatus = 'submitted';
            syncedStatusList.push({
                id: folder.id,
                name: cleanName,
                status: currentStatus
            });
        });
        syncedStatusList.sort((a, b) => a.name.localeCompare(b.name));
        saveSubmissionStatusToCache(syncedStatusList);
        displaySubmissionStatus(syncedStatusList);
        updateStatus(`? Ð?ng b? hoàn t?t: ${syncedStatusList.length} m?c.`);
    } catch (error) {
        const errorMessage = error.message || (error.result ? error.result.error.message : 'L?i không xác d?nh');
        updateStatus(`? L?i khi quét t? d?ng: ${errorMessage}`, true);
        console.error("L?i t? d?ng quét:", error);
        stopAutoRefresh();
    }
}

function getStatusCacheKey(classId = null, assignmentId = null) {
    const activeClassId = classId || classProfileSelect.value;
    const activeAssignmentId = assignmentId || (activeAssignment ? activeAssignment.folderId : null);
    return (activeClassId && activeAssignmentId) ? `submissionStatus_${activeClassId}_${activeAssignmentId}` : null;
}
function saveSubmissionStatusToCache(statusList, customKey = null) {
    const key = customKey || getStatusCacheKey();
    if (key) localStorage.setItem(key, JSON.stringify(statusList));
}
function loadSubmissionStatusFromCache(silent = false) {
    const key = getStatusCacheKey();
    const defaultText = '<div class="text-outline">Ch?n l?p và bài t?p d? xem tình tr?ng...</div>';
    if (!key) { submissionStatusList.innerHTML = defaultText; return; }
    const cachedData = localStorage.getItem(key);
    if (cachedData) {
        try {
            const statusList = JSON.parse(cachedData); displaySubmissionStatus(statusList);
            if (!silent) updateStatus("? T?i tr?ng thái t? cache.");
        } catch (e) { localStorage.removeItem(key); submissionStatusList.innerHTML = defaultText; }
    } else submissionStatusList.innerHTML = defaultText;
}
function updateSingleStatusInCache(folderName, newStatus) {
    const key = getStatusCacheKey(); if (!key) return;
    const cachedData = localStorage.getItem(key);
    if (cachedData) {
        try {
            let statusList = JSON.parse(cachedData);
            const itemIndex = statusList.findIndex(item => item.name === folderName);
            if (itemIndex > -1) { statusList[itemIndex].status = newStatus; saveSubmissionStatusToCache(statusList); }
        } catch (e) { }
    }
}

// --- PDF Conversion Logic ---
async function fetchFiles(folderId) {
    let files = [], pageToken = null;
    do {
        const response = await gapi.client.drive.files.list({ q: `'${folderId}' in parents and trashed=false`, fields: 'nextPageToken, files(id, name, mimeType)', pageSize: 100, pageToken: pageToken });
        files = files.concat(response.result.files); pageToken = response.result.nextPageToken;
    } while (pageToken);
    return files;
}

async function convertGDocsToPdf(docIds) {
    updateStatus(`? Chuy?n d?i ${docIds.length} GDocs...`);
    const promises = docIds.map(id => gapi.client.drive.files.export({ fileId: id, mimeType: 'application/pdf' }).then(response => {
        const bytes = new Uint8Array(response.body.length);
        for (let i = 0; i < response.body.length; i++) bytes[i] = response.body.charCodeAt(i);
        return { status: 'fulfilled', value: bytes.buffer };
    }).catch(error => ({ status: 'rejected', reason: error, id }))
    );
    const results = await Promise.all(promises);
    const pdfBuffers = [];
    results.forEach(result => { if (result.status === 'fulfilled') pdfBuffers.push(result.value); else updateStatus(`? L?i GDoc: ${result.reason.message}`, true); });
    updateStatus(`? GDocs: ${pdfBuffers.length}/${docIds.length} thành công.`);
    return pdfBuffers;
}

async function convertDocxToPdf(docxFiles) {
    updateStatus(`? Chuy?n d?i ${docxFiles.length} t?p DOCX (tang t?c)...`);
    const pdfBuffers = [];
    const CONCURRENCY_LIMIT = 4;

    const processSingleFile = async (file) => {
        let tempGDocId = null;
        try {
            updateStatus(`  ? Ðang x? lý DOCX: "${file.name}"`);
            const copyResponse = await gapi.client.drive.files.copy({ fileId: file.id, resource: { mimeType: 'application/vnd.google-apps.document' } });
            tempGDocId = copyResponse.result.id;
            const exportResponse = await gapi.client.drive.files.export({ fileId: tempGDocId, mimeType: 'application/pdf' });
            const bytes = new Uint8Array(exportResponse.body.length);
            for (let i = 0; i < exportResponse.body.length; i++) bytes[i] = exportResponse.body.charCodeAt(i);
            return bytes.buffer;
        } catch (error) {
            updateStatus(`? L?i DOCX "${file.name}": ${error.message}`, true); return null;
        } finally {
            if (tempGDocId) try { await gapi.client.drive.files.update({ fileId: tempGDocId, resource: { trashed: true } }); } catch (e) { }
        }
    };
    let taskIndex = -1;
    const getNextTask = () => { taskIndex++; return taskIndex < docxFiles.length ? docxFiles[taskIndex] : null; };
    const worker = async () => { while (true) { const task = getNextTask(); if (!task) break; const result = await processSingleFile(task); if (result) pdfBuffers.push(result); } };
    const workerPromises = Array(CONCURRENCY_LIMIT).fill(null).map(worker);
    await Promise.all(workerPromises);
    updateStatus(`? DOCX: ${pdfBuffers.length}/${docxFiles.length} thành công.`);
    return pdfBuffers;
}

async function fetchPdfBlobs(fileIds) {
    const accessToken = gapi.client.getToken().access_token;
    const promises = fileIds.map(id => fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, { headers: { 'Authorization': `Bearer ${accessToken}` } }).then(res => res.arrayBuffer()));
    return Promise.all(promises);
}

async function stripExif(arrayBuffer, mimeType) {
    return new Promise((resolve, reject) => {
        if (mimeType !== 'image/jpeg') { resolve(arrayBuffer); return; }
        const blob = new Blob([arrayBuffer], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas'); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
            canvas.getContext('2d').drawImage(img, 0, 0);
            canvas.toBlob(newBlob => { URL.revokeObjectURL(url); newBlob.arrayBuffer().then(resolve).catch(reject); }, 'image/jpeg', 0.9);
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
        img.src = url;
    });
}

function convertImageToPng(arrayBuffer, mimeType) {
    return new Promise((resolve, reject) => {
        const blob = new Blob([arrayBuffer], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas'); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0);
            canvas.toBlob(pngBlob => { URL.revokeObjectURL(url); pngBlob.arrayBuffer().then(resolve).catch(reject); }, 'image/png');
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
        img.src = url;
    });
}

async function createPdfFromImages(imageFiles, folderName) {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(window.fontkit);
    const accessToken = gapi.client.getToken().access_token;
    const CONCURRENCY_LIMIT = 4;
    updateStatus(`? X? lý ${imageFiles.length} ?nh (${CONCURRENCY_LIMIT} lu?ng)...`);
    const processedImages = new Array(imageFiles.length).fill(null);
    let taskIndex = -1;
    const getNextTask = () => { taskIndex++; return taskIndex < imageFiles.length ? { file: imageFiles[taskIndex], index: taskIndex } : null; };
    const processImage = async (file, index) => {
        try {
            const res = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
            if (!res.ok) throw new Error(`T?i th?t b?i`);
            const originalBuffer = await res.arrayBuffer();
            
            // [NEW] Phát hi?n góc xoay b?ng AI (n?u b?t)
            let rotationAngle = 0;
            if (isAIAutoRotateEnabled() && (file.mimeType === 'image/jpeg' || file.mimeType === 'image/png')) {
                updateStatus(`  ?? AI ki?m tra chi?u "${file.name}"...`);
                const blob = new Blob([originalBuffer], { type: file.mimeType });
                rotationAngle = await detectTextOrientation(blob);
            }
            
            let image;
            if (file.mimeType === 'image/jpeg') {
                const strippedBuffer = await stripExif(originalBuffer, file.mimeType);
                image = await pdfDoc.embedJpg(strippedBuffer);
            } else if (file.mimeType === 'image/png') {
                image = await pdfDoc.embedPng(originalBuffer);
            } else {
                try {
                    const pngBuffer = await convertImageToPng(originalBuffer, file.mimeType);
                    image = await pdfDoc.embedPng(pngBuffer);
                } catch (e) { throw new Error(`Chuy?n d?i th?t b?i`); }
            }
            processedImages[index] = { image, rotation: rotationAngle };
        } catch (error) { updateStatus(`  ? L?i ?nh ${file.name}: ${error.message}`, true); }
    };
    const worker = async () => { while (true) { const task = getNextTask(); if (!task) break; await processImage(task.file, task.index); } };
    await Promise.all(Array(CONCURRENCY_LIMIT).fill(null).map(worker));
    updateStatus(`? X? lý ?nh xong, dang g?p PDF...`);
    
    // [IMPROVED] Thêm header trên m?i trang + thu nh? ?nh + xoay n?u c?n
    for (const imageData of processedImages) {
        if (!imageData) continue;
        const { image, rotation } = imageData;
        
        const A4_SHORT = 595.28, A4_LONG = 841.89;
        const isLandscape = image.width > image.height;
        const pageWidth = isLandscape ? A4_LONG : A4_SHORT;
        const pageHeight = isLandscape ? A4_SHORT : A4_LONG;
        
        // [NEW] Ch?a 25px ? trên cho header (tên ngu?i n?p)
        const headerHeight = 25;
        const availableHeight = pageHeight - headerHeight;
        
        // Thu nh? ?nh v?a vào không gian còn l?i
        const ratio = Math.min(pageWidth / image.width, availableHeight / image.height);
        const scaledWidth = image.width * ratio;
        const scaledHeight = image.height * ratio;
        
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        
        // [NEW] Xoay trang n?u AI phát hi?n góc
        // Tesseract tr? v? góc van b?n HI?N T?I, c?n xoay NGU?C l?i d? th?ng
        if (rotation !== 0) {
            const correctRotation = (360 - rotation) % 360; // Ð?o ngu?c góc
            page.setRotation(degrees(correctRotation));
            console.log(`[AI] Phát hi?n van b?n nghiêng ${rotation}° ? Xoay trang ${correctRotation}°`);
        }
        
        // [IMPROVED] V? header (tên ngu?i n?p) ? Ð?U m?i trang
        if (folderName) {
            try {
                // C? g?ng dùng custom font n?u có (h? tr? ti?ng Vi?t)
                if (customFontBuffer) {
                    const embeddedFont = await pdfDoc.embedFont(customFontBuffer);
                    page.drawText(`${folderName}`, {
                        x: 15,
                        y: pageHeight - 18,
                        font: embeddedFont,
                        size: 11,
                        color: rgb(1, 0, 0),
                    });
                } else {
                    // Fallback: dùng font m?c d?nh
                    page.drawText(`${folderName}`, {
                        x: 15,
                        y: pageHeight - 18,
                        size: 11,
                        color: rgb(1, 0, 0),
                    });
                }
            } catch (headerErr) {
                // B? qua l?i encoding ký t? d?c bi?t - ti?p t?c x? lý ?nh
                console.warn(`[PDF] B? qua header do l?i: ${headerErr.message}`);
            }
        }
        
        // [IMPROVED] V? ?nh ? phía du?i header
        page.drawImage(image, {
            x: (pageWidth - scaledWidth) / 2,
            y: (availableHeight - scaledHeight) / 2,
            width: scaledWidth,
            height: scaledHeight
        });
    }
    return pdfDoc.save();
}

async function mergePdfs(pdfBuffers, folderName) {
    const mergedPdf = await PDFDocument.create();
    mergedPdf.registerFontkit(window.fontkit);
    
    // [IMPROVED] Thêm header tên ngu?i n?p trên m?i trang
    for (const pdfBuffer of pdfBuffers) {
        try {
            const pdf = await PDFDocument.load(pdfBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            
            // [NEW] Thêm header vào m?i trang
            for (const page of copiedPages) {
                if (folderName) {
                    try {
                        const pageHeight = page.getHeight();
                        
                        // C? g?ng dùng custom font n?u có (h? tr? ti?ng Vi?t)
                        if (customFontBuffer) {
                            const embeddedFont = await mergedPdf.embedFont(customFontBuffer);
                            page.drawText(`${folderName}`, {
                                x: 15,
                                y: pageHeight - 18,
                                font: embeddedFont,
                                size: 11,
                                color: rgb(1, 0, 0),
                            });
                        } else {
                            // Fallback: dùng font m?c d?nh
                            page.drawText(`${folderName}`, {
                                x: 15,
                                y: pageHeight - 18,
                                size: 11,
                                color: rgb(1, 0, 0),
                            });
                        }
                    } catch (headerErr) {
                        // B? qua l?i encoding ký t? d?c bi?t - ti?p t?c x? lý trang
                        console.warn(`[PDF] B? qua header do l?i: ${headerErr.message}`);
                    }
                }
                
                mergedPdf.addPage(page);
            }
        } catch (err) {
            updateStatus(`? L?i d?c PDF con. B? qua.`, true);
        }
    }
    
    return mergedPdf.save();
}

// ==================================================================
// LOGIC GIAO DI?N (DESIGN SWITCHER & THEME)
// ==================================================================
const themeButtons = document.querySelectorAll('.theme-btn');
const accentButtons = document.querySelectorAll('.accent-btn');
const designButtons = document.querySelectorAll('.design-btn');
const customColorInput = document.getElementById('custom_color_input');
const customColorButtonLabel = document.getElementById('custom_color_button_label');
const customColorIcon = document.getElementById('custom_color_icon');
const accentSection = document.getElementById('accent-color-section');
const root = document.documentElement;
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

/* --- Design Switcher --- */
function setDesign(design) {
    // Save current theme before switching
    const currentDesign = document.body.getAttribute('data-design');
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    if (currentDesign) {
        localStorage.setItem(`${currentDesign}-theme`, currentTheme);
    }
    
    document.body.setAttribute('data-design', design);
    localStorage.setItem('preferredDesign', design);

    // Load theme specific to this design
    const savedTheme = localStorage.getItem(`${design}-theme`) || localStorage.getItem('theme') || 'system';
    applyTheme(savedTheme, localStorage.getItem('accent') || 'blue');

    // Update UI state for buttons
    designButtons.forEach(btn => {
        const isActive = btn.dataset.value === design;
        btn.dataset.active = isActive;

        // Reset classes
        btn.classList.remove('m3-button-tonal', 'm3-button-outlined', 'm3-button-filled');

        if (isActive) {
            btn.classList.add('m3-button-filled');
        } else {
            btn.classList.add('m3-button-outlined');
        }
    });

    // Hide Accent colors if Apple Design is active (since Apple design overrides colors)
    if (design === 'apple') {
        accentSection.style.opacity = '0.5';
        accentSection.style.pointerEvents = 'none';
    } else {
        accentSection.style.opacity = '1';
        accentSection.style.pointerEvents = 'auto';
    }
}

designButtons.forEach(btn => {
    btn.addEventListener('click', () => setDesign(btn.dataset.value));
});

// --- Theme & Accent Logic ---
function getContrastColor(hex) {
    if (hex.startsWith('#')) hex = hex.slice(1);
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#FFFFFF';
}

function applyTheme(theme, accent) {
    localStorage.setItem('accent', accent);
    if (accent.startsWith('#')) {
        root.removeAttribute('data-accent');
        document.body.removeAttribute('data-accent');
        root.style.setProperty('--m3-primary', accent);
        const onPrimary = getContrastColor(accent);
        root.style.setProperty('--m3-on-primary', onPrimary);
        accentButtons.forEach(btn => { btn.style.boxShadow = 'none'; });
        customColorButtonLabel.style.boxShadow = '0 0 0 2px ' + accent;
        customColorIcon.style.color = accent;
    } else {
        root.dataset.accent = accent;
        document.body.dataset.accent = accent;
        root.style.removeProperty('--m3-primary');
        root.style.removeProperty('--m3-on-primary');
        accentButtons.forEach(btn => {
            if (btn.dataset.value === accent) btn.style.boxShadow = '0 0 0 2px var(--m3-primary)';
            else btn.style.boxShadow = 'none';
        });
        customColorButtonLabel.style.boxShadow = 'none';
        customColorIcon.style.color = 'var(--m3-on-surface-variant)';
    }

    // Save theme for current design
    const currentDesign = document.body.getAttribute('data-design') || 'material';
    localStorage.setItem(`${currentDesign}-theme`, theme);
    localStorage.setItem('theme', theme);
    
    // Apply dark class to both root and body for maximum compatibility
    if (theme === 'system') {
        if (mediaQuery.matches) {
            root.classList.add('dark');
            document.body.classList.add('dark');
        } else {
            root.classList.remove('dark');
            document.body.classList.remove('dark');
        }
    } else if (theme === 'dark') {
        root.classList.add('dark');
        document.body.classList.add('dark');
    } else {
        root.classList.remove('dark');
        document.body.classList.remove('dark');
    }

    themeButtons.forEach(btn => {
        const isActive = btn.dataset.value === theme;
        btn.dataset.active = isActive;

        // Reset classes first
        btn.classList.remove('m3-button-tonal', 'm3-button-outlined', 'm3-button-filled', 'bg-primary-container', 'text-on-primary-container');

        if (isActive) {
            // Active: Filled style (like Process button)
            btn.classList.add('m3-button-filled');
        } else {
            // Inactive: Outlined style (like Assignment buttons)
            btn.classList.add('m3-button-outlined');
        }
    });
    if (typeof loadSubmissionStatusFromCache === 'function') loadSubmissionStatusFromCache(true);
}

mediaQuery.addEventListener('change', (e) => {
    const currentTheme = localStorage.getItem('theme') || 'system';
    if (currentTheme === 'system') {
        if (e.matches) {
            root.classList.add('dark');
            document.body.classList.add('dark');
        } else {
            root.classList.remove('dark');
            document.body.classList.remove('dark');
        }
    }
});

themeButtons.forEach(btn => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.value, localStorage.getItem('accent') || 'blue'));
});
accentButtons.forEach(btn => {
    btn.addEventListener('click', () => applyTheme(localStorage.getItem('theme') || 'system', btn.dataset.value));
});
customColorInput.addEventListener('input', () => {
    applyTheme(localStorage.getItem('theme') || 'system', customColorInput.value);
});

function initTheme() {
    const savedDesign = localStorage.getItem('preferredDesign') || 'material';
    const theme = localStorage.getItem(`${savedDesign}-theme`) || localStorage.getItem('theme') || 'system';
    const accent = localStorage.getItem('accent') || 'blue';
    
    // Set design first (without triggering theme load)
    document.body.setAttribute('data-design', savedDesign);
    localStorage.setItem('preferredDesign', savedDesign);
    
    // Update design buttons UI
    designButtons.forEach(btn => {
        const isActive = btn.dataset.value === savedDesign;
        btn.dataset.active = isActive;
        btn.classList.remove('m3-button-tonal', 'm3-button-outlined', 'm3-button-filled');
        if (isActive) {
            btn.classList.add('m3-button-filled');
        } else {
            btn.classList.add('m3-button-outlined');
        }
    });
    
    // Then apply theme
    applyTheme(theme, accent);
}
customColorInput.addEventListener('input', () => {
    applyTheme(localStorage.getItem('theme') || 'system', customColorInput.value);
});

// ==================================================================
// MOBILE VIEW LOGIC
// ==================================================================

function initMobileView() {
    const body = document.body;
    // Always use 'auto' mode - responsive based on screen size
    body.setAttribute('data-view-mode', 'auto');
    
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobile_menu_toggle');
    const sidebar = document.querySelector('aside');
    const overlay = document.getElementById('mobile_sidebar_overlay');
    
    if (mobileMenuToggle && sidebar && overlay) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
            overlay.classList.toggle('active');
        });
    }
    
    if (overlay && sidebar) {
        overlay.addEventListener('click', (e) => {
            // Only close sidebar if clicking on overlay background, not on sidebar itself
            const isClickInsideSidebar = sidebar.contains(e.target);
            if (e.target === overlay && !isClickInsideSidebar) {
                sidebar.classList.remove('mobile-open');
                overlay.classList.remove('active');
            }
        });
    }
    
    // Mobile bottom navigation
    const bottomNavItems = document.querySelectorAll('.mobile-bottom-nav-item');
    if (bottomNavItems.length > 0) {
        bottomNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const nav = item.dataset.nav;
                
                // Update active state
                bottomNavItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                // Handle navigation
                handleMobileNavigation(nav);
            });
        });
    }
}

function handleMobileNavigation(nav) {
    const sidebar = document.querySelector('aside');
    const overlay = document.getElementById('mobile_sidebar_overlay');
    
    // Close sidebar when navigating
    if (sidebar && overlay) {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
    }
    
    const mainContent = document.querySelector('main');
    
    switch(nav) {
        case 'home':
            // Scroll to top of main content
            if (mainContent) {
                mainContent.scrollTo({ top: 0, behavior: 'smooth' });
            }
            break;
        case 'settings':
            // Open settings modal
            const settingsModal = document.getElementById('settings_modal');
            if (settingsModal) {
                settingsModal.setAttribute('aria-hidden', 'false');
            }
            break;
    }
}

// ==================================================================
// AUTO-UPDATE: KI?M TRA PHIÊN B?N M?I
// ==================================================================

/**
 * Ki?m tra phiên b?n m?i t? Google Drive
 */
async function checkForUpdates() {
    try {
        console.log(`[UPDATE] Phiên b?n hi?n t?i: ${CURRENT_VERSION}`);
        
        const response = await fetch(VERSION_CHECK_URL);
        if (!response.ok) {
            console.log('[UPDATE] Không th? l?y thông tin phiên b?n m?i');
            return;
        }
        
        const latestInfo = await response.json();
        console.log(`[UPDATE] Phiên b?n m?i nh?t: ${latestInfo.version}`);
        
        // So sánh phiên b?n
        if (compareVersions(latestInfo.version, CURRENT_VERSION) > 0) {
            showUpdateNotification(latestInfo);
        } else {
            console.log('[UPDATE] Ðang dùng phiên b?n m?i nh?t');
        }
    } catch (error) {
        console.error('[UPDATE] L?i khi ki?m tra update:', error);
    }
}

/**
 * So sánh 2 phiên b?n (semver)
 * @returns {number} 1 n?u v1 > v2, -1 n?u v1 < v2, 0 n?u b?ng nhau
 */
function compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const num1 = parts1[i] || 0;
        const num2 = parts2[i] || 0;
        
        if (num1 > num2) return 1;
        if (num1 < num2) return -1;
    }
    
    return 0;
}


/**
 * T?o l?i Sheet cho bài t?p (xóa cái cu, t?o cái m?i)
 */
async function recreateAssignmentSheet(assignmentFolderId, assignmentName) {
    try {
        updateStatus(`? Ðang t?o l?i Sheet cho bài t?p "${assignmentName}"...`);
        
        // L?y danh sách files trong folder bài t?p
        const files = await gapi.client.drive.files.list({
            q: `'${assignmentFolderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
            spaces: 'drive',
            fields: 'files(id, name)',
            pageSize: 10
        });
        
        // Xóa Sheet cu
        if (files.result.files && files.result.files.length > 0) {
            for (const file of files.result.files) {
                await gapi.client.drive.files.update({
                    fileId: file.id,
                    resource: { trashed: true }
                });
            }
            updateStatus(`? Ðã xóa Sheet cu`);
        }
        
        // T?o Sheet m?i
        const classId = formClassId.value;
        const profile = classProfiles.find(p => p.id === classId);
        const studentCount = profile && profile.students ? profile.students.length : 0;
        
        const sheetMetadata = {
            name: `${assignmentName} - Ði?m`,
            mimeType: 'application/vnd.google-apps.spreadsheet',
            parents: [assignmentFolderId]
        };
        
        const sheet = await gapi.client.drive.files.create({
            resource: sheetMetadata,
            fields: 'id, webViewLink'
        });
        
        const sheetId = sheet.result.id;
        
        // Ghi d? li?u vào sheet
        await gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            resource: {
                requests: [
                    {
                        updateSheetProperties: {
                            fields: 'gridProperties',
                            properties: {
                                sheetId: 0,
                                gridProperties: {
                                    rowCount: Math.max(studentCount + 10, 50),
                                    columnCount: 5
                                }
                            }
                        }
                    }
                ]
            }
        });
        
        // Ghi header
        const headers = [['STT', 'Tên H?c Sinh', 'Ði?m', 'Nh?n xét', 'Ngày n?p']];
        const studentNames = profile && profile.students ? profile.students.map((s, idx) => [idx + 1, s, '', '', '']) : [];
        
        await gapi.client.sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: sheetId,
            resource: {
                data: [
                    {
                        range: 'Sheet1!A1:E1',
                        values: headers
                    },
                    {
                        range: `Sheet1!A2:E${studentCount + 1}`,
                        values: studentNames
                    }
                ],
                valueInputOption: 'USER_ENTERED'
            }
        });
        
        updateStatus(`? T?o l?i Sheet thành công cho "${assignmentName}"`);
    } catch (error) {
        updateStatus(`? L?i t?o Sheet: ${error.message}`, true);
    }
}

/**
 * T?o l?i Form cho bài t?p (xóa cái cu, t?o cái m?i)
 */
async function recreateAssignmentForm(assignmentFolderId, assignmentName) {
    try {
        updateStatus(`? Ðang t?o l?i Form cho bài t?p "${assignmentName}"...`);
        
        // L?y danh sách Forms trong folder
        const files = await gapi.client.drive.files.list({
            q: `'${assignmentFolderId}' in parents and mimeType='application/vnd.google-apps.form' and trashed=false`,
            spaces: 'drive',
            fields: 'files(id, name)',
            pageSize: 10
        });
        
        // Xóa Form cu
        if (files.result.files && files.result.files.length > 0) {
            for (const file of files.result.files) {
                await gapi.client.drive.files.update({
                    fileId: file.id,
                    resource: { trashed: true }
                });
            }
            updateStatus(`? Ðã xóa Form cu`);
        }
        
        // T?o Form m?i
        const formMetadata = {
            name: assignmentName,
            mimeType: 'application/vnd.google-apps.form',
            parents: [assignmentFolderId]
        };
        
        const form = await gapi.client.drive.files.create({
            resource: formMetadata,
            fields: 'id, webViewLink'
        });
        
        const formId = form.result.id;
        
        // T?o câu h?i trong Form (H? tên, L?p, File n?p bài)
        await gapi.client.forms.forms.batchUpdate({
            formId: formId,
            resource: {
                requests: [
                    {
                        createItem: {
                            item: {
                                title: 'H? tên h?c sinh',
                                questionItem: {
                                    question: {
                                        required: true,
                                        textQuestion: {
                                            paragraph: false
                                        }
                                    }
                                }
                            },
                            location: { index: 0 }
                        }
                    },
                    {
                        createItem: {
                            item: {
                                title: 'N?p bài t?p',
                                questionItem: {
                                    question: {
                                        required: true,
                                        fileUploadQuestion: {
                                            folderId: assignmentFolderId
                                        }
                                    }
                                }
                            },
                            location: { index: 1 }
                        }
                    }
                ]
            }
        });
        
        updateStatus(`? T?o l?i Form thành công cho "${assignmentName}"`);
    } catch (error) {
        updateStatus(`? L?i t?o Form: ${error.message}`, true);
    }
}

/**
 * Tìm ki?m Form trong folder l?p
 * @param {string} classFolderId - ID c?a folder l?p
 * @returns {Promise<Object|null>} - File object c?a Form ho?c null
 */
async function findFormInFolder(classFolderId) {
    if (!classFolderId) return null;
    try {
        const response = await gapi.client.drive.files.list({
            q: `'${classFolderId}' in parents and mimeType='application/vnd.google-apps.form' and trashed=false`,
            fields: 'files(id, name, webViewLink)',
            pageSize: 1
        });
        
        if (response.result.files && response.result.files.length > 0) {
            const form = response.result.files[0];
            // Link ch?nh s?a Form
            form.shortLink = `https://docs.google.com/forms/d/${form.id}/edit`;
            // Link xu?t b?n (viewform) d? l?y khi c?n
            form.publishedLink = `https://docs.google.com/forms/d/${form.id}/viewform`;
            return form;
        }
        
        return null;
    } catch (err) {
        console.error(`L?i tìm Form trong folder ${classFolderId}:`, err);
        return null;
    }
}

/**
 * Tìm ki?m Sheet trong folder l?p
 * @param {string} classFolderId - ID c?a folder l?p
 * @returns {Promise<Object|null>} - File object c?a Sheet ho?c null
 */
async function findSheetInFolder(classFolderId) {
    if (!classFolderId) return null;
    try {
        const response = await gapi.client.drive.files.list({
            q: `'${classFolderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
            fields: 'files(id, name, webViewLink)',
            pageSize: 1
        });
        return response.result.files && response.result.files.length > 0 ? response.result.files[0] : null;
    } catch (err) {
        console.error(`L?i tìm Sheet trong folder ${classFolderId}:`, err);
        return null;
    }
}

/**
 * Ð?m s? h?c sinh t? sheet assignment (d?a trên s? th? t? cao nh?t ? c?t A)
 * @param {string} spreadsheetId - ID c?a spreadsheet
 * @param {string} sheetName - Tên sheet assignment
 * @returns {Promise<number>} - S? lu?ng h?c sinh
 */
async function countStudentsInSheet(spreadsheetId, sheetName) {
    try {
        // 1. Tìm v? trí c?t STT
        const headerResponse = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: `${sheetName}!1:1`
        });
        
        const headerRow = headerResponse.result.values ? headerResponse.result.values[0] : [];
        const sttColIndex = headerRow.findIndex(cell => cell && cell.trim().toLowerCase() === 'stt');
        
        if (sttColIndex === -1) {
            console.warn(`Không tìm th?y c?t 'STT' trong sheet ${sheetName}`);
            return 0;
        }
        
        // 2. L?y ch? c?t t? index (A=0, B=1, ..., Z=25)
        const colLetter = String.fromCharCode(65 + sttColIndex);
        
        // 3. Ð?c c?t STT t? dòng 2 tr? di (b? header)
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: `${sheetName}!${colLetter}2:${colLetter}1000`
        });
        
        const values = response.result.values;
        if (!values || values.length === 0) return 0;
        
        // 4. Tìm s? th? t? cao nh?t (b? qua ô tr?ng)
        let maxNumber = 0;
        for (const row of values) {
            if (row && row[0]) {
                const num = parseInt(row[0]);
                if (!isNaN(num) && num > maxNumber) {
                    maxNumber = num;
                }
            }
        }
        
        console.log(`[STATS] Sheet "${sheetName}": C?t STT là c?t ${colLetter}, s? h?c sinh t?i da: ${maxNumber}`);
        return maxNumber;
    } catch (err) {
        console.error(`L?i d?m h?c sinh trong sheet ${sheetName}:`, err);
        return 0;
    }
}

/**
 * Tìm tên sheet tuong ?ng v?i assignment b?ng fuzzy matching
 * Logic: Kh?p t? khóa cu?i c?a assignment name vào tên sheet
 * VD: "Ð?i s?" ? match "B?ng nh?n xét (Ð?i s?)"
 * VD: "Bài t?p th? 5 d?i s?" ? match "B?ng nh?n xét (Ð?i s?)" (d?a vào t? cu?i "d?i s?")
 * 
 * @param {string} assignmentName - Tên lo?i bài t?p (VD: "Ð?i s?" ho?c "Bài t?p th? 5 d?i s?")
 * @param {Array} allSheetNames - Danh sách t?t c? tên sheet
 * @returns {string|null} - Tên sheet match ho?c null
 */
function findAssignmentSheetByFuzzyMatch(assignmentName, allSheetNames) {
    if (!assignmentName || !allSheetNames || allSheetNames.length === 0) {
        return null;
    }
    
    const assignmentLower = assignmentName.toLowerCase().trim();
    
    // **CHI?N LU?C 0: MATCH CHÍNH XÁC V?I PATTERN "B?ng nh?n xét (...)"**
    // N?u assignment = "Ð?i s?", tìm "B?ng nh?n xét (Ð?i s?)" chính xác
    const exactPattern = `b?ng nh?n xét (${assignmentLower})`;
    const exactMatch = allSheetNames.find(s => s.toLowerCase() === exactPattern);
    if (exactMatch) {
        console.log(`[FUZZY] Match chính xác: "${exactMatch}"`);
        return exactMatch;
    }
    
    // Tách t? t? assignment name
    const words = assignmentLower.split(/[\s\-_]+/).filter(w => w.length > 0);
    
    if (words.length === 0) return null;
    
    // **CHI?N LU?C 1: MATCH CÓ CH?A TOÀN B? TÊN ASSIGNMENT**
    // VD: "Ð?i s?" ? tìm sheet ch?a d?y d? "d?i s?"
    const fullNameMatches = allSheetNames.filter(sheetName => {
        const sheetLower = sheetName.toLowerCase();
        // Ki?m tra xem sheet name có ch?a toàn b? assignment name không (có th? ? trong d?u ngo?c)
        return sheetLower.includes(assignmentLower);
    });
    
    if (fullNameMatches.length > 0) {
        console.log(`[FUZZY] Match toàn b? tên (${fullNameMatches.length}):`, fullNameMatches);
        return fullNameMatches[0];
    }
    
    // **CHI?N LU?C 2: MATCH 2 T? CU?I**
    const lastTwoWords = words.slice(-2);
    console.log(`[FUZZY] Assignment: "${assignmentName}" ? Tìm 2 t? cu?i: [${lastTwoWords.join(', ')}]`);
    
    const twoWordMatches = allSheetNames.filter(sheetName => {
        const sheetLower = sheetName.toLowerCase();
        return lastTwoWords.every(word => sheetLower.includes(word));
    });
    
    if (twoWordMatches.length > 0) {
        console.log(`[FUZZY] Match 2 t? (${twoWordMatches.length}):`, twoWordMatches);
        return twoWordMatches[0];
    }
    
    // **CHI?N LU?C 3: MATCH 1 T? CU?I (T? QUAN TR?NG NH?T)**
    const lastWord = words[words.length - 1];
    console.log(`[FUZZY] Th? tìm 1 t? cu?i: "${lastWord}"`);
    
    const oneWordMatches = allSheetNames.filter(sheetName => 
        sheetName.toLowerCase().includes(lastWord)
    );
    
    if (oneWordMatches.length > 0) {
        console.log(`[FUZZY] Match 1 t? (${oneWordMatches.length}):`, oneWordMatches);
        return oneWordMatches[0];
    }
    
    // **CHI?N LU?C 4: FUZZY MATCHING - T? DÀI NH?T**
    // (thu?ng là t? ch?a n?i dung chính)
    const longestWord = words.reduce((a, b) => a.length >= b.length ? a : b, '');
    if (longestWord.length > 3) {
        console.log(`[FUZZY] Th? t? dài nh?t: "${longestWord}"`);
        const fuzzyMatches = allSheetNames.filter(sheetName => 
            sheetName.toLowerCase().includes(longestWord)
        );
        if (fuzzyMatches.length > 0) {
            console.log(`[FUZZY] Match t? dài (${fuzzyMatches.length}):`, fuzzyMatches);
            return fuzzyMatches[0];
        }
    }
    
    console.log(`[FUZZY] ?? Không tìm du?c sheet match cho "${assignmentName}"`);
    return null;
}

/**
 * L?y danh sách t?t c? tên sheet t? spreadsheet
 * @param {string} spreadsheetId - ID c?a spreadsheet
 * @returns {Promise<Array>} - Danh sách tên sheet
 */
async function getAllSheetNames(spreadsheetId) {
    try {
        const response = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: spreadsheetId,
            fields: 'sheets(properties(title))'
        });
        
        const sheets = response.result.sheets || [];
        return sheets.map(s => s.properties.title);
    } catch (err) {
        console.error('[SHEETS] L?i l?y danh sách sheet:', err);
        return [];
    }
}

/**
 * C?p nh?t th?ng kê s? lu?ng n?p bài
 */
async function updateSubmissionStats() {
    const statsDiv = document.getElementById('submission-stats');
    const submittedCountSpan = document.getElementById('submitted-count');
    const totalStudentsSpan = document.getElementById('total-students');
    
    if (!activeAssignment || !activeAssignment.name) {
        if (statsDiv) statsDiv.classList.add('hidden');
        return;
    }
    
    const classId = classProfileSelectValue ? classProfileSelectValue.value : (classProfileSelect ? classProfileSelect.value : '');
    const profile = classProfiles.find(p => p.id === classId);
    
    if (!profile || !profile.sheetId) {
        if (statsDiv) statsDiv.classList.add('hidden');
        return;
    }
    
    try {
        // 1. L?y tên sheet th?c t? t? config Sheet (c?t F)
        let sheetNameToUse = null;
        
        try {
            // Ð?c c?u hình bài t?p t? sheet C?u Hình
            const configResponse = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: profile.sheetId,
                range: 'C?u Hình!A:F'
            });
            
            const rows = configResponse.result.values || [];
            // Tìm hàng có tên assignment = activeAssignment.name
            for (let i = 1; i < rows.length; i++) {
                if (rows[i] && rows[i][0] === activeAssignment.name) {
                    // C?t F (index 5) là tên sheet
                    const configuredSheetName = rows[i][5];
                    if (configuredSheetName) {
                        sheetNameToUse = configuredSheetName;
                        console.log(`[STATS] Tìm du?c tên sheet t? config: "${sheetNameToUse}"`);
                    }
                    break;
                }
            }
        } catch (configErr) {
            console.warn('[STATS] Không th? d?c config:', configErr);
        }
        
        // 2. N?u không tìm du?c t? config, dùng fuzzy matching
        if (!sheetNameToUse) {
            console.log('[STATS] Sheet chua có trong config, th? fuzzy matching...');
            
            // L?y danh sách t?t c? sheet
            const allSheets = await getAllSheetNames(profile.sheetId);
            console.log('[STATS] Danh sách sheet:', allSheets);
            
            // Tìm sheet match b?ng fuzzy matching
            sheetNameToUse = findAssignmentSheetByFuzzyMatch(activeAssignment.name, allSheets);
            
            if (sheetNameToUse) {
                console.log(`[STATS] Fuzzy matching tìm du?c: "${sheetNameToUse}"`);
            } else {
                console.warn(`[STATS] Không tìm du?c sheet cho "${activeAssignment.name}"`);
                if (statsDiv) statsDiv.classList.add('hidden');
                return;
            }
        }
        
        // 3. Ð?m t?ng s? h?c sinh t? sheet
        const totalStudents = await countStudentsInSheet(profile.sheetId, sheetNameToUse);
        
        // 4. Ð?m s? ngu?i n?p t? b?ng tình tr?ng (lo?i b? "overdue")
        const submissionItems = document.querySelectorAll('#submission-status-list li[data-status]');
        let submittedCount = 0;
        submissionItems.forEach(item => {
            const status = item.dataset.status;
            if (status && status !== 'overdue') {
                submittedCount++;
            }
        });
        
        // 5. C?p nh?t UI
        if (submittedCountSpan) submittedCountSpan.textContent = submittedCount;
        if (totalStudentsSpan) totalStudentsSpan.textContent = totalStudents;
        if (statsDiv) statsDiv.classList.remove('hidden');
        
        console.log(`[STATS] ${activeAssignment.name}: ${submittedCount}/${totalStudents} h?c sinh dã n?p (sheet: "${sheetNameToUse}")`);
    } catch (err) {
        console.error('[STATS] L?i c?p nh?t th?ng kê:', err);
        if (statsDiv) statsDiv.classList.add('hidden');
    }
}

/**
 * Hi?n th? thông báo có phiên b?n m?i
 */
function showUpdateNotification(updateInfo) {
    const { version, downloadUrl, changelog } = updateInfo;
    
    const message = `
?? Có phiên b?n m?i: ${version}

?? Nh?ng thay d?i:
${changelog || 'Xem chi ti?t khi t?i v?'}

?? D? li?u c?a b?n s? du?c gi? nguyên sau khi c?p nh?t.

B?n có mu?n t?i v? ngay không?
    `.trim();
    
    if (confirm(message)) {
        window.open(downloadUrl, '_blank');
    }
}

// ==================================================================
// AI AUTO-ROTATE: Phát hi?n hu?ng van b?n b?ng Tesseract.js OCR
// ==================================================================

/**
 * L?y cài d?t AI auto-rotate t? localStorage
 */
function isAIAutoRotateEnabled() {
    const setting = localStorage.getItem('ai_auto_rotate_enabled');
    return setting === 'true'; // M?c d?nh false n?u chua set
}

/**
 * Luu cài d?t AI auto-rotate vào localStorage
 */
function saveAIAutoRotateSetting(enabled) {
    localStorage.setItem('ai_auto_rotate_enabled', enabled ? 'true' : 'false');
}

/**
 * Phát hi?n góc xoay c?a ?nh b?ng AI OCR (Tesseract.js)
 * @param {Blob} imageBlob - ?nh c?n ki?m tra
 * @returns {Promise<number>} - Góc c?n xoay: 0, 90, 180, 270
 */
async function detectTextOrientation(imageBlob) {
    let worker = null;
    try {
        console.log('[AI] B?t d?u phân tích hu?ng van b?n...');
        
        // Resize ?nh xu?ng 800px d? AI x? lý nhanh hon
        const resizedBlob = await resizeImageBlob(imageBlob, 800);
        
        // 1. Kh?i t?o worker v?i ngôn ng? 'eng'
        // V?n dùng 'eng' d? có model LSTM chu?n, tránh l?i "LSTM not present"
        worker = await Tesseract.createWorker('eng');
        
        // 2. QUAN TR?NG: Dùng hàm detect() thay vì recognize()
        // Hàm này chuyên dùng cho OSD (Orientation & Script Detection)
        // Nó t? d?ng x? lý ch? d? quét phù h?p mà không gây crash
        const result = await worker.detect(resizedBlob);
        const data = result.data;
        
        // 3. K?t qu?
        const detectedAngle = data.orientation_degrees || 0;
        const confidence = data.orientation_confidence || 0;
        
        console.log(`[AI] K?t qu?: góc=${detectedAngle}°, confidence=${confidence.toFixed(1)}`);
        
        await worker.terminate();
        
        // Ngu?ng tin c?y (detection confidence thu?ng th?p hon recognition, > 2 là khá ?n)
        if (confidence > 2) {
            console.log(`[AI] ? Tin c?y ? Áp d?ng xoay ${detectedAngle}°`);
            return detectedAngle;
        }
        
        console.log(`[AI] ? Ð? tin c?y th?p (${confidence}) ? B? qua`);
        return 0;
        
    } catch (err) {
        console.error('[AI] ? L?i phát hi?n hu?ng:', err);
        // Ð?m b?o kill worker n?u có l?i d? gi?i phóng RAM
        if (worker) {
            try { await worker.terminate(); } catch(e) {}
        }
        return 0; // Fallback: không xoay
    }
}

/**
 * Resize ?nh d? gi?m kích thu?c (tang t?c d? AI)
 */
async function resizeImageBlob(blob, maxWidth) {
    return new Promise((resolve) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        img.onload = () => {
            let width = img.width;
            let height = img.height;
            
            // Ch? resize n?u ?nh l?n hon maxWidth
            if (width > maxWidth) {
                const ratio = maxWidth / width;
                width = maxWidth;
                height = height * ratio;
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((resizedBlob) => {
                resolve(resizedBlob || blob);
            }, blob.type || 'image/jpeg', 0.9);
        };
        
        img.onerror = () => resolve(blob); // Fallback: dùng ?nh g?c
        img.src = URL.createObjectURL(blob);
    });
}

/**
 * Init AI auto-rotate checkbox event listener
 */
function initAIAutoRotateCheckbox() {
    const checkbox = document.getElementById('ai_auto_rotate_enabled');
    if (!checkbox) return;
    
    // Load setting
    checkbox.checked = isAIAutoRotateEnabled();
    
    // Save on change
    checkbox.addEventListener('change', (e) => {
        saveAIAutoRotateSetting(e.target.checked);
        updateStatus(`? ${e.target.checked ? 'B?t' : 'T?t'} AI t? d?ng xoay ?nh`);
    });
}

// G?i init khi DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAIAutoRotateCheckbox);
} else {
    initAIAutoRotateCheckbox();
}

