exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    // './scenarios/*.js'
    // './scenarios/home.js',
    // './scenarios/auth.js',
    './scenarios/todos.js',
  ],

  capabilities: {
    'browserName': 'chrome'
  },

  baseUrl: 'http://blue-pomodoros.appspot.com',

  seleniumAddress:'http://127.0.0.1:4444/wd/hub',

  framework: 'jasmine',

  plugins: [{
   chromeA11YDevTools: true,
   path: '../node_modules/protractor/plugins/accessibility/index.js'
  }],

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
