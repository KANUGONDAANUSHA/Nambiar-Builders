export function applyTemplate(templateText, variables = {}) {
  let result = templateText || "";

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    result = result.replace(regex, value ?? "");
  }

  return result;
}

export function defaultBirthdayTemplate(name) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Happy Birthday, ${name}!</h2>
      <p>Wishing you a wonderful day filled with happiness and success.</p>
      <p>Best wishes,<br/>Nambiar Builders Pvt Ltd</p>
    </div>
  `;
}

export function defaultAnniversaryTemplate(name) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Happy Work Anniversary, ${name}!</h2>
      <p>Thank you for your dedication and valuable contribution.</p>
      <p>Best wishes,<br/>Nambiar Builders Pvt Ltd</p>
    </div>
  `;
}

export function defaultEventTemplate(title, description) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>${title}</h2>
      <p>${description || "Warm wishes from Nambiar Builders Pvt Ltd."}</p>
      <p>Regards,<br/>Nambiar Builders Pvt Ltd</p>
    </div>
  `;
}

export function defaultWelcomeTemplate(name) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Welcome, ${name}!</h2>
      <p>We are happy to have you with Nambiar Builders Pvt Ltd.</p>
      <p>Wishing you a successful journey with us.</p>
      <p>Regards,<br/>Nambiar Builders Pvt Ltd</p>
    </div>
  `;
}