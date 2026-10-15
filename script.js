const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

const dashboard = document.getElementById("dashboard");
const playButton = document.getElementById("playButton");
const demoButton = document.getElementById("demoButton");

const toast = document.getElementById("toast");

let toastTimer;


/* MOBILE NAVIGATION */

menuToggle.addEventListener("click", function () {

    const isOpen = navLinks.classList.toggle("open");

    menuToggle.textContent = isOpen ? "✕" : "☰";

    menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
    );

});


/* CLOSE MENU AFTER CLICKING A LINK */

navLinks.querySelectorAll("a").forEach(function (link) {

    link.addEventListener("click", function () {

        navLinks.classList.remove("open");

        menuToggle.textContent = "☰";

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

    });

});


/* NOTIFICATION */

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(function () {

        toast.classList.remove("show");

    }, 2500);

}


/* DASHBOARD DEMO BUTTON */

playButton.addEventListener("click", function () {

    dashboard.classList.toggle("active");

    if (dashboard.classList.contains("active")) {

        showToast("Workflow demo preview playing");

    } else {

        showToast("Demo preview paused");

    }

});


/* VIEW DEMO BUTTON */

demoButton.addEventListener("click", function () {

    dashboard.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    setTimeout(function () {

        showToast("Explore the Nexora workflow preview");

    }, 500);

});
