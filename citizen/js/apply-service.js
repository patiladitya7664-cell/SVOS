/* =========================================================
   SVOS - APPLY SERVICE
   File: citizen/js/apply-service.js

   Service:
   GET  /api/admin/services/:id
   GET  /api/admin/services

   Application:
   POST /api/applications

   Database:
   MongoDB
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* =======================================================
     CONFIGURATION
  ======================================================= */

  const API_BASE_URL = "http://localhost:5000/api";

  const SERVICES_API =
    `${API_BASE_URL}/admin/services`;

  const APPLICATIONS_API =
    `${API_BASE_URL}/applications`;


  /* =======================================================
     DOM ELEMENTS
  ======================================================= */

  const form =
    document.getElementById("serviceApplicationForm");

  const serviceName =
    document.getElementById("serviceName");

  const serviceDescription =
    document.getElementById("serviceDescription");

  const serviceIcon =
    document.getElementById("serviceIcon");

  const serviceType =
    document.getElementById("serviceType");

  const requiredDocuments =
    document.getElementById("requiredDocuments");

  const applicantName =
    document.getElementById("applicantName");

  const mobile =
    document.getElementById("mobile");

  const email =
    document.getElementById("email");

  const aadhaarLastFour =
    document.getElementById("aadhaarLastFour");

  const address =
    document.getElementById("address");

  const village =
    document.getElementById("village");

  const district =
    document.getElementById("district");

  const state =
    document.getElementById("state");

  const pincode =
    document.getElementById("pincode");

  const purpose =
    document.getElementById("purpose");

  const documentInfo =
    document.getElementById("documentInfo");

  const declaration =
    document.getElementById("declaration");

  const submitButton =
    document.getElementById("submitApplication");

  const applicationMessage =
    document.getElementById("applicationMessage");

  const successModal =
    document.getElementById("successModal");

  const applicationId =
    document.getElementById("applicationId");


  /* =======================================================
     SELECTED SERVICE
  ======================================================= */

  let selectedService = null;


  /* =======================================================
     GET SERVICE ID FROM URL
  ======================================================= */

  function getServiceFromURL() {

    const params =
      new URLSearchParams(
        window.location.search
      );

    return (
      params.get("service") ||
      params.get("serviceId") ||
      ""
    ).trim();
  }


  /* =======================================================
     GET CURRENT USER
  ======================================================= */

  function getCurrentUser() {

    try {

      const storedUser =
        localStorage.getItem("svosUser");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);

    } catch (error) {

      console.error(
        "SVOS user parsing error:",
        error
      );

      return null;
    }
  }


  /* =======================================================
     LOAD CITIZEN DETAILS
  ======================================================= */

  function loadUserDetails() {

    const user =
      getCurrentUser();

    if (!user) {

      showMessage(
        "Please login before applying for a service.",
        "error"
      );

      setTimeout(() => {

        window.location.href =
          "../login.html";

      }, 1200);

      return;
    }


    if (applicantName) {

      applicantName.value =
        user.name ||
        user.fullName ||
        "";

    }


    if (mobile) {

      mobile.value =
        user.mobile ||
        user.phone ||
        user.phoneNumber ||
        "";

    }


    if (email) {

      email.value =
        user.email ||
        "";

    }


    if (address) {

      address.value =
        user.address ||
        "";

    }


    if (village) {

      village.value =
        user.village ||
        "";

    }


    if (district) {

      district.value =
        user.district ||
        "";

    }


    if (state && user.state) {

      state.value =
        user.state;

    }


    if (pincode) {

      pincode.value =
        user.pincode ||
        user.pinCode ||
        "";

    }


    const userName =
      document.getElementById(
        "userName"
      );

    if (userName) {

      userName.textContent =
        user.name ||
        "Citizen";

    }


    const userAvatar =
      document.getElementById(
        "userAvatar"
      );

    if (
      userAvatar &&
      user.name
    ) {

      userAvatar.textContent =
        user.name
          .charAt(0)
          .toUpperCase();

    }
  }


  /* =======================================================
     LOAD SELECTED SERVICE FROM MONGODB
  ======================================================= */

  async function loadService() {

    const serviceId =
      getServiceFromURL();


    console.log(
      "🔎 Selected Service ID:",
      serviceId
    );


    if (!serviceId) {

      showPageError(
        "Service information is missing. Please return to the Services page and select a service."
      );

      disableForm();

      return;
    }


    try {

      /*
       * First try:
       * GET /api/admin/services/:id
       */

      let response =
        await fetch(
          `${SERVICES_API}/${encodeURIComponent(serviceId)}`
        );


      /*
       * If backend does not provide
       * /:id route, fallback to
       * GET /api/admin/services
       */

      if (!response.ok) {

        console.warn(
          "Direct service lookup failed. Trying service list..."
        );


        response =
          await fetch(
            SERVICES_API
          );

      }


      if (!response.ok) {

        throw new Error(
          `Unable to load service. Server returned ${response.status}.`
        );

      }


      const result =
        await response.json();


      console.log(
        "📥 Service API Response:",
        result
      );


      let service = null;


      /*
       * Possible backend response formats
       */

      if (
        result.data &&
        !Array.isArray(result.data)
      ) {

        service =
          result.data;

      }


      if (
        !service &&
        result.service
      ) {

        service =
          result.service;

      }


      /*
       * If response is an array,
       * find selected service.
       */

      if (
        !service &&
        Array.isArray(result.data)
      ) {

        service =
          result.data.find(
            item =>
              String(
                item._id ||
                item.id ||
                item.serviceId
              ) === String(serviceId)
          );

      }


      if (
        !service &&
        Array.isArray(result.services)
      ) {

        service =
          result.services.find(
            item =>
              String(
                item._id ||
                item.id ||
                item.serviceId
              ) === String(serviceId)
          );

      }


      if (!service) {

        throw new Error(
          "Service not found. Please return to the Services page and select a valid service."
        );

      }


      selectedService =
        service;


      displayService(
        service
      );


    } catch (error) {

      console.error(
        "❌ Service loading error:",
        error
      );


      showPageError(
        error.message ||
        "Unable to load service."
      );

      disableForm();

    }

  }


  /* =======================================================
     DISPLAY SERVICE
  ======================================================= */

  function displayService(service) {

    const name =
      service.name ||
      service.title ||
      service.serviceName ||
      "Government Service";


    const description =
      service.description ||
      service.details ||
      service.content ||
      "No additional information available.";


    const icon =
      service.icon ||
      service.emoji ||
      "📝";


    const documents =
      service.documents ||
      service.requiredDocuments ||
      service.documentsRequired ||
      [];


    if (serviceIcon) {

      serviceIcon.textContent =
        icon;

    }


    if (serviceName) {

      serviceName.textContent =
        name;

    }


    if (serviceDescription) {

      serviceDescription.textContent =
        description;

    }


    if (serviceType) {

      serviceType.value =
        name;

    }


    if (requiredDocuments) {

      if (
        Array.isArray(documents) &&
        documents.length > 0
      ) {

        requiredDocuments.innerHTML =
          documents
            .map(
              documentName => `
                <li>
                  ${escapeHTML(
                    typeof documentName === "object"
                      ? (
                          documentName.name ||
                          documentName.title ||
                          documentName.document ||
                          ""
                        )
                      : documentName
                  )}
                </li>
              `
            )
            .join("");

      } else {

        requiredDocuments.innerHTML = `
          <li>
            Required documents as per department guidelines.
          </li>
        `;

      }

    }


    console.log(
      "✅ Service loaded:",
      service
    );

  }


  /* =======================================================
     VALIDATION FUNCTIONS
  ======================================================= */

  function validateMobile(value) {

    return /^[6-9][0-9]{9}$/.test(
      value
    );

  }


  function validatePincode(value) {

    return /^[1-9][0-9]{5}$/.test(
      value
    );

  }


  function validateEmail(value) {

    if (!value) {
      return true;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      value
    );

  }


  function validateAadhaarLastFour(value) {

    if (!value) {
      return true;
    }

    return /^[0-9]{4}$/.test(
      value
    );

  }


  /* =======================================================
     FIELD ERRORS
  ======================================================= */

  function clearFieldErrors() {

    document
      .querySelectorAll(".field-error")
      .forEach(
        element => {
          element.textContent = "";
        }
      );

  }


  function setFieldError(
    elementId,
    message
  ) {

    const element =
      document.getElementById(
        elementId
      );

    if (element) {

      element.textContent =
        message;

    }

  }


  /* =======================================================
     FORM VALIDATION
  ======================================================= */

  function validateForm() {

    clearFieldErrors();

    let valid = true;


    /* NAME */

    if (
      !applicantName ||
      !applicantName.value.trim()
    ) {

      setFieldError(
        "applicantNameError",
        "Please enter your full name."
      );

      valid = false;

    }


    /* MOBILE */

    const mobileValue =
      mobile
        ? mobile.value.trim()
        : "";


    if (!mobileValue) {

      setFieldError(
        "mobileError",
        "Please enter your mobile number."
      );

      valid = false;

    } else if (
      !validateMobile(
        mobileValue
      )
    ) {

      setFieldError(
        "mobileError",
        "Enter a valid 10-digit Indian mobile number."
      );

      valid = false;

    }


    /* EMAIL */

    const emailValue =
      email
        ? email.value.trim()
        : "";


    if (
      emailValue &&
      !validateEmail(
        emailValue
      )
    ) {

      setFieldError(
        "emailError",
        "Please enter a valid email address."
      );

      valid = false;

    }


    /* AADHAAR LAST 4 */

    const aadhaarValue =
      aadhaarLastFour
        ? aadhaarLastFour.value.trim()
        : "";


    if (
      aadhaarValue &&
      !validateAadhaarLastFour(
        aadhaarValue
      )
    ) {

      showMessage(
        "Aadhaar last 4 digits must contain exactly 4 numbers.",
        "error"
      );

      valid = false;

    }


    /* ADDRESS */

    if (
      !address ||
      !address.value.trim()
    ) {

      setFieldError(
        "addressError",
        "Please enter your complete address."
      );

      valid = false;

    }


    /* VILLAGE */

    if (
      !village ||
      !village.value.trim()
    ) {

      showMessage(
        "Please enter your village name.",
        "error"
      );

      valid = false;

    }


    /* DISTRICT */

    if (
      !district ||
      !district.value.trim()
    ) {

      showMessage(
        "Please enter your district.",
        "error"
      );

      valid = false;

    }


    /* STATE */

    if (
      !state ||
      !state.value.trim()
    ) {

      showMessage(
        "Please enter your state.",
        "error"
      );

      valid = false;

    }


    /* PINCODE */

    const pincodeValue =
      pincode
        ? pincode.value.trim()
        : "";


    if (!pincodeValue) {

      showMessage(
        "Please enter your PIN code.",
        "error"
      );

      valid = false;

    } else if (
      !validatePincode(
        pincodeValue
      )
    ) {

      showMessage(
        "Please enter a valid 6-digit PIN code.",
        "error"
      );

      valid = false;

    }


    /* PURPOSE */

    if (
      !purpose ||
      !purpose.value.trim()
    ) {

      setFieldError(
        "purposeError",
        "Please enter the purpose or application details."
      );

      valid = false;

    }


    /* DECLARATION */

    if (
      !declaration ||
      !declaration.checked
    ) {

      showMessage(
        "Please accept the declaration before submitting.",
        "error"
      );

      valid = false;

    }


    return valid;

  }


  /* =======================================================
     SUBMIT APPLICATION
  ======================================================= */

  async function submitApplication(event) {

    event.preventDefault();


    if (
      submitButton &&
      submitButton.disabled
    ) {

      return;

    }


    hideMessage();


    if (!validateForm()) {

      return;

    }


    const user =
      getCurrentUser();


    if (!user) {

      showMessage(
        "Your login session was not found. Please login again.",
        "error"
      );

      return;

    }


    if (!selectedService) {

      showMessage(
        "Service information is not loaded. Please refresh the page and try again.",
        "error"
      );

      return;

    }


    /* =====================================================
       SERVICE ID
    ===================================================== */

    const serviceId =
      selectedService._id ||
      selectedService.id ||
      selectedService.serviceId ||
      getServiceFromURL();


    const serviceNameValue =
      selectedService.name ||
      selectedService.title ||
      selectedService.serviceName ||
      serviceType?.value ||
      "";


    if (!serviceId) {

      showMessage(
        "Selected service ID is missing.",
        "error"
      );

      return;

    }


/* =====================================================
   APPLICATION DATA
===================================================== */

const applicationData = {

  /* Citizen */
  citizenId:
    user._id ||
    user.id ||
    user.uid ||
    "",

  /* Applicant */
  name:
    applicantName
      ? applicantName.value.trim()
      : "",

  email:
    email
      ? email.value.trim()
      : "",

  mobile:
    mobile
      ? mobile.value.trim()
      : "",

  /* Service */
  serviceId:
    String(serviceId),

  serviceName:
    serviceNameValue,

  /* Address */
  address:
    address
      ? address.value.trim()
      : "",

  /* Application Details */
  purpose:
    purpose
      ? purpose.value.trim()
      : "",

  additionalDetails:
    purpose
      ? purpose.value.trim()
      : "",

  /* Documents */
  documentDetails:
    documentInfo
      ? documentInfo.value.trim()
      : "",

  documents:
    [],

  /* Initial Status */
  status:
    "Pending"
};


    /* =====================================================
       SEND TO BACKEND
    ===================================================== */

    try {

      const response =
        await fetch(
          APPLICATIONS_API,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(
                applicationData
              )
          }
        );


      let data;


      try {

        data =
          await response.json();

      } catch (jsonError) {

        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );

      }


      console.log(
        "📥 Application API Response:",
        data
      );


      if (!response.ok) {

        throw new Error(
          data.message ||
          data.error ||
          "Unable to submit application."
        );

      }


      /* ===================================================
         SUCCESS
      =================================================== */

      const generatedApplicationId =
        data.applicationId ||
        data.application?.applicationId ||
        data.application?._id ||
        data.data?.applicationId ||
        data.data?._id;


      if (!generatedApplicationId) {

        showMessage(
          "Application submitted successfully, but Application ID was not returned by the server.",
          "success"
        );

        setSubmitLoading(
          false
        );

        return;

      }


      localStorage.setItem(
        "lastApplicationId",
        generatedApplicationId
      );


      showSuccessModal(
        generatedApplicationId
      );


    } catch (error) {

      console.error(
        "❌ SVOS application submission error:",
        error
      );


      if (
        error instanceof TypeError
      ) {

        showMessage(
          "Unable to connect to the SVOS server. Please make sure the backend server is running.",
          "error"
        );

      } else {

        showMessage(
          error.message ||
          "Something went wrong while submitting your application.",
          "error"
        );

      }


      setSubmitLoading(
        false
      );

    }

  }


  /* =======================================================
     SUBMIT BUTTON LOADING
  ======================================================= */

  function setSubmitLoading(
    loading
  ) {

    if (!submitButton) {
      return;
    }


    submitButton.disabled =
      loading;


    if (loading) {

      submitButton.dataset.originalText =
        submitButton.innerHTML;


      submitButton.innerHTML = `
        <span>⏳</span>
        Submitting...
      `;

    } else {

      submitButton.innerHTML =
        submitButton.dataset.originalText ||
        `
          <span>📨</span>
          Submit Application
        `;

    }

  }


  /* =======================================================
     SUCCESS MODAL
  ======================================================= */

  function showSuccessModal(
    generatedId
  ) {

    if (applicationId) {

      applicationId.textContent =
        generatedId;

    }


    if (successModal) {

      successModal.classList.remove(
        "hidden"
      );

    }


    document.body.style.overflow =
      "hidden";


    setSubmitLoading(
      false
    );

  }


  /* =======================================================
     MESSAGE
  ======================================================= */

  function showMessage(
    message,
    type = "info"
  ) {

    if (!applicationMessage) {
      return;
    }


    applicationMessage.textContent =
      message;


    applicationMessage.className =
      `application-message ${type}`;

  }


  /* =======================================================
     HIDE MESSAGE
  ======================================================= */

  function hideMessage() {

    if (!applicationMessage) {
      return;
    }


    applicationMessage.textContent =
      "";


    applicationMessage.className =
      "application-message";

  }


  /* =======================================================
     PAGE ERROR
  ======================================================= */

  function showPageError(
    message
  ) {

    const content =
      document.querySelector(
        ".application-page-grid"
      );


    if (!content) {
      return;
    }


    const errorBox =
      document.createElement(
        "div"
      );


    errorBox.className =
      "application-page-error";


    errorBox.innerHTML = `
      <div class="error-icon">
        ⚠️
      </div>

      <h2>
        Unable to Load Service
      </h2>

      <p>
        ${escapeHTML(
          message
        )}
      </p>

      <a href="services.html">
        ← Back to Services
      </a>
    `;


    content.innerHTML =
      "";


    content.appendChild(
      errorBox
    );

  }


  /* =======================================================
     DISABLE FORM
  ======================================================= */

  function disableForm() {

    if (!form) {
      return;
    }


    form
      .querySelectorAll(
        "input, textarea, button"
      )
      .forEach(
        element => {
          element.disabled =
            true;
        }
      );

  }


  /* =======================================================
     HTML ESCAPE
  ======================================================= */

  function escapeHTML(
    value
  ) {

    return String(
      value
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );

  }


  /* =======================================================
     INPUT RESTRICTIONS
  ======================================================= */

  function setupInputRestrictions() {

    if (mobile) {

      mobile.addEventListener(
        "input",
        () => {

          mobile.value =
            mobile.value
              .replace(
                /[^0-9]/g,
                ""
              )
              .slice(
                0,
                10
              );

        }
      );

    }


    if (pincode) {

      pincode.addEventListener(
        "input",
        () => {

          pincode.value =
            pincode.value
              .replace(
                /[^0-9]/g,
                ""
              )
              .slice(
                0,
                6
              );

        }
      );

    }


    if (aadhaarLastFour) {

      aadhaarLastFour.addEventListener(
        "input",
        () => {

          aadhaarLastFour.value =
            aadhaarLastFour.value
              .replace(
                /[^0-9]/g,
                ""
              )
              .slice(
                0,
                4
              );

        }
      );

    }

  }


  /* =======================================================
     AUTO CLEAR ERRORS
  ======================================================= */

  function setupErrorClearing() {

    const fields = [
      applicantName,
      mobile,
      email,
      address,
      purpose
    ];


    fields.forEach(
      field => {

        if (!field) {
          return;
        }


        field.addEventListener(
          "input",
          () => {

            const errorId =
              `${field.id}Error`;


            const errorElement =
              document.getElementById(
                errorId
              );


            if (errorElement) {

              errorElement.textContent =
                "";

            }


            hideMessage();

          }
        );

      }
    );

  }


  /* =======================================================
     CLOSE SUCCESS MODAL
  ======================================================= */

  function setupSuccessModal() {

    if (!successModal) {
      return;
    }


    const closeButtons =
      successModal.querySelectorAll(
        "[data-close-modal], .close-modal, .modal-close"
      );


    closeButtons.forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            successModal.classList.add(
              "hidden"
            );


            document.body.style.overflow =
              "";

          }
        );

      }
    );

  }


  /* =======================================================
     INITIALIZE
  ======================================================= */

  loadUserDetails();

  setupInputRestrictions();

  setupErrorClearing();

  setupSuccessModal();


  /*
   * Load service asynchronously
   */

  loadService();


  /* =======================================================
     FORM SUBMIT
  ======================================================= */

  if (form) {

    form.addEventListener(
      "submit",
      submitApplication
    );

  }


  console.log(
    "✅ SVOS Apply Service module initialized successfully."
  );

});
