import sgMail from "@sendgrid/mail";
export async function sendEmail(to: string, subject: string, html: string) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
  const msg = {
    to: to,
    from: "ins4n3.owo@gmail.com",
    subject: subject,
    html: html,
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log(`Email sent to ${to} with subject ${subject} successfully.`);
    })
    .catch((error: any) => {
      console.error(error);
    });
}
