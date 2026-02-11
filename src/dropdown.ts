document.addEventListener("DOMContentLoaded", () => {
  const dropdownButton = document.getElementById(
    "dropdown-button",
  ) as HTMLButtonElement | null;
  const dropdownContent = document.querySelector(
    ".dropdown-content",
  ) as HTMLElement | null;
  const dropdownItems = document.querySelectorAll<HTMLElement>(".dropdown-item");

  if (dropdownButton && dropdownContent) {
    const toggleDropdown = (show?: boolean) => {
      const isShown =
        show !== undefined ? show : !dropdownContent.classList.contains("show");
      if (isShown) {
        dropdownContent.classList.add("show");
        dropdownButton.setAttribute("aria-expanded", "true");
      } else {
        dropdownContent.classList.remove("show");
        dropdownButton.setAttribute("aria-expanded", "false");
      }
    };

    dropdownButton.addEventListener("click", (e: MouseEvent) => {
      e.stopPropagation();
      toggleDropdown();
    });

    dropdownButton.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        toggleDropdown(true);
        if (dropdownItems.length > 0) {
          (dropdownItems[0] as HTMLElement).focus();
        }
      }
    });

    dropdownItems.forEach((item, index) => {
      item.addEventListener("click", (e: MouseEvent) => {
        e.stopPropagation();
        toggleDropdown(false);
        dropdownButton.focus();
      });

      item.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          toggleDropdown(false);
          dropdownButton.focus();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          const nextIndex = (index + 1) % dropdownItems.length;
          (dropdownItems[nextIndex] as HTMLElement).focus();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const prevIndex =
            (index - 1 + dropdownItems.length) % dropdownItems.length;
          (dropdownItems[prevIndex] as HTMLElement).focus();
        } else if (e.key === "Home") {
          e.preventDefault();
          (dropdownItems[0] as HTMLElement).focus();
        } else if (e.key === "End") {
          e.preventDefault();
          (dropdownItems[dropdownItems.length - 1] as HTMLElement).focus();
        }
      });
    });

    window.addEventListener("click", (event: MouseEvent) => {
      if (dropdownButton && !dropdownButton.contains(event.target as Node)) {
        if (dropdownContent.classList.contains("show")) {
          toggleDropdown(false);
        }
      }
    });
  }
});
