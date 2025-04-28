package com.quizserver.quizserver.service.test;


import com.quizserver.quizserver.dto.QuestionDTO;
import com.quizserver.quizserver.dto.TestDTO;
import com.quizserver.quizserver.entities.Question;
import com.quizserver.quizserver.entities.Test;
import com.quizserver.quizserver.repository.QuestionRepository;
import com.quizserver.quizserver.repository.TestRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static java.util.Arrays.stream;

@Service
public class TestServiceImpl implements TestService {
    @Autowired
    private TestRepository testRepository;


    @Autowired
    private QuestionRepository questionRepository;


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
    @Transactional
    public List<TestDTO> getAllTests() {
        return testRepository.findAll().stream().peek(
                test -> test.setTime(test.getQuestions().size() * test.getTime())).collect(Collectors.toList())
    .stream().map(Test::getDto).collect(Collectors.toList());
    } }



