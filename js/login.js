function validate(option){
  //option 1 is for login; 2 for register
  var email = $("#inputEmail").val();
  var pass = $("#inputPassword").val();

  if(option == 2) {
    email = $("#registerEmail").val();
    pass = $("#registerPassword").val();
  }
  var emailValid = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  //var passwordValid = new RegExp("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$");
  var passwordValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if(email == '' || pass == ''){
    swal({title: "Please enter both an email and a password!",
          type: "warning",
          confirmButtonColor: "#9E332D",
          confirmButtonText: "OK"
        });
    return false;
  }
  if (!emailValid.test(email)) {
    swal({title:"Enter a valid email!",
          type: "warning",
          confirmButtonColor: "#9E332D",
          confirmButtonText: "OK"
        });
    return false;
  }
  if (!passwordValid.test(pass)) {
    swal({title: "Enter a valid password: minimum 8 characters with at least 1 number!",
          type: "warning",
          confirmButtonColor: "#9E332D",
          confirmButtonText: "OK"
        });
    return false;
  }
  return true;

}

function validateName() {
  var fName = $("#fName").val();
  var lName = $("#lName").val();

  if (fName == "") {
    swal({title: "Enter First Name",
          type: "warning",
          confirmButtonColor: "#9E332D",
          confirmButtonText: "OK"
        });
    return false;
  }

  if (lName == "") {
    swal({title: "Enter Last Name",
          type: "warning",
          confirmButtonColor: "#9E332D",
          confirmButtonText: "OK"
    });
    return false;
  }
  return true;
}

/*Create Cookies for LogIn
 *click functions
 *getCookie()
 *setCookie()
 *checkCookie()
 */
$("#submit").click(function() {
	var keepChecking = validate(1);
	//console.log("out");
	var email = $("#inputEmail").val();
	var password = $("#inputPassword").val();
	var url = "http://private-f462a-appsassins.apiary-mock.com/login";
  if (keepChecking) {
  	$.ajax(url, {
          method: "POST",
          dataType: "json",
          data: {"email": email, "password": password},
          success: function(json) {

            if (json['status']==1) {
              setCookie("fName", json["fName"]);
              setCookie("email", email)
  			      window.location.href='home.html';
            }
            else {
              swal({title: "That username/combo is not in the database",
                    type: "warning",
                    confirmButtonColor: "#9E332D",
                    confirmButtonText: "OK"
                  });
              }
          },
          error: function(json) {
            swal({title: "request failed -- you suck",
                  type: "warning",
                  confirmButtonColor: "#9E332D",
                  confirmButtonText: "OK"
                });
          }
        });
    }

});

$("#registerSubmit").click(function(){
  var keepChecking = validate(2);
  keepChecking = keepChecking && validateName();
  if (keepChecking) {
    var email = $("#registerEmail").val();
  	var password = $("#registerPassword").val();
    var fName = document.getElementById("fName").value;
  	var lName = document.getElementById("lName").value;
	  var url = "http://private-f462a-appsassins.apiary-mock.com/register";

    $.ajax(url,{
      method: "POST",
      dataType: "json",
      data: {"fName": fName, "lName": lName, "email": email, "password": password},
      success: function(json) {
        if (json['status']==1) {
          setCookie("fName", fName);
          setCookie("email", email)
          window.location.href='home.html';
        }
        else
        {
          swal({title: "That username/combo is not in the database",
                type: "warning",
                confirmButtonColor: "#9E332D",
                confirmButtonText: "OK"
              });
        }
      },
      error: function(json) {
        swal({title: "request failed -- you suck",
              type: "warning",
              confirmButtonColor: "#9E332D",
              confirmButtonText: "OK"
            });
      }
    });
  }
});

$("#registerSelect").click(function(){
  if ($("#registerSelect").hasClass("btn-login-inactive")){
    $("#loginSelect").addClass("btn-login-inactive");
    $("#registerSelect").removeClass("btn-login-inactive");
    $("#loginForm").addClass("signin-inactive");
    $("#registerForm").removeClass("signin-inactive");
  }
});
$("#loginSelect").click(function(){
  if ($("#loginSelect").hasClass("btn-login-inactive")){
    $("#registerSelect").addClass("btn-login-inactive");
    $("#loginSelect").removeClass("btn-login-inactive");
    $("#registerForm").addClass("signin-inactive");
    $("#loginForm").removeClass("signin-inactive");
  }
});
