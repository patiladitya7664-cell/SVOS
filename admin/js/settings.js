const SETTINGS_API = "http://localhost:5000/api/admin/settings";

let originalSettings = {};


// =========================================================
// LOAD SETTINGS
// =========================================================

async function loadSettings() {

    try {

        const response = await fetch(
            SETTINGS_API
        );


        if (!response.ok) {
            throw new Error(
                "Failed to load settings"
            );
        }


        const result =
            await response.json();


        if (!result.success) {
            throw new Error(
                result.message ||
                "Unable to load settings"
            );
        }


        const settings =
            result.data ||
            result.settings ||
            {};


        originalSettings = {
            ...settings
        };


        displaySettings(
            settings
        );


    } catch (error) {

        console.error(
            "Settings loading error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to load system settings.",
            "error"
        );

    }

}


// =========================================================
// DISPLAY SETTINGS
// =========================================================

function displaySettings(settings) {

    setInputValue(
        "portalName",
        settings.portalName
    );

    setInputValue(
        "departmentName",
        settings.departmentName
    );

    setInputValue(
        "supportEmail",
        settings.supportEmail
    );

    setInputValue(
        "supportPhone",
        settings.supportPhone
    );

    setInputValue(
        "officeAddress",
        settings.officeAddress
    );

    setInputValue(
        "processingTime",
        settings.processingTime
    );


    const maintenanceMode =
        document.getElementById(
            "maintenanceMode"
        );


    if (maintenanceMode) {

        maintenanceMode.checked =
            settings.maintenanceMode === true;

    }


    updateMaintenanceStatus(
        settings.maintenanceMode === true
    );

}


// =========================================================
// SAFE INPUT UPDATE
// =========================================================

function setInputValue(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.value =
        value !== undefined &&
        value !== null
            ? value
            : "";

}


// =========================================================
// SAVE SETTINGS
// =========================================================

async function saveSettings(
    event
) {

    event.preventDefault();


    const saveButton =
        document.getElementById(
            "saveSettingsBtn"
        );


    const settings = {

        portalName:
            getInputValue(
                "portalName"
            ),

        departmentName:
            getInputValue(
                "departmentName"
            ),

        supportEmail:
            getInputValue(
                "supportEmail"
            ),

        supportPhone:
            getInputValue(
                "supportPhone"
            ),

        officeAddress:
            getInputValue(
                "officeAddress"
            ),

        processingTime:
            getInputValue(
                "processingTime"
            ),

        maintenanceMode:
            document.getElementById(
                "maintenanceMode"
            )?.checked || false

    };


    if (
        !settings.portalName ||
        !settings.departmentName
    ) {

        showMessage(
            "Portal Name and Department Name are required.",
            "error"
        );

        return;
    }


    try {

        if (saveButton) {

            saveButton.disabled = true;

            saveButton.textContent =
                "Saving...";

        }


        const response = await fetch(
            SETTINGS_API,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(
                    settings
                )
            }
        );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to save settings"
            );

        }


        originalSettings = {
            ...settings
        };


        displaySettings(
            settings
        );


        showMessage(
            "Settings saved successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Save settings error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to save settings.",
            "error"
        );


    } finally {

        if (saveButton) {

            saveButton.disabled = false;

            saveButton.textContent =
                "💾 Save Settings";

        }

    }

}


// =========================================================
// RESET SETTINGS
// =========================================================

function resetSettings() {

    const confirmed =
        confirm(
            "Reset all changes to the last saved settings?"
        );


    if (!confirmed) {
        return;
    }


    displaySettings(
        originalSettings
    );


    showMessage(
        "Changes have been reset.",
        "info"
    );

}


// =========================================================
// GET INPUT VALUE
// =========================================================

function getInputValue(
    elementId
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return "";
    }


    return element.value.trim();

}


// =========================================================
// SHOW MESSAGE
// =========================================================

function showMessage(
    message,
    type
) {

    const messageBox =
        document.getElementById(
            "settingsMessage"
        );


    if (!messageBox) {
        return;
    }


    messageBox.textContent =
        message;


    messageBox.className =
        `settings-message ${type}`;


    messageBox.style.display =
        "block";


    clearTimeout(
        window.settingsMessageTimer
    );


    window.settingsMessageTimer =
        setTimeout(
            () => {

                messageBox.style.display =
                    "none";

            },
            4000
        );

}


// =========================================================
// MAINTENANCE STATUS
// =========================================================

function updateMaintenanceStatus(
    enabled
) {

    const maintenanceStatus =
        document.getElementById(
            "maintenanceStatus"
        );


    const portalStatus =
        document.getElementById(
            "portalStatus"
        );


    if (maintenanceStatus) {

        maintenanceStatus.textContent =
            enabled
                ? "Enabled"
                : "Disabled";

    }


    if (portalStatus) {

        portalStatus.textContent =
            enabled
                ? "Maintenance"
                : "Active";

    }

}


// =========================================================
// CHECK BACKEND STATUS
// =========================================================

async function checkBackendStatus() {

    const backendStatus =
        document.getElementById(
            "backendStatus"
        );


    if (!backendStatus) {
        return;
    }


    try {

        const response =
            await fetch(
                "http://localhost:5000/api/test"
            );


        const result =
            await response.json();


        if (
            response.ok &&
            result.success
        ) {

            backendStatus.textContent =
                "Online";

            backendStatus.className =
                "status-online";

        } else {

            throw new Error(
                "Backend unavailable"
            );

        }


    } catch (error) {

        console.error(
            "Backend status error:",
            error
        );


        backendStatus.textContent =
            "Offline";

        backendStatus.className =
            "status-offline";

    }

}


// =========================================================
// MAINTENANCE TOGGLE
// =========================================================

function setupMaintenanceToggle() {

    const maintenanceMode =
        document.getElementById(
            "maintenanceMode"
        );


    if (!maintenanceMode) {
        return;
    }


    maintenanceMode.addEventListener(
        "change",
        () => {

            updateMaintenanceStatus(
                maintenanceMode.checked
            );

        }
    );

}


// =========================================================
// PAGE INITIALIZATION
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const settingsForm =
            document.getElementById(
                "settingsForm"
            );


        const resetButton =
            document.getElementById(
                "resetSettingsBtn"
            );


        if (settingsForm) {

            settingsForm.addEventListener(
                "submit",
                saveSettings
            );

        }


        if (resetButton) {

            resetButton.addEventListener(
                "click",
                resetSettings
            );

        }


        setupMaintenanceToggle();

        loadSettings();

        checkBackendStatus();

    }
);