package com.quizserver.quizserver.service.user;



import com.quizserver.quizserver.entities.User;
import com.quizserver.quizserver.enums.UserRole;
import com.quizserver.quizserver.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class UserServiceimpl implements UserService {

}
    @Autowired
    private UserRepository userRepository;

    @PostConstruct
    private void createAdminUser() {
        User optionalUser = userRepository.findByRole((UserRole.ADMIN);
        if (optionalUser == null) {
            User user = new User();

            user.setName("Admin");
            user.setEmail("admin@gmail.com");
            user.setRole(UserRole.ADMIN);
            user.setPassword("admin");

            userRepository.save(user);
        }
    }

    public Boolean hasUserWithEmail(String email) {
        return userRepository.findFirstByEmail(email) != null;
    }