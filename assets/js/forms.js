/* On the Dot: waitlist + contact forms (TASK-004).

   ===== THE ONE CEO STEP =====
   Paste the Web3Forms access key between the quotes below, commit, push.
   The key is made for public web pages. It only lets people SEND to our
   inbox; it can't read anything. Submissions go to the email the key was
   created with (ItsFridaySantos@gmail.com, per the CEO, Nov 22).

   While the key is empty, the forms stay hidden and visitors see the
   email link instead, so the live site never shows a form that can't send.
   To preview the forms (disabled) before the key exists, add
   ?preview-forms to the page address.
*/
const FORM_ACCESS_KEY = "";
const FORM_ENDPOINT = "https://api.web3forms.com/submit";
const FALLBACK_EMAIL = "ItsFridaySantos@gmail.com";

(function () {
  const forms = document.querySelectorAll("form[data-otd-form]");
  const live = FORM_ACCESS_KEY.trim() !== "";
  const preview = /[?&]preview-forms\b/.test(location.search);

  forms.forEach(function (form) {
    const status = form.querySelector(".form-status");
    const button = form.querySelector('button[type="submit"]');
    const fallback = document.getElementById(form.dataset.fallback);

    if (!live && !preview) return;            // stay hidden; the email fallback shows
    form.hidden = false;
    if (fallback) fallback.hidden = true;

    if (!live) {                              // preview mode: look, don't send
      button.disabled = true;
      status.textContent = "Preview: this form switches on once its access key is added.";
      return;
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = Object.fromEntries(new FormData(form));
      if (data.botcheck) return;              // honeypot ticked: a bot, drop silently
      delete data.botcheck;
      data.access_key = FORM_ACCESS_KEY;
      data.subject = "On the Dot website: " + (data.topic || "Message");
      data.from_name = "On the Dot website";

      button.disabled = true;
      status.classList.remove("is-error");
      status.textContent = "Sending…";
      try {
        const response = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data)
        });
        const result = await response.json().catch(function () { return {}; });
        if (!response.ok || !result.success) throw new Error("not sent");
        form.reset();
        status.textContent = form.dataset.success || "Thanks! It's on its way to us.";
      } catch (err) {
        status.classList.add("is-error");
        status.innerHTML = 'That didn’t go through. Please email us instead: <a href="mailto:' +
          FALLBACK_EMAIL + '">' + FALLBACK_EMAIL + "</a>";
        button.disabled = false;
      }
    });
  });
})();
