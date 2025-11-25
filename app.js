// ==================================================================
// APP.JS - PHIÊN BẢN TÍCH HỢP ĐẦY ĐỦ (HARDCODED TEMPLATES)
// ==================================================================

const { jsPDF } = window.jspdf;
const { PDFDocument, rgb } = window.PDFLib;

const API_KEY = ""; // Để trống
const CLIENT_ID = "537125658544-f5j4rh872q8412rkfoffrs7nt7fahjun.apps.googleusercontent.com";

// --- CẤU HÌNH ID MẪU (HARDCODED) ---
const TEMPLATE_FORM_ID = "1I9u9P3MlP4623JPnRpjuiySHxGl0z6mSOOGCxbCI3Pg";
const TEMPLATE_SHEET_ID = "1J18DezSL6Y-doQw7NMox8o14qzQeixsTM1AI1-9LnQg";

// --- CẤU HÌNH AUTO-UPDATE ---
const CURRENT_VERSION = "1.1.1"; // Phiên bản hiện tại
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
const SCOPES = "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/forms";

let tokenClient;
let gapiInited = false;
let gisInited = false;

// --- DOM Elements Cũ ---
const authButton = document.getElementById('authorize_button');
const signoutButton = document.getElementById('signout_button');
const processButton = document.getElementById('process_button');
const openSettingsButton = document.getElementById('open_settings_button');
const autoRefreshButton = document.getElementById('auto_refresh_button');
const autoRefreshIcon = document.getElementById('auto_refresh_icon');
const autoRefreshText = document.getElementById('auto_refresh_text');

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

// --- [NEW] DOM Elements Mới ---
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
    classProfileText.textContent = name || '-- Chọn lớp --';

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
    statusLog.innerHTML = '<div class="log-entry text-outline">Đã xóa nhật ký.</div>';
};

window.onload = function () {
    initApp();
};

function initApp() {
    statusLog.innerHTML = '<div class="log-entry text-outline">Khởi tạo ứng dụng...</div>';

    initTheme();
    loadClassProfiles();
    loadActiveClass();
    loadSubmissionStatusFromCache();
    loadLoginHint();

    // [NEW] Load System Config (Chỉ load Root Folder)
    if (localStorage.getItem('root_folder_id') && inpRootFolderId) inpRootFolderId.value = localStorage.getItem('root_folder_id');

    // Set initial state of auto-refresh switch
    if (localStorage.getItem('autoRefreshState') === 'on') {
        isAutoRefreshOn = true;
        updateAutoRefreshUI(true);
    }

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

    updateStatus("✓ Sẵn sàng. Chọn Lớp & Đăng nhập.");
    checkSystemReady();
}

function loadLoginHint() {
    const savedEmail = localStorage.getItem('login_hint_email');
    if (savedEmail) {
        LOGIN_HINT = savedEmail;
        updateStatus(`✓ Gợi ý đăng nhập: ${savedEmail}`);
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

    if (btnOpenSheet) btnOpenSheet.onclick = () => {
        const profile = getClassProfile(classProfileSelect.value);
        if (profile && profile.sheetLink) window.open(profile.sheetLink, '_blank');
        else updateStatus("⚠ Lớp này chưa liên kết Sheet.", true);
    };

    if (btnOpenForm) {
        btnOpenForm.onclick = () => {
            const profile = getClassProfile(classProfileSelect.value);
            if (profile && profile.formLink) window.open(profile.formLink, '_blank');
            else updateStatus("⚠ Lớp này chưa liên kết Form.", true);
        };
        
        btnOpenForm.oncontextmenu = (e) => {
            e.preventDefault();
            const profile = getClassProfile(classProfileSelect.value);
            if (profile && (profile.formShortLink || profile.formLink)) {
                const linkToCopy = profile.formShortLink || profile.formLink;
                navigator.clipboard.writeText(linkToCopy).then(() => {
                    updateStatus(`✓ Đã copy link Form: ${linkToCopy}`);
                }).catch(err => {
                    console.error('Lỗi copy:', err);
                    updateStatus("⚠ Không thể copy link.", true);
                });
            } else {
                updateStatus("⚠ Lớp này chưa có link Form.", true);
            }
        };
    }

    if (btnSaveSystemConfig) btnSaveSystemConfig.onclick = () => {
        localStorage.setItem('root_folder_id', inpRootFolderId.value);
        updateStatus("✓ Đã lưu ID Thư mục cha.");
    }
}

function updateQuickActionsState() {
    const profile = getClassProfile(classProfileSelect.value);
    const statusText = document.getElementById('system_status_text');
    if (profile) {
        btnOpenDrive.disabled = !(profile.id || profile.folderLink);
        btnOpenSheet.disabled = !profile.sheetLink;
        btnOpenForm.disabled = !profile.formLink;
        if (statusText) statusText.textContent = "Sẵn sàng";
    } else {
        btnOpenDrive.disabled = true;
        btnOpenSheet.disabled = true;
        btnOpenForm.disabled = true;
        if (statusText) statusText.textContent = "Chưa chọn lớp";
    }
}

function getClassProfile(id) {
    return classProfiles.find(p => p.id === id);
}

// ==================================================================
// PHẦN QUẢN LÝ CÀI ĐẶT CHUNG & MODAL
// ==================================================================

function bindClassManagementEvents() {
    classProfileSelect.onchange = handleClassSelectChange;

    addClassButton.onclick = () => {
        clearClassForm();
        classModalTitle.textContent = "Tạo Lớp Mới";
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
        if (confirm(`Bạn có chắc chắn muốn xóa lớp "${className}" không? Hành động này không thể hoàn tác.`)) {
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
    activeAssignment = { name, folderId };
    updateAssignmentSelectionUI();
    updateStatus(`→ Đổi sang loại bài tập: ${name}`);
    loadSubmissionStatusFromCache();
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
        assignmentButtonsContainer.innerHTML = '<p class="text-sm text-outline px-2">Lớp này chưa có loại bài tập nào được cấu hình.</p>';
        return;
    }

    // Filter out "File responses" folders
    const validAssignments = currentProfile.assignments.filter(a => 
        !a.name.toLowerCase().includes('file responses')
    );

    if (validAssignments.length === 0) {
        assignmentButtonsContainer.innerHTML = '<p class="text-sm text-outline px-2">Lớp này chưa có loại bài tập hợp lệ.</p>';
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
            updateStatus(`→ Mở thư mục: "${folderName || folderId}"`);
            window.open(driveUrl, '_blank');
        }
    }
}

async function reprocessAndDownload(folderId, folderName) {
    updateStatus(`→ Tải lại: "${folderName}"`);
    processButton.disabled = true;

    const sanitizedName = folderName.replace(/[^a-zA-Z0-9]/g, '-');
    const statusElement = document.getElementById(`status-${sanitizedName}`);
    let originalText = '';

    if (statusElement) {
        originalText = statusElement.querySelector('span:last-child').textContent;
        statusElement.classList.remove('bg-primary-container', 'text-on-primary-container', 'bg-purple-100', 'text-purple-900', 'dark:bg-purple-900/30', 'dark:text-purple-200', 'submission-item-processed');
        statusElement.classList.add('bg-secondary-container', 'text-on-secondary-container', 'animate-pulse');
        statusElement.querySelector('span:last-child').textContent = 'Đang tải lại...';
    }

    try {
        const folderTypeName = activeAssignment ? activeAssignment.name : "Bài tập";
        const wasSuccessful = await processSingleFolder(folderId, folderName, folderTypeName);

        if (wasSuccessful) {
            updateStatus(`✓ Tải lại thành công: "${folderName}"`);
        } else {
            updateStatus(`✗ Tải lại thất bại: "${folderName}".`, true);
        }
    } catch (error) {
        const errorMessage = error.message || (error.result ? error.result.error.message : 'Lỗi không xác định');
        updateStatus(`✗ Lỗi nghiêm trọng khi tải lại "${folderName}": ${errorMessage}`, true);
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
    autoRefreshButton.onclick = toggleAutoRefresh;
}

function loadClassProfiles() {
    // Save current selection
    const currentSelection = classProfileSelect ? classProfileSelect.value : classProfileSelectValue.value;

    classProfiles = JSON.parse(localStorage.getItem('classProfiles')) || [];
    
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
            classProfileSelect.innerHTML = '<option value="">-- Chưa có lớp nào --</option>';
        }
        if (classProfileList) {
            const li = document.createElement('li');
            li.className = 'custom-dropdown-item';
            li.dataset.value = '';
            li.textContent = '-- Chưa có lớp nào --';
            li.onclick = () => selectClass('', '-- Chưa có lớp nào --');
            classProfileList.appendChild(li);
        }
        if (classProfileText) {
            classProfileText.textContent = '-- Chưa có lớp nào --';
        }
        return;
    }
    
    // Add default option
    if (classProfileSelect) {
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "-- Chọn một lớp --";
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
        updateStatus("⚠ Vui lòng chọn một lớp.");
        clearClassForm();
        editClassButton.disabled = true;
        submissionStatusList.innerHTML = '<div class="text-outline">Chọn lớp và bắt đầu xử lý để xem tình trạng...</div>';
        activeAssignment = null;
        updateAssignmentSelectionUI();
        if (isAutoRefreshOn) stopAutoRefresh();
        checkSystemReady();
        updateQuickActionsState(); // [NEW]
        return;
    }

    localStorage.setItem('activeClassProfileId', selectedId);
    const selectedProfile = classProfiles.find(p => p.id === selectedId);
    updateStatus(`✓ Lớp đang hoạt động: ${selectedProfile.name}`);

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
        classProfileSelect.value = activeId;
        updateStatus(`✓ Lớp đang hoạt động: ${profile.name}`);
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

    classModalTitle.textContent = "Sửa Lớp: " + profile.name;
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

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'm3-button m3-button-icon remove-chip-btn p-1 w-7 h-7 flex items-center justify-center rounded-full hover:bg-error/10';
    removeBtn.title = 'Xóa';
    removeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-error"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    removeBtn.onclick = () => chip.remove();

    chip.appendChild(icon);
    chip.appendChild(label);
    chip.appendChild(removeBtn);
    assignmentTypesContainer.appendChild(chip);
}

function createAssignmentInputRow() {
    const chip = document.createElement('div');
    chip.className = 'assignment-chip';
    chip.dataset.isNew = "true";

    // Icon cho chip mới
    const icon = document.createElement('span');
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
    icon.className = 'opacity-70 flex items-center justify-center';
    icon.style.display = 'flex';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'm3-input flex-1';
    input.placeholder = 'Nhập tên bài tập...';
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
        updateStatus("✗ Lỗi: Tên Lớp là bắt buộc.", true);
        formClassName.focus();
        return;
    }

    saveClassProfileButton.disabled = true;
    updateStatus(`🚀 Đang lưu lớp "${name}"...`);

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
                updateStatus("✗ Lỗi: Cần ID Thư mục cha để tạo lớp mới. Vui lòng vào Cài đặt > Tự động hóa.", true);
                alert("Vui lòng vào Cài đặt -> Tự động hóa để nhập ID Thư mục cha (Root) trước.");
                throw new Error("Missing Root Folder ID");
            }
            updateStatus(`→ Đang tạo thư mục cho lớp "${name}"...`);
            const folder = await apiCreateFolder(name, rootId);
            classFolderId = folder.id;
            folderLink = folder.webViewLink;
            updateStatus(`✓ Đã tạo thư mục lớp: ${classFolderId}`);
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
                    updateStatus(`→ Đang tạo thư mục bài tập "${assignmentName}"...`);
                    const assignmentFolder = await apiCreateFolder(assignmentName, classFolderId);
                    folderId = assignmentFolder.id;
                    updateStatus(`✓ Đã tạo thư mục: ${assignmentName}`);
                    assignments.push({
                        name: assignmentName,
                        folderId: folderId
                    });
                }
            } else {
                updateStatus(`⚠ Cảnh báo: Bỏ qua loại bài tập không có tên.`, true);
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
                    updateStatus(`✓ Đã cập nhật lớp và tạo thư mục: ${name}`);
                }
            } else { // it was a completely new class
                classProfiles.push(newProfile);
                updateStatus(`✓ Đã tạo lớp mới: ${name}`);
            }
        } else { // Just a normal update
            const profileIndex = classProfiles.findIndex(p => p.id === originalClassId);
            if (profileIndex > -1) classProfiles[profileIndex] = newProfile;
            updateStatus(`✓ Đã cập nhật lớp: ${name}`);
        }

        // [NEW] Nếu có sheetId và có assignments, ghi vào config và tạo sheets
        if (newProfile.sheetId && assignments.length > 0) {
            try {
                updateStatus(`→ Đang xử lý bài tập...`);
                
                // 1. Tạo folder cho assignments mới (nếu chưa có)
                for (const assignment of assignments) {
                    if (!assignment.folderId) {
                        updateStatus(`   → Tạo folder "${assignment.name}"...`);
                        const assignmentFolder = await apiCreateFolder(assignment.name, newProfile.id);
                        assignment.folderId = assignmentFolder.id;
                        updateStatus(`   ✓ Đã tạo folder`);
                    }
                }
                
                // 2. Ghi vào Config sheet
                updateStatus(`   → Ghi cấu hình vào Sheet...`);
                await apiWriteAssignmentsToConfig(newProfile.sheetId, assignments);
                updateStatus(`   ✓ Đã ghi ${assignments.length} bài tập vào Config`);
                
                // 3. Update Form choices
                if (newProfile.formId) {
                    updateStatus(`   → Cập nhật lựa chọn Form...`);
                    await apiUpdateFormChoices(newProfile.formId, assignments);
                    updateStatus(`   ✓ Đã cập nhật Form`);
                }
                
                updateStatus(`✓ Hoàn tất xử lý ${assignments.length} bài tập`);
            } catch (error) {
                console.error('Lỗi khi ghi config:', error);
                updateStatus(`⚠ Đã lưu lớp nhưng không thể xử lý bài tập hoàn toàn: ${error.message}`, true);
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
        const errorMessage = error.message || (error.result ? error.result.error.message : 'Lỗi không xác định');
        updateStatus(`✗ Lỗi nghiêm trọng khi lưu lớp: ${errorMessage}`, true);
        console.error(error);
    } finally {
        saveClassProfileButton.disabled = false;
    }
}

// [NEW] Auto Create Function (using Hardcoded Templates)
async function createClassSystemAutomatic() {
    const name = formClassName.value.trim();
    const rootId = inpRootFolderId.value.trim();

    // Sử dụng hằng số thay vì lấy từ input
    const tmplSheetId = TEMPLATE_SHEET_ID;
    const tmplFormId = TEMPLATE_FORM_ID;

    if (!name || !rootId) {
        updateStatus("✗ Lỗi: Thiếu tên lớp hoặc cấu hình Thư mục cha.", true);
        if (!rootId) {
            alert("Vui lòng vào Cài đặt -> Tự động hóa để nhập ID Thư mục cha (Root) trước.");
        }
        return;
    }

    updateStatus(`🚀 Đang tạo hệ thống cho "${name}"... Vui lòng chờ.`);
    saveClassProfileButton.disabled = true;
    
    // Đóng modal ngay khi bắt đầu tạo
    classFormModal.setAttribute('aria-hidden', 'true');
    
    // Scroll to status log để user theo dõi tiến trình
    setTimeout(() => {
        const statusLog = document.getElementById('status-log');
        if (statusLog) {
            statusLog.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 300);

    try {
        // 1. Tạo Folder Lớp
        updateStatus("1. Đang tạo Folder...");
        const folder = await apiCreateFolder(name, rootId);
        updateStatus(`✓ Đã tạo Folder: ${folder.id}`);
        
        // 1.1. Tạo subfolder "Học sinh" để chứa folder riêng của từng học sinh
        updateStatus("   → Tạo thư mục 'Học sinh'...");
        const studentFolder = await apiCreateFolder("Học sinh", folder.id);
        updateStatus(`   ✓ Đã tạo thư mục Học sinh: ${studentFolder.id}`);

        // 2. Copy Form
        updateStatus("2. Đang tạo Form...");
        const form = await apiCopyFile(tmplFormId, `Biểu mẫu nộp bài - ${name}`, folder.id);
        updateStatus(`✓ Đã tạo Form: ${form.id}`);
        
        // 2.0. LƯU Ý: FORM CẦN PUBLISH THỦ CÔNG
        // Forms API không hỗ trợ publish form từ client-side
        // Form mới tạo luôn ở trạng thái DRAFT (chưa xuất bản)
        updateStatus("   ⚠ LƯU Ý: Form cần PUBLISH THỦ CÔNG để nhận câu trả lời");
        updateStatus(`   → Mở form tại: https://docs.google.com/forms/d/${form.id}/edit`);
        updateStatus("   → Click 'Send' ở góc trên bên phải để publish form");
        
        // 2.1. [DISABLED] Rename Form's script project
        // NOTE: Đổi tên Apps Script Project từ client-side rất khó và không ổn định.
        // GIẢI PHÁP TỐT HƠN: Dùng Apps Script bound script gọi Drive.Files.update()
        // Xem: LibraryFormScript.txt - hàm autoRenameScriptProject()
        // 
        // Code cũ (REST API - không ổn định):
        /*
        try {
            updateStatus("   → Đang đổi tên Script của Form...");
            
            const formInfoResponse = await gapi.client.request({
                path: `https://forms.googleapis.com/v1/forms/${form.id}`,
                method: 'GET'
            });
            
            const linkedScriptId = formInfoResponse.result.linkedSheetId || null;
            let formScriptId = null;
            
            if (linkedScriptId) {
                formScriptId = linkedScriptId;
            } else {
                for (let attempt = 1; attempt <= 3; attempt++) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    const searchResponse = await gapi.client.drive.files.list({
                        q: `'${form.id}' in parents and mimeType='application/vnd.google-apps.script' and trashed=false`,
                        fields: 'files(id)',
                        pageSize: 1
                    });
                    
                    if (searchResponse.result.files?.length > 0) {
                        formScriptId = searchResponse.result.files[0].id;
                        break;
                    }
                    
                    if (attempt < 3) updateStatus(`   → Thử lại (${attempt}/3)...`);
                }
            }
            
            if (formScriptId) {
                await gapi.client.drive.files.update({
                    fileId: formScriptId,
                    resource: { name: name }
                });
                updateStatus(`   ✓ Đã đổi tên Script Form: "${name}"`);
            } else {
                updateStatus(`   ⚠ Script chưa sẵn sàng, sẽ có tên mặc định`);
            }
        } catch (err) {
            console.warn('Không thể đổi tên script của form:', err);
            updateStatus(`   ⚠ Bỏ qua đổi tên Script Form`);
        }
        */
        updateStatus(`   ℹ Script Form sẽ giữ tên mặc định (đổi tên thủ công nếu cần)`);

        // 3. Copy Sheet
        updateStatus("3. Đang tạo Sheet...");
        const sheet = await apiCopyFile(tmplSheetId, `Bảng nhận xét - ${name}`, folder.id);
        updateStatus(`✓ Đã tạo Sheet: ${sheet.id}`);
        
        // 3.1. [DISABLED] Rename Sheet's script project
        // NOTE: Tương tự Form, đổi tên Apps Script Project từ client-side không ổn định.
        // GIẢI PHÁP TỐT HƠN: Dùng Apps Script bound script gọi Drive.Files.update()
        // Xem: LibrarySheetScript.txt - hàm autoRenameScriptProject()
        // 
        // Code cũ (REST API - không ổn định):
        /*
        try {
            updateStatus("   → Đang đổi tên Script của Sheet...");
            
            let sheetScriptId = null;
            
            for (let attempt = 1; attempt <= 3; attempt++) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                const searchResponse = await gapi.client.drive.files.list({
                    q: `'${sheet.id}' in parents and mimeType='application/vnd.google-apps.script' and trashed=false`,
                    fields: 'files(id)',
                    pageSize: 1
                });
                
                if (searchResponse.result.files?.length > 0) {
                    sheetScriptId = searchResponse.result.files[0].id;
                    break;
                }
                
                if (attempt < 3) updateStatus(`   → Thử lại (${attempt}/3)...`);
            }
            
            if (sheetScriptId) {
                await gapi.client.drive.files.update({
                    fileId: sheetScriptId,
                    resource: { name: name }
                });
                updateStatus(`   ✓ Đã đổi tên Script Sheet: "${name}"`);
            } else {
                updateStatus(`   ⚠ Script chưa sẵn sàng, sẽ có tên mặc định`);
            }
        } catch (err) {
            console.warn('Không thể đổi tên script của sheet:', err);
            updateStatus(`   ⚠ Bỏ qua đổi tên Script Sheet`);
        }
        */
        updateStatus(`   ℹ Script Sheet sẽ giữ tên mặc định (đổi tên thủ công nếu cần)`);

        // 4. Ghi Config vào Sheet
        updateStatus("4. Đang cấu hình Sheet...");
        // 4. Ghi Config vào Sheet
        updateStatus("4. Đang cấu hình Sheet...");
        await apiUpdateSheetConfig(sheet.id, name, folder.id, form.id, studentFolder.id);
        
        // 4.1. Ghi email người dùng vào config
        const userEmail = LOGIN_HINT || (gapi.client.getToken() ? await getUserEmail() : null);
        if (userEmail) {
            updateStatus(`   → Ghi email người quản lý: ${userEmail}`);
            await apiWriteUserEmailToConfig(sheet.id, userEmail);
        }

        // 5. Write Assignments to Config sheet
        const chips = Array.from(assignmentTypesContainer.querySelectorAll('.assignment-chip'));
        const assignments = [];
        
        if (chips.length > 0) {
            updateStatus(`5. Đang tạo ${chips.length} thư mục bài tập...`);
            
            for (const chip of chips) {
                const assignmentName = chip.dataset.name;
                if (assignmentName) {
                    updateStatus(`   → Tạo thư mục "${assignmentName}"...`);
                    const assignmentFolder = await apiCreateFolder(assignmentName, folder.id);
                    assignments.push({
                        name: assignmentName,
                        folderId: assignmentFolder.id
                    });
                    updateStatus(`   ✓ Đã tạo: ${assignmentName}`);
                }
            }
            
            // Ghi vào sheet Cấu Hình
            if (assignments.length > 0) {
                updateStatus("7. Đang ghi cấu hình bài tập vào Sheet...");
                await apiWriteAssignmentsToConfig(sheet.id, assignments);
                updateStatus(`✓ Đã ghi ${assignments.length} loại bài tập vào sheet Cấu Hình`);
                
                // 7.1. Update Form choices
                updateStatus("8. Đang cập nhật Form với danh sách bài tập...");
                await apiUpdateFormChoices(form.id, assignments);
                updateStatus(`✓ Đã cập nhật Form với ${assignments.length} lựa chọn`);
            }
            
            // 8.1. Create assignment sheets automatically
            if (assignments.length > 0) {
                updateStatus("9. Đang tạo sheet cho từng loại bài tập...");
                await apiCreateAssignmentSheets(sheet.id, assignments);
                updateStatus(`✓ Đã tạo ${assignments.length} sheet nhận xét`);
            }
        }

        // 10. Build form links (responder link from form ID)
        updateStatus("10. Đang tạo link Form...");
        const formEditLink = `https://docs.google.com/forms/d/${form.id}/edit`;
        
        // Build responder link manually - this works even if form not opened yet
        // Extract the file ID and construct viewform link
        const formShortLink = `https://docs.google.com/forms/d/${form.id}/viewform`;
        
        updateStatus(`✓ Đã tạo link Form`);
        
        // Open form in new tab
        window.open(formEditLink, '_blank');
        updateStatus(`   → Đã mở Form editor`);
        
        // Hướng dẫn link form-sheet thủ công
        updateStatus(`📌 STEP 3: Liên kết Form với Sheet`);
        updateStatus(`   → Đang mở Sheet...`);
        window.open(sheet.webViewLink, '_blank');
        
        updateStatus(`⚠ QUAN TRỌNG: Cần liên kết Form với Sheet thủ công:`);
        updateStatus(`   1. Quay lại Form editor (tab mở trước)`);
        updateStatus(`   2. Tab "Responses" → icon 3 chấm`);
        updateStatus(`   3. "Select response destination"`);
        updateStatus(`   4. Chọn sheet "${name}" vừa mở`);
        updateStatus(`   5. Xong! Form sẽ tự động ghi responses`);

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
            formId: form.id,
            studentFolderId: studentFolder.id  // Thêm ID folder học sinh
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

        updateStatus(`🎉 Hoàn tất! Đã tạo lớp "${name}" với ${assignments.length} loại bài tập.`);
        updateStatus(`\n📌 SETUP QUY TRÌNH (3 bước dưới đây):`);
        updateStatus(`\n📌 STEP 1: Setup Form Script`);
        
        // Auto-open Form Apps Script editor with instructions
        const formScriptUrl = `https://script.google.com/home/projects/${form.id}/edit`;
        updateStatus(`⚙️ Đang mở Apps Script editor...`);
        
        // Wait a bit then show confirmation
        setTimeout(() => {
            const shouldOpen = confirm(
                `✅ Lớp "${name}" đã được tạo!\n\n` +
                `📌 STEP 1: Setup Form Script (tự động - 1 phút)\n\n` +
                `Bước 1: Click OK để mở Form Apps Script editor\n` +
                `Bước 2: Chọn Run → quickSetupForm\n` +
                `Bước 3: Click Run ▶️ và authorize\n` +
                `Bước 4: Chờ xong, close tab này\n\n` +
                `Form sẽ tự động:\n` +
                `✓ Đổi tên Project\n` +
                `✓ Kích hoạt triggers\n` +
                `✓ Sẵn sàng nhận bài nộp!`
            );
            
            if (shouldOpen) {
                window.open(formScriptUrl, '_blank');
                updateStatus(`📖 Đã mở Form Apps Script. Run → quickSetupForm → ▶️ Authorize`);
                updateStatus(`💡 Sau khi xong: Quay lại tab này để làm STEP 2`);
            } else {
                updateStatus(`⚠️ Nhớ setup Form script sau: ${formScriptUrl}`);
            }
        }, 500);
        
    } catch (e) {
        updateStatus(`✗ Lỗi tạo tự động: ${e.message || e.result?.error?.message}`, true);
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

async function apiUpdateSheetConfig(spreadsheetId, className, folderId, formId, studentFolderId) {
    // Ghi vào cột I:
    // I1: Tên lớp
    // I3: Folder ID
    // I4: Sheet ID
    // I5: Form ID
    // I6: Student Folder ID (mới thêm)
    const updates = [
        {
            range: 'Cấu Hình!I1',
            values: [[className]]
        },
        {
            range: 'Cấu Hình!I3',
            values: [[folderId]]
        },
        {
            range: 'Cấu Hình!I4',
            values: [[spreadsheetId]]
        },
        {
            range: 'Cấu Hình!I5',
            values: [[formId]]
        },
        {
            range: 'Cấu Hình!I6',
            values: [[studentFolderId || '']]
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
    // Google Forms API không hỗ trợ set destination sau khi form đã được tạo
    // Phương pháp duy nhất: Dùng responderUri để form tự động link khi có response đầu tiên
    // HOẶC user phải link thủ công trong Form UI
    
    try {
        console.log('[FORM-SHEET] Đang cố gắng link form với sheet...');
        
        // Thử dùng Forms API để update linkedSheetId
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
        
        console.log('[FORM-SHEET] ✓ Đã link form với sheet qua API!');
        return updateResponse;
        
    } catch (e) {
        console.warn('[FORM-SHEET] API không cho phép link:', e);
        console.log('[FORM-SHEET] ℹ Hướng dẫn link thủ công: Form → Responses → Select response destination → Chọn sheet đã tạo');
        
        // Return null để caller biết cần hướng dẫn user
        return null;
    }
}

async function apiUpdateFormChoices(formId, assignments) {
    try {
        console.log('[FORM] Bắt đầu cập nhật form choices:', formId);
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
        const keywords = ['loại bài tập', 'bài tập', 'chọn bài', 'assignment', 'homework'];
        
        if (form.items) {
            for (const item of form.items) {
                if (item.title) {
                    const titleLower = item.title.toLowerCase();
                    for (const keyword of keywords) {
                        if (titleLower.includes(keyword)) {
                            questionItemId = item.itemId;
                            console.log(`[FORM] Tìm thấy câu hỏi: "${item.title}" (ID: ${questionItemId})`);
                            break;
                        }
                    }
                    if (questionItemId) break;
                }
            }
        }
        
        if (!questionItemId) {
            console.warn('[FORM] Không tìm thấy câu hỏi loại bài tập trong form');
            console.log('[FORM] Danh sách câu hỏi:', form.items?.map(i => i.title));
            updateStatus(`⚠️ Không tìm thấy câu hỏi "Loại bài tập" - cần update thủ công`);
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
        console.log(`[FORM] ✓ Đã cập nhật ${choices.length} lựa chọn cho câu hỏi`);
    } catch (e) {
        console.error('[FORM] Lỗi cập nhật form choices:', e);
        updateStatus(`⚠️ Lỗi cập nhật Form: ${e.result?.error?.message || e.message}`);
        // Don't throw - form still usable, just needs manual update
    }
}

async function apiSetFormScriptProperty(formId, recipientEmail) {
    // Sử dụng Apps Script API để set Script Properties cho Form
    // Cần Script ID từ Form, nhưng không có API trực tiếp
    // Giải pháp: Ghi email vào Sheet Config thay vì Form Script Properties
    console.log(`[CONFIG] Sẽ ghi email ${recipientEmail} vào Sheet config`);
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
        console.error('[EMAIL] Không thể lấy email:', e);
        return null;
    }
}

async function apiWriteUserEmailToConfig(spreadsheetId, email) {
    // Ghi email vào cell H6 của sheet Cấu Hình
    return gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Cấu Hình!I6',
        valueInputOption: 'RAW',
        resource: { values: [[email]] }
    });
}

async function apiCreateAssignmentSheets(spreadsheetId, assignments) {
    try {
        // 1. Get template sheet "(Mẫu) Bảng nhận xét"
        const sheetData = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: spreadsheetId
        });
        
        const sheets = sheetData.result.sheets;
        const templateSheet = sheets.find(s => s.properties.title === '(Mẫu) Bảng nhận xét');
        
        if (!templateSheet) {
            console.warn('[SHEETS] Không tìm thấy sheet template');
            return;
        }
        
        const templateSheetId = templateSheet.properties.sheetId;
        
        // 2. Duplicate template for each assignment
        const requests = [];
        for (const assignment of assignments) {
            requests.push({
                duplicateSheet: {
                    sourceSheetId: templateSheetId,
                    newSheetName: assignment.name,
                    insertSheetIndex: sheets.length
                }
            });
        }
        
        await gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheetId,
            resource: { requests: requests }
        });
        
        console.log(`[SHEETS] Đã tạo ${assignments.length} sheet từ template`);
        
    } catch (error) {
        console.error('[SHEETS] Lỗi tạo assignment sheets:', error);
        updateStatus(`⚠️ Lỗi tạo sheet: ${error.result?.error?.message || error.message}`);
    }
}

async function apiWriteAssignmentsToConfig(spreadsheetId, assignments) {
    if (!assignments || assignments.length === 0) {
        console.log('[CONFIG] Không có assignment nào để ghi.');
        return;
    }
    
    // 1. Đọc dữ liệu hiện có từ hàng 3 trở đi (hàng 2 dành riêng cho Điểm danh)
    let existingAssignments = [];
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Cấu Hình!A3:F1000'
        });
        existingAssignments = response.result.values || [];
    } catch (e) {
        console.log('[CONFIG] Chưa có dữ liệu cũ, tạo mới.');
    }
    
    // 2. Tạo map tên bài tập hiện có để check trùng
    const existingNames = new Set(existingAssignments.map(row => row[0])); // Cột A
    
    // 3. HÀNG 2: Luôn là "Điểm danh"
    const attendanceRow = [
        'Điểm danh',                     // A: Tên bài tập
        '',                              // B: Lịch học (bỏ trống - user tự điền)
        '',                              // C: Thời gian mở (không có cho Điểm danh)
        '',                              // D: Deadline (không có cho Điểm danh)
        true,                            // E: Tự động dọn (TRUE - dọn sheet điểm danh trước giờ học)
        'Điểm danh'                      // F: Tên sheet
    ];
    
    // 4. HÀNG 3+: Giữ lại dữ liệu cũ + thêm assignments mới
    const assignmentRows = [];
    
    // 4.1. Giữ lại dữ liệu cũ
    existingAssignments.forEach(row => {
        // Đảm bảo có đủ 6 cột
        while (row.length < 6) row.push('');
        assignmentRows.push(row);
    });
    
    // 4.2. Thêm assignments mới (chưa tồn tại)
    assignments.forEach(a => {
        const assignmentName = a.name;
        if (!existingNames.has(assignmentName) && assignmentName !== 'Điểm danh') {
            assignmentRows.push([
                assignmentName,                      // A: Tên bài tập
                '',                                  // B: Lịch học (bỏ trống - user tự điền)
                '',                                  // C: Thời gian mở (bỏ trống)
                '',                                  // D: Deadline (bỏ trống)
                false,                               // E: Tự động dọn (FALSE - user tự bật nếu cần)
                `Bảng nhận xét (${assignmentName})` // F: Tên sheet
            ]);
            console.log(`[CONFIG] Thêm assignment mới: ${assignmentName}`);
        }
    });
    
    console.log(`[CONFIG] Hàng 2: Điểm danh`);
    console.log(`[CONFIG] Hàng 3+: ${assignmentRows.length} bài tập`);
    
    // 5. Ghi hàng 2 (Điểm danh)
    await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Cấu Hình!A2:F2',
        valueInputOption: 'USER_ENTERED',
        resource: { values: [attendanceRow] }
    });
    
    // 6. Ghi các assignments vào hàng 3-10 (giữ nguyên format checkbox)
    // Template có sẵn 8 hàng trống (3-10) với checkbox ở cột E
    const maxTemplateRows = 8; // Hàng 3-10
    const rowsToWrite = assignmentRows.slice(0, maxTemplateRows);
    
    if (rowsToWrite.length > 0) {
        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `Cấu Hình!A3:F${2 + rowsToWrite.length}`,
            valueInputOption: 'USER_ENTERED',
            resource: { values: rowsToWrite }
        });
    }
    
    // 7. Xóa nội dung các hàng template còn trống (giữ format)
    if (rowsToWrite.length < maxTemplateRows) {
        const emptyStartRow = 3 + rowsToWrite.length;
        const emptyEndRow = 10;
        await gapi.client.sheets.spreadsheets.values.clear({
            spreadsheetId,
            range: `Cấu Hình!A${emptyStartRow}:F${emptyEndRow}`
        });
    }
    
    // 8. Nếu có nhiều hơn 8 assignments, append thêm (vượt quá template)
    if (assignmentRows.length > maxTemplateRows) {
        const extraRows = assignmentRows.slice(maxTemplateRows);
        await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Cấu Hình!A11:F11',
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: { values: extraRows }
        });
        console.log(`[CONFIG] ⚠ Có ${extraRows.length} bài tập vượt quá template (hàng 11+)`);
    }
    
    console.log(`[CONFIG] ✓ Đã cập nhật bảng config: Hàng 2 (Điểm danh) + ${assignmentRows.length} hàng assignments`);
    
    // Tạo các sheet bài tập từ template "(Mẫu) Bảng nhận xét"
    console.log('[SHEETS] Bắt đầu tạo sheets bài tập từ template...');
    await apiCreateAssignmentSheets(spreadsheetId, assignments);
}

/**
 * Tạo các sheet bài tập bằng cách duplicate sheet template
 * @param {string} spreadsheetId - ID của spreadsheet
 * @param {Array} assignments - Danh sách bài tập [{name: ..., folderId: ...}]
 */
async function apiCreateAssignmentSheets(spreadsheetId, assignments) {
    try {
        // 1. Lấy thông tin spreadsheet để tìm template sheet
        const spreadsheet = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId
        }).then(res => res.result);
        
        // 2. Tìm sheet có tên "(Mẫu) Bảng nhận xét"
        const templateSheet = spreadsheet.sheets.find(s => 
            s.properties.title === '(Mẫu) Bảng nhận xét'
        );
        
        if (!templateSheet) {
            console.warn('[SHEETS] Không tìm thấy sheet template "(Mẫu) Bảng nhận xét". Bỏ qua tạo sheets.');
            return;
        }
        
        const templateSheetId = templateSheet.properties.sheetId;
        const isTemplateHidden = templateSheet.properties.hidden || false;
        console.log(`[SHEETS] Tìm thấy template sheet ID: ${templateSheetId}, hidden: ${isTemplateHidden}`);
        
        // 3. Kiểm tra sheets hiện có để chỉ tạo những sheet mới
        const existingSheetNames = new Set(
            spreadsheet.sheets.map(s => s.properties.title)
        );
        
        const newAssignments = assignments.filter(assignment => {
            const sheetName = `Bảng nhận xét (${assignment.name})`;
            return !existingSheetNames.has(sheetName);
        });
        
        if (newAssignments.length === 0) {
            console.log('[SHEETS] Tất cả sheets bài tập đã tồn tại, bỏ qua.');
            return;
        }
        
        console.log(`[SHEETS] Cần tạo ${newAssignments.length}/${assignments.length} sheets mới`);
        
        // 4. Duplicate template cho mỗi assignment mới
        const requests = [];
        newAssignments.forEach((assignment, index) => {
            const newSheetName = `Bảng nhận xét (${assignment.name})`;
            
            // Request duplicate
            requests.push({
                duplicateSheet: {
                    sourceSheetId: templateSheetId,
                    insertSheetIndex: spreadsheet.sheets.length + index,
                    newSheetName: newSheetName
                }
            });
        });
        
        // 5. Thực hiện batch update để duplicate
        const batchResponse = await gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            resource: { requests }
        }).then(res => res.result);
        
        // 6. Nếu template bị ẩn, ẩn các sheets mới tạo
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
                console.log(`[SHEETS] ✓ Đã ẩn ${hideRequests.length} sheets theo template`);
            }
        }
        
        console.log(`[SHEETS] ✓ Đã tạo ${newAssignments.length} sheets bài tập từ template`);
    } catch (e) {
        console.error('[SHEETS] Lỗi khi tạo sheets từ template:', e);
        // Không throw để không làm gián đoạn quá trình tạo lớp
    }
}

function clearClassForm() {
    classModalTitle.textContent = "Tạo Lớp Mới";
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

    if (!confirm(`Xác nhận xóa lớp "${profile.name}"?\n\nSẽ xóa:\n- Folder lớp\n- Form nộp bài\n- Sheet nhận xét\n- Script projects\n- Tất cả thư mục bài tập\n\nHành động này KHÔNG THỂ hoàn tác!`)) {
        return;
    }

    updateStatus(`🗑️ Đang xóa lớp "${profile.name}"...`);

    // Delete ALL files in folder (including form, sheet, scripts) then folder
    deleteClassFolderFromDrive(idToDelete, profile).catch(err => {
        console.error('Lỗi khi xóa folder trên Drive:', err);
        updateStatus(`⚠ Đã xóa lớp khỏi hệ thống nhưng không thể xóa hoàn toàn trên Drive. Bạn có thể xóa thủ công.`);
    });

    classProfiles = classProfiles.filter(p => p.id !== idToDelete);
    localStorage.setItem('classProfiles', JSON.stringify(classProfiles));
    updateStatus(`✓ Đã xóa lớp "${profile.name}" khỏi hệ thống.`);

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
                updateStatus(`   → Đang xóa script projects...`);
                const scriptSearch = await gapi.client.drive.files.list({
                    q: `'${profile.formId}' in parents and mimeType='application/vnd.google-apps.script' and trashed=false`,
                    fields: 'files(id, name)'
                });
                
                const scripts = scriptSearch.result.files || [];
                for (const script of scripts) {
                    await gapi.client.drive.files.delete({ fileId: script.id });
                    updateStatus(`   ✓ Đã xóa script: ${script.name}`);
                }
            } catch (err) {
                console.warn('Could not delete form scripts:', err);
            }
        }
        
        // Step 2: Delete form
        if (profile && profile.formId) {
            try {
                await gapi.client.drive.files.delete({ fileId: profile.formId });
                updateStatus(`   ✓ Đã xóa Form`);
            } catch (err) {
                console.warn('Could not delete form:', err);
            }
        }
        
        // Step 3: Delete sheet
        if (profile && profile.sheetId) {
            try {
                await gapi.client.drive.files.delete({ fileId: profile.sheetId });
                updateStatus(`   ✓ Đã xóa Sheet`);
            } catch (err) {
                console.warn('Could not delete sheet:', err);
            }
        }
        
        // Step 4: List and delete all remaining files in folder
        try {
            updateStatus(`   → Đang xóa các file còn lại...`);
            const filesInFolder = await gapi.client.drive.files.list({
                q: `'${folderId}' in parents and trashed=false`,
                fields: 'files(id, name, mimeType)',
                pageSize: 100
            });
            
            const files = filesInFolder.result.files || [];
            let deletedCount = 0;
            
            for (const file of files) {
                try {
                    // Delete subfolders recursively
                    if (file.mimeType === 'application/vnd.google-apps.folder') {
                        await deleteClassFolderFromDrive(file.id, null);
                    } else {
                        await gapi.client.drive.files.delete({ fileId: file.id });
                    }
                    deletedCount++;
                } catch (err) {
                    console.warn(`Could not delete file ${file.name}:`, err);
                }
            }
            
            if (deletedCount > 0) {
                updateStatus(`   ✓ Đã xóa ${deletedCount} file/folder`);
            }
        } catch (err) {
            console.warn('Could not list folder contents:', err);
        }
        
        // Step 5: Finally delete the folder itself
        await gapi.client.drive.files.delete({
            fileId: folderId
        });
        updateStatus(`✓ Đã xóa folder lớp trên Drive`);
        
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
        submissionStatusPlaceholder.classList.add('hidden'); // Đảm bảo hoàn toàn ẩn

        // Load submission status from cache when logged in
        loadSubmissionStatusFromCache(true);

        // Auto-scan classes from Drive after login (silent mode)
        if (inpRootFolderId && inpRootFolderId.value.trim()) {
            scanAndSyncClasses(true).catch(err => {
                console.error("[AUTO-SCAN] Lỗi khi quét tự động:", err);
            });
        }

        // [FIX] Update assignment UI after login (to show buttons if class selected)
        updateAssignmentSelectionUI();

        if (!classProfileSelect.value) {
            processButton.disabled = true;
            processButton.querySelector('span').textContent = "Vui lòng chọn Lớp";
        } else if (!activeAssignment) {
            processButton.disabled = true;
            processButton.querySelector('span').textContent = "Chọn loại bài tập";
        } else {
            if (processButton.querySelector('span').textContent !== "Đang xử lý...") {
                processButton.disabled = false;
                processButton.querySelector('span').textContent = "Bắt đầu Xử lý";
            }
        }
    } else {
        authButton.style.display = 'block';
        authButton.disabled = false;
        authButton.querySelector('span').textContent = "Đăng nhập";
        signoutButton.style.display = 'none';
        processButton.style.display = 'block';
        processButton.disabled = true;

        // [FIX] Hide list, show placeholder
        submissionStatusList.style.display = 'none';
        submissionStatusList.classList.add('hidden'); // Đảm bảo hoàn toàn ẩn
        submissionStatusPlaceholder.style.display = 'block';
        submissionStatusPlaceholder.classList.remove('hidden'); // Hiển thị placeholder

        if (!classProfileSelect.value) processButton.querySelector('span').textContent = "Vui lòng chọn Lớp";
        else processButton.querySelector('span').textContent = "Vui lòng Đăng nhập";
    }
}

function gapiLoaded() {
    gapi.load('client', async () => {
        try {
            await gapi.client.init({ apiKey: API_KEY, discoveryDocs: DISCOVERY_DOCS });
            gapiInited = true;
            updateStatus("✓ GAPI sẵn sàng.");
            checkInitStatus();
        } catch (error) { updateStatus(`✗ Lỗi GAPI init: ${error.message}. Kiểm tra API Key.`, true); console.error(error); }
    });
}

function gisLoaded() {
    try {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (tokenResponse) => {
                if (tokenResponse.error) {
                    updateStatus(`✗ Lỗi Token: ${tokenResponse.error_description || tokenResponse.error}`, true);
                } else {
                    // Critical fix: Set the token for the GAPI client
                    gapi.client.setToken(tokenResponse);
                    updateStatus("✓ Đã đăng nhập.");
                    if (!LOGIN_HINT) fetchAndSaveEmailHint();
                    const savedAutoRefreshState = localStorage.getItem('autoRefreshState');
                    if (savedAutoRefreshState === 'on') startAutoRefresh();
                }
                // Always update UI after attempting to get a token
                checkSystemReady();
            },
            error_callback: (error) => {
                updateStatus(`✗ Lỗi yêu cầu token: ${error.type} - ${error.error}`, true);
                checkSystemReady();
            }
        });
        gisInited = true;
        updateStatus("✓ GIS sẵn sàng.");
        
        // Check if returning from OAuth redirect
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('code') || urlParams.has('state')) {
            updateStatus("→ Xử lý OAuth redirect...");
            // Clean URL without reloading
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        checkInitStatus();
    } catch (error) { updateStatus(`✗ Lỗi GIS init: ${error.message}. Kiểm tra Client ID.`, true); console.error(error); }
}

async function fetchAndSaveEmailHint() {
    try {
        const accessToken = gapi.client.getToken().access_token;
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (!userInfoResponse.ok) throw new Error('Không thể lấy thông tin người dùng.');
        const userInfo = await userInfoResponse.json();
        if (userInfo.email) {
            LOGIN_HINT = userInfo.email;
            localStorage.setItem('login_hint_email', userInfo.email);
            updateStatus(`✓ Đã lưu gợi ý đăng nhập: ${userInfo.email}`);
        }
    } catch (error) { updateStatus(`✗ Không thể lấy email hint: ${error.message}`, true); }
}

function checkInitStatus() {
    checkSystemReady();
    if (gapiInited && gisInited) {
        if (LOGIN_HINT) {
            updateStatus("→ Đăng nhập tự động...");
            // Try silent login immediately
            tokenClient.requestAccessToken({
                prompt: 'none',
                hint: LOGIN_HINT
            });
        } else {
            updateStatus("✓ Sẵn sàng. Vui lòng đăng nhập.");
        }
    }
}

function handleAuthClick() {
    if (tokenClient) tokenClient.requestAccessToken({ prompt: '' });
    else updateStatus("✗ Lỗi: Hệ thống Đăng nhập (GIS) chưa sẵn sàng.", true);
}

function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        LOGIN_HINT = null;
        localStorage.removeItem('login_hint_email');
        updateStatus("✓ Đã đăng xuất & xóa gợi ý.");
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
            f.name.includes('Nộp bài tập về nhà') ||
            f.name.includes('responses')
        );
        
        if (!fileResponsesFolder) {
            updateStatus('   ℹ️ Không tìm thấy folder File responses');
            return;
        }
        
        updateStatus(`   → Tìm thấy folder: ${fileResponsesFolder.name}`);
        
        // 2. Get form responses from Sheet
        const responsesData = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Form Responses 1!A2:Z1000' // Adjust range as needed
        });
        
        const responses = responsesData.result.values || [];
        if (responses.length === 0) {
            updateStatus('   ℹ️ Chưa có responses nào trong sheet');
            return;
        }
        
        // 3. Find column indices (assuming: Timestamp, Email, Name, Assignment Type, File Upload)
        const headerData = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Form Responses 1!A1:Z1'
        });
        
        const headers = headerData.result.values?.[0] || [];
        const nameColIdx = headers.findIndex(h => h && (
            h.toLowerCase().includes('tên học sinh') || 
            h.toLowerCase().includes('họ và tên') ||
            h.toLowerCase().includes('họ tên')
        ));
        const assignmentColIdx = headers.findIndex(h => h && (
            h.toLowerCase().includes('chọn bài') || 
            h.toLowerCase().includes('loại bài') ||
            h.toLowerCase().includes('bài tập')
        ));
        const fileColIdx = headers.findIndex(h => h && (
            h.toLowerCase().includes('nộp bài') ||
            h.toLowerCase().includes('tải lên') ||
            h.toLowerCase().includes('file')
        ));
        
        if (nameColIdx === -1 || assignmentColIdx === -1 || fileColIdx === -1) {
            updateStatus('   ⚠️ Không tìm thấy cột cần thiết trong sheet');
            return;
        }
        
        updateStatus(`   → Xử lý ${responses.length} responses...`);
        
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
                updateStatus(`   → Tạo folder: ${studentFolderName}`);
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
                    console.error(`Lỗi move file ${fileId}:`, err);
                }
            }
        }
        
        updateStatus(`   ✓ Đã phân loại ${movedCount} file vào folder bài tập`);
        
    } catch (error) {
        console.error('Lỗi processFormFileUploads:', error);
        updateStatus(`   ⚠️ Lỗi phân loại file: ${error.message}`);
    }
}

async function handleProcessClick() {
    if (!activeAssignment) { updateStatus("✗ LỖI: Bạn chưa chọn loại bài tập để xử lý.", true); return; }
    const parentFolderIdToProcess = activeAssignment.folderId;
    const folderTypeName = activeAssignment.name;
    updateStatus(`→ Bắt đầu xử lý lớp [${folderTypeName}]...`);
    processButton.disabled = true;
    processButton.querySelector('span').textContent = "Đang xử lý...";

    try {
        // Step 0: Process file uploads from Form responses folder
        const selectedProfile = classProfiles.find(p => p.id === classProfileSelectValue.value);
        if (selectedProfile && selectedProfile.sheetId && selectedProfile.formId) {
            updateStatus("→ Đang phân loại file uploads từ Form...");
            await processFormFileUploads(selectedProfile.id, selectedProfile.sheetId);
        }
        
        updateStatus("→ Đang quét thư mục con...");
        const allFoldersFromDrive = await findAllSubfolders([{ id: parentFolderIdToProcess, name: 'root' }]);
        
        // Filter out "File responses" folder (case-insensitive)
        const filteredFolders = allFoldersFromDrive.filter(folder => 
            !folder.name.toLowerCase().includes('file responses')
        );
        
        updateStatus(`✓ Quét xong: ${filteredFolders.length} thư mục con (bỏ qua ${allFoldersFromDrive.length - filteredFolders.length} folder File responses).`);

        const key = getStatusCacheKey();
        const cachedData = localStorage.getItem(key);
        const masterStatusList = cachedData ? JSON.parse(cachedData) : [];
        const statusMap = new Map(masterStatusList.map(item => [item.name, item]));

        const syncedStatusList = [];
        filteredFolders.forEach(folder => {
            const isProcessed = folder.name.includes('[Đã xử lý]');
            const isOverdue = !isProcessed && folder.name.toLowerCase().includes('quá hạn');
            const cleanName = sanitizeFolderDisplayName(folder.name);
            const existingItem = statusMap.get(cleanName);
            let currentStatus;

            if (isProcessed) currentStatus = 'processed';
            else if (isOverdue) currentStatus = 'overdue';
            else if (existingItem && existingItem.status === 'error' && !isProcessed) currentStatus = 'submitted';
            else currentStatus = 'submitted';

            syncedStatusList.push({ id: folder.id, name: cleanName, status: currentStatus });
        });

        updateStatus("→ Đồng bộ hóa danh sách...");
        syncedStatusList.sort((a, b) => a.name.localeCompare(b.name));
        saveSubmissionStatusToCache(syncedStatusList);
        displaySubmissionStatus(syncedStatusList);

        const foldersToActuallyProcess = filteredFolders.filter(f => !f.name.includes('[Đã xử lý]') && !f.name.toLowerCase().includes('quá hạn'));
        updateStatus(`→ ${foldersToActuallyProcess.length} thư mục mới cần xử lý.`);

        if (foldersToActuallyProcess.length > 0) {
            await processFoldersConcurrently(foldersToActuallyProcess, folderTypeName);
        } else {
            updateStatus("✓ Không có thư mục mới. Hoàn tất.");
            processButton.disabled = false;
            processButton.querySelector('span').textContent = "Bắt đầu Xử lý";
        }
    } catch (error) {
        updateStatus(`✗ Lỗi trong quá trình xử lý chính: ${error.message}`, true);
        processButton.disabled = false;
        processButton.querySelector('span').textContent = "Bắt đầu Xử lý";
    }
}

function displaySubmissionStatus(statusList) {
    submissionStatusList.innerHTML = '';
    if (!statusList || statusList.length === 0) {
        submissionStatusList.innerHTML = '<div class="text-outline">Chưa có dữ liệu cho lớp này. Bắt đầu xử lý để quét...</div>';
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
        const classesToAdd = [];
        let extraItemClass = '';

        switch (itemData.status) {
            case 'processed': 
                statusText = 'Đã xử lý'; 
                classesToAdd.push('bg-primary-container', 'text-on-primary-container'); 
                extraItemClass = 'submission-item-reprocessable'; 
                break;
            case 'overdue': 
                statusText = 'Quá hạn'; 
                classesToAdd.push('bg-error-container', 'text-on-error-container'); 
                extraItemClass = 'submission-item-reprocessable'; 
                break;
            case 'processing': 
                statusText = 'Đang xử lý...'; 
                classesToAdd.push('bg-secondary-container', 'text-on-secondary-container', 'animate-pulse'); 
                break;
            case 'error': 
                statusText = 'Lỗi'; 
                classesToAdd.push('bg-error-container', 'text-on-error-container'); 
                break;
            default: 
                statusText = 'Chưa xử lý'; 
                classesToAdd.push('bg-tertiary-container', 'text-on-tertiary-container'); 
                break;
        }

        item.setAttribute('draggable', 'true');
        item.dataset.selected = "false";
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        item.classList.add(...classesToAdd);
        if (extraItemClass) item.classList.add(extraItemClass);
        item.innerHTML = `<span class="font-medium text-sm flex-1 truncate pr-2">${itemData.name}</span><span class="text-sm font-medium flex-shrink-0">${statusText}</span>`;
        list.appendChild(item);
    });
    submissionStatusList.appendChild(list);
}

async function deleteSelectedSubmissions() {
    const selectedItems = document.querySelectorAll('#submission-status-list li[data-selected="true"]');
    if (selectedItems.length === 0) {
        updateStatus('⚠ Vui lòng chọn học sinh để xóa.');
        return;
    }
    
    const confirmMsg = `Bạn có chắc muốn xóa ${selectedItems.length} học sinh và folder tương ứng không?\n\nLưu ý: Folder sẽ bị xóa vĩnh viễn trên Google Drive!`;
    if (!confirm(confirmMsg)) return;
    
    updateStatus(`→ Đang xóa ${selectedItems.length} học sinh...`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const item of selectedItems) {
        const folderId = item.dataset.folderId;
        const folderName = item.dataset.folderName;
        
        try {
            // Delete folder from Google Drive
            await gapi.client.drive.files.delete({
                fileId: folderId
            });
            
            // Remove from UI
            item.remove();
            successCount++;
            updateStatus(`✓ Xóa thành công: "${folderName}"`);
        } catch (error) {
            failCount++;
            updateStatus(`✗ Lỗi khi xóa "${folderName}": ${error.message}`, true);
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
    
    updateStatus(`✅ Hoàn tất xóa: ${successCount} thành công, ${failCount} thất bại.`);
}

async function processFoldersConcurrently(folders, folderTypeName) {
    const CONCURRENCY_LIMIT = 2;
    let processedCount = 0;

    const processSingleFolderAndUpdateUI = async (folder) => {
        processedCount++;
        const displayName = sanitizeFolderDisplayName(folder.name);
        updateStatus(`→ Xử lý ${processedCount}/${folders.length}: "${displayName}"`);

        let wasSuccessful = false;
        const sanitizedName = displayName.replace(/[^a-zA-Z0-9]/g, '-');
        const statusElement = document.getElementById(`status-${sanitizedName}`);

        try {
            updateSingleStatusInCache(displayName, 'processing');
            if (statusElement) {
                statusElement.dataset.status = 'processing';
                statusElement.querySelector('span:last-child').textContent = 'Đang xử lý...';
                statusElement.classList.remove('bg-orange-200', 'text-orange-900', 'dark:bg-orange-800', 'dark:text-orange-100', 'bg-error-container', 'text-on-error-container', 'bg-tertiary-container', 'text-on-tertiary-container');
                statusElement.classList.add('bg-secondary-container', 'text-on-secondary-container', 'animate-pulse');
            }

            wasSuccessful = await processSingleFolder(folder.id, folder.name, folderTypeName);

            if (wasSuccessful) {
                await markFolderAsProcessed(folder.id, folder.name);
                updateStatus(`✓ Hoàn thành: "${folder.name}"`);
                updateSingleStatusInCache(displayName, 'processed');
                if (statusElement) {
                    statusElement.dataset.status = 'processed';
                    statusElement.querySelector('span:last-child').textContent = 'Đã xử lý';
                    statusElement.classList.remove('bg-secondary-container', 'text-on-secondary-container', 'animate-pulse');
                    statusElement.classList.add('bg-purple-100', 'text-purple-900', 'dark:bg-purple-900/30', 'dark:text-purple-200', 'submission-item-reprocessable');
                }
            } else {
                updateStatus(`⚠ Tạm dừng "${folder.name}" do lỗi.`, true);
                updateSingleStatusInCache(displayName, 'error');
                if (statusElement) {
                    statusElement.dataset.status = 'error';
                    statusElement.querySelector('span:last-child').textContent = 'Lỗi';
                    statusElement.classList.remove('bg-secondary-container', 'text-on-secondary-container', 'animate-pulse');
                    statusElement.classList.add('bg-orange-100', 'text-orange-900', 'dark:bg-orange-900/30', 'dark:text-orange-200');
                }
            }
        } catch (error) {
            const errorMessage = error.message || (error.result ? error.result.error.message : 'Lỗi không xác định');
            updateStatus(`✗ Lỗi nghiêm trọng khi xử lý "${folder.name}": ${errorMessage}`, true);
        }
    };

    let taskIndex = -1;
    const getNextTask = () => { taskIndex++; return taskIndex < folders.length ? folders[taskIndex] : null; };
    const worker = async () => { while (true) { const task = getNextTask(); if (!task) break; await processSingleFolderAndUpdateUI(task); } };
    const workerPromises = Array(CONCURRENCY_LIMIT).fill(null).map(worker);
    await Promise.all(workerPromises);

    updateStatus("✅ HOÀN TẤT TẤT CẢ!");
    processButton.disabled = false;
    processButton.querySelector('span').textContent = "Bắt đầu Xử lý";
}

async function processSingleFolder(folderId, folderName, folderTypeName) {
    let hasEncounteredError = false;
    let embeddedFont = null;
    if (!customFontBuffer) {
        try {
            const fontUrl = 'https://cdn.jsdelivr.net/npm/roboto-font@0.1.0/fonts/Roboto/roboto-regular-webfont.ttf';
            customFontBuffer = await fetch(fontUrl).then(res => res.arrayBuffer());
        } catch (fontError) { updateStatus(`  ✗ Lỗi tải font: ${fontError.message}.`, true); }
    }

    const files = await fetchFiles(folderId);
    if (files.length === 0) { updateStatus(`✗ Không tìm thấy tệp trong "${folderName}".`, true); return false; }

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
        } catch (error) { updateStatus(`✗ Lỗi khi gộp ảnh: ${error.message}`, true); hasEncounteredError = true; }
    }
    if (pdfFiles.length > 0) {
        const existingPdfs = await fetchPdfBlobs(pdfFiles.map(f => f.id));
        pdfBuffers = pdfBuffers.concat(existingPdfs);
    }

    if (pdfBuffers.length > 0) {
        try {
            const mergedPdfBytes = await mergePdfs(pdfBuffers, folderName);
            const assignmentName = folderTypeName || "BàiTập";
            const fileName = `${folderName} (${assignmentName}).pdf`;
            download(mergedPdfBytes, fileName, "application/pdf");
            updateStatus(`✓ ĐÃ TẢI VỀ: ${fileName}`);
        } catch (error) { updateStatus(`✗ Lỗi khi nối PDF: ${error.message}`, true); hasEncounteredError = true; }
    } else { updateStatus(`✗ Không có tệp hợp lệ trong "${folderName}".`, true); return false; }

    return !hasEncounteredError;
}

async function markFolderAsProcessed(folderId, folderName) {
    try { await gapi.client.drive.files.update({ fileId: folderId, resource: { name: `[Đã xử lý] ${folderName}` } }); updateStatus(`✓ Đổi tên: "[Đã xử lý] ${folderName}"`); } catch (err) { updateStatus(`✗ Lỗi đổi tên: ${err.message}`, true); }
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
        } catch (err) { updateStatus(`✗ Lỗi quét thư mục "${parent.name}": ${err.message}`, true); }
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
        updateStatus(`✗ Lỗi list files trong folder: ${err.message}`, true);
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
        console.error(`[METADATA] Lỗi lấy metadata folder ${folderId}:`, err);
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
        console.log(`[METADATA] Đã đánh dấu folder ${folderId} là đã quét`);
    } catch (err) {
        console.error(`[METADATA] Lỗi đánh dấu folder ${folderId}:`, err);
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
        console.error(`[METADATA] Lỗi list assignment folders:`, err);
        return [];
    }
}

async function scanAndSyncClasses(silent = false) {
    const rootId = inpRootFolderId.value.trim();
    if (!rootId) {
        if (!silent) {
            updateStatus("✗ Lỗi: Cần ID Thư mục cha. Vui lòng vào Cài đặt > Tự động hóa.", true);
            alert("Vui lòng vào Cài đặt -> Tự động hóa để nhập ID Thư mục cha (Root) trước.");
        }
        return;
    }

    console.log("[SCAN] Bắt đầu quét Root Folder ID:", rootId, silent ? "(silent mode)" : "");
    if (!silent) {
        updateStatus("🔍 Đang quét Root Folder để tìm các lớp...");
    }

    try {
        // Get all folders in root
        const { folders: classFolderCandidates, files: rootFiles } = await listFilesInFolder(rootId);
        console.log("[SCAN] Tìm thấy trong Root:", {
            folders: classFolderCandidates.length,
            files: rootFiles.length
        });
        console.log("[SCAN] Danh sách folders:", classFolderCandidates.map(f => f.name));

        if (!silent) updateStatus(`→ Tìm thấy ${classFolderCandidates.length} folder trong Root.`);

        const detectedClasses = [];

        for (const classFolder of classFolderCandidates) {
            console.log(`[SCAN] Đang kiểm tra folder: "${classFolder.name}" (ID: ${classFolder.id})`);
            if (!silent) updateStatus(`→ Đang kiểm tra folder: "${classFolder.name}"...`);

            // Check if folder has been scanned before (using appProperties)
            const metadata = await getFolderMetadata(classFolder.id);
            const props = metadata.appProperties || {};

            if (props.scanned === 'true' && props.formId && props.sheetId) {
                // Folder already scanned - use cached metadata
                console.log(`[SCAN] ⚡ Sử dụng metadata đã lưu cho "${classFolder.name}"`);
                if (!silent) updateStatus(`  ⚡ Dùng cache: "${classFolder.name}"`);

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

                if (!silent) updateStatus(`  → Tìm thấy ${assignments.length} loại bài tập.`);
            } else {
                // First time scan - do full check
                console.log(`[SCAN] 📋 Quét chi tiết folder "${classFolder.name}" (lần đầu)`);

                const { files, folders: assignmentFolderCandidates } = await listFilesInFolder(classFolder.id);

                console.log(`[SCAN] Nội dung folder "${classFolder.name}":`, {
                    files: files.length,
                    folders: assignmentFolderCandidates.length
                });
                console.log(`[SCAN] Files:`, files.map(f => ({ name: f.name, mimeType: f.mimeType })));
                console.log(`[SCAN] Sub-folders:`, assignmentFolderCandidates.map(f => f.name));

                // Find Form and Sheet
                const formFile = files.find(f => f.mimeType === 'application/vnd.google-apps.form');
                const sheetFile = files.find(f => f.mimeType === 'application/vnd.google-apps.spreadsheet');

                console.log(`[SCAN] Tìm thấy:`, {
                    form: formFile ? formFile.name : 'KHÔNG CÓ',
                    sheet: sheetFile ? sheetFile.name : 'KHÔNG CÓ'
                });

                if (formFile && sheetFile) {
                    // Valid class folder!
                    console.log(`[SCAN] ✓ "${classFolder.name}" là lớp hợp lệ!`);
                    if (!silent) updateStatus(`✓ Nhận diện lớp: "${classFolder.name}" (Form + Sheet)`);

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

                    if (!silent) updateStatus(`  → Tìm thấy ${assignments.length} loại bài tập.`);
                } else {
                    console.log(`[SCAN] ⊗ Bỏ qua "${classFolder.name}" - thiếu ${!formFile ? 'Form' : ''} ${!sheetFile ? 'Sheet' : ''}`);
                    if (!silent) updateStatus(`  ⊗ Bỏ qua: "${classFolder.name}" (thiếu ${!formFile ? 'Form' : ''} ${!sheetFile ? 'Sheet' : ''})`);
                }
            }
        }

        console.log(`[SCAN] Tổng số lớp phát hiện được: ${detectedClasses.length}`);

        if (detectedClasses.length === 0) {
            if (!silent) updateStatus("⚠ Không tìm thấy lớp nào. Đảm bảo mỗi folder có Form + Sheet.", true);
            console.log("[SCAN] KHÔNG TÌM THẤY LỚP NÀO - Kiểm tra:");
            console.log("1. Folder có chứa Google Form?");
            console.log("2. Folder có chứa Google Spreadsheet?");
            console.log("3. Root Folder ID đúng chưa?");
            return;
        }

        // Replace classProfiles with detected classes
        classProfiles = detectedClasses;
        localStorage.setItem('classProfiles', JSON.stringify(classProfiles));
        console.log("[SCAN] Đã cập nhật classProfiles và lưu vào localStorage:", classProfiles);

        // Reload dropdown
        loadClassProfiles();

        if (!silent) updateStatus(`🎉 Hoàn tất! Đã quét và đồng bộ ${detectedClasses.length} lớp.`);
    } catch (error) {
        if (!silent) updateStatus(`✗ Lỗi khi quét: ${error.message}`, true);
        console.error("[SCAN] LỖI:", error);
        console.error("[SCAN] Chi tiết lỗi:", {
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
    updateStatus(`→ Bắt đầu di chuyển ${items.length} học sinh sang "${newParentName}"...`);
    processButton.disabled = true;
    const movePromises = items.map(item => {
        return gapi.client.drive.files.update({ fileId: item.id, addParents: newParentId, removeParents: oldParentId, fields: 'id, parents' }).then(res => ({ status: 'fulfilled', item })).catch(err => ({ status: 'rejected', item, reason: err }));
    });
    const results = await Promise.all(movePromises);
    const successfulMoves = results.filter(r => r.status === 'fulfilled').map(r => r.item);
    const failedMoves = results.filter(r => r.status === 'rejected');
    if (failedMoves.length > 0) failedMoves.forEach(fail => updateStatus(`✗ Lỗi di chuyển "${fail.item.name}": ${fail.reason?.result?.error?.message}`, true));
    if (successfulMoves.length > 0) {
        updateStatus(`✓ Đã di chuyển thành công ${successfulMoves.length} học sinh.`);
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

// --- Auto Refresh ---
function toggleAutoRefresh() {
    if (isAutoRefreshOn) {
        stopAutoRefresh();
    } else {
        startAutoRefresh();
    }
}

function startAutoRefresh() {
    if (isAutoRefreshOn && autoRefreshTimer) return;
    if (!classProfileSelect.value || !gapi.client.getToken() || !activeAssignment) {
        updateStatus("✗ Không thể bật: Vui lòng chọn Lớp, Bài tập và Đăng nhập.", true);
        isAutoRefreshOn = false;
        localStorage.setItem('autoRefreshState', 'off');
        updateAutoRefreshUI(false); // Ensure UI is off
        return;
    }
    isAutoRefreshOn = true;
    localStorage.setItem('autoRefreshState', 'on');
    updateAutoRefreshUI(true);
    updateStatus("✓ Đã bật tự động quét nền (mỗi 5 phút).");

    runAutoScan();
    autoRefreshTimer = setInterval(runAutoScan, REFRESH_INTERVAL);
}

function stopAutoRefresh() {
    if (!isAutoRefreshOn) return;
    isAutoRefreshOn = false;
    localStorage.setItem('autoRefreshState', 'off');
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
    }
    updateAutoRefreshUI(false);
    updateStatus("✓ Đã tắt tự động quét nền.");
}

function updateAutoRefreshUI(isActive) {
    if (autoRefreshButton) {
        autoRefreshButton.setAttribute('aria-checked', isActive ? 'true' : 'false');
    }
}

async function runAutoScan() {
    if (!isAutoRefreshOn) return;
    if (!classProfileSelect.value || !gapi.client.getToken() || !activeAssignment) {
        stopAutoRefresh();
        return;
    }
    updateStatus("→ Tự động quét nền đang chạy...");
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
            const isProcessed = folder.name.includes('[Đã xử lý]');
            const isOverdue = !isProcessed && folder.name.toLowerCase().includes('quá hạn');
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
        updateStatus(`✓ Đồng bộ hoàn tất: ${syncedStatusList.length} mục.`);
    } catch (error) {
        const errorMessage = error.message || (error.result ? error.result.error.message : 'Lỗi không xác định');
        updateStatus(`✗ Lỗi khi quét tự động: ${errorMessage}`, true);
        console.error("Lỗi tự động quét:", error);
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
    const defaultText = '<div class="text-outline">Chọn lớp và bài tập để xem tình trạng...</div>';
    if (!key) { submissionStatusList.innerHTML = defaultText; return; }
    const cachedData = localStorage.getItem(key);
    if (cachedData) {
        try {
            const statusList = JSON.parse(cachedData); displaySubmissionStatus(statusList);
            if (!silent) updateStatus("✓ Tải trạng thái từ cache.");
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
    updateStatus(`→ Chuyển đổi ${docIds.length} GDocs...`);
    const promises = docIds.map(id => gapi.client.drive.files.export({ fileId: id, mimeType: 'application/pdf' }).then(response => {
        const bytes = new Uint8Array(response.body.length);
        for (let i = 0; i < response.body.length; i++) bytes[i] = response.body.charCodeAt(i);
        return { status: 'fulfilled', value: bytes.buffer };
    }).catch(error => ({ status: 'rejected', reason: error, id }))
    );
    const results = await Promise.all(promises);
    const pdfBuffers = [];
    results.forEach(result => { if (result.status === 'fulfilled') pdfBuffers.push(result.value); else updateStatus(`✗ Lỗi GDoc: ${result.reason.message}`, true); });
    updateStatus(`✓ GDocs: ${pdfBuffers.length}/${docIds.length} thành công.`);
    return pdfBuffers;
}

async function convertDocxToPdf(docxFiles) {
    updateStatus(`→ Chuyển đổi ${docxFiles.length} tệp DOCX (tăng tốc)...`);
    const pdfBuffers = [];
    const CONCURRENCY_LIMIT = 4;

    const processSingleFile = async (file) => {
        let tempGDocId = null;
        try {
            updateStatus(`  → Đang xử lý DOCX: "${file.name}"`);
            const copyResponse = await gapi.client.drive.files.copy({ fileId: file.id, resource: { mimeType: 'application/vnd.google-apps.document' } });
            tempGDocId = copyResponse.result.id;
            const exportResponse = await gapi.client.drive.files.export({ fileId: tempGDocId, mimeType: 'application/pdf' });
            const bytes = new Uint8Array(exportResponse.body.length);
            for (let i = 0; i < exportResponse.body.length; i++) bytes[i] = exportResponse.body.charCodeAt(i);
            return bytes.buffer;
        } catch (error) {
            updateStatus(`✗ Lỗi DOCX "${file.name}": ${error.message}`, true); return null;
        } finally {
            if (tempGDocId) try { await gapi.client.drive.files.delete({ fileId: tempGDocId }); } catch (e) { }
        }
    };
    let taskIndex = -1;
    const getNextTask = () => { taskIndex++; return taskIndex < docxFiles.length ? docxFiles[taskIndex] : null; };
    const worker = async () => { while (true) { const task = getNextTask(); if (!task) break; const result = await processSingleFile(task); if (result) pdfBuffers.push(result); } };
    const workerPromises = Array(CONCURRENCY_LIMIT).fill(null).map(worker);
    await Promise.all(workerPromises);
    updateStatus(`✓ DOCX: ${pdfBuffers.length}/${docxFiles.length} thành công.`);
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
    updateStatus(`→ Xử lý ${imageFiles.length} ảnh (${CONCURRENCY_LIMIT} luồng)...`);
    const processedImages = new Array(imageFiles.length).fill(null);
    let taskIndex = -1;
    const getNextTask = () => { taskIndex++; return taskIndex < imageFiles.length ? { file: imageFiles[taskIndex], index: taskIndex } : null; };
    const processImage = async (file, index) => {
        try {
            const res = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
            if (!res.ok) throw new Error(`Tải thất bại`);
            const originalBuffer = await res.arrayBuffer();
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
                } catch (e) { throw new Error(`Chuyển đổi thất bại`); }
            }
            processedImages[index] = image;
        } catch (error) { updateStatus(`  ✗ Lỗi ảnh ${file.name}: ${error.message}`, true); }
    };
    const worker = async () => { while (true) { const task = getNextTask(); if (!task) break; await processImage(task.file, task.index); } };
    await Promise.all(Array(CONCURRENCY_LIMIT).fill(null).map(worker));
    updateStatus(`✓ Xử lý ảnh xong, đang gộp PDF...`);
    for (const image of processedImages) {
        if (!image) continue;
        const A4_SHORT = 595.28, A4_LONG = 841.89;
        const isLandscape = image.width > image.height;
        const pageWidth = isLandscape ? A4_LONG : A4_SHORT;
        const pageHeight = isLandscape ? A4_SHORT : A4_LONG;
        const ratio = Math.min(pageWidth / image.width, pageHeight / image.height);
        const scaledWidth = image.width * ratio;
        const scaledHeight = image.height * ratio;
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        page.drawImage(image, { x: (pageWidth - scaledWidth) / 2, y: (pageHeight - scaledHeight) / 2, width: scaledWidth, height: scaledHeight });
    }
    return pdfDoc.save();
}

async function mergePdfs(pdfBuffers, folderName) {
    const mergedPdf = await PDFDocument.create();
    mergedPdf.registerFontkit(window.fontkit);
    for (const pdfBuffer of pdfBuffers) {
        try {
            const pdf = await PDFDocument.load(pdfBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach(page => mergedPdf.addPage(page));
        } catch (err) { updateStatus(`✗ Lỗi đọc PDF con. Bỏ qua.`, true); }
    }
    if (mergedPdf.getPageCount() > 0 && folderName && customFontBuffer) {
        try {
            const embeddedFont = await mergedPdf.embedFont(customFontBuffer);
            const firstPage = mergedPdf.getPages()[0];
            firstPage.drawText(`Người nộp: ${folderName}`, { x: 30, y: firstPage.getHeight() - 30, font: embeddedFont, size: 12, color: rgb(1, 0, 0), strokeColor: rgb(0, 0, 0), strokeWidth: 0.5, renderMode: 'FillAndStroke' });
        } catch (embedError) { }
    }
    return mergedPdf.save();
}

// ==================================================================
// LOGIC GIAO DIỆN (DESIGN SWITCHER & THEME)
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
// AUTO-UPDATE: KIỂM TRA PHIÊN BẢN MỚI
// ==================================================================

/**
 * Kiểm tra phiên bản mới từ Google Drive
 */
async function checkForUpdates() {
    try {
        console.log(`[UPDATE] Phiên bản hiện tại: ${CURRENT_VERSION}`);
        
        const response = await fetch(VERSION_CHECK_URL);
        if (!response.ok) {
            console.log('[UPDATE] Không thể lấy thông tin phiên bản mới');
            return;
        }
        
        const latestInfo = await response.json();
        console.log(`[UPDATE] Phiên bản mới nhất: ${latestInfo.version}`);
        
        // So sánh phiên bản
        if (compareVersions(latestInfo.version, CURRENT_VERSION) > 0) {
            showUpdateNotification(latestInfo);
        } else {
            console.log('[UPDATE] Đang dùng phiên bản mới nhất');
        }
    } catch (error) {
        console.error('[UPDATE] Lỗi khi kiểm tra update:', error);
    }
}

/**
 * So sánh 2 phiên bản (semver)
 * @returns {number} 1 nếu v1 > v2, -1 nếu v1 < v2, 0 nếu bằng nhau
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
 * Hiển thị thông báo có phiên bản mới
 */
function showUpdateNotification(updateInfo) {
    const { version, downloadUrl, changelog } = updateInfo;
    
    const message = `
🎉 Có phiên bản mới: ${version}

📝 Những thay đổi:
${changelog || 'Xem chi tiết khi tải về'}

💾 Dữ liệu của bạn sẽ được giữ nguyên sau khi cập nhật.

Bạn có muốn tải về ngay không?
    `.trim();
    
    if (confirm(message)) {
        window.open(downloadUrl, '_blank');
    }
}
