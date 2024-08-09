import { fillNextSquare, removeLastSquareValue } from "./gameboard.service.js";
import { forfeitGame, startGame } from "./game.service.js";
import { processAttempt } from "./attempt.service.js";
import { getCurrentViewName, showView, viewHistory } from "../utils/helpers.js";
import { DEFAULT_MAX_ATTEMPTS, DEFAULT_WORD_LENGTH, EMAIL_REGEX, USERNAME_REGEX } from "../constants.js";
import {
  authenticate,
  changePassword,
  logoutUser,
  register,
} from "./authentication.service.js";
import { showMessage } from "./message.service.js";

//TODO: this has too many functions that belong in other modules.

// When we are performing certain tasks, we don't want to accept user input and block it conditionally.
var blockKeyEvents = false;

/**
 * Add event listeners for global key press events.
 */
export const addKeyListeners = () => {
  // Keypress only listens for keys that emit a value
  document.addEventListener("keypress", function (event) {
    if (blockKeyEvents) {
      console.log("Key events are blocked.");
      return;
    }

    const key = event.key;

    if (key === "Enter") {
      if (getCurrentViewName() === "home") {
        clickStartGameButton();
        return;
      }
      processAttempt();
      return;
    }

    fillNextSquare(key);
  });

  // Keydown is for non-value keys as well
  document.addEventListener("keydown", function (event) {
    if (blockKeyEvents) {
      console.log("Key events are blocked.");
      return;
    }

    const key = event.key;

    if (key === "Delete" || key === "Backspace") removeLastSquareValue(key);
  });
};

/**
 * Handles the event when a user taps a key on the on-screen keyboard.
 *
 * @param {string} letter The letter entered by the user.
 */
export const clickKeyboardKey = (letter) => {
  console.log(letter);
  if (blockKeyEvents) {
    console.log("Key events are blocked.");
    return;
  }

  if (letter === "delete") {
    removeLastSquareValue();
    return;
  }

  if (letter === "enter") {
    processAttempt();
    return;
  }

  fillNextSquare(letter);
};

/**
 * Prompts the user if they'd like to forfeit, then forfeits or closes depending on the user's choice.
 */
export const clickForfeitGameButton = async () => {
  if (window.confirm("Are you sure you want to forfeit the game?"))
    await forfeitGame();
};

/**
 * Begins a new game.
 */
export const clickStartGameButton = (
  event, // required parameter since we are using additional parameters with the event listener callback
  wordLength = DEFAULT_WORD_LENGTH,
  maxAttempts = DEFAULT_MAX_ATTEMPTS
) => {
  startGame({
    wordLength: wordLength,
    maxAttempts: maxAttempts,
    language: "enUS",
  });
};

/**
 * Shows the home view when the user clicks the back button element generated in views.
 */
export const clickBackButton = () => {
  // Pop the previous view name from the view history stack.
  const previousView = viewHistory.pop();
  showView(previousView, {
    hideFromHistory: true,
  });
};

/**
 * Shows the options view when the user clicks the options button.
 */
export const clickOptionsButton = () => {
  showView("options");
};

/**
 * Shows the how to play view when the user clicks the how to play button.
 */
export const clickHowToPlayButton = () => {
  showView("how-to-play");
};

/**
 * Tries to authenticate with the server using the input username and password.
 */
export const clickLoginButton = () => {
  const email = document.querySelector("#email")?.value;
  const password = document.querySelector("#password")?.value;

  // Make sure the email doesn't have any invalid characters
  if (!EMAIL_REGEX.test(email)) {
    showMessage("Invalid e-mail address format.", {
      className: "error",
      hide: false,
    });
    return;
  }

  authenticate(email, password);
};

/**
 * TODO: handle logic for registration
 */
export const clickRegisterButton = () => {
  const emailInput = document.querySelector("#email");
  const passwordInput = document.querySelector("#password");
  const confirmPasswordInput = document.querySelector("#confirmPassword");
  const usernameInput = document.querySelector("#username");

  if (
    !emailInput ||
    !passwordInput ||
    !confirmPasswordInput ||
    !usernameInput
  ) {
    showMessage("Please check all form values and try again.", {
      className: "error",
      hide: false,
    });
    return;
  }

  if (!EMAIL_REGEX.test(emailInput.value)) {
    showMessage("Email is not a valid email address.", {
      className: "error",
      hide: false,
    });
    emailInput.classList.add("error");
    return;
  } else {
    emailInput.classList.remove("error");
  }

  if (!USERNAME_REGEX.test(usernameInput.value)) {
    showMessage(
      "Username must be 3-16 characters long.\r\nA-z, numbers, hyphen, underscore, spaces only.",
      {
        className: "error",
        hide: false,
      }
    );
    usernameInput.classList.add("error");
    return;
  } else {
    usernameInput.classList.remove("error");
  }

  if (passwordInput.value !== confirmPasswordInput.value) {
    showMessage("Passwords do not match.", {
      className: "error",
      hide: false,
    });
    passwordInput.classList.add("error");
    confirmPasswordInput.classList.add("error");
    return;
  } else {
    passwordInput.classList.remove("error");
    confirmPasswordInput.classList.remove("error");
  }

  register(emailInput.value, usernameInput.value, passwordInput.value);
};

export const clickChangePasswordButton = () => {
  const submitButton = document.querySelector("button[type='submit']");
  const submitLoader = document.querySelector("#submitFormLoader");

  const currentPasswordInput = document.querySelector("#currentPassword");
  const newPasswordInput = document.querySelector("#newPassword");
  const confirmNewPasswordInput = document.querySelector("#confirmNewPassword");

  if (!currentPasswordInput || !newPasswordInput || !confirmNewPasswordInput) {
    console.error(
      "Missing input element(s)",
      currentPasswordInput,
      newPasswordInput,
      confirmNewPasswordInput
    );
    return;
  }

  submitButton?.setAttribute("disabled", "disabled");
  submitLoader?.classList.remove("hidden");

  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const confirmNewPassword = confirmNewPasswordInput.value;

  if (newPassword !== confirmNewPassword) {
    showMessage("New passwords do not match.", {
      className: "error",
      hide: false,
    });
    submitLoader?.classList.add("hidden");
    submitButton?.removeAttribute("disabled");
    return;
  }

  submitLoader?.classList.add("hidden");

  // Obtain the change password response from the API.
  // Re-enable the form and display an error if no response is found or if we received an error status.
  changePassword(currentPassword, newPassword).then((response) => {
    console.log("changePasswordResponse", response);
    if (!response || response.status === "error") {
      submitButton?.removeAttribute("disabled");
      showMessage((response.message || "An error has occurred. Please try again."), {
        className: "error",
        hide: false,
      });
    } else if (response.status === "success") {
      showView("login", {
        message: "Your password has been updated successfully.\r\nPlease log in with your new password."
      })
    }
  });
};

export const clickForgotPasswordButton = () => {
  const emailInput = document.querySelector("#email");
  if (!emailInput) {
    console.error("Missing email input element");
    return;
  }

  if (!EMAIL_REGEX.test(emailInput.value)) {
    showMessage("Email is not a valid email address.", {
      className: "error",
      hide: false,
    });
    return;
  }

  showMessage("If the email address entered belongs to your account, you will receive an email link to reset your password.");

  console.log(emailInput.value);

  // Verify email address

  // Inform they will receive an email
}

export const clickLoginMessage = async (event) => {
  const targetId = event.target.id;
  if (!targetId) return;

  if (targetId === "loginButton") {
    showView("login");
  } else if (targetId === "logoutButton") {
    //TODO: loading animation & blocking events
    await logoutUser();
  } else if (targetId === "registerButton") {
    showView("register");
  } else if (targetId === "forgotPasswordButton") {
    showView("forgot-password");
  } else if (targetId === "changePassword") {
    showView("change-password");
  } else {
    console.log("Unknown event target:", targetId);
  }
};

/**
 * Enable or disable the blocking of key events during animations.
 *
 * @param {boolean} block - True to block key events, false to allow them.
 */
export const setBlockKeyEvents = (block) => {
  blockKeyEvents = block;
};

/**
 * Checks whether or not key events are being blocked.
 *
 * @return {boolean} true if events are being blocked, otherwise false.
 */
export const isBlockKeyEvents = () => {
  return blockKeyEvents;
};
