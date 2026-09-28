document.addEventListener("DOMContentLoaded", function () {

    loadOfficerName();

    setupEmergencyCalls();

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


// ================= EMERGENCY CALL BUTTONS =================

function setupEmergencyCalls() {

    const callButtons =
        document.querySelectorAll(
            ".emergency-call-btn"
        );

    callButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const phoneNumber =
                    this.getAttribute("href");

                if (!phoneNumber) return;

                console.log(
                    "Emergency call:",
                    phoneNumber
                );

            }
        );

    });

}