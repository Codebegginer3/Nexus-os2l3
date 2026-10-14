document.addEventListener("DOMContentLoaded", () => {
    const workspace = document.getElementById("workspace");
    const windows = document.querySelectorAll(".window");
    const clock = document.getElementById("clock");

    let highestZIndex = 30;

    // Live clock
    function updateClock() {
        const now = new Date();

        clock.textContent = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        });
    }

    updateClock();
    setInterval(updateClock, 1000);

    // Open application windows
    function openWindow(id) {
        const app = document.getElementById(id);

        if (!app || !workspace) return;

        app.classList.remove("hidden");
        app.style.zIndex = ++highestZIndex;

        if (!app.dataset.positioned) {
            app.style.left = "50%";
            app.style.top = "50%";
            app.style.transform = "translate(-50%, -50%)";
            app.dataset.positioned = "true";
        }

        if (id === "terminal") {
            const input = document.getElementById("terminalInput");
            if (input) input.focus();
        }
    }

    // Desktop and dock launch buttons
    document.querySelectorAll("[data-open]").forEach(button => {
        button.addEventListener("click", () => {
            openWindow(button.dataset.open);
        });
    });

    // Close and minimize controls
    windows.forEach(app => {
        app.querySelector("[data-close]")?.addEventListener("click", () => {
            app.classList.add("hidden");
        });

        app.querySelector("[data-minimize]")?.addEventListener("click", () => {
            app.classList.add("hidden");
        });

        app.addEventListener("pointerdown", () => {
            app.style.zIndex = ++highestZIndex;
        });
    });

    // Draggable windows
    windows.forEach(app => {
        const header = app.querySelector(".window-header");
        if (!header) return;

        let dragging = false;
        let startX = 0;
        let startY = 0;
        let initialLeft = 0;
        let initialTop = 0;

        header.addEventListener("pointerdown", event => {
            if (event.target.closest("button")) return;

            dragging = true;

            const appRect = app.getBoundingClientRect();
            const workspaceRect = workspace.getBoundingClientRect();

            // Convert the current position into workspace coordinates.
            app.style.transform = "none";
            app.style.left = `${appRect.left - workspaceRect.left}px`;
            app.style.top = `${appRect.top - workspaceRect.top}px`;

            initialLeft = appRect.left - workspaceRect.left;
            initialTop = appRect.top - workspaceRect.top;

            startX = event.clientX;
            startY = event.clientY;

            app.style.zIndex = ++highestZIndex;
            header.setPointerCapture(event.pointerId);
        });

        header.addEventListener("pointermove", event => {
            if (!dragging) return;

            const workspaceRect = workspace.getBoundingClientRect();

            const maxLeft = Math.max(0, workspaceRect.width - app.offsetWidth);
            const maxTop = Math.max(0, workspaceRect.height - app.offsetHeight);

            const newLeft = Math.min(
                maxLeft,
                Math.max(0, initialLeft + event.clientX - startX)
            );

            const newTop = Math.min(
                maxTop,
                Math.max(0, initialTop + event.clientY - startY)
            );

            app.style.left = `${newLeft}px`;
            app.style.top = `${newTop}px`;
        });

        function stopDragging() {
            dragging = false;
        }

        header.addEventListener("pointerup", stopDragging);
        header.addEventListener("pointercancel", stopDragging);
        header.addEventListener("lostpointercapture", stopDragging);
    });

    // Terminal
    const terminalForm = document.getElementById("terminalForm");
    const terminalInput = document.getElementById("terminalInput");
    const terminalOutput = document.getElementById("terminalOutput");

    function printTerminal(text, className = "") {
        const line = document.createElement("p");

        line.textContent = text;
        if (className) line.className = className;

        terminalOutput.appendChild(line);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    const commands = {
        help: () => {
            printTerminal("Available commands:");
            printTerminal("help     - Show available commands");
            printTerminal("date     - Show current date");
            printTerminal("time     - Show current time");
            printTerminal("about    - About NEXUS OS");
            printTerminal("clear    - Clear terminal");
            printTerminal("whoami   - Show current user");
            printTerminal("apps     - List desktop applications");
            printTerminal("open terminal | files | about");
        },

        date: () => printTerminal(new Date().toDateString()),

        time: () => printTerminal(new Date().toLocaleTimeString()),

        about: () => printTerminal(
            "NEXUS OS 2.0 — A browser-based desktop environment."
        ),

        whoami: () => printTerminal("nexus-user"),

        apps: () => printTerminal("Available apps: terminal, files, about"),

        clear: () => {
            terminalOutput.replaceChildren();
        }
    };

    terminalForm.addEventListener("submit", event => {
        event.preventDefault();

        const command = terminalInput.value.trim();
        if (!command) return;

        printTerminal(`nexus@desktop:~$ ${command}`, "command-echo");

        const parts = command.toLowerCase().split(/\s+/);

        if (parts[0] === "open") {
            const appName = parts[1];

            const aliases = {
                terminal: "terminal",
                files: "files",
                explorer: "files",
                about: "about"
            };

            if (aliases[appName]) {
                openWindow(aliases[appName]);
                printTerminal(`Opening ${appName}...`);
            } else {
                printTerminal("Unknown app. Try: open terminal, files, or about");
            }
        } else if (commands[parts[0]]) {
            commands[parts[0]]();
        } else {
            printTerminal(`Command not found: ${command}`);
            printTerminal("Type 'help' to see available commands.");
        }

        terminalInput.value = "";
    });

    // Power button and restart
    const powerButton = document.getElementById("powerButton");
    const shutdownOverlay = document.getElementById("shutdownOverlay");
    const restartButton = document.getElementById("restartButton");

    powerButton.addEventListener("click", () => {
        shutdownOverlay.classList.remove("hidden");
    });

    restartButton.addEventListener("click", () => {
        shutdownOverlay.classList.add("hidden");

        windows.forEach(app => {
            app.classList.add("hidden");
        });

        printTerminal("NEXUS OS session restarted.");
    });

    // Keep desktop usable after screen resizing
    window.addEventListener("resize", () => {
        const rect = workspace.getBoundingClientRect();

        windows.forEach(app => {
            if (app.classList.contains("hidden")) return;

            const left = parseFloat(app.style.left);
            const top = parseFloat(app.style.top);

            if (Number.isFinite(left) && app.dataset.positioned === "true") {
                if (app.style.transform === "none") {
                    app.style.left = `${Math.max(
                        0,
                        Math.min(left, rect.width - app.offsetWidth)
                    )}px`;

                    app.style.top = `${Math.max(
                        0,
                        Math.min(top, rect.height - app.offsetHeight)
                    )}px`;
                }
            }
        });
    });

    console.log("NEXUS OS 2.0 initialized.");
});
