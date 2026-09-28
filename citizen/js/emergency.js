// =========================================================
// SVOS CITIZEN - EMERGENCY CONTACTS
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadCitizenName();

        setupEmergencyCalls();

    }
);


// =========================================================
// LOAD CITIZEN NAME
// =========================================================

function loadCitizenName() {

    const userName =
        document.getElementById("userName");

    if (!userName) return;

    try {

        const storedUser =
            JSON.parse(
                localStorage.getItem("svosUser")
            );

        if (
            storedUser &&
            storedUser.name
        ) {

            userName.textContent =
                storedUser.name;

        }

    } catch (error) {

        console.error(
            "User data error:",
            error
        );

    }

}


// =========================================================
// EMERGENCY CALL BUTTONS
// =========================================================

function setupEmergencyCalls() {

    const callButtons =
        document.querySelectorAll(
            ".emergency-call-btn"
        );

    callButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const phoneNumber =
                        this.getAttribute("href");

                    if (!phoneNumber) {
                        return;
                    }

                    console.log(
                        "Emergency call:",
                        phoneNumber
                    );

                }
            );

        }
    );

}