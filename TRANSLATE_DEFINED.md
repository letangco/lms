### 1. For email:
 - Create templates for all languages support
 - When call the function send mail, let pass the language code too
 ````javascript
try {
  await sendEmail({
      from: {
        name: SENDER_NAME,
        email: SENDER_EMAIL,
      },
      to: user.email,  
      template: 'forgotPassword',  
      data: {
        name: 'ABC',
      },  
    },
    'en',
  );
} catch (error) {
  logger.error('User forgotPassword sendEmail error:', error);
  return Promise.reject(new APIError(500, 'Internal server error'));
}
````
### 2. For express validation (status code 422):
 - In the validator file, if have the params, let define the message is an array contains 2 items:
 ````javascript
  body('password').isLength({ min: USER_MIN_PASSWORD_LENGTH }).withMessage([
    'Password must be at least %s chars long',
    [USER_MIN_PASSWORD_LENGTH]
  ])
 ````
 The first item is the message template, the second item is the value pass to the params in the template
 
 ### 3. Define language in locales:
  Open the locales file and define your text