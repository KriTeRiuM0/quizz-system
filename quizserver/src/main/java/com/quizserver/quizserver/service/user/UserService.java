package com.quizserver.quizserver.service.user;

import com.quizserver.quizserver.entities.User;

public interface UserService {

    User createUser(User user);

    Boolean hasUserWithEmail(String email);
    User login(User user);
}
