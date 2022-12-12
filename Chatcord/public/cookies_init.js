window.addEventListener("load", function(){
    window.cookieconsent.initialise({
      "palette": {
        "popup": {
          "background": "#000"
        },
        "button": {
          "background": "#eee"
        },
      },
      content: {
      header: 'Cookiessss used on the website!',
      message: 'This website uses cookies to save you previous username.',
      dismiss: 'Got it!',
      allow: 'Allow cookies',
      deny: 'Decline',
      close: '&#x274c;',
    }
    })});