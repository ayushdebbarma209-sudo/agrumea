/* Agrumea Farm — progressive enhancement, no dependencies. */
(() => {
  "use strict";

  const doc = document;
  const root = doc.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (selector, scope = doc) => scope.querySelector(selector);
  const $$ = (selector, scope = doc) => Array.from(scope.querySelectorAll(selector));

  /* ---------------------------------------------------------------------
     Header state
     --------------------------------------------------------------------- */

  const header = $("[data-header]");

  if (header) {
    let lastKnown = -1;

    const updateHeader = () => {
      const y = window.scrollY || window.pageYOffset;
      if (y === lastKnown) return;
      lastKnown = y;
      header.classList.toggle("is-scrolled", y > 24);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  /* ---------------------------------------------------------------------
     Full-screen navigation
     --------------------------------------------------------------------- */

  const menuToggle = $("[data-menu-toggle]");
  const menuPanel = $("#site-menu");
  const pageMain = $("#main");
  const pageFooter = $(".site-footer");

  if (menuToggle && menuPanel) {
    let menuOpen = false;
    let returnFocus = null;

    const menuFocusable = () =>
      $$('a[href], button:not([disabled])', menuPanel).filter(
        (el) => el.getClientRects().length > 0
      );

    const openMenu = () => {
      if (menuOpen) return;
      menuOpen = true;
      returnFocus = doc.activeElement;
      menuPanel.inert = false;
      menuPanel.removeAttribute("inert");
      menuPanel.setAttribute("aria-hidden", "false");
      menuToggle.setAttribute("aria-expanded", "true");
      doc.body.classList.add("menu-open");
      if (pageMain) pageMain.inert = true;
      if (pageFooter) pageFooter.inert = true;

      window.setTimeout(() => {
        const first = menuPanel.querySelector(".menu-nav__link") || menuFocusable()[0];
        if (first) first.focus({ preventScroll: true });
      }, 60);
    };

    const closeMenu = ({ restoreFocus = true } = {}) => {
      if (!menuOpen) return;
      menuOpen = false;
      menuPanel.setAttribute("aria-hidden", "true");
      menuPanel.inert = true;
      menuToggle.setAttribute("aria-expanded", "false");
      doc.body.classList.remove("menu-open");
      if (pageMain) pageMain.inert = false;
      if (pageFooter) pageFooter.inert = false;

      if (restoreFocus) {
        const target = returnFocus instanceof HTMLElement ? returnFocus : menuToggle;
        target.focus({ preventScroll: true });
      }
    };

    menuToggle.addEventListener("click", () => {
      if (menuOpen) closeMenu();
      else openMenu();
    });

    menuPanel.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (link) closeMenu({ restoreFocus: false });
    });

    doc.addEventListener("keydown", (event) => {
      if (!menuOpen) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = menuFocusable();
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = doc.activeElement;

      if (event.shiftKey && (active === first || !menuPanel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (menuOpen && window.innerWidth > 1024) closeMenu({ restoreFocus: false });
    });
  }

  /* ---------------------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------------------- */

  const revealItems = $$("[data-reveal]");

  if (revealItems.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -7% 0px", threshold: 0.08 }
      );

      revealItems.forEach((item) => revealObserver.observe(item));
    }
  }

  /* ---------------------------------------------------------------------
     Hero entrance
     --------------------------------------------------------------------- */

  const hero = $("[data-hero]");

  if (hero) {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => hero.classList.add("is-ready"));
    });
  }

  /* ---------------------------------------------------------------------
     Pantry filtering
     --------------------------------------------------------------------- */

  const productGrid = $("[data-product-grid]");

  if (productGrid) {
    const productCards = $$(".product-card--pantry", productGrid);
    const filterButtons = $$("[data-filter]");
    const filterCount = $("[data-filter-count]");
    const emptyState = $("[data-empty]");
    const validFilters = ["all", "jams", "creams", "savoury"];
    let currentFilter = "all";

    const applyFilter = (filter, syncHash = true) => {
      const next = validFilters.includes(filter) ? filter : "all";
      currentFilter = next;
      let visible = 0;

      productCards.forEach((card) => {
        const show = next === "all" || card.dataset.category === next;
        card.classList.toggle("is-hidden", !show);
        if (show) visible += 1;
      });

      filterButtons.forEach((button) => {
        const active = button.dataset.filter === next;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });

      if (filterCount) {
        filterCount.textContent = `Showing ${visible} ${visible === 1 ? "jar" : "jars"}`;
      }

      if (emptyState) emptyState.hidden = visible !== 0;

      if (syncHash) {
        const target = next === "all" ? "collection" : next;
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, "", `#${target}`);
        }
      }
    };

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => applyFilter(button.dataset.filter));
    });

    const initialHash = window.location.hash.replace("#", "").toLowerCase();
    if (validFilters.includes(initialHash) && initialHash !== "all") {
      applyFilter(initialHash, false);
    } else {
      applyFilter("all", false);
    }

    // Keep filters in sync if the visitor uses the browser's back/forward buttons.
    window.addEventListener("hashchange", () => {
      const hash = window.location.hash.replace("#", "").toLowerCase();
      if (hash === "collection" && currentFilter === "all") return;
      if (validFilters.includes(hash)) applyFilter(hash, false);
    });
  }

  /* ---------------------------------------------------------------------
     Product dialog
     --------------------------------------------------------------------- */

  const dialog = $("#product-dialog");

  if (dialog && typeof dialog.showModal === "function") {
    const closeButton = $("[data-dialog-close]", dialog);
    const dialogMedia = $("[data-dialog-media]", dialog);
    const image = $("[data-dialog-image]", dialog);
    const dialogCat = $("[data-dialog-cat]", dialog);
    const dialogTitle = $("[data-dialog-title]", dialog);
    const dialogSubtitle = $("[data-dialog-subtitle]", dialog);
    const dialogDesc = $("[data-dialog-desc]", dialog);
    const dialogIngredients = $("[data-dialog-ingredients]", dialog);
    const dialogPairing = $("[data-dialog-pairing]", dialog);
    const dialogSizes = $("[data-dialog-sizes]", dialog);
    let opener = null;

    const fillDialog = (card) => {
      const data = card.dataset;
      if (dialogMedia) dialogMedia.style.setProperty("--card-bg", data.bg || "var(--paper-deep)");
      if (image) {
        image.src = data.image || "";
        image.alt = `A jar of Agrumea ${(data.subtitle || "").toLowerCase()}`;
      }
      if (dialogCat) dialogCat.textContent = data.cat || "";
      if (dialogTitle) dialogTitle.textContent = data.name || "";
      if (dialogSubtitle) dialogSubtitle.textContent = data.subtitle || "";
      if (dialogDesc) dialogDesc.textContent = data.description || "";
      if (dialogIngredients) dialogIngredients.textContent = data.ingredients || "";
      if (dialogPairing) dialogPairing.textContent = data.pairing || "";
      if (dialogSizes) dialogSizes.textContent = data.sizes || "";
    };

    const openDialog = (card) => {
      opener = doc.activeElement;
      fillDialog(card);
      dialog.showModal();
      doc.body.classList.add("dialog-open");
      window.requestAnimationFrame(() => {
        if (closeButton) closeButton.focus();
      });
    };

    const closeDialog = () => {
      if (dialog.open) dialog.close();
    };

    $$(".product-card--pantry").forEach((card) => {
      const button = $("[data-open-product]", card);
      if (!button) return;
      button.addEventListener("click", () => openDialog(card));
    });

    if (closeButton) closeButton.addEventListener("click", closeDialog);

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog();
    });

    dialog.addEventListener("close", () => {
      doc.body.classList.remove("dialog-open");
      if (opener instanceof HTMLElement) opener.focus({ preventScroll: true });
    });
  }

  /* ---------------------------------------------------------------------
     Copy email address
     --------------------------------------------------------------------- */

  const copyButtons = $$("[data-copy]");

  copyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const text = button.dataset.copy;
      const original = button.innerHTML;

      const fallbackCopy = () => {
        const helper = doc.createElement("textarea");
        helper.value = text;
        helper.setAttribute("readonly", "");
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        doc.body.appendChild(helper);
        helper.select();
        let succeeded = false;
        try {
          succeeded = doc.execCommand("copy");
        } catch (error) {
          succeeded = false;
        }
        helper.remove();
        return succeeded;
      };

      let copied = false;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          copied = true;
        } else {
          copied = fallbackCopy();
        }
      } catch (error) {
        copied = fallbackCopy();
      }

      button.textContent = copied ? "Copied to clipboard" : "Select and copy: " + text;
      window.setTimeout(() => {
        button.innerHTML = original;
      }, 2400);
    });
  });

  /* ---------------------------------------------------------------------
     Contact form (mailto hand-off with inline validation)
     --------------------------------------------------------------------- */

  const contactForm = $("[data-contact-form]");

  if (contactForm) {
    const status = $("[data-form-status]", contactForm);
    const fields = {
      name: $("#name", contactForm),
      email: $("#email", contactForm),
      subject: $("#subject", contactForm),
      message: $("#message", contactForm),
      consent: $("#consent", contactForm),
    };

    const errorFor = (name) => $(`[data-error-for="${name}"]`, contactForm);

    const setError = (name, message) => {
      const field = fields[name];
      const error = errorFor(name);
      if (field) {
        if (message) field.setAttribute("aria-invalid", "true");
        else field.removeAttribute("aria-invalid");
        if (message && error && error.id) {
          const ids = new Set((field.getAttribute("aria-describedby") || "").split(" ").filter(Boolean));
          ids.add(error.id);
          field.setAttribute("aria-describedby", Array.from(ids).join(" "));
        }
      }
      if (error) {
        error.textContent = message || "";
        error.hidden = !message;
      }
    };

    const validate = () => {
      const errors = {};
      const name = fields.name ? fields.name.value.trim() : "";
      const email = fields.email ? fields.email.value.trim() : "";
      const subject = fields.subject ? fields.subject.value : "";
      const message = fields.message ? fields.message.value.trim() : "";
      const consent = fields.consent ? fields.consent.checked : false;

      if (name.length < 2) errors.name = "Please tell us your name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Please enter a valid email address.";
      if (!subject) errors.subject = "Please choose a subject.";
      if (message.length < 10) errors.message = "A little more detail helps us answer well (10 characters minimum).";
      if (!consent) errors.consent = "Please confirm we may reply to your enquiry.";

      Object.keys(fields).forEach((key) => setError(key, errors[key]));
      return errors;
    };

    const query = new URLSearchParams(window.location.search);
    if (query.get("subject") === "visit" && fields.subject) {
      fields.subject.value = "Visit";
    }

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const errors = validate();

      if (Object.keys(errors).length > 0) {
        if (status) {
          status.textContent = "Please check the highlighted fields above.";
          status.hidden = false;
        }
        const firstName = Object.keys(errors)[0];
        if (fields[firstName]) fields[firstName].focus();
        return;
      }

      const name = fields.name.value.trim();
      const email = fields.email.value.trim();
      const subject = fields.subject.value;
      const message = fields.message.value.trim();
      const mailSubject = `[Website] ${subject} — ${name}`;
      const mailBody = [
        `Name: ${name}`,
        `Email: ${email}`,
        `Enquiry: ${subject}`,
        "",
        message,
      ].join("\r\n");

      const mailto =
        "mailto:info@agrumeafarm.it?subject=" +
        encodeURIComponent(mailSubject) +
        "&body=" +
        encodeURIComponent(mailBody);

      if (status) {
        status.innerHTML =
          'Your email app is opening with the message ready to send. If nothing happens, write to <a href="mailto:info@agrumeafarm.it">info@agrumeafarm.it</a> or copy the address above.';
        status.hidden = false;
      }

      window.location.href = mailto;
    });
  }

  /* ---------------------------------------------------------------------
     Small helper: mark internal hash links as handled
     --------------------------------------------------------------------- */

  root.classList.add("is-ready");
})();
