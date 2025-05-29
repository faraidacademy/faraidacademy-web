// src/lib/joinCompetition.js
// Shared logic for joining the competition
export async function joinCompetition({ button, dialog = null, redirect = null }) {
  if (!button) return;
  button.disabled = true;
  try {
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_participant: true }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      alert(errorData.error || "Failed to join competition");
      button.disabled = false;
      return;
    }
    if (dialog && typeof dialog.close === "function") {
      dialog.close();
    }
    if (redirect) {
      window.location.href = redirect;
    } else {
      // Default: reload current page (replace history)
      if (typeof window.navigate === "function") {
        window.navigate(window.location.pathname, { history: "replace" });
      } else {
        window.location.reload();
      }
    }
  } catch (err) {
    alert("An unexpected error occurred.");
    button.disabled = false;
  }
}
