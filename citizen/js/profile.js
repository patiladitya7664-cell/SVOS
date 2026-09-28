// =========================================================
// SVOS CITIZEN - PROFILE
// JWT + MongoDB PROFILE
// =========================================================

const PROFILE_API =
    "http://localhost:5000/api/citizen/profile";


// =========================================================
// PAGE LOAD
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadCitizenName();
        loadProfile();
        setupProfileForm();

    }
);


// =========================================================
// AUTH TOKEN
// =========================================================

function getAuthToken() {

    return (
        localStorage.getItem("svosToken") ||
        localStorage.getItem("token") ||
        ""
    );

}


// =========================================================
// AUTH HEADERS
// =========================================================

function getAuthHeaders() {

    const token =
        getAuthToken();

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }

    return headers;

}


// =========================================================
// LOAD CITIZEN NAME
// =========================================================

function loadCitizenName() {

    const userName =
        document.getElementById(
            "userName"
        );

    if (!userName) return;

    const storedUser =
        getStoredUser();

    if (
        storedUser &&
        storedUser.name
    ) {

        userName.textContent =
            storedUser.name;

    }

}


// =========================================================
// LOAD PROFILE
// =========================================================

async function loadProfile() {

    try {

        const storedUser =
            getStoredUser();


        // Show local data first

        if (storedUser) {

            fillProfileForm(
                storedUser
            );

        }


        // Load latest MongoDB data

        const response =
            await fetch(
                PROFILE_API,
                {
                    method: "GET",
                    headers:
                        getAuthHeaders()
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load profile."
            );

        }


        if (!result.success) {

            throw new Error(
                result.message ||
                "Unable to load profile."
            );

        }


        const profile =
            result.data ||
            result.user ||
            result.profile;


        if (profile) {

            fillProfileForm(
                profile
            );

        }

    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

    }

}


// =========================================================
// FILL PROFILE FORM
// =========================================================

function fillProfileForm(user) {

    const fields = {

        profileName:
            user.name || "",

        profileEmail:
            user.email || "",

        profileMobile:
            user.mobile ||
            user.phone ||
            "",

        profileVillage:
            user.village || "",

        profileTaluka:
            user.taluka || "",

        profileDistrict:
            user.district || "",

        profileAddress:
            user.address || ""

    };


    Object.entries(fields)
        .forEach(
            ([id, value]) => {

                const element =
                    document.getElementById(
                        id
                    );

                if (element) {

                    element.value =
                        value;

                }

            }
        );


    updateStoredUser(
        user
    );

}


// =========================================================
// PROFILE FORM
// =========================================================

function setupProfileForm() {

    const form =
        document.getElementById(
            "profileForm"
        );

    if (!form) return;


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            await saveProfile();

        }
    );


    const resetButton =
        document.getElementById(
            "resetProfileBtn"
        );


    if (resetButton) {

        resetButton.addEventListener(
            "click",
            function () {

                setTimeout(
                    function () {

                        loadProfile();

                    },
                    0
                );

            }
        );

    }

}


// =========================================================
// SAVE PROFILE
// =========================================================

async function saveProfile() {

    const saveButton =
        document.getElementById(
            "saveProfileBtn"
        );


    const profileData = {

        name:
            getValue("profileName"),

        mobile:
            getValue("profileMobile"),

        village:
            getValue("profileVillage"),

        taluka:
            getValue("profileTaluka"),

        district:
            getValue("profileDistrict"),

        address:
            getValue("profileAddress")

    };


    try {

        if (saveButton) {

            saveButton.disabled =
                true;

            saveButton.textContent =
                "Saving...";

        }


        const response =
            await fetch(
                PROFILE_API,
                {
                    method: "PUT",

                    headers:
                        getAuthHeaders(),

                    body:
                        JSON.stringify(
                            profileData
                        )
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to update profile."
            );

        }


        if (!result.success) {

            throw new Error(
                result.message ||
                "Unable to update profile."
            );

        }


        const updatedUser =
            result.data ||
            result.user ||
            {
                ...(
                    getStoredUser() || {}
                ),
                ...profileData
            };


        updateStoredUser(
            updatedUser
        );


        showProfileMessage(
            result.message ||
            "Profile updated successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Profile update error:",
            error
        );


        showProfileMessage(
            error.message ||
            "Unable to update profile.",
            "error"
        );


    } finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                "Save Changes";

        }

    }

}


// =========================================================
// GET INPUT VALUE
// =========================================================

function getValue(id) {

    const element =
        document.getElementById(id);

    if (!element) return "";

    return element.value.trim();

}


// =========================================================
// GET STORED USER
// =========================================================

function getStoredUser() {

    try {

        const data =
            localStorage.getItem(
                "svosUser"
            );

        if (!data) {
            return null;
        }

        return JSON.parse(data);

    } catch (error) {

        console.error(
            "Stored user error:",
            error
        );

        return null;

    }

}


// =========================================================
// UPDATE LOCAL STORAGE
// =========================================================

function updateStoredUser(user) {

    if (!user) return;


    try {

        const currentUser =
            getStoredUser() || {};


        const updatedUser = {

            ...currentUser,
            ...user

        };


        localStorage.setItem(
            "svosUser",
            JSON.stringify(
                updatedUser
            )
        );


        const userName =
            document.getElementById(
                "userName"
            );


        if (
            userName &&
            updatedUser.name
        ) {

            userName.textContent =
                updatedUser.name;

        }

    } catch (error) {

        console.error(
            "Local storage update error:",
            error
        );

    }

}


// =========================================================
// PROFILE MESSAGE
// =========================================================

function showProfileMessage(
    message,
    type
) {

    const messageBox =
        document.getElementById(
            "profileMessage"
        );


    if (!messageBox) return;


    messageBox.textContent =
        message;


    messageBox.className =
        "form-message " + type;


    messageBox.style.display =
        "block";


    setTimeout(
        function () {

            messageBox.style.display =
                "none";

        },
        4000
    );

}