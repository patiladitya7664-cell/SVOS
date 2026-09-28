const PROFILE_API =
    "http://localhost:5000/api/officer/profile";

let originalProfileData = {};

document.addEventListener("DOMContentLoaded", function () {

    loadOfficerName();
    loadProfile();
    setupProfileForm();
    setupResetButton();

});


// ================= OFFICER NAME =================

function loadOfficerName() {

    const userName =
        document.getElementById("userName");

    if (!userName) return;

    try {

        const storedUser =
            JSON.parse(
                localStorage.getItem("svosUser")
            );

        if (storedUser && storedUser.name) {

            userName.textContent =
                storedUser.name;

        }

    } catch (error) {

        console.error(
            "Officer data error:",
            error
        );

    }

}


// ================= LOAD PROFILE =================

async function loadProfile() {

    try {

        const storedUser =
            JSON.parse(
                localStorage.getItem("svosUser")
            );

        /*
         * First use locally stored officer information
         * so the page can show available data immediately.
         */

        if (storedUser) {

            fillProfileForm(storedUser);

        }


        const response =
            await fetch(PROFILE_API);

        if (!response.ok) {

            throw new Error(
                "Failed to load profile."
            );

        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.message ||
                "Unable to load profile."
            );

        }


        const profile =
            result.data ||
            result.profile ||
            result.user;


        if (!profile) {

            throw new Error(
                "Profile data was not found."
            );

        }


        originalProfileData = {
            ...profile
        };


        fillProfileForm(profile);

        updateLocalStorage(profile);

        updateLastUpdated(
            profile.updatedAt ||
            profile.lastUpdated
        );

    } catch (error) {

        /*
         * If backend profile route is not available yet,
         * locally stored user information remains usable.
         */

        console.error(
            "Profile loading error:",
            error
        );

    }

}


// ================= FILL FORM =================

function fillProfileForm(user) {

    const name =
        document.getElementById(
            "profileName"
        );

    const email =
        document.getElementById(
            "profileEmail"
        );

    const mobile =
        document.getElementById(
            "profileMobile"
        );

    const role =
        document.getElementById(
            "profileRole"
        );

    const village =
        document.getElementById(
            "profileVillage"
        );

    const taluka =
        document.getElementById(
            "profileTaluka"
        );

    const district =
        document.getElementById(
            "profileDistrict"
        );

    const address =
        document.getElementById(
            "profileAddress"
        );

    const displayName =
        document.getElementById(
            "profileDisplayName"
        );


    const userName =
        user.name ||
        user.fullName ||
        user.officerName ||
        "Panchayat Officer";


    const userEmail =
        user.email ||
        "";


    const userMobile =
        user.mobile ||
        user.phone ||
        "";


    const userRole =
        user.role ||
        "Panchayat Officer";


    const userVillage =
        user.village ||
        user.address?.village ||
        "";


    const userTaluka =
        user.taluka ||
        user.address?.taluka ||
        "";


    const userDistrict =
        user.district ||
        user.address?.district ||
        "";


    const userAddress =
        typeof user.address === "string"
            ? user.address
            : user.address?.fullAddress ||
              user.fullAddress ||
              "";


    if (name) {

        name.value =
            userName;

    }


    if (email) {

        email.value =
            userEmail;

    }


    if (mobile) {

        mobile.value =
            userMobile;

    }


    if (role) {

        role.value =
            userRole === "officer"
                ? "Panchayat Officer"
                : userRole;

    }


    if (village) {

        village.value =
            userVillage;

    }


    if (taluka) {

        taluka.value =
            userTaluka;

    }


    if (district) {

        district.value =
            userDistrict;

    }


    if (address) {

        address.value =
            userAddress;

    }


    if (displayName) {

        displayName.textContent =
            userName;

    }


    const topbarName =
        document.getElementById(
            "userName"
        );

    if (topbarName) {

        topbarName.textContent =
            userName;

    }

}


// ================= FORM SUBMIT =================

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

}


// ================= SAVE PROFILE =================

async function saveProfile() {

    const saveButton =
        document.getElementById(
            "saveProfileBtn"
        );


    const name =
        document.getElementById(
            "profileName"
        );

    const email =
        document.getElementById(
            "profileEmail"
        );

    const mobile =
        document.getElementById(
            "profileMobile"
        );

    const village =
        document.getElementById(
            "profileVillage"
        );

    const taluka =
        document.getElementById(
            "profileTaluka"
        );

    const district =
        document.getElementById(
            "profileDistrict"
        );

    const address =
        document.getElementById(
            "profileAddress"
        );


    if (!name || !name.value.trim()) {

        showMessage(
            "Please enter your full name.",
            "error"
        );

        return;

    }


    const profileData = {

        name: name.value.trim(),

        email:
            email
                ? email.value.trim()
                : "",

        mobile:
            mobile
                ? mobile.value.trim()
                : "",

        village:
            village
                ? village.value.trim()
                : "",

        taluka:
            taluka
                ? taluka.value.trim()
                : "",

        district:
            district
                ? district.value.trim()
                : "",

        address:
            address
                ? address.value.trim()
                : ""

    };


    try {

        if (saveButton) {

            saveButton.disabled = true;

            saveButton.textContent =
                "Saving...";

        }


        const response =
            await fetch(
                PROFILE_API,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            profileData
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
                "Unable to update profile."
            );

        }


        const updatedProfile =
            result.data ||
            result.profile ||
            result.user ||
            profileData;


        originalProfileData = {
            ...updatedProfile
        };


        fillProfileForm(
            updatedProfile
        );


        updateLocalStorage(
            updatedProfile
        );


        updateLastUpdated(
            updatedProfile.updatedAt ||
            new Date()
        );


        showMessage(
            result.message ||
            "Profile updated successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Profile update error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to update profile.",
            "error"
        );


    } finally {

        if (saveButton) {

            saveButton.disabled = false;

            saveButton.textContent =
                "Save Changes";

        }

    }

}


// ================= RESET =================

function setupResetButton() {

    const resetButton =
        document.getElementById(
            "resetProfileBtn"
        );

    if (!resetButton) return;


    resetButton.addEventListener(
        "click",
        function () {

            if (
                Object.keys(
                    originalProfileData
                ).length > 0
            ) {

                fillProfileForm(
                    originalProfileData
                );

                return;

            }


            try {

                const storedUser =
                    JSON.parse(
                        localStorage.getItem(
                            "svosUser"
                        )
                    );

                if (storedUser) {

                    fillProfileForm(
                        storedUser
                    );

                }

            } catch (error) {

                console.error(
                    "Profile reset error:",
                    error
                );

            }

        }
    );

}


// ================= LOCAL STORAGE =================

function updateLocalStorage(profile) {

    try {

        const storedUser =
            JSON.parse(
                localStorage.getItem(
                    "svosUser"
                )
            ) || {};


        const updatedUser = {
            ...storedUser,
            ...profile
        };


        localStorage.setItem(
            "svosUser",
            JSON.stringify(
                updatedUser
            )
        );


    } catch (error) {

        console.error(
            "Local storage update error:",
            error
        );

    }

}


// ================= LAST UPDATED =================

function updateLastUpdated(date) {

    const element =
        document.getElementById(
            "profileUpdatedDate"
        );

    if (!element || !date) return;


    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        element.textContent =
            "Not available";

        return;

    }


    element.textContent =
        parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

}


// ================= MESSAGE =================

function showMessage(
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
        5000
    );

}