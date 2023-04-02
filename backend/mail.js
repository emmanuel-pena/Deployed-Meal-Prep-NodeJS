const nodemailer = require('nodemailer');
const {google} = require('googleapis');
const handlebars = require('handlebars');
const fs = require('fs');


exports.sendMail = async (email, subject, emailContent) => {
  const CLIENT_EMAIL = process.env.APP_EMAIL;
  const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
  const CLIENT_ID = process.env.EMAIL_CLIENT_ID;
  const CLIENT_SECRET = process.env.EMAIL_CLIENT_SECRET;
  const REDIRECT_URI = process.env.CLIENT_REDIRECT_URI;
  const REFRESH_TOKEN = process.env.EMAIL_REFRESH_TOKEN;
  const OAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
  );

  OAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

  try {
    // Generate the accessToken on the fly
    const accessToken = await OAuth2Client.getAccessToken();

    // Create the email envelope (transport)
    const transport = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      secure: true,
      auth: {
        user: CLIENT_EMAIL,
        pass: EMAIL_PASSWORD,
      },
      secureConnection: 'false',
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      },
    });
    const mailOptions = {
      from: `Meal Prep Helper <${CLIENT_EMAIL}>`,
      to: email,
      subject: subject,
      html: emailContent,
    };

    await transport.sendMail(mailOptions);
    console.log('email sent');
  } catch (error) {
    console.log(error);
    return error;
  }
};

exports.createEmail = async (token, username, isVerificationEmail) => {
  let filePath = __dirname;
  let subject = `[Email Confirmation - Meal Prep Helper]`;
  let link = 'https://mealprephelper.herokuapp.com';
  if (isVerificationEmail) {
    subject += `- Please confirm your Email account!`;
    filePath += '/data/email_template.html';
    link += `/verify?token=${token}`;
  } else {
    subject += `- Reset your account's password!`;
    filePath += '/data/reset_password_email_template.html';
    link += `/resetpassword?token=${token}`;
  }
  const replacements = {
    link: link,
    username: username,
  };
  const content = await inserValuesIntoEmail(replacements, filePath);
  return {content: content, subject: subject};
};


const inserValuesIntoEmail = async (replacements, filePath) => {
  try {
    const file = await fs.promises.readFile(filePath, {encoding: 'utf-8'});
    const template = handlebars.compile(file);
    const htmlToSend = template(replacements);
    return htmlToSend;
  } catch (err) {
    console.log(err);
  }
};
