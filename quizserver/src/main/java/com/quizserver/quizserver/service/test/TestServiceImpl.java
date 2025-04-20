package com.quizserver.quizserver.service.test;


import com.quizserver.quizserver.dto.TestDTO;
import com.quizserver.quizserver.entities.Test;
import com.quizserver.quizserver.repository.TestRepository;
import org.springframework.stereotype.Service;

@Service
public class TestServiceImpl implements TestService {

    private final TestRepository testRepository;

    public TestServiceImpl(TestRepository testRepository) {
        this.testRepository = testRepository;
    }

    public TestDTO createTest(TestDTO dto){
        Test test = new Test();
        test.setTitle(dto.getTitle());
        test.setDescription(dto.getDescription());
        test.setTime(dto.getTime());
        return testRepository.save(test).getDto();
    }

}
