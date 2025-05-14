package com.quizserver.quizserver.service.test;

import com.quizserver.quizserver.dto.*;
import com.quizserver.quizserver.entities.Test;

import java.util.List;

public interface TestService {




    TestDTO createTest(TestDTO dto);

    QuestionDTO addQuestionInTest(QuestionDTO dto);

    List<TestDTO> getAllTests();

    TestDetailsDTO getAllQuestionsByTest(Long id);

    public TestResultDTO submitTest(SubmitTestDTO request);

    List<TestResultDTO> getAllTestResults();


}
