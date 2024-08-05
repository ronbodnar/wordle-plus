import { clickBackButton, clickLoginButton, clickLoginMessage } from "../services/event.service.js";

export const buildForgotPasswordView = () => {
    const contentContainer = document.querySelector(".content");
    contentContainer.id = "forgot-password";

    const backButton = document.createElement("div");
    backButton.classList.add("back-button");
    backButton.innerHTML = "<img src='/assets/material-icons/keyboard-backspace.svg' style='vertical-align: -6px;'> Back";
    backButton.addEventListener("click", clickBackButton);

    const header = document.createElement("h1");
    header.classList.add("view-header");
    header.textContent = "Forgot your password?";

    const submessage = document.createElement("div");
    submessage.classList.add("submessage");
    submessage.textContent = "Enter your registered email address and we'll send you a password reset link.";

    const form = buildPasswordResetForm();

    contentContainer.innerHTML = "";
    contentContainer.appendChild(backButton);
    contentContainer.appendChild(header);
    contentContainer.appendChild(submessage);
    contentContainer.appendChild(form);
}

const buildPasswordResetForm = () => {
    const form = document.createElement('form');
    form.classList.add("form");
    form.onsubmit = () => { clickLoginButton(); return false }; // prevent submission
    form.style.marginTop = "25px";

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", "form-message", "hidden");
    messageDiv.style.width = "100%";

    const emailLabel = document.createElement("label");
    emailLabel.htmlFor = "email";
    emailLabel.textContent = "Email";

    const emailInput = document.createElement('input');
    emailInput.type = "text";
    emailInput.placeholder = "Email";
    emailInput.required = true;
    emailInput.id = "email";

    const submitButton = document.createElement('button');
    submitButton.classList.add("button");
    submitButton.type = "submit";
    submitButton.innerHTML = "Send Email <span class='button-loader hidden' id='sendPasswordResetButtonLoader'</span>";
    submitButton.style.width = "60%";
    submitButton.style.cursor = "pointer";
    submitButton.style.marginTop = "10px";

    form.appendChild(emailLabel);
    form.appendChild(emailInput);
    form.appendChild(messageDiv);
    form.appendChild(submitButton);

    return form;
}