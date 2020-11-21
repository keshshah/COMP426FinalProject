//get data

//listen for auth status changes and also populate the local db
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('logged in: ', user);
    } else {
        console.log('user logged out');
    }
});

//signup
const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', (e) => {
    console.log("submitting");
    e.preventDefault();

    const email = signupForm['signup-email'].value;
    const password = signupForm['signup-password'].value;


    auth.createUserWithEmailAndPassword(email, password).then(cred => {
        console.log(cred.user);
        $("#modal-signup .close").click();
        signupForm.reset();
    }).catch((error)=>{
        alert(error);
    });

});

//logout 
const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut();
});

//login
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm['login-email'].value;
    const password = loginForm['login-password'].value;

    auth.signInWithEmailAndPassword(email, password).then(cred => {
        $("#modal-login .close").click();
        loginForm.reset();
        // console.log(cred);
    }).catch((error) => {
        alert(error.message);
    });
});