package com.quizserver.quizserver.controller;

import com.quizserver.quizserver.entities.User;
import com.quizserver.quizserver.enums.UserRole;
import com.quizserver.quizserver.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/sign-up")
    public ResponseEntity<?> signupUser(@RequestBody User user) {

        if (userService.hasUserWithEmail(user.getEmail())) {
            HttpStatusCode body;
            return new ResponseEntity<>(  "User already exists", HttpStatus.NOT_ACCEPTABLE );
        }

        User createdUser = userService.createUser(user);
        if (createdUser == null) {
            return new ResponseEntity<>(  "User not created, come again Later", HttpStatus.NOT_ACCEPTABLE );
        }

        return new ResponseEntity<>(createdUser, HttpStatus.OK );

    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        User dbUser = userService.login(user);

        if (dbUser == null) {
            return new ResponseEntity<>("Wrong Conditionals", HttpStatus.NOT_ACCEPTABLE);
        }
        return new ResponseEntity<>(dbUser, HttpStatus.OK);
    }

}
