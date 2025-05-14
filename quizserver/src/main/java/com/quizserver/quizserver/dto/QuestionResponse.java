package com.quizserver.quizserver.dto;

import lombok.Data;

@Data

public class QuestionResponse {

    private Long questionId;

    private String selectedOption;
}

