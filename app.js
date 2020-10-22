window.addEventListener('load', function() {

  var content = document.querySelector('.content');
  var loadingSpinner = document.getElementById('loading');
  content.style.display = 'block';
  loadingSpinner.style.display = 'none';

  var userProfile;
  var apiUrl = 'https://tehjohnest.herokuapp.com/pizza-api';

  // Here's where you'll add your user information from Auth0 
  var webAuth = new auth0.WebAuth({
    domain: 'dev-c0alqlqt.us.auth0.com',
    clientID: 'RJ0joZDCYwvoWy1QRBgqAPw352Kuc2r5',
    redirectUri: AUTH0_CALLBACK_URL,
    responseType: 'token id_token',
    //Specifying 
    scope: 'openid profile gender email email_verified'
  });

  // look for email verified in the authResult, figure out the way to isolate it
  // console.log(email_verified)

  // console log the test API

  // Call Google places API


  var homeView = document.getElementById('home-view');
  var profileView = document.getElementById('profile-view');
  var pingView = document.getElementById('ping-view');

  // buttons and event listeners
  var loginBtn = document.getElementById('qsLoginBtn');
  var logoutBtn = document.getElementById('qsLogoutBtn');

  var homeViewBtn = document.getElementById('btn-home-view');
  var profileViewBtn = document.getElementById('btn-profile-view');
  var pingViewBtn = document.getElementById('btn-ping-view');

  var pingPublic = document.getElementById('btn-ping-public');
  var pingPrivate = document.getElementById('btn-ping-private');

  var callPrivateMessage = document.getElementById('call-private-message');
  var pingMessage = document.getElementById('ping-message');

    // Public API call
  // pingPublic.addEventListener('click', function() {
  //   callAPI('/public', false);
  // });

  
  pingPrivate.addEventListener('click', function() {
    callAPI('/private', true);
  });

 // Event listeners for Log, Logout, profile and order pizza buttons 
  loginBtn.addEventListener('click', login);
  logoutBtn.addEventListener('click', logout);

  homeViewBtn.addEventListener('click', function() {
    homeView.style.display = 'inline-block';
    profileView.style.display = 'none';
    pingView.style.display = 'none';
  });

  profileViewBtn.addEventListener('click', function() {
    homeView.style.display = 'none';
    pingView.style.display = 'none';
    profileView.style.display = 'inline-block';
    getProfile();
  });

  pingViewBtn.addEventListener('click', function() {
    homeView.style.display = 'none';
    profileView.style.display = 'none';
    pingView.style.display = 'inline-block';
  });
// Auth0 login functionality and access time tokens
  function login() {
    webAuth.authorize();
  }

  function setSession(authResult) {
    // Set the time that the access token will expire at
    var expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
    
  }
  /// Email Verification Rule 
  // Wasn't sure where to invoke this 
function emailVerification (user, context, callback) {
  if (!user.email_verified) {
    return callback(new UnauthorizedError('Please verify your email before logging in.'));
  } else {
    return callback(null, user, context);
  }
}

  function logout() {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    pingMessage.style.display = 'none';
    displayButtons();
  }

  function isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    var expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

  function displayButtons() {
    var loginStatus = document.querySelector('.container h4');
    if (isAuthenticated()) {
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'inline-block';
      profileViewBtn.style.display = 'inline-block';
      pingViewBtn.style.display = 'inline-block';
      pingPrivate.style.display = 'inline-block';
      callPrivateMessage.style.display = 'none';
      loginStatus.innerHTML = 'You are logged in! You can now order pizza.';
    } else {
      homeView.style.display = 'inline-block';
      loginBtn.style.display = 'inline-block';
      logoutBtn.style.display = 'none';
      profileViewBtn.style.display = 'none';
      profileView.style.display = 'none';
      pingView.style.display = 'none';
      pingViewBtn.style.display = 'none';
      pingPrivate.style.display = 'none';
      callPrivateMessage.style.display = 'block';
      loginStatus.innerHTML = 'You are not logged in. Please log in to order our delicioso pizza!';
    }
  }
// User Profile Functionality 
  function getProfile() {
    if (!userProfile) {
      var accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        console.log('Access token must exist to fetch profile');
      }

      webAuth.client.userInfo(accessToken, function(err, profile) {
        if (profile) {
          userProfile = profile;
          displayProfile();
          
        }
      });
    } else {
      displayProfile();
    }
  }

  function displayProfile() {
    // display the profile
    document.querySelector(
      '#profile-view .nickname'
    ).innerHTML = userProfile.nickname;
    document.querySelector(
      '#profile-view .full-profile'
    ).innerHTML = JSON.stringify(userProfile, null, 2);
    document.querySelector('#profile-view img').src = userProfile.picture;
  }


// Handling Authentication & Email Verification 
  function handleAuthentication() {
    webAuth.parseHash(function(err, authResult) {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        setSession(authResult);
        // emailVerification(authResult);
        console.log(authResult.idTokenPayload);
        // emailVerification(authResult.idTokenPayload.email);
        loginBtn.style.display = 'none';
        homeView.style.display = 'inline-block';
      } else if (err) {
        homeView.style.display = 'inline-block';
        console.log(err);
        alert(
          'Error: ' + err.error + '. Check the console for further details.'
        );
      }
      displayButtons();
    });
  }

  handleAuthentication();
 
// Order Pizza API
  function callAPI(endpoint, secured) {
    var url = apiUrl + endpoint;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://jsonplaceholder.typicode.com/todos/1');
    if (secured) {
      xhr.setRequestHeader(
        'Authorization',
        'Bearer ' + localStorage.getItem('access_token')
      );
      console.log(localStorage.getItem('access_token', "Pizza API Call"));
    }
    xhr.onload = function() {
      if (xhr.status == 200) {
        alert("Pizza 42 has recieved your request to order a pizza!");
        // update message
        // need to write that if a user is authorized and email is 
        //verified then they can order pizza
        document.querySelector('#ping-view h2').innerHTML = JSON.parse(
          xhr.responseText
        ).message;
      } else {
        alert('Request failed: ' + xhr.statusText);
      }
    };
    xhr.send();
  }

  displayButtons();
});

