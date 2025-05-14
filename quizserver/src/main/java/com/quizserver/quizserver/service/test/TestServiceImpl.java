package com.quizserver.quizserver.service.test;


import com.quizserver.quizserver.dto.*;
import com.quizserver.quizserver.entities.Question;
import com.quizserver.quizserver.entities.Test;
import com.quizserver.quizserver.entities.TestResult;
import com.quizserver.quizserver.entities.User;
import com.quizserver.quizserver.repository.QuestionRepository;
import com.quizserver.quizserver.repository.TestRepository;
import com.quizserver.quizserver.repository.TestResultRepository;
import com.quizserver.quizserver.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
public class TestServiceImpl implements TestService {
    @Autowired
    private TestRepository testRepository;

    @Autowired
    private TestResultRepository testResultRepository;



    @Autowired
    private QuestionRepository questionRepository;



    @Autowired
    private UserRepository userRepository;



    public TestDTO createTest(TestDTO dto){
        Test test = new Test();
        test.setTitle(dto.getTitle());
        test.setDescription(dto.getDescription());
        test.setTime(dto.getTime());
        return testRepository.save(test).getDto();
    }
    public QuestionDTO addQuestionInTest(QuestionDTO dto){
        Optional<Test> optionalTest = testRepository.findById(dto.getId());
        if(optionalTest.isPresent()){
            Question question = new Question();

            question.setTest(optionalTest.get());
            question.setQuestionText(dto.getQuestionText());
            question.setOptionA(dto.getOptionA());
            question.setOptionB(dto.getOptionB());
            question.setOptionC(dto.getOptionC());
            question.setOptionD(dto.getOptionD());
            question.setCorrectOption(dto.getCorrectOption());

            return questionRepository.save(question).getDto();
        }
        throw new EntityNotFoundException("Test Not Found");
    }
//    @Transactional
//    public List<TestDTO> getAllTests() {
//        return testRepository.findAll().stream().peek(
//                test -> test.setTime(test.getQuestions().size() * test.getTime())).collect(Collectors.toList())
//    .stream().map(Test::getDto).collect(Collectors.toList());
//    }

@Transactional
public List<TestDTO> getAllTests() {
    return testRepository.findAll().stream()
            .peek(test -> {
                if (test.getTime() != null) {
                    Long totalTime = test.getTime();
                    test.setTime(totalTime);
                }
            })
            .map(Test::getDto)
            .collect(Collectors.toList());
}

    @Transactional
    public TestDetailsDTO getAllQuestionsByTest(Long id){
        Optional<Test> optionalTest = testRepository.findById(id);
        TestDetailsDTO testDetailsDTO = new TestDetailsDTO();
        if(optionalTest.isPresent()){
            TestDTO testDTO = optionalTest.get().getDto();
            testDTO.setTime(optionalTest.get().getTime() * optionalTest.get().getQuestions().size());

            testDetailsDTO.setTestDTO(testDTO);
            testDetailsDTO.setQuestions(optionalTest.get().getQuestions().stream().map(Question::getDto).toList());
            return testDetailsDTO;
        }
        return testDetailsDTO;
    }
    @Transactional
    public TestResultDTO submitTest(SubmitTestDTO request) {
        Test test = testRepository.findById(request.getTestId()).orElseThrow(() -> new EntityNotFoundException("Test not found"));
        User user = userRepository.findById(request.getUserId()).orElseThrow(() -> new EntityNotFoundException("User not found"));

        int correctAnswers = 0;
        for (QuestionResponse response : request.getResponses()) {
            Question question = questionRepository.findById(response.getQuestionId())
                    .orElseThrow(() -> new EntityNotFoundException("Question not found"));
            if (question.getCorrectOption().equals(response.getSelectedOption())) {
                correctAnswers++;
            }
        }

        int totalQuestions = test.getQuestions().size();
        double percentage = ((double) correctAnswers/totalQuestions)* 100;

        TestResult testResult = new TestResult();
        testResult.setTest(test);
        testResult.setUser(user);
        testResult.setTotalQuestions(totalQuestions);
        testResult.setCorrectAnswers(correctAnswers);
        testResult.setPercentage(percentage);

        return testResultRepository.save(testResult).getDto();
    }

    public List<TestResultDTO> getAllTestResults() {
        return testResultRepository.findAll().stream().map(TestResult::getDto).collect(Collectors.toList());
    }

}



